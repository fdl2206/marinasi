<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('access-seller') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('is_active', true)],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['goods', 'service'])],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')],
            'description' => ['nullable', 'string'],
            'specifications' => ['nullable', 'array'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:9999999999999.99', 'decimal:0,2'],
            'stock_quantity' => ['nullable', 'numeric', 'min:0', 'max:999999999.999', 'decimal:0,3'],
            'stock_unit' => ['nullable', 'string', 'max:50'],
            'moq' => ['nullable', 'integer', 'min:1', 'max:4294967295'],
            'is_active' => ['sometimes', 'boolean'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
