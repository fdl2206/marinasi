<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_cannot_grant_seller_or_admin_access(): void
    {
        $this->post('/register', [
            'name' => 'Buyer',
            'email' => 'buyer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'is_seller' => true,
            'role' => 'admin',
            'portal' => 'seller',
        ])->assertRedirect(route('dashboard', absolute: false));

        $buyer = User::query()->where('email', 'buyer@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($buyer);
        $this->assertFalse($buyer->is_seller);
        $this->get('/seller/dashboard')->assertForbidden();
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registration_persists_contact_details_from_existing_form(): void
    {
        $this->post('/register', [
            'name' => 'Buyer',
            'email' => 'contact@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'phone' => '+62 812-3456-7890',
            'company_name' => 'CV Contoh',
            'company_address' => 'Jalan Contoh 10',
        ])->assertSessionHasNoErrors()->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('users', [
            'email' => 'contact@example.com',
            'phone' => '+62 812-3456-7890',
            'company_name' => 'CV Contoh',
            'company_address' => 'Jalan Contoh 10',
            'is_seller' => false,
        ]);
    }

    public function test_registration_rejects_invalid_contact_details_without_creating_account(): void
    {
        $this->post('/register', [
            'name' => 'Buyer',
            'email' => 'invalid@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'phone' => ['invalid'],
            'company_name' => str_repeat('a', 256),
            'company_address' => str_repeat('a', 2001),
        ])->assertSessionHasErrors(['phone', 'company_name', 'company_address']);

        $this->assertDatabaseCount('users', 0);
    }
}
