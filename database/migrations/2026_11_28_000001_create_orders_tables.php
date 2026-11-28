<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 40)->unique();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('idempotency_key', 100)->nullable()->unique();
            $table->string('source', 30)->default('direct_checkout');
            $table->string('status', 30)->default('mou_order')->index();

            $table->string('buyer_name');
            $table->string('buyer_email');
            $table->string('buyer_phone', 50)->nullable();
            $table->string('company_name')->nullable();
            $table->text('shipping_address');
            $table->text('shipping_notes')->nullable();

            $table->string('pr_reference', 120)->nullable();
            $table->string('npwp_number', 50)->nullable();
            $table->string('spk_number', 120)->nullable();

            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('dpp_amount', 15, 2)->default(0);
            $table->decimal('ppn_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);

            $table->string('courier_name', 120)->nullable();
            $table->string('tracking_number', 120)->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->string('product_sku', 100)->nullable();
            $table->string('product_type', 20)->default('goods');
            $table->string('unit', 40)->nullable();
            $table->decimal('unit_price', 15, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('line_total', 15, 2);
            $table->boolean('stock_deducted')->default(false);
            $table->timestamps();
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['order_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
