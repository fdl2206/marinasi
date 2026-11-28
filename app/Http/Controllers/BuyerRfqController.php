<?php

namespace App\Http\Controllers;

use App\Http\Requests\RejectRfqRequest;
use App\Http\Requests\StoreRfqRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Rfq;
use App\Models\RfqItem;
use App\Models\RfqResponse;
use App\Services\RfqWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class BuyerRfqController extends Controller
{
    public function __construct(private readonly RfqWorkflowService $workflow) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $allowedStatuses = ['all', Rfq::STATUS_SUBMITTED, Rfq::STATUS_QUOTED, Rfq::STATUS_AGREED, Rfq::STATUS_REJECTED, Rfq::STATUS_CANCELLED];
        $statusFilter = (string) $request->query('status', 'all');
        if (! in_array($statusFilter, $allowedStatuses, true)) {
            $statusFilter = 'all';
        }
        $search = trim((string) $request->query('search', ''));

        $baseQuery = Rfq::query()->where('user_id', $user->id);

        $rawCounts = (clone $baseQuery)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $counts = [
            'all' => (int) $rawCounts->sum(),
            Rfq::STATUS_SUBMITTED => (int) ($rawCounts[Rfq::STATUS_SUBMITTED] ?? 0),
            Rfq::STATUS_QUOTED => (int) ($rawCounts[Rfq::STATUS_QUOTED] ?? 0),
            Rfq::STATUS_AGREED => (int) ($rawCounts[Rfq::STATUS_AGREED] ?? 0),
            Rfq::STATUS_REJECTED => (int) ($rawCounts[Rfq::STATUS_REJECTED] ?? 0),
            Rfq::STATUS_CANCELLED => (int) ($rawCounts[Rfq::STATUS_CANCELLED] ?? 0),
        ];

        $quotations = (clone $baseQuery)
            ->with(['items', 'responses.user', 'order'])
            ->when($statusFilter !== 'all', fn ($query) => $query->where('status', $statusFilter))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($sub) use ($search): void {
                    $sub->where('rfq_number', 'like', "%{$search}%")
                        ->orWhere('sph_number', 'like', "%{$search}%")
                        ->orWhereHas('items', fn ($itemQuery) => $itemQuery->where('product_name', 'like', "%{$search}%"));
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Rfq $rfq): array => $this->workflow->serializeRfq($rfq, false))
            ->all();

        return Inertia::render('Buyer/Quotations/Index', [
            'quotations' => $quotations,
            'counts' => $counts,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
            'status_labels' => Rfq::STATUS_LABELS,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $prefillItems = [];

        if ($request->query('source') === 'cart') {
            $cartItems = CartItem::query()
                ->where('user_id', $user->id)
                ->availableForPurchase()
                ->with('product')
                ->latest('id')
                ->get();

            $prefillItems = $cartItems->map(fn (CartItem $cartItem): array => [
                'product_id' => $cartItem->product_id,
                'product_name' => $cartItem->product?->name ?? '',
                'product_type' => $cartItem->product?->type ?? 'goods',
                'unit' => $cartItem->product?->stock_unit ?: ($cartItem->product?->type === 'service' ? 'paket' : 'unit'),
                'quantity' => $cartItem->quantity,
                'requested_unit_price' => $cartItem->product?->price !== null ? (float) $cartItem->product->price : '',
            ])->all();
        } elseif ($request->filled('product_id')) {
            $product = Product::query()
                ->where('is_active', true)
                ->whereHas('category', fn ($q) => $q->where('is_active', true))
                ->find((int) $request->query('product_id'));

            if ($product) {
                $qty = max(1, (int) $request->query('quantity', $product->moq ?? 1));
                $prefillItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_type' => $product->type,
                    'unit' => $product->stock_unit ?: ($product->type === 'service' ? 'paket' : 'unit'),
                    'quantity' => $qty,
                    'requested_unit_price' => $product->price !== null ? (float) $product->price : '',
                ];
            }
        }

        $catalogProducts = Product::query()
            ->where('is_active', true)
            ->whereHas('category', fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'type', 'price', 'stock_unit', 'moq'])
            ->map(fn (Product $p): array => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'type' => $p->type,
                'price' => $p->price !== null ? (float) $p->price : null,
                'unit' => $p->stock_unit ?: ($p->type === 'service' ? 'paket' : 'unit'),
                'moq' => $p->moq ?? 1,
            ])
            ->all();

        return Inertia::render('Buyer/Rfq/Create', [
            'prefill_items' => $prefillItems,
            'catalog_products' => $catalogProducts,
        ]);
    }

    public function store(StoreRfqRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $storedPath = null;
        $attachmentMeta = [
            'attachment_path' => null,
            'attachment_original_name' => null,
            'attachment_mime_type' => null,
            'attachment_size' => null,
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $storedPath = $file->store('rfqs/attachments', 'local');
            $attachmentMeta = [
                'attachment_path' => $storedPath,
                'attachment_original_name' => $file->getClientOriginalName(),
                'attachment_mime_type' => $file->getClientMimeType(),
                'attachment_size' => $file->getSize(),
            ];
        }

        try {
            $rfq = DB::transaction(function () use ($user, $validated, $attachmentMeta): Rfq {
                $productIds = collect($validated['items'])
                    ->pluck('product_id')
                    ->filter()
                    ->unique()
                    ->all();

                $productsById = $productIds !== []
                    ? Product::query()->whereIn('id', $productIds)->get()->keyBy('id')
                    : collect();

                $requestedTotal = 0.0;
                $preparedItems = [];

                foreach ($validated['items'] as $row) {
                    $product = ! empty($row['product_id']) ? $productsById->get((int) $row['product_id']) : null;
                    $qty = (int) $row['quantity'];
                    $reqPrice = isset($row['requested_unit_price']) && $row['requested_unit_price'] !== '' && $row['requested_unit_price'] !== null
                        ? round((float) $row['requested_unit_price'], 2)
                        : null;

                    if ($reqPrice !== null) {
                        $requestedTotal = round($requestedTotal + ($reqPrice * $qty), 2);
                    }

                    $preparedItems[] = [
                        'product_id' => $product?->id,
                        'product_name' => trim($row['product_name']),
                        'product_sku' => $product?->sku,
                        'product_type' => $row['product_type'],
                        'unit' => ! empty($row['unit']) ? trim((string) $row['unit']) : ($row['product_type'] === 'service' ? 'paket' : 'unit'),
                        'requested_quantity' => $qty,
                        'requested_unit_price' => $reqPrice,
                    ];
                }

                $rfq = Rfq::query()->create([
                    'rfq_number' => Rfq::generateRfqNumber(),
                    'user_id' => $user->id,
                    'status' => Rfq::STATUS_SUBMITTED,
                    'company_name' => trim($validated['company_name']),
                    'pic_name' => trim($validated['pic_name']),
                    'pic_email' => trim($validated['pic_email']),
                    'pic_phone' => trim($validated['pic_phone']),
                    'npwp_number' => ! empty($validated['npwp_number']) ? trim((string) $validated['npwp_number']) : null,
                    'shipping_address' => trim($validated['shipping_address']),
                    'payment_terms_note' => ! empty($validated['payment_terms_note']) ? trim((string) $validated['payment_terms_note']) : null,
                    'target_delivery_date' => $validated['target_delivery_date'] ?? null,
                    'buyer_notes' => ! empty($validated['buyer_notes']) ? trim((string) $validated['buyer_notes']) : null,
                    'requested_total' => $requestedTotal,
                    ...$attachmentMeta,
                ]);

                foreach ($preparedItems as $itemData) {
                    RfqItem::query()->create([
                        'rfq_id' => $rfq->id,
                        ...$itemData,
                    ]);
                }

                RfqResponse::query()->create([
                    'rfq_id' => $rfq->id,
                    'user_id' => $user->id,
                    'actor_role' => 'buyer',
                    'action' => 'submitted',
                    'message' => 'Pengajuan RFQ dikirim ke admin CV. Putra Nugraha.',
                    'quoted_total' => $requestedTotal > 0 ? $requestedTotal : null,
                ]);

                return $rfq;
            });
        } catch (Throwable $exception) {
            if ($storedPath) {
                Storage::disk('local')->delete($storedPath);
            }

            throw $exception;
        }

        return redirect()
            ->route('buyer.quotations.index')
            ->with('success', "Pengajuan RFQ {$rfq->rfq_number} berhasil dikirim. Tunggu penawaran resmi (SPH) dari admin.");
    }

    public function agree(Request $request, Rfq $rfq): RedirectResponse
    {
        abort_unless($rfq->user_id === $request->user()->id, 403);

        $order = $this->workflow->agreeAndConvertToOrder($rfq, $request->user());

        return redirect()
            ->route('buyer.orders.index', ['highlight' => $order->order_number])
            ->with('success', "Penawaran {$rfq->sph_number} disepakati! Pesanan {$order->order_number} berhasil dibuat dengan harga & jumlah terkunci.")
            ->with('order_number', $order->order_number)
            ->with('whatsapp_url', $order->whatsappConfirmationUrl());
    }

    public function reject(RejectRfqRequest $request, Rfq $rfq): RedirectResponse
    {
        abort_unless($rfq->user_id === $request->user()->id, 403);

        $this->workflow->reject($rfq, $request->user(), $request->validated('rejection_reason'));

        return redirect()
            ->route('buyer.quotations.index')
            ->with('success', "Penawaran pada {$rfq->rfq_number} ditolak. Anda dapat mengajukan RFQ baru jika membutuhkan perubahan.");
    }

    public function cancel(Request $request, Rfq $rfq): RedirectResponse
    {
        abort_unless($rfq->user_id === $request->user()->id, 403);

        $this->workflow->cancelByBuyer($rfq, $request->user());

        return redirect()
            ->route('buyer.quotations.index')
            ->with('success', "Pengajuan RFQ {$rfq->rfq_number} berhasil dibatalkan.");
    }

    public function downloadAttachment(Request $request, Rfq $rfq): StreamedResponse
    {
        abort_unless($rfq->user_id === $request->user()->id, 403);
        abort_unless($rfq->attachment_path && Storage::disk('local')->exists($rfq->attachment_path), 404);

        return Storage::disk('local')->download(
            $rfq->attachment_path,
            $rfq->attachment_original_name ?: basename($rfq->attachment_path),
        );
    }
}
