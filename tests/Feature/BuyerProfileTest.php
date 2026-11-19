<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyerProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_contains_only_current_buyers_data_and_no_sample_contacts(): void
    {
        $buyer = User::factory()->create([
            'phone' => '08123456789', 'company_name' => 'CV Pembeli', 'company_address' => 'Alamat Pembeli',
        ]);
        $other = User::factory()->create(['company_name' => 'CV Lain']);
        $this->actingAs($buyer)->get('/buyer/profile?user_id='.$other->id)
            ->assertInertia(fn ($page) => $page->component('Buyer/Profile/Index')
                ->where('profile.email', $buyer->email)
                ->where('profile.phone', '08123456789')
                ->where('companyProfile.company_name', 'CV Pembeli')
                ->where('companyProfile.tax_status', '')
                ->where('companyProfile.top_status', '')
                ->where('pics', [])
                ->where('addresses', []));
        $this->getJson('/buyer/profile')->assertOk()
            ->assertJsonPath('profile.company_address', 'Alamat Pembeli')
            ->assertJsonMissingPath('profile.password');
    }

    public function test_profile_of_account_without_contact_data_uses_empty_values(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/buyer/profile')
            ->assertOk()->assertJsonPath('profile.phone', null)
            ->assertJsonPath('companyProfile.company_name', '')
            ->assertJsonPath('companyProfile.npwp_number', '')
            ->assertJsonPath('pics', [])->assertJsonPath('addresses', []);
    }

    public function test_buyer_can_update_only_own_contact_details(): void
    {
        $buyer = User::factory()->create(['phone' => '081111']);
        $other = User::factory()->create(['company_name' => 'Original']);

        $this->actingAs($buyer)->patch('/buyer/profile', [
            'phone' => '082222',
            'company_name' => 'CV Baru',
            'company_address' => 'Alamat Baru',
            'user_id' => $other->id,
            'is_seller' => true,
            'tax_status' => 'Verified',
            'top_status' => 'Approved',
            'password' => 'new-password',
        ])->assertSessionHasNoErrors()->assertRedirect(route('buyer.profile.index'));

        $this->assertDatabaseHas('users', [
            'id' => $buyer->id, 'phone' => '082222', 'company_name' => 'CV Baru',
            'company_address' => 'Alamat Baru', 'is_seller' => false,
        ]);
        $this->assertSame('Original', $other->fresh()->company_name);
        $this->assertSame($buyer->password, $buyer->fresh()->password);
        $this->getJson('/buyer/profile')->assertJsonPath('companyProfile.tax_status', '');
    }

    public function test_partial_update_preserves_omitted_details_and_accepts_explicit_clear(): void
    {
        $buyer = User::factory()->create(['phone' => '081111', 'company_name' => 'CV Tetap']);
        $this->actingAs($buyer)->patch('/buyer/profile', ['phone' => ''])
            ->assertSessionHasNoErrors()->assertRedirect(route('buyer.profile.index'));

        $this->assertNull($buyer->fresh()->phone);
        $this->assertSame('CV Tetap', $buyer->fresh()->company_name);
    }

    public function test_invalid_contact_update_leaves_saved_details_unchanged(): void
    {
        $buyer = User::factory()->create(['phone' => '081111']);
        $this->actingAs($buyer)->patch('/buyer/profile', [
            'phone' => str_repeat('1', 51),
            'company_name' => ['invalid'],
            'company_address' => str_repeat('a', 2001),
        ])->assertSessionHasErrors(['phone', 'company_name', 'company_address']);

        $this->assertSame('081111', $buyer->fresh()->phone);
    }

    public function test_guest_and_seller_cannot_update_buyer_profile(): void
    {
        $this->patch('/buyer/profile', ['phone' => '081111'])->assertRedirect(route('login'));
        $seller = User::factory()->seller()->create();
        $this->actingAs($seller)->patch('/buyer/profile', ['phone' => '081111'])->assertForbidden();
        $this->assertNull($seller->fresh()->phone);
    }

    public function test_standard_profile_endpoint_also_persists_contact_fields(): void
    {
        $buyer = User::factory()->create();
        $this->actingAs($buyer)->patch('/profile', [
            'name' => $buyer->name, 'email' => $buyer->email,
            'phone' => '081234', 'company_name' => 'CV Profil', 'company_address' => 'Alamat',
        ])->assertSessionHasNoErrors()->assertRedirect(route('profile.edit'));

        $this->assertSame('CV Profil', $buyer->fresh()->company_name);
        $this->assertNotNull($buyer->fresh()->email_verified_at);
    }

    public function test_contact_migration_preserves_existing_account(): void
    {
        $migration = require database_path('migrations/2026_11_09_100037_add_contact_details_to_users_table.php');
        $migration->down();
        $buyer = User::factory()->create(['email' => 'existing@example.com']);
        $migration->up();

        $this->assertSame('existing@example.com', $buyer->fresh()->email);
        $this->assertSame($buyer->password, $buyer->fresh()->password);
        $this->assertFalse($buyer->fresh()->is_seller);
        $this->assertNull($buyer->fresh()->phone);
        $this->assertNull($buyer->fresh()->company_name);
        $this->assertNull($buyer->fresh()->company_address);
    }
}
