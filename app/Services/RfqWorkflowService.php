<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Rfq;
use App\Models\RfqItem;
use App\Models\RfqResponse;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RfqWorkflowService
{
    /**
     * @param  array{
     *   valid_days: int,
     *   payment_terms_note?: ?string,
     *   seller_notes?: ?string,
     *   items: list<array{id: int, quoted_quantity: int, quoted_unit_price: numeric}>
     * }  $payload
     */
    public function submitQuote(Rfq $rfq, User $seller, array $payload): Rfq
    {
        return DB::transaction(function () use ($rfq, $seller, $payload): Rfq {
            /** @var Rfq $lockedRfq */
            $lockedRfq = Rfq::query()
                ->whereKey($rfq->id)
                ->with('items')
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedRfq->canBeQuoted()) {
                throw ValidationException::withMessages([
                    'status' => $lockedRfq->isLocked()
                        ? 'RFQ ini sudah disepakati dan harga/jumlahnya terkunci permanen. Perubahan memerlukan pengajuan RFQ baru.'
                        : "RFQ dengan status {$lockedRfq->statusLabel()} tidak dapat diberikan penawaran lagi.",
                ]);
            }

            $submittedById = collect($payload['items'])->keyBy(fn (array $item): int => (int) $item['id']);

            if ($submittedById->count() !== $lockedRfq->items->count()) {
                throw ValidationException::withMessages([
                    'items' => 'Semua item pada RFQ harus diberikan harga dan jumlah penawaran.',
                ]);
            }

            $quotedTotal = 0.0;

            foreach ($lockedRfq->items as $item) {
                $row = $submittedById->get($item->id);
                if (! $row) {
                    throw ValidationException::withMessages([
                        'items' => 'Data item RFQ tidak cocok. Muat ulang halaman lalu coba lagi.',
                    ]);
                }

                $qty = (int) $row['quoted_quantity'];
                $unitPrice = round((float) $row['quoted_unit_price'], 2);
                $lineTotal = round($unitPrice * $qty, 2);
                $quotedTotal = round($quotedTotal + $lineTotal, 2);

                $item->update([
                    'quoted_quantity' => $qty,
                    'quoted_unit_price' => $unitPrice,
                    'quoted_line_total' => $lineTotal,
                ]);
            }

            $validDays = (int) $payload['valid_days'];
            $quotedDpp = round($quotedTotal / 1.11, 2);
            $quotedPpn = round($quotedTotal - $quotedDpp, 2);
            $sphNumber = $lockedRfq->sph_number ?: Rfq::generateSphNumber();

            $sellerNotes = isset($payload['seller_notes']) && trim((string) $payload['seller_notes']) !== ''
                ? trim((string) $payload['seller_notes'])
                : null;
            $paymentTerms = isset($payload['payment_terms_note']) && trim((string) $payload['payment_terms_note']) !== ''
                ? trim((string) $payload['payment_terms_note'])
                : $lockedRfq->payment_terms_note;

            $lockedRfq->update([
                'sph_number' => $sphNumber,
                'status' => Rfq::STATUS_QUOTED,
                'quoted_total' => $quotedTotal,
                'quoted_dpp' => $quotedDpp,
                'quoted_ppn' => $quotedPpn,
                'valid_days' => $validDays,
                'valid_until' => now()->addDays($validDays)->toDateString(),
                'payment_terms_note' => $paymentTerms,
                'seller_notes' => $sellerNotes,
                'quoted_by' => $seller->id,
                'quoted_at' => now(),
            ]);

            RfqResponse::query()->create([
                'rfq_id' => $lockedRfq->id,
                'user_id' => $seller->id,
                'actor_role' => 'seller',
                'action' => 'quoted',
                'message' => $sellerNotes ?: "Penawaran SPH {$sphNumber} diterbitkan (berlaku {$validDays} hari).",
                'quoted_total' => $quotedTotal,
            ]);

            return $lockedRfq->fresh(['items', 'responses.user', 'order', 'user']);
        });
    }

    public function agreeAndConvertToOrder(Rfq $rfq, User $buyer): Order
    {
        return DB::transaction(function () use ($rfq, $buyer): Order {
            /** @var Rfq $lockedRfq */
            $lockedRfq = Rfq::query()
                ->whereKey($rfq->id)
                ->with('items')
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedRfq->canBeAgreedByBuyer()) {
                throw ValidationException::withMessages([
                    'status' => $lockedRfq->isLocked()
                        ? 'RFQ ini sudah disepakati sebelumnya dan harga/jumlahnya sudah terkunci.'
                        : 'RFQ belum memiliki penawaran resmi (SPH) dari admin sehingga belum dapat disetujui.',
                ]);
            }

            $subtotal = 0.0;
            $preparedOrderItems = [];

            foreach ($lockedRfq->items as $item) {
                if ($item->quoted_unit_price === null || $item->quoted_quantity === null || $item->quoted_quantity < 1) {
                    throw ValidationException::withMessages([
                        'status' => 'Penawaran harga item belum lengkap. Hubungi admin untuk melengkapi SPH.',
                    ]);
                }

                $unitPrice = (float) $item->quoted_unit_price;
                $qty = (int) $item->quoted_quantity;
                $lineTotal = round($unitPrice * $qty, 2);
                $subtotal = round($subtotal + $lineTotal, 2);

                // Catatan aturan bisnis: menyetujui RFQ tidak otomatis menambah stok gudang.
                $preparedOrderItems[] = [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'product_type' => $item->product_type,
                    'unit' => $item->unit ?: ($item->product_type === 'service' ? 'paket' : 'unit'),
                    'unit_price' => $unitPrice,
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                    'stock_deducted' => false,
                ];
            }

            $totalAmount = $subtotal;
            $dppAmount = round($totalAmount / 1.11, 2);
            $ppnAmount = round($totalAmount - $dppAmount, 2);

            $order = Order::query()->create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $buyer->id,
                'source' => Order::SOURCE_RFQ,
                'status' => Order::STATUS_MOU_ORDER,
                'buyer_name' => $lockedRfq->pic_name,
                'buyer_email' => $lockedRfq->pic_email,
                'buyer_phone' => $lockedRfq->pic_phone,
                'company_name' => $lockedRfq->company_name,
                'shipping_address' => $lockedRfq->shipping_address,
                'shipping_notes' => collect([
                    $lockedRfq->payment_terms_note ? 'Termin: '.$lockedRfq->payment_terms_note : null,
                    $lockedRfq->buyer_notes,
                ])->filter()->implode(' | ') ?: null,
                'pr_reference' => $lockedRfq->rfq_number,
                'npwp_number' => $lockedRfq->npwp_number,
                'spk_number' => $lockedRfq->sph_number,
                'subtotal' => $subtotal,
                'dpp_amount' => $dppAmount,
                'ppn_amount' => $ppnAmount,
                'total_amount' => $totalAmount,
            ]);

            foreach ($preparedOrderItems as $orderItemData) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    ...$orderItemData,
                ]);
            }

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => null,
                'to_status' => Order::STATUS_MOU_ORDER,
                'changed_by' => $buyer->id,
                'note' => "Pesanan dibuat dari kesepakatan RFQ {$lockedRfq->rfq_number} ({$lockedRfq->sph_number}). Harga dan jumlah terkunci.",
            ]);

            $now = now();
            $lockedRfq->update([
                'status' => Rfq::STATUS_AGREED,
                'order_id' => $order->id,
                'agreed_at' => $now,
                'locked_at' => $now,
            ]);

            RfqResponse::query()->create([
                'rfq_id' => $lockedRfq->id,
                'user_id' => $buyer->id,
                'actor_role' => 'buyer',
                'action' => 'agreed',
                'message' => "Penawaran {$lockedRfq->sph_number} disepakati dan dikonversi menjadi pesanan {$order->order_number}. Harga & jumlah terkunci.",
                'quoted_total' => $totalAmount,
            ]);

            return $order->load('items');
        });
    }

    public function reject(Rfq $rfq, User $actor, string $reason): Rfq
    {
        return DB::transaction(function () use ($rfq, $actor, $reason): Rfq {
            /** @var Rfq $lockedRfq */
            $lockedRfq = Rfq::query()
                ->whereKey($rfq->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedRfq->canBeRejected()) {
                throw ValidationException::withMessages([
                    'status' => $lockedRfq->isLocked()
                        ? 'RFQ yang sudah disepakati dan terkunci tidak dapat ditolak.'
                        : "RFQ dengan status {$lockedRfq->statusLabel()} tidak dapat ditolak.",
                ]);
            }

            $cleanReason = trim($reason);

            $lockedRfq->update([
                'status' => Rfq::STATUS_REJECTED,
                'rejected_at' => now(),
                'rejected_by' => $actor->id,
                'rejection_reason' => $cleanReason,
            ]);

            RfqResponse::query()->create([
                'rfq_id' => $lockedRfq->id,
                'user_id' => $actor->id,
                'actor_role' => $actor->is_seller ? 'seller' : 'buyer',
                'action' => 'rejected',
                'message' => $cleanReason,
                'quoted_total' => $lockedRfq->quoted_total,
            ]);

            return $lockedRfq->fresh(['items', 'responses.user', 'order', 'user']);
        });
    }

    public function cancelByBuyer(Rfq $rfq, User $buyer): Rfq
    {
        return DB::transaction(function () use ($rfq, $buyer): Rfq {
            /** @var Rfq $lockedRfq */
            $lockedRfq = Rfq::query()
                ->whereKey($rfq->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedRfq->canBeCancelledByBuyer()) {
                throw ValidationException::withMessages([
                    'status' => 'Pengajuan RFQ hanya dapat dibatalkan sebelum admin menerbitkan penawaran.',
                ]);
            }

            $lockedRfq->update([
                'status' => Rfq::STATUS_CANCELLED,
            ]);

            RfqResponse::query()->create([
                'rfq_id' => $lockedRfq->id,
                'user_id' => $buyer->id,
                'actor_role' => 'buyer',
                'action' => 'cancelled',
                'message' => 'Pengajuan RFQ dibatalkan oleh buyer.',
            ]);

            return $lockedRfq->fresh(['items', 'responses.user', 'order', 'user']);
        });
    }

    /** @return array<string, mixed> */
    public function serializeRfq(Rfq $rfq, bool $forSeller = false): array
    {
        $rfq->loadMissing(['items', 'responses.user', 'order', 'user']);

        $attachmentUrl = null;
        if ($rfq->attachment_path) {
            $attachmentUrl = $forSeller
                ? route('seller.negotiations.attachment', $rfq)
                : route('buyer.quotations.attachment', $rfq);
        }

        return [
            'id' => $rfq->id,
            'rfq_number' => $rfq->rfq_number,
            'sph_number' => $rfq->sph_number,
            'status' => $rfq->status,
            'status_label' => $rfq->statusLabel(),
            'is_locked' => $rfq->isLocked(),
            'can_quote' => $rfq->canBeQuoted(),
            'can_agree' => $rfq->canBeAgreedByBuyer(),
            'can_reject' => $rfq->canBeRejected(),
            'can_cancel' => $rfq->canBeCancelledByBuyer(),
            'order_id' => $rfq->order_id,
            'order_number' => $rfq->order?->order_number,
            'company_name' => $rfq->company_name,
            'pic_name' => $rfq->pic_name,
            'pic_email' => $rfq->pic_email,
            'pic_phone' => $rfq->pic_phone,
            'npwp_number' => $rfq->npwp_number,
            'shipping_address' => $rfq->shipping_address,
            'payment_terms_note' => $rfq->payment_terms_note,
            'target_delivery_date' => $rfq->target_delivery_date?->toDateString(),
            'target_delivery_date_formatted' => $rfq->target_delivery_date?->translatedFormat('d M Y'),
            'buyer_notes' => $rfq->buyer_notes,
            'seller_notes' => $rfq->seller_notes,
            'rejection_reason' => $rfq->rejection_reason,
            'attachment' => $rfq->attachment_path ? [
                'name' => $rfq->attachment_original_name,
                'size' => $rfq->attachment_size,
                'download_url' => $attachmentUrl,
            ] : null,
            'requested_total' => (float) $rfq->requested_total,
            'quoted_total' => $rfq->quoted_total !== null ? (float) $rfq->quoted_total : null,
            'quoted_dpp' => $rfq->quoted_dpp !== null ? (float) $rfq->quoted_dpp : null,
            'quoted_ppn' => $rfq->quoted_ppn !== null ? (float) $rfq->quoted_ppn : null,
            'valid_days' => $rfq->valid_days,
            'valid_until' => $rfq->valid_until?->toDateString(),
            'valid_until_formatted' => $rfq->valid_until?->translatedFormat('d M Y'),
            'created_at' => $rfq->created_at?->toIso8601String(),
            'created_at_formatted' => $rfq->created_at?->translatedFormat('d M Y, H:i'),
            'quoted_at_formatted' => $rfq->quoted_at?->translatedFormat('d M Y, H:i'),
            'agreed_at_formatted' => $rfq->agreed_at?->translatedFormat('d M Y, H:i'),
            'items' => $rfq->items->map(fn (RfqItem $item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'product_type' => $item->product_type,
                'unit' => $item->unit ?: ($item->product_type === 'service' ? 'paket' : 'unit'),
                'requested_quantity' => $item->requested_quantity,
                'requested_unit_price' => $item->requested_unit_price !== null ? (float) $item->requested_unit_price : null,
                'quoted_quantity' => $item->quoted_quantity,
                'quoted_unit_price' => $item->quoted_unit_price !== null ? (float) $item->quoted_unit_price : null,
                'quoted_line_total' => $item->quoted_line_total !== null ? (float) $item->quoted_line_total : null,
            ])->all(),
            'responses' => $rfq->responses->map(fn (RfqResponse $resp): array => [
                'id' => $resp->id,
                'actor_role' => $resp->actor_role,
                'actor_name' => $resp->user?->name ?? ($resp->actor_role === 'seller' ? 'Admin' : 'Buyer'),
                'action' => $resp->action,
                'message' => $resp->message,
                'quoted_total' => $resp->quoted_total !== null ? (float) $resp->quoted_total : null,
                'created_at_formatted' => $resp->created_at?->translatedFormat('d M Y, H:i'),
            ])->all(),
        ];
    }
}
