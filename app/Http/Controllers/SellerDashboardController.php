<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Product;
use App\Models\Rfq;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $startOfMonth = now()->startOfMonth();
        $activeOrderStatuses = [
            Order::STATUS_MOU_ORDER,
            Order::STATUS_DP_VERIFICATION,
            Order::STATUS_UNIT_PREPARATION,
            Order::STATUS_SHIPPING,
        ];

        $monthlyOrdersQuery = Order::query()
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->where('created_at', '>=', $startOfMonth);

        $monthlyRevenue = (float) (clone $monthlyOrdersQuery)->sum('total_amount');
        $monthlyOrdersCount = (clone $monthlyOrdersQuery)->count();

        $verifiedPaymentsMonth = (float) OrderPayment::query()
            ->where('status', OrderPayment::STATUS_VERIFIED)
            ->where('verified_at', '>=', $startOfMonth)
            ->sum('amount');

        $pendingRfqsCount = Rfq::query()->where('status', Rfq::STATUS_SUBMITTED)->count();
        $activeOrdersCount = Order::query()->whereIn('status', $activeOrderStatuses)->count();
        $pendingVerificationsCount = User::query()
            ->where('is_seller', false)
            ->where('verification_status', User::VERIFICATION_PENDING)
            ->count();
        $pendingPaymentsCount = OrderPayment::query()->where('status', OrderPayment::STATUS_PENDING)->count();

        $lowStockQuery = Product::query()
            ->where('is_active', true)
            ->where('type', 'goods')
            ->whereNotNull('stock_quantity')
            ->where('stock_quantity', '<=', 5);

        $lowStockCount = (clone $lowStockQuery)->count();

        $lowStockProducts = (clone $lowStockQuery)
            ->with('category')
            ->orderBy('stock_quantity')
            ->limit(6)
            ->get()
            ->map(fn (Product $p): array => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'category' => $p->category?->name,
                'stock_quantity' => (float) $p->stock_quantity,
                'stock_unit' => $p->stock_unit ?: 'unit',
            ])
            ->all();

        $recentOrders = Order::query()
            ->with(['items', 'payments', 'documents'])
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'company_name' => $order->company_name ?: $order->buyer_name,
                'buyer_name' => $order->buyer_name,
                'status' => $order->status,
                'status_label' => $order->statusLabel(),
                'payment_status' => $order->paymentStatus(),
                'payment_status_label' => $order->paymentStatusLabel(),
                'total_amount' => (float) $order->total_amount,
                'items_summary' => $order->items->map(fn ($i): string => "{$i->quantity}x {$i->product_name}")->implode(', '),
                'created_at_formatted' => $order->created_at?->translatedFormat('d M Y, H:i'),
                'has_efaktur' => $order->documents->contains('type', 'efaktur'),
            ])
            ->all();

        $pendingRfqs = Rfq::query()
            ->where('status', Rfq::STATUS_SUBMITTED)
            ->with('items')
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Rfq $rfq): array => [
                'id' => $rfq->id,
                'rfq_number' => $rfq->rfq_number,
                'company_name' => $rfq->company_name,
                'pic_name' => $rfq->pic_name,
                'requested_total' => (float) $rfq->requested_total,
                'items_summary' => $rfq->items->map(fn ($i): string => "{$i->requested_quantity}x {$i->product_name}")->implode(', '),
                'created_at_formatted' => $rfq->created_at?->translatedFormat('d M Y, H:i'),
            ])
            ->all();

        return Inertia::render('Seller/Dashboard', [
            'metrics' => [
                'monthly_revenue' => $monthlyRevenue,
                'monthly_orders_count' => $monthlyOrdersCount,
                'verified_payments_month' => $verifiedPaymentsMonth,
                'pending_rfqs_count' => $pendingRfqsCount,
                'active_orders_count' => $activeOrdersCount,
                'pending_verifications_count' => $pendingVerificationsCount,
                'pending_payments_count' => $pendingPaymentsCount,
                'low_stock_count' => $lowStockCount,
            ],
            'recent_orders' => $recentOrders,
            'pending_rfqs' => $pendingRfqs,
            'low_stock_products' => $lowStockProducts,
        ]);
    }
}
