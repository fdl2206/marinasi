<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderDocument;
use App\Models\OrderPayment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PaymentDocumentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_internal_delivery_allows_shipping_goods_without_tracking_number(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $order = $this->createGoodsOrder($buyer, 500000);

        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION])->assertSessionHasNoErrors();
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_UNIT_PREPARATION])->assertSessionHasNoErrors();

        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/status', [
                'target_status' => Order::STATUS_SHIPPING,
                'delivery_method' => Order::DELIVERY_INTERNAL,
            ])
            ->assertSessionHasNoErrors();

        $order->refresh();
        $this->assertSame(Order::STATUS_SHIPPING, $order->status);
        $this->assertSame(Order::DELIVERY_INTERNAL, $order->delivery_method);
        $this->assertNull($order->tracking_number);
        $this->assertStringContainsString('Armada Internal', (string) $order->courier_name);
    }

    public function test_invoice_requires_dp_verified_and_receipt_requires_full_payment_at_handover(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $buyer = User::factory()->verifiedBuyer()->create();
        $otherBuyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $order = $this->createGoodsOrder($buyer, 1000000);

        // 1. Cannot issue Invoice or Receipt at mou_order with no verified payment
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/invoice')->assertSessionHasErrors('invoice');
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/receipt')->assertSessionHasErrors('purchase_receipt');

        // 2. Buyer uploads DP payment proof (500,000) -> pending, stored privately on local disk
        $this->actingAs($buyer)
            ->post('/buyer/orders/'.$order->id.'/payments', [
                'payment_type' => OrderPayment::TYPE_DP,
                'amount' => 500000,
                'payment_method' => 'Transfer Bank Mandiri',
                'payment_reference' => 'TRX-DP-001',
                'paid_at' => now()->toDateString(),
                'proof' => UploadedFile::fake()->create('bukti-dp.pdf', 80, 'application/pdf'),
            ])
            ->assertSessionHasNoErrors();

        $dpPayment = OrderPayment::query()->sole();
        $this->assertSame(OrderPayment::STATUS_PENDING, $dpPayment->status);
        Storage::disk('local')->assertExists($dpPayment->proof_path);
        $this->assertSame([], Storage::disk('public')->allFiles());

        // Proof download ownership guard
        $this->actingAs($buyer)->get('/buyer/payments/'.$dpPayment->id.'/proof')->assertOk();
        $this->actingAs($seller)->get('/seller/payments/'.$dpPayment->id.'/proof')->assertOk();
        $this->actingAs($otherBuyer)->get('/buyer/payments/'.$dpPayment->id.'/proof')->assertForbidden();

        // Still cannot issue invoice while payment is pending or stage is mou_order
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/invoice')->assertSessionHasErrors('invoice');

        // 3. Seller verifies DP payment AND advances to dp_verification
        $this->actingAs($seller)->post('/seller/payments/'.$dpPayment->id.'/verify')->assertSessionHasNoErrors();
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION])->assertSessionHasNoErrors();

        $this->assertSame('dp_verified', $order->fresh()->paymentStatus());

        // 4. Now Seller CAN issue Invoice (but still CANNOT issue Bukti Pembelian)
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/invoice')->assertSessionHasNoErrors();
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/receipt')->assertSessionHasErrors('purchase_receipt');

        $invoice = OrderDocument::query()->where('type', OrderDocument::TYPE_INVOICE)->sole();
        $this->assertStringStartsWith('INV-PN-', $invoice->document_number);

        // Print view & valid PDF download + ownership isolation
        $this->actingAs($buyer)->get('/buyer/documents/'.$invoice->id.'/print')->assertOk()->assertSee($invoice->document_number);
        $pdfResponse = $this->actingAs($buyer)->get('/buyer/documents/'.$invoice->id.'/download');
        $pdfResponse->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-1.4', $pdfResponse->getContent());

        $this->actingAs($otherBuyer)->get('/buyer/documents/'.$invoice->id.'/print')->assertForbidden();
        $this->actingAs($otherBuyer)->get('/buyer/documents/'.$invoice->id.'/download')->assertForbidden();

        // 5. Seller records remaining pelunasan (500,000, auto-verified) -> paid_in_full
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/payments', [
                'payment_type' => OrderPayment::TYPE_FULL,
                'amount' => 500000,
                'payment_method' => 'Transfer Bank Mandiri',
                'paid_at' => now()->toDateString(),
            ])
            ->assertSessionHasNoErrors();

        $this->assertTrue($order->fresh()->isPaidInFull());

        // Still cannot issue Bukti Pembelian before Serah Terima (handover)
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/receipt')->assertSessionHasErrors('purchase_receipt');

        // Advance to Serah Terima (unit_preparation -> shipping [internal] -> handover)
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_UNIT_PREPARATION])->assertSessionHasNoErrors();
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', [
            'target_status' => Order::STATUS_SHIPPING,
            'delivery_method' => Order::DELIVERY_INTERNAL,
        ])->assertSessionHasNoErrors();
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_HANDOVER])->assertSessionHasNoErrors();

        // Now Bukti Pembelian succeeds!
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/receipt')->assertSessionHasNoErrors();

        $receipt = OrderDocument::query()->where('type', OrderDocument::TYPE_PURCHASE_RECEIPT)->sole();
        $this->assertStringStartsWith('BKT-PN-', $receipt->document_number);
        $receiptPdf = $this->actingAs($buyer)->get('/buyer/documents/'.$receipt->id.'/download');
        $receiptPdf->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-1.4', $receiptPdf->getContent());
    }

    public function test_seller_can_upload_and_replace_private_efaktur_pdf_and_buyer_sees_it_in_invoices(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $buyer = User::factory()->verifiedBuyer()->create();
        $otherBuyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $order = $this->createGoodsOrder($buyer, 1110000);

        // Cannot upload e-Faktur at mou_order
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/documents', [
                'type' => OrderDocument::TYPE_EFAKTUR,
                'document_number' => '010.002-26.0000001',
                'tax_period' => 'November 2026',
                'file' => UploadedFile::fake()->create('efaktur-v1.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors('document');

        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION])->assertSessionHasNoErrors();

        // Upload v1 e-Faktur
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/documents', [
                'type' => OrderDocument::TYPE_EFAKTUR,
                'document_number' => '010.002-26.0000001',
                'tax_period' => 'November 2026',
                'file' => UploadedFile::fake()->create('efaktur-v1.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasNoErrors();

        $doc = OrderDocument::query()->sole();
        $oldPath = $doc->file_path;
        Storage::disk('local')->assertExists($oldPath);

        // Replace with v2 (Faktur Pajak Pengganti) -> cleans up old file
        $this->actingAs($seller)
            ->post('/seller/orders/'.$order->id.'/documents', [
                'type' => OrderDocument::TYPE_EFAKTUR,
                'document_number' => '011.002-26.0000001',
                'tax_period' => 'November 2026',
                'file' => UploadedFile::fake()->create('efaktur-pengganti.pdf', 110, 'application/pdf'),
            ])
            ->assertSessionHasNoErrors();

        $doc->refresh();
        $this->assertSame('011.002-26.0000001', $doc->document_number);
        Storage::disk('local')->assertMissing($oldPath);
        Storage::disk('local')->assertExists($doc->file_path);

        // Buyer sees it in /buyer/invoices and can download, other buyer cannot
        $this->actingAs($buyer)
            ->get('/buyer/invoices')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Buyer/Invoices/Index')
                ->has('documents', 1)
                ->where('documents.0.document_number', '011.002-26.0000001')
                ->where('summary.total_efaktur_count', 1));

        $this->actingAs($buyer)->get('/buyer/documents/'.$doc->id.'/download')->assertOk();
        $this->actingAs($otherBuyer)->get('/buyer/documents/'.$doc->id.'/download')->assertForbidden();
    }

    public function test_seller_can_reject_pending_payment_and_buyers_cannot_call_seller_payment_routes(): void
    {
        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();
        $order = $this->createGoodsOrder($buyer, 500000);

        $this->actingAs($buyer)->post('/buyer/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_DP,
            'amount' => 250000,
            'payment_method' => 'Transfer BCA',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasNoErrors();

        $payment = OrderPayment::query()->sole();

        // Buyer cannot access seller payment/document routes
        $this->actingAs($buyer)->post('/seller/payments/'.$payment->id.'/verify')->assertForbidden();
        $this->actingAs($buyer)->post('/seller/orders/'.$order->id.'/invoice')->assertForbidden();
        $this->actingAs($buyer)->post('/seller/orders/'.$order->id.'/receipt')->assertForbidden();

        // Seller rejects payment with reason
        $this->actingAs($seller)
            ->post('/seller/payments/'.$payment->id.'/reject', ['rejection_reason' => 'Nominal transfer belum masuk mutasi'])
            ->assertSessionHasNoErrors();

        $this->assertSame(OrderPayment::STATUS_REJECTED, $payment->fresh()->status);
        $this->assertSame(0.0, $order->fresh()->verifiedPaidAmount());
    }

    public function test_payment_guards_block_overpayment_future_date_completed_legacy_orders_bast_early_and_buyer_cancel_after_dp(): void
    {
        Storage::fake('local');

        $buyer = User::factory()->verifiedBuyer()->create();
        $seller = User::factory()->seller()->create();

        // 1. Overpayment, future paid_at, & pending cap guards
        $order = $this->createGoodsOrder($buyer, 1000000);

        $this->actingAs($buyer)->post('/buyer/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_DP,
            'amount' => 500000,
            'payment_method' => 'Transfer Bank',
            'paid_at' => now()->addDay()->toDateString(),
        ])->assertSessionHasErrors('paid_at');

        $this->actingAs($buyer)->post('/buyer/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_FULL,
            'amount' => 1200000,
            'payment_method' => 'Transfer Bank',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasErrors('amount');

        // Upload valid DP 600,000 (pending), then second pending 500,000 exceeds total -> blocked!
        $this->actingAs($buyer)->post('/buyer/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_DP,
            'amount' => 600000,
            'payment_method' => 'Transfer Bank',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasNoErrors();

        $this->actingAs($buyer)->post('/buyer/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_FULL,
            'amount' => 500000,
            'payment_method' => 'Transfer Bank',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasErrors('amount');

        // Verify DP -> buyer can NO LONGER self-cancel once DP is verified
        $dpPayment = OrderPayment::query()->sole();
        $this->actingAs($seller)->post('/seller/payments/'.$dpPayment->id.'/verify')->assertSessionHasNoErrors();

        $this->actingAs($buyer)
            ->post('/buyer/orders/'.$order->id.'/cancel', ['cancellation_reason' => 'Ingin batal sepihak'])
            ->assertSessionHasErrors('status');

        // BAST cannot be uploaded before stage 4 (shipping)
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION])->assertSessionHasNoErrors();
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/documents', [
            'type' => OrderDocument::TYPE_BAST,
            'document_number' => 'BAST-EARLY-01',
            'file' => UploadedFile::fake()->create('bast.pdf', 50, 'application/pdf'),
        ])->assertSessionHasErrors('document');

        // Pay off remaining 400,000 -> further payment blocked (already paid in full)
        $this->actingAs($seller)->post('/seller/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_FULL,
            'amount' => 400000,
            'payment_method' => 'Transfer Bank',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasNoErrors();

        $this->actingAs($buyer)->post('/buyer/orders/'.$order->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_FULL,
            'amount' => 10000,
            'payment_method' => 'Transfer Bank',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasErrors('payment');

        // 2. Completed legacy order (handover with 0 verified payment) -> buyer cannot upload payment
        $legacyOrder = $this->createGoodsOrder($buyer, 300000);
        $this->actingAs($seller)->post('/seller/orders/'.$legacyOrder->id.'/status', ['target_status' => Order::STATUS_DP_VERIFICATION]);
        $this->actingAs($seller)->post('/seller/orders/'.$legacyOrder->id.'/status', ['target_status' => Order::STATUS_UNIT_PREPARATION]);
        $this->actingAs($seller)->post('/seller/orders/'.$legacyOrder->id.'/status', [
            'target_status' => Order::STATUS_SHIPPING,
            'delivery_method' => Order::DELIVERY_INTERNAL,
        ]);
        $this->actingAs($seller)->post('/seller/orders/'.$legacyOrder->id.'/status', ['target_status' => Order::STATUS_HANDOVER]);

        $this->assertFalse($legacyOrder->fresh()->canBuyerUploadPayment());
        $this->actingAs($buyer)->post('/buyer/orders/'.$legacyOrder->id.'/payments', [
            'payment_type' => OrderPayment::TYPE_FULL,
            'amount' => 300000,
            'payment_method' => 'Transfer Bank',
            'paid_at' => now()->toDateString(),
        ])->assertSessionHasErrors('payment');
    }

    private function createGoodsOrder(User $buyer, float $price): Order
    {
        $product = Product::factory()->create(['type' => 'goods', 'price' => $price, 'stock_quantity' => 10]);
        $cartItem = CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 1]);

        $this->actingAs($buyer)->post('/buyer/checkout', [
            'idempotency_key' => (string) Str::uuid(),
            'cart_item_ids' => [$cartItem->id],
            'company_name' => 'Instansi Uji Pajak',
            'buyer_name' => $buyer->name,
            'buyer_phone' => '081234567890',
            'shipping_address' => 'Jl. Merdeka No. 99, Kota Bandung',
            'npwp_number' => '01.234.567.8-423.000',
        ])->assertSessionHasNoErrors();

        return Order::query()->latest('id')->firstOrFail();
    }
}
