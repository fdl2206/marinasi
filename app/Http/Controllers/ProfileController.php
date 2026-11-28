<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\UpdateBuyerProfileRequest;
use App\Models\BuyerVerification;
use App\Models\BuyerVerificationDocument;
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
        $user->load(['verifications.documents']);

        $history = $user->verifications->map(fn (BuyerVerification $verification): array => [
            'id' => $verification->id,
            'attempt_number' => $verification->attempt_number,
            'status' => $verification->status,
            'notes' => $verification->notes,
            'rejection_reason' => $verification->rejection_reason,
            'submitted_at' => $verification->submitted_at?->toIso8601String(),
            'reviewed_at' => $verification->reviewed_at?->toIso8601String(),
            'documents' => $verification->documents->map(fn (BuyerVerificationDocument $doc): array => [
                'id' => $doc->id,
                'document_type' => $doc->document_type,
                'original_name' => $doc->original_name,
                'file_size' => $doc->file_size,
                'download_url' => route('buyer.verification.documents.show', $doc->id),
            ])->all(),
        ])->all();

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
            'verification' => [
                'status' => $user->verification_status,
                'is_verified' => $user->isVerifiedBuyer(),
                'verified_at' => $user->verified_at?->toIso8601String(),
                'latest' => $history[0] ?? null,
                'history' => $history,
            ],
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
        abort_if($request->user()->is_seller, 403, 'Akun pengelola tidak dapat dihapus melalui halaman profil.');

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
