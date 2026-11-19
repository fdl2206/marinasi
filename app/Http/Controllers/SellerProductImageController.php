<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class SellerProductImageController extends Controller
{
    public function destroy(Product $product, ProductImage $image): RedirectResponse
    {
        DB::transaction(function () use ($product, $image): void {
            Product::query()->lockForUpdate()->findOrFail($product->id);
            $image->delete();
        });

        if (! Storage::disk('public')->delete($image->path)) {
            report(new RuntimeException('Gagal membersihkan file gambar produk yang dihapus.'));
        }

        return to_route('seller.catalog.index');
    }
}
