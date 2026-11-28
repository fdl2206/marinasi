import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    Clock,
    Truck,
    Users,
    CreditCard,
    AlertTriangle,
    ArrowRight,
    FileText,
    Package,
    CheckCircle2,
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';

export default function SellerDashboard({
    metrics = {},
    recent_orders: recentOrders = [],
    pending_rfqs: pendingRfqs = [],
    low_stock_products: lowStockProducts = [],
}) {
    return (
        <SellerLayout title="Dashboard Admin Internal">
            <Head title="Dashboard Admin Internal — CV. Putra Nugraha" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Dashboard Operasional CV. Putra Nugraha
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Ringkasan real-time omzet, antrean RFQ, pesanan aktif, verifikasi klien, dan stok gudang.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/seller/catalog"
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                        >
                            Kelola Katalog
                        </Link>
                        <Link
                            href="/seller/orders"
                            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#171B26] text-xs font-semibold"
                        >
                            Semua Pesanan
                        </Link>
                    </div>
                </div>

                {/* TOP 4 KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Nilai Pesanan Bulan Ini</span>
                            <Banknote className="h-4 w-4 text-[#086f8e]" />
                        </div>
                        <div className="text-xl font-extrabold text-[#086f8e] dark:text-[#38bdf8]">
                            {formatRupiah(metrics.monthly_revenue ?? 0)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                            {metrics.monthly_orders_count ?? 0} pesanan • Masuk terverifikasi: {formatRupiah(metrics.verified_payments_month ?? 0)}
                        </div>
                    </div>

                    <Link href="/seller/negotiations" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-xs hover:border-blue-500 transition">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Antrean RFQ Baru</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {metrics.pending_rfqs_count ?? 0} RFQ
                        </div>
                        <div className="text-[11px] text-slate-400">Menunggu penerbitan SPH</div>
                    </Link>

                    <Link href="/seller/orders" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-xs hover:border-blue-500 transition">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Pesanan Aktif</span>
                            <Truck className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {metrics.active_orders_count ?? 0} Pesanan
                        </div>
                        <div className="text-[11px] text-slate-400">Tahap MOU s.d. Pengiriman</div>
                    </Link>

                    <Link href="/seller/legality" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-xs hover:border-blue-500 transition">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Butuh Verifikasi</span>
                            <CreditCard className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {(metrics.pending_payments_count ?? 0) + (metrics.pending_verifications_count ?? 0)} Item
                        </div>
                        <div className="text-[11px] text-slate-400">
                            {metrics.pending_payments_count ?? 0} bukti bayar • {metrics.pending_verifications_count ?? 0} akun buyer
                        </div>
                    </Link>
                </div>

                {/* QUICK ACTION ALERTS */}
                {((metrics.pending_verifications_count ?? 0) > 0 || (metrics.pending_payments_count ?? 0) > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {(metrics.pending_verifications_count ?? 0) > 0 && (
                            <Link
                                href="/seller/clients?verification_status=pending"
                                className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                                    <Users className="h-4 w-4 shrink-0" />
                                    <span>
                                        <strong>{metrics.pending_verifications_count} akun buyer</strong> menunggu verifikasi dokumen instansi.
                                    </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
                            </Link>
                        )}
                        {(metrics.pending_payments_count ?? 0) > 0 && (
                            <Link
                                href="/seller/legality"
                                className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-4 flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
                                    <CreditCard className="h-4 w-4 shrink-0" />
                                    <span>
                                        <strong>{metrics.pending_payments_count} bukti transfer</strong> menunggu verifikasi pembayaran.
                                    </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-blue-600 shrink-0" />
                            </Link>
                        )}
                    </div>
                )}

                {/* MAIN GRID: RECENT ORDERS + RIGHT PANELS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Recent Orders (7 cols) */}
                    <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-500" />
                                <span>Pesanan Terbaru</span>
                            </h2>
                            <Link href="/seller/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                                Kelola Semua
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <p className="py-8 text-center text-xs text-slate-500">Belum ada pesanan masuk.</p>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                    {order.order_number}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                                                    {order.status_label}
                                                </span>
                                                {order.has_efaktur && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                                                        <CheckCircle2 className="h-3 w-3" /> e-Faktur
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                                                {order.company_name}
                                            </div>
                                            <div className="text-[11px] text-slate-500 truncate">{order.items_summary}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {formatRupiah(order.total_amount)}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{order.payment_status_label}</div>
                                            <div className="text-[10px] text-slate-400">{order.created_at_formatted}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Pending RFQs + Low Stock (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Pending RFQs */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-amber-500" />
                                    <span>RFQ Menunggu Penawaran</span>
                                </h2>
                                <Link href="/seller/negotiations" className="text-xs font-semibold text-blue-600 hover:underline">
                                    Lihat Antrean
                                </Link>
                            </div>

                            {pendingRfqs.length === 0 ? (
                                <p className="py-4 text-center text-xs text-slate-500">Tidak ada antrean RFQ baru.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {pendingRfqs.map((rfq) => (
                                        <div key={rfq.id} className="py-2.5 first:pt-0 last:pb-0">
                                            <div className="flex justify-between gap-2">
                                                <span className="font-mono font-bold">{rfq.rfq_number}</span>
                                                <span className="text-[10px] text-slate-400">{rfq.created_at_formatted}</span>
                                            </div>
                                            <div className="text-slate-700 dark:text-slate-300 font-medium">{rfq.company_name}</div>
                                            <div className="text-[11px] text-slate-500 truncate">{rfq.items_summary}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Low Stock Goods */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                                    <span>Stok Barang Menipis / Habis ({metrics.low_stock_count ?? 0})</span>
                                </h2>
                                <Link href="/seller/catalog?stock_status=low_stock" className="text-xs font-semibold text-blue-600 hover:underline">
                                    Restock
                                </Link>
                            </div>

                            {lowStockProducts.length === 0 ? (
                                <p className="py-4 text-center text-xs text-slate-500">Semua stok barang tercatat dalam kondisi aman.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {lowStockProducts.map((item) => (
                                        <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</div>
                                                <div className="text-[10px] text-slate-400">{item.category}</div>
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                                                    item.stock_quantity <= 0
                                                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                                }`}
                                            >
                                                Sisa {item.stock_quantity} {item.stock_unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
