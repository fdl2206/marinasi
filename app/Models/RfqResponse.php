<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfqResponse extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'rfq_id',
        'user_id',
        'actor_role',
        'action',
        'message',
        'quoted_total',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'quoted_total' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function rfq(): BelongsTo
    {
        return $this->belongsTo(Rfq::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
