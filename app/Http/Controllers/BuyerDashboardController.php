<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDocument;
use App\Models\Rfq;
use App\Services\OrderWorkflowService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerDashboardController extends Controller
{
    public function __construct(private readonly OrderWorkflowService $orderWorkflow) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $activeStatuses = [
            Order::STATUS_MOU_ORDER,
            Order::STATUS_DP_VERIFICATION,
            Order::STATUS_UNIT_PREPARATION,
            Order::STATUS_SHIPPING,
        ];

        $ordersBase = Order::query()->where('user_id', $user->id);
        $rfqsBase = Rfq::query()->where('user_id', $user->id);

        $activeOrdersCount = (clone $ordersBase)->whereIn('status', $activeStatuses)->count();
        $totalOrdersCount = (clone $ordersBase)->count();
        $pendingRfqCount = (clone $rfqsBase)->whereIn('status', [Rfq::STATUS_SUBMITTED, Rfq::STATUS_QUOTED])->count();
        $totalRfqCount = (clone $rfqsBase)->count();
        $documentsCount = OrderDocument::query()
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        $yearlySpend = (float) (clone $ordersBase)
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        $activeOrderModel = (clone $ordersBase)
            ->whereIn('status', $activeStatuses)
            ->with(['items', 'payments', 'documents', 'statusHistories.changedByUser'])
            ->latest('id')
            ->first();

        $recentOrders = (clone $ordersBase)
            ->with(['items', 'payments', 'documents'])
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'status_label' => $order->statusLabel(),
                'payment_status' => $order->paymentStatus(),
                'payment_status_label' => $order->paymentStatusLabel(),
                'total_amount' => (float) $order->total_amount,
                'items_summary' => $order->items->map(fn ($i): string => "{$i->quantity}x {$i->product_name}")->implode(', '),
                'created_at_formatted' => $order->created_at?->translatedFormat('d M Y'),
                'documents_count' => $order->documents->count(),
            ])
            ->all();

        $recentRfqs = (clone $rfqsBase)
            ->with('items')
            ->latest('id')
            ->limit(4)
            ->get()
            ->map(fn (Rfq $rfq): array => [
                'id' => $rfq->id,
                'rfq_number' => $rfq->rfq_number,
                'sph_number' => $rfq->sph_number,
                'status' => $rfq->status,
                'status_label' => $rfq->statusLabel(),
                'is_expired' => $rfq->isExpired(),
                'quoted_total' => $rfq->quoted_total !== null ? (float) $rfq->quoted_total : null,
                'requested_total' => (float) $rfq->requested_total,
                'items_summary' => $rfq->items->map(fn ($i): string => "{$i->requested_quantity}x {$i->product_name}")->implode(', '),
                'created_at_formatted' => $rfq->created_at?->translatedFormat('d M Y'),
            ])
            ->all();

        return Inertia::render('Buyer/Dashboard', [
            'metrics' => [
                'active_orders_count' => $activeOrdersCount,
                'total_orders_count' => $totalOrdersCount,
                'pending_rfq_count' => $pendingRfqCount,
                'total_rfq_count' => $totalRfqCount,
                'available_documents_count' => $documentsCount,
                'yearly_spend' => $yearlySpend,
                'current_year' => now()->year,
            ],
            'active_order' => $activeOrderModel ? $this->orderWorkflow->serializeOrder($activeOrderModel, false) : null,
            'recent_orders' => $recentOrders,
            'recent_rfqs' => $recentRfqs,
        ]);
    }
}
