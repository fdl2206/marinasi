<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BuyerCartController extends Controller
{
    public function index(Request $request): Response
    {
        $cartItems = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->with(['product.category', 'product.images'])
            ->latest('id')
            ->get()
            ->filter(fn (CartItem $item) => $item->product !== null)
            ->values()
            ->map(function (CartItem $item) {
                $product = $item->product;
                $firstImage = $product->images->first();
                $stockQty = $product->stock_quantity !== null ? (float) $product->stock_quantity : null;

                $stockStatus = 'unknown';
                $badgeLabel = 'Ketersediaan Belum Dikonfirmasi';

                if ($product->type === 'service') {
                    $stockStatus = 'official_service';
                    $badgeLabel = 'Jasa Resmi CV. Putra Nugraha';
                } elseif ($stockQty !== null) {
                    if ($stockQty > 0) {
                        $stockStatus = 'ready_stock';
                        $badgeLabel = 'Ready Stock';
                    } else {
                        $stockStatus = 'out_of_stock';
                        $badgeLabel = 'Stok Habis';
                    }
                }

                $maxStock = $stockQty !== null ? max(1, (int) floor($stockQty)) : 99;

                return [
                    'id' => $item->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price !== null ? (float) $product->price : 0,
                    'unit' => $product->stock_unit ?: ($product->type === 'service' ? 'paket' : 'unit'),
                    'quantity' => $item->quantity,
                    'stock' => $maxStock,
                    'stock_status' => $stockStatus,
                    'badge_label' => $badgeLabel,
                    'tax_badge' => null,
                    'image_url' => $firstImage?->url ?? $firstImage?->path ?? '/images/logo-pn.png',
                    'selected' => true,
                ];
            });

        return Inertia::render('Buyer/Cart/Index', [
            'cart_items' => $cartItems,
            'cartCount' => (int) $cartItems->sum('quantity'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $product = Product::query()
            ->with('category')
            ->findOrFail($validated['product_id']);

        $this->ensureProductAvailable($product);

        $quantityToAdd = $validated['quantity'] ?? 1;

        $existingItem = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        $newQuantity = ($existingItem?->quantity ?? 0) + $quantityToAdd;
        $this->ensureStockSufficient($product, $newQuantity);

        CartItem::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
            ],
            [
                'quantity' => $newQuantity,
            ]
        );

        return redirect()->route('buyer.cart.index');
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $this->authorizeOwner($request, $cartItem);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cartItem->loadMissing('product.category');
        $this->ensureProductAvailable($cartItem->product);
        $this->ensureStockSufficient($cartItem->product, $validated['quantity']);

        $cartItem->update([
            'quantity' => $validated['quantity'],
        ]);

        return redirect()->route('buyer.cart.index');
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        $this->authorizeOwner($request, $cartItem);

        $cartItem->delete();

        return redirect()->route('buyer.cart.index');
    }

    private function authorizeOwner(Request $request, CartItem $cartItem): void
    {
        if ($cartItem->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    private function ensureProductAvailable(?Product $product): void
    {
        if (! $product || ! $product->is_active || ! $product->category?->is_active) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk atau kategori tidak tersedia.',
            ]);
        }
    }

    private function ensureStockSufficient(Product $product, int $requestedQuantity): void
    {
        if ($product->stock_quantity !== null && $requestedQuantity > (float) $product->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah melebihi stok yang tersedia.',
            ]);
        }
    }
}