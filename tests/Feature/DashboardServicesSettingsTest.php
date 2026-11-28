<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\CompanySetting;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DashboardServicesSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_and_seller_dashboards_render_real_aggregations_and_isolate_buyer_data(): void
    {
        $buyerA = User::factory()->verifiedBuyer()->create();
        $buyerB = User::factory()->verifiedBuyer()->create();
        $pendingBuyer = User::factory()->create(['verification_status' => User::VERIFICATION_PENDING]);
        $seller = User::factory()->seller()->create();

        $goods = Product::factory()->create(['type' => 'goods', 'price' => 400000, 'stock_quantity' => 3]);
        $service = Product::factory()->create(['type' => 'service', 'price' => 250000, 'stock_quantity' => null]);

        // Buyer A creates order with goods + service (total 650,000)
        $c1 = CartItem::query()->create(['user_id' => $buyerA->id, 'product_id' => $goods->id, 'quantity' => 1]);
        $c2 = CartItem::query()->create(['user_id' => $buyerA->id, 'product_id' => $service->id, 'quantity' => 1]);
        $this->actingAs($buyerA)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$c1->id, $c2->id],
            'company_name' => 'Instansi Alpha',
            'buyer_name' => $buyerA->name,
            'buyer_phone' => '081211112222',
            'shipping_address' => 'Jl. Dipatiukur No. 1, Bandung',
        ])->assertSessionHasNoErrors();

        $order = Order::query()->sole();

        // Buyer A uploads pending DP & submits 1 RFQ
        $this->actingAs($buyerA)->post('/buyer/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_DP,
            'amount' => 300000,
            'payment_method' => 'Transfer Mandiri',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasNoErrors();

        $this->actingAs($buyerA)->post('/buyer/rfq', [
            'company_name' => 'Instansi Alpha',
            'pic_name' => $buyerA->name,
            'pic_email' => $buyerA->email,
            'pic_phone' => '081211112222',
            'shipping_address' => 'Jl. Dipatiukur No. 1, Bandung',
            'items' => [[
                'product_name' => 'Jasa Maintenance',
                'product_type' => 'service',
                'quantity' => 1,
            ]],
        ])->assertSessionHasNoErrors();

        // Buyer A dashboard sees real counts & spend
        $this->actingAs($buyerA)
            ->get('/buyer/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Buyer/Dashboard')
                ->where('metrics.active_orders_count', 1)
                ->where('metrics.pending_rfq_count', 1)
                ->where('metrics.yearly_spend', 650000)
                ->where('active_order.order_number', $order->order_number)
                ->has('recent_orders', 1)
                ->has('recent_rfqs', 1));

        // Buyer B dashboard is strictly isolated (all zeros)
        $this->actingAs($buyerB)
            ->get('/buyer/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('metrics.active_orders_count', 0)
                ->where('metrics.pending_rfq_count', 0)
                ->where('metrics.yearly_spend', 0)
                ->where('active_order', null));

        // Seller dashboard sees real global aggregations
        $this->actingAs($seller)
            ->get('/seller/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Seller/Dashboard')
                ->where('metrics.monthly_revenue', 650000)
                ->where('metrics.monthly_orders_count', 1)
                ->where('metrics.pending_rfqs_count', 1)
                ->where('metrics.active_orders_count', 1)
                ->where('metrics.pending_verifications_count', 1)
                ->where('metrics.pending_payments_count', 1)
                ->where('metrics.low_stock_count', 1)
                ->has('recent_orders', 1)
                ->has('pending_rfqs', 1)
                ->has('low_stock_products', 1));

        // Services pages only include orders with service items
        $this->actingAs($buyerA)
            ->get('/buyer/services')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Buyer/Services/Index')
                ->where('metrics.active_count', 1)
                ->has('service_orders', 1));

        $this->actingAs($buyerB)
            ->get('/buyer/services')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('service_orders', 0));

        $this->actingAs($seller)
            ->get('/seller/services')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Seller/Services/Index')
                ->where('metrics.active_count', 1)
                ->has('service_orders', 1));

        $this->assertNotNull($pendingBuyer->id);
    }

    public function test_seller_can_update_account_and_company_settings_and_whatsapp_url_reflects_change(): void
    {
        $seller = User::factory()->seller()->create();
        $buyer = User::factory()->verifiedBuyer()->create();

        // Buyer cannot mutate seller settings
        $this->actingAs($buyer)->patch('/seller/settings/account', ['name' => 'Hack', 'email' => 'hack@example.com'])->assertForbidden();
        $this->actingAs($buyer)->patch('/seller/settings/company', ['company_name' => 'Hack'])->assertForbidden();

        // Seller updates account
        $this->actingAs($seller)
            ->patch('/seller/settings/account', [
                'name' => 'Owner Putra Nugraha',
                'email' => $seller->email,
                'phone' => '081320777874',
            ])
            ->assertSessionHasNoErrors();
        $this->assertSame('Owner Putra Nugraha', $seller->fresh()->name);

        // Seller updates company settings + WA number + bank account
        $this->actingAs($seller)
            ->patch('/seller/settings/company', [
                'company_name' => 'CV. Putra Nugraha Official',
                'tagline' => 'Solusi Pengadaan IT B2B',
                'npwp' => '02.889.112.4-429.000',
                'is_pkp' => true,
                'whatsapp_number' => '6281122334455',
                'display_phone' => '(+62) 811-2233-4455',
                'email' => 'official@putranugraha.co.id',
                'address' => 'Ujung Berung, Bandung',
                'bank_accounts' => [[
                    'bank_name' => 'Bank Mandiri',
                    'account_number' => '1300081220774',
                    'account_holder' => 'CV. Putra Nugraha',
                ]],
            ])
            ->assertSessionHasNoErrors();

        $setting = CompanySetting::current();
        $this->assertSame('6281122334455', $setting->whatsapp_number);
        $this->assertCount(1, $setting->bank_accounts);

        // Checkout order WA link now uses the updated official WhatsApp number!
        $product = Product::factory()->create(['type' => 'goods', 'price' => 100000, 'stock_quantity' => 5]);
        $cartItem = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 1]);
        $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$cartItem->id],
            'company_name' => 'Instansi WA Test',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081299990000',
            'shipping_address' => 'Jl. Cihampelas No. 5, Bandung',
        ])->assertSessionHasNoErrors();

        $order = Order::query()->sole();
        $this->assertStringStartsWith('https://wa.me/6281122334455?text=', $order->whatsappConfirmationUrl());
    }

    public function test_rfq_rejects_past_target_delivery_date(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();

        $this->actingAs($buyer)
            ->post('/buyer/rfq', [
                'company_name' => 'Instansi Tanggal',
                'pic_name' => $buyer->name,
                'pic_email' => $buyer->email,
                'pic_phone' => '081234567890',
                'shipping_address' => 'Jl. Merdeka No. 2, Bandung',
                'target_delivery_date' => now()->subDay()->toDateString(),
                'items' => [[
                    'product_name' => 'Printer Kantor',
                    'product_type' => 'goods',
                    'quantity' => 1,
                ]],
            ])
            ->assertSessionHasErrors('target_delivery_date');
    }
}
