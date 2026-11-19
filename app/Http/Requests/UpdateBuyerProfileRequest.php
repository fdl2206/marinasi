<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBuyerProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('access-buyer') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'company_address' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
