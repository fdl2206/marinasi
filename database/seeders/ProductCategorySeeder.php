<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $computerCategory = Category::firstOrCreate(
            ['name' => 'Komponen Komputer'],
            ['is_active' => true],
        );

        $serviceCategory = Category::firstOrCreate(
            ['name' => 'Layanan IT'],
            ['is_active' => true],
        );

        Product::firstOrCreate(
            ['sku' => 'PN-DEMO-SSD-001'],
            [
                'category_id' => $computerCategory->id,
                'name' => 'SSD SATA 256 GB',
                'type' => 'goods',
                'description' => 'SSD demonstrasi untuk katalog.',
                'specifications' => ['capacity' => '256 GB', 'interface' => 'SATA'],
                'price' => 450000,
                'stock_quantity' => 10,
                'stock_unit' => 'unit',
                'moq' => 1,
                'is_active' => true,
            ],
        );

        Product::firstOrCreate(
            ['sku' => 'PN-DEMO-SERVICE-001'],
            [
                'category_id' => $serviceCategory->id,
                'name' => 'Jasa Maintenance Komputer',
                'type' => 'service',
                'description' => 'Jasa demonstrasi pemeliharaan komputer.',
                'specifications' => null,
                'price' => null,
                'stock_quantity' => null,
                'stock_unit' => null,
                'moq' => null,
                'is_active' => true,
            ],
        );
    }
}
