<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyerCartTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_add_update_and_delete_cart_items_and_cart_count_is_shared(): void
    {
        $buyer = User::factory()->create();
        $product = Product::factory()->create(['price' => 450000, 'stock_quantity' => 5]);

        $this->actingAs($buyer)
            ->from('/portal')
            ->post('/buyer/cart/items', ['product_id' => $product->id, 'quantity' => 2])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/portal');

        $this->actingAs($buyer)
            ->from('/portal')
            ->post('/buyer/cart/items', ['product_id' => $product->id, 'quantity' => 1])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/portal');

        $cartItem = CartItem::query()->sole();
        $this->assertSame($buyer->id, $cartItem->user_id);
        $this->assertSame(3, $cartItem->quantity);
        $this->assertCount(1, $buyer->cartItems);
        $this->assertCount(1, $product->cartItems);

        $this->actingAs($buyer)
            ->get('/portal')
            ->assertInertia(fn ($page) => $page->where('cartCount', 3));

        $this->actingAs($buyer)
            ->get('/buyer/cart')
            ->assertInertia(fn ($page) => $page
                ->component('Buyer/Cart/Index')
                ->has('cart_items', 1)
                ->where('cart_items.0.quantity', 3)
                ->where('cartCount', 3));

        $this->actingAs($buyer)
            ->patch('/buyer/cart/items/'.$cartItem->id, ['quantity' => 4])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('buyer.cart.index'));

        $this->assertSame(4, $cartItem->fresh()->quantity);

        $this->actingAs($buyer)
            ->delete('/buyer/cart/items/'.$cartItem->id)
            ->assertRedirect(route('buyer.cart.index'));

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_guest_and_seller_cannot_mutate_buyer_cart(): void
    {
        $owner = User::factory()->create();
        $seller = User::factory()->seller()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $cartItem = CartItem::query()->create([
            'user_id' => $owner->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->post('/buyer/cart/items', ['product_id' => $product->id, 'quantity' => 1])
            ->assertRedirect(route('login'));
        $this->patch('/buyer/cart/items/'.$cartItem->id, ['quantity' => 2])
            ->assertRedirect(route('login'));
        $this->delete('/buyer/cart/items/'.$cartItem->id)
            ->assertRedirect(route('login'));

        $this->actingAs($seller)
            ->post('/buyer/cart/items', ['product_id' => $product->id, 'quantity' => 1])
            ->assertForbidden();
        $this->actingAs($seller)
            ->patch('/buyer/cart/items/'.$cartItem->id, ['quantity' => 2])
            ->assertForbidden();
        $this->actingAs($seller)
            ->delete('/buyer/cart/items/'.$cartItem->id)
            ->assertForbidden();

        $this->assertSame(1, $cartItem->fresh()->quantity);
    }

    public function test_buyer_cannot_modify_or_delete_another_buyers_cart_item(): void
    {
        $owner = User::factory()->create();
        $otherBuyer = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $cartItem = CartItem::query()->create([
            'user_id' => $owner->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($otherBuyer)
            ->patch('/buyer/cart/items/'.$cartItem->id, ['quantity' => 2])
            ->assertForbidden();

        $this->actingAs($otherBuyer)
            ->delete('/buyer/cart/items/'.$cartItem->id)
            ->assertForbidden();

        $this->assertSame(1, $cartItem->fresh()->quantity);
    }

    public function test_inactive_out_of_stock_and_fractional_sub_unit_stock_cannot_be_added_to_cart(): void
    {
        $buyer = User::factory()->create();
        $inactiveProduct = Product::factory()->create(['is_active' => false]);
        $inactiveCategoryProduct = Product::factory()->for(Category::factory()->create(['is_active' => false]))->create();
        $outOfStock = Product::factory()->create(['type' => 'goods', 'stock_quantity' => 0]);
        $fractionalBelowOne = Product::factory()->create(['type' => 'goods', 'stock_quantity' => '0.500']);
        $limited = Product::factory()->create(['type' => 'goods', 'stock_quantity' => 2]);

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $inactiveProduct->id, 'quantity' => 1])
            ->assertSessionHasErrors('product_id');

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $inactiveCategoryProduct->id, 'quantity' => 1])
            ->assertSessionHasErrors('product_id');

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $outOfStock->id, 'quantity' => 1])
            ->assertSessionHasErrors('quantity');

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $fractionalBelowOne->id, 'quantity' => 1])
            ->assertSessionHasErrors('quantity');

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $limited->id, 'quantity' => 3])
            ->assertSessionHasErrors('quantity');

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $limited->id, 'quantity' => 1000001])
            ->assertSessionHasErrors('quantity');

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_moq_is_enforced_on_store_and_update_and_exposed_in_cart(): void
    {
        $buyer = User::factory()->create();
        $product = Product::factory()->create(['moq' => 5, 'stock_quantity' => 20]);

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $product->id, 'quantity' => 3])
            ->assertSessionHasErrors('quantity');

        $this->assertDatabaseCount('cart_items', 0);

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $product->id, 'quantity' => 5])
            ->assertSessionHasNoErrors();

        $cartItem = CartItem::query()->sole();

        $this->actingAs($buyer)
            ->get('/buyer/cart')
            ->assertInertia(fn ($page) => $page
                ->where('cart_items.0.moq', 5)
                ->where('cart_items.0.quantity', 5));

        $this->actingAs($buyer)
            ->patch('/buyer/cart/items/'.$cartItem->id, ['quantity' => 4])
            ->assertSessionHasErrors('quantity');

        $this->assertSame(5, $cartItem->fresh()->quantity);
    }

    public function test_cart_preserves_null_price_zero_stock_and_consistent_cart_count(): void
    {
        $buyer = User::factory()->create();
        $product = Product::factory()->create(['type' => 'goods', 'price' => null, 'stock_quantity' => null]);
        CartItem::query()->create([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->actingAs($buyer)
            ->get('/buyer/cart')
            ->assertInertia(fn ($page) => $page
                ->where('cart_items.0.price', null)
                ->where('cart_items.0.stock', null)
                ->where('cart_items.0.is_available', true)
                ->where('cartCount', 2));

        $product->update(['stock_quantity' => 0]);

        $this->actingAs($buyer)
            ->get('/buyer/cart')
            ->assertInertia(fn ($page) => $page
                ->where('cart_items.0.stock', 0)
                ->where('cart_items.0.stock_status', 'out_of_stock')
                ->where('cart_items.0.is_available', false)
                ->where('cartCount', 0));

        $this->actingAs($buyer)
            ->get('/portal')
            ->assertInertia(fn ($page) => $page->where('cartCount', 0));
    }

    public function test_service_items_ignore_stock_and_follow_active_status_in_cart(): void
    {
        $buyer = User::factory()->create();
        $service = Product::factory()->create([
            'type' => 'service',
            'price' => 50000,
            'stock_quantity' => null,
            'stock_unit' => 'paket',
            'is_active' => true,
        ]);

        $this->actingAs($buyer)
            ->post('/buyer/cart/items', ['product_id' => $service->id, 'quantity' => 3])
            ->assertSessionHasNoErrors();

        $this->actingAs($buyer)
            ->get('/buyer/cart')
            ->assertInertia(fn ($page) => $page
                ->where('cart_items.0.stock', null)
                ->where('cart_items.0.stock_status', 'official_service')
                ->where('cart_items.0.is_available', true)
                ->where('cartCount', 3));

        $service->update(['is_active' => false]);

        $this->actingAs($buyer)
            ->get('/buyer/cart')
            ->assertInertia(fn ($page) => $page
                ->where('cart_items.0.stock_status', 'unavailable')
                ->where('cart_items.0.is_available', false)
                ->where('cartCount', 0));
    }
}
