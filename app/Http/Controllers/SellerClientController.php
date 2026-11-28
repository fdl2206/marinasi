<?php

namespace App\Http\Controllers;

use App\Http\Requests\RejectBuyerVerificationRequest;
use App\Models\BuyerVerification;
use App\Models\BuyerVerificationDocument;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SellerClientController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'verification_status' => ['nullable', 'in:all,unverified,pending,verified,rejected'],
            'active_status' => ['nullable', 'in:all,active,inactive'],
        ]);

        $verificationStatus = $filters['verification_status'] ?? 'all';
        $activeStatus = $filters['active_status'] ?? 'all';

        $clients = User::query()
            ->where('is_seller', false)
            ->with([
                'verifications.documents',
                'verifications.reviewer:id,name',
            ])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($subQuery) use ($search): void {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($verificationStatus !== 'all', fn ($query) => $query->where('verification_status', $verificationStatus))
            ->when($activeStatus === 'active', fn ($query) => $query->where('is_active', true))
            ->when($activeStatus === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $client): array => $this->clientData($client));

        $buyersQuery = User::query()->where('is_seller', false);

        return Inertia::render('Seller/Clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'verification_status' => $verificationStatus,
                'active_status' => $activeStatus,
            ],
            'stats' => [
                'total' => (clone $buyersQuery)->count(),
                'pending' => (clone $buyersQuery)->where('verification_status', User::VERIFICATION_PENDING)->count(),
                'verified' => (clone $buyersQuery)->where('verification_status', User::VERIFICATION_VERIFIED)->count(),
                'rejected' => (clone $buyersQuery)->where('verification_status', User::VERIFICATION_REJECTED)->count(),
                'inactive' => (clone $buyersQuery)->where('is_active', false)->count(),
            ],
        ]);
    }

    public function approve(Request $request, User $client): RedirectResponse
    {
        abort_if($client->is_seller, 404);

        DB::transaction(function () use ($request, $client): void {
            $lockedClient = User::query()->lockForUpdate()->findOrFail($client->id);
            $pendingVerification = $lockedClient->verifications()
                ->where('status', BuyerVerification::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if ($pendingVerification === null) {
                throw ValidationException::withMessages([
                    'verification' => 'Tidak ada pengajuan verifikasi yang menunggu persetujuan.',
                ]);
            }

            $pendingVerification->update([
                'status' => BuyerVerification::STATUS_APPROVED,
                'rejection_reason' => null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            $lockedClient->verification_status = User::VERIFICATION_VERIFIED;
            $lockedClient->verified_at = now();
            $lockedClient->save();
        });

        return to_route('seller.clients.index');
    }

    public function reject(RejectBuyerVerificationRequest $request, User $client): RedirectResponse
    {
        abort_if($client->is_seller, 404);

        DB::transaction(function () use ($request, $client): void {
            $lockedClient = User::query()->lockForUpdate()->findOrFail($client->id);
            $pendingVerification = $lockedClient->verifications()
                ->where('status', BuyerVerification::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if ($pendingVerification === null) {
                throw ValidationException::withMessages([
                    'verification' => 'Tidak ada pengajuan verifikasi yang menunggu peninjauan.',
                ]);
            }

            $pendingVerification->update([
                'status' => BuyerVerification::STATUS_REJECTED,
                'rejection_reason' => $request->validated('rejection_reason'),
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            $lockedClient->verification_status = User::VERIFICATION_REJECTED;
            $lockedClient->verified_at = null;
            $lockedClient->save();
        });

        return to_route('seller.clients.index');
    }

    public function toggleActive(Request $request, User $client): RedirectResponse
    {
        abort_if($client->is_seller, 404);

        $validated = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $nextActive = array_key_exists('is_active', $validated)
            ? (bool) $validated['is_active']
            : ! $client->is_active;

        DB::transaction(function () use ($client, $nextActive): void {
            $lockedClient = User::query()->lockForUpdate()->findOrFail($client->id);
            $lockedClient->is_active = $nextActive;
            $lockedClient->save();

            if (! $nextActive && Schema::hasTable('sessions')) {
                DB::table('sessions')->where('user_id', $lockedClient->id)->delete();
            }
        });

        return to_route('seller.clients.index');
    }

    public function downloadDocument(BuyerVerificationDocument $document): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    /** @return array<string, mixed> */
    private function clientData(User $client): array
    {
        $verifications = $client->verifications->map(fn (BuyerVerification $verification): array => [
            'id' => $verification->id,
            'attempt_number' => $verification->attempt_number,
            'status' => $verification->status,
            'notes' => $verification->notes,
            'rejection_reason' => $verification->rejection_reason,
            'reviewer_name' => $verification->reviewer?->name,
            'submitted_at' => $verification->submitted_at?->toIso8601String(),
            'reviewed_at' => $verification->reviewed_at?->toIso8601String(),
            'documents' => $verification->documents->map(fn (BuyerVerificationDocument $doc): array => [
                'id' => $doc->id,
                'document_type' => $doc->document_type,
                'original_name' => $doc->original_name,
                'mime_type' => $doc->mime_type,
                'file_size' => $doc->file_size,
                'download_url' => route('seller.clients.documents.show', $doc->id),
            ])->all(),
        ])->all();

        return [
            'id' => $client->id,
            'name' => $client->name,
            'email' => $client->email,
            'phone' => $client->phone,
            'company_name' => $client->company_name,
            'company_address' => $client->company_address,
            'is_active' => $client->is_active,
            'verification_status' => $client->verification_status,
            'verified_at' => $client->verified_at?->toIso8601String(),
            'created_at' => $client->created_at?->toIso8601String(),
            'latest_verification' => $verifications[0] ?? null,
            'verifications' => $verifications,
        ];
    }
}
