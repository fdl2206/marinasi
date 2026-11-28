<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name',
        'tagline',
        'npwp',
        'is_pkp',
        'whatsapp_number',
        'display_phone',
        'email',
        'address',
        'bank_accounts',
        'default_payment_terms',
        'tax_note',
    ];

    protected function casts(): array
    {
        return [
            'is_pkp' => 'boolean',
            'bank_accounts' => 'array',
        ];
    }

    public static function current(): self
    {
        if (Schema::hasTable('company_settings')) {
            $existing = static::query()->first();
            if ($existing) {
                return $existing;
            }
        }

        return new self([
            'company_name' => 'CV. Putra Nugraha',
            'tagline' => 'Perdagangan Barang dan Jasa',
            'npwp' => null,
            'is_pkp' => true,
            'whatsapp_number' => '6281320777874',
            'display_phone' => '(+62) 813-2077-7874',
            'email' => 'admin@putranugraha.co.id',
            'address' => 'Bandung, Jawa Barat',
            'bank_accounts' => [],
            'default_payment_terms' => 'DP / Pelunasan sesuai kesepakatan',
            'tax_note' => 'PPN 11% (Faktur Pajak Resmi)',
        ]);
    }
}
