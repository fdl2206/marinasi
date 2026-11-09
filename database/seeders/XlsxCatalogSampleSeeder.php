<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class XlsxCatalogSampleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /**
         * Snapshot sheet Katalog Aktif, baris 43, 44, 45, 5 dan 18 pada
         * Katalog_Produk_dan_Jasa_CV_Putra_Nugraha.xlsx.
         */
        $items = [
            ['name' => 'SSD 500GB Laptop/Notebook (WD Blue)', 'category' => '4. Perangkat Keras, Komponen & Aksesoris PC/Laptop', 'type' => 'goods', 'price' => 850000],
            ['name' => 'SSD V-GeN 512GB', 'category' => '4. Perangkat Keras, Komponen & Aksesoris PC/Laptop', 'type' => 'goods', 'price' => 775000],
            ['name' => 'SSD V-GeN 256GB', 'category' => '4. Perangkat Keras, Komponen & Aksesoris PC/Laptop', 'type' => 'goods', 'price' => 450000],
            ['name' => 'Jasa Recovery Back Up Data', 'category' => '1. Layanan Servis, Perbaikan & Pemeliharaan IT', 'type' => 'service', 'price' => 50000],
            ['name' => 'Jasa Service Printer Ringan', 'category' => '2. Layanan Servis Printer, Fotokopi & Peralatan Kantor', 'type' => 'service', 'price' => 50000],
        ];

        DB::transaction(function () use ($items): void {
            foreach ($items as $item) {
                $category = Category::firstOrCreate(['name' => $item['category']], ['is_active' => true]);
                Product::firstOrCreate(
                    ['category_id' => $category->id, 'name' => $item['name']],
                    ['type' => $item['type'], 'price' => $item['price'], 'stock_quantity' => null, 'is_active' => true],
                );
            }
        });
    }
}
