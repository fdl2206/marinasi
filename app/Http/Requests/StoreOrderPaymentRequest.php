<?php

namespace App\Http\Requests;

use App\Models\OrderPayment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'payment_type' => ['required', 'string', Rule::in([OrderPayment::TYPE_DP, OrderPayment::TYPE_INSTALLMENT, OrderPayment::TYPE_FULL])],
            'amount' => ['required', 'numeric', 'min:1', 'max:999999999999.99'],
            'payment_method' => ['required', 'string', 'max:120'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
            'paid_at' => ['required', 'date', 'before_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'proof' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'payment_type.required' => 'Jenis pembayaran (DP / Pelunasan) wajib dipilih.',
            'amount.required' => 'Nominal pembayaran wajib diisi.',
            'amount.min' => 'Nominal pembayaran harus lebih dari 0.',
            'payment_method.required' => 'Metode pembayaran wajib diisi.',
            'paid_at.required' => 'Tanggal pembayaran wajib diisi.',
            'paid_at.before_or_equal' => 'Tanggal pembayaran tidak boleh melebihi hari ini.',
            'proof.mimes' => 'Bukti pembayaran harus berformat PDF, JPG, atau PNG.',
            'proof.max' => 'Ukuran file bukti pembayaran maksimal 5 MB.',
        ];
    }
}
