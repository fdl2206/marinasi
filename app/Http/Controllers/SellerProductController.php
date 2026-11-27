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
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'type' => ['nullable', 'in:goods,service'],
            'stock_status' => ['nullable', 'in:all,ready,critical,out_of_stock,unknown'],
        ]);

        $stockStatus = $filters['stock_status'] ?? 'all';

        return Inertia::render('Seller/Catalog/Index', [
            'products' => Product::query()->with(['category', 'images'])
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
                }))
                ->when($filters['category_id'] ?? null, fn ($query, int $categoryId) => $query->where('category_id', $categoryId))
                ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
                ->when($stockStatus === 'ready', fn ($query) => $query->where('type', 'goods')->where('stock_quantity', '>', 2))
                ->when($stockStatus === 'critical', fn ($query) => $query->where('type', 'goods')->whereNotNull('stock_quantity')->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 2))
                ->when($stockStatus === 'out_of_stock', fn ($query) => $query->where('type', 'goods')->whereNotNull('stock_quantity')->where('stock_quantity', '<=', 0))
                ->when($stockStatus === 'unknown', fn ($query) => $query->where('type', 'goods')->whereNull('stock_quantity'))
                ->latest('id')->paginate(15)->withQueryString(),
            'categories' => Category::query()->withCount('products')->orderBy('name')->get(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category_id' => isset($filters['category_id']) ? (int) $filters['category_id'] : null,
                'type' => $filters['type'] ?? '',
                'stock_status' => $stockStatus,
            ],
            'stats' => [
                'total' => Product::query()->count(),
                'active' => Product::query()->where('is_active', true)->count(),
                'goods' => Product::query()->where('type', 'goods')->count(),
                'services' => Product::query()->where('type', 'service')->count(),
                'ready_stock' => Product::query()->where('stock_quantity', '>', 0)->count(),
                'critical_stock' => Product::query()->where('type', 'goods')->whereNotNull('stock_quantity')->where('stock_quantity', '<=', 2)->count(),
            ],
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

                $data = Arr::except($request->validated(), ['images']);

                if (($data['type'] ?? $product->type) === 'service') {
                    $data['stock_quantity'] = null;
                }

                $product->fill($data)->save();
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
