<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdvanceOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_seller;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'target_status' => ['required', 'string', Rule::in(Order::STAGES)],
            'note' => ['nullable', 'string', 'max:1000'],
            'spk_number' => ['nullable', 'string', 'max:120'],
            'delivery_method' => ['nullable', 'string', Rule::in([Order::DELIVERY_EXPEDITION, Order::DELIVERY_INTERNAL])],
            'courier_name' => ['nullable', 'string', 'max:120'],
            'tracking_number' => ['nullable', 'string', 'max:120'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'target_status.required' => 'Status tujuan wajib dipilih.',
            'target_status.in' => 'Status tujuan tidak valid.',
        ];
    }
}
