<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderWorkflowService
{
    /**
     * @param  array{target_status: string, note?: ?string, spk_number?: ?string, courier_name?: ?string, tracking_number?: ?string}  $payload
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

            $courierName = isset($payload['courier_name']) ? trim((string) $payload['courier_name']) : null;
            $trackingNumber = isset($payload['tracking_number']) ? trim((string) $payload['tracking_number']) : null;

            if ($targetStatus === Order::STATUS_SHIPPING && $lockedOrder->hasGoodsItems() && ($trackingNumber === null || $trackingNumber === '')) {
                throw ValidationException::withMessages([
                    'tracking_number' => 'Nomor resi pengiriman wajib diisi saat pesanan barang memasuki tahap Pengiriman.',
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
                $updates['courier_name'] = $courierName !== '' ? $courierName : $lockedOrder->courier_name;
                $updates['tracking_number'] = $trackingNumber !== '' ? $trackingNumber : $lockedOrder->tracking_number;
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
            if ($targetStatus === Order::STATUS_SHIPPING && $trackingNumber) {
                $noteParts[] = 'Resi: '.$trackingNumber.($courierName ? " ({$courierName})" : '');
            }

            OrderStatusHistory::query()->create([
                'order_id' => $lockedOrder->id,
                'from_status' => $fromStatus,
                'to_status' => $targetStatus,
                'changed_by' => $seller->id,
                'note' => $noteParts !== [] ? implode(' | ', $noteParts) : 'Status dilanjutkan ke '.Order::STATUS_LABELS[$targetStatus].'.',
            ]);

            return $lockedOrder->fresh(['items', 'statusHistories.changedByUser', 'user']);
        });
    }

    public function cancel(Order $order, User $actor, string $reason): Order
    {
        return DB::transaction(function () use ($order, $actor, $reason): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with('items')
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedOrder->canBeCancelled()) {
                throw ValidationException::withMessages([
                    'status' => 'Pesanan tidak dapat dibatalkan karena sudah memasuki tahap Penyiapan Unit atau sudah selesai/dibatalkan.',
                ]);
            }

            $fromStatus = $lockedOrder->status;

            // Kembalikan stok barang yang sebelumnya dikurangi saat checkout
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

            return $lockedOrder->fresh(['items', 'statusHistories.changedByUser', 'user']);
        });
    }

    /** @return array<string, mixed> */
    public function serializeOrder(Order $order): array
    {
        $order->loadMissing(['items', 'statusHistories.changedByUser', 'user']);
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
            'can_cancel' => $order->canBeCancelled(),
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
