<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelOrderRequest;
use App\Models\Order;
use App\Services\OrderWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerOrderController extends Controller
{
    public function __construct(private readonly OrderWorkflowService $workflow) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $allowedStatuses = ['all', ...Order::STAGES, Order::STATUS_CANCELLED];
        $statusFilter = (string) $request->query('status', 'all');
        if (! in_array($statusFilter, $allowedStatuses, true)) {
            $statusFilter = 'all';
        }
        $search = trim((string) $request->query('search', ''));
        $highlight = trim((string) $request->query('highlight', ''));

        $baseQuery = Order::query()->where('user_id', $user->id);

        $rawCounts = (clone $baseQuery)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $counts = [
            'all' => (int) $rawCounts->sum(),
            Order::STATUS_MOU_ORDER => (int) ($rawCounts[Order::STATUS_MOU_ORDER] ?? 0),
            Order::STATUS_DP_VERIFICATION => (int) ($rawCounts[Order::STATUS_DP_VERIFICATION] ?? 0),
            Order::STATUS_UNIT_PREPARATION => (int) ($rawCounts[Order::STATUS_UNIT_PREPARATION] ?? 0),
            Order::STATUS_SHIPPING => (int) ($rawCounts[Order::STATUS_SHIPPING] ?? 0),
            Order::STATUS_HANDOVER => (int) ($rawCounts[Order::STATUS_HANDOVER] ?? 0),
            Order::STATUS_CANCELLED => (int) ($rawCounts[Order::STATUS_CANCELLED] ?? 0),
        ];

        $orders = (clone $baseQuery)
            ->with(['items', 'statusHistories.changedByUser'])
            ->when($statusFilter !== 'all', fn ($query) => $query->where('status', $statusFilter))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($sub) use ($search): void {
                    $sub->where('order_number', 'like', "%{$search}%")
                        ->orWhere('pr_reference', 'like', "%{$search}%")
                        ->orWhere('spk_number', 'like', "%{$search}%")
                        ->orWhere('tracking_number', 'like', "%{$search}%")
                        ->orWhereHas('items', fn ($itemQuery) => $itemQuery->where('product_name', 'like', "%{$search}%"));
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => $this->workflow->serializeOrder($order))
            ->all();

        return Inertia::render('Buyer/Orders/Index', [
            'orders' => $orders,
            'counts' => $counts,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
                'highlight' => $highlight,
            ],
            'status_labels' => Order::STATUS_LABELS,
        ]);
    }

    public function cancel(CancelOrderRequest $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $this->workflow->cancel($order, $request->user(), $request->validated('cancellation_reason'));

        return redirect()
            ->route('buyer.orders.index')
            ->with('success', "Pesanan {$order->order_number} berhasil dibatalkan.");
    }
}
