<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\Rfq;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RfqWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_pending_and_rejected_buyers_cannot_open_or_submit_rfq(): void
    {
        foreach ([User::VERIFICATION_UNVERIFIED, User::VERIFICATION_PENDING, User::VERIFICATION_REJECTED] as $status) {
            $buyer = User::factory()->create(['verification_status' => $status]);

            $this->actingAs($buyer)
                ->get('/buyer/rfq/create')
                ->assertRedirect(route('buyer.profile.index'))
                ->assertSessionHasErrors('verification');

            $this->actingAs($buyer)
                ->post('/buyer/rfq', [
                    'company_name' => 'Instansi Belum Verif',
                    'pic_name' => $buyer->name,
                    'pic_email' => $buyer->email,
                    'pic_phone' => '081234567890',
                    'shipping_address' => 'Jl. Merdeka No. 1, Kota Bandung',
                    'items' => [[
                        'product_name' => 'Server HPE',
                        'product_type' => 'goods',
                        'quantity' => 2,
                    ]],
                ])
                ->assertRedirect(route('buyer.profile.index'))
                ->assertSessionHasErrors('verification');
        }

        $this->assertDatabaseCount('rfqs', 0);
    }

    public function test_verified_buyer_can_submit_rfq_with_private_attachment_and_prefill(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $buyer = User::factory()->verifiedBuyer()->create();
        $otherBuyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $product = Product::factory()->create([
            'name' => 'SSD V-GeN 512GB',
            'type' => 'goods',
            'price' => 775000,
            'stock_quantity' => 5,
            'stock_unit' => 'unit',
        ]);

        // Prefill from product detail
        $this->actingAs($buyer)
            ->get('/buyer/rfq/create?product_id='.$product->id.'&quantity=4')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Buyer/Rfq/Create')
                ->has('prefill_items', 1)
                ->where('prefill_items.0.product_id', $product->id)
                ->where('prefill_items.0.quantity', 4));

        // Prefill from cart
        CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 3]);
        $this->actingAs($buyer)
            ->get('/buyer/rfq/create?source=cart')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('prefill_items', 1)
                ->where('prefill_items.0.quantity', 3));

        // Reject oversized or invalid file type
        $this->actingAs($buyer)
            ->post('/buyer/rfq', [
                'company_name' => 'Dinas Pendidikan',
                'pic_name' => $buyer->name,
                'pic_email' => $buyer->email,
                'pic_phone' => '081234567890',
                'shipping_address' => 'Jl. Ahmad Yani No. 20, Kota Bandung',
                'attachment' => UploadedFile::fake()->create('rab.pdf', 5200, 'application/pdf'),
                'items' => [[
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_type' => 'goods',
                    'quantity' => 10,
                ]],
            ])
            ->assertSessionHasErrors('attachment');
        $this->assertDatabaseCount('rfqs', 0);

        // Valid RFQ with private PDF attachment
        $this->actingAs($buyer)
            ->post('/buyer/rfq', [
                'company_name' => 'Dinas Pendidikan',
                'pic_name' => $buyer->name,
                'pic_email' => $buyer->email,
                'pic_phone' => '081234567890',
                'npwp_number' => '01.234.567.8-423.000',
                'shipping_address' => 'Jl. Ahmad Yani No. 20, Kota Bandung',
                'payment_terms_note' => 'DP 50% + Pelunasan saat Serah Terima',
                'attachment' => UploadedFile::fake()->create('rab-proyek.pdf', 120, 'application/pdf'),
                'items' => [
                    [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_type' => 'goods',
                        'unit' => 'unit',
                        'quantity' => 10,
                        'requested_unit_price' => 700000,
                    ],
                ],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('buyer.quotations.index'));

        $rfq = Rfq::query()->with(['items', 'responses'])->sole();
        $this->assertSame(Rfq::STATUS_SUBMITTED, $rfq->status);
        $this->assertSame('7000000.00', $rfq->requested_total);
        $this->assertNotNull($rfq->attachment_path);
        Storage::disk('local')->assertExists($rfq->attachment_path);
        $this->assertSame([], Storage::disk('public')->allFiles());

        // Attachment download security: owner & seller OK, other buyer 403
        $this->actingAs($buyer)->get('/buyer/quotations/'.$rfq->id.'/attachment')->assertOk();
        $this->actingAs($seller)->get('/seller/negotiations/'.$rfq->id.'/attachment')->assertOk();
        $this->actingAs($otherBuyer)->get('/buyer/quotations/'.$rfq->id.'/attachment')->assertForbidden();
    }

    public function test_seller_quotes_rfq_buyer_agrees_locks_price_and_qty_and_converts_to_order_without_adding_stock(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $product = Product::factory()->create([
            'name' => 'Switch Cisco 24-Port',
            'type' => 'goods',
            'price' => 500000,
            'stock_quantity' => 2,
            'stock_unit' => 'unit',
        ]);

        $this->actingAs($buyer)->post('/buyer/rfq', [
            'company_name' => 'Diskominfo Jabar',
            'pic_name' => 'Rina Kartika',
            'pic_email' => 'rina@jabarprov.go.id',
            'pic_phone' => '081200009999',
            'npwp_number' => '00.111.222.3-423.000',
            'shipping_address' => 'Jl. Tamansari No. 55, Kota Bandung',
            'items' => [[
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_type' => 'goods',
                'unit' => 'unit',
                'quantity' => 5,
                'requested_unit_price' => 420000,
            ]],
        ])->assertSessionHasNoErrors();

        $rfq = Rfq::query()->with('items')->sole();
        $rfqItem = $rfq->items->sole();

        // Buyer cannot agree before seller quotes
        $this->actingAs($buyer)
            ->post('/buyer/quotations/'.$rfq->id.'/agree')
            ->assertSessionHasErrors('status');

        // Seller sends SPH quote
        $this->actingAs($seller)
            ->post('/seller/negotiations/'.$rfq->id.'/quote', [
                'valid_days' => 14,
                'payment_terms_note' => 'DP 50% + Pelunasan saat Serah Terima',
                'seller_notes' => 'Harga proyek sudah termasuk PPN 11%.',
                'items' => [[
                    'id' => $rfqItem->id,
                    'quoted_quantity' => 5,
                    'quoted_unit_price' => 400000,
                ]],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('seller.negotiations.index'));

        $rfq->refresh();
        $this->assertSame(Rfq::STATUS_QUOTED, $rfq->status);
        $this->assertNotNull($rfq->sph_number);
        $this->assertSame('2000000.00', $rfq->quoted_total);

        // Buyer agrees -> locks RFQ and creates Order without changing product stock
        $response = $this->actingAs($buyer)->post('/buyer/quotations/'.$rfq->id.'/agree');
        $order = Order::query()->with(['items', 'statusHistories'])->sole();

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('buyer.orders.index', ['highlight' => $order->order_number]))
            ->assertSessionHas('order_number', $order->order_number);

        $rfq->refresh();
        $this->assertSame(Rfq::STATUS_AGREED, $rfq->status);
        $this->assertTrue($rfq->isLocked());
        $this->assertSame($order->id, $rfq->order_id);

        $this->assertSame(Order::SOURCE_RFQ, $order->source);
        $this->assertSame(Order::STATUS_MOU_ORDER, $order->status);
        $this->assertSame('2000000.00', $order->total_amount);
        $this->assertSame($rfq->rfq_number, $order->pr_reference);
        $this->assertSame($rfq->sph_number, $order->spk_number);
        $orderItem = $order->items->sole();
        $this->assertSame(5, $orderItem->quantity);
        $this->assertSame('400000.00', $orderItem->unit_price);
        $this->assertFalse($orderItem->stock_deducted);

        // Approving RFQ MUST NOT add or alter stock
        $this->assertSame('2.000', $product->fresh()->stock_quantity);

        // Locked RFQ cannot be re-quoted, re-agreed, or rejected (requires new RFQ)
        $this->actingAs($seller)
            ->post('/seller/negotiations/'.$rfq->id.'/quote', [
                'valid_days' => 14,
                'items' => [[
                    'id' => $rfqItem->id,
                    'quoted_quantity' => 6,
                    'quoted_unit_price' => 380000,
                ]],
            ])
            ->assertSessionHasErrors('status');

        $this->actingAs($buyer)
            ->post('/buyer/quotations/'.$rfq->id.'/agree')
            ->assertSessionHasErrors('status');

        $this->actingAs($seller)
            ->post('/seller/negotiations/'.$rfq->id.'/reject', ['rejection_reason' => 'Coba tolak yang sudah deal'])
            ->assertSessionHasErrors('status');

        $this->assertDatabaseCount('orders', 1);
    }

    public function test_buyer_can_cancel_before_quote_and_buyer_or_seller_can_reject_with_reason(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();

        $payload = [
            'company_name' => 'Instansi Uji',
            'pic_name' => $buyer->name,
            'pic_email' => $buyer->email,
            'pic_phone' => '081234567890',
            'shipping_address' => 'Jl. Cikapundung No. 10, Bandung',
            'items' => [[
                'product_name' => 'Jasa Maintenance Server',
                'product_type' => 'service',
                'quantity' => 1,
            ]],
        ];

        // 1. Buyer cancels submitted RFQ
        $this->actingAs($buyer)->post('/buyer/rfq', $payload)->assertSessionHasNoErrors();
        $rfq1 = Rfq::query()->latest('id')->firstOrFail();

        $this->actingAs($buyer)->post('/buyer/quotations/'.$rfq1->id.'/cancel')->assertSessionHasNoErrors();
        $this->assertSame(Rfq::STATUS_CANCELLED, $rfq1->fresh()->status);

        // 2. Seller rejects submitted RFQ with reason
        $this->actingAs($buyer)->post('/buyer/rfq', $payload)->assertSessionHasNoErrors();
        $rfq2 = Rfq::query()->latest('id')->firstOrFail();

        $this->actingAs($seller)
            ->post('/seller/negotiations/'.$rfq2->id.'/reject', ['rejection_reason' => 'Layanan di luar cakupan area kami'])
            ->assertSessionHasNoErrors();
        $this->assertSame(Rfq::STATUS_REJECTED, $rfq2->fresh()->status);
        $this->assertSame('Layanan di luar cakupan area kami', $rfq2->fresh()->rejection_reason);

        // 3. Buyer declines quoted SPH with reason (and cannot cancel once quoted)
        $this->actingAs($buyer)->post('/buyer/rfq', $payload)->assertSessionHasNoErrors();
        $rfq3 = Rfq::query()->with('items')->latest('id')->firstOrFail();

        $this->actingAs($seller)
            ->post('/seller/negotiations/'.$rfq3->id.'/quote', [
                'valid_days' => 7,
                'items' => [[
                    'id' => $rfq3->items->sole()->id,
                    'quoted_quantity' => 1,
                    'quoted_unit_price' => 1500000,
                ]],
            ])
            ->assertSessionHasNoErrors();

        $this->actingAs($buyer)->post('/buyer/quotations/'.$rfq3->id.'/cancel')->assertSessionHasErrors('status');

        $this->actingAs($buyer)
            ->post('/buyer/quotations/'.$rfq3->id.'/reject', ['rejection_reason' => 'Melebihi pagu anggaran, akan buat RFQ baru'])
            ->assertSessionHasNoErrors();
        $this->assertSame(Rfq::STATUS_REJECTED, $rfq3->fresh()->status);
    }

    public function test_buyer_cannot_access_or_mutate_another_buyers_rfq_or_seller_negotiation_routes(): void
    {
        $owner = User::factory()->verifiedBuyer()->create();
        $otherBuyer = User::factory()->verifiedBuyer()->create();

        $this->actingAs($owner)->post('/buyer/rfq', [
            'company_name' => 'Instansi Pemilik',
            'pic_name' => $owner->name,
            'pic_email' => $owner->email,
            'pic_phone' => '081234567890',
            'shipping_address' => 'Jl. Asia Afrika No. 99, Bandung',
            'items' => [[
                'product_name' => 'Printer Laser',
                'product_type' => 'goods',
                'quantity' => 2,
            ]],
        ])->assertSessionHasNoErrors();

        $rfq = Rfq::query()->with('items')->sole();

        $this->actingAs($otherBuyer)
            ->get('/buyer/quotations')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('quotations', 0));

        $this->actingAs($otherBuyer)->post('/buyer/quotations/'.$rfq->id.'/agree')->assertForbidden();
        $this->actingAs($otherBuyer)->post('/buyer/quotations/'.$rfq->id.'/reject', ['rejection_reason' => 'Tidak berhak'])->assertForbidden();
        $this->actingAs($otherBuyer)->post('/buyer/quotations/'.$rfq->id.'/cancel')->assertForbidden();

        $this->actingAs($owner)->post('/seller/negotiations/'.$rfq->id.'/quote', [
            'valid_days' => 14,
            'items' => [[
                'id' => $rfq->items->sole()->id,
                'quoted_quantity' => 2,
                'quoted_unit_price' => 1000000,
            ]],
        ])->assertForbidden();
        $this->actingAs($owner)->post('/seller/negotiations/'.$rfq->id.'/reject', ['rejection_reason' => 'Tidak berhak'])->assertForbidden();
    }

    public function test_buyer_cannot_agree_to_expired_sph_quote(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();

        $this->actingAs($buyer)->post('/buyer/rfq', [
            'company_name' => 'Instansi Expired SPH',
            'pic_name' => $buyer->name,
            'pic_email' => $buyer->email,
            'pic_phone' => '081234567890',
            'shipping_address' => 'Jl. Braga No. 1, Bandung',
            'items' => [[
                'product_name' => 'Laptop Bisnis',
                'product_type' => 'goods',
                'quantity' => 2,
            ]],
        ])->assertSessionHasNoErrors();

        $rfq = Rfq::query()->with('items')->sole();

        $this->actingAs($seller)->post('/seller/negotiations/'.$rfq->id.'/quote', [
            'valid_days' => 7,
            'items' => [[
                'id' => $rfq->items->sole()->id,
                'quoted_quantity' => 2,
                'quoted_unit_price' => 10000000,
            ]],
        ])->assertSessionHasNoErrors();

        // Simulate expired SPH
        $rfq->update(['valid_until' => now()->subDay()->toDateString()]);

        $this->assertTrue($rfq->fresh()->isExpired());
        $this->assertFalse($rfq->fresh()->canBeAgreedByBuyer());

        $this->actingAs($buyer)
            ->post('/buyer/quotations/'.$rfq->id.'/agree')
            ->assertSessionHasErrors('status');

        $this->assertDatabaseCount('orders', 0);
    }
}
