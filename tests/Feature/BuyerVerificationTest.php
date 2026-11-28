<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureBuyerIsVerified;
use App\Models\BuyerVerification;
use App\Models\BuyerVerificationDocument;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class BuyerVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_buyer_can_use_cart_but_is_blocked_by_verified_buyer_gate_and_middleware(): void
    {
        $buyer = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 5]);

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $product->id, 'quantity' => 1])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('cart_items', 1);
        $this->assertFalse(Gate::forUser($buyer)->allows('verified-buyer'));

        $request = Request::create('/buyer/checkout', 'POST');
        $request->setUserResolver(fn () => $buyer);
        $request->headers->set('Accept', 'application/json');

        $response = (new EnsureBuyerIsVerified)->handle($request, fn () => response()->json(['ok' => true]));
        $this->assertSame(403, $response->getStatusCode());

        $verifiedBuyer = User::factory()->verifiedBuyer()->create();
        $this->assertTrue(Gate::forUser($verifiedBuyer)->allows('verified-buyer'));

        $verifiedRequest = Request::create('/buyer/checkout', 'POST');
        $verifiedRequest->setUserResolver(fn () => $verifiedBuyer);
        $verifiedRequest->headers->set('Accept', 'application/json');

        $okResponse = (new EnsureBuyerIsVerified)->handle($verifiedRequest, fn () => response()->json(['ok' => true]));
        $this->assertSame(200, $okResponse->getStatusCode());
    }

    public function test_buyer_cannot_spoof_verification_or_active_status_via_register_or_profile(): void
    {
        $this->post('/register', [
            'name' => 'Instansi Baru',
            'email' => 'instansi@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'verification_status' => 'verified',
            'is_active' => false,
        ])->assertRedirect(route('dashboard', absolute: false));

        $buyer = User::query()->where('email', 'instansi@example.com')->sole();
        $this->assertSame(User::VERIFICATION_UNVERIFIED, $buyer->verification_status);
        $this->assertTrue($buyer->is_active);
        $this->assertNull($buyer->verified_at);

        $this->actingAs($buyer)->patch('/buyer/profile', [
            'company_name' => 'Dinas Contoh',
            'verification_status' => 'verified',
            'is_active' => false,
        ])->assertSessionHasNoErrors();

        $this->assertSame(User::VERIFICATION_UNVERIFIED, $buyer->fresh()->verification_status);
        $this->assertTrue($buyer->fresh()->is_active);
    }

    public function test_full_lifecycle_submit_reject_resubmit_re_reject_and_approve(): void
    {
        Storage::fake('local');
        $buyer = User::factory()->create(['company_name' => 'Dinas Uji']);
        $seller = User::factory()->seller()->create();

        // Attempt 1: Buyer submits
        $this->actingAs($buyer)->post('/buyer/verification', [
            'notes' => 'Pengajuan pertama',
            'documents' => [
                ['document_type' => 'npwp', 'file' => UploadedFile::fake()->create('npwp.pdf', 200, 'application/pdf')],
            ],
        ])->assertSessionHasNoErrors()->assertRedirect(route('buyer.profile.index'));

        $this->assertSame(User::VERIFICATION_PENDING, $buyer->fresh()->verification_status);
        $this->assertDatabaseCount('buyer_verifications', 1);
        $this->assertDatabaseCount('buyer_verification_documents', 1);

        // Cannot double-submit while pending
        $this->actingAs($buyer)->post('/buyer/verification', [
            'documents' => [
                ['document_type' => 'npwp', 'file' => UploadedFile::fake()->create('dup.pdf', 100, 'application/pdf')],
            ],
        ])->assertSessionHasErrors('verification');

        // Seller rejects attempt 1 (requires reason)
        $this->actingAs($seller)
            ->post('/seller/clients/'.$buyer->id.'/verification/reject', ['rejection_reason' => ''])
            ->assertSessionHasErrors('rejection_reason');

        $this->actingAs($seller)
            ->post('/seller/clients/'.$buyer->id.'/verification/reject', ['rejection_reason' => 'Scan NPWP terpotong dan buram.'])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('seller.clients.index'));

        $this->assertSame(User::VERIFICATION_REJECTED, $buyer->fresh()->verification_status);

        // Attempt 2: Buyer resubmits after rejection
        $this->actingAs($buyer)->post('/buyer/verification', [
            'notes' => 'Upload ulang dokumen lebih jelas',
            'documents' => [
                ['document_type' => 'npwp', 'file' => UploadedFile::fake()->create('npwp-v2.pdf', 250, 'application/pdf')],
                ['document_type' => 'surat_tugas', 'file' => UploadedFile::fake()->createWithContent(
                    'surat-tugas.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6N1sAAAAASUVORK5CYII='),
                )],
            ],
        ])->assertSessionHasNoErrors();

        $this->assertSame(User::VERIFICATION_PENDING, $buyer->fresh()->verification_status);
        $this->assertSame(2, $buyer->verifications()->first()->attempt_number);

        // Seller can reject resubmission too
        $this->actingAs($seller)
            ->post('/seller/clients/'.$buyer->id.'/verification/reject', ['rejection_reason' => 'Surat tugas belum bertanda tangan.'])
            ->assertSessionHasNoErrors();

        $this->assertSame(User::VERIFICATION_REJECTED, $buyer->fresh()->verification_status);

        // Attempt 3: Buyer resubmits again and Seller approves
        $this->actingAs($buyer)->post('/buyer/verification', [
            'documents' => [
                ['document_type' => 'surat_tugas', 'file' => UploadedFile::fake()->create('surat-tugas-signed.pdf', 300, 'application/pdf')],
            ],
        ])->assertSessionHasNoErrors();

        $this->actingAs($seller)
            ->post('/seller/clients/'.$buyer->id.'/verification/approve')
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('seller.clients.index'));

        $buyer->refresh();
        $this->assertSame(User::VERIFICATION_VERIFIED, $buyer->verification_status);
        $this->assertNotNull($buyer->verified_at);
        $this->assertTrue($buyer->isVerifiedBuyer());
        $this->assertSame(3, $buyer->verifications()->count());
        $this->assertSame(BuyerVerification::STATUS_APPROVED, $buyer->latestVerification->status);

        // Verified buyer cannot re-submit verification
        $this->actingAs($buyer)->post('/buyer/verification', [
            'documents' => [
                ['document_type' => 'npwp', 'file' => UploadedFile::fake()->create('again.pdf', 100, 'application/pdf')],
            ],
        ])->assertSessionHasErrors('verification');
    }

    public function test_verification_documents_are_private_and_enforced_by_ownership(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create();
        $otherBuyer = User::factory()->create();
        $seller = User::factory()->seller()->create();

        $this->actingAs($owner)->post('/buyer/verification', [
            'documents' => [
                ['document_type' => 'npwp', 'file' => UploadedFile::fake()->create('secret-npwp.pdf', 120, 'application/pdf')],
            ],
        ])->assertSessionHasNoErrors();

        $document = BuyerVerificationDocument::query()->sole();
        Storage::disk('local')->assertExists($document->file_path);

        // Guest redirected
        $this->post('/logout');
        $this->get('/buyer/verification/documents/'.$document->id)->assertRedirect(route('login'));
        $this->get('/seller/clients/verification-documents/'.$document->id)->assertRedirect(route('login'));

        // Other buyer gets 403
        $this->actingAs($otherBuyer)->get('/buyer/verification/documents/'.$document->id)->assertForbidden();
        $this->actingAs($otherBuyer)->get('/seller/clients/verification-documents/'.$document->id)->assertForbidden();

        // Owner & Seller can download
        $this->actingAs($owner)->get('/buyer/verification/documents/'.$document->id)->assertOk();
        $this->actingAs($seller)->get('/seller/clients/verification-documents/'.$document->id)->assertOk();
    }

    public function test_invalid_verification_files_and_db_failures_leave_no_orphan_files(): void
    {
        Storage::fake('local');
        $buyer = User::factory()->create();

        $this->actingAs($buyer)->post('/buyer/verification', [
            'documents' => [
                ['document_type' => 'npwp', 'file' => UploadedFile::fake()->create('oversized.pdf', 5121, 'application/pdf')],
                ['document_type' => 'other', 'file' => UploadedFile::fake()->create('malware.php', 10, 'text/plain')],
            ],
        ])->assertSessionHasErrors(['documents.0.file', 'documents.1.file']);

        $this->assertDatabaseCount('buyer_verifications', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());

        BuyerVerificationDocument::creating(function (): void {
            throw new RuntimeException('Document DB failure');
        });
        $this->withoutExceptionHandling();

        try {
            $this->actingAs($buyer)->post('/buyer/verification', [
                'documents' => [
                    ['document_type' => 'npwp', 'file' => UploadedFile::fake()->create('npwp.pdf', 100, 'application/pdf')],
                ],
            ]);
            $this->fail('Expected database failure.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Document DB failure', $exception->getMessage());
        } finally {
            BuyerVerificationDocument::flushEventListeners();
        }

        $this->assertDatabaseCount('buyer_verifications', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_deactivating_buyer_blocks_login_and_immediately_revokes_active_session(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();

        // Seller deactivates buyer
        $this->actingAs($seller)
            ->patch('/seller/clients/'.$buyer->id.'/active', ['is_active' => false])
            ->assertRedirect(route('seller.clients.index'));

        $this->assertFalse($buyer->fresh()->is_active);
        $this->assertFalse($buyer->fresh()->isVerifiedBuyer());

        // Active session is revoked immediately on next request
        $this->actingAs($buyer->fresh())
            ->get('/portal')
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
        $this->assertGuest();

        // Cannot log back in while inactive
        $this->post('/login', [
            'email' => $buyer->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');
        $this->assertGuest();

        // Seller reactivates buyer -> login works again
        $this->actingAs($seller)
            ->patch('/seller/clients/'.$buyer->id.'/active', ['is_active' => true])
            ->assertRedirect(route('seller.clients.index'));

        $this->post('/logout');
        $this->post('/login', [
            'email' => $buyer->email,
            'password' => 'password',
        ])->assertSessionHasNoErrors()->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_buyer_cannot_call_seller_client_endpoints_and_seller_cannot_target_seller(): void
    {
        $buyer = User::factory()->create();
        $otherSeller = User::factory()->seller()->create();
        $seller = User::factory()->seller()->create();

        $this->actingAs($buyer)->post('/seller/clients/'.$buyer->id.'/verification/approve')->assertForbidden();
        $this->actingAs($buyer)->post('/seller/clients/'.$buyer->id.'/verification/reject', ['rejection_reason' => 'Alasan tidak sah'])->assertForbidden();
        $this->actingAs($buyer)->patch('/seller/clients/'.$buyer->id.'/active', ['is_active' => false])->assertForbidden();

        $this->actingAs($seller)->post('/seller/clients/'.$otherSeller->id.'/verification/approve')->assertNotFound();
        $this->actingAs($seller)->patch('/seller/clients/'.$otherSeller->id.'/active', ['is_active' => false])->assertNotFound();
    }
}
