<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Database\Seeders\XlsxCatalogSampleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyerCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_selected_xlsx_samples_are_repeatable_and_preserve_manual_changes(): void
    {
        $this->seed(XlsxCatalogSampleSeeder::class);
        $product = Product::query()->where('name', 'SSD V-GeN 256GB')->sole();
        $this->assertSame('450000.00', $product->price);
        $this->assertNull($product->stock_quantity);
        $product->update(['price' => 460000, 'is_active' => false]);
        $this->seed(XlsxCatalogSampleSeeder::class);

        $this->assertDatabaseCount('products', 5);
        $this->assertDatabaseCount('categories', 3);
        $this->assertSame('460000.00', $product->fresh()->price);
        $this->assertFalse($product->fresh()->is_active);
        $this->assertSame(5, Product::query()->whereNull('stock_quantity')->count());
        $this->assertSame(5, Product::query()->whereNull('sku')->count());
        $this->assertDatabaseCount('product_images', 0);
    }

    public function test_portal_receives_active_catalog_with_unknown_stock_and_original_price(): void
    {
        $this->seed(XlsxCatalogSampleSeeder::class);
        Product::factory()->create(['is_active' => false]);
        Product::factory()->for(Category::factory()->create(['is_active' => false]))->create();
        $this->actingAs(User::factory()->create());

        $this->get('/portal?search=SSD%20V-GeN%20256GB')->assertInertia(fn ($page) => $page
            ->component('Buyer/Home')->has('products', 1)
            ->where('products.0.name', 'SSD V-GeN 256GB')
            ->where('products.0.price', '450000.00')
            ->where('products.0.stock', null)
            ->where('products.0.stock_status', 'unknown')
            ->where('products.0.image_url', null)
            ->where('products.0.cart_enabled', false)
            ->where('pagination.total', 1));
    }

    public function test_empty_catalog_and_no_matches_return_empty_products(): void
    {
        $this->actingAs(User::factory()->create());
        $this->get('/portal')->assertInertia(fn ($page) => $page->where('products', [])->where('categories', []));
        Product::factory()->create(['name' => 'SSD', 'sku' => 'SSD-1']);
        $this->get('/portal?search=unmatched')->assertInertia(fn ($page) => $page->where('products', []));
    }

    public function test_search_by_sku_and_category_uses_database(): void
    {
        $product = Product::factory()->create(['sku' => 'SKU-TEST']);
        Product::factory()->create(['name' => 'Other', 'sku' => 'OTHER']);
        $this->actingAs(User::factory()->create())
            ->get('/portal?search=SKU-TEST&kategori='.$product->category_id)
            ->assertInertia(fn ($page) => $page->has('products', 1)->where('products.0.id', $product->id));

        $this->get('/portal?kategori=invalid')->assertSessionHasErrors('kategori');
        $this->get('/portal?sort=invalid')->assertSessionHasErrors('sort');
    }

    public function test_price_sorting_keeps_unknown_prices_last_and_ready_stock_excludes_unknown(): void
    {
        $cheap = Product::factory()->create(['price' => 0, 'stock_quantity' => 2]);
        $expensive = Product::factory()->create(['price' => 100, 'stock_quantity' => 0]);
        $unknown = Product::factory()->create(['price' => null, 'stock_quantity' => null]);
        $this->actingAs(User::factory()->create());
        $this->get('/portal?sort=price_asc')->assertInertia(fn ($page) => $page
            ->where('products.0.id', $cheap->id)->where('products.1.id', $expensive->id)->where('products.2.id', $unknown->id));
        $this->get('/portal?sort=price_desc')->assertInertia(fn ($page) => $page
            ->where('products.0.id', $expensive->id)->where('products.2.id', $unknown->id));
        $this->get('/portal?sort=ready_stock')->assertInertia(fn ($page) => $page
            ->has('products', 1)->where('products.0.id', $cheap->id));
    }

    public function test_pagination_preserves_filters_and_returns_the_next_page(): void
    {
        Product::factory()->count(13)->create(['name' => 'Sample SSD']);
        $this->actingAs(User::factory()->create());
        $this->get('/portal?search=Sample&sort=newest')->assertInertia(fn ($page) => $page
            ->has('products', 12)->where('pagination.total', 13)
            ->where('paginationLinks.next', route('buyer.home', ['search' => 'Sample', 'sort' => 'newest', 'page' => 2])));
        $this->get('/portal?search=Sample&page=2')->assertInertia(fn ($page) => $page->has('products', 1)->where('pagination.current_page', 2));
    }

    public function test_detail_maps_images_specs_and_related_products_without_invented_prices(): void
    {
        $product = Product::factory()->create(['price' => null, 'stock_quantity' => null, 'specifications' => ['kapasitas' => '256 GB']]);
        ProductImage::factory()->for($product)->create(['path' => 'products/photo.png']);
        $related = Product::factory()->for($product->category)->create();
        Product::factory()->for($product->category)->create(['is_active' => false]);
        Product::factory()->create();
        $this->actingAs(User::factory()->create())->get('/buyer/products/'.$product->id)
            ->assertInertia(fn ($page) => $page->component('Buyer/Products/Show')
                ->where('product.id', $product->id)
                ->where('product.base_price', null)
                ->where('product.stock', null)
                ->where('product.specifications.0.label', 'kapasitas')
                ->where('product.specifications.0.value', '256 GB')
                ->has('product.images', 1)
                ->where('product.tier_prices', [])
                ->missing('product.installation_price')
                ->missing('product.tax_badge')
                ->has('related_products', 1)->where('related_products.0.id', $related->id));
    }

    public function test_product_without_images_specs_or_related_items_has_no_fallback_data(): void
    {
        $product = Product::factory()->create(['specifications' => null]);
        $this->actingAs(User::factory()->create())->get('/buyer/products/'.$product->id)
            ->assertInertia(fn ($page) => $page->where('product.images', [])
                ->where('product.specifications', [])->where('related_products', []));
    }

    public function test_missing_or_inactive_product_and_inactive_category_return_404(): void
    {
        $inactive = Product::factory()->create(['is_active' => false]);
        $hidden = Product::factory()->for(Category::factory()->create(['is_active' => false]))->create();
        $this->actingAs(User::factory()->create());
        $this->get('/buyer/products/999999')->assertNotFound();
        $this->get('/buyer/products/'.$inactive->id)->assertNotFound();
        $this->get('/buyer/products/'.$hidden->id)->assertNotFound();
    }
}
