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

    // Modals
    const [detailOrder, setDetailOrder] = useState(null);
    const [advanceTarget, setAdvanceTarget] = useState(null);
    const [advanceNote, setAdvanceNote] = useState('');
    const [advanceSpk, setAdvanceSpk] = useState('');
    const [advanceCourier, setAdvanceCourier] = useState('');
    const [advanceTracking, setAdvanceTracking] = useState('');
    const [isAdvancing, setIsAdvancing] = useState(false);

    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Inline SPK/Tracking edit in Detail modal
    const [editSpk, setEditSpk] = useState('');
    const [editCourier, setEditCourier] = useState('');
    const [editTracking, setEditTracking] = useState('');
    const [isSavingShipping, setIsSavingShipping] = useState(false);

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

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        if (value === '') {
            applyFilter(activeStatus, '');
        }
    };

    const openAdvanceModal = (order) => {
        setAdvanceTarget(order);
        setAdvanceNote('');
        setAdvanceSpk(order.spk_number || '');
        setAdvanceCourier(order.courier_name || '');
        setAdvanceTracking(order.tracking_number || '');
    };

    const handleAdvanceSubmit = (e) => {
        e.preventDefault();
        if (!advanceTarget?.next_status || isAdvancing) return;

        setIsAdvancing(true);
        router.post(
            `/seller/orders/${advanceTarget.id}/status`,
            {
                target_status: advanceTarget.next_status,
                note: advanceNote || null,
                spk_number: advanceSpk || null,
                courier_name: advanceCourier || null,
                tracking_number: advanceTracking || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdvanceTarget(null);
                },
                onFinish: () => setIsAdvancing(false),
            }
        );
    };

    const openDetailModal = (order) => {
        setDetailOrder(order);
        setEditSpk(order.spk_number || '');
        setEditCourier(order.courier_name || '');
        setEditTracking(order.tracking_number || '');
    };

    const handleUpdateShipping = (e) => {
        e.preventDefault();
        if (!detailOrder || isSavingShipping) return;

        setIsSavingShipping(true);
        router.patch(
            `/seller/orders/${detailOrder.id}/shipping`,
            {
                spk_number: editSpk || null,
                courier_name: editCourier || null,
                tracking_number: editTracking || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setDetailOrder(null),
                onFinish: () => setIsSavingShipping(false),
            }
        );
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        if (!cancelTarget || isCancelling) return;

        setIsCancelling(true);
        router.post(
            `/seller/orders/${cancelTarget.id}/cancel`,
            { cancellation_reason: cancelReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCancelTarget(null);
                    setCancelReason('');
                },
                onFinish: () => setIsCancelling(false),
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
        errors?.cancellation_reason;

    return (
        <SellerLayout
            title="Manajemen Pesanan & Pengiriman"
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Cari nomor pesanan, instansi, PIC, SPK, atau nomor resi..."
            adminRole="Admin Internal"
            adminSubRole="Logistik & Pesanan"
            secondarySidebarLabel="Logistik & Pesanan"
        >
            <Head title="Manajemen Pesanan & Pengiriman — CV. Putra Nugraha" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                            Manajemen Pesanan &amp; Pengiriman B2B
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Kelola alur 5 tahap pesanan secara berurutan (MOU/Pesanan → DP/Verifikasi → Penyiapan Unit → Pengiriman → Serah Terima).
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
                            className="rounded-xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
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

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Pesanan Aktif</span>
                            <Package className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats.active_count ?? 0} Transaksi
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Tahap MOU s.d. Pengiriman
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Penyiapan Unit</span>
                            <Box className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats.preparation_count ?? 0} Pesanan
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Tidak dapat dibatalkan lagi
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Dalam Pengiriman</span>
                            <Truck className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats.shipping_count ?? 0} Pesanan
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Menunggu konfirmasi Serah Terima
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Selesai Bulan Ini</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats.completed_this_month ?? 0} Transaksi
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Total keseluruhan: {stats.total_count ?? 0} pesanan
                        </div>
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
                                        : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                            <Package className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Tidak ada pesanan pada filter ini
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Pesanan yang dibuat buyer terverifikasi akan tampil otomatis di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] text-slate-500 dark:text-slate-400">
                                        <th className="py-3 px-4 font-semibold">No. Pesanan</th>
                                        <th className="py-3 px-4 font-semibold">Pemesan &amp; Instansi</th>
                                        <th className="py-3 px-4 font-semibold">Item &amp; Total</th>
                                        <th className="py-3 px-4 font-semibold">Tahap Status</th>
                                        <th className="py-3 px-4 font-semibold">SPK / Resi</th>
                                        <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {orders.map((order) => {
                                        const badgeClass =
                                            STATUS_BADGE_STYLES[order.status] || STATUS_BADGE_STYLES.mou_order;
                                        return (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition"
                                            >
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                        {order.order_number}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {order.created_at_formatted}
                                                    </div>
                                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                                        {order.source_label}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {order.buyer.company_name || order.buyer.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        PIC: {order.buyer.name} • {order.buyer.phone || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {formatRupiah(order.total_amount)}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs truncate">
                                                        {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
                                                        {order.status_label}
                                                    </span>
                                                    {order.status !== 'cancelled' && (
                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                            Tahap {order.stage_index} dari 5
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-top text-[11px] text-slate-600 dark:text-slate-300">
                                                    <div>SPK: {order.spk_number || '-'}</div>
                                                    <div className="font-mono mt-0.5">
                                                        Resi: {order.tracking_number || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-top text-right">
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => openDetailModal(order)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold"
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
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[11px] font-semibold"
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

            {/* MODAL ADVANCE STAGE (1 TAHAP BERURUTAN) */}
            <Modal show={Boolean(advanceTarget)} onClose={() => setAdvanceTarget(null)} maxWidth="md">
                {advanceTarget && (
                    <form onSubmit={handleAdvanceSubmit} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Lanjutkan Status Pesanan
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {advanceTarget.order_number}:{' '}
                                    <strong>{advanceTarget.status_label}</strong> →{' '}
                                    <strong className="text-blue-600 dark:text-blue-400">{advanceTarget.next_status_label}</strong>
                                </p>
                            </div>
                            <button type="button" onClick={() => setAdvanceTarget(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Nomor SPK / Referensi Internal (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={advanceSpk}
                                    onChange={(e) => setAdvanceSpk(e.target.value)}
                                    placeholder="Contoh: SPK/PN/2026/001"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>

                            {advanceTarget.next_status === 'shipping' && (
                                <div className="space-y-3 rounded-xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-500/10 p-3.5">
                                    <div className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                                        <Truck className="h-4 w-4" />
                                        <span>Informasi Pengiriman &amp; Nomor Resi</span>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Kurir / Ekspedisi / Armada
                                        </label>
                                        <input
                                            type="text"
                                            value={advanceCourier}
                                            onChange={(e) => setAdvanceCourier(e.target.value)}
                                            placeholder="Contoh: JNE Cargo / Armada Internal CV. Putra Nugraha"
                                            className="w-full rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Nomor Resi Pengiriman {advanceTarget.has_goods_items && <span className="text-rose-500">*</span>}
                                        </label>
                                        <input
                                            type="text"
                                            required={advanceTarget.has_goods_items}
                                            value={advanceTracking}
                                            onChange={(e) => setAdvanceTracking(e.target.value)}
                                            placeholder="Masukkan nomor resi atau kode surat jalan"
                                            className="w-full rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Catatan Tahap (Opsional)
                                </label>
                                <textarea
                                    rows="2"
                                    value={advanceNote}
                                    onChange={(e) => setAdvanceNote(e.target.value)}
                                    placeholder="Catatan internal atau keterangan untuk buyer..."
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setAdvanceTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isAdvancing}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold"
                            >
                                {isAdvancing ? 'Memproses...' : `Lanjut ke ${advanceTarget.next_status_label}`}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL DETAIL PESANAN + UPDATE SPK/RESI */}
            <Modal show={Boolean(detailOrder)} onClose={() => setDetailOrder(null)} maxWidth="2xl">
                {detailOrder && (
                    <div className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white">
                                    {detailOrder.order_number}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {detailOrder.buyer.company_name || detailOrder.buyer.name} • {detailOrder.status_label}
                                </p>
                            </div>
                            <button type="button" onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                                <div className="font-bold">Data Pemesan &amp; Pengiriman</div>
                                <div>{detailOrder.buyer.company_name}</div>
                                <div className="text-slate-500">
                                    PIC: {detailOrder.buyer.name} ({detailOrder.buyer.phone || '-'})
                                </div>
                                <div className="text-slate-500 flex items-start gap-1.5 pt-1">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>{detailOrder.shipping_address}</span>
                                </div>
                                {detailOrder.shipping_notes && (
                                    <div className="text-slate-500">Catatan: {detailOrder.shipping_notes}</div>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
                                <div className="font-bold">Rincian Item</div>
                                {detailOrder.items.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-2">
                                        <span className="truncate">
                                            {item.quantity}× {item.product_name}
                                        </span>
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
                                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] p-4 space-y-3 text-xs"
                            >
                                <div className="font-bold">Perbarui Data SPK / Pengiriman</div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={editSpk}
                                        onChange={(e) => setEditSpk(e.target.value)}
                                        placeholder="No. SPK"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                                    />
                                    <input
                                        type="text"
                                        value={editCourier}
                                        onChange={(e) => setEditCourier(e.target.value)}
                                        placeholder="Kurir / Ekspedisi"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                                    />
                                    <input
                                        type="text"
                                        value={editTracking}
                                        onChange={(e) => setEditTracking(e.target.value)}
                                        placeholder="Nomor Resi"
                                        className="rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSavingShipping}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                                    >
                                        <Save className="h-3.5 w-3.5" />
                                        <span>{isSavingShipping ? 'Menyimpan...' : 'Simpan SPK / Resi'}</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2">
                            <div className="text-xs font-bold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                                <span>Log Audit Status</span>
                            </div>
                            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                {detailOrder.status_histories.map((h) => (
                                    <div
                                        key={h.id}
                                        className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] px-3 py-2 text-xs"
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-semibold">
                                                {h.from_status_label ? `${h.from_status_label} → ` : ''}
                                                {h.to_status_label}
                                            </span>
                                            <span className="text-[11px] text-slate-400">{h.created_at_formatted}</span>
                                        </div>
                                        {h.note && <div className="text-[11px] text-slate-500 mt-0.5">{h.note}</div>}
                                        <div className="text-[10px] text-slate-400">Oleh: {h.changed_by_name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL BATALKAN PESANAN */}
            <Modal show={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} maxWidth="md">
                {cancelTarget && (
                    <form onSubmit={handleCancelSubmit} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">Batalkan Pesanan {cancelTarget.order_number}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Stok barang yang sudah terpotong akan dikembalikan otomatis.
                                </p>
                            </div>
                            <button type="button" onClick={() => setCancelTarget(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-1 text-xs">
                            <label className="font-semibold">
                                Alasan Pembatalan <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="3"
                                required
                                minLength={5}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Tuliskan alasan pembatalan pesanan..."
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setCancelTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                            <button
                                type="submit"
                                disabled={isCancelling || cancelReason.trim().length < 5}
                                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold"
                            >
                                {isCancelling ? 'Membatalkan...' : 'Konfirmasi Batalkan'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </SellerLayout>
    );
}
