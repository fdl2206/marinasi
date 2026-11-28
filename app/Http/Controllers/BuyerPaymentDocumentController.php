<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderPaymentRequest;
use App\Models\Order;
use App\Models\OrderDocument;
use App\Models\OrderPayment;
use App\Services\OrderPaymentDocumentService;
use App\Services\SimplePdfService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BuyerPaymentDocumentController extends Controller
{
    public function __construct(
        private readonly OrderPaymentDocumentService $service,
        private readonly SimplePdfService $pdfService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $allowedTypes = [
            'all',
            OrderDocument::TYPE_INVOICE,
            OrderDocument::TYPE_EFAKTUR,
            OrderDocument::TYPE_PURCHASE_RECEIPT,
            OrderDocument::TYPE_BAST,
        ];
        $typeFilter = (string) $request->query('type', 'all');
        if (! in_array($typeFilter, $allowedTypes, true)) {
            $typeFilter = 'all';
        }
        $search = trim((string) $request->query('search', ''));

        $baseQuery = OrderDocument::query()
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id));

        $rawCounts = (clone $baseQuery)
            ->selectRaw('type, COUNT(*) as aggregate')
            ->groupBy('type')
            ->pluck('aggregate', 'type');

        $counts = [
            'all' => (int) $rawCounts->sum(),
            OrderDocument::TYPE_INVOICE => (int) ($rawCounts[OrderDocument::TYPE_INVOICE] ?? 0),
            OrderDocument::TYPE_EFAKTUR => (int) ($rawCounts[OrderDocument::TYPE_EFAKTUR] ?? 0),
            OrderDocument::TYPE_PURCHASE_RECEIPT => (int) ($rawCounts[OrderDocument::TYPE_PURCHASE_RECEIPT] ?? 0),
            OrderDocument::TYPE_BAST => (int) ($rawCounts[OrderDocument::TYPE_BAST] ?? 0),
        ];

        $totalPpnEfaktur = (float) (clone $baseQuery)
            ->where('type', OrderDocument::TYPE_EFAKTUR)
            ->sum('ppn_amount');

        $documents = (clone $baseQuery)
            ->with(['order.items'])
            ->when($typeFilter !== 'all', fn ($q) => $q->where('type', $typeFilter))
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('document_number', 'like', "%{$search}%")
                        ->orWhere('tax_period', 'like', "%{$search}%")
                        ->orWhereHas('order', fn ($oq) => $oq->where('order_number', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn (OrderDocument $doc): array => [
                'id' => $doc->id,
                'type' => $doc->type,
                'type_label' => $doc->typeLabel(),
                'document_number' => $doc->document_number,
                'order_number' => $doc->order->order_number,
                'spk_number' => $doc->order->spk_number,
                'tax_period' => $doc->tax_period,
                'dpp_amount' => (float) $doc->dpp_amount,
                'ppn_amount' => (float) $doc->ppn_amount,
                'total_amount' => (float) $doc->total_amount,
                'items_summary' => $doc->order->items
                    ->map(fn ($i): string => "{$i->quantity}x {$i->product_name}")
                    ->implode(', '),
                'notes' => $doc->notes,
                'is_generated' => $doc->isGeneratedDocument(),
                'original_name' => $doc->original_name,
                'issued_at_formatted' => $doc->issued_at?->translatedFormat('d M Y, H:i'),
                'download_url' => route('buyer.documents.download', $doc),
                'print_url' => $doc->isGeneratedDocument() ? route('buyer.documents.print', $doc) : null,
            ])
            ->all();

        return Inertia::render('Buyer/Invoices/Index', [
            'documents' => $documents,
            'counts' => $counts,
            'summary' => [
                'total_efaktur_count' => $counts[OrderDocument::TYPE_EFAKTUR],
                'total_ppn_amount' => $totalPpnEfaktur,
                'total_invoice_count' => $counts[OrderDocument::TYPE_INVOICE],
                'total_receipt_count' => $counts[OrderDocument::TYPE_PURCHASE_RECEIPT],
            ],
            'filters' => [
                'type' => $typeFilter,
                'search' => $search,
            ],
        ]);
    }

    public function storePayment(StoreOrderPaymentRequest $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $this->service->recordPayment(
            $order,
            $request->user(),
            $request->validated(),
            $request->file('proof'),
            autoVerify: false,
        );

        return redirect()
            ->route('buyer.orders.index', ['highlight' => $order->order_number])
            ->with('success', "Bukti pembayaran untuk {$order->order_number} berhasil dikirim dan menunggu verifikasi admin.");
    }

    public function downloadProof(Request $request, OrderPayment $payment): StreamedResponse
    {
        $payment->loadMissing('order');
        abort_unless($payment->order->user_id === $request->user()->id, 403);
        abort_unless($payment->proof_path && Storage::disk('local')->exists($payment->proof_path), 404);

        return Storage::disk('local')->download(
            $payment->proof_path,
            $payment->proof_original_name ?: basename($payment->proof_path),
        );
    }

    public function printDocument(Request $request, OrderDocument $document): View
    {
        $document->loadMissing(['order.items', 'order.payments']);
        abort_unless($document->order->user_id === $request->user()->id, 403);
        abort_unless($document->isGeneratedDocument(), 404);

        return view('documents.order-document', [
            'document' => $document,
            'order' => $document->order,
            'downloadUrl' => route('buyer.documents.download', $document),
        ]);
    }

    public function downloadDocument(Request $request, OrderDocument $document): StreamedResponse|HttpResponse
    {
        $document->loadMissing(['order.items', 'order.payments']);
        abort_unless($document->order->user_id === $request->user()->id, 403);

        if ($document->isGeneratedDocument()) {
            $pdfBytes = $this->pdfService->renderOrderDocument($document);
            $filename = preg_replace('/[^A-Za-z0-9\-_]+/', '_', $document->document_number).'.pdf';

            return response($pdfBytes, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]);
        }

        abort_unless($document->file_path && Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download(
            $document->file_path,
            $document->original_name ?: basename($document->file_path),
        );
    }
}
