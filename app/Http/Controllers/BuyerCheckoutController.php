<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDirectCheckoutRequest;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BuyerCheckoutController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $selectedIds = collect((array) $request->query('items', []))
            ->map(fn ($id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            ->values()
            ->all();

        $query = CartItem::query()
            ->where('user_id', $user->id)
            ->availableForPurchase()
            ->with(['product.category', 'product.images'])
            ->latest('id');

        if ($selectedIds !== []) {
            $query->whereIn('id', $selectedIds);
        }

        $cartItems = $query->get();

        $items = $cartItems->map(function (CartItem $cartItem): array {
            $product = $cartItem->product;
            $firstImage = $product?->images->first();
            $price = $product && $product->price !== null ? (float) $product->price : null;
            $isService = $product?->type === 'service';
            $stock = ! $isService && $product && $product->stock_quantity !== null
                ? (int) floor((float) $product->stock_quantity)
                : null;

            return [
                'id' => $cartItem->id,
                'product_id' => $cartItem->product_id,
                'name' => $product?->name ?? 'Produk',
                'sku' => $product?->sku,
                'type' => $product?->type ?? 'goods',
                'unit' => $product?->stock_unit ?: ($isService ? 'paket' : 'unit'),
                'price' => $price,
                'quantity' => $cartItem->quantity,
                'line_total' => $price !== null ? round($price * $cartItem->quantity, 2) : null,
                'stock' => $stock,
                'image_url' => $firstImage ? Storage::disk('public')->url($firstImage->path) : null,
                'is_priced' => $price !== null,
            ];
        })->all();

        $hasUnpricedItems = collect($items)->contains(fn (array $item): bool => ! $item['is_priced']);
        $totalAmount = (float) collect($items)->sum(fn (array $item): float => (float) ($item['line_total'] ?? 0));
        $dppAmount = round($totalAmount / 1.11);
        $ppnAmount = round($totalAmount - $dppAmount);

        return Inertia::render('Buyer/Checkout/Index', [
            'checkout_items' => $items,
            'idempotency_key' => (string) Str::uuid(),
            'summary' => [
                'item_count' => count($items),
                'total_units' => (int) collect($items)->sum('quantity'),
                'subtotal' => $totalAmount,
                'dpp_amount' => $dppAmount,
                'ppn_amount' => $ppnAmount,
                'total_amount' => $totalAmount,
                'has_unpriced_items' => $hasUnpricedItems,
                'can_submit' => count($items) > 0 && ! $hasUnpricedItems,
            ],
            'prefill' => [
                'pr_reference' => (string) $request->query('pr_reference', ''),
                'npwp_number' => (string) $request->query('npwp_number', ''),
                'shipping_notes' => (string) $request->query('shipping_notes', ''),
            ],
        ]);
    }

    public function store(StoreDirectCheckoutRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $existing = Order::query()
            ->where('idempotency_key', $validated['idempotency_key'])
            ->with('items')
            ->first();

        if ($existing) {
            if ($existing->user_id !== $user->id) {
                throw ValidationException::withMessages([
                    'idempotency_key' => 'Kunci transaksi tidak valid. Muat ulang halaman checkout dan coba lagi.',
                ]);
            }

            return redirect()
                ->route('buyer.orders.index', ['highlight' => $existing->order_number])
                ->with('success', "Pesanan {$existing->order_number} sudah tercatat.")
                ->with('order_number', $existing->order_number)
                ->with('whatsapp_url', $existing->whatsappConfirmationUrl());
        }

        $order = DB::transaction(function () use ($user, $validated): Order {
            $existingLocked = Order::query()
                ->where('idempotency_key', $validated['idempotency_key'])
                ->lockForUpdate()
                ->with('items')
                ->first();

            if ($existingLocked) {
                if ($existingLocked->user_id !== $user->id) {
                    throw ValidationException::withMessages([
                        'idempotency_key' => 'Kunci transaksi tidak valid. Muat ulang halaman checkout dan coba lagi.',
                    ]);
                }

                return $existingLocked;
            }

            $requestedIds = array_values(array_map('intval', $validated['cart_item_ids']));

            $cartItems = CartItem::query()
                ->where('user_id', $user->id)
                ->whereIn('id', $requestedIds)
                ->lockForUpdate()
                ->get();

            if ($cartItems->count() !== count($requestedIds)) {
                throw ValidationException::withMessages([
                    'cart_item_ids' => 'Sebagian item di keranjang tidak ditemukan atau sudah diproses.',
                ]);
            }

            $products = Product::query()
                ->whereIn('id', $cartItems->pluck('product_id')->unique()->all())
                ->with('category')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $preparedItems = [];
            $subtotal = 0.0;

            foreach ($cartItems as $cartItem) {
                /** @var Product|null $product */
                $product = $products->get($cartItem->product_id);

                if (! $product || ! $product->is_active || ! $product->category || ! $product->category->is_active) {
                    throw ValidationException::withMessages([
                        'cart_item_ids' => 'Salah satu produk di keranjang sudah tidak aktif.',
                    ]);
                }

                if ($product->price === null) {
                    throw ValidationException::withMessages([
                        'cart_item_ids' => "Produk \"{$product->name}\" belum memiliki harga acuan. Silakan ajukan melalui RFQ.",
                    ]);
                }

                $minQty = max(1, (int) ($product->moq ?? 1));
                if ($cartItem->quantity < $minQty) {
                    throw ValidationException::withMessages([
                        'cart_item_ids' => "Jumlah pembelian \"{$product->name}\" minimal {$minQty}.",
                    ]);
                }

                $stockDeducted = false;
                if ($product->type === 'goods' && $product->stock_quantity !== null) {
                    $availableStock = (float) $product->stock_quantity;
                    if ($availableStock < $cartItem->quantity) {
                        throw ValidationException::withMessages([
                            'cart_item_ids' => "Stok untuk \"{$product->name}\" tidak mencukupi (tersedia: ".floor($availableStock).').',
                        ]);
                    }

                    $product->update([
                        'stock_quantity' => $availableStock - $cartItem->quantity,
                    ]);
                    $stockDeducted = true;
                }

                $unitPrice = (float) $product->price;
                $lineTotal = round($unitPrice * $cartItem->quantity, 2);
                $subtotal = round($subtotal + $lineTotal, 2);

                $preparedItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'product_type' => $product->type,
                    'unit' => $product->stock_unit ?: ($product->type === 'service' ? 'paket' : 'unit'),
                    'unit_price' => $unitPrice,
                    'quantity' => $cartItem->quantity,
                    'line_total' => $lineTotal,
                    'stock_deducted' => $stockDeducted,
                ];
            }

            $totalAmount = $subtotal;
            $dppAmount = round($totalAmount / 1.11, 2);
            $ppnAmount = round($totalAmount - $dppAmount, 2);

            $order = Order::query()->create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user->id,
                'idempotency_key' => $validated['idempotency_key'],
                'source' => Order::SOURCE_DIRECT_CHECKOUT,
                'status' => Order::STATUS_MOU_ORDER,
                'buyer_name' => trim($validated['buyer_name']),
                'buyer_email' => $user->email,
                'buyer_phone' => trim($validated['buyer_phone']),
                'company_name' => trim($validated['company_name']),
                'shipping_address' => trim($validated['shipping_address']),
                'shipping_notes' => isset($validated['shipping_notes']) && trim((string) $validated['shipping_notes']) !== ''
                    ? trim((string) $validated['shipping_notes'])
                    : null,
                'pr_reference' => isset($validated['pr_reference']) && trim((string) $validated['pr_reference']) !== ''
                    ? trim((string) $validated['pr_reference'])
                    : null,
                'npwp_number' => isset($validated['npwp_number']) && trim((string) $validated['npwp_number']) !== ''
                    ? trim((string) $validated['npwp_number'])
                    : null,
                'subtotal' => $subtotal,
                'dpp_amount' => $dppAmount,
                'ppn_amount' => $ppnAmount,
                'total_amount' => $totalAmount,
            ]);

            foreach ($preparedItems as $itemData) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    ...$itemData,
                ]);
            }

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => null,
                'to_status' => Order::STATUS_MOU_ORDER,
                'changed_by' => $user->id,
                'note' => 'Pesanan dibuat melalui Direct Checkout.',
            ]);

            CartItem::query()
                ->where('user_id', $user->id)
                ->whereIn('id', $requestedIds)
                ->delete();

            return $order->load('items');
        });

        return redirect()
            ->route('buyer.orders.index', ['highlight' => $order->order_number])
            ->with('success', "Pesanan {$order->order_number} berhasil dibuat. Silakan lanjutkan konfirmasi MOU/DP via WhatsApp.")
            ->with('order_number', $order->order_number)
            ->with('whatsapp_url', $order->whatsappConfirmationUrl());
    }
}
