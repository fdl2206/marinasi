<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBuyerVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('access-buyer') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:1000'],
            'documents' => ['required', 'array', 'min:1', 'max:5'],
            'documents.*.document_type' => ['required', 'string', 'max:100'],
            'documents.*.file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
