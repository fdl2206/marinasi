<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }

    public function test_seller_account_cannot_be_deleted_via_profile_endpoint(): void
    {
        $seller = User::factory()->seller()->create();

        $this->actingAs($seller)
            ->delete('/profile', ['password' => 'password'])
            ->assertForbidden();

        $this->assertAuthenticatedAs($seller);
        $this->assertModelExists($seller);
    }

    public function test_inertia_shared_auth_user_exposes_only_safe_fields(): void
    {
        $buyer = User::factory()->create([
            'phone' => '08123456789',
            'company_name' => 'Instansi Contoh',
        ]);

        $this->actingAs($buyer)
            ->get('/profile')
            ->assertInertia(fn ($page) => $page
                ->where('auth.user.id', $buyer->id)
                ->where('auth.user.email', $buyer->email)
                ->where('auth.user.phone', '08123456789')
                ->where('auth.user.company_name', 'Instansi Contoh')
                ->missing('auth.user.password')
                ->missing('auth.user.remember_token')
                ->missing('auth.user.created_at')
                ->missing('auth.user.updated_at'));
    }
}
