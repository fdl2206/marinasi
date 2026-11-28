<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_method', 30)->default('expedition')->after('total_amount');
        });

        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('payment_type', 30)->default('dp'); // dp, installment, full
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 120);
            $table->string('payment_reference', 120)->nullable();
            $table->date('paid_at');
            $table->string('status', 30)->default('pending')->index(); // pending, verified, rejected
            $table->string('proof_path', 500)->nullable();
            $table->string('proof_original_name')->nullable();
            $table->string('proof_mime_type', 120)->nullable();
            $table->unsignedBigInteger('proof_size')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });

        Schema::create('order_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('type', 30)->index(); // invoice, purchase_receipt, efaktur, bast
            $table->string('document_number', 100);
            $table->string('tax_period', 60)->nullable();
            $table->decimal('dpp_amount', 15, 2)->default(0);
            $table->decimal('ppn_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('file_path', 500)->nullable();
            $table->string('original_name')->nullable();
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamps();

            $table->unique(['order_id', 'type']);
            $table->index(['type', 'issued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_documents');
        Schema::dropIfExists('order_payments');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('delivery_method');
        });
    }
};
