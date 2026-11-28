<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    public const STATUS_MOU_ORDER = 'mou_order';

    public const STATUS_DP_VERIFICATION = 'dp_verification';

    public const STATUS_UNIT_PREPARATION = 'unit_preparation';

    public const STATUS_SHIPPING = 'shipping';

    public const STATUS_HANDOVER = 'handover';

    public const STATUS_CANCELLED = 'cancelled';

    public const SOURCE_DIRECT_CHECKOUT = 'direct_checkout';

    public const SOURCE_RFQ = 'rfq';

    public const DELIVERY_EXPEDITION = 'expedition';

    public const DELIVERY_INTERNAL = 'internal_delivery';

    /** @var array<string, string> */
    public const DELIVERY_METHOD_LABELS = [
        self::DELIVERY_EXPEDITION => 'Ekspedisi / Kurir',
        self::DELIVERY_INTERNAL => 'Antar Langsung (Armada Internal Bandung)',
    ];

    /** @var list<string> */
    public const STAGES = [
        self::STATUS_MOU_ORDER,
        self::STATUS_DP_VERIFICATION,
        self::STATUS_UNIT_PREPARATION,
        self::STATUS_SHIPPING,
        self::STATUS_HANDOVER,
    ];

    /** @var array<string, string> */
    public const STATUS_LABELS = [
        self::STATUS_MOU_ORDER => 'MOU / Pesanan',
        self::STATUS_DP_VERIFICATION => 'DP / Verifikasi',
        self::STATUS_UNIT_PREPARATION => 'Penyiapan Unit',
        self::STATUS_SHIPPING => 'Pengiriman',
        self::STATUS_HANDOVER => 'Serah Terima',
        self::STATUS_CANCELLED => 'Dibatalkan',
    ];

    /** @var list<string> */
    public const CANCELLABLE_STATUSES = [
        self::STATUS_MOU_ORDER,
        self::STATUS_DP_VERIFICATION,
    ];

    protected $fillable = [
        'order_number',
        'user_id',
        'idempotency_key',
        'source',
        'status',
        'buyer_name',
        'buyer_email',
        'buyer_phone',
        'company_name',
        'shipping_address',
        'shipping_notes',
        'pr_reference',
        'npwp_number',
        'spk_number',
        'subtotal',
        'dpp_amount',
        'ppn_amount',
        'total_amount',
        'delivery_method',
        'courier_name',
        'tracking_number',
        'shipped_at',
        'completed_at',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'dpp_amount' => 'decimal:2',
            'ppn_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'shipped_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cancelledByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class)->orderBy('id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderByDesc('id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class)->orderByDesc('id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(OrderDocument::class)->orderByDesc('issued_at');
    }

    public function verifiedPaidAmount(): float
    {
        if ($this->relationLoaded('payments')) {
            return round((float) $this->payments
                ->where('status', OrderPayment::STATUS_VERIFIED)
                ->sum(fn (OrderPayment $p): float => (float) $p->amount), 2);
        }

        return round((float) $this->payments()
            ->where('status', OrderPayment::STATUS_VERIFIED)
            ->sum('amount'), 2);
    }

    public function pendingPaidAmount(): float
    {
        if ($this->relationLoaded('payments')) {
            return round((float) $this->payments
                ->where('status', OrderPayment::STATUS_PENDING)
                ->sum(fn (OrderPayment $p): float => (float) $p->amount), 2);
        }

        return round((float) $this->payments()
            ->where('status', OrderPayment::STATUS_PENDING)
            ->sum('amount'), 2);
    }

    public function hasPurchaseReceipt(): bool
    {
        if ($this->relationLoaded('documents')) {
            return $this->documents->contains(
                fn (OrderDocument $doc): bool => $doc->type === OrderDocument::TYPE_PURCHASE_RECEIPT
            );
        }

        return $this->documents()->where('type', OrderDocument::TYPE_PURCHASE_RECEIPT)->exists();
    }

    public function canBuyerUploadPayment(): bool
    {
        if ($this->status === self::STATUS_CANCELLED || $this->isPaidInFull() || $this->hasPurchaseReceipt()) {
            return false;
        }

        // Jika pesanan sudah Serah Terima tanpa riwayat DP di sistem (pesanan selesai offline/lama),
        // buyer tidak boleh lagi upload bukti bayar sendiri.
        if ($this->status === self::STATUS_HANDOVER && ! $this->hasVerifiedPayment()) {
            return false;
        }

        return round($this->verifiedPaidAmount() + $this->pendingPaidAmount(), 2) < (float) $this->total_amount;
    }

    public function canSellerRecordPayment(): bool
    {
        return $this->status !== self::STATUS_CANCELLED
            && ! $this->isPaidInFull()
            && ! $this->hasPurchaseReceipt();
    }

    public function canBuyerCancel(): bool
    {
        return $this->canBeCancelled() && ! $this->hasVerifiedPayment();
    }

    public function remainingAmount(): float
    {
        return max(0.0, round((float) $this->total_amount - $this->verifiedPaidAmount(), 2));
    }

    public function isPaidInFull(): bool
    {
        return (float) $this->total_amount > 0 && $this->verifiedPaidAmount() >= (float) $this->total_amount;
    }

    public function hasVerifiedPayment(): bool
    {
        return $this->verifiedPaidAmount() > 0;
    }

    public function paymentStatus(): string
    {
        if ($this->isPaidInFull()) {
            return 'paid_in_full';
        }

        if ($this->hasVerifiedPayment()) {
            return 'dp_verified';
        }

        return 'unpaid';
    }

    public function paymentStatusLabel(): string
    {
        return match ($this->paymentStatus()) {
            'paid_in_full' => 'Lunas',
            'dp_verified' => 'DP Terverifikasi (Sisa Pelunasan)',
            default => 'Belum Dibayar',
        };
    }

    public function canIssueInvoice(): bool
    {
        return $this->status !== self::STATUS_CANCELLED
            && $this->stageIndex() >= 2
            && $this->hasVerifiedPayment();
    }

    public function canIssuePurchaseReceipt(): bool
    {
        return $this->status === self::STATUS_HANDOVER
            && $this->isPaidInFull();
    }

    public function deliveryMethodLabel(): string
    {
        return self::DELIVERY_METHOD_LABELS[$this->delivery_method ?: self::DELIVERY_EXPEDITION]
            ?? self::DELIVERY_METHOD_LABELS[self::DELIVERY_EXPEDITION];
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }

    public function stageIndex(): int
    {
        $index = array_search($this->status, self::STAGES, true);

        return $index === false ? 0 : $index + 1;
    }

    public function nextStatus(): ?string
    {
        $index = array_search($this->status, self::STAGES, true);

        if ($index === false || ! isset(self::STAGES[$index + 1])) {
            return null;
        }

        return self::STAGES[$index + 1];
    }

    public function canAdvanceTo(string $targetStatus): bool
    {
        return $this->nextStatus() === $targetStatus;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, self::CANCELLABLE_STATUSES, true);
    }

    public function hasGoodsItems(): bool
    {
        if ($this->relationLoaded('items')) {
            return $this->items->contains(fn (OrderItem $item): bool => $item->product_type === 'goods');
        }

        return $this->items()->where('product_type', 'goods')->exists();
    }

    public function whatsappConfirmationUrl(): string
    {
        $items = $this->relationLoaded('items') ? $this->items : $this->items()->get();
        $itemLines = $items
            ->map(fn (OrderItem $item): string => sprintf(
                '- %dx %s (%s)',
                $item->quantity,
                $item->product_name,
                'Rp '.number_format((float) $item->line_total, 0, ',', '.'),
            ))
            ->implode("\n");

        $recipient = trim(
            ($this->company_name ?: $this->buyer_name)
            .' (PIC: '.$this->buyer_name
            .($this->buyer_phone ? ' - '.$this->buyer_phone : '')
            .')'
        );

        $message = "Halo CV. Putra Nugraha, saya ingin mengonfirmasi pesanan pengadaan B2B:\n\n"
            ."No. Pesanan: {$this->order_number}\n"
            ."Pemesan: {$recipient}\n"
            ."Alamat Pengiriman: {$this->shipping_address}\n"
            .($this->pr_reference ? "No. Referensi PR/PO: {$this->pr_reference}\n" : '')
            .($this->npwp_number ? "NPWP: {$this->npwp_number}\n" : '')
            ."\nRincian Item:\n{$itemLines}\n\n"
            .'Total Tagihan: Rp '.number_format((float) $this->total_amount, 0, ',', '.')." (Termasuk PPN 11%)\n"
            .($this->shipping_notes ? "Catatan: {$this->shipping_notes}\n" : '')
            ."\nMohon konfirmasi proses MOU/DP dan jadwal penyiapan pesanan. Terima kasih.";

        return 'https://wa.me/6281320777874?text='.rawurlencode($message);
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD-PN-'.now()->format('Ymd').'-';

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $candidate = $prefix.strtoupper(Str::random(4));
            if (! static::query()->where('order_number', $candidate)->exists()) {
                return $candidate;
            }
        }

        return $prefix.strtoupper(Str::random(6));
    }
}
