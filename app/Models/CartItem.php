<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeAvailableForPurchase(Builder $query): Builder
    {
        return $query->whereHas('product', fn (Builder $productQuery) => $productQuery
            ->where('is_active', true)
            ->where(fn (Builder $stockQuery) => $stockQuery
                ->where('type', 'service')
                ->orWhereNull('stock_quantity')
                ->orWhere('stock_quantity', '>=', 1))
            ->whereHas('category', fn (Builder $categoryQuery) => $categoryQuery->where('is_active', true)));
    }

    public static function activeCountForUser(?User $user): int
    {
        if (! $user || $user->is_seller || ! Schema::hasTable('cart_items')) {
            return 0;
        }

        return (int) static::query()
            ->where('user_id', $user->id)
            ->availableForPurchase()
            ->sum('quantity');
    }
}