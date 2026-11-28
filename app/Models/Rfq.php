<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Rfq extends Model
{
    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_QUOTED = 'quoted';

    public const STATUS_AGREED = 'agreed';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_CANCELLED = 'cancelled';

    /** @var array<string, string> */
    public const STATUS_LABELS = [
        self::STATUS_SUBMITTED => 'Menunggu Penawaran',
        self::STATUS_QUOTED => 'SPH Diterbitkan',
        self::STATUS_AGREED => 'Disepakati (Terkunci)',
        self::STATUS_REJECTED => 'Ditolak',
        self::STATUS_CANCELLED => 'Dibatalkan',
    ];

    protected $fillable = [
        'rfq_number',
        'sph_number',
        'user_id',
        'order_id',
        'status',
        'company_name',
        'pic_name',
        'pic_email',
        'pic_phone',
        'npwp_number',
        'shipping_address',
        'payment_terms_note',
        'target_delivery_date',
        'buyer_notes',
        'attachment_path',
        'attachment_original_name',
        'attachment_mime_type',
        'attachment_size',
        'requested_total',
        'quoted_total',
        'quoted_dpp',
        'quoted_ppn',
        'valid_days',
        'valid_until',
        'seller_notes',
        'quoted_by',
        'quoted_at',
        'agreed_at',
        'locked_at',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'target_delivery_date' => 'date',
            'valid_until' => 'date',
            'requested_total' => 'decimal:2',
            'quoted_total' => 'decimal:2',
            'quoted_dpp' => 'decimal:2',
            'quoted_ppn' => 'decimal:2',
            'valid_days' => 'integer',
            'attachment_size' => 'integer',
            'quoted_at' => 'datetime',
            'agreed_at' => 'datetime',
            'locked_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function quotedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'quoted_by');
    }

    public function rejectedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(RfqItem::class)->orderBy('id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(RfqResponse::class)->orderByDesc('id');
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }

    public function isLocked(): bool
    {
        return $this->locked_at !== null || $this->status === self::STATUS_AGREED;
    }

    public function canBeQuoted(): bool
    {
        return in_array($this->status, [self::STATUS_SUBMITTED, self::STATUS_QUOTED], true) && ! $this->isLocked();
    }

    public function canBeAgreedByBuyer(): bool
    {
        return $this->status === self::STATUS_QUOTED && ! $this->isLocked();
    }

    public function canBeRejected(): bool
    {
        return in_array($this->status, [self::STATUS_SUBMITTED, self::STATUS_QUOTED], true) && ! $this->isLocked();
    }

    public function canBeCancelledByBuyer(): bool
    {
        return $this->status === self::STATUS_SUBMITTED && ! $this->isLocked();
    }

    public static function generateRfqNumber(): string
    {
        $prefix = 'RFQ-PN-'.now()->format('Ymd').'-';

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $candidate = $prefix.strtoupper(Str::random(4));
            if (! static::query()->where('rfq_number', $candidate)->exists()) {
                return $candidate;
            }
        }

        return $prefix.strtoupper(Str::random(6));
    }

    public static function generateSphNumber(): string
    {
        $prefix = 'SPH/PN/'.now()->format('Ym').'/';

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $candidate = $prefix.strtoupper(Str::random(4));
            if (! static::query()->where('sph_number', $candidate)->exists()) {
                return $candidate;
            }
        }

        return $prefix.strtoupper(Str::random(6));
    }
}
