<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('type', 20);
            $table->string('sku')->nullable()->unique();
            $table->text('description')->nullable();
            $table->json('specifications')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->decimal('stock_quantity', 12, 3)->nullable();
            $table->string('stock_unit', 50)->nullable();
            $table->unsignedInteger('moq')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
