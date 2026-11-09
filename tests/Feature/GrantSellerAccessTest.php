<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GrantSellerAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_existing_account_can_receive_seller_access_repeatedly(): void
    {
        $buyer = User::factory()->create();

        $this->artisan('users:grant-seller', ['email' => $buyer->email])->assertSuccessful();
        $this->artisan('users:grant-seller', ['email' => $buyer->email])->assertSuccessful();

        $this->assertTrue($buyer->fresh()->is_seller);
        $this->assertDatabaseCount('users', 1);
        $this->actingAs($buyer->fresh())->get('/seller/dashboard')->assertOk();
    }

    public function test_unknown_account_is_rejected_without_creating_a_user(): void
    {
        $this->artisan('users:grant-seller', ['email' => 'missing@example.com'])
            ->expectsOutputToContain('Akun tidak ditemukan.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }
}
