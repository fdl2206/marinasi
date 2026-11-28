import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    LayoutDashboard,
    Package,
    FileText,
    Receipt,
    Wrench,
    LogOut,
    CheckCircle2,
    ArrowRight,
    Clock,
    TrendingUp,
    ShoppingBag,
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import { getBuyerClientProfile } from '@/Utils/buyerProfile';

export default function BuyerDashboard({
    metrics = {},
    active_order: activeOrder = null,
    recent_orders: recentOrders = [],
    recent_rfqs: recentRfqs = [],
}) {
    const { props } = usePage();
    const client = getBuyerClientProfile(props?.auth?.user);

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: `Riwayat Pesanan (${metrics.total_orders_count ?? 0})`, icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: `Status RFQ / SPH (${metrics.total_rfq_count ?? 0})`, icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: `Dokumen & Faktur (${metrics.available_documents_count ?? 0})`, icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Verifikasi', icon: Building2, href: '/buyer/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-150">
            <Head title="Dashboard Klien B2B — CV. Putra Nugraha" />

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
                                const isActive = item.id === 'overview';
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
                                    Ringkasan Pengadaan — {client.company_name}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Pantau progres pesanan aktif, penawaran RFQ, dan arsip dokumen pajak secara real-time.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    href="/portal"
                                    className="px-4 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-sm transition"
                                >
                                    Buka Katalog
                                </Link>
                                <Link
                                    href="/buyer/rfq/create"
                                    className="px-4 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold shadow-sm transition"
                                >
                                    + Ajukan RFQ
                                </Link>
                            </div>
                        </div>

                        {!client.is_verified && (
                            <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
                                <div>
                                    <strong>Status Akun: {client.tax_status}.</strong> Lengkapi verifikasi dokumen instansi agar dapat melakukan Direct Checkout dan mengajukan RFQ.
                                </div>
                                <Link
                                    href="/buyer/profile"
                                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 text-center"
                                >
                                    Lengkapi Verifikasi
                                </Link>
                            </div>
                        )}

                        {/* 4 REAL KPI CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link href="/buyer/orders" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm hover:border-[#086f8e] transition">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Pesanan Aktif</span>
                                    <Package className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.active_orders_count ?? 0}
                                </div>
                                <div className="text-[11px] text-slate-400">Dari total {metrics.total_orders_count ?? 0} pesanan</div>
                            </Link>

                            <Link href="/buyer/quotations" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm hover:border-[#086f8e] transition">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>RFQ Berjalan</span>
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.pending_rfq_count ?? 0}
                                </div>
                                <div className="text-[11px] text-slate-400">Menunggu SPH / Persetujuan</div>
                            </Link>

                            <Link href="/buyer/invoices" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm hover:border-[#086f8e] transition">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Dokumen &amp; Faktur</span>
                                    <Receipt className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.available_documents_count ?? 0}
                                </div>
                                <div className="text-[11px] text-slate-400">Invoice, e-Faktur, Bukti</div>
                            </Link>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Total Pengadaan {metrics.current_year}</span>
                                    <TrendingUp className="h-4 w-4 text-[#086f8e]" />
                                </div>
                                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                                    {formatRupiah(metrics.yearly_spend ?? 0)}
                                </div>
                                <div className="text-[11px] text-slate-400">Termasuk PPN 11%</div>
                            </div>
                        </div>

                        {/* ACTIVE ORDER TRACKER */}
                        {activeOrder && (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-4 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#086f8e] dark:text-[#38bdf8]">
                                            Pesanan Aktif Terbaru
                                        </div>
                                        <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
                                            {activeOrder.order_number} — {activeOrder.status_label}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/buyer/orders?highlight=${encodeURIComponent(activeOrder.order_number)}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#086f8e] dark:text-[#38bdf8] hover:underline"
                                    >
                                        <span>Kelola Pesanan</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {activeOrder.stages.map((stage) => (
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
                                            {stage.step}. {stage.label}
                                        </div>
                                    ))}
                                </div>

                                <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap justify-between gap-2">
                                    <span>
                                        {activeOrder.items.map((i) => `${i.quantity}× ${i.product_name}`).join(', ')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {formatRupiah(activeOrder.total_amount)} ({activeOrder.payment_status_label})
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* RECENT ORDERS & RFQS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Orders */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pesanan Terbaru</h3>
                                    <Link href="/buyer/orders" className="text-xs font-semibold text-[#086f8e] hover:underline">
                                        Lihat Semua
                                    </Link>
                                </div>

                                {recentOrders.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                                        <ShoppingBag className="h-8 w-8 text-slate-400 mx-auto" />
                                        <p>Belum ada riwayat pesanan.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {recentOrders.map((ord) => (
                                            <div key={ord.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                        {ord.order_number}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate">{ord.items_summary}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        {ord.created_at_formatted} • {ord.status_label}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-bold">{formatRupiah(ord.total_amount)}</div>
                                                    <div className="text-[10px] text-slate-500">{ord.payment_status_label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent RFQs */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengajuan RFQ Terbaru</h3>
                                    <Link href="/buyer/quotations" className="text-xs font-semibold text-[#086f8e] hover:underline">
                                        Lihat Semua
                                    </Link>
                                </div>

                                {recentRfqs.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                                        <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                                        <p>Belum ada pengajuan RFQ.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {recentRfqs.map((rfq) => (
                                            <div key={rfq.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                        {rfq.rfq_number}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate">{rfq.items_summary}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        {rfq.created_at_formatted} • {rfq.is_expired ? 'SPH Kedaluwarsa' : rfq.status_label}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-bold">
                                                        {rfq.quoted_total !== null
                                                            ? formatRupiah(rfq.quoted_total)
                                                            : rfq.requested_total > 0
                                                                ? formatRupiah(rfq.requested_total)
                                                                : 'Menunggu SPH'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <BuyerFooter />
        </div>
    );
}
