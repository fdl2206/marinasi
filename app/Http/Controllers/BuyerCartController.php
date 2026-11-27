<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BuyerCartController extends Controller
{
    private const MAX_QUANTITY = 1000000;

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
                $maxStock = $stockQty !== null ? max(0, (int) floor($stockQty)) : null;

                $isProductActive = $product->is_active && (bool) $product->category?->is_active;
                $isOutOfStock = $maxStock !== null && $maxStock < 1;
                $stockStatus = 'unknown';
                $badgeLabel = 'Ketersediaan Belum Dikonfirmasi';

                if (! $isProductActive) {
                    $stockStatus = 'unavailable';
                    $badgeLabel = 'Produk Tidak Tersedia';
                } elseif ($isOutOfStock) {
                    $stockStatus = 'out_of_stock';
                    $badgeLabel = 'Stok Habis';
                } elseif ($product->type === 'service') {
                    $stockStatus = 'official_service';
                    $badgeLabel = 'Jasa Resmi CV. Putra Nugraha';
                } elseif ($stockQty !== null) {
                    $stockStatus = 'ready_stock';
                    $badgeLabel = 'Ready Stock';
                }

                $isAvailable = $isProductActive && ! $isOutOfStock;

                return [
                    'id' => $item->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price !== null ? (float) $product->price : null,
                    'unit' => $product->stock_unit ?: ($product->type === 'service' ? 'paket' : 'unit'),
                    'moq' => $product->moq,
                    'quantity' => $item->quantity,
                    'stock' => $maxStock,
                    'stock_status' => $stockStatus,
                    'is_available' => $isAvailable,
                    'badge_label' => $badgeLabel,
                    'tax_badge' => null,
                    'image_url' => $firstImage?->url,
                    'selected' => $isAvailable,
                ];
            });

        return Inertia::render('Buyer/Cart/Index', [
            'cart_items' => $cartItems,
            'cartCount' => (int) $cartItems->where('is_available', true)->sum('quantity'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_QUANTITY],
        ]);

        $userId = $request->user()->id;
        $quantityToAdd = $validated['quantity'] ?? 1;

        DB::transaction(function () use ($validated, $userId, $quantityToAdd): void {
            $product = Product::query()
                ->with('category')
                ->lockForUpdate()
                ->findOrFail($validated['product_id']);

            $this->ensureProductAvailable($product);

            $existingItem = CartItem::query()
                ->where('user_id', $userId)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $newQuantity = ($existingItem?->quantity ?? 0) + $quantityToAdd;

            if ($newQuantity > self::MAX_QUANTITY) {
                throw ValidationException::withMessages([
                    'quantity' => 'Jumlah maksimal pemesanan per item adalah '.number_format(self::MAX_QUANTITY, 0, ',', '.').'.',
                ]);
            }

            $this->ensureMeetsMoq($product, $newQuantity);
            $this->ensureStockSufficient($product, $newQuantity);

            if ($existingItem !== null) {
                $existingItem->update(['quantity' => $newQuantity]);
            } else {
                CartItem::query()->create([
                    'user_id' => $userId,
                    'product_id' => $product->id,
                    'quantity' => $newQuantity,
                ]);
            }
        });

        return back(fallback: route('buyer.cart.index'));
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $this->authorizeOwner($request, $cartItem);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:'.self::MAX_QUANTITY],
        ]);

        DB::transaction(function () use ($cartItem, $validated): void {
            $lockedItem = CartItem::query()
                ->lockForUpdate()
                ->findOrFail($cartItem->id);

            $product = Product::query()
                ->with('category')
                ->lockForUpdate()
                ->find($lockedItem->product_id);

            $this->ensureProductAvailable($product);
            $this->ensureMeetsMoq($product, $validated['quantity']);
            $this->ensureStockSufficient($product, $validated['quantity']);

            $lockedItem->update([
                'quantity' => $validated['quantity'],
            ]);
        });

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

    private function ensureMeetsMoq(Product $product, int $requestedQuantity): void
    {
        if ($product->moq !== null && $requestedQuantity < $product->moq) {
            throw ValidationException::withMessages([
                'quantity' => "Jumlah minimal pemesanan untuk produk ini adalah {$product->moq}.",
            ]);
        }
    }

    private function ensureStockSufficient(Product $product, int $requestedQuantity): void
    {
        if ($product->stock_quantity !== null && $requestedQuantity > (int) floor((float) $product->stock_quantity)) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah melebihi stok yang tersedia.',
            ]);
        }
    }
}