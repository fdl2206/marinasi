<?php

namespace App\Http\Requests;

use App\Models\OrderDocument;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadOrderDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_seller;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in([OrderDocument::TYPE_EFAKTUR, OrderDocument::TYPE_BAST])],
            'document_number' => ['required', 'string', 'max:100'],
            'tax_period' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'file' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'type.required' => 'Jenis dokumen wajib dipilih.',
            'document_number.required' => 'Nomor dokumen / Nomor Seri Faktur Pajak wajib diisi.',
            'file.required' => 'File PDF dokumen wajib diunggah.',
            'file.mimes' => 'File dokumen resmi harus berformat PDF.',
            'file.max' => 'Ukuran file PDF maksimal 5 MB.',
        ];
    }
}
