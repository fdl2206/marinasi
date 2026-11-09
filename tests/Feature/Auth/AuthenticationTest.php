<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_selecting_seller_portal_still_enters_buyer_dashboard(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'portal' => 'seller',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->get('/dashboard')->assertRedirect(route('buyer.dashboard'));
        $this->get('/seller/dashboard')->assertForbidden();
    }

    public function test_seller_selecting_buyer_portal_still_enters_seller_dashboard(): void
    {
        $seller = User::factory()->seller()->create();

        $this->post('/login', [
            'email' => $seller->email,
            'password' => 'password',
            'portal' => 'buyer',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->get('/dashboard')->assertRedirect(route('seller.dashboard'));
    }

    public function test_intended_seller_url_does_not_bypass_buyer_authorization(): void
    {
        $buyer = User::factory()->create();
        $this->get('/seller/orders')->assertRedirect(route('login'));

        $this->post('/login', [
            'email' => $buyer->email,
            'password' => 'password',
        ])->assertRedirect('/seller/orders');

        $this->get('/seller/orders')->assertForbidden();
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
