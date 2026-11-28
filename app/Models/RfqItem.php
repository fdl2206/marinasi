<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfqItem extends Model
{
    protected $fillable = [
        'rfq_id',
        'product_id',
        'product_name',
        'product_sku',
        'product_type',
        'unit',
        'requested_quantity',
        'requested_unit_price',
        'quoted_quantity',
        'quoted_unit_price',
        'quoted_line_total',
    ];

    protected function casts(): array
    {
        return [
            'requested_quantity' => 'integer',
            'requested_unit_price' => 'decimal:2',
            'quoted_quantity' => 'integer',
            'quoted_unit_price' => 'decimal:2',
            'quoted_line_total' => 'decimal:2',
        ];
    }

    public function rfq(): BelongsTo
    {
        return $this->belongsTo(Rfq::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
