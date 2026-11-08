import { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
    User, 
    Building2, 
    LayoutDashboard, 
    Package, 
    Truck, 
    FileSpreadsheet, 
    FileText, 
    Receipt, 
    Wrench, 
    MapPin, 
    LogOut, 
    Calendar, 
    ShieldCheck, 
    CheckCircle2, 
    Clock, 
    ArrowRight, 
    Download, 
    RefreshCw, 
    Check, 
    ExternalLink, 
    Layers, 
    Phone,
    FileCheck2,
    TrendingUp,
    Send,
    Boxes
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import ThemeToggle from '@/Components/Common/ThemeToggle';

/**
 * Data mock default untuk profil klien B2B dan statistik pengadaan
 * Backend dapat menyuplai objek `client`, `metrics`, `activeOrder`, dan `transactions` dari Controller.
 */
const DEFAULT_CLIENT = {
    company_name: 'PT Maju Jaya Teknologi',
    pic_name: 'Budi Santoso',
    pic_role: 'IT Procurement',
    email: 'procurement@majujayatekno.co.id',
    phone: '08123456789',
    tax_status: 'NPWP Terverifikasi • PKP Aktif',
    address: 'Jl. Asia Afrika No. 128, Gedung Menara Lt. 5, Kota Bandung, Jawa Barat 40111',
};

const DEFAULT_METRICS = {
    active_orders_count: 2,
    active_orders_sub: '1 Hardware, 1 Instalasi LAN',
    pending_rfq_count: 1,
    pending_rfq_sub: 'Estimasi Rp 45.000.000',
    available_invoices_count: 12,
    available_invoices_sub: 'Siap unduh (PDF e-Faktur)',
    yearly_spend: 148500000,
    yearly_spend_sub: 'Termasuk PPN 11%',
};

const DEFAULT_ACTIVE_ORDER = {
    invoice_number: '#INV-PN-2026-0892',
    status: 'Dalam Pengiriman',
    current_step: 3, // 1 to 4
    steps: [
        {
            step: 1,
            title: 'PO & Pembayaran Terverifikasi',
            status_label: 'Selesai',
            is_completed: true,
            is_current: false,
        },
        {
            step: 2,
            title: 'Persiapan Unit & QC Server',
            status_label: 'Selesai',
            is_completed: true,
            is_current: false,
        },
        {
            step: 3,
            title: 'Pengiriman & Instalasi Teknisi',
            status_label: 'Sedang berlangsung',
            is_completed: false,
            is_current: true,
        },
        {
            step: 4,
            title: 'Serah Terima',
            status_label: 'Tahap berikutnya',
            is_completed: false,
            is_current: false,
        },
    ],
    items_summary: '1x Server HPE ProLiant ML30 Gen10, 2x Cisco Catalyst Switch 24-Port, + Paket Jasa Instalasi LAN Kantor (Jadwal Teknisi: Senin, 09:00 WIB)',
};

const DEFAULT_TRANSACTIONS = [
    {
        id: 'INV-0892',
        code: '#INV-PN-2026-0892',
        type_label: 'INVOICE B2B',
        date: '28 Okt 2026',
        category: 'hardware',
        items: 'Server HPE ProLiant ML30 Gen10 + Instalasi...',
        total: 71900000,
        status: 'Dalam Pengiriman',
        status_variant: 'blue',
        actions: [
            { label: 'Unduh Invoice', variant: 'amber', icon: Download, url: '#' },
            { label: 'e-Faktur', variant: 'blue', icon: FileText, url: '#' },
        ],
    },
    {
        id: 'INV-0741',
        code: '#INV-PN-2026-0741',
        type_label: 'INVOICE B2B',
        date: '12 Okt 2026',
        category: 'hardware',
        items: '5x Ubiquiti UniFi AP AC Pro + Kabel Cat6 Belden',
        total: 15350000,
        status: 'Selesai & BAST',
        status_variant: 'green',
        actions: [
            { label: 'e-Faktur PPN', variant: 'amber', icon: FileText, url: '#' },
            { label: 'BAST PDF', variant: 'blue', icon: FileCheck2, url: '#' },
            { label: 'Pesan Ulang', variant: 'dark', icon: RefreshCw, url: '#' },
        ],
    },
    {
        id: 'RFQ-0115',
        code: '#RFQ-PN-2026-0115',
        type_label: 'PENAWARAN RESMI',
        date: '05 Okt 2026',
        category: 'services',
        items: 'Pengadaan 10 Unit PC Workstation Kantor',
        total: 61250000,
        status: 'SPH Diterbitkan',
        status_variant: 'amber',
        actions: [
            { label: 'Unduh SPH Resmi', variant: 'amber', icon: Download, url: '#' },
            { label: 'Lanjut Checkout', variant: 'blue', icon: ArrowRight, url: '/buyer/checkout' },
        ],
    },
];

export default function BuyerDashboard({
    client: serverClient,
    metrics: serverMetrics,
    activeOrder: serverActiveOrder,
    transactions: serverTransactions,
    cartCount = 3,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const client = serverClient || DEFAULT_CLIENT;
    const metrics = serverMetrics || DEFAULT_METRICS;
    const activeOrder = serverActiveOrder || DEFAULT_ACTIVE_ORDER;
    const initialTransactions = serverTransactions || DEFAULT_TRANSACTIONS;

    // Filter status tab transaksi
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    // Active sidebar menu state
    const [activeMenu, setActiveMenu] = useState('overview');

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman (4)', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH (2)', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak (e-Faktur)', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
    ];

    // Filter transaksi berdasarkan kategori
    const filteredTransactions = useMemo(() => {
        if (selectedFilter === 'hardware') {
            return initialTransactions.filter(t => t.category === 'hardware');
        } else if (selectedFilter === 'services') {
            return initialTransactions.filter(t => t.category === 'services');
        }
        return initialTransactions;
    }, [initialTransactions, selectedFilter]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Dashboard Klien B2B — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#12161F] backdrop-blur transition-colors duration-150">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 lg:px-8 h-16 sm:h-20">
                    
                    {/* Brand Identity / Logo */}
                    <Link href="/portal" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
                        <img
                            src="/images/logo-pn.png"
                            alt="Logo CV. Putra Nugraha"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase truncate">
                                <span className="sm:hidden">CV. PN</span>
                                <span className="hidden sm:inline">CV. PUTRA NUGRAHA -</span>
                            </span>
                            <span className="hidden sm:inline text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                Perdagangan Barang dan Jasa
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari produk hardware, perangkat jaringan, atau layanan servis..."
                                className="w-full h-10 rounded-lg bg-slate-100 dark:bg-white border border-slate-200 dark:border-transparent pl-4 pr-11 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                <Search className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Right Actions: Theme Toggle, Keranjang & Akun */}
                    <div className="flex items-center gap-1.5 sm:gap-5 shrink-0">
                        <ThemeToggle />

                        <Link
                            href="/buyer/cart"
                            className="relative flex items-center gap-1.5 sm:gap-2 p-2 sm:p-0 text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                            <span className="hidden sm:inline">Keranjang</span>
                            {cartCount > 0 && (
                                <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Akun Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Akun</span>
                            </button>

                            {accountMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-2 shadow-2xl space-y-1 text-xs z-50">
                                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                        <div className="font-bold text-slate-900 dark:text-white truncate">{client.company_name}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{client.email}</div>
                                    </div>
                                    <Link
                                        href="/buyer/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Dashboard Pengadaan</span>
                                    </Link>
                                    <Link
                                        href="/portal"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                    >
                                        <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Katalog Pengadaan B2B</span>
                                    </Link>
                                    <Link
                                        href="/admin/dashboard"
                                        className="flex items-center justify-between px-3 py-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-white/[0.06] hover:text-amber-700 dark:hover:text-amber-300 transition"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                            <span>Portal Admin Back-Office</span>
                                        </div>
                                        <ArrowRight className="h-3 w-3 text-amber-500/60" />
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-left"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        <span>Keluar (Logout)</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </header>

            {/* ========================================================= */}
            {/* MAIN DASHBOARD CONTAINER                                  */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ===================================================== */}
                    {/* LEFT SIDEBAR: PROFILE & NAVIGATION MENU (3 Cols)      */}
                    {/* ===================================================== */}
                    <aside className="lg:col-span-3 space-y-5">
                        
                        {/* 1. Akun Perusahaan Card */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3.5 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Akun Perusahaan</span>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                                    {client.company_name}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    PIC: {client.pic_name} ({client.pic_role})
                                </p>
                            </div>

                            {/* Verification Pill */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span>{client.tax_status}</span>
                            </div>
                        </div>

                        {/* 2. Sidebar Navigation Items */}
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

                        {/* 3. Keluar Akun Link */}
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

                    {/* ===================================================== */}
                    {/* RIGHT CONTENT AREA: METRICS, TRACKER & TRANSACTIONS   */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* Header: Title + Date Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Dashboard Klien B2B
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    Selamat datang, {client.pic_name}. Pantau pengadaan dan dokumen perusahaan Anda.
                                </p>
                            </div>

                            {/* Date Badge Sesuai Mockup */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 self-start sm:self-auto shrink-0 shadow-sm">
                                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span>31 Oktober 2026</span>
                            </div>
                        </div>

                        {/* SECTION 1: 4 METRIC CARDS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            {/* Card 1: Pesanan Aktif & Dikirim */}
                            <Link 
                                href="/buyer/orders"
                                className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm hover:border-blue-600/60 hover:shadow-md transition cursor-pointer"
                            >
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                    <span className="text-xs font-medium">Pesanan Aktif &amp; Dikirim</span>
                                    <Truck className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {metrics.active_orders_count} Pesanan
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {metrics.active_orders_sub}
                                    </div>
                                </div>
                            </Link>

                            {/* Card 2: Pengajuan RFQ / SPH */}
                            <Link 
                                href="/buyer/quotations"
                                className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm hover:border-blue-600/60 hover:shadow-md transition cursor-pointer"
                            >
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                    <span className="text-xs font-medium">Pengajuan RFQ / SPH</span>
                                    <FileSpreadsheet className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {metrics.pending_rfq_count} Menunggu
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {metrics.pending_rfq_sub}
                                    </div>
                                </div>
                            </Link>

                            {/* Card 3: Faktur Pajak Tersedia */}
                            <Link 
                                href="/buyer/invoices"
                                className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm hover:border-blue-600/60 hover:shadow-md transition cursor-pointer"
                            >
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                    <span className="text-xs font-medium">Faktur Pajak Tersedia</span>
                                    <Receipt className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {metrics.available_invoices_count} Dokumen
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {metrics.available_invoices_sub}
                                    </div>
                                </div>
                            </Link>

                            {/* Card 4: Total Pengadaan Tahun Ini */}
                            <Link 
                                href="/buyer/orders"
                                className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm hover:border-blue-600/60 hover:shadow-md transition cursor-pointer"
                            >
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                    <span className="text-xs font-medium">Total Pengadaan Tahun Ini</span>
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                                        {formatRupiah(metrics.yearly_spend)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {metrics.yearly_spend_sub}
                                    </div>
                                </div>
                            </Link>

                        </div>

                        {/* SECTION 2: PELACAKAN PENGADAAN & JADWAL TEKNISI AKTIF */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-6 shadow-sm">
                            
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                        Pelacakan Pengadaan &amp; Jadwal Teknisi Aktif
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                        {activeOrder.invoice_number}
                                    </p>
                                </div>

                                <span className="inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-md text-xs font-medium badge-azure">
                                    <span className="h-1.5 w-1.5 rounded-full dot-azure mr-1.5 shrink-0" />
                                    <span>{activeOrder.status}</span>
                                </span>
                            </div>

                            {/* Mobile Progress Stepper (md:hidden) */}
                            <div className="md:hidden py-2 space-y-3">
                                <div className="space-y-2.5">
                                    {/* Step 1 */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-[#1b3327] border border-emerald-500/50 text-emerald-700 dark:text-[#8cd4b4] flex items-center justify-center font-bold text-xs shrink-0">
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">PO &amp; Pembayaran Terverifikasi</div>
                                            <div className="text-[10px] text-emerald-600 dark:text-[#8cd4b4] font-medium">Selesai</div>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-[#1b3327] border border-emerald-500/50 text-emerald-700 dark:text-[#8cd4b4] flex items-center justify-center font-bold text-xs shrink-0">
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Persiapan Unit &amp; QC Server</div>
                                            <div className="text-[10px] text-emerald-600 dark:text-[#8cd4b4] font-medium">Selesai</div>
                                        </div>
                                    </div>

                                    {/* Step 3 (Active) */}
                                    <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                                        <div className="h-7 w-7 rounded-full bg-[#3651dc] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-blue-500/30">
                                            <Truck className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Pengiriman &amp; Instalasi Teknisi</div>
                                            <div className="text-[10px] text-blue-600 dark:text-[#9bb8f5] font-semibold">Sedang berlangsung</div>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex items-center gap-3 opacity-60">
                                        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                                            <Clock className="h-3 w-3" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Serah Terima &amp; BAST</div>
                                            <div className="text-[10px] text-slate-400">Tahap berikutnya</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Horizontal Progress Stepper (hidden md:block) */}
                            <div className="hidden md:block py-2 overflow-x-auto scrollbar-none no-scrollbar">
                                <div className="min-w-[620px] flex items-center justify-between relative px-4">
                                    
                                    {/* Connecting Progress Line (Behind step nodes) */}
                                    <div className="absolute left-10 right-10 top-4 h-0.5 bg-slate-200 dark:bg-slate-800 z-0">
                                        <div className="h-full bg-[#76C19F] w-[68%]" />
                                    </div>

                                    {/* Step 1: PO & Pembayaran Verifikasi */}
                                    <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] space-y-2">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-[#1b3327] border border-emerald-500/50 text-emerald-700 dark:text-[#8cd4b4] flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-[#171B26]">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                            PO &amp; Pembayaran Terverifikasi
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-[#8cd4b4] font-medium">
                                            Selesai
                                        </span>
                                    </div>

                                    {/* Step 2: Persiapan Unit & QC Server */}
                                    <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] space-y-2">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-[#1b3327] border border-emerald-500/50 text-emerald-700 dark:text-[#8cd4b4] flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-[#171B26]">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                            Persiapan Unit &amp; QC Server
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-[#8cd4b4] font-medium">
                                            Selesai
                                        </span>
                                    </div>

                                    {/* Step 3: Pengiriman & Instalasi Teknisi (Active) */}
                                    <div className="relative z-10 flex flex-col items-center text-center max-w-[140px] space-y-2">
                                        <div className="h-8 w-8 rounded-full bg-[#3651dc] border border-white/20 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-[#171B26] shadow-lg shadow-blue-500/20">
                                            <Truck className="h-4 w-4" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                            Pengiriman &amp; Instalasi Teknisi
                                        </span>
                                        <span className="text-[10px] text-blue-600 dark:text-[#9bb8f5] font-semibold">
                                            Sedang berlangsung
                                        </span>
                                    </div>

                                    {/* Step 4: Serah Terima */}
                                    <div className="relative z-10 flex flex-col items-center text-center max-w-[120px] space-y-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-[#0C0D12] border-2 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-[#171B26]">
                                            <Clock className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                                            Serah Terima
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                            Tahap berikutnya
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* Order Detail Strip Note */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-[#9bb8f5] shrink-0 mt-0.5">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {activeOrder.items_summary}
                                </p>
                            </div>

                        </div>

                        {/* SECTION 3: RIWAYAT TRANSAKSI & UNDUH DOKUMEN RESMI B2B */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-6 shadow-sm">
                            
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                        Riwayat Transaksi &amp; Unduh Dokumen Resmi B2B
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola pesanan, penawaran harga, dan dokumen perpajakan dalam satu tempat.
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto font-medium">
                                    {filteredTransactions.length} transaksi terbaru
                                </span>
                            </div>

                            {/* Filter Tabs Pills */}
                            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3 overflow-x-auto scrollbar-none no-scrollbar">
                                <button
                                    type="button"
                                    onClick={() => setSelectedFilter('all')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                        selectedFilter === 'all'
                                            ? 'btn-primary-bespoke'
                                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFilter('hardware')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                        selectedFilter === 'hardware'
                                            ? 'btn-primary-bespoke'
                                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    Barang Hardware
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFilter('services')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                        selectedFilter === 'services'
                                            ? 'btn-primary-bespoke'
                                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    Jasa &amp; Servis
                                </button>
                            </div>

                            {/* Mobile Transactions List (md:hidden) */}
                            <div className="md:hidden space-y-3">
                                {filteredTransactions.map((trx) => (
                                    <div
                                        key={trx.id}
                                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">{trx.code}</div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{trx.date} &bull; {trx.type_label}</div>
                                            </div>
                                            {trx.status_variant === 'blue' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium badge-azure">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                                    <span>{trx.status}</span>
                                                </span>
                                            )}
                                            {trx.status_variant === 'green' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium badge-sage">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                    <span>{trx.status}</span>
                                                </span>
                                            )}
                                            {trx.status_variant === 'amber' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium badge-ochre">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-ochre shrink-0" />
                                                    <span>{trx.status}</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                                            {trx.items}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                                            <div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Total (Termasuk PPN)</div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {formatRupiah(trx.total)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                                            {trx.actions.map((act, actIdx) => {
                                                const ActionIcon = act.icon;
                                                const isInternal = act.url && act.url.startsWith('/');
                                                const buttonStyle = `inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-sm ${
                                                    act.variant === 'amber'
                                                        ? 'btn-ochre-bespoke'
                                                        : act.variant === 'blue'
                                                        ? 'btn-primary-bespoke'
                                                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700'
                                                }`;

                                                if (isInternal) {
                                                    return (
                                                        <Link key={actIdx} href={act.url} className={buttonStyle}>
                                                            <ActionIcon className="h-3 w-3" />
                                                            <span>{act.label}</span>
                                                        </Link>
                                                    );
                                                }

                                                return (
                                                    <a
                                                        key={actIdx}
                                                        href="/images/hero-datacenter-clean.jpg"
                                                        download={`${trx.code}-${act.label.replace(/\s+/g, '-')}.pdf`}
                                                        className={buttonStyle}
                                                    >
                                                        <ActionIcon className="h-3 w-3" />
                                                        <span>{act.label}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Responsive Table (hidden md:block) */}
                            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26]/50">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12]/80 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                            <th className="py-3 px-4">No. Invoice / PO</th>
                                            <th className="py-3 px-3">Tanggal</th>
                                            <th className="py-3 px-4">Daftar Produk &amp; Layanan</th>
                                            <th className="py-3 px-4">Total (Termasuk PPN)</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 px-4 text-right sm:text-left">Dokumen B2B (Unduh PDF)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                                        {filteredTransactions.map((trx) => (
                                            <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                
                                                {/* No. Invoice */}
                                                <td className="py-4 px-4 font-mono">
                                                    <div className="font-bold text-slate-900 dark:text-white text-xs">{trx.code}</div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{trx.type_label}</div>
                                                </td>

                                                {/* Tanggal */}
                                                <td className="py-4 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                    {trx.date}
                                                </td>

                                                {/* Daftar Produk & Layanan */}
                                                <td className="py-4 px-4 text-slate-900 dark:text-white font-medium max-w-xs">
                                                    <div className="truncate" title={trx.items}>
                                                        {trx.items}
                                                    </div>
                                                </td>

                                                {/* Total */}
                                                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                    {formatRupiah(trx.total)}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4 px-3 whitespace-nowrap">
                                                    {trx.status_variant === 'blue' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium badge-azure">
                                                            <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                                            <span>{trx.status}</span>
                                                        </span>
                                                    )}
                                                    {trx.status_variant === 'green' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium badge-sage">
                                                            <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                            <span>{trx.status}</span>
                                                        </span>
                                                    )}
                                                    {trx.status_variant === 'amber' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium badge-ochre">
                                                            <span className="h-1.5 w-1.5 rounded-full dot-ochre shrink-0" />
                                                            <span>{trx.status}</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Dokumen Action Buttons */}
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {trx.actions.map((act, actIdx) => {
                                                            const ActionIcon = act.icon;
                                                            const isInternal = act.url && act.url.startsWith('/');
                                                            const buttonStyle = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-sm ${
                                                                act.variant === 'amber'
                                                                    ? 'btn-ochre-bespoke'
                                                                    : act.variant === 'blue'
                                                                    ? 'btn-primary-bespoke'
                                                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700'
                                                            }`;

                                                            if (isInternal) {
                                                                return (
                                                                    <Link
                                                                        key={actIdx}
                                                                        href={act.url}
                                                                        className={buttonStyle}
                                                                    >
                                                                        <ActionIcon className="h-3 w-3" />
                                                                        <span>{act.label}</span>
                                                                    </Link>
                                                                );
                                                            }

                                                            return (
                                                                <a
                                                                    key={actIdx}
                                                                    href="/images/hero-datacenter-clean.jpg"
                                                                    download={`${trx.code}-${act.label.replace(/\s+/g, '-')}.pdf`}
                                                                    className={buttonStyle}
                                                                >
                                                                    <ActionIcon className="h-3 w-3" />
                                                                    <span>{act.label}</span>
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section Footer Guarantee Note */}
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Dokumen resmi diterbitkan oleh CV. Putra Nugraha • Format PDF</span>
                            </div>

                        </div>

                    </div>

                </div>

            </main>

            {/* ========================================================= */}
            {/* FOOTER B2B CORPORATE 4 KOLOM                              */}
            {/* ========================================================= */}
            <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12161F] text-slate-500 dark:text-slate-400 text-xs transition-colors duration-150">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        
                        {/* Col 1: Brand & Profil */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo-pn.png"
                                    alt="Logo CV. Putra Nugraha"
                                    className="h-9 w-9 rounded-lg object-contain"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                                        CV. PUTRA NUGRAHA -
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Perdagangan Barang dan Jasa
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Pengadaan perangkat IT dan layanan profesional untuk mendukung kebutuhan perusahaan Anda.
                            </p>
                        </div>

                        {/* Col 2: Panduan Pengadaan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Panduan Pengadaan B2B
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link href="/panduan/cara-belanja" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Cara Belanja &amp; Pengajuan RFQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/faktur-pajak" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Ketentuan Faktur Pajak
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/pembayaran" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Pembayaran &amp; Pengiriman
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/garansi" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Garansi &amp; Layanan Purnajual
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Layanan Pelanggan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Layanan Pelanggan
                            </h4>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <a 
                                    href="https://wa.me/6281320777874" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                                >
                                    (+62) 813-2077-7874
                                </a>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Hubungi tim kami untuk konsultasi produk, penawaran, dan status pengadaan.
                            </p>
                            <div>
                                <a
                                    href="https://wa.me/6281320777874"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                                >
                                    <span>Konsultasikan kebutuhan Anda</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Col 4: Alamat Kantor */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Alamat Kantor
                            </h4>
                            <div className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Melayani kebutuhan barang dan jasa IT perusahaan.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-200 dark:border-slate-800/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-500">
                        <p>© 2026 CV. Putra Nugraha. All Right Reserved.</p>
                        <p className="hidden sm:block">Perdagangan Barang dan Jasa</p>
                    </div>
                </div>
            </footer>

            {/* ========================================================= */}
            {/* FLOATING WHATSAPP BUTTON                                  */}
            {/* ========================================================= */}
            <a
                href="https://wa.me/6281320777874"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Konsultasi Pengadaan via WhatsApp"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center h-11 w-11 sm:h-13 sm:w-13 p-2.5 sm:p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl shadow-emerald-950/60 transition-transform duration-200 hover:scale-110 active:scale-95"
            >
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 fill-current">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
            </a>

        </div>
    );
}
