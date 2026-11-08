<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class PublicCatalogControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_catalog_index_only_includes_active_products_in_active_categories(): void
    {
        $activeCategory = Category::factory()->create(['is_active' => true]);
        $inactiveCategory = Category::factory()->create(['is_active' => false]);

        $visibleProduct = Product::factory()->for($activeCategory)->create(['is_active' => true]);
        Product::factory()->for($activeCategory)->create(['is_active' => false]);
        Product::factory()->for($inactiveCategory)->create(['is_active' => true]);

        $response = $this->get('/katalog');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Catalog/Index')
                ->has('products', 1)
                ->where('products.0.id', $visibleProduct->id)
                ->where('products.0.category.id', $activeCategory->id)
                ->where('pagination.total', 1)
            );
    }

    public function test_catalog_search_matches_product_name_or_sku(): void
    {
        $category = Category::factory()->create();
        $namedProduct = Product::factory()->for($category)->create([
            'name' => 'Enterprise Laptop',
            'sku' => 'SKU-OTHER-1',
        ]);
        $skuProduct = Product::factory()->for($category)->create([
            'name' => 'Office Monitor',
            'sku' => 'SKU-LAPTOP-2',
        ]);
        Product::factory()->for($category)->create([
            'name' => 'Keyboard',
            'sku' => 'SKU-KEYBOARD',
        ]);

        $this->get('/katalog?search=Laptop')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products', 2)
                ->where('products.0.id', $skuProduct->id)
                ->where('products.1.id', $namedProduct->id)
            );
    }

    public function test_catalog_filters_by_category_and_type(): void
    {
        $category = Category::factory()->create();
        $otherCategory = Category::factory()->create();
        $matchingProduct = Product::factory()->for($category)->create(['type' => 'service']);
        Product::factory()->for($category)->create(['type' => 'goods']);
        Product::factory()->for($otherCategory)->create(['type' => 'service']);

        $this->get('/katalog?category_id='.$category->id.'&type=service')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products', 1)
                ->where('products.0.id', $matchingProduct->id)
                ->where('filters.category_id', $category->id)
                ->where('filters.type', 'service')
            );
    }

    public function test_catalog_index_paginates_results(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(13)->for($category)->create();

        $this->get('/katalog?per_page=5&page=2')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products', 5)
                ->where('pagination.current_page', 2)
                ->where('pagination.per_page', 5)
                ->where('pagination.total', 13)
                ->where('paginationLinks.previous', fn ($url) => str_contains($url, 'page=1'))
                ->where('paginationLinks.next', fn ($url) => str_contains($url, 'page=3'))
            );
    }

    public function test_active_product_detail_is_rendered_with_category_and_image_metadata(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['is_active' => true]);
        $image = ProductImage::factory()->for($product)->create([
            'path' => 'products/example.jpg',
            'alt_text' => 'Product photo',
            'sort_order' => 1,
        ]);

        $this->get('/katalog/'.$product->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Catalog/Show')
                ->where('product.id', $product->id)
                ->where('product.category.id', $category->id)
                ->where('product.images.0.id', $image->id)
                ->where('product.images.0.path', 'products/example.jpg')
            );
    }

    public function test_inactive_product_and_product_in_inactive_category_return_not_found(): void
    {
        $activeCategory = Category::factory()->create(['is_active' => true]);
        $inactiveCategory = Category::factory()->create(['is_active' => false]);
        $inactiveProduct = Product::factory()->for($activeCategory)->create(['is_active' => false]);
        $productInInactiveCategory = Product::factory()->for($inactiveCategory)->create(['is_active' => true]);

        $this->get('/katalog/'.$inactiveProduct->id)->assertNotFound();
        $this->get('/katalog/'.$productInInactiveCategory->id)->assertNotFound();
    }

    public function test_catalog_json_response_contains_products_filters_categories_and_pagination(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create();
        $image = ProductImage::factory()->for($product)->create();

        $this->getJson('/katalog?per_page=3')
            ->assertOk()
            ->assertJsonPath('data.0.id', $product->id)
            ->assertJsonPath('data.0.category.id', $category->id)
            ->assertJsonPath('data.0.images.0.id', $image->id)
            ->assertJsonPath('links.first', route('catalog.index', ['per_page' => 3, 'page' => 1]))
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 3)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('filters.type', null)
            ->assertJsonPath('categories.0.id', $category->id);
    }

    public function test_product_json_detail_uses_product_envelope(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create();

        $this->getJson('/katalog/'.$product->id)
            ->assertOk()
            ->assertJsonPath('product.id', $product->id)
            ->assertJsonPath('product.category.name', $category->name)
            ->assertJsonStructure([
                'product' => [
                    'id',
                    'category' => ['id', 'name'],
                    'name',
                    'type',
                    'sku',
                    'description',
                    'specifications',
                    'price',
                    'stock_quantity',
                    'stock_unit',
                    'moq',
                    'is_active',
                    'images',
                ],
            ]);
    }
}
