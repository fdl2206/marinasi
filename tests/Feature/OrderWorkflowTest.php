<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_pending_and_rejected_buyers_cannot_access_or_submit_checkout(): void
    {
        $product = Product::factory()->create(['type' => 'goods', 'price' => 450000, 'stock_quantity' => 5]);

        foreach ([User::VERIFICATION_UNVERIFIED, User::VERIFICATION_PENDING, User::VERIFICATION_REJECTED] as $status) {
            $buyer = User::factory()->create(['verification_status' => $status]);
            $cartItem = CartItem::query()->create([
                'user_id' => $buyer->id,
                'product_id' => $product->id,
                'quantity' => 1,
            ]);

            $this->actingAs($buyer)
                ->get('/buyer/checkout')
                ->assertRedirect(route('buyer.profile.index'))
                ->assertSessionHasErrors('verification');

            $this->actingAs($buyer)
                ->post('/buyer/checkout', [
                    'idempotency_key' => (string) Str::uuid(),
                    'cart_item_ids' => [$cartItem->id],
                    'company_name' => 'Instansi Uji',
                    'buyer_name' => $buyer->name,
                    'buyer_phone' => '081234567890',
                    'shipping_address' => 'Jl. Merdeka No. 10, Kota Bandung',
                ])
                ->assertRedirect(route('buyer.profile.index'))
                ->assertSessionHasErrors('verification');
        }

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame('5.000', $product->fresh()->stock_quantity);
    }

    public function test_verified_buyer_can_direct_checkout_goods_and_service_with_stock_deduction_and_snapshots(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create([
            'name' => 'Andi Pratama',
            'company_name' => 'Dinas Kominfo Kota Bandung',
            'phone' => '081299887766',
            'company_address' => 'Jl. Wastukencana No. 2, Kota Bandung',
        ]);

        $goods = Product::factory()->create([
            'name' => 'SSD V-GeN 256GB',
            'type' => 'goods',
            'sku' => 'SSD-256',
            'price' => 450000,
            'stock_quantity' => 10,
            'stock_unit' => 'unit',
        ]);
        $service = Product::factory()->create([
            'name' => 'Jasa Instalasi Jaringan',
            'type' => 'service',
            'price' => 150000,
            'stock_quantity' => null,
            'stock_unit' => 'paket',
        ]);

        $cartGoods = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $goods->id, 'quantity' => 2]);
        $cartService = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $service->id, 'quantity' => 1]);

        $this->actingAs($buyer)
            ->get('/buyer/checkout')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Buyer/Checkout/Index')
                ->has('checkout_items', 2)
                ->where('summary.total_amount', 1050000)
                ->where('summary.can_submit', true));

        $key = (string) Str::uuid();

        $response = $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => $key,
            'cart_item_ids' => [$cartGoods->id, $cartService->id],
            'company_name' => 'Dinas Kominfo Kota Bandung',
            'buyer_name' => 'Andi Pratama',
            'buyer_phone' => '081299887766',
            'shipping_address' => 'Jl. Wastukencana No. 2, Kota Bandung',
            'pr_reference' => 'PR/DKI/2026/001',
            'npwp_number' => '01.234.567.8-423.000',
            'shipping_notes' => 'Kirim jam kerja',
        ]);

        $order = Order::query()->with(['items', 'statusHistories'])->sole();

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('buyer.orders.index', ['highlight' => $order->order_number]))
            ->assertSessionHas('order_number', $order->order_number);

        $this->assertStringContainsString(rawurlencode($order->order_number), (string) session('whatsapp_url'));
        $this->assertSame(Order::STATUS_MOU_ORDER, $order->status);
        $this->assertSame(Order::SOURCE_DIRECT_CHECKOUT, $order->source);
        $this->assertSame('1050000.00', $order->total_amount);
        $this->assertSame('Dinas Kominfo Kota Bandung', $order->company_name);
        $this->assertCount(2, $order->items);
        $this->assertCount(1, $order->statusHistories);
        $this->assertSame('8.000', $goods->fresh()->stock_quantity);
        $this->assertNull($service->fresh()->stock_quantity);
        $this->assertDatabaseCount('cart_items', 0);

        // Mutating catalog price/name later must not change order item snapshot
        $goods->update(['name' => 'SSD Nama Berubah', 'price' => 999000]);
        $goodsOrderItem = $order->items()->where('product_id', $goods->id)->sole();
        $this->assertSame('SSD V-GeN 256GB', $goodsOrderItem->product_name);
        $this->assertSame('450000.00', $goodsOrderItem->unit_price);
    }

    public function test_direct_checkout_is_idempotent_against_double_submit(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $product = Product::factory()->create(['type' => 'goods', 'price' => 200000, 'stock_quantity' => 5]);
        $cartItem = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 2]);
        $idempotencyKey = (string) Str::uuid();

        $payload = [
            'idempotency_key' => $idempotencyKey,
            'cart_item_ids' => [$cartItem->id],
            'company_name' => 'Instansi Idempoten',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081200001111',
            'shipping_address' => 'Jl. Asia Afrika No. 1, Bandung',
        ];

        $this->actingAs($buyer)->post('/buyer/checkout', $payload)->assertSessionHasNoErrors();
        $this->actingAs($buyer)->post('/buyer/checkout', $payload)->assertSessionHasNoErrors();

        $this->assertDatabaseCount('orders', 1);
        $this->assertSame('3.000', $product->fresh()->stock_quantity);
    }

    public function test_direct_checkout_rejects_unpriced_products_and_insufficient_stock(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $unpriced = Product::factory()->create(['type' => 'service', 'price' => null, 'stock_quantity' => null]);
        $scarce = Product::factory()->create(['type' => 'goods', 'price' => 300000, 'stock_quantity' => 1]);

        $unpricedCart = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $unpriced->id, 'quantity' => 1]);
        $scarceCart = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $scarce->id, 'quantity' => 3]);

        $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$unpricedCart->id],
            'company_name' => 'Instansi A',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081234567890',
            'shipping_address' => 'Jl. Braga No. 5, Kota Bandung',
        ])->assertSessionHasErrors('cart_item_ids');

        $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$scarceCart->id],
            'company_name' => 'Instansi A',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081234567890',
            'shipping_address' => 'Jl. Braga No. 5, Kota Bandung',
        ])->assertSessionHasErrors('cart_item_ids');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame('1.000', $scarce->fresh()->stock_quantity);
    }

    public function test_seller_advances_order_strictly_one_stage_at_a_time_and_requires_tracking_at_shipping(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $product = Product::factory()->create(['type' => 'goods', 'price' => 500000, 'stock_quantity' => 4]);
        $cartItem = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 1]);

        $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$cartItem->id],
            'company_name' => 'Instansi State Machine',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081234567890',
            'shipping_address' => 'Jl. Diponegoro No. 22, Bandung',
        ])->assertSessionHasNoErrors();

        $order = Order::query()->sole();

        // Skipping mou_order -> unit_preparation must be rejected
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_UNIT_PREPARATION])
            ->assertSessionHasErrors('target_status');
        $this->assertSame(Order::STATUS_MOU_ORDER, $order->fresh()->status);

        // Stage 1 -> Stage 2 (dp_verification)
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', [
                'target_status' => Order::STATUS_DP_VERIFICATION,
                'spk_number' => 'SPK/PN/2026/001',
                'note' => 'DP diverifikasi',
            ])
            ->assertSessionHasNoErrors();
        $this->assertSame(Order::STATUS_DP_VERIFICATION, $order->fresh()->status);
        $this->assertSame('SPK/PN/2026/001', $order->fresh()->spk_number);

        // Going backwards must be rejected
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_MOU_ORDER])
            ->assertSessionHasErrors('target_status');

        // Stage 2 -> Stage 3 (unit_preparation)
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_UNIT_PREPARATION])
            ->assertSessionHasNoErrors();
        $this->assertSame(Order::STATUS_UNIT_PREPARATION, $order->fresh()->status);

        // Stage 3 -> Stage 4 (shipping) requires tracking_number for goods order
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_SHIPPING])
            ->assertSessionHasErrors('tracking_number');
        $this->assertSame(Order::STATUS_UNIT_PREPARATION, $order->fresh()->status);

        // Stage 3 -> Stage 4 (shipping) with tracking_number succeeds
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', [
                'target_status' => Order::STATUS_SHIPPING,
                'courier_name' => 'JNE Cargo',
                'tracking_number' => 'JNE-BDG-998877',
            ])
            ->assertSessionHasNoErrors();

        $order->refresh();
        $this->assertSame(Order::STATUS_SHIPPING, $order->status);
        $this->assertSame('JNE Cargo', $order->courier_name);
        $this->assertSame('JNE-BDG-998877', $order->tracking_number);
        $this->assertNotNull($order->shipped_at);

        // Stage 4 -> Stage 5 (handover)
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_HANDOVER])
            ->assertSessionHasNoErrors();

        $order->refresh();
        $this->assertSame(Order::STATUS_HANDOVER, $order->status);
        $this->assertNotNull($order->completed_at);
        $this->assertCount(5, $order->statusHistories);

        // Cannot advance past terminal handover
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_HANDOVER])
            ->assertSessionHasErrors('target_status');
    }

    public function test_cancellation_is_allowed_only_before_unit_preparation_and_restores_stock(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $product = Product::factory()->create(['type' => 'goods', 'price' => 300000, 'stock_quantity' => 10]);

        // Order #1: cancelled at dp_verification -> allowed & restores stock
        $cart1 = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 2]);
        $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$cart1->id],
            'company_name' => 'Instansi Cancel',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081234567890',
            'shipping_address' => 'Jl. Cihampelas No. 10, Bandung',
        ])->assertSessionHasNoErrors();

        $order1 = Order::query()->latest('id')->firstOrFail();
        $this->assertSame('8.000', $product->fresh()->stock_quantity);

        $this->actingAs($seller)
            ->post('/seller/orders/'.$order1->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION])
            ->assertSessionHasNoErrors();

        $this->actingAs($buyer)
            ->post('/buyer/orders/'.$order1->id.'/cancel', [
                'cancellation_reason' => 'Revisi anggaran pengadaan dari instansi',
            ])
            ->assertSessionHasNoErrors();

        $order1->refresh();
        $this->assertSame(Order::STATUS_CANCELLED, $order1->status);
        $this->assertSame('Revisi anggaran pengadaan dari instansi', $order1->cancellation_reason);
        $this->assertSame('10.000', $product->fresh()->stock_quantity);

        // Order #2: once in unit_preparation -> CANNOT be cancelled by Buyer or Seller
        $cart2 = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 3]);
        $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$cart2->id],
            'company_name' => 'Instansi Locked',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081234567890',
            'shipping_address' => 'Jl. Dago No. 15, Bandung',
        ])->assertSessionHasNoErrors();

        $order2 = Order::query()->latest('id')->firstOrFail();
        $this->actingAs($seller)->post('/seller/orders/'.$order2->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION]);
        $this->actingAs($seller)->post('/seller/orders/'.$order2->id.'/status', ['target_status' => Order::STATUS_UNIT_PREPARATION]);

        $this->actingAs($buyer)
            ->post('/buyer/orders/'.$order2->id.'/cancel', ['cancellation_reason' => 'Ingin batal mendadak'])
            ->assertSessionHasErrors('status');

        $this->actingAs($seller)
            ->post('/seller/orders/'.$order2->id.'/cancel', ['cancellation_reason' => 'Ingin batal mendadak'])
            ->assertSessionHasErrors('status');

        $this->assertSame(Order::STATUS_UNIT_PREPARATION, $order2->fresh()->status);
        $this->assertSame('7.000', $product->fresh()->stock_quantity);
    }

    public function test_buyer_cannot_view_or_cancel_another_buyers_order_and_cannot_advance_status(): void
    {
        $owner = User::factory()->verifiedBuyer()->create();
        $otherBuyer = User::factory()->verifiedBuyer()->create();
        $product = Product::factory()->create(['type' => 'goods', 'price' => 250000, 'stock_quantity' => 5]);
        $cartItem = CartItem::query()->create(['user_id' => $owner->id, 'product_id' => $product->id, 'quantity' => 1]);

        $this->actingAs($owner)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$cartItem->id],
            'company_name' => 'Instansi Pemilik',
            'buyer_name' => $owner->name,
            'buyer_phone' => '081234567890',
            'shipping_address' => 'Jl. Riau No. 12, Bandung',
        ])->assertSessionHasNoErrors();

        $order = Order::query()->sole();

        $this->actingAs($otherBuyer)
            ->get('/buyer/orders')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('orders', 0));

        $this->actingAs($otherBuyer)
            ->post('/buyer/orders/'.$order->id.'/cancel', ['cancellation_reason' => 'Mencoba batalkan milik orang lain'])
            ->assertForbidden();

        $this->actingAs($owner)
            ->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION])
            ->assertForbidden();

        $this->actingAs($owner)
            ->patch('/seller/orders/'.$order->id.'/shipping', ['spk_number' => 'SPK-FAKE'])
            ->assertForbidden();

        $this->actingAs($owner)
            ->post('/seller/orders/'.$order->id.'/cancel', ['cancellation_reason' => 'Mencoba akses endpoint seller'])
            ->assertForbidden();

        $this->assertSame(Order::STATUS_MOU_ORDER, $order->fresh()->status);
    }
}
