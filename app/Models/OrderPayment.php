<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPayment extends Model
{
    public const TYPE_DP = 'dp';

    public const TYPE_INSTALLMENT = 'installment';

    public const TYPE_FULL = 'full';

    public const STATUS_PENDING = 'pending';

    public const STATUS_VERIFIED = 'verified';

    public const STATUS_REJECTED = 'rejected';

    /** @var array<string, string> */
    public const TYPE_LABELS = [
        self::TYPE_DP => 'Uang Muka (DP)',
        self::TYPE_INSTALLMENT => 'Termin / Cicilan',
        self::TYPE_FULL => 'Pelunasan / Bayar Penuh',
    ];

    /** @var array<string, string> */
    public const STATUS_LABELS = [
        self::STATUS_PENDING => 'Menunggu Verifikasi',
        self::STATUS_VERIFIED => 'Terverifikasi',
        self::STATUS_REJECTED => 'Ditolak',
    ];

    protected $fillable = [
        'order_id',
        'submitted_by',
        'payment_type',
        'amount',
        'payment_method',
        'payment_reference',
        'paid_at',
        'status',
        'proof_path',
        'proof_original_name',
        'proof_mime_type',
        'proof_size',
        'notes',
        'verified_by',
        'verified_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'date',
            'proof_size' => 'integer',
            'verified_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function submittedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function verifiedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function typeLabel(): string
    {
        return self::TYPE_LABELS[$this->payment_type] ?? $this->payment_type;
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }
}
