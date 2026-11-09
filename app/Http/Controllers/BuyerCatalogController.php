<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'kategori' => ['nullable', 'integer', 'exists:categories,id'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,ready_stock'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $sort = $filters['sort'] ?? 'newest';
        $query = $this->publicProducts()
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
            }))
            ->when($filters['kategori'] ?? null, fn ($query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($sort === 'ready_stock', fn ($query) => $query->where('stock_quantity', '>', 0));

        if (in_array($sort, ['price_asc', 'price_desc'], true)) {
            $query->orderByRaw('price IS NULL')->orderBy('price', $sort === 'price_asc' ? 'asc' : 'desc');
        }

        $products = $query->orderByDesc('id')->paginate(12)->withQueryString();

        return Inertia::render('Buyer/Home', [
            'products' => $products->getCollection()->map(fn (Product $product): array => $this->productData($product))->all(),
            'categories' => $this->categories(),
            'filters' => ['search' => $filters['search'] ?? '', 'sort' => $sort, 'kategori' => $filters['kategori'] ?? null],
            'pagination' => ['current_page' => $products->currentPage(), 'last_page' => $products->lastPage(), 'total' => $products->total()],
            'paginationLinks' => ['previous' => $products->previousPageUrl(), 'next' => $products->nextPageUrl()],
            'cartCount' => 0,
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active && $product->category()->where('is_active', true)->exists(), 404);
        $product->load(['category', 'images']);

        return Inertia::render('Buyer/Products/Show', [
            'product' => $this->productData($product),
            'categories' => $this->categories(),
            'related_products' => $this->publicProducts()->where('category_id', $product->category_id)
                ->whereKeyNot($product->id)->latest('id')->limit(4)->get()
                ->map(fn (Product $related): array => $this->productData($related))->all(),
            'cartCount' => 0,
        ]);
    }

    private function publicProducts(): Builder
    {
        return Product::query()->with(['category', 'images'])->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true));
    }

    /** @return array<int, array{id: int, name: string}> */
    private function categories(): array
    {
        return Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name'])->toArray();
    }

    /** @return array<string, mixed> */
    private function productData(Product $product): array
    {
        $stockStatus = $product->stock_quantity === null ? 'unknown' : ((float) $product->stock_quantity > 0 ? 'ready_stock' : 'out_of_stock');

        return [
            'id' => $product->id,
            'name' => $product->name,
            'type' => $product->type,
            'category_id' => $product->category_id,
            'category' => $product->category->name,
            'sku' => $product->sku,
            'description' => $product->description,
            'price' => $product->price,
            'base_price' => $product->price,
            'stock' => $product->stock_quantity,
            'unit' => $product->stock_unit,
            'moq' => $product->moq,
            'stock_status' => $stockStatus,
            'badge_label' => match ($stockStatus) {
                'ready_stock' => 'Stok tersedia',
                'out_of_stock' => 'Stok habis',
                default => 'Ketersediaan belum dikonfirmasi',
            },
            'images' => $product->images->map(fn ($image): string => $image->url)->all(),
            'image_url' => $product->images->first()?->url,
            'specifications' => collect($product->specifications ?? [])->map(fn ($value, $label): array => [
                'label' => (string) $label,
                'value' => is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string) $value,
            ])->values()->all(),
            'tags' => [],
            'tier_prices' => [],
            'cart_enabled' => false,
        ];
    }
}
