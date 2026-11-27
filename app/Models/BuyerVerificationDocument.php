<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuyerVerificationDocument extends Model
{
    protected $fillable = [
        'buyer_verification_id',
        'document_type',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    public function verification(): BelongsTo
    {
        return $this->belongsTo(BuyerVerification::class, 'buyer_verification_id');
    }
}
