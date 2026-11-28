<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBuyerVerificationRequest;
use App\Models\BuyerVerification;
use App\Models\BuyerVerificationDocument;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class BuyerVerificationController extends Controller
{
    public function store(StoreBuyerVerificationRequest $request): RedirectResponse
    {
        $storedPaths = [];

        try {
            DB::transaction(function () use ($request, &$storedPaths): void {
                $user = User::query()->lockForUpdate()->findOrFail($request->user()->id);

                if ($user->verification_status === User::VERIFICATION_VERIFIED) {
                    throw ValidationException::withMessages([
                        'verification' => 'Akun Anda sudah terverifikasi.',
                    ]);
                }

                if ($user->verification_status === User::VERIFICATION_PENDING) {
                    throw ValidationException::withMessages([
                        'verification' => 'Pengajuan verifikasi Anda sedang menunggu pemeriksaan pengelola.',
                    ]);
                }

                $nextAttempt = ((int) $user->verifications()->max('attempt_number')) + 1;

                $verification = $user->verifications()->create([
                    'attempt_number' => $nextAttempt,
                    'status' => BuyerVerification::STATUS_PENDING,
                    'notes' => $request->validated('notes'),
                    'submitted_at' => now(),
                ]);

                foreach ($request->validated('documents') as $index => $documentInput) {
                    $file = $request->file("documents.{$index}.file");
                    $path = $file->store("buyer-verifications/{$user->id}", 'local');

                    if ($path === false) {
                        throw new RuntimeException('Gagal menyimpan dokumen verifikasi.');
                    }

                    $storedPaths[] = $path;

                    $verification->documents()->create([
                        'document_type' => $documentInput['document_type'],
                        'original_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize() ?: 0,
                    ]);
                }

                $user->verification_status = User::VERIFICATION_PENDING;
                $user->save();
            });
        } catch (Throwable $exception) {
            if ($storedPaths !== []) {
                Storage::disk('local')->delete($storedPaths);
            }

            throw $exception;
        }

        return to_route('buyer.profile.index');
    }

    public function downloadDocument(Request $request, BuyerVerificationDocument $document): StreamedResponse
    {
        $document->loadMissing('verification');

        abort_unless($document->verification?->user_id === $request->user()->id, 403);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }
}
