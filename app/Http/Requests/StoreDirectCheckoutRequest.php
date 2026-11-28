<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDirectCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isVerifiedBuyer();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'idempotency_key' => ['required', 'string', 'max:100'],
            'cart_item_ids' => ['required', 'array', 'min:1'],
            'cart_item_ids.*' => ['integer', 'distinct'],
            'company_name' => ['required', 'string', 'max:255'],
            'buyer_name' => ['required', 'string', 'max:255'],
            'buyer_phone' => ['required', 'string', 'max:50'],
            'shipping_address' => ['required', 'string', 'min:10', 'max:1000'],
            'shipping_notes' => ['nullable', 'string', 'max:1000'],
            'pr_reference' => ['nullable', 'string', 'max:120'],
            'npwp_number' => ['nullable', 'string', 'max:50'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'cart_item_ids.required' => 'Pilih minimal satu item dari keranjang untuk diproses.',
            'cart_item_ids.min' => 'Pilih minimal satu item dari keranjang untuk diproses.',
            'company_name.required' => 'Nama instansi atau perusahaan wajib diisi.',
            'buyer_name.required' => 'Nama PIC pemesan wajib diisi.',
            'buyer_phone.required' => 'Nomor telepon / WhatsApp PIC wajib diisi.',
            'shipping_address.required' => 'Alamat pengiriman wajib diisi.',
            'shipping_address.min' => 'Alamat pengiriman terlalu singkat, lengkapi alamat tujuan pengiriman.',
        ];
    }
}
