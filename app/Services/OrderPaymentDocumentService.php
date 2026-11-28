<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderDocument;
use App\Models\OrderPayment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderPaymentDocumentService
{
    /**
     * @param  array{
     *   payment_type: string,
     *   amount: numeric,
     *   payment_method: string,
     *   payment_reference?: ?string,
     *   paid_at: string,
     *   notes?: ?string
     * }  $payload
     */
    public function recordPayment(
        Order $order,
        User $actor,
        array $payload,
        ?UploadedFile $proof = null,
        bool $autoVerify = false,
    ): OrderPayment {
        $storedPath = null;
        $proofMeta = [
            'proof_path' => null,
            'proof_original_name' => null,
            'proof_mime_type' => null,
            'proof_size' => null,
        ];

        if ($proof) {
            $storedPath = $proof->store('orders/payments', 'local');
            $proofMeta = [
                'proof_path' => $storedPath,
                'proof_original_name' => $proof->getClientOriginalName(),
                'proof_mime_type' => $proof->getClientMimeType(),
                'proof_size' => $proof->getSize(),
            ];
        }

        try {
            return DB::transaction(function () use ($order, $actor, $payload, $proofMeta, $autoVerify): OrderPayment {
                /** @var Order $lockedOrder */
                $lockedOrder = Order::query()
                    ->whereKey($order->id)
                    ->with(['payments', 'documents'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($lockedOrder->status === Order::STATUS_CANCELLED) {
                    throw ValidationException::withMessages([
                        'payment' => 'Pembayaran tidak dapat dicatat pada pesanan yang sudah dibatalkan.',
                    ]);
                }

                if ($lockedOrder->hasPurchaseReceipt() || $lockedOrder->isPaidInFull()) {
                    throw ValidationException::withMessages([
                        'payment' => 'Pesanan ini sudah lunas / selesai dan tidak menerima pembayaran tambahan.',
                    ]);
                }

                if (! $autoVerify && $lockedOrder->status === Order::STATUS_HANDOVER && ! $lockedOrder->hasVerifiedPayment()) {
                    throw ValidationException::withMessages([
                        'payment' => 'Pesanan ini sudah selesai (Serah Terima). Hubungi admin jika masih ada keperluan administrasi pembayaran.',
                    ]);
                }

                $amount = round((float) $payload['amount'], 2);
                $remaining = $lockedOrder->remainingAmount();

                if ($amount > $remaining) {
                    throw ValidationException::withMessages([
                        'amount' => 'Nominal pembayaran melebihi sisa tagihan sebesar Rp '.number_format($remaining, 0, ',', '.').'.',
                    ]);
                }

                if (! $autoVerify) {
                    $availableForPending = max(0.0, round($remaining - $lockedOrder->pendingPaidAmount(), 2));
                    if ($amount > $availableForPending) {
                        throw ValidationException::withMessages([
                            'amount' => 'Masih ada bukti pembayaran yang menunggu verifikasi admin. Sisa nominal yang dapat diajukan saat ini: Rp '.number_format($availableForPending, 0, ',', '.').'.',
                        ]);
                    }
                }

                return OrderPayment::query()->create([
                    'order_id' => $lockedOrder->id,
                    'submitted_by' => $actor->id,
                    'payment_type' => $payload['payment_type'],
                    'amount' => $amount,
                    'payment_method' => trim($payload['payment_method']),
                    'payment_reference' => ! empty($payload['payment_reference']) ? trim((string) $payload['payment_reference']) : null,
                    'paid_at' => $payload['paid_at'],
                    'status' => $autoVerify ? OrderPayment::STATUS_VERIFIED : OrderPayment::STATUS_PENDING,
                    'notes' => ! empty($payload['notes']) ? trim((string) $payload['notes']) : null,
                    'verified_by' => $autoVerify ? $actor->id : null,
                    'verified_at' => $autoVerify ? now() : null,
                    ...$proofMeta,
                ]);
            });
        } catch (Throwable $exception) {
            if ($storedPath) {
                Storage::disk('local')->delete($storedPath);
            }

            throw $exception;
        }
    }

    public function verifyPayment(OrderPayment $payment, User $seller): OrderPayment
    {
        return DB::transaction(function () use ($payment, $seller): OrderPayment {
            /** @var OrderPayment $locked */
            $locked = OrderPayment::query()
                ->whereKey($payment->id)
                ->with('order')
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->order->status === Order::STATUS_CANCELLED) {
                throw ValidationException::withMessages([
                    'payment' => 'Pembayaran pada pesanan yang dibatalkan tidak dapat diverifikasi.',
                ]);
            }

            if ($locked->status !== OrderPayment::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'payment' => 'Hanya pembayaran berstatus Menunggu Verifikasi yang dapat diverifikasi.',
                ]);
            }

            $remaining = $locked->order->remainingAmount();
            if ((float) $locked->amount > $remaining) {
                throw ValidationException::withMessages([
                    'payment' => 'Verifikasi dibatalkan karena nominal melebihi sisa tagihan pesanan sebesar Rp '.number_format($remaining, 0, ',', '.').'.',
                ]);
            }

            $locked->update([
                'status' => OrderPayment::STATUS_VERIFIED,
                'verified_by' => $seller->id,
                'verified_at' => now(),
                'rejection_reason' => null,
            ]);

            return $locked->fresh();
        });
    }

    public function rejectPayment(OrderPayment $payment, User $seller, string $reason): OrderPayment
    {
        return DB::transaction(function () use ($payment, $seller, $reason): OrderPayment {
            /** @var OrderPayment $locked */
            $locked = OrderPayment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== OrderPayment::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'payment' => 'Hanya pembayaran berstatus Menunggu Verifikasi yang dapat ditolak.',
                ]);
            }

            $locked->update([
                'status' => OrderPayment::STATUS_REJECTED,
                'verified_by' => $seller->id,
                'verified_at' => now(),
                'rejection_reason' => trim($reason),
            ]);

            return $locked->fresh();
        });
    }

    public function issueInvoice(Order $order, User $seller, ?string $notes = null): OrderDocument
    {
        return DB::transaction(function () use ($order, $seller, $notes): OrderDocument {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with(['payments', 'documents'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedOrder->canIssueInvoice()) {
                throw ValidationException::withMessages([
                    'invoice' => 'Invoice resmi hanya dapat diterbitkan setelah pesanan mencapai tahap DP / Verifikasi (atau lebih lanjut) dan minimal pembayaran DP telah diverifikasi.',
                ]);
            }

            $existing = $lockedOrder->documents->firstWhere('type', OrderDocument::TYPE_INVOICE);
            $cleanNotes = $notes !== null && trim($notes) !== '' ? trim($notes) : null;

            if ($existing) {
                $existing->update([
                    'dpp_amount' => $lockedOrder->dpp_amount,
                    'ppn_amount' => $lockedOrder->ppn_amount,
                    'total_amount' => $lockedOrder->total_amount,
                    'notes' => $cleanNotes ?? $existing->notes,
                ]);

                return $existing->fresh();
            }

            return OrderDocument::query()->create([
                'order_id' => $lockedOrder->id,
                'type' => OrderDocument::TYPE_INVOICE,
                'document_number' => OrderDocument::generateDocumentNumber(OrderDocument::TYPE_INVOICE),
                'tax_period' => now()->translatedFormat('F Y'),
                'dpp_amount' => $lockedOrder->dpp_amount,
                'ppn_amount' => $lockedOrder->ppn_amount,
                'total_amount' => $lockedOrder->total_amount,
                'notes' => $cleanNotes,
                'issued_by' => $seller->id,
                'issued_at' => now(),
            ]);
        });
    }

    public function issuePurchaseReceipt(Order $order, User $seller, ?string $notes = null): OrderDocument
    {
        return DB::transaction(function () use ($order, $seller, $notes): OrderDocument {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with(['payments', 'documents'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedOrder->canIssuePurchaseReceipt()) {
                throw ValidationException::withMessages([
                    'purchase_receipt' => 'Bukti Pembelian hanya dapat diterbitkan setelah pembayaran LUNAS terverifikasi dan pesanan berada pada tahap Serah Terima.',
                ]);
            }

            $existing = $lockedOrder->documents->firstWhere('type', OrderDocument::TYPE_PURCHASE_RECEIPT);
            $cleanNotes = $notes !== null && trim($notes) !== '' ? trim($notes) : null;

            if ($existing) {
                $existing->update([
                    'dpp_amount' => $lockedOrder->dpp_amount,
                    'ppn_amount' => $lockedOrder->ppn_amount,
                    'total_amount' => $lockedOrder->total_amount,
                    'notes' => $cleanNotes ?? $existing->notes,
                ]);

                return $existing->fresh();
            }

            return OrderDocument::query()->create([
                'order_id' => $lockedOrder->id,
                'type' => OrderDocument::TYPE_PURCHASE_RECEIPT,
                'document_number' => OrderDocument::generateDocumentNumber(OrderDocument::TYPE_PURCHASE_RECEIPT),
                'tax_period' => now()->translatedFormat('F Y'),
                'dpp_amount' => $lockedOrder->dpp_amount,
                'ppn_amount' => $lockedOrder->ppn_amount,
                'total_amount' => $lockedOrder->total_amount,
                'notes' => $cleanNotes,
                'issued_by' => $seller->id,
                'issued_at' => now(),
            ]);
        });
    }

    /**
     * Upload PDF resmi dari luar sistem (e-Faktur Pajak DJP atau BAST bertanda tangan).
     *
     * @param  array{type: string, document_number: string, tax_period?: ?string, notes?: ?string}  $payload
     */
    public function uploadExternalDocument(
        Order $order,
        User $seller,
        array $payload,
        UploadedFile $file,
    ): OrderDocument {
        $storedPath = $file->store('orders/documents', 'local');
        $oldPathToDelete = null;

        try {
            $document = DB::transaction(function () use ($order, $seller, $payload, $file, $storedPath, &$oldPathToDelete): OrderDocument {
                /** @var Order $lockedOrder */
                $lockedOrder = Order::query()
                    ->whereKey($order->id)
                    ->with('documents')
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($lockedOrder->status === Order::STATUS_CANCELLED) {
                    throw ValidationException::withMessages([
                        'document' => 'Dokumen tidak dapat diunggah untuk pesanan yang dibatalkan.',
                    ]);
                }

                $type = $payload['type'];
                if ($type === OrderDocument::TYPE_EFAKTUR && $lockedOrder->stageIndex() < 2) {
                    throw ValidationException::withMessages([
                        'document' => 'e-Faktur Pajak hanya dapat diunggah setelah pesanan minimal memasuki tahap DP / Verifikasi.',
                    ]);
                }

                if ($type === OrderDocument::TYPE_BAST && $lockedOrder->stageIndex() < 4) {
                    throw ValidationException::withMessages([
                        'document' => 'Berita Acara Serah Terima (BAST) hanya dapat diunggah pada tahap Pengiriman atau Serah Terima.',
                    ]);
                }

                $existing = $lockedOrder->documents->firstWhere('type', $type);
                $attributes = [
                    'document_number' => trim($payload['document_number']),
                    'tax_period' => ! empty($payload['tax_period']) ? trim((string) $payload['tax_period']) : now()->translatedFormat('F Y'),
                    'dpp_amount' => $lockedOrder->dpp_amount,
                    'ppn_amount' => $lockedOrder->ppn_amount,
                    'total_amount' => $lockedOrder->total_amount,
                    'file_path' => $storedPath,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'notes' => ! empty($payload['notes']) ? trim((string) $payload['notes']) : null,
                    'issued_by' => $seller->id,
                    'issued_at' => now(),
                ];

                if ($existing) {
                    $oldPathToDelete = $existing->file_path;
                    $existing->update($attributes);

                    return $existing->fresh();
                }

                return OrderDocument::query()->create([
                    'order_id' => $lockedOrder->id,
                    'type' => $type,
                    ...$attributes,
                ]);
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($storedPath);
            throw $exception;
        }

        if ($oldPathToDelete && $oldPathToDelete !== $storedPath) {
            Storage::disk('local')->delete($oldPathToDelete);
        }

        return $document;
    }
}
