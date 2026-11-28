<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdvanceOrderStatusRequest;
use App\Http\Requests\CancelOrderRequest;
use App\Models\Order;
use App\Services\OrderWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SellerOrderController extends Controller
{
    public function __construct(private readonly OrderWorkflowService $workflow) {}

    public function index(Request $request): Response
    {
        $allowedStatuses = ['all', ...Order::STAGES, Order::STATUS_CANCELLED];
        $statusFilter = (string) $request->query('status', 'all');
        if (! in_array($statusFilter, $allowedStatuses, true)) {
            $statusFilter = 'all';
        }
        $search = trim((string) $request->query('search', ''));

        $rawCounts = Order::query()
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

        $stats = [
            'active_count' => $counts[Order::STATUS_MOU_ORDER]
                + $counts[Order::STATUS_DP_VERIFICATION]
                + $counts[Order::STATUS_UNIT_PREPARATION]
                + $counts[Order::STATUS_SHIPPING],
            'preparation_count' => $counts[Order::STATUS_UNIT_PREPARATION],
            'shipping_count' => $counts[Order::STATUS_SHIPPING],
            'completed_this_month' => Order::query()
                ->where('status', Order::STATUS_HANDOVER)
                ->where('completed_at', '>=', now()->startOfMonth())
                ->count(),
            'total_count' => $counts['all'],
        ];

        $orders = Order::query()
            ->with(['user', 'items', 'statusHistories.changedByUser', 'payments.submittedByUser', 'payments.verifiedByUser', 'documents'])
            ->when($statusFilter !== 'all', fn ($query) => $query->where('status', $statusFilter))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($sub) use ($search): void {
                    $sub->where('order_number', 'like', "%{$search}%")
                        ->orWhere('buyer_name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('pr_reference', 'like', "%{$search}%")
                        ->orWhere('spk_number', 'like', "%{$search}%")
                        ->orWhere('tracking_number', 'like', "%{$search}%")
                        ->orWhereHas('items', fn ($itemQuery) => $itemQuery->where('product_name', 'like', "%{$search}%"));
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => $this->workflow->serializeOrder($order, true))
            ->all();

        return Inertia::render('Seller/Orders/Index', [
            'orders' => $orders,
            'counts' => $counts,
            'stats' => $stats,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
            'status_labels' => Order::STATUS_LABELS,
        ]);
    }

    public function advanceStatus(AdvanceOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $updated = $this->workflow->advanceStatus($order, $request->user(), $request->validated());

        return redirect()
            ->route('seller.orders.index')
            ->with('success', "Pesanan {$updated->order_number} berhasil dilanjutkan ke tahap {$updated->statusLabel()}.");
    }

    public function updateShipping(Request $request, Order $order): RedirectResponse
    {
        if (in_array($order->status, [Order::STATUS_CANCELLED, Order::STATUS_HANDOVER], true)) {
            throw ValidationException::withMessages([
                'status' => 'Data pengiriman / SPK tidak dapat diubah pada pesanan yang sudah selesai atau dibatalkan.',
            ]);
        }

        $validated = $request->validate([
            'spk_number' => ['nullable', 'string', 'max:120'],
            'delivery_method' => ['nullable', 'in:expedition,internal_delivery'],
            'courier_name' => ['nullable', 'string', 'max:120'],
            'tracking_number' => ['nullable', 'string', 'max:120'],
        ]);

        $deliveryMethod = $validated['delivery_method'] ?? ($order->delivery_method ?: Order::DELIVERY_EXPEDITION);

        if (
            $order->status === Order::STATUS_SHIPPING
            && $deliveryMethod === Order::DELIVERY_EXPEDITION
            && $order->hasGoodsItems()
            && trim((string) ($validated['tracking_number'] ?? '')) === ''
        ) {
            throw ValidationException::withMessages([
                'tracking_number' => 'Nomor resi tidak boleh dikosongkan pada pengiriman via Ekspedisi.',
            ]);
        }

        $order->update([
            'spk_number' => isset($validated['spk_number']) && trim((string) $validated['spk_number']) !== ''
                ? trim((string) $validated['spk_number'])
                : null,
            'delivery_method' => $deliveryMethod,
            'courier_name' => isset($validated['courier_name']) && trim((string) $validated['courier_name']) !== ''
                ? trim((string) $validated['courier_name'])
                : ($deliveryMethod === Order::DELIVERY_INTERNAL ? 'Armada Internal CV. Putra Nugraha (Antar Langsung Bandung)' : null),
            'tracking_number' => isset($validated['tracking_number']) && trim((string) $validated['tracking_number']) !== ''
                ? trim((string) $validated['tracking_number'])
                : null,
        ]);

        return redirect()
            ->route('seller.orders.index')
            ->with('success', "Informasi SPK / pengiriman pesanan {$order->order_number} berhasil diperbarui.");
    }

    public function cancel(CancelOrderRequest $request, Order $order): RedirectResponse
    {
        $updated = $this->workflow->cancel($order, $request->user(), $request->validated('cancellation_reason'));

        return redirect()
            ->route('seller.orders.index')
            ->with('success', "Pesanan {$updated->order_number} berhasil dibatalkan.");
    }
}
