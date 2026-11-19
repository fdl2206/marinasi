<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\UpdateBuyerProfileRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function buyerEdit(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        $data = [
            'profile' => $user->only(['name', 'email', 'phone', 'company_name', 'company_address']),
            'companyProfile' => [
                'company_name' => $user->company_name ?? '',
                'company_address' => $user->company_address ?? '',
                'phone' => $user->phone ?? '',
                'business_entity' => '',
                'npwp_number' => '',
                'npwp_name' => '',
                'npwp_address' => '',
                'tax_status' => '',
                'sppkp_file' => '',
                'nib_number' => '',
                'top_terms' => '',
                'top_status' => '',
            ],
            'pics' => [],
            'addresses' => [],
        ];

        if ($request->expectsJson()) {
            return response()->json($data);
        }

        return Inertia::render('Buyer/Profile/Index', $data);
    }

    public function buyerUpdate(UpdateBuyerProfileRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return to_route('buyer.profile.index');
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
