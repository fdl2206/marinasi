<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class SellerProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:255']]);

        return Inertia::render('Seller/Catalog/Index', [
            'products' => Product::query()->with(['category', 'images'])
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
                }))
                ->latest('id')->paginate(15)->withQueryString(),
            'categories' => Category::query()->withCount('products')->orderBy('name')->get(),
            'filters' => ['search' => $filters['search'] ?? ''],
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->saveProduct($request, new Product);

        return to_route('seller.catalog.index');
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->saveProduct($request, $product);

        return to_route('seller.catalog.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $paths = DB::transaction(function () use ($product): array {
            $product = Product::query()->lockForUpdate()->findOrFail($product->id);
            $paths = $product->images()->pluck('path')->all();
            $product->delete();

            return $paths;
        });

        if ($paths !== [] && ! Storage::disk('public')->delete($paths)) {
            report(new RuntimeException('Gagal membersihkan file gambar produk yang dihapus.'));
        }

        return to_route('seller.catalog.index');
    }

    private function saveProduct(StoreProductRequest $request, Product $product): void
    {
        $paths = [];

        try {
            DB::transaction(function () use ($request, $product, &$paths): void {
                if ($product->exists) {
                    $product = Product::query()->lockForUpdate()->findOrFail($product->id);
                }

                $product->fill(Arr::except($request->validated(), ['images']))->save();
                $sortOrder = (int) $product->images()->max('sort_order');

                foreach ($request->file('images', []) as $image) {
                    $path = $image->store('products', 'public');

                    if ($path === false) {
                        throw new RuntimeException('Gagal menyimpan gambar produk.');
                    }

                    $paths[] = $path;
                    $product->images()->create(['path' => $path, 'sort_order' => ++$sortOrder]);
                }
            });
        } catch (Throwable $exception) {
            if ($paths !== []) {
                Storage::disk('public')->delete($paths);
            }

            throw $exception;
        }
    }
}
