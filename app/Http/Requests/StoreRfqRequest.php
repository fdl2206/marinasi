<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRfqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isVerifiedBuyer();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'pic_name' => ['required', 'string', 'max:255'],
            'pic_email' => ['required', 'email', 'max:255'],
            'pic_phone' => ['required', 'string', 'max:50'],
            'npwp_number' => ['nullable', 'string', 'max:50'],
            'shipping_address' => ['required', 'string', 'min:10', 'max:1000'],
            'payment_terms_note' => ['nullable', 'string', 'max:255'],
            'target_delivery_date' => ['nullable', 'date'],
            'buyer_notes' => ['nullable', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,xlsx,xls,doc,docx,jpg,jpeg,png', 'max:5120'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.product_name' => ['required', 'string', 'max:255'],
            'items.*.product_type' => ['required', 'in:goods,service'],
            'items.*.unit' => ['nullable', 'string', 'max:40'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'items.*.requested_unit_price' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'company_name.required' => 'Nama perusahaan atau instansi wajib diisi.',
            'pic_name.required' => 'Nama PIC pengadaan wajib diisi.',
            'pic_email.required' => 'Email PIC wajib diisi.',
            'pic_phone.required' => 'Nomor telepon / WhatsApp PIC wajib diisi.',
            'shipping_address.required' => 'Alamat pengiriman / lokasi pekerjaan wajib diisi.',
            'shipping_address.min' => 'Alamat pengiriman minimal 10 karakter.',
            'attachment.mimes' => 'Lampiran harus berformat PDF, Excel, Word, JPG, atau PNG.',
            'attachment.max' => 'Ukuran lampiran maksimal 5 MB.',
            'items.required' => 'Minimal satu item barang atau jasa harus ditambahkan.',
            'items.min' => 'Minimal satu item barang atau jasa harus ditambahkan.',
            'items.*.product_name.required' => 'Nama barang atau jasa pada setiap baris wajib diisi.',
            'items.*.quantity.min' => 'Jumlah kebutuhan minimal 1.',
        ];
    }
}
