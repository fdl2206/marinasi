import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Search,
    Building2,
    LayoutDashboard,
    Package,
    FileText,
    Receipt,
    Wrench,
    LogOut,
    Calendar,
    CheckCircle2,
    Truck,
    MapPin,
    MessageCircle,
    XCircle,
    X,
    Clock,
    AlertTriangle,
    Eye,
    CreditCard,
    Download,
    Printer,
    Paperclip,
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';
import { getBuyerClientProfile } from '@/Utils/buyerProfile';

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

export default function BuyerOrdersIndex({
    orders = [],
    counts = {},
    filters = {},
}) {
    const { props } = usePage();
    const user = props?.auth?.user;
    const flash = props?.flash || {};
    const errors = props?.errors || {};
    const client = getBuyerClientProfile(user);

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [detailOrder, setDetailOrder] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isBusy, setIsBusy] = useState(false);

    // Upload Payment Modal
    const [payTarget, setPayTarget] = useState(null);
    const [payType, setPayType] = useState('dp');
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('Transfer Bank');
    const [payRef, setPayRef] = useState('');
    const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [payNotes, setPayNotes] = useState('');
    const [payProof, setPayProof] = useState(null);

    const activeStatus = filters?.status || 'all';

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: `Riwayat Pesanan (${counts.all ?? 0})`, icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Verifikasi', icon: Building2, href: '/buyer/profile' },
    ];

    const statusTabs = [
        { id: 'all', label: `Semua (${counts.all ?? 0})` },
        { id: 'mou_order', label: `MOU / Pesanan (${counts.mou_order ?? 0})` },
        { id: 'dp_verification', label: `DP / Verifikasi (${counts.dp_verification ?? 0})` },
        { id: 'unit_preparation', label: `Penyiapan Unit (${counts.unit_preparation ?? 0})` },
        { id: 'shipping', label: `Pengiriman (${counts.shipping ?? 0})` },
        { id: 'handover', label: `Serah Terima (${counts.handover ?? 0})` },
        { id: 'cancelled', label: `Dibatalkan (${counts.cancelled ?? 0})` },
    ];

    const applyFilter = (nextStatus, nextSearch = searchQuery) => {
        router.get(
            '/buyer/orders',
            {
                status: nextStatus === 'all' ? undefined : nextStatus,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openPaymentModal = (order) => {
        setPayTarget(order);
        setPayType(order.verified_paid_amount > 0 ? 'full' : 'dp');
        setPayAmount(String(order.remaining_amount > 0 ? order.remaining_amount : order.total_amount));
        setPayMethod('Transfer Bank');
        setPayRef('');
        setPayDate(new Date().toISOString().slice(0, 10));
        setPayNotes('');
        setPayProof(null);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!payTarget || isBusy) return;

        setIsBusy(true);
        router.post(
            `/buyer/orders/${payTarget.id}/payments`,
            {
                payment_type: payType,
                amount: Number(payAmount) || 0,
                payment_method: payMethod,
                payment_reference: payRef || null,
                paid_at: payDate,
                notes: payNotes || null,
                proof: payProof || null,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setPayTarget(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleCancelOrder = (e) => {
        e.preventDefault();
        if (!cancelTarget || isBusy) return;

        setIsBusy(true);
        router.post(
            `/buyer/orders/${cancelTarget.id}/cancel`,
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

    const firstError = errors?.status || errors?.cancellation_reason || errors?.payment || errors?.amount || errors?.proof;

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-150">
            <Head title="Riwayat Pesanan & Pengiriman — CV. Putra Nugraha" />

            <BuyerNavbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT SIDEBAR */}
                    <aside className="lg:col-span-3 space-y-5">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3.5 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Akun Perusahaan</span>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                                    {client.company_name}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">PIC: {client.pic_name}</p>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-semibold ${client.badge_class}`}>
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span>{client.tax_status}</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-2 space-y-1 shadow-sm">
                            {sidebarMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = item.id === 'orders';
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-1 px-1">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Keluar Akun</span>
                            </Link>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Riwayat Pesanan &amp; Pengiriman
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    Pantau progres 5 tahap, unggah bukti transfer DP/pelunasan, serta unduh Invoice &amp; e-Faktur resmi.
                                </p>
                            </div>
                            <Link
                                href="/portal"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-sm transition shrink-0"
                            >
                                <span>+ Buat Pesanan Baru</span>
                            </Link>
                        </div>

                        {flash?.success && (
                            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{flash.success}</span>
                                </div>
                                {flash?.whatsapp_url && (
                                    <a
                                        href={flash.whatsapp_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition shrink-0"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>Kirim Konfirmasi ke WhatsApp</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {firstError && (
                            <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{firstError}</span>
                            </div>
                        )}

                        {/* Filter Tabs & Search */}
                        <div className="space-y-3">
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
                                                    ? 'bg-[#086f8e] text-white shadow-sm'
                                                    : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    applyFilter(activeStatus, searchQuery);
                                }}
                                className="flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nomor pesanan, PR/SPK, nomor resi, atau nama produk..."
                                        className="w-full rounded-xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-xs"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Orders List */}
                        {orders.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-12 text-center space-y-3 shadow-sm">
                                <Package className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Pesanan</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Pesanan dari Direct Checkout atau kesepakatan RFQ akan tampil di sini.
                                </p>
                                <Link
                                    href="/portal"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition"
                                >
                                    Buka Katalog Pengadaan
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const isHighlighted = filters?.highlight && filters.highlight === order.order_number;
                                    const statusBadge = STATUS_BADGE_STYLES[order.status] || STATUS_BADGE_STYLES.mou_order;
                                    const payBadge = PAYMENT_BADGE_STYLES[order.payment_status] || PAYMENT_BADGE_STYLES.unpaid;

                                    return (
                                        <div
                                            key={order.id}
                                            className={`rounded-2xl border bg-white dark:bg-[#171B26] p-5 space-y-4 shadow-sm transition ${
                                                isHighlighted
                                                    ? 'border-[#086f8e] ring-2 ring-[#086f8e]/20'
                                                    : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                                                            {order.order_number}
                                                        </span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
                                                            {order.status_label}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${payBadge}`}>
                                                            {order.payment_status_label}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                            {order.source_label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {order.created_at_formatted}
                                                        </span>
                                                        {order.pr_reference && <span>PR/RFQ: {order.pr_reference}</span>}
                                                        {order.spk_number && <span>SPK/SPH: {order.spk_number}</span>}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-[11px] text-slate-500">Total Tagihan</div>
                                                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                                                        {formatRupiah(order.total_amount)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        Terbayar: <strong className="text-emerald-600 dark:text-emerald-400">{formatRupiah(order.verified_paid_amount)}</strong>
                                                        {order.remaining_amount > 0 && ` • Sisa: ${formatRupiah(order.remaining_amount)}`}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5-Stage Progress */}
                                            {order.status === 'cancelled' ? (
                                                <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                                                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold">Pesanan Dibatalkan:</span>{' '}
                                                        {order.cancellation_reason || 'Tidak ada keterangan.'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                    {order.stages.map((stage) => (
                                                        <div
                                                            key={stage.key}
                                                            className={`rounded-xl border px-3 py-2 text-[11px] ${
                                                                stage.is_current
                                                                    ? 'border-[#086f8e] bg-sky-50/60 dark:bg-[#086f8e]/15 text-[#086f8e] dark:text-cyan-300 font-bold'
                                                                    : stage.is_completed
                                                                        ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                                                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#12161F] text-slate-400'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] opacity-75">{stage.step}.</span>
                                                                <span className="truncate">{stage.label}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Delivery / Tracking Info */}
                                            {(order.tracking_number || (order.stage_index >= 4 && order.delivery_method === 'internal_delivery')) && (
                                                <div className="rounded-xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/60 dark:bg-cyan-500/10 px-3.5 py-2.5 text-xs text-cyan-900 dark:text-cyan-200 flex items-center gap-2 flex-wrap">
                                                    <Truck className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                                    {order.delivery_method === 'internal_delivery' ? (
                                                        <span>
                                                            <strong>Antar Langsung (Armada Internal Bandung)</strong>
                                                            {order.courier_name ? ` — ${order.courier_name}` : ''}
                                                            {order.tracking_number ? ` • Ref: ${order.tracking_number}` : ''}
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            Pengiriman{order.courier_name ? ` via ${order.courier_name}` : ''} • No. Resi:{' '}
                                                            <strong className="font-mono">{order.tracking_number}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Issued Documents Quick Chips */}
                                            {order.documents && order.documents.length > 0 && (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {order.documents.map((doc) => (
                                                        <a
                                                            key={doc.id}
                                                            href={doc.print_url || doc.download_url}
                                                            target={doc.print_url ? '_blank' : undefined}
                                                            rel={doc.print_url ? 'noopener noreferrer' : undefined}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-[11px] font-semibold hover:underline"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            <span>{doc.type_label}: {doc.document_number}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Items Summary */}
                                            <div className="space-y-1.5">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                        <div className="truncate">
                                                            <span className="font-semibold text-slate-900 dark:text-white">{item.quantity}×</span>{' '}
                                                            {item.product_name} <span className="text-slate-400">({item.unit || 'unit'})</span>
                                                        </div>
                                                        <div className="font-semibold text-slate-900 dark:text-white shrink-0">
                                                            {formatRupiah(item.line_total)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate max-w-sm">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{order.shipping_address}</span>
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailOrder(order)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Detail &amp; Dokumen</span>
                                                    </button>

                                                    {order.can_upload_payment && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openPaymentModal(order)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-semibold"
                                                        >
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            <span>Upload Bukti Bayar</span>
                                                        </button>
                                                    )}

                                                    {order.status !== 'cancelled' && (
                                                        <a
                                                            href={order.whatsapp_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                                                        >
                                                            <MessageCircle className="h-3.5 w-3.5" />
                                                            <span>WA Admin</span>
                                                        </a>
                                                    )}

                                                    {order.can_cancel && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCancelTarget(order);
                                                                setCancelReason('');
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            <span>Batalkan</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL UPLOAD BUKTI PEMBAYARAN */}
            <Modal show={Boolean(payTarget)} onClose={() => setPayTarget(null)} maxWidth="md">
                {payTarget && (
                    <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">Upload Bukti Pembayaran</h3>
                                <p className="text-slate-500 mt-0.5">
                                    {payTarget.order_number} • Sisa tagihan: <strong>{formatRupiah(payTarget.remaining_amount)}</strong>
                                </p>
                            </div>
                            <button type="button" onClick={() => setPayTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-semibold">Jenis Pembayaran *</label>
                                    <select
                                        value={payType}
                                        onChange={(e) => setPayType(e.target.value)}
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                    >
                                        <option value="dp">Uang Muka (DP)</option>
                                        <option value="installment">Termin / Cicilan</option>
                                        <option value="full">Pelunasan / Bayar Penuh</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold">Tanggal Bayar *</label>
                                    <input
                                        type="date"
                                        required
                                        max={new Date().toISOString().slice(0, 10)}
                                        value={payDate}
                                        onChange={(e) => setPayDate(e.target.value)}
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold">Nominal Dibayar (Rp) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={payTarget.remaining_amount > 0 ? payTarget.remaining_amount : undefined}
                                    required
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-semibold">Metode Pembayaran *</label>
                                    <input
                                        type="text"
                                        required
                                        value={payMethod}
                                        onChange={(e) => setPayMethod(e.target.value)}
                                        placeholder="Transfer Bank Mandiri / BCA"
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold">No. Referensi (Opsional)</label>
                                    <input
                                        type="text"
                                        value={payRef}
                                        onChange={(e) => setPayRef(e.target.value)}
                                        placeholder="Ref transfer"
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold">Bukti Transfer (PDF/JPG/PNG, maks 5 MB)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setPayProof(e.target.files?.[0] || null)}
                                    className="w-full text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold">Catatan (Opsional)</label>
                                <textarea
                                    rows="2"
                                    value={payNotes}
                                    onChange={(e) => setPayNotes(e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setPayTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isBusy}
                                className="px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] disabled:opacity-50 text-white text-xs font-bold"
                            >
                                {isBusy ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL DETAIL, PEMBAYARAN, DOKUMEN & RIWAYAT */}
            <Modal show={Boolean(detailOrder)} onClose={() => setDetailOrder(null)} maxWidth="2xl">
                {detailOrder && (
                    <div className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs max-h-[85vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-bold font-mono">{detailOrder.order_number}</h3>
                                <p className="text-slate-500 mt-0.5">
                                    Status: <strong>{detailOrder.status_label}</strong> • Pembayaran: <strong>{detailOrder.payment_status_label}</strong>
                                </p>
                            </div>
                            <button type="button" onClick={() => setDetailOrder(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Dokumen Resmi */}
                        <div className="space-y-2">
                            <div className="font-bold">Dokumen Resmi Pesanan</div>
                            {detailOrder.documents && detailOrder.documents.length > 0 ? (
                                <div className="space-y-1.5">
                                    {detailOrder.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] px-3 py-2 flex items-center justify-between gap-2 flex-wrap"
                                        >
                                            <div>
                                                <span className="font-bold">{doc.type_label}</span> —{' '}
                                                <span className="font-mono">{doc.document_number}</span>
                                                <div className="text-[10px] text-slate-400">Terbit: {doc.issued_at_formatted}</div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {doc.print_url && (
                                                    <a
                                                        href={doc.print_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-[11px] font-semibold"
                                                    >
                                                        <Printer className="h-3 w-3" />
                                                        <span>Cetak</span>
                                                    </a>
                                                )}
                                                <a
                                                    href={doc.download_url}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#086f8e] text-white text-[11px] font-semibold"
                                                >
                                                    <Download className="h-3 w-3" />
                                                    <span>PDF</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500">Belum ada dokumen (Invoice terbit setelah DP diverifikasi admin).</p>
                            )}
                        </div>

                        {/* Riwayat Pembayaran */}
                        <div className="space-y-2">
                            <div className="font-bold">Riwayat Pembayaran</div>
                            {detailOrder.payments && detailOrder.payments.length > 0 ? (
                                <div className="space-y-1.5">
                                    {detailOrder.payments.map((pay) => (
                                        <div
                                            key={pay.id}
                                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] px-3 py-2 space-y-1"
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-semibold">
                                                    {pay.payment_type_label} — {formatRupiah(pay.amount)}
                                                </span>
                                                <span className="font-bold">{pay.status_label}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {pay.payment_method} • {pay.paid_at_formatted}
                                                {pay.payment_reference ? ` • Ref: ${pay.payment_reference}` : ''}
                                            </div>
                                            {pay.rejection_reason && (
                                                <div className="text-[11px] text-rose-600 dark:text-rose-400">
                                                    Alasan ditolak: {pay.rejection_reason}
                                                </div>
                                            )}
                                            {pay.proof && (
                                                <a
                                                    href={pay.proof.download_url}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#086f8e] hover:underline"
                                                >
                                                    <Paperclip className="h-3 w-3" />
                                                    <span>Unduh Bukti: {pay.proof.name}</span>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500">Belum ada catatan pembayaran.</p>
                            )}
                        </div>

                        {/* Riwayat Status */}
                        <div className="space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-[#086f8e]" />
                                <span>Riwayat Perubahan Status</span>
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
                                        {h.note && <p className="text-[11px] text-slate-500 mt-0.5">{h.note}</p>}
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
                    <form onSubmit={handleCancelOrder} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">Batalkan Pesanan {cancelTarget.order_number}</h3>
                                <p className="text-slate-500 mt-0.5">Pembatalan hanya dapat dilakukan sebelum tahap Penyiapan Unit.</p>
                            </div>
                            <button type="button" onClick={() => setCancelTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <label className="font-semibold">Alasan Pembatalan *</label>
                            <textarea
                                rows="3"
                                required
                                minLength={5}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                            />
                        </div>
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

            <BuyerFooter />
        </div>
    );
}
