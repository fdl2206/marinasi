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
    CheckCircle2,
    Plus,
    Paperclip,
    Lock,
    XCircle,
    X,
    Clock,
    AlertTriangle,
    Eye,
    ArrowRight,
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import { getBuyerClientProfile } from '@/Utils/buyerProfile';

const STATUS_STYLES = {
    submitted: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    quoted: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
    agreed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    rejected: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export default function QuotationsIndex({
    quotations = [],
    counts = {},
    filters = {},
}) {
    const { props } = usePage();
    const user = props?.auth?.user;
    const flash = props?.flash || {};
    const errors = props?.errors || {};
    const client = getBuyerClientProfile(user);

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [detailRfq, setDetailRfq] = useState(null);
    const [agreeTarget, setAgreeTarget] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isBusy, setIsBusy] = useState(false);

    const activeStatus = filters?.status || 'all';

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: `Status RFQ / SPH (${counts.all ?? 0})`, icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Verifikasi', icon: Building2, href: '/buyer/profile' },
    ];

    const filterTabs = [
        { id: 'all', label: `Semua (${counts.all ?? 0})` },
        { id: 'submitted', label: `Menunggu Penawaran (${counts.submitted ?? 0})` },
        { id: 'quoted', label: `SPH Diterbitkan (${counts.quoted ?? 0})` },
        { id: 'agreed', label: `Disepakati (${counts.agreed ?? 0})` },
        { id: 'rejected', label: `Ditolak (${counts.rejected ?? 0})` },
        { id: 'cancelled', label: `Dibatalkan (${counts.cancelled ?? 0})` },
    ];

    const applyFilter = (nextStatus, nextSearch = searchQuery) => {
        router.get(
            '/buyer/quotations',
            {
                status: nextStatus === 'all' ? undefined : nextStatus,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAgree = () => {
        if (!agreeTarget || isBusy) return;
        setIsBusy(true);
        router.post(
            `/buyer/quotations/${agreeTarget.id}/agree`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setAgreeTarget(null),
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!rejectTarget || isBusy) return;
        setIsBusy(true);
        router.post(
            `/buyer/quotations/${rejectTarget.id}/reject`,
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

    const handleCancel = (rfq) => {
        if (isBusy) return;
        if (!window.confirm(`Batalkan pengajuan ${rfq.rfq_number}?`)) return;
        setIsBusy(true);
        router.post(
            `/buyer/quotations/${rfq.id}/cancel`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsBusy(false),
            }
        );
    };

    const firstError = errors?.status || errors?.rejection_reason || errors?.verification;

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-150">
            <Head title="Status Pengajuan RFQ & SPH — CV. Putra Nugraha" />

            <BuyerNavbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT SIDEBAR (3 Cols) */}
                    <aside className="lg:col-span-3 space-y-5">
                        <div className="rounded-2xl bg-[#0a2540] p-4 sm:p-5 space-y-3 text-white shadow-sm border border-[#0a2540]">
                            <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5 text-white" />
                                <span>Akun Perusahaan</span>
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                                    {client.company_name}
                                </h2>
                                <p className="text-xs text-slate-300">PIC: {client.pic_name}</p>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-semibold w-full ${client.dark_badge_class}`}>
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{client.tax_status}</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-2 space-y-1 shadow-sm">
                            {sidebarMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = item.id === 'rfq';
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                                            isActive
                                                ? 'bg-[#086f8e] text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Keluar Akun</span>
                            </Link>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT (9 Cols) */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="text-[10px] sm:text-xs font-bold text-[#086f8e] dark:text-[#38bdf8] uppercase tracking-wider">
                                    DASHBOARD KLIEN / RFQ &amp; SPH
                                </div>
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Status Pengajuan RFQ &amp; Penawaran Harga (SPH)
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                    Pantau penawaran resmi dari CV. Putra Nugraha, setujui SPH untuk mengunci harga &amp; jumlah, lalu lanjutkan ke pesanan.
                                </p>
                            </div>

                            <Link
                                href="/buyer/rfq/create"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-xs transition self-start shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Buat Pengajuan RFQ Baru</span>
                            </Link>
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

                        {/* 4 KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">Total Pengajuan</div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{counts.all ?? 0} RFQ</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">Menunggu Penawaran</div>
                                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{counts.submitted ?? 0} RFQ</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">SPH Diterbitkan</div>
                                <div className="text-2xl font-extrabold text-[#086f8e] dark:text-[#38bdf8]">{counts.quoted ?? 0} SPH</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">Disepakati / Terkunci</div>
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{counts.agreed ?? 0} RFQ</div>
                            </div>
                        </div>

                        {/* Tabs & Search */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {filterTabs.map((tab) => {
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
                                        placeholder="Cari nomor RFQ, nomor SPH, atau nama produk/jasa..."
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

                        {/* Quotations List */}
                        {quotations.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-12 text-center space-y-3 shadow-sm">
                                <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Belum Ada Pengajuan RFQ
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    Ajukan permintaan penawaran harga (RFQ) untuk kebutuhan proyek, pengadaan grosir, atau item tanpa harga acuan.
                                </p>
                                <Link
                                    href="/buyer/rfq/create"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Buat RFQ Pertama</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {quotations.map((rfq) => {
                                    const badgeStyle = STATUS_STYLES[rfq.status] || STATUS_STYLES.submitted;

                                    return (
                                        <div
                                            key={rfq.id}
                                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-4 shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                                                            {rfq.rfq_number}
                                                        </span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
                                                            {rfq.status_label}
                                                        </span>
                                                        {rfq.is_locked && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                                                <Lock className="h-3 w-3" />
                                                                Harga &amp; Qty Terkunci
                                                            </span>
                                                        )}
                                                        {rfq.is_expired && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                SPH Kedaluwarsa
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                                                        <span>Diajukan: {rfq.created_at_formatted}</span>
                                                        {rfq.sph_number && <span className="font-mono font-semibold text-[#086f8e] dark:text-[#38bdf8]">SPH: {rfq.sph_number}</span>}
                                                        {rfq.valid_until_formatted && <span>Berlaku s.d. {rfq.valid_until_formatted}</span>}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-[11px] text-slate-500">
                                                        {rfq.quoted_total !== null ? 'Total Penawaran SPH' : 'Estimasi Pagu'}
                                                    </div>
                                                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                                                        {rfq.quoted_total !== null
                                                            ? formatRupiah(rfq.quoted_total)
                                                            : rfq.requested_total > 0
                                                                ? formatRupiah(rfq.requested_total)
                                                                : 'Menunggu Penawaran'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="text-[11px] text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                                            <th className="py-1.5 pr-3">Item</th>
                                                            <th className="py-1.5 px-2 text-right">Qty Diminta</th>
                                                            <th className="py-1.5 px-2 text-right">Qty SPH</th>
                                                            <th className="py-1.5 px-2 text-right">Harga SPH / Satuan</th>
                                                            <th className="py-1.5 pl-2 text-right">Subtotal SPH</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                        {rfq.items.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-white">
                                                                    {item.product_name}{' '}
                                                                    <span className="text-[10px] text-slate-400">({item.unit})</span>
                                                                </td>
                                                                <td className="py-2 px-2 text-right text-slate-500">{item.requested_quantity}</td>
                                                                <td className="py-2 px-2 text-right font-semibold">
                                                                    {item.quoted_quantity ?? '-'}
                                                                </td>
                                                                <td className="py-2 px-2 text-right">
                                                                    {item.quoted_unit_price !== null ? formatRupiah(item.quoted_unit_price) : '-'}
                                                                </td>
                                                                <td className="py-2 pl-2 text-right font-bold">
                                                                    {item.quoted_line_total !== null ? formatRupiah(item.quoted_line_total) : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {rfq.seller_notes && (
                                                <div className="rounded-xl bg-sky-50/70 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-3.5 py-2.5 text-xs text-sky-900 dark:text-sky-200">
                                                    <strong>Catatan Penawaran Admin:</strong> {rfq.seller_notes}
                                                </div>
                                            )}

                                            {rfq.rejection_reason && (
                                                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                                                    <strong>Alasan Penolakan:</strong> {rfq.rejection_reason}
                                                </div>
                                            )}

                                            {rfq.is_expired && (
                                                <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex flex-wrap items-center justify-between gap-2">
                                                    <span>
                                                        Masa berlaku penawaran SPH ini telah berakhir pada <strong>{rfq.valid_until_formatted}</strong>. Ajukan RFQ baru atau minta admin menerbitkan revisi SPH.
                                                    </span>
                                                    <Link href="/buyer/rfq/create" className="font-bold underline">
                                                        Ajukan RFQ Baru
                                                    </Link>
                                                </div>
                                            )}

                                            {rfq.is_locked && (
                                                <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center justify-between gap-2">
                                                    <span>
                                                        Harga &amp; jumlah sudah terkunci pada pesanan{' '}
                                                        <strong className="font-mono">{rfq.order_number}</strong>. Butuh perubahan? Ajukan RFQ baru.
                                                    </span>
                                                    <Link href="/buyer/rfq/create" className="font-bold underline">
                                                        Ajukan RFQ Baru
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Actions Footer */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    {rfq.attachment && (
                                                        <a
                                                            href={rfq.attachment.download_url}
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8] hover:underline"
                                                        >
                                                            <Paperclip className="h-3.5 w-3.5" />
                                                            <span>Unduh Lampiran: {rfq.attachment.name}</span>
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailRfq(rfq)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Detail &amp; Riwayat</span>
                                                    </button>

                                                    {rfq.can_agree && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAgreeTarget(rfq)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span>Setujui &amp; Buat Pesanan</span>
                                                        </button>
                                                    )}

                                                    {rfq.can_reject && rfq.status === 'quoted' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRejectTarget(rfq);
                                                                setRejectReason('');
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            <span>Tolak SPH</span>
                                                        </button>
                                                    )}

                                                    {rfq.can_cancel && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancel(rfq)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                                                        >
                                                            <span>Batalkan</span>
                                                        </button>
                                                    )}

                                                    {rfq.order_number && (
                                                        <Link
                                                            href={`/buyer/orders?highlight=${encodeURIComponent(rfq.order_number)}`}
                                                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold"
                                                        >
                                                            <span>Lihat Pesanan</span>
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                        </Link>
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

            {/* MODAL KONFIRMASI SETUJUI SPH -> KUNCI & BUAT ORDER */}
            <Modal show={Boolean(agreeTarget)} onClose={() => setAgreeTarget(null)} maxWidth="md">
                {agreeTarget && (
                    <div className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">Setujui Penawaran {agreeTarget.sph_number}?</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{agreeTarget.rfq_number}</p>
                            </div>
                            <button type="button" onClick={() => setAgreeTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                                <Lock className="h-4 w-4 shrink-0" />
                                <span>Harga &amp; Jumlah Akan Terkunci Permanen</span>
                            </div>
                            <p>
                                Total kesepakatan <strong>{formatRupiah(agreeTarget.quoted_total)}</strong> akan langsung dikonversi menjadi <strong>Pesanan Resmi (Tahap MOU / Pesanan)</strong>. Jika di kemudian hari butuh perubahan harga atau jumlah, Anda harus mengajukan RFQ baru.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setAgreeTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={handleAgree}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold"
                            >
                                {isBusy ? 'Memproses...' : 'Ya, Sepakati & Buat Pesanan'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL TOLAK PENAWARAN */}
            <Modal show={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="md">
                {rejectTarget && (
                    <form onSubmit={handleReject} className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold">Tolak Penawaran {rejectTarget.sph_number}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{rejectTarget.rfq_number}</p>
                            </div>
                            <button type="button" onClick={() => setRejectTarget(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-1.5 text-xs">
                            <label className="font-semibold">
                                Alasan Penolakan <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="3"
                                required
                                minLength={5}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Contoh: Harga melebihi pagu anggaran, akan mengajukan RFQ revisi..."
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
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

            {/* MODAL DETAIL & RIWAYAT */}
            <Modal show={Boolean(detailRfq)} onClose={() => setDetailRfq(null)} maxWidth="2xl">
                {detailRfq && (
                    <div className="p-6 space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold font-mono">{detailRfq.rfq_number}</h3>
                                <p className="text-slate-500 mt-0.5">
                                    {detailRfq.company_name} • Status: <strong>{detailRfq.status_label}</strong>
                                </p>
                            </div>
                            <button type="button" onClick={() => setDetailRfq(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                                <div className="font-bold">Alamat &amp; PIC</div>
                                <div>PIC: {detailRfq.pic_name} ({detailRfq.pic_phone})</div>
                                <div className="text-slate-500">{detailRfq.shipping_address}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                                <div className="font-bold">Termin &amp; Target</div>
                                <div>Termin: {detailRfq.payment_terms_note || '-'}</div>
                                <div>Target Kirim: {detailRfq.target_delivery_date_formatted || '-'}</div>
                                <div>NPWP: {detailRfq.npwp_number || '-'}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-[#086f8e]" />
                                <span>Riwayat Negosiasi</span>
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
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

            <BuyerFooter />
        </div>
    );
}
