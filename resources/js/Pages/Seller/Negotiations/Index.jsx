import { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Paperclip,
    FileText,
    CheckCircle2,
    X,
    Send,
    Lock,
    AlertTriangle,
    Eye,
    XCircle,
    Clock,
} from 'lucide-react';
import Modal from '@/Components/Modal';
import { formatRupiah } from '@/Components/Buyer/ProductCard';

const STATUS_STYLES = {
    submitted: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    quoted: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
    agreed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    rejected: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export default function SellerNegotiationsIndex({
    rfqs = [],
    counts = {},
    filters = {},
}) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const errors = props?.errors || {};

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const activeStatus = filters?.status || 'all';

    // Modals
    const [detailRfq, setDetailRfq] = useState(null);
    const [quoteTarget, setQuoteTarget] = useState(null);
    const [quoteItems, setQuoteItems] = useState([]);
    const [quoteValidDays, setQuoteValidDays] = useState(14);
    const [quotePaymentTerms, setQuotePaymentTerms] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');
    const [isBusy, setIsBusy] = useState(false);

    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const applyFilter = (nextStatus, nextSearch = searchQuery) => {
        router.get(
            '/seller/negotiations',
            {
                status: nextStatus === 'all' ? undefined : nextStatus,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openQuoteModal = (rfq) => {
        setQuoteTarget(rfq);
        setQuoteValidDays(rfq.valid_days || 14);
        setQuotePaymentTerms(rfq.payment_terms_note || 'DP 50% + Pelunasan saat Serah Terima');
        setQuoteNotes(
            rfq.seller_notes ||
                'Harga penawaran sudah termasuk PPN 11%. Penawaran mengikat setelah disepakati buyer.'
        );
        setQuoteItems(
            rfq.items.map((item) => ({
                id: item.id,
                product_name: item.product_name,
                unit: item.unit,
                requested_quantity: item.requested_quantity,
                requested_unit_price: item.requested_unit_price,
                quoted_quantity: item.quoted_quantity ?? item.requested_quantity,
                quoted_unit_price:
                    item.quoted_unit_price !== null
                        ? String(item.quoted_unit_price)
                        : item.requested_unit_price !== null
                            ? String(item.requested_unit_price)
                            : '',
            }))
        );
    };

    const updateQuoteItem = (id, field, value) => {
        setQuoteItems((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const computedQuoteTotal = quoteItems.reduce((sum, row) => {
        const price = Number(row.quoted_unit_price) || 0;
        const qty = Number(row.quoted_quantity) || 0;
        return sum + price * qty;
    }, 0);

    const handleQuoteSubmit = (e) => {
        e.preventDefault();
        if (!quoteTarget || isBusy) return;

        setIsBusy(true);
        router.post(
            `/seller/negotiations/${quoteTarget.id}/quote`,
            {
                valid_days: Number(quoteValidDays) || 14,
                payment_terms_note: quotePaymentTerms || null,
                seller_notes: quoteNotes || null,
                items: quoteItems.map((row) => ({
                    id: row.id,
                    quoted_quantity: Math.max(1, Number(row.quoted_quantity) || 1),
                    quoted_unit_price: Number(row.quoted_unit_price) || 0,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => setQuoteTarget(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectTarget || isBusy) return;

        setIsBusy(true);
        router.post(
            `/seller/negotiations/${rejectTarget.id}/reject`,
            { rejection_reason: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectTarget(null);
                    setRejectReason('');
                },
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const statusTabs = [
        { id: 'all', label: `Semua (${counts.all ?? 0})` },
        { id: 'submitted', label: `Menunggu Penawaran (${counts.submitted ?? 0})` },
        { id: 'quoted', label: `SPH Terkirim (${counts.quoted ?? 0})` },
        { id: 'agreed', label: `Disepakati (${counts.agreed ?? 0})` },
        { id: 'rejected', label: `Ditolak (${counts.rejected ?? 0})` },
        { id: 'cancelled', label: `Dibatalkan (${counts.cancelled ?? 0})` },
    ];

    const firstError = errors?.status || errors?.items || errors?.rejection_reason || errors?.valid_days;

    return (
        <SellerLayout
            title="Antrean RFQ Masuk & Penawaran SPH"
            searchQuery={searchQuery}
            onSearchChange={(val) => {
                setSearchQuery(val);
                if (val === '') applyFilter(activeStatus, '');
            }}
            searchPlaceholder="Cari nomor RFQ, SPH, instansi, atau produk..."
        >
            <Head title="Antrean RFQ Masuk & Penawaran SPH — CV. Putra Nugraha" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Antrean RFQ Masuk &amp; Penawaran Harga (SPH)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Tinjau permintaan pengadaan buyer, unduh lampiran RAB, lalu kirim penawaran harga resmi. Setelah buyer sepakat, harga &amp; jumlah terkunci permanen.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter(activeStatus, searchQuery);
                        }}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari RFQ / SPH / instansi..."
                            className="rounded-xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs w-56"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                        >
                            Cari
                        </button>
                    </form>
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

                {/* 4 KPI CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">Total RFQ</div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{counts.all ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">Menunggu Penawaran</div>
                        <div className="text-2xl font-extrabold text-amber-600 dark:text-[#f59e0b]">{counts.submitted ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">SPH Terkirim</div>
                        <div className="text-2xl font-extrabold text-[#086f8e] dark:text-[#38bdf8]">{counts.quoted ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">Disepakati (Deal)</div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{counts.agreed ?? 0}</div>
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {statusTabs.map((tab) => {
                        const active = activeStatus === tab.id;
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

                {/* RFQ TABLE */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden shadow-sm">
                    {rfqs.length === 0 ? (
                        <div className="p-12 text-center space-y-2">
                            <FileText className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Tidak ada pengajuan RFQ pada filter ini
                            </h3>
                            <p className="text-xs text-slate-500">
                                Permintaan penawaran dari buyer terverifikasi akan tampil otomatis di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] text-slate-500">
                                        <th className="py-3 px-4 font-semibold">No. RFQ / SPH</th>
                                        <th className="py-3 px-4 font-semibold">Instansi &amp; PIC</th>
                                        <th className="py-3 px-4 font-semibold">Item &amp; Lampiran</th>
                                        <th className="py-3 px-4 font-semibold">Nilai Penawaran</th>
                                        <th className="py-3 px-4 font-semibold">Status</th>
                                        <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rfqs.map((rfq) => {
                                        const badgeClass = STATUS_STYLES[rfq.status] || STATUS_STYLES.submitted;

                                        return (
                                            <tr key={rfq.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                        {rfq.rfq_number}
                                                    </div>
                                                    {rfq.sph_number && (
                                                        <div className="font-mono text-[11px] text-[#086f8e] dark:text-[#38bdf8] mt-0.5">
                                                            {rfq.sph_number}
                                                        </div>
                                                    )}
                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                        {rfq.created_at_formatted}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {rfq.company_name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        PIC: {rfq.pic_name} • {rfq.pic_phone || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                                                        {rfq.items
                                                            .map((i) => `${i.quoted_quantity ?? i.requested_quantity}x ${i.product_name}`)
                                                            .join(', ')}
                                                    </div>
                                                    {rfq.attachment && (
                                                        <a
                                                            href={rfq.attachment.download_url}
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                                        >
                                                            <Paperclip className="h-3 w-3" />
                                                            <span>{rfq.attachment.name}</span>
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {rfq.quoted_total !== null
                                                            ? formatRupiah(rfq.quoted_total)
                                                            : rfq.requested_total > 0
                                                                ? formatRupiah(rfq.requested_total)
                                                                : 'Belum ada harga'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {rfq.quoted_total !== null ? 'Harga SPH resmi' : 'Estimasi pagu buyer'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
                                                        {rfq.is_locked && <Lock className="h-3 w-3" />}
                                                        <span>{rfq.status_label}</span>
                                                    </span>
                                                    {rfq.order_number && (
                                                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                                                            Order: {rfq.order_number}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-top text-right">
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDetailRfq(rfq)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            <span>Detail</span>
                                                        </button>

                                                        {rfq.can_quote && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openQuoteModal(rfq)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                                                            >
                                                                <Send className="h-3 w-3" />
                                                                <span>{rfq.status === 'quoted' ? 'Revisi SPH' : 'Buat SPH'}</span>
                                                            </button>
                                                        )}

                                                        {rfq.can_reject && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setRejectTarget(rfq);
                                                                    setRejectReason('');
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-[11px] font-semibold"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                <span>Tolak</span>
                                                            </button>
                                                        )}
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

            {/* MODAL BUAT / REVISI PENAWARAN SPH */}
            <Modal show={Boolean(quoteTarget)} onClose={() => setQuoteTarget(null)} maxWidth="2xl">
                {quoteTarget && (
                    <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">
                                    Kirim Penawaran Harga (SPH) — {quoteTarget.rfq_number}
                                </h3>
                                <p className="text-slate-500 mt-0.5">
                                    {quoteTarget.company_name} (PIC: {quoteTarget.pic_name})
                                </p>
                            </div>
                            <button type="button" onClick={() => setQuoteTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                            {quoteItems.map((row) => (
                                <div
                                    key={row.id}
                                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                                >
                                    <div className="sm:col-span-5">
                                        <div className="font-semibold text-slate-900 dark:text-white">{row.product_name}</div>
                                        <div className="text-[11px] text-slate-500">
                                            Diminta: {row.requested_quantity} {row.unit}
                                            {row.requested_unit_price !== null
                                                ? ` • Pagu: ${formatRupiah(row.requested_unit_price)}`
                                                : ''}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-3 space-y-1">
                                        <label className="text-[11px] font-semibold">Qty Penawaran</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={row.quoted_quantity}
                                            onChange={(e) => updateQuoteItem(row.id, 'quoted_quantity', e.target.value)}
                                            className="w-full rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs"
                                        />
                                    </div>
                                    <div className="sm:col-span-4 space-y-1">
                                        <label className="text-[11px] font-semibold">Harga Satuan SPH (Rp) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="100"
                                            required
                                            value={row.quoted_unit_price}
                                            onChange={(e) => updateQuoteItem(row.id, 'quoted_unit_price', e.target.value)}
                                            placeholder="Masukkan harga satuan"
                                            className="w-full rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="font-semibold">Masa Berlaku (Hari) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    required
                                    value={quoteValidDays}
                                    onChange={(e) => setQuoteValidDays(e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                                <label className="font-semibold">Ketentuan Pembayaran (DP / Lunas)</label>
                                <input
                                    type="text"
                                    value={quotePaymentTerms}
                                    onChange={(e) => setQuotePaymentTerms(e.target.value)}
                                    placeholder="Contoh: DP 50% + Pelunasan saat Serah Terima"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Catatan Penawaran SPH</label>
                            <textarea
                                rows="2"
                                value={quoteNotes}
                                onChange={(e) => setQuoteNotes(e.target.value)}
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            />
                        </div>

                        <div className="rounded-xl bg-slate-100 dark:bg-[#12161F] px-4 py-3 flex items-center justify-between">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">Total Penawaran SPH (PPN 11%):</span>
                            <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                {formatRupiah(computedQuoteTotal)}
                            </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setQuoteTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isBusy}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold"
                            >
                                {isBusy ? 'Mengirim...' : 'Kirim Penawaran SPH'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL TOLAK RFQ */}
            <Modal show={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="md">
                {rejectTarget && (
                    <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold">Tolak Pengajuan {rejectTarget.rfq_number}</h3>
                            <button type="button" onClick={() => setRejectTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">
                                Alasan Penolakan <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="3"
                                required
                                minLength={5}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Tuliskan alasan penolakan RFQ..."
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setRejectTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                            <button
                                type="submit"
                                disabled={isBusy || rejectReason.trim().length < 5}
                                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold"
                            >
                                {isBusy ? 'Menyimpan...' : 'Konfirmasi Tolak'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL DETAIL RFQ */}
            <Modal show={Boolean(detailRfq)} onClose={() => setDetailRfq(null)} maxWidth="2xl">
                {detailRfq && (
                    <div className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold font-mono">{detailRfq.rfq_number}</h3>
                                <p className="text-slate-500 mt-0.5">
                                    {detailRfq.company_name} • {detailRfq.status_label}
                                </p>
                            </div>
                            <button type="button" onClick={() => setDetailRfq(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                                <div className="font-bold">Kontak &amp; Alamat</div>
                                <div>PIC: {detailRfq.pic_name}</div>
                                <div className="text-slate-500">{detailRfq.pic_email} • {detailRfq.pic_phone}</div>
                                <div className="text-slate-500">{detailRfq.shipping_address}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                                <div className="font-bold">Info Tambahan</div>
                                <div>NPWP: {detailRfq.npwp_number || '-'}</div>
                                <div>Termin: {detailRfq.payment_terms_note || '-'}</div>
                                <div>Target Kirim: {detailRfq.target_delivery_date_formatted || '-'}</div>
                                {detailRfq.buyer_notes && <div className="text-slate-500">Catatan Buyer: {detailRfq.buyer_notes}</div>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                                <span>Riwayat Negosiasi</span>
                            </div>
                            <div className="space-y-1.5 max-h-44 overflow-y-auto">
                                {detailRfq.responses.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] px-3 py-2"
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-semibold">
                                                {r.actor_name} ({r.actor_role === 'seller' ? 'Admin' : 'Buyer'}) — {r.action}
                                            </span>
                                            <span className="text-[11px] text-slate-400">{r.created_at_formatted}</span>
                                        </div>
                                        {r.message && <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </SellerLayout>
    );
}
