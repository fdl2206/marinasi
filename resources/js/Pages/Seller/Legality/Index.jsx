import { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Receipt,
    FileText,
    FileCheck2,
    UploadCloud,
    Download,
    Printer,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Paperclip,
    X,
} from 'lucide-react';
import Modal from '@/Components/Modal';
import { formatRupiah } from '@/Components/Buyer/ProductCard';

const TYPE_STYLES = {
    invoice: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    efaktur: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    purchase_receipt: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    bast: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
};

export default function SellerLegalityIndex({
    documents = [],
    pending_payments: pendingPayments = [],
    eligible_orders: eligibleOrders = [],
    counts = {},
    filters = {},
}) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const errors = props?.errors || {};

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const activeType = filters?.type || 'all';

    // Upload e-Faktur / BAST Modal
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadOrderId, setUploadOrderId] = useState(eligibleOrders[0]?.id ? String(eligibleOrders[0].id) : '');
    const [uploadType, setUploadType] = useState('efaktur');
    const [uploadDocNumber, setUploadDocNumber] = useState('');
    const [uploadTaxPeriod, setUploadTaxPeriod] = useState('');
    const [uploadNotes, setUploadNotes] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [isBusy, setIsBusy] = useState(false);

    // Reject Payment Modal
    const [rejectPaymentTarget, setRejectPaymentTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const applyFilter = (nextType, nextSearch = searchQuery) => {
        router.get(
            '/seller/legality',
            {
                type: nextType === 'all' ? undefined : nextType,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleVerifyPayment = (payment) => {
        if (isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/payments/${payment.id}/verify`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleRejectPayment = (e) => {
        e.preventDefault();
        if (!rejectPaymentTarget || isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/payments/${rejectPaymentTarget.id}/reject`,
            { rejection_reason: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectPaymentTarget(null);
                    setRejectReason('');
                },
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleUploadDocument = (e) => {
        e.preventDefault();
        if (!uploadOrderId || !uploadFile || isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/orders/${uploadOrderId}/documents`,
            {
                type: uploadType,
                document_number: uploadDocNumber,
                tax_period: uploadTaxPeriod || null,
                notes: uploadNotes || null,
                file: uploadFile,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setUploadOpen(false);
                    setUploadDocNumber('');
                    setUploadTaxPeriod('');
                    setUploadNotes('');
                    setUploadFile(null);
                },
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const tabs = [
        { id: 'all', label: `Semua (${counts.all ?? 0})` },
        { id: 'invoice', label: `Invoice (${counts.invoice ?? 0})` },
        { id: 'efaktur', label: `e-Faktur PPN (${counts.efaktur ?? 0})` },
        { id: 'purchase_receipt', label: `Bukti Pembelian (${counts.purchase_receipt ?? 0})` },
        { id: 'bast', label: `BAST (${counts.bast ?? 0})` },
    ];

    const firstError =
        errors?.document ||
        errors?.file ||
        errors?.document_number ||
        errors?.payment ||
        errors?.rejection_reason;

    return (
        <SellerLayout
            title="Dokumen Pajak, e-Faktur & Pembayaran"
            searchQuery={searchQuery}
            onSearchChange={(val) => {
                setSearchQuery(val);
                if (val === '') applyFilter(activeType, '');
            }}
            searchPlaceholder="Cari nomor dokumen, e-Faktur, pesanan, atau instansi..."
        >
            <Head title="Dokumen Pajak, e-Faktur & Pembayaran — CV. Putra Nugraha" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Pusat Dokumen Pajak (e-Faktur), Invoice &amp; Verifikasi Pembayaran
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Verifikasi bukti transfer buyer, unggah PDF e-Faktur resmi DJP / BAST, dan pantau seluruh Invoice &amp; Bukti Pembelian.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={eligibleOrders.length === 0}
                        onClick={() => setUploadOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition shrink-0"
                    >
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload PDF e-Faktur / BAST</span>
                    </button>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {firstError && (
                    <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{firstError}</span>
                    </div>
                )}

                {/* ANTREAN VERIFIKASI PEMBAYARAN MASUK */}
                {pendingPayments.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                Antrean Verifikasi Bukti Pembayaran ({pendingPayments.length})
                            </h2>
                        </div>
                        <div className="space-y-2.5">
                            {pendingPayments.map((pay) => (
                                <div
                                    key={pay.id}
                                    className="rounded-xl bg-white dark:bg-[#171B26] border border-amber-200/70 dark:border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            <span className="font-mono">{pay.order_number}</span> • {pay.company_name}
                                        </div>
                                        <div className="text-slate-500">
                                            {pay.payment_type_label} • <strong>{formatRupiah(pay.amount)}</strong> • {pay.payment_method} ({pay.paid_at_formatted})
                                        </div>
                                        {pay.proof_url && (
                                            <a
                                                href={pay.proof_url}
                                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                            >
                                                <Paperclip className="h-3 w-3" />
                                                <span>Unduh Bukti: {pay.proof_name}</span>
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            onClick={() => handleVerifyPayment(pay)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>Verifikasi</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            onClick={() => {
                                                setRejectPaymentTarget(pay);
                                                setRejectReason('');
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold"
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            <span>Tolak</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4 KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Invoice Resmi</span>
                            <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-extrabold">{counts.invoice ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>e-Faktur PPN 11%</span>
                            <Receipt className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-extrabold">{counts.efaktur ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Bukti Pembelian</span>
                            <FileCheck2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-extrabold">{counts.purchase_receipt ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Dokumen BAST</span>
                            <FileCheck2 className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div className="text-2xl font-extrabold">{counts.bast ?? 0}</div>
                    </div>
                </div>

                {/* FILTER TABS & TABLE */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {tabs.map((tab) => {
                        const active = activeType === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => applyFilter(tab.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                    active
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden shadow-sm">
                    {documents.length === 0 ? (
                        <div className="p-12 text-center space-y-2">
                            <Receipt className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold">Belum ada dokumen pada filter ini</h3>
                            <p className="text-xs text-slate-500">
                                Terbitkan Invoice / Bukti Pembelian dari menu Pesanan, atau unggah PDF e-Faktur di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] text-slate-500">
                                        <th className="py-3 px-4 font-semibold">Jenis &amp; Nomor Dokumen</th>
                                        <th className="py-3 px-4 font-semibold">Pesanan &amp; Instansi</th>
                                        <th className="py-3 px-4 font-semibold">DPP / PPN / Total</th>
                                        <th className="py-3 px-4 font-semibold">Tanggal Terbit</th>
                                        <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {documents.map((doc) => {
                                        const badge = TYPE_STYLES[doc.type] || TYPE_STYLES.invoice;
                                        return (
                                            <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge}`}>
                                                        {doc.type_label}
                                                    </span>
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                                                        {doc.document_number}
                                                    </div>
                                                    {doc.tax_period && (
                                                        <div className="text-[11px] text-slate-400">Masa: {doc.tax_period}</div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-mono font-semibold">{doc.order_number}</div>
                                                    <div className="text-[11px] text-slate-500">{doc.company_name}</div>
                                                    {doc.npwp_number && (
                                                        <div className="text-[10px] font-mono text-slate-400">NPWP: {doc.npwp_number}</div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold">{formatRupiah(doc.total_amount)}</div>
                                                    <div className="text-[10px] text-slate-400">
                                                        DPP {formatRupiah(doc.dpp_amount)} • PPN {formatRupiah(doc.ppn_amount)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500">{doc.issued_at_formatted}</td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {doc.print_url && (
                                                            <a
                                                                href={doc.print_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold"
                                                            >
                                                                <Printer className="h-3.5 w-3.5" />
                                                                <span>Cetak</span>
                                                            </a>
                                                        )}
                                                        <a
                                                            href={doc.download_url}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            <span>PDF</span>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL UPLOAD E-FAKTUR / BAST */}
            <Modal show={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="md">
                <form onSubmit={handleUploadDocument} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div>
                            <h3 className="text-base font-bold">Upload PDF e-Faktur Pajak / BAST</h3>
                            <p className="text-slate-500 mt-0.5">File disimpan di penyimpanan privat khusus pesanan terkait.</p>
                        </div>
                        <button type="button" onClick={() => setUploadOpen(false)} className="text-slate-400">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="font-semibold">Pilih Pesanan *</label>
                            <select
                                required
                                value={uploadOrderId}
                                onChange={(e) => setUploadOrderId(e.target.value)}
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            >
                                {eligibleOrders.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.order_number} — {o.company_name} ({o.status_label})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Jenis Dokumen *</label>
                            <select
                                value={uploadType}
                                onChange={(e) => setUploadType(e.target.value)}
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            >
                                <option value="efaktur">e-Faktur PPN 11% (DJP)</option>
                                <option value="bast">Berita Acara Serah Terima (BAST)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Nomor Seri Faktur Pajak / Nomor Dokumen *</label>
                            <input
                                type="text"
                                required
                                value={uploadDocNumber}
                                onChange={(e) => setUploadDocNumber(e.target.value)}
                                placeholder="Contoh: 010.002-26.8920114"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Masa Pajak / Periode (Opsional)</label>
                            <input
                                type="text"
                                value={uploadTaxPeriod}
                                onChange={(e) => setUploadTaxPeriod(e.target.value)}
                                placeholder="Contoh: November 2026"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">File PDF Resmi (Maks 5 MB) *</label>
                            <input
                                type="file"
                                required
                                accept=".pdf,application/pdf"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                className="w-full text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Catatan (Opsional)</label>
                            <textarea
                                rows="2"
                                value={uploadNotes}
                                onChange={(e) => setUploadNotes(e.target.value)}
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setUploadOpen(false)}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isBusy || !uploadFile}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold"
                        >
                            {isBusy ? 'Mengunggah...' : 'Simpan & Unggah PDF'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL TOLAK PEMBAYARAN */}
            <Modal show={Boolean(rejectPaymentTarget)} onClose={() => setRejectPaymentTarget(null)} maxWidth="md">
                {rejectPaymentTarget && (
                    <form onSubmit={handleRejectPayment} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold">Tolak Bukti Pembayaran {rejectPaymentTarget.order_number}</h3>
                            <button type="button" onClick={() => setRejectPaymentTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <label className="font-semibold">Alasan Penolakan *</label>
                            <textarea
                                rows="3"
                                required
                                minLength={5}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Contoh: Nominal transfer belum sesuai atau bukti tidak terbaca..."
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setRejectPaymentTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                            <button
                                type="submit"
                                disabled={isBusy || rejectReason.trim().length < 5}
                                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold"
                            >
                                Konfirmasi Tolak
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </SellerLayout>
    );
}
