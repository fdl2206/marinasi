<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderDocument;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderWorkflowService
{
    /**
     * @param  array{
     *   target_status: string,
     *   note?: ?string,
     *   spk_number?: ?string,
     *   delivery_method?: ?string,
     *   courier_name?: ?string,
     *   tracking_number?: ?string
     * }  $payload
     */
    public function advanceStatus(Order $order, User $seller, array $payload): Order
    {
        return DB::transaction(function () use ($order, $seller, $payload): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with('items')
                ->lockForUpdate()
                ->firstOrFail();

            $targetStatus = $payload['target_status'];

            if (! $lockedOrder->canAdvanceTo($targetStatus)) {
                $expected = $lockedOrder->nextStatus();
                $message = $expected
                    ? sprintf(
                        'Transisi status tidak valid. Pesanan pada tahap %s hanya boleh maju 1 tahap ke %s.',
                        $lockedOrder->statusLabel(),
                        Order::STATUS_LABELS[$expected],
                    )
                    : sprintf('Pesanan dengan status %s sudah final dan tidak dapat dilanjutkan.', $lockedOrder->statusLabel());

                throw ValidationException::withMessages([
                    'target_status' => $message,
                ]);
            }

            $deliveryMethod = isset($payload['delivery_method']) && in_array($payload['delivery_method'], [Order::DELIVERY_EXPEDITION, Order::DELIVERY_INTERNAL], true)
                ? $payload['delivery_method']
                : ($lockedOrder->delivery_method ?: Order::DELIVERY_EXPEDITION);

            $courierName = isset($payload['courier_name']) ? trim((string) $payload['courier_name']) : null;
            $trackingNumber = isset($payload['tracking_number']) ? trim((string) $payload['tracking_number']) : null;

            if (
                $targetStatus === Order::STATUS_SHIPPING
                && $deliveryMethod === Order::DELIVERY_EXPEDITION
                && $lockedOrder->hasGoodsItems()
                && ($trackingNumber === null || $trackingNumber === '')
            ) {
                throw ValidationException::withMessages([
                    'tracking_number' => 'Nomor resi pengiriman wajib diisi saat pengiriman barang via Ekspedisi. Pilih "Antar Langsung" jika dikirim oleh armada internal Bandung.',
                ]);
            }

            $fromStatus = $lockedOrder->status;
            $updates = [
                'status' => $targetStatus,
            ];

            if (array_key_exists('spk_number', $payload) && trim((string) $payload['spk_number']) !== '') {
                $updates['spk_number'] = trim((string) $payload['spk_number']);
            }

            if ($targetStatus === Order::STATUS_SHIPPING) {
                $updates['delivery_method'] = $deliveryMethod;
                if ($deliveryMethod === Order::DELIVERY_INTERNAL) {
                    $updates['courier_name'] = ($courierName !== null && $courierName !== '')
                        ? $courierName
                        : 'Armada Internal CV. Putra Nugraha (Antar Langsung Bandung)';
                    $updates['tracking_number'] = ($trackingNumber !== null && $trackingNumber !== '')
                        ? $trackingNumber
                        : null;
                } else {
                    $updates['courier_name'] = ($courierName !== null && $courierName !== '')
                        ? $courierName
                        : $lockedOrder->courier_name;
                    $updates['tracking_number'] = ($trackingNumber !== null && $trackingNumber !== '')
                        ? $trackingNumber
                        : $lockedOrder->tracking_number;
                }
                $updates['shipped_at'] = now();
            }

            if ($targetStatus === Order::STATUS_HANDOVER) {
                $updates['completed_at'] = now();
            }

            $lockedOrder->update($updates);

            $noteParts = [];
            if (! empty($payload['note']) && trim((string) $payload['note']) !== '') {
                $noteParts[] = trim((string) $payload['note']);
            }
            if ($targetStatus === Order::STATUS_SHIPPING) {
                if ($deliveryMethod === Order::DELIVERY_INTERNAL) {
                    $noteParts[] = 'Antar Langsung (Armada Internal Bandung)'.($trackingNumber ? " • Ref: {$trackingNumber}" : '');
                } elseif ($trackingNumber) {
                    $noteParts[] = 'Resi: '.$trackingNumber.($courierName ? " ({$courierName})" : '');
                }
            }

            OrderStatusHistory::query()->create([
                'order_id' => $lockedOrder->id,
                'from_status' => $fromStatus,
                'to_status' => $targetStatus,
                'changed_by' => $seller->id,
                'note' => $noteParts !== [] ? implode(' | ', $noteParts) : 'Status dilanjutkan ke '.Order::STATUS_LABELS[$targetStatus].'.',
            ]);

            return $lockedOrder->fresh(['items', 'statusHistories.changedByUser', 'payments', 'documents', 'user']);
        });
    }

    public function cancel(Order $order, User $actor, string $reason): Order
    {
        return DB::transaction(function () use ($order, $actor, $reason): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with(['items', 'payments'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedOrder->canBeCancelled()) {
                throw ValidationException::withMessages([
                    'status' => 'Pesanan tidak dapat dibatalkan karena sudah memasuki tahap Penyiapan Unit atau sudah selesai/dibatalkan.',
                ]);
            }

            if (! $actor->is_seller && $lockedOrder->hasVerifiedPayment()) {
                throw ValidationException::withMessages([
                    'status' => 'Pesanan dengan pembayaran DP yang sudah diverifikasi tidak dapat dibatalkan sepihak oleh buyer. Silakan hubungi admin via WhatsApp untuk koordinasi pembatalan.',
                ]);
            }

            $fromStatus = $lockedOrder->status;

            // Tolak otomatis pembayaran yang masih pending saat pesanan dibatalkan
            $lockedOrder->payments()
                ->where('status', OrderPayment::STATUS_PENDING)
                ->update([
                    'status' => OrderPayment::STATUS_REJECTED,
                    'verified_by' => $actor->id,
                    'verified_at' => now(),
                    'rejection_reason' => 'Dibatalkan otomatis karena pesanan dibatalkan.',
                ]);

            $deductedItems = $lockedOrder->items->filter(
                fn (OrderItem $item): bool => $item->stock_deducted && $item->product_id !== null
            );

            if ($deductedItems->isNotEmpty()) {
                $products = Product::query()
                    ->whereIn('id', $deductedItems->pluck('product_id')->unique()->all())
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($deductedItems as $item) {
                    $product = $products->get($item->product_id);
                    if ($product && $product->type === 'goods' && $product->stock_quantity !== null) {
                        $product->update([
                            'stock_quantity' => (float) $product->stock_quantity + $item->quantity,
                        ]);
                    }
                }
            }

            $cleanReason = trim($reason);

            $lockedOrder->update([
                'status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancelled_by' => $actor->id,
                'cancellation_reason' => $cleanReason,
            ]);

            OrderStatusHistory::query()->create([
                'order_id' => $lockedOrder->id,
                'from_status' => $fromStatus,
                'to_status' => Order::STATUS_CANCELLED,
                'changed_by' => $actor->id,
                'note' => 'Pesanan dibatalkan: '.$cleanReason,
            ]);

            return $lockedOrder->fresh(['items', 'statusHistories.changedByUser', 'payments', 'documents', 'user']);
        });
    }

    /** @return array<string, mixed> */
    public function serializeOrder(Order $order, bool $forSeller = false): array
    {
        $order->loadMissing([
            'items',
            'statusHistories.changedByUser',
            'payments.submittedByUser',
            'payments.verifiedByUser',
            'documents.issuedByUser',
            'user',
        ]);
        $stageIndex = $order->stageIndex();
        $nextStatus = $order->nextStatus();

        $stages = collect(Order::STAGES)->values()->map(function (string $stageKey, int $idx) use ($order, $stageIndex): array {
            $stepNumber = $idx + 1;
            $isCancelled = $order->status === Order::STATUS_CANCELLED;
            $isCompleted = ! $isCancelled && $stepNumber < $stageIndex;
            $isCurrent = ! $isCancelled && $stepNumber === $stageIndex;

            return [
                'key' => $stageKey,
                'step' => $stepNumber,
                'label' => Order::STATUS_LABELS[$stageKey],
                'is_completed' => $isCompleted || (! $isCancelled && $order->status === Order::STATUS_HANDOVER),
                'is_current' => $isCurrent,
            ];
        })->all();

        $verifiedPaid = $order->verifiedPaidAmount();
        $remaining = $order->remainingAmount();

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'source' => $order->source,
            'source_label' => $order->source === Order::SOURCE_RFQ ? 'Kesepakatan RFQ' : 'Direct Checkout',
            'status' => $order->status,
            'status_label' => $order->statusLabel(),
            'stage_index' => $stageIndex,
            'next_status' => $nextStatus,
            'next_status_label' => $nextStatus ? Order::STATUS_LABELS[$nextStatus] : null,
            'can_cancel' => $forSeller ? $order->canBeCancelled() : $order->canBuyerCancel(),
            'can_upload_payment' => $order->canBuyerUploadPayment(),
            'can_record_payment' => $order->canSellerRecordPayment(),
            'has_purchase_receipt' => $order->hasPurchaseReceipt(),
            'has_goods_items' => $order->hasGoodsItems(),
            'stages' => $stages,
            'buyer' => [
                'id' => $order->user_id,
                'name' => $order->buyer_name,
                'email' => $order->buyer_email,
                'phone' => $order->buyer_phone,
                'company_name' => $order->company_name,
            ],
            'shipping_address' => $order->shipping_address,
            'shipping_notes' => $order->shipping_notes,
            'pr_reference' => $order->pr_reference,
            'npwp_number' => $order->npwp_number,
            'spk_number' => $order->spk_number,
            'subtotal' => (float) $order->subtotal,
            'dpp_amount' => (float) $order->dpp_amount,
            'ppn_amount' => (float) $order->ppn_amount,
            'total_amount' => (float) $order->total_amount,
            'verified_paid_amount' => $verifiedPaid,
            'remaining_amount' => $remaining,
            'is_paid_in_full' => $order->isPaidInFull(),
            'payment_status' => $order->paymentStatus(),
            'payment_status_label' => $order->paymentStatusLabel(),
            'can_issue_invoice' => $order->canIssueInvoice(),
            'can_issue_purchase_receipt' => $order->canIssuePurchaseReceipt(),
            'delivery_method' => $order->delivery_method ?: Order::DELIVERY_EXPEDITION,
            'delivery_method_label' => $order->deliveryMethodLabel(),
            'courier_name' => $order->courier_name,
            'tracking_number' => $order->tracking_number,
            'shipped_at' => $order->shipped_at?->toIso8601String(),
            'completed_at' => $order->completed_at?->toIso8601String(),
            'cancelled_at' => $order->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $order->cancellation_reason,
            'created_at' => $order->created_at?->toIso8601String(),
            'created_at_formatted' => $order->created_at?->translatedFormat('d M Y, H:i'),
            'whatsapp_url' => $order->whatsappConfirmationUrl(),
            'items' => $order->items->map(fn (OrderItem $item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'product_type' => $item->product_type,
                'unit' => $item->unit,
                'unit_price' => (float) $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => (float) $item->line_total,
            ])->all(),
            'payments' => $order->payments->map(fn (OrderPayment $payment): array => [
                'id' => $payment->id,
                'payment_type' => $payment->payment_type,
                'payment_type_label' => $payment->typeLabel(),
                'amount' => (float) $payment->amount,
                'payment_method' => $payment->payment_method,
                'payment_reference' => $payment->payment_reference,
                'paid_at' => $payment->paid_at?->toDateString(),
                'paid_at_formatted' => $payment->paid_at?->translatedFormat('d M Y'),
                'status' => $payment->status,
                'status_label' => $payment->statusLabel(),
                'notes' => $payment->notes,
                'rejection_reason' => $payment->rejection_reason,
                'submitted_by_name' => $payment->submittedByUser?->name ?? 'Sistem',
                'verified_by_name' => $payment->verifiedByUser?->name,
                'verified_at_formatted' => $payment->verified_at?->translatedFormat('d M Y, H:i'),
                'proof' => $payment->proof_path ? [
                    'name' => $payment->proof_original_name,
                    'download_url' => $forSeller
                        ? route('seller.payments.proof', $payment)
                        : route('buyer.payments.proof', $payment),
                ] : null,
            ])->all(),
            'documents' => $order->documents->map(fn (OrderDocument $doc): array => [
                'id' => $doc->id,
                'type' => $doc->type,
                'type_label' => $doc->typeLabel(),
                'document_number' => $doc->document_number,
                'tax_period' => $doc->tax_period,
                'dpp_amount' => (float) $doc->dpp_amount,
                'ppn_amount' => (float) $doc->ppn_amount,
                'total_amount' => (float) $doc->total_amount,
                'notes' => $doc->notes,
                'is_generated' => $doc->isGeneratedDocument(),
                'original_name' => $doc->original_name,
                'issued_at_formatted' => $doc->issued_at?->translatedFormat('d M Y, H:i'),
                'download_url' => $forSeller
                    ? route('seller.documents.download', $doc)
                    : route('buyer.documents.download', $doc),
                'print_url' => $doc->isGeneratedDocument()
                    ? ($forSeller ? route('seller.documents.print', $doc) : route('buyer.documents.print', $doc))
                    : null,
            ])->all(),
            'status_histories' => $order->statusHistories->map(fn (OrderStatusHistory $history): array => [
                'id' => $history->id,
                'from_status' => $history->from_status,
                'from_status_label' => $history->from_status ? (Order::STATUS_LABELS[$history->from_status] ?? $history->from_status) : null,
                'to_status' => $history->to_status,
                'to_status_label' => Order::STATUS_LABELS[$history->to_status] ?? $history->to_status,
                'changed_by_name' => $history->changedByUser?->name ?? 'Sistem',
                'note' => $history->note,
                'created_at' => $history->created_at?->toIso8601String(),
                'created_at_formatted' => $history->created_at?->translatedFormat('d M Y, H:i'),
            ])->all(),
        ];
    }
}
