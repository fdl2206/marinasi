<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->default('CV. Putra Nugraha');
            $table->string('tagline')->default('Perdagangan Barang dan Jasa');
            $table->string('npwp', 60)->nullable();
            $table->boolean('is_pkp')->default(true);
            $table->string('whatsapp_number', 30)->default('6281320777874');
            $table->string('display_phone', 50)->default('(+62) 813-2077-7874');
            $table->string('email', 120)->nullable();
            $table->text('address')->nullable();
            $table->json('bank_accounts')->nullable();
            $table->string('default_payment_terms')->default('DP / Pelunasan sesuai kesepakatan');
            $table->string('tax_note')->default('PPN 11% (Faktur Pajak Resmi)');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
