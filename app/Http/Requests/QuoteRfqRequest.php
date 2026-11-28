<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuoteRfqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_seller;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'valid_days' => ['required', 'integer', 'min:1', 'max:90'],
            'payment_terms_note' => ['nullable', 'string', 'max:255'],
            'seller_notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer'],
            'items.*.quoted_quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'items.*.quoted_unit_price' => ['required', 'numeric', 'min:0', 'max:999999999999.99'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'valid_days.required' => 'Masa berlaku SPH wajib diisi.',
            'items.required' => 'Rincian harga penawaran item wajib diisi.',
            'items.*.quoted_quantity.min' => 'Jumlah penawaran minimal 1.',
            'items.*.quoted_unit_price.required' => 'Harga satuan penawaran wajib diisi untuk semua item.',
            'items.*.quoted_unit_price.min' => 'Harga satuan penawaran tidak boleh negatif.',
        ];
    }
}
