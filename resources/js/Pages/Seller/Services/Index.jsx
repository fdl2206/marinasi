import { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Wrench, MapPin, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';

export default function SellerServicesIndex({
    service_orders: serviceOrders = [],
    metrics = {},
    filters = {},
}) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const activeStatus = filters?.status || 'all';

    const applyFilter = (nextStatus, nextSearch = searchQuery) => {
        router.get(
            '/seller/services',
            {
                status: nextStatus === 'all' ? undefined : nextStatus,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <SellerLayout
            title="Jadwal & Pesanan Layanan Jasa"
            searchQuery={searchQuery}
            onSearchChange={(val) => {
                setSearchQuery(val);
                if (val === '') applyFilter(activeStatus, '');
            }}
            searchPlaceholder="Cari pesanan jasa, instansi, atau layanan..."
        >
            <Head title="Jadwal & Pesanan Layanan Jasa — CV. Putra Nugraha" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Pelaksanaan Layanan Jasa &amp; Instalasi
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Daftar seluruh pesanan masuk yang memuat jasa servis, instalasi, atau pemeliharaan IT.
                        </p>
                    </div>
                    <Link
                        href="/seller/orders"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0"
                    >
                        Kelola Status di Menu Pesanan
                    </Link>
                </div>

                {/* 4 KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">Total Pesanan Jasa</div>
                        <div className="text-2xl font-extrabold">{metrics.total_count ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">Sedang Berjalan</div>
                        <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{metrics.active_count ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">Selesai (Serah Terima)</div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.completed_count ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-xs">
                        <div className="text-xs text-slate-500">Katalog Jasa Aktif</div>
                        <div className="text-2xl font-extrabold">{metrics.catalog_services_count ?? 0}</div>
                    </div>
                </div>

                {/* FILTER TABS & SEARCH */}
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
                                        ? 'bg-blue-600 text-white'
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
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari pesanan / instansi / jasa..."
                            className="rounded-xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs w-56"
                        />
                        <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
                            Cari
                        </button>
                    </form>
                </div>

                {/* LIST */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden shadow-sm">
                    {serviceOrders.length === 0 ? (
                        <div className="p-12 text-center space-y-2">
                            <Wrench className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold">Belum ada pesanan jasa pada filter ini</h3>
                            <p className="text-xs text-slate-500">
                                Pesanan yang memuat item tipe Jasa akan otomatis tampil di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {serviceOrders.map((srv) => (
                                <div key={srv.id} className="p-5 space-y-3 text-xs">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                                                    {srv.order_number}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                                                    {srv.status_label}
                                                </span>
                                            </div>
                                            <div className="text-slate-700 dark:text-slate-300 font-medium mt-1">
                                                {srv.company_name} — PIC: {srv.pic_name} ({srv.pic_phone || '-'})
                                            </div>
                                            <div className="text-[11px] text-slate-400">{srv.created_at_formatted}</div>
                                        </div>

                                        <Link
                                            href={`/seller/orders?search=${encodeURIComponent(srv.order_number)}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                                        >
                                            <span>Proses di Pesanan</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>

                                    <div className="space-y-1 bg-slate-50 dark:bg-[#12161F] rounded-xl p-3">
                                        {srv.service_items.map((item) => (
                                            <div key={item.id} className="flex justify-between gap-2">
                                                <span className="font-semibold">
                                                    {item.quantity}× {item.product_name} ({item.unit})
                                                </span>
                                                <span className="font-bold">{formatRupiah(item.line_total)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                        <span>{srv.location}</span>
                                    </div>
                                    {srv.notes && <div className="text-[11px] text-slate-500">Catatan: {srv.notes}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
}
