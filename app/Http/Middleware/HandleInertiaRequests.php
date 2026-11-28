<?php

namespace App\Http\Middleware;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->only([
                        'id',
                        'name',
                        'email',
                        'phone',
                        'company_name',
                        'company_address',
                        'is_seller',
                        'is_active',
                        'verification_status',
                        'email_verified_at',
                    ]),
                    'is_verified_buyer' => $request->user()->isVerifiedBuyer(),
                ] : null,
            ],
            'cartCount' => fn (): int => CartItem::activeCountForUser($request->user()),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'order_number' => fn () => $request->session()->get('order_number'),
                'whatsapp_url' => fn () => $request->session()->get('whatsapp_url'),
            ],
        ];
    }
}
