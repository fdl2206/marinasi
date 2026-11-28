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
    Download,
    CheckCircle2,
    Printer,
    FileCheck2,
    Percent,
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import { getBuyerClientProfile } from '@/Utils/buyerProfile';

const TYPE_STYLES = {
    invoice: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    efaktur: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    purchase_receipt: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    bast: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
};

export default function InvoicesIndex({
    documents = [],
    counts = {},
    summary = {},
    filters = {},
}) {
    const { props } = usePage();
    const client = getBuyerClientProfile(props?.auth?.user);

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const activeType = filters?.type || 'all';

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: `Dokumen & Faktur (${counts.all ?? 0})`, icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Verifikasi', icon: Building2, href: '/buyer/profile' },
    ];

    const documentTabs = [
        { id: 'all', label: `Semua Dokumen (${counts.all ?? 0})` },
        { id: 'invoice', label: `Invoice Resmi (${counts.invoice ?? 0})` },
        { id: 'efaktur', label: `e-Faktur PPN (${counts.efaktur ?? 0})` },
        { id: 'purchase_receipt', label: `Bukti Pembelian (${counts.purchase_receipt ?? 0})` },
        { id: 'bast', label: `BAST (${counts.bast ?? 0})` },
    ];

    const applyFilter = (nextType, nextSearch = searchQuery) => {
        router.get(
            '/buyer/invoices',
            {
                type: nextType === 'all' ? undefined : nextType,
                search: nextSearch.trim() || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-150">
            <Head title="Dokumen, Invoice & Faktur Pajak — CV. Putra Nugraha" />

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
                                const isActive = item.id === 'invoices';
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
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Keluar Akun</span>
                            </Link>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT */}
                    <div className="lg:col-span-9 space-y-6">
                        <div>
                            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Dokumen, Invoice &amp; Faktur Pajak (e-Faktur)
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Unduh Invoice resmi (terbit setelah DP terverifikasi), e-Faktur PPN 11%, Bukti Pembelian Lunas (Serah Terima), dan BAST.
                            </p>
                        </div>

                        {/* 4 KPI CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Invoice Resmi</span>
                                    <FileText className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {summary.total_invoice_count ?? 0} Dokumen
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>e-Faktur PPN 11%</span>
                                    <Receipt className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {summary.total_efaktur_count ?? 0} Dokumen
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Total PPN e-Faktur</span>
                                    <Percent className="h-4 w-4 text-cyan-500" />
                                </div>
                                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                                    {formatRupiah(summary.total_ppn_amount ?? 0)}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Bukti Pembelian Lunas</span>
                                    <FileCheck2 className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {summary.total_receipt_count ?? 0} Dokumen
                                </div>
                            </div>
                        </div>

                        {/* TABS & SEARCH */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {documentTabs.map((tab) => {
                                    const active = activeType === tab.id;
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
                                    applyFilter(activeType, searchQuery);
                                }}
                                className="flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nomor invoice, nomor seri e-Faktur, masa pajak, atau nomor pesanan..."
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

                        {/* DOCUMENTS LIST */}
                        {documents.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-12 text-center space-y-3 shadow-sm">
                                <Receipt className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Belum Ada Dokumen Terbit
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    Invoice otomatis tersedia setelah DP diverifikasi admin, e-Faktur diunggah oleh admin, dan Bukti Pembelian terbit setelah pelunasan di tahap Serah Terima.
                                </p>
                                <Link
                                    href="/buyer/orders"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition"
                                >
                                    Lihat Pesanan Saya
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {documents.map((doc) => {
                                    const badgeStyle = TYPE_STYLES[doc.type] || TYPE_STYLES.invoice;

                                    return (
                                        <div
                                            key={doc.id}
                                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3.5 shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
                                                            {doc.type_label}
                                                        </span>
                                                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                                                            {doc.document_number}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                                                        <span>Pesanan: <strong className="font-mono">{doc.order_number}</strong></span>
                                                        {doc.tax_period && <span>Masa: {doc.tax_period}</span>}
                                                        <span>Terbit: {doc.issued_at_formatted}</span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-[11px] text-slate-500">Total Dokumen</div>
                                                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                                                        {formatRupiah(doc.total_amount)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        DPP: {formatRupiah(doc.dpp_amount)} • PPN: {formatRupiah(doc.ppn_amount)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-600 dark:text-slate-300">
                                                {doc.items_summary}
                                            </div>

                                            {doc.notes && (
                                                <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-[#12161F] rounded-lg px-3 py-2">
                                                    Catatan: {doc.notes}
                                                </div>
                                            )}

                                            <div className="pt-1 flex items-center justify-end gap-2 flex-wrap">
                                                {doc.print_url && (
                                                    <a
                                                        href={doc.print_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>Cetak / Preview A4</span>
                                                    </a>
                                                )}

                                                <a
                                                    href={doc.download_url}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    <span>Unduh PDF</span>
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BuyerFooter />
        </div>
    );
}
