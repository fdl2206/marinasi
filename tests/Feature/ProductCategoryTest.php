<?php

namespace Tests\Feature;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\StoreProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ProductCategoryTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_product_category_and_images_persist_with_expected_relationships(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create([
            'specifications' => ['capacity' => '256 GB'],
        ]);

        $laterImage = ProductImage::factory()->for($product)->create(['sort_order' => 2]);
        $firstImage = ProductImage::factory()->for($product)->create(['sort_order' => 1]);

        $product = Product::with(['category', 'images'])->findOrFail($product->id);

        $this->assertSame($category->id, $product->category->id);
        $this->assertSame(['capacity' => '256 GB'], $product->specifications);
        $this->assertSame([$firstImage->id, $laterImage->id], $product->images->pluck('id')->all());
        $this->assertSame($product->id, $firstImage->product->id);
        $this->assertCount(1, $category->products);
    }

    public function test_category_request_requires_a_unique_name(): void
    {
        Category::factory()->create(['name' => 'Perangkat IT']);

        $validator = Validator::make(
            ['name' => 'Perangkat IT'],
            (new StoreCategoryRequest)->rules(),
        );

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('name', $validator->errors()->toArray());
    }

    public function test_product_request_accepts_goods_and_nullable_price_and_stock(): void
    {
        $category = Category::factory()->create();

        $validator = Validator::make(
            [
                'category_id' => $category->id,
                'name' => 'SSD SATA 256 GB',
                'type' => 'goods',
                'price' => null,
                'stock_quantity' => null,
                'specifications' => ['capacity' => '256 GB'],
            ],
            (new StoreProductRequest)->rules(),
        );

        $this->assertFalse($validator->fails(), $validator->errors()->toJson());
    }

    public function test_product_request_rejects_unknown_type_and_negative_price(): void
    {
        $category = Category::factory()->create();

        $validator = Validator::make(
            [
                'category_id' => $category->id,
                'name' => 'Test Product',
                'type' => 'other',
                'price' => -1,
            ],
            (new StoreProductRequest)->rules(),
        );

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('type', $validator->errors()->toArray());
        $this->assertArrayHasKey('price', $validator->errors()->toArray());
    }
}
