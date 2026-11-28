<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class OrderDocument extends Model
{
    public const TYPE_INVOICE = 'invoice';

    public const TYPE_PURCHASE_RECEIPT = 'purchase_receipt';

    public const TYPE_EFAKTUR = 'efaktur';

    public const TYPE_BAST = 'bast';

    /** @var array<string, string> */
    public const TYPE_LABELS = [
        self::TYPE_INVOICE => 'Invoice Resmi',
        self::TYPE_PURCHASE_RECEIPT => 'Bukti Pembelian (Lunas)',
        self::TYPE_EFAKTUR => 'e-Faktur PPN 11%',
        self::TYPE_BAST => 'Berita Acara Serah Terima (BAST)',
    ];

    protected $fillable = [
        'order_id',
        'type',
        'document_number',
        'tax_period',
        'dpp_amount',
        'ppn_amount',
        'total_amount',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'notes',
        'issued_by',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'dpp_amount' => 'decimal:2',
            'ppn_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'file_size' => 'integer',
            'issued_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function issuedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function typeLabel(): string
    {
        return self::TYPE_LABELS[$this->type] ?? $this->type;
    }

    public function isGeneratedDocument(): bool
    {
        return in_array($this->type, [self::TYPE_INVOICE, self::TYPE_PURCHASE_RECEIPT], true);
    }

    public static function generateDocumentNumber(string $type): string
    {
        $prefix = match ($type) {
            self::TYPE_INVOICE => 'INV-PN-'.now()->format('Ym').'-',
            self::TYPE_PURCHASE_RECEIPT => 'BKT-PN-'.now()->format('Ym').'-',
            default => 'DOC-PN-'.now()->format('Ym').'-',
        };

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $candidate = $prefix.strtoupper(Str::random(4));
            if (! static::query()->where('document_number', $candidate)->exists()) {
                return $candidate;
            }
        }

        return $prefix.strtoupper(Str::random(6));
    }
}
