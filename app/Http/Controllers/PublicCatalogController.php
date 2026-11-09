<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicCatalogController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'type' => ['nullable', 'in:goods,service'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $products = Product::query()
            ->with(['category:id,name', 'images:id,product_id,path,alt_text,sort_order'])
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($productQuery) use ($search): void {
                    $productQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($filters['category_id'] ?? null, fn ($query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString();

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        if ($request->expectsJson()) {
            return response()->json([
                'data' => $products->getCollection()->map(fn (Product $product): array => $this->productData($product))->all(),
                'links' => [
                    'first' => $products->url(1),
                    'last' => $products->url($products->lastPage()),
                    'prev' => $products->previousPageUrl(),
                    'next' => $products->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'from' => $products->firstItem(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'to' => $products->lastItem(),
                    'total' => $products->total(),
                ],
                'filters' => [
                    'search' => $filters['search'] ?? null,
                    'category_id' => isset($filters['category_id']) ? (int) $filters['category_id'] : null,
                    'type' => $filters['type'] ?? null,
                ],
                'categories' => $categories,
            ]);
        }

        return Inertia::render('Public/Catalog/Index', [
            'products' => $products->getCollection()->map(fn (Product $product): array => $this->productData($product))->all(),
            'categories' => $categories,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category_id' => isset($filters['category_id']) ? (int) $filters['category_id'] : null,
                'type' => $filters['type'] ?? null,
            ],
            'pagination' => $this->paginationData($products),
            'paginationLinks' => [
                'previous' => $products->previousPageUrl(),
                'next' => $products->nextPageUrl(),
            ],
        ]);
    }

    public function show(Product $product, Request $request): Response|JsonResponse
    {
        abort_unless($product->is_active && $product->category()->where('is_active', true)->exists(), 404);

        $product->load(['category:id,name', 'images:id,product_id,path,alt_text,sort_order']);
        $data = ['product' => $this->productData($product)];

        if ($request->expectsJson()) {
            return response()->json($data);
        }

        return Inertia::render('Public/Catalog/Show', $data);
    }

    /** @return array<string, mixed> */
    private function productData(Product $product): array
    {
        return [
            'id' => $product->id,
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ],
            'name' => $product->name,
            'type' => $product->type,
            'sku' => $product->sku,
            'description' => $product->description,
            'specifications' => $product->specifications,
            'price' => $product->price,
            'stock_quantity' => $product->stock_quantity,
            'stock_unit' => $product->stock_unit,
            'moq' => $product->moq,
            'is_active' => $product->is_active,
            'images' => $product->images->map(fn ($image): array => [
                'id' => $image->id,
                'path' => $image->path,
                'url' => $image->url,
                'alt_text' => $image->alt_text,
                'sort_order' => $image->sort_order,
            ])->all(),
        ];
    }

    /** @return array<string, int|null> */
    private function paginationData(LengthAwarePaginator $products): array
    {
        return [
            'current_page' => $products->currentPage(),
            'from' => $products->firstItem(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'to' => $products->lastItem(),
            'total' => $products->total(),
        ];
    }
}
