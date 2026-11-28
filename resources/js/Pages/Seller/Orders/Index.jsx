import { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Package,
    Box,
    CheckCircle2,
    Truck,
    AlertTriangle,
    X,
    ArrowRight,
    XCircle,
    Eye,
    Clock,
    MapPin,
    Save,
    CreditCard,
    FileText,
    Download,
    Printer,
    Paperclip,
    UploadCloud,
} from 'lucide-react';
import Modal from '@/Components/Modal';
import { formatRupiah } from '@/Components/Buyer/ProductCard';

const STATUS_BADGE_STYLES = {
    mou_order: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    dp_verification: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    unit_preparation: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    shipping: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
    handover: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    cancelled: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
};

const PAYMENT_BADGE_STYLES = {
    unpaid: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    dp_verified: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
    paid_in_full: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

export default function SellerOrdersIndex({
    orders = [],
    counts = {},
    stats = {},
    filters = {},
}) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const errors = props?.errors || {};

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const activeStatus = filters?.status || 'all';
    const [isBusy, setIsBusy] = useState(false);

    // Modals
    const [detailOrder, setDetailOrder] = useState(null);
    const [financeOrder, setFinanceOrder] = useState(null);
    const [advanceTarget, setAdvanceTarget] = useState(null);
    const [advanceNote, setAdvanceNote] = useState('');
    const [advanceSpk, setAdvanceSpk] = useState('');
    const [advanceDeliveryMethod, setAdvanceDeliveryMethod] = useState('expedition');
    const [advanceCourier, setAdvanceCourier] = useState('');
    const [advanceTracking, setAdvanceTracking] = useState('');

    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    // Inline SPK/Tracking edit in Detail modal
    const [editSpk, setEditSpk] = useState('');
    const [editDeliveryMethod, setEditDeliveryMethod] = useState('expedition');
    const [editCourier, setEditCourier] = useState('');
    const [editTracking, setEditTracking] = useState('');

    // Finance Modal: Direct Payment Form + Upload e-Faktur/BAST Form
    const [payType, setPayType] = useState('dp');
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('Transfer Bank');
    const [payRef, setPayRef] = useState('');
    const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [payNotes, setPayNotes] = useState('');

    const [docType, setDocType] = useState('efaktur');
    const [docNumber, setDocNumber] = useState('');
    const [docPeriod, setDocPeriod] = useState('');
    const [docFile, setDocFile] = useState(null);

    const applyFilter = (nextStatus, nextSearch = searchQuery) => {
        router.get(
            '/seller/orders',
            {
                status: nextStatus === 'all' ? undefined : nextStatus,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openAdvanceModal = (order) => {
        setAdvanceTarget(order);
        setAdvanceNote('');
        setAdvanceSpk(order.spk_number || '');
        setAdvanceDeliveryMethod(order.delivery_method || 'expedition');
        setAdvanceCourier(order.courier_name || '');
        setAdvanceTracking(order.tracking_number || '');
    };

    const handleAdvanceSubmit = (e) => {
        e.preventDefault();
        if (!advanceTarget?.next_status || isBusy) return;

        setIsBusy(true);
        router.post(
            `/seller/orders/${advanceTarget.id}/status`,
            {
                target_status: advanceTarget.next_status,
                note: advanceNote || null,
                spk_number: advanceSpk || null,
                delivery_method: advanceDeliveryMethod,
                courier_name: advanceCourier || null,
                tracking_number: advanceTracking || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setAdvanceTarget(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const openDetailModal = (order) => {
        setDetailOrder(order);
        setEditSpk(order.spk_number || '');
        setEditDeliveryMethod(order.delivery_method || 'expedition');
        setEditCourier(order.courier_name || '');
        setEditTracking(order.tracking_number || '');
    };

    const openFinanceModal = (order) => {
        setFinanceOrder(order);
        setPayType(order.verified_paid_amount > 0 ? 'full' : 'dp');
        setPayAmount(String(order.remaining_amount > 0 ? order.remaining_amount : order.total_amount));
        setPayMethod('Transfer Bank');
        setPayRef('');
        setPayDate(new Date().toISOString().slice(0, 10));
        setPayNotes('');
        setDocType('efaktur');
        setDocNumber('');
        setDocPeriod('');
        setDocFile(null);
    };

    const handleUpdateShipping = (e) => {
        e.preventDefault();
        if (!detailOrder || isBusy) return;

        setIsBusy(true);
        router.patch(
            `/seller/orders/${detailOrder.id}/shipping`,
            {
                spk_number: editSpk || null,
                delivery_method: editDeliveryMethod,
                courier_name: editCourier || null,
                tracking_number: editTracking || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setDetailOrder(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        if (!cancelTarget || isBusy) return;

        setIsBusy(true);
        router.post(
            `/seller/orders/${cancelTarget.id}/cancel`,
            { cancellation_reason: cancelReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCancelTarget(null);
                    setCancelReason('');
                },
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleRecordDirectPayment = (e) => {
        e.preventDefault();
        if (!financeOrder || isBusy) return;

        setIsBusy(true);
        router.post(
            `/seller/orders/${financeOrder.id}/payments`,
            {
                payment_type: payType,
                amount: Number(payAmount) || 0,
                payment_method: payMethod,
                payment_reference: payRef || null,
                paid_at: payDate,
                notes: payNotes || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setFinanceOrder(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleVerifyPayment = (paymentId) => {
        if (isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/payments/${paymentId}/verify`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setFinanceOrder(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleRejectPayment = (paymentId) => {
        const reason = window.prompt('Masukkan alasan penolakan bukti pembayaran (minimal 5 karakter):');
        if (!reason || reason.trim().length < 5 || isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/payments/${paymentId}/reject`,
            { rejection_reason: reason.trim() },
            {
                preserveScroll: true,
                onSuccess: () => setFinanceOrder(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleIssueInvoice = (orderId) => {
        if (isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/orders/${orderId}/invoice`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setFinanceOrder(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleIssueReceipt = (orderId) => {
        if (isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/orders/${orderId}/receipt`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setFinanceOrder(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleUploadDocument = (e) => {
        e.preventDefault();
        if (!financeOrder || !docFile || isBusy) return;
        setIsBusy(true);
        router.post(
            `/seller/orders/${financeOrder.id}/documents`,
            {
                type: docType,
                document_number: docNumber,
                tax_period: docPeriod || null,
                file: docFile,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setFinanceOrder(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const statusTabs = [
        { id: 'all', label: `Semua (${counts.all ?? 0})` },
        { id: 'mou_order', label: `MOU / Pesanan (${counts.mou_order ?? 0})` },
        { id: 'dp_verification', label: `DP / Verifikasi (${counts.dp_verification ?? 0})` },
        { id: 'unit_preparation', label: `Penyiapan Unit (${counts.unit_preparation ?? 0})` },
        { id: 'shipping', label: `Pengiriman (${counts.shipping ?? 0})` },
        { id: 'handover', label: `Serah Terima (${counts.handover ?? 0})` },
        { id: 'cancelled', label: `Dibatalkan (${counts.cancelled ?? 0})` },
    ];

    const firstError =
        errors?.target_status ||
        errors?.tracking_number ||
        errors?.status ||
        errors?.cancellation_reason ||
        errors?.invoice ||
        errors?.purchase_receipt ||
        errors?.payment ||
        errors?.document ||
        errors?.file;

    return (
        <SellerLayout
            title="Manajemen Pesanan & Pengiriman"
            searchQuery={searchQuery}
            onSearchChange={(val) => {
                setSearchQuery(val);
                if (val === '') applyFilter(activeStatus, '');
            }}
            searchPlaceholder="Cari nomor pesanan, instansi, PIC, SPK, atau nomor resi..."
            adminRole="Admin Internal"
            adminSubRole="Logistik & Pesanan"
            secondarySidebarLabel="Logistik & Pesanan"
        >
            <Head title="Manajemen Pesanan & Pengiriman — CV. Putra Nugraha" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                            Manajemen Pesanan, Pembayaran &amp; Pengiriman B2B
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Kelola 5 tahap pesanan, verifikasi pembayaran DP/pelunasan, terbitkan Invoice &amp; Bukti Pembelian, dan upload e-Faktur.
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
                            placeholder="Cari pesanan / instansi / resi..."
                            className="rounded-xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs w-56"
                        />
                        <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
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

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Pesanan Aktif</span>
                            <Package className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold">{stats.active_count ?? 0} Transaksi</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Penyiapan Unit</span>
                            <Box className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">{stats.preparation_count ?? 0} Pesanan</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Dalam Pengiriman</span>
                            <Truck className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div className="text-2xl font-bold">{stats.shipping_count ?? 0} Pesanan</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Selesai Bulan Ini</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold">{stats.completed_this_month ?? 0} Transaksi</div>
                    </div>
                </div>

                {/* STATUS TABS */}
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

                {/* ORDERS TABLE */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden shadow-sm">
                    {orders.length === 0 ? (
                        <div className="p-12 text-center space-y-2">
                            <Package className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold">Tidak ada pesanan pada filter ini</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] text-slate-500">
                                        <th className="py-3 px-4 font-semibold">No. Pesanan</th>
                                        <th className="py-3 px-4 font-semibold">Pemesan &amp; Instansi</th>
                                        <th className="py-3 px-4 font-semibold">Total &amp; Pembayaran</th>
                                        <th className="py-3 px-4 font-semibold">Tahap Status</th>
                                        <th className="py-3 px-4 font-semibold">Pengiriman / SPK</th>
                                        <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {orders.map((order) => {
                                        const badgeClass = STATUS_BADGE_STYLES[order.status] || STATUS_BADGE_STYLES.mou_order;
                                        const payBadge = PAYMENT_BADGE_STYLES[order.payment_status] || PAYMENT_BADGE_STYLES.unpaid;
                                        const pendingPayCount = (order.payments || []).filter((p) => p.status === 'pending').length;

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white">{order.order_number}</div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">{order.created_at_formatted}</div>
                                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                                        {order.source_label}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {order.buyer.company_name || order.buyer.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        PIC: {order.buyer.name} • {order.buyer.phone || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-bold text-slate-900 dark:text-white">{formatRupiah(order.total_amount)}</div>
                                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${payBadge}`}>
                                                            {order.payment_status_label}
                                                        </span>
                                                        {pendingPayCount > 0 && (
                                                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                                                                {pendingPayCount} Cek Bukti
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        Terbayar: {formatRupiah(order.verified_paid_amount)} • Dok: {(order.documents || []).length}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
                                                        {order.status_label}
                                                    </span>
                                                    {order.status !== 'cancelled' && (
                                                        <div className="text-[10px] text-slate-400 mt-1">Tahap {order.stage_index} / 5</div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-top text-[11px] text-slate-600 dark:text-slate-300">
                                                    <div>SPK: {order.spk_number || '-'}</div>
                                                    <div className="mt-0.5">
                                                        {order.delivery_method === 'internal_delivery'
                                                            ? 'Antar Langsung (Bandung)'
                                                            : `Resi: ${order.tracking_number || '-'}`}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top text-right">
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => openFinanceModal(order)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                                                        >
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            <span>Bayar &amp; Dok</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openDetailModal(order)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            <span>Detail</span>
                                                        </button>

                                                        {order.next_status && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openAdvanceModal(order)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                                                            >
                                                                <span>{order.next_status_label}</span>
                                                                <ArrowRight className="h-3 w-3" />
                                                            </button>
                                                        )}

                                                        {order.can_cancel && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCancelTarget(order);
                                                                    setCancelReason('');
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-[11px] font-semibold"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                <span>Batal</span>
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

            {/* MODAL PEMBAYARAN & DOKUMEN PESANAN (BUILD #5) */}
            <Modal show={Boolean(financeOrder)} onClose={() => setFinanceOrder(null)} maxWidth="2xl">
                {financeOrder && (
                    <div className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs max-h-[88vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">
                                    Pembayaran &amp; Dokumen — <span className="font-mono">{financeOrder.order_number}</span>
                                </h3>
                                <p className="text-slate-500 mt-0.5">
                                    Total: <strong>{formatRupiah(financeOrder.total_amount)}</strong> • Terbayar:{' '}
                                    <strong className="text-emerald-600">{formatRupiah(financeOrder.verified_paid_amount)}</strong> • Sisa:{' '}
                                    <strong>{formatRupiah(financeOrder.remaining_amount)}</strong>
                                </p>
                            </div>
                            <button type="button" onClick={() => setFinanceOrder(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* 1. Daftar Pembayaran & Verifikasi */}
                        <div className="space-y-2">
                            <div className="font-bold">Riwayat &amp; Verifikasi Pembayaran</div>
                            {financeOrder.payments && financeOrder.payments.length > 0 ? (
                                <div className="space-y-2">
                                    {financeOrder.payments.map((pay) => (
                                        <div
                                            key={pay.id}
                                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] p-3 flex flex-wrap items-center justify-between gap-2"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="font-bold">
                                                    {pay.payment_type_label}: {formatRupiah(pay.amount)} ({pay.status_label})
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {pay.payment_method} • {pay.paid_at_formatted}
                                                    {pay.payment_reference ? ` • Ref: ${pay.payment_reference}` : ''}
                                                </div>
                                                {pay.proof && (
                                                    <a
                                                        href={pay.proof.download_url}
                                                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline"
                                                    >
                                                        <Paperclip className="h-3 w-3" />
                                                        <span>Unduh Bukti: {pay.proof.name}</span>
                                                    </a>
                                                )}
                                            </div>
                                            {pay.status === 'pending' && (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleVerifyPayment(pay.id)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                                                    >
                                                        Verifikasi
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleRejectPayment(pay.id)}
                                                        className="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-600 text-[11px] font-semibold"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500">Belum ada pembayaran tercatat.</p>
                            )}
                        </div>

                        {/* 2. Catat Pembayaran Langsung (Auto-Verified) */}
                        {financeOrder.can_record_payment && (
                            <form
                                onSubmit={handleRecordDirectPayment}
                                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] p-4 space-y-3"
                            >
                                <div className="font-bold">Catat Pembayaran Diterima (Langsung Terverifikasi)</div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <select
                                        value={payType}
                                        onChange={(e) => setPayType(e.target.value)}
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs"
                                    >
                                        <option value="dp">Uang Muka (DP)</option>
                                        <option value="installment">Termin / Cicilan</option>
                                        <option value="full">Pelunasan / Bayar Penuh</option>
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        max={financeOrder.remaining_amount > 0 ? financeOrder.remaining_amount : undefined}
                                        required
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        placeholder="Nominal (Rp)"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs"
                                    />
                                    <input
                                        type="date"
                                        required
                                        max={new Date().toISOString().slice(0, 10)}
                                        value={payDate}
                                        onChange={(e) => setPayDate(e.target.value)}
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs"
                                    />
                                    <input
                                        type="text"
                                        required
                                        value={payMethod}
                                        onChange={(e) => setPayMethod(e.target.value)}
                                        placeholder="Metode (Transfer / Tunai)"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs"
                                    />
                                    <input
                                        type="text"
                                        value={payRef}
                                        onChange={(e) => setPayRef(e.target.value)}
                                        placeholder="No. Referensi (Opsional)"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isBusy}
                                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 text-xs"
                                    >
                                        Simpan Pembayaran
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* 3. Terbitkan Invoice & Bukti Pembelian + Upload e-Faktur */}
                        <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                            <div className="font-bold">Penerbitan Dokumen Resmi</div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                                    <div className="font-semibold flex items-center gap-1.5">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span>Invoice Resmi</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Syarat: Tahap ≥ DP / Verifikasi &amp; minimal DP terverifikasi.
                                    </p>
                                    <button
                                        type="button"
                                        disabled={!financeOrder.can_issue_invoice || isBusy}
                                        onClick={() => handleIssueInvoice(financeOrder.id)}
                                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs"
                                    >
                                        Terbitkan / Perbarui Invoice
                                    </button>
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                                    <div className="font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span>Bukti Pembelian (Lunas)</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Syarat: Pembayaran LUNAS &amp; pesanan pada tahap Serah Terima.
                                    </p>
                                    <button
                                        type="button"
                                        disabled={!financeOrder.can_issue_purchase_receipt || isBusy}
                                        onClick={() => handleIssueReceipt(financeOrder.id)}
                                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs"
                                    >
                                        Terbitkan Bukti Pembelian
                                    </button>
                                </div>
                            </div>

                            {/* Upload PDF e-Faktur / BAST */}
                            {financeOrder.status !== 'cancelled' && financeOrder.stage_index >= 2 && (
                                <form
                                    onSubmit={handleUploadDocument}
                                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] p-4 space-y-2.5"
                                >
                                    <div className="font-bold flex items-center gap-1.5">
                                        <UploadCloud className="h-4 w-4 text-amber-500" />
                                        <span>Upload PDF e-Faktur PPN 11% / BAST</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <select
                                            value={docType}
                                            onChange={(e) => setDocType(e.target.value)}
                                            className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs"
                                        >
                                            <option value="efaktur">e-Faktur PPN 11%</option>
                                            {financeOrder.stage_index >= 4 && (
                                                <option value="bast">BAST (PDF)</option>
                                            )}
                                        </select>
                                        <input
                                            type="text"
                                            required
                                            value={docNumber}
                                            onChange={(e) => setDocNumber(e.target.value)}
                                            placeholder="No. Seri Faktur / No. BAST"
                                            className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs font-mono"
                                        />
                                        <input
                                            type="text"
                                            value={docPeriod}
                                            onChange={(e) => setDocPeriod(e.target.value)}
                                            placeholder="Masa Pajak (Nov 2026)"
                                            className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs"
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <input
                                            type="file"
                                            required
                                            accept=".pdf,application/pdf"
                                            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                            className="text-xs"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!docFile || isBusy}
                                            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs"
                                        >
                                            Upload PDF
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* List Dokumen Sudah Terbit */}
                            {financeOrder.documents && financeOrder.documents.length > 0 && (
                                <div className="space-y-1.5">
                                    {financeOrder.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2"
                                        >
                                            <div>
                                                <span className="font-bold">{doc.type_label}</span> —{' '}
                                                <span className="font-mono">{doc.document_number}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {doc.print_url && (
                                                    <a
                                                        href={doc.print_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-[11px]"
                                                    >
                                                        <Printer className="h-3 w-3" />
                                                        <span>Cetak</span>
                                                    </a>
                                                )}
                                                <a
                                                    href={doc.download_url}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-white text-[11px]"
                                                >
                                                    <Download className="h-3 w-3" />
                                                    <span>PDF</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL ADVANCE STAGE (DENGAN OPSI ANTAR LANGSUNG BANDUNG) */}
            <Modal show={Boolean(advanceTarget)} onClose={() => setAdvanceTarget(null)} maxWidth="md">
                {advanceTarget && (
                    <form onSubmit={handleAdvanceSubmit} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">Lanjutkan Status Pesanan</h3>
                                <p className="text-slate-500 mt-0.5">
                                    {advanceTarget.order_number}: <strong>{advanceTarget.status_label}</strong> →{' '}
                                    <strong className="text-blue-600">{advanceTarget.next_status_label}</strong>
                                </p>
                            </div>
                            <button type="button" onClick={() => setAdvanceTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {advanceTarget.next_status === 'unit_preparation' && advanceTarget.verified_paid_amount <= 0 && (
                                <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Perhatian:</strong> Belum ada pembayaran DP terverifikasi untuk pesanan ini. Pastikan kesepakatan termin sudah dikonfirmasi sebelum masuk <strong>Penyiapan Unit</strong> (karena pesanan tidak bisa dibatalkan lagi setelah tahap ini).
                                    </span>
                                </div>
                            )}

                            {advanceTarget.next_status === 'handover' && !advanceTarget.is_paid_in_full && (
                                <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Perhatian:</strong> Pembayaran pesanan ini belum lunas (sisa tagihan <strong>{formatRupiah(advanceTarget.remaining_amount)}</strong>). Bukti Pembelian baru dapat diterbitkan setelah pelunasan dicatat.
                                    </span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="font-semibold">Nomor SPK / Referensi Internal (Opsional)</label>
                                <input
                                    type="text"
                                    value={advanceSpk}
                                    onChange={(e) => setAdvanceSpk(e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>

                            {advanceTarget.next_status === 'shipping' && (
                                <div className="space-y-3 rounded-xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-500/10 p-3.5">
                                    <div className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                                        <Truck className="h-4 w-4" />
                                        <span>Metode Pengiriman &amp; Resi</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAdvanceDeliveryMethod('expedition')}
                                            className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left ${
                                                advanceDeliveryMethod === 'expedition'
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12]'
                                            }`}
                                        >
                                            Ekspedisi / Kurir
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdvanceDeliveryMethod('internal_delivery')}
                                            className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left ${
                                                advanceDeliveryMethod === 'internal_delivery'
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12]'
                                            }`}
                                        >
                                            Antar Langsung (Bandung)
                                        </button>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-semibold">
                                            {advanceDeliveryMethod === 'internal_delivery'
                                                ? 'Keterangan Pengantar / Armada (Opsional)'
                                                : 'Kurir / Ekspedisi'}
                                        </label>
                                        <input
                                            type="text"
                                            value={advanceCourier}
                                            onChange={(e) => setAdvanceCourier(e.target.value)}
                                            placeholder={
                                                advanceDeliveryMethod === 'internal_delivery'
                                                    ? 'Armada Internal CV. Putra Nugraha (Bandung)'
                                                    : 'Contoh: JNE Cargo / J&T Cargo'
                                            }
                                            className="w-full rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-semibold">
                                            {advanceDeliveryMethod === 'internal_delivery'
                                                ? 'No. Surat Jalan (Opsional)'
                                                : 'Nomor Resi Pengiriman'}
                                            {advanceDeliveryMethod === 'expedition' && advanceTarget.has_goods_items && (
                                                <span className="text-rose-500"> *</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            required={advanceDeliveryMethod === 'expedition' && advanceTarget.has_goods_items}
                                            value={advanceTracking}
                                            onChange={(e) => setAdvanceTracking(e.target.value)}
                                            placeholder={
                                                advanceDeliveryMethod === 'internal_delivery'
                                                    ? 'Kosongkan atau isi kode surat jalan'
                                                    : 'Masukkan nomor resi ekspedisi'
                                            }
                                            className="w-full rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="font-semibold">Catatan Tahap (Opsional)</label>
                                <textarea
                                    rows="2"
                                    value={advanceNote}
                                    onChange={(e) => setAdvanceNote(e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setAdvanceTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold">
                                Batal
                            </button>
                            <button type="submit" disabled={isBusy} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50">
                                {isBusy ? 'Memproses...' : `Lanjut ke ${advanceTarget.next_status_label}`}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL DETAIL PESANAN + UPDATE SPK/RESI */}
            <Modal show={Boolean(detailOrder)} onClose={() => setDetailOrder(null)} maxWidth="2xl">
                {detailOrder && (
                    <div className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs max-h-[85vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-bold font-mono">{detailOrder.order_number}</h3>
                                <p className="text-slate-500 mt-0.5">
                                    {detailOrder.buyer.company_name || detailOrder.buyer.name} • {detailOrder.status_label}
                                </p>
                            </div>
                            <button type="button" onClick={() => setDetailOrder(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                                <div className="font-bold">Data Pemesan &amp; Pengiriman</div>
                                <div>{detailOrder.buyer.company_name}</div>
                                <div className="text-slate-500">PIC: {detailOrder.buyer.name} ({detailOrder.buyer.phone || '-'})</div>
                                <div className="text-slate-500 flex items-start gap-1.5 pt-1">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>{detailOrder.shipping_address}</span>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
                                <div className="font-bold">Rincian Item</div>
                                {detailOrder.items.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-2">
                                        <span className="truncate">{item.quantity}× {item.product_name}</span>
                                        <span className="font-semibold shrink-0">{formatRupiah(item.line_total)}</span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                                    <span>Total (PPN 11%)</span>
                                    <span>{formatRupiah(detailOrder.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {detailOrder.status !== 'cancelled' && detailOrder.status !== 'handover' && (
                            <form
                                onSubmit={handleUpdateShipping}
                                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] p-4 space-y-3"
                            >
                                <div className="font-bold">Perbarui Data SPK / Metode Pengiriman</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <input
                                        type="text"
                                        value={editSpk}
                                        onChange={(e) => setEditSpk(e.target.value)}
                                        placeholder="No. SPK"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                    />
                                    <select
                                        value={editDeliveryMethod}
                                        onChange={(e) => setEditDeliveryMethod(e.target.value)}
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                    >
                                        <option value="expedition">Ekspedisi / Kurir</option>
                                        <option value="internal_delivery">Antar Langsung (Armada Internal Bandung)</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={editCourier}
                                        onChange={(e) => setEditCourier(e.target.value)}
                                        placeholder="Kurir / Armada"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                    />
                                    <input
                                        type="text"
                                        value={editTracking}
                                        onChange={(e) => setEditTracking(e.target.value)}
                                        placeholder="Nomor Resi / Surat Jalan"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={isBusy} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 text-white font-semibold">
                                        <Save className="h-3.5 w-3.5" />
                                        <span>Simpan</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                                <span>Log Audit Status</span>
                            </div>
                            <div className="space-y-1.5">
                                {detailOrder.status_histories.map((h) => (
                                    <div key={h.id} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] px-3 py-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">
                                                {h.from_status_label ? `${h.from_status_label} → ` : ''}
                                                {h.to_status_label}
                                            </span>
                                            <span className="text-[11px] text-slate-400">{h.created_at_formatted}</span>
                                        </div>
                                        {h.note && <div className="text-[11px] text-slate-500 mt-0.5">{h.note}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL BATALKAN */}
            <Modal show={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} maxWidth="md">
                {cancelTarget && (
                    <form onSubmit={handleCancelSubmit} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold">Batalkan Pesanan {cancelTarget.order_number}</h3>
                            <button type="button" onClick={() => setCancelTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <textarea
                            rows="3"
                            required
                            minLength={5}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Alasan pembatalan..."
                            className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setCancelTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold">
                                Tutup
                            </button>
                            <button type="submit" disabled={isBusy || cancelReason.trim().length < 5} className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold disabled:opacity-50">
                                Konfirmasi Batalkan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </SellerLayout>
    );
}
