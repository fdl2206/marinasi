<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rfqs', function (Blueprint $table) {
            $table->id();
            $table->string('rfq_number', 40)->unique();
            $table->string('sph_number', 50)->nullable()->unique();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('status', 30)->default('submitted')->index();

            $table->string('company_name');
            $table->string('pic_name');
            $table->string('pic_email');
            $table->string('pic_phone', 50)->nullable();
            $table->string('npwp_number', 50)->nullable();
            $table->text('shipping_address');

            $table->string('payment_terms_note')->nullable();
            $table->date('target_delivery_date')->nullable();
            $table->text('buyer_notes')->nullable();

            $table->string('attachment_path', 500)->nullable();
            $table->string('attachment_original_name')->nullable();
            $table->string('attachment_mime_type', 120)->nullable();
            $table->unsignedBigInteger('attachment_size')->nullable();

            $table->decimal('requested_total', 15, 2)->default(0);
            $table->decimal('quoted_total', 15, 2)->nullable();
            $table->decimal('quoted_dpp', 15, 2)->nullable();
            $table->decimal('quoted_ppn', 15, 2)->nullable();
            $table->unsignedSmallInteger('valid_days')->nullable();
            $table->date('valid_until')->nullable();
            $table->text('seller_notes')->nullable();

            $table->foreignId('quoted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('quoted_at')->nullable();
            $table->timestamp('agreed_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('rfq_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->string('product_sku', 100)->nullable();
            $table->string('product_type', 20)->default('goods');
            $table->string('unit', 40)->nullable();
            $table->unsignedInteger('requested_quantity');
            $table->decimal('requested_unit_price', 15, 2)->nullable();
            $table->unsignedInteger('quoted_quantity')->nullable();
            $table->decimal('quoted_unit_price', 15, 2)->nullable();
            $table->decimal('quoted_line_total', 15, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('rfq_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_role', 20);
            $table->string('action', 30);
            $table->text('message')->nullable();
            $table->decimal('quoted_total', 15, 2)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['rfq_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rfq_responses');
        Schema::dropIfExists('rfq_items');
        Schema::dropIfExists('rfqs');
    }
};
