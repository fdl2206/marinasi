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
    MapPin,
    MessageCircle,
    ArrowRight,
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import { getBuyerClientProfile } from '@/Utils/buyerProfile';

export default function BuyerServicesIndex({
    service_orders: serviceOrders = [],
    metrics = {},
    filters = {},
}) {
    const { props } = usePage();
    const client = getBuyerClientProfile(props?.auth?.user);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const activeStatus = filters?.status || 'all';

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: `Layanan & Servis (${metrics.total_count ?? 0})`, icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Verifikasi', icon: Building2, href: '/buyer/profile' },
    ];

    const applyFilter = (nextStatus, nextSearch = searchQuery) => {
        router.get(
            '/buyer/services',
            {
                status: nextStatus === 'all' ? undefined : nextStatus,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-150">
            <Head title="Jadwal Instalasi & Layanan Servis — CV. Putra Nugraha" />

            <BuyerNavbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT SIDEBAR */}
                    <aside className="lg:col-span-3 space-y-5">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#086f8e] dark:text-[#38bdf8] shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                                        {client.company_name}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">PIC: {client.pic_name}</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-semibold w-full ${client.badge_class}`}>
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{client.tax_status}</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-2 space-y-1 shadow-sm">
                            {sidebarMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = item.id === 'services';
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
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-rose-600"
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
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Layanan Jasa, Instalasi &amp; Servis
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Pantau progres seluruh pesanan yang memuat layanan jasa servis, pemeliharaan, atau instalasi IT.
                                </p>
                            </div>
                            <Link
                                href="/portal"
                                className="px-4 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-sm transition shrink-0"
                            >
                                + Pesan Layanan Jasa
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">Total Pesanan Jasa</div>
                                <div className="text-2xl font-extrabold">{metrics.total_count ?? 0}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">Sedang Berjalan</div>
                                <div className="text-2xl font-extrabold text-[#086f8e] dark:text-[#38bdf8]">{metrics.active_count ?? 0}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">Selesai (Serah Terima)</div>
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.completed_count ?? 0}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-sm">
                                <div className="text-xs text-slate-500">RFQ Jasa Berjalan</div>
                                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{metrics.pending_service_rfqs ?? 0}</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {[
                                    { id: 'all', label: `Semua (${metrics.total_count ?? 0})` },
                                    { id: 'active', label: `Aktif (${metrics.active_count ?? 0})` },
                                    { id: 'completed', label: `Selesai (${metrics.completed_count ?? 0})` },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => applyFilter(tab.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            activeStatus === tab.id
                                                ? 'bg-[#086f8e] text-white'
                                                : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    applyFilter(activeStatus, searchQuery);
                                }}
                                className="flex gap-2"
                            >
                                <div className="relative">
                                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari pesanan / jasa..."
                                        className="rounded-xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 pl-8 pr-3 py-2 text-xs w-52"
                                    />
                                </div>
                                <button type="submit" className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Service Orders List */}
                        {serviceOrders.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-12 text-center space-y-3 shadow-sm">
                                <Wrench className="h-12 w-12 text-slate-400 mx-auto" />
                                <h3 className="text-base font-bold">Belum Ada Pesanan Layanan Jasa</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Pesanan yang memuat jasa servis, instalasi jaringan, atau maintenance IT akan otomatis tampil di sini.
                                </p>
                                <Link
                                    href="/portal"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#086f8e] text-white text-xs font-bold"
                                >
                                    Jelajahi Layanan di Katalog
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {serviceOrders.map((srv) => (
                                    <div key={srv.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm text-xs">
                                        <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-bold">{srv.order_number}</span>
                                                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-[#086f8e] dark:text-cyan-300 text-[11px] font-semibold">
                                                        {srv.status_label}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    Dibuat: {srv.created_at_formatted} {srv.spk_number ? `• SPK: ${srv.spk_number}` : ''}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={srv.whatsapp_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    <span>Koordinasi WA</span>
                                                </a>
                                                <Link
                                                    href={`/buyer/orders?highlight=${encodeURIComponent(srv.order_number)}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                                                >
                                                    <span>Detail Order</span>
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            {srv.service_items.map((item) => (
                                                <div key={item.id} className="flex justify-between gap-2">
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {item.quantity}× {item.product_name} ({item.unit})
                                                    </span>
                                                    <span className="font-bold">{formatRupiah(item.line_total)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-slate-500">
                                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                            <span>Lokasi: {srv.location}</span>
                                        </div>
                                        {srv.notes && (
                                            <div className="text-[11px] text-slate-500">Catatan jadwal: {srv.notes}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BuyerFooter />
        </div>
    );
}
