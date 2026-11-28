<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuoteRfqRequest;
use App\Http\Requests\RejectRfqRequest;
use App\Models\Rfq;
use App\Services\RfqWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SellerNegotiationController extends Controller
{
    public function __construct(private readonly RfqWorkflowService $workflow) {}

    public function index(Request $request): Response
    {
        $allowedStatuses = ['all', Rfq::STATUS_SUBMITTED, Rfq::STATUS_QUOTED, Rfq::STATUS_AGREED, Rfq::STATUS_REJECTED, Rfq::STATUS_CANCELLED];
        $statusFilter = (string) $request->query('status', 'all');
        if (! in_array($statusFilter, $allowedStatuses, true)) {
            $statusFilter = 'all';
        }
        $search = trim((string) $request->query('search', ''));

        $rawCounts = Rfq::query()
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

        $rfqs = Rfq::query()
            ->with(['items', 'responses.user', 'order', 'user'])
            ->when($statusFilter !== 'all', fn ($query) => $query->where('status', $statusFilter))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($sub) use ($search): void {
                    $sub->where('rfq_number', 'like', "%{$search}%")
                        ->orWhere('sph_number', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('pic_name', 'like', "%{$search}%")
                        ->orWhereHas('items', fn ($itemQuery) => $itemQuery->where('product_name', 'like', "%{$search}%"));
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Rfq $rfq): array => $this->workflow->serializeRfq($rfq, true))
            ->all();

        return Inertia::render('Seller/Negotiations/Index', [
            'rfqs' => $rfqs,
            'counts' => $counts,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
            'status_labels' => Rfq::STATUS_LABELS,
        ]);
    }

    public function quote(QuoteRfqRequest $request, Rfq $rfq): RedirectResponse
    {
        $updated = $this->workflow->submitQuote($rfq, $request->user(), $request->validated());

        return redirect()
            ->route('seller.negotiations.index')
            ->with('success', "Penawaran SPH {$updated->sph_number} untuk {$updated->rfq_number} berhasil dikirim ke buyer.");
    }

    public function reject(RejectRfqRequest $request, Rfq $rfq): RedirectResponse
    {
        $updated = $this->workflow->reject($rfq, $request->user(), $request->validated('rejection_reason'));

        return redirect()
            ->route('seller.negotiations.index')
            ->with('success', "Pengajuan RFQ {$updated->rfq_number} berhasil ditolak.");
    }

    public function downloadAttachment(Rfq $rfq): StreamedResponse
    {
        abort_unless($rfq->attachment_path && Storage::disk('local')->exists($rfq->attachment_path), 404);

        return Storage::disk('local')->download(
            $rfq->attachment_path,
            $rfq->attachment_original_name ?: basename($rfq->attachment_path),
        );
    }
}
