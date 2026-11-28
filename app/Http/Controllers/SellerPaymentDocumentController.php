<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderPaymentRequest;
use App\Http\Requests\UploadOrderDocumentRequest;
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

class SellerPaymentDocumentController extends Controller
{
    public function __construct(
        private readonly OrderPaymentDocumentService $service,
        private readonly SimplePdfService $pdfService,
    ) {}

    public function index(Request $request): Response
    {
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

        $rawCounts = OrderDocument::query()
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

        $documents = OrderDocument::query()
            ->with(['order.items'])
            ->when($typeFilter !== 'all', fn ($q) => $q->where('type', $typeFilter))
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('document_number', 'like', "%{$search}%")
                        ->orWhere('tax_period', 'like', "%{$search}%")
                        ->orWhereHas('order', fn ($oq) => $oq
                            ->where('order_number', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn (OrderDocument $doc): array => [
                'id' => $doc->id,
                'order_id' => $doc->order_id,
                'order_number' => $doc->order->order_number,
                'company_name' => $doc->order->company_name ?: $doc->order->buyer_name,
                'npwp_number' => $doc->order->npwp_number,
                'type' => $doc->type,
                'type_label' => $doc->typeLabel(),
                'document_number' => $doc->document_number,
                'tax_period' => $doc->tax_period,
                'dpp_amount' => (float) $doc->dpp_amount,
                'ppn_amount' => (float) $doc->ppn_amount,
                'total_amount' => (float) $doc->total_amount,
                'original_name' => $doc->original_name,
                'is_generated' => $doc->isGeneratedDocument(),
                'issued_at_formatted' => $doc->issued_at?->translatedFormat('d M Y, H:i'),
                'download_url' => route('seller.documents.download', $doc),
                'print_url' => $doc->isGeneratedDocument() ? route('seller.documents.print', $doc) : null,
            ])
            ->all();

        $pendingPayments = OrderPayment::query()
            ->where('status', OrderPayment::STATUS_PENDING)
            ->with(['order', 'submittedByUser'])
            ->latest('id')
            ->get()
            ->map(fn (OrderPayment $p): array => [
                'id' => $p->id,
                'order_id' => $p->order_id,
                'order_number' => $p->order->order_number,
                'company_name' => $p->order->company_name ?: $p->order->buyer_name,
                'payment_type_label' => $p->typeLabel(),
                'amount' => (float) $p->amount,
                'payment_method' => $p->payment_method,
                'payment_reference' => $p->payment_reference,
                'paid_at_formatted' => $p->paid_at?->translatedFormat('d M Y'),
                'proof_url' => $p->proof_path ? route('seller.payments.proof', $p) : null,
                'proof_name' => $p->proof_original_name,
            ])
            ->all();

        $eligibleOrders = Order::query()
            ->whereIn('status', [
                Order::STATUS_DP_VERIFICATION,
                Order::STATUS_UNIT_PREPARATION,
                Order::STATUS_SHIPPING,
                Order::STATUS_HANDOVER,
            ])
            ->latest('id')
            ->limit(50)
            ->get(['id', 'order_number', 'company_name', 'buyer_name', 'status', 'total_amount'])
            ->map(fn (Order $o): array => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'company_name' => $o->company_name ?: $o->buyer_name,
                'status' => $o->status,
                'status_label' => $o->statusLabel(),
                'stage_index' => $o->stageIndex(),
                'total_amount' => (float) $o->total_amount,
            ])
            ->all();

        return Inertia::render('Seller/Legality/Index', [
            'documents' => $documents,
            'pending_payments' => $pendingPayments,
            'eligible_orders' => $eligibleOrders,
            'counts' => $counts,
            'filters' => [
                'type' => $typeFilter,
                'search' => $search,
            ],
        ]);
    }

    public function storePayment(StoreOrderPaymentRequest $request, Order $order): RedirectResponse
    {
        $this->service->recordPayment(
            $order,
            $request->user(),
            $request->validated(),
            $request->file('proof'),
            autoVerify: true,
        );

        return back()->with('success', "Pembayaran terverifikasi untuk {$order->order_number} berhasil dicatat.");
    }

    public function verifyPayment(Request $request, OrderPayment $payment): RedirectResponse
    {
        $this->service->verifyPayment($payment, $request->user());

        return back()->with('success', 'Pembayaran berhasil diverifikasi.');
    }

    public function rejectPayment(Request $request, OrderPayment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'rejection_reason.required' => 'Alasan penolakan pembayaran wajib diisi.',
            'rejection_reason.min' => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $this->service->rejectPayment($payment, $request->user(), $validated['rejection_reason']);

        return back()->with('success', 'Pembayaran telah ditolak. Buyer dapat mengunggah bukti ulang.');
    }

    public function downloadProof(OrderPayment $payment): StreamedResponse
    {
        abort_unless($payment->proof_path && Storage::disk('local')->exists($payment->proof_path), 404);

        return Storage::disk('local')->download(
            $payment->proof_path,
            $payment->proof_original_name ?: basename($payment->proof_path),
        );
    }

    public function issueInvoice(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $doc = $this->service->issueInvoice($order, $request->user(), $validated['notes'] ?? null);

        return back()->with('success', "Invoice resmi {$doc->document_number} berhasil diterbitkan.");
    }

    public function issueReceipt(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $doc = $this->service->issuePurchaseReceipt($order, $request->user(), $validated['notes'] ?? null);

        return back()->with('success', "Bukti Pembelian {$doc->document_number} berhasil diterbitkan.");
    }

    public function uploadDocument(UploadOrderDocumentRequest $request, Order $order): RedirectResponse
    {
        $doc = $this->service->uploadExternalDocument(
            $order,
            $request->user(),
            $request->validated(),
            $request->file('file'),
        );

        return back()->with('success', "{$doc->typeLabel()} ({$doc->document_number}) berhasil diunggah untuk {$order->order_number}.");
    }

    public function printDocument(OrderDocument $document): View
    {
        $document->loadMissing(['order.items', 'order.payments']);
        abort_unless($document->isGeneratedDocument(), 404);

        return view('documents.order-document', [
            'document' => $document,
            'order' => $document->order,
            'downloadUrl' => route('seller.documents.download', $document),
        ]);
    }

    public function downloadDocument(OrderDocument $document): StreamedResponse|HttpResponse
    {
        $document->loadMissing(['order.items', 'order.payments']);

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
