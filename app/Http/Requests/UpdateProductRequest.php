<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends StoreProductRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($this->route('product'))],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where(
                fn ($query) => $query->where('is_active', true)->orWhere('id', $this->route('product')->category_id),
            )],
        ];
    }
}
