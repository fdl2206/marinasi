<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class SellerCatalogTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{string, string}> */
    public static function mutations(): array
    {
        return [
            'create product' => ['post', '/seller/products'],
            'update product' => ['put', '/seller/products/1'],
            'delete product' => ['delete', '/seller/products/1'],
            'create category' => ['post', '/seller/categories'],
            'update category' => ['patch', '/seller/categories/1'],
            'delete category' => ['delete', '/seller/categories/1'],
            'delete image' => ['delete', '/seller/products/1/images/1'],
        ];
    }

    #[DataProvider('mutations')]
    public function test_guest_cannot_mutate_catalog(string $method, string $url): void
    {
        $this->{$method}($url)->assertRedirect(route('login'));
        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('categories', 0);
    }

    #[DataProvider('mutations')]
    public function test_buyer_cannot_mutate_catalog(string $method, string $url): void
    {
        $product = Product::factory()->create(['id' => 1]);
        ProductImage::factory()->for($product)->create(['id' => 1]);
        $this->actingAs(User::factory()->create());

        $this->{$method}($url)->assertForbidden();

        $this->assertDatabaseCount('products', 1);
        $this->assertDatabaseCount('categories', 1);
        $this->assertDatabaseCount('product_images', 1);
    }

    public function test_seller_can_manage_categories_and_used_category_cannot_be_deleted(): void
    {
        $this->actingAs(User::factory()->seller()->create());
        $this->post('/seller/categories', ['name' => 'Perangkat', 'is_active' => true])
            ->assertRedirect(route('seller.catalog.index'));
        $category = Category::query()->sole();
        $this->patch('/seller/categories/'.$category->id, ['name' => 'Perangkat', 'is_active' => false])
            ->assertSessionHasNoErrors();
        $this->assertFalse($category->fresh()->is_active);

        $product = Product::factory()->for($category)->create();
        $this->delete('/seller/categories/'.$category->id)->assertSessionHasErrors('category');
        $this->assertModelExists($category);

        $product->delete();
        $this->delete('/seller/categories/'.$category->id)->assertRedirect(route('seller.catalog.index'));
        $this->assertModelMissing($category);
    }

    public function test_duplicate_category_name_is_rejected(): void
    {
        Category::factory()->create(['name' => 'Perangkat']);
        $this->actingAs(User::factory()->seller()->create())
            ->post('/seller/categories', ['name' => 'Perangkat'])
            ->assertSessionHasErrors('name');
        $this->assertDatabaseCount('categories', 1);
    }

    public function test_seller_can_create_and_update_product_with_images_and_specs(): void
    {
        Storage::fake('public');
        $category = Category::factory()->create();
        $this->actingAs(User::factory()->seller()->create());
        $data = [
            'category_id' => $category->id, 'name' => 'SSD', 'type' => 'goods', 'sku' => 'SSD-1',
            'price' => '450000.00', 'stock_quantity' => '2.500', 'stock_unit' => 'unit',
            'specifications' => ['kapasitas' => '256 GB'], 'is_active' => true,
            'images' => [$this->image()->size(5120)],
        ];
        $this->post('/seller/products', $data)->assertSessionHasNoErrors()
            ->assertRedirect(route('seller.catalog.index'));

        $product = Product::query()->sole();
        $this->assertSame(['kapasitas' => '256 GB'], $product->specifications);
        $this->assertSame('450000.00', $product->price);
        $this->assertSame('2.500', $product->stock_quantity);
        $firstImage = $product->images()->sole();
        Storage::disk('public')->assertExists($firstImage->path);
        $this->getJson('/katalog/'.$product->id)->assertOk()
            ->assertJsonPath('product.images.0.url', Storage::disk('public')->url($firstImage->path));

        $data['name'] = 'SSD Baru';
        $data['images'] = [$this->image()];
        $this->post('/seller/products/'.$product->id, ['_method' => 'put', ...$data])
            ->assertSessionHasNoErrors();
        $this->assertSame('SSD Baru', $product->fresh()->name);
        $this->assertSame([1, 2], $product->images()->pluck('sort_order')->all());

        $this->delete('/seller/products/'.$product->id)->assertRedirect(route('seller.catalog.index'));
        $this->assertModelMissing($product);
        $this->assertDatabaseCount('product_images', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_service_allows_nullable_price_and_stock(): void
    {
        $this->actingAs(User::factory()->seller()->create())
            ->post('/seller/products', [
                'category_id' => Category::factory()->create()->id,
                'name' => 'Maintenance', 'type' => 'service', 'price' => null, 'stock_quantity' => null,
            ])->assertSessionHasNoErrors();

        $product = Product::query()->sole();
        $this->assertNull($product->price);
        $this->assertNull($product->stock_quantity);
        $this->assertSame('service', $product->type);
    }

    public function test_invalid_product_and_inactive_category_are_rejected(): void
    {
        $category = Category::factory()->create(['is_active' => false]);
        $this->actingAs(User::factory()->seller()->create())
            ->post('/seller/products', [
                'category_id' => $category->id, 'name' => '', 'type' => 'invalid',
                'price' => -1, 'stock_quantity' => -1, 'moq' => 0,
            ])->assertSessionHasErrors(['category_id', 'name', 'type', 'price', 'stock_quantity', 'moq']);
        $this->assertDatabaseCount('products', 0);
    }

    public function test_update_accepts_existing_inactive_category_but_not_another_inactive_category(): void
    {
        $product = Product::factory()->create(['sku' => 'KEEP-SKU']);
        $product->category->update(['is_active' => false]);
        $this->actingAs(User::factory()->seller()->create());
        $data = ['category_id' => $product->category_id, 'name' => 'Updated', 'type' => 'goods', 'sku' => 'KEEP-SKU'];
        $this->put('/seller/products/'.$product->id, $data)->assertSessionHasNoErrors();
        $data['category_id'] = Category::factory()->create(['is_active' => false])->id;
        $this->put('/seller/products/'.$product->id, $data)->assertSessionHasErrors('category_id');
        $this->assertSame($product->category_id, $product->fresh()->category_id);
    }

    public function test_update_rejects_another_products_sku(): void
    {
        Product::factory()->create(['sku' => 'TAKEN']);
        $product = Product::factory()->create();
        $this->actingAs(User::factory()->seller()->create())
            ->put('/seller/products/'.$product->id, [
                'category_id' => $product->category_id, 'name' => 'Updated', 'type' => 'goods', 'sku' => 'TAKEN',
            ])->assertSessionHasErrors('sku');
        $this->assertNotSame('TAKEN', $product->fresh()->sku);
    }

    public function test_values_exceeding_column_capacity_or_precision_are_rejected(): void
    {
        $this->actingAs(User::factory()->seller()->create())
            ->post('/seller/products', [
                'category_id' => Category::factory()->create()->id,
                'name' => 'Invalid amounts', 'type' => 'goods',
                'price' => '1.001', 'stock_quantity' => '1000000000', 'moq' => '4294967296',
            ])->assertSessionHasErrors(['price', 'stock_quantity', 'moq']);

        $this->assertDatabaseCount('products', 0);
    }

    public function test_oversized_and_non_image_uploads_leave_no_product_or_files(): void
    {
        Storage::fake('public');
        $category = Category::factory()->create();
        $this->actingAs(User::factory()->seller()->create())
            ->post('/seller/products', [
                'category_id' => $category->id, 'name' => 'SSD', 'type' => 'goods',
                'images' => [$this->image()->size(5121), UploadedFile::fake()->create('script.php', 1, 'text/plain')],
            ])->assertSessionHasErrors(['images.0', 'images.1']);
        $this->assertDatabaseCount('products', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_image_deletion_is_scoped_to_its_product(): void
    {
        Storage::fake('public');
        $product = Product::factory()->create();
        $other = Product::factory()->create();
        $image = ProductImage::factory()->for($product)->create(['path' => 'products/photo.png']);
        Storage::disk('public')->put($image->path, 'image');
        $this->actingAs(User::factory()->seller()->create());

        $this->delete('/seller/products/'.$other->id.'/images/'.$image->id)->assertNotFound();
        $this->assertModelExists($image);
        Storage::disk('public')->assertExists($image->path);

        $this->delete('/seller/products/'.$product->id.'/images/'.$image->id)
            ->assertRedirect(route('seller.catalog.index'));
        $this->assertModelMissing($image);
        Storage::disk('public')->assertMissing($image->path);
    }

    public function test_database_failure_cleans_new_uploads_and_rolls_back_product(): void
    {
        Storage::fake('public');
        $category = Category::factory()->create();
        $this->actingAs(User::factory()->seller()->create());
        ProductImage::creating(function (): void {
            throw new RuntimeException('Metadata failure');
        });
        $this->withoutExceptionHandling();

        try {
            $this->post('/seller/products', [
                'category_id' => $category->id, 'name' => 'SSD', 'type' => 'goods',
                'images' => [$this->image()],
            ]);
            $this->fail('Expected metadata failure.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Metadata failure', $exception->getMessage());
        } finally {
            ProductImage::flushEventListeners();
        }

        $this->assertDatabaseCount('products', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_seller_sees_inactive_products_and_public_visibility_follows_updates(): void
    {
        $product = Product::factory()->create();
        $this->actingAs(User::factory()->seller()->create());
        $this->put('/seller/products/'.$product->id, [
            'category_id' => $product->category_id, 'name' => 'Hidden SSD', 'type' => 'goods', 'is_active' => false,
        ])->assertSessionHasNoErrors();
        $this->get('/seller/catalog?search=Hidden')->assertOk()
            ->assertInertia(fn ($page) => $page->has('products.data', 1)->where('products.data.0.name', 'Hidden SSD'));
        $this->get('/katalog/'.$product->id)->assertNotFound();
    }

    public function test_public_catalog_data_is_available_for_frontend_integration(): void
    {
        $product = Product::factory()->create();
        $this->actingAs(User::factory()->create());
        $this->getJson('/katalog')->assertOk()->assertJsonPath('data.0.id', $product->id);
        $this->getJson('/katalog/'.$product->id)->assertOk()->assertJsonPath('product.id', $product->id);
    }

    private function image(): File
    {
        return UploadedFile::fake()->createWithContent('photo.png', base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6N1sAAAAASUVORK5CYII=',
        ));
    }
}
