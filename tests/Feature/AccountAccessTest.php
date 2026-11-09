<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AccountAccessTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{string}> */
    public static function sellerPages(): array
    {
        return [
            'dashboard' => ['/seller/dashboard'],
            'catalog' => ['/seller/catalog'],
            'negotiations' => ['/seller/negotiations'],
            'orders' => ['/seller/orders'],
            'legality' => ['/seller/legality'],
            'services' => ['/seller/services'],
            'clients' => ['/seller/clients'],
            'settings' => ['/seller/settings'],
            'admin' => ['/admin'],
            'admin dashboard' => ['/admin/dashboard'],
            'admin orders' => ['/admin/orders'],
        ];
    }

    /** @return array<string, array{string}> */
    public static function buyerPages(): array
    {
        return [
            'portal' => ['/portal'],
            'dashboard' => ['/buyer/dashboard'],
            'quotations' => ['/buyer/quotations'],
            'rfq' => ['/buyer/rfq/create'],
            'orders' => ['/buyer/orders'],
            'cart' => ['/buyer/cart'],
            'checkout' => ['/buyer/checkout'],
            'invoices' => ['/buyer/invoices'],
            'services' => ['/buyer/services'],
            'profile' => ['/buyer/profile'],
            'product' => ['/buyer/products/1'],
        ];
    }

    /** @return array<string, array{string}> */
    public static function privatePages(): array
    {
        $pages = [];

        foreach ([...array_values(self::sellerPages()), ...array_values(self::buyerPages())] as [$path]) {
            $pages[$path] = [$path];
        }

        return $pages;
    }

    #[DataProvider('privatePages')]
    public function test_guests_are_redirected_to_login_from_private_pages(string $path): void
    {
        $this->get($path)->assertRedirect(route('login'));
    }

    #[DataProvider('sellerPages')]
    public function test_buyers_cannot_open_seller_or_admin_pages(string $path): void
    {
        $this->actingAs(User::factory()->create())->get($path)->assertForbidden();
    }

    #[DataProvider('buyerPages')]
    public function test_sellers_cannot_open_buyer_pages(string $path): void
    {
        if ($path === '/buyer/products/1') {
            $product = Product::factory()->create();
            $path = '/buyer/products/'.$product->id;
        }

        $this->actingAs(User::factory()->seller()->create())->get($path)->assertForbidden();
    }

    #[DataProvider('buyerPages')]
    public function test_buyers_can_open_buyer_pages(string $path): void
    {
        if ($path === '/buyer/products/1') {
            $product = Product::factory()->create();
            $path = '/buyer/products/'.$product->id;
        }

        $this->actingAs(User::factory()->create())->get($path)->assertOk();
    }

    public function test_seller_can_open_internal_pages_and_admin_aliases(): void
    {
        $this->actingAs(User::factory()->seller()->create());

        foreach (['dashboard', 'catalog', 'negotiations', 'orders', 'legality', 'services', 'clients', 'settings'] as $page) {
            $this->get('/seller/'.$page)->assertOk();
        }

        $this->get('/admin')->assertRedirect(route('seller.dashboard'));
        $this->get('/admin/dashboard')->assertRedirect(route('seller.dashboard'));
        $this->get('/admin/orders')->assertRedirect(route('seller.orders.index'));
    }

    public function test_gates_follow_account_access(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->seller()->create();

        $this->assertTrue(Gate::forUser($buyer)->allows('access-buyer'));
        $this->assertFalse(Gate::forUser($buyer)->allows('access-seller'));
        $this->assertTrue(Gate::forUser($seller)->allows('access-seller'));
        $this->assertFalse(Gate::forUser($seller)->allows('access-buyer'));
    }

    public function test_dashboard_and_home_follow_account_access(): void
    {
        $this->actingAs(User::factory()->create());
        $this->get('/dashboard')->assertRedirect(route('buyer.dashboard'));
        $this->get('/')->assertOk();

        $this->actingAs(User::factory()->seller()->create());
        $this->get('/dashboard')->assertRedirect(route('seller.dashboard'));
        $this->get('/')->assertRedirect(route('seller.dashboard'));
    }

    public function test_profile_update_cannot_grant_seller_access(): void
    {
        $buyer = User::factory()->create();

        $this->actingAs($buyer)->patch('/profile', [
            'name' => 'Buyer Name',
            'email' => $buyer->email,
            'is_seller' => true,
            'role' => 'admin',
        ])->assertRedirect('/profile');

        $this->assertFalse($buyer->fresh()->is_seller);
        $this->assertDatabaseHas('users', ['id' => $buyer->id, 'name' => 'Buyer Name']);
        $this->get('/seller/dashboard')->assertForbidden();
    }

    public function test_public_catalog_and_company_profile_remain_accessible(): void
    {
        foreach (['/', '/tentang-kami', '/katalog', '/portofolio', '/testimoni', '/kontak', '/kebijakan-privasi'] as $path) {
            $this->get($path)->assertOk();
        }
    }
}
