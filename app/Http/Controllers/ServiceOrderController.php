<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Rfq;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceOrderController extends Controller
{
    public function buyerIndex(Request $request): Response
    {
        $user = $request->user();
        $statusFilter = (string) $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        $baseQuery = Order::query()
            ->where('user_id', $user->id)
            ->whereHas('items', fn ($q) => $q->where('product_type', 'service'));

        $activeStatuses = [
            Order::STATUS_MOU_ORDER,
            Order::STATUS_DP_VERIFICATION,
            Order::STATUS_UNIT_PREPARATION,
            Order::STATUS_SHIPPING,
        ];

        $activeCount = (clone $baseQuery)->whereIn('status', $activeStatuses)->count();
        $completedCount = (clone $baseQuery)->where('status', Order::STATUS_HANDOVER)->count();
        $totalCount = (clone $baseQuery)->count();
        $pendingServiceRfqs = Rfq::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [Rfq::STATUS_SUBMITTED, Rfq::STATUS_QUOTED])
            ->whereHas('items', fn ($q) => $q->where('product_type', 'service'))
            ->count();

        $serviceOrders = (clone $baseQuery)
            ->with(['items' => fn ($q) => $q->where('product_type', 'service')])
            ->when($statusFilter === 'active', fn ($q) => $q->whereIn('status', $activeStatuses))
            ->when($statusFilter === 'completed', fn ($q) => $q->where('status', Order::STATUS_HANDOVER))
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('order_number', 'like', "%{$search}%")
                        ->orWhere('shipping_address', 'like', "%{$search}%")
                        ->orWhereHas('items', fn ($iq) => $iq->where('product_name', 'like', "%{$search}%"));
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'spk_number' => $order->spk_number,
                'status' => $order->status,
                'status_label' => $order->statusLabel(),
                'stage_index' => $order->stageIndex(),
                'location' => $order->shipping_address,
                'notes' => $order->shipping_notes,
                'created_at_formatted' => $order->created_at?->translatedFormat('d M Y, H:i'),
                'whatsapp_url' => $order->whatsappConfirmationUrl(),
                'service_items' => $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit ?: 'paket',
                    'line_total' => (float) $item->line_total,
                ])->all(),
            ])
            ->all();

        return Inertia::render('Buyer/Services/Index', [
            'service_orders' => $serviceOrders,
            'metrics' => [
                'active_count' => $activeCount,
                'completed_count' => $completedCount,
                'total_count' => $totalCount,
                'pending_service_rfqs' => $pendingServiceRfqs,
            ],
            'filters' => [
                'status' => in_array($statusFilter, ['all', 'active', 'completed'], true) ? $statusFilter : 'all',
                'search' => $search,
            ],
        ]);
    }

    public function sellerIndex(Request $request): Response
    {
        $statusFilter = (string) $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        $baseQuery = Order::query()
            ->whereHas('items', fn ($q) => $q->where('product_type', 'service'));

        $activeStatuses = [
            Order::STATUS_MOU_ORDER,
            Order::STATUS_DP_VERIFICATION,
            Order::STATUS_UNIT_PREPARATION,
            Order::STATUS_SHIPPING,
        ];

        $activeCount = (clone $baseQuery)->whereIn('status', $activeStatuses)->count();
        $completedCount = (clone $baseQuery)->where('status', Order::STATUS_HANDOVER)->count();
        $totalCount = (clone $baseQuery)->count();
        $catalogServicesCount = Product::query()
            ->where('type', 'service')
            ->where('is_active', true)
            ->count();

        $serviceOrders = (clone $baseQuery)
            ->with(['items' => fn ($q) => $q->where('product_type', 'service')])
            ->when($statusFilter === 'active', fn ($q) => $q->whereIn('status', $activeStatuses))
            ->when($statusFilter === 'completed', fn ($q) => $q->where('status', Order::STATUS_HANDOVER))
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('order_number', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('buyer_name', 'like', "%{$search}%")
                        ->orWhereHas('items', fn ($iq) => $iq->where('product_name', 'like', "%{$search}%"));
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'company_name' => $order->company_name ?: $order->buyer_name,
                'pic_name' => $order->buyer_name,
                'pic_phone' => $order->buyer_phone,
                'status' => $order->status,
                'status_label' => $order->statusLabel(),
                'stage_index' => $order->stageIndex(),
                'location' => $order->shipping_address,
                'notes' => $order->shipping_notes,
                'created_at_formatted' => $order->created_at?->translatedFormat('d M Y, H:i'),
                'service_items' => $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit ?: 'paket',
                    'line_total' => (float) $item->line_total,
                ])->all(),
            ])
            ->all();

        return Inertia::render('Seller/Services/Index', [
            'service_orders' => $serviceOrders,
            'metrics' => [
                'active_count' => $activeCount,
                'completed_count' => $completedCount,
                'total_count' => $totalCount,
                'catalog_services_count' => $catalogServicesCount,
            ],
            'filters' => [
                'status' => in_array($statusFilter, ['all', 'active', 'completed'], true) ? $statusFilter : 'all',
                'search' => $search,
            ],
        ]);
    }
}
