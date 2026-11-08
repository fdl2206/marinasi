import { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
    User, 
    Building2, 
    LayoutDashboard, 
    Package, 
    FileText, 
    Receipt, 
    Wrench, 
    LogOut, 
    Calendar, 
    Clock, 
    ArrowRight, 
    Download, 
    RefreshCw, 
    Check, 
    CheckCircle2, 
    Layers, 
    Phone, 
    MapPin, 
    SlidersHorizontal, 
    Upload, 
    Truck, 
    Filter,
    ChevronDown,
    FileCheck2,
    ShieldCheck
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import ThemeToggle from '@/Components/Common/ThemeToggle';

/**
 * Data mock pesanan & pengadaan B2B
 * Backend dapat menyuplai prop `orders`, `client`, `filterCounts` dari Controller.
 */
const DEFAULT_CLIENT = {
    company_name: 'PT Maju Jaya Teknologi',
    pic_name: 'Budi Santoso',
    tax_status: 'PKP & NPWP Terverifikasi',
};

const DEFAULT_ORDERS = [
    {
        id: '0892',
        invoice_number: '#INV-PN-2026-0892',
        po_reference: 'PO/MJT/IT/X/088',
        date: '28 Okt 2026',
        status: 'shipping',
        status_label: 'Dalam Pengiriman & Jadwal Teknisi',
        category: 'mixed',
        total: 71900000,
        payment_info: 'Virtual Account Mandiri (Lunas)',
        technician_schedule: 'Jadwal Teknisi CV. Putra Nugraha: Senin, 09:00 WIB',
        items: [
            {
                name: 'Server HPE ProLiant ML30 Gen10',
                qty: 1,
                price: 32500000,
                unit: 'Unit',
                image_url: '/images/product-server-hpe.png',
            },
            {
                name: 'Cisco Catalyst Switch 24-Port',
                qty: 2,
                price: 15450000,
                unit: 'Unit',
                image_url: '/images/product-cisco-switch.png',
            },
            {
                name: 'Paket Jasa Instalasi Jaringan LAN Kantor',
                qty: 1,
                price: 8500000,
                unit: 'Paket',
                image_url: '/images/product-lan-services.png',
            },
        ],
        actions: {
            show_invoice_download: true,
            show_efaktur_download: true,
            show_tracking: true,
            show_confirm_bast: true,
        },
    },
    {
        id: '0741',
        invoice_number: '#INV-PN-2026-0741',
        po_reference: 'PO/MJT/IT/X/042',
        date: '12 Okt 2026',
        status: 'completed',
        status_label: 'Selesai & BAST Disetujui',
        category: 'hardware',
        total: 12900000,
        payment_info: 'Transfer Bank Mandiri (Lunas)',
        items: [
            {
                name: 'Ubiquiti UniFi AP AC Pro',
                qty: 4,
                price: 2450000,
                unit: 'Unit',
                image_url: '/images/product-ubiquiti-ap.png',
            },
            {
                name: 'Kabel UTP Cat6 Belden 305m',
                qty: 1,
                price: 3100000,
                unit: 'Roll',
                image_url: '/images/product-belden-cable.png',
            },
        ],
        actions: {
            show_invoice_paid: true,
            show_efaktur_ppn: true,
            show_bast_pdf: true,
            show_warranty_claim: true,
            show_repeat_order: true,
        },
    },
    {
        id: '0690',
        invoice_number: '#ORD-PN-2026-0690',
        po_reference: 'Hardware',
        date: '02 Okt 2026',
        status: 'waiting_payment',
        status_label: 'Menunggu Pembayaran / Upload PO',
        category: 'hardware',
        total: 7850000,
        payment_info: null,
        items: [
            {
                name: 'Cabinet Server Close Rack 42U Glass Door',
                qty: 1,
                price: 7850000,
                unit: 'Unit',
                image_url: '/images/detail-server-main.png',
            },
        ],
        actions: {
            show_proforma: true,
            show_upload_proof: true,
        },
    },
];

export default function OrdersIndex({
    orders: serverOrders,
    client: serverClient,
    cartCount = 3,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const client = serverClient || DEFAULT_CLIENT;
    const initialOrders = serverOrders || DEFAULT_ORDERS;

    // Filter states
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTimeRange, setSelectedTimeRange] = useState('3_months');
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman (14)', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH (2)', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak (e-Faktur)', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
    ];

    const statusTabs = [
        { id: 'all', label: 'Semua Pesanan (14)' },
        { id: 'waiting_payment', label: 'Menunggu Pembayaran / PO (1)' },
        { id: 'shipping', label: 'Diproses & Dikirim (2)' },
        { id: 'installation', label: 'Instalasi Teknisi (1)' },
        { id: 'completed', label: 'Selesai & BAST (10)' },
    ];

    // Filter orders
    const filteredOrders = useMemo(() => {
        return initialOrders.filter((order) => {
            // Filter status tab
            if (selectedTab !== 'all') {
                if (selectedTab === 'installation' && order.id !== '0892') return false;
                if (selectedTab !== 'installation' && order.status !== selectedTab) return false;
            }

            // Filter search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchInvoice = order.invoice_number.toLowerCase().includes(q);
                const matchPO = order.po_reference?.toLowerCase().includes(q);
                const matchItems = order.items.some(i => i.name.toLowerCase().includes(q));
                if (!matchInvoice && !matchPO && !matchItems) return false;
            }

            // Filter category
            if (selectedCategory !== 'all') {
                if (selectedCategory === 'hardware' && order.category === 'services') return false;
                if (selectedCategory === 'services' && order.category === 'hardware') return false;
            }

            return true;
        });
    }, [initialOrders, selectedTab, searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Riwayat Pesanan & Pengadaan B2B — CV. Putra Nugraha" />

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
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{client.pic_name}</div>
                                    </div>
                                    <Link
                                        href="/buyer/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Dashboard Pengadaan</span>
                                    </Link>
                                    <Link
                                        href="/buyer/orders"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                    >
                                        <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Riwayat Pesanan</span>
                                    </Link>
                                    <Link
                                        href="/portal"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                    >
                                        <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Katalog Pengadaan B2B</span>
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
            {/* MAIN CONTENT AREA                                         */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ===================================================== */}
                    {/* LEFT SIDEBAR: PROFILE & NAVIGATION MENU (3 Cols)      */}
                    {/* ===================================================== */}
                    <aside className="lg:col-span-3 space-y-5">
                        
                        {/* 1. Akun Perusahaan Card */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 border border-blue-500/20">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                                        {client.company_name}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        PIC: {client.pic_name}
                                    </p>
                                </div>
                            </div>

                            {/* Verification Pill */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-[10px] font-semibold w-full">
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                                <span className="truncate">{client.tax_status}</span>
                            </div>
                        </div>

                        {/* 2. Sidebar Navigation Items */}
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

                        {/* 3. Keluar Akun */}
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
                    {/* RIGHT CONTENT: HEADER, FILTERS & ORDERS LIST (9 Cols) */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* 1. Header Bar: Title + Export Button */}
                        <div className="space-y-3">
                            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Riwayat Pesanan &amp; Pengadaan B2B
                            </h1>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => alert('Mengunduh Laporan Rekap Pengadaan B2B format PDF & Excel...')}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-[#171B26] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold shadow-sm transition"
                                >
                                    <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Ekspor Laporan Pengadaan (Excel/PDF)</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Status Filter Tabs (Horizontal Pills) */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedTab === tab.id
                                            ? 'btn-primary-bespoke'
                                            : 'bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* 3. Search Bar & Filter Controls Box */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-3 sm:p-4 space-y-3 shadow-sm">
                            
                            {/* Full-width Search Input */}
                            <div className="relative w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama produk, No. Invoice, atau No. PO..."
                                    className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-200 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Dropdowns Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                {/* Dropdown 1: Kategori */}
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full h-9 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3 text-xs text-slate-700 dark:text-slate-300 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">Semua: Hardware &amp; Jasa</option>
                                        <option value="hardware">Hanya Hardware &amp; Perangkat</option>
                                        <option value="services">Hanya Jasa &amp; Instalasi</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                </div>

                                {/* Dropdown 2: Rentang Waktu */}
                                <div className="relative">
                                    <select
                                        value={selectedTimeRange}
                                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                                        className="w-full h-9 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3 text-xs text-slate-700 dark:text-slate-300 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="3_months">3 Bulan Terakhir</option>
                                        <option value="6_months">6 Bulan Terakhir</option>
                                        <option value="1_year">Tahun 2026</option>
                                        <option value="all">Semua Riwayat</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                </div>

                            </div>

                        </div>

                        {/* 4. ORDERS CARDS LIST */}
                        <div className="space-y-5">
                            {filteredOrders.length === 0 ? (
                                <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] space-y-3 shadow-sm">
                                    <Package className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Pesanan Ditemukan</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Tidak ditemukan transaksi pengadaan yang sesuai dengan filter atau kata kunci pencarian Anda.
                                    </p>
                                </div>
                            ) : (
                                filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700/80"
                                    >
                                        {/* Card Header: Tanggal, Ref PO, No Invoice, Status Badge */}
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                            
                                            {/* Left: Date & PO Ref */}
                                            <div className="space-y-0.5">
                                                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Tanggal: {order.date}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {order.po_reference.startsWith('PO') ? `Ref PO: ${order.po_reference}` : order.po_reference}
                                                </div>
                                            </div>

                                            {/* Right: Invoice No & Status Badge */}
                                            <div className="flex flex-col sm:items-end gap-1.5">
                                                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                                    {order.status === 'waiting_payment' ? 'No. Pesanan: ' : 'No. Invoice: '}
                                                    <span className="text-blue-600 dark:text-blue-400">{order.invoice_number}</span>
                                                </div>

                                                {/* Status Badges */}
                                                {order.status === 'shipping' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium badge-azure">
                                                        <Truck className="h-3 w-3 text-[#4361EE]" />
                                                        <span>{order.status_label}</span>
                                                    </span>
                                                )}
                                                {order.status === 'completed' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium badge-sage">
                                                        <Check className="h-3 w-3 text-[#76C19F]" />
                                                        <span>{order.status_label}</span>
                                                    </span>
                                                )}
                                                {order.status === 'waiting_payment' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium badge-ochre">
                                                        <Clock className="h-3 w-3 text-[#C79B64]" />
                                                        <span>{order.status_label}</span>
                                                    </span>
                                                )}
                                            </div>

                                        </div>

                                        {/* Card Body: Items List + Pricing Block */}
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                            
                                            {/* Left: Items List (8 cols) */}
                                            <div className="md:col-span-8 space-y-3">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3.5">
                                                        
                                                        {/* Thumbnail Box */}
                                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-slate-50 dark:bg-white p-1.5 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-sm">
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="max-h-full max-w-full object-contain"
                                                            />
                                                        </div>

                                                        {/* Item Title & Quantity */}
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                                                                {item.name}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                                ({item.qty} {item.unit} x {formatRupiah(item.price)})
                                                            </p>
                                                        </div>

                                                    </div>
                                                ))}

                                                {/* Technician Schedule Note (If Available) */}
                                                {order.technician_schedule && (
                                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-3">
                                                        <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <span>{order.technician_schedule}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Total Pricing Block (4 cols) */}
                                            <div className="md:col-span-4 md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6 space-y-1">
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Total Tagihan {order.status !== 'waiting_payment' && '(Termasuk PPN 11%)'}
                                                </span>
                                                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                    {formatRupiah(order.total)}
                                                </div>
                                                {order.payment_info && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                                        <span>{order.payment_info}</span>
                                                    </div>
                                                )}
                                                {order.status === 'completed' && (
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                        Termasuk PPN 11%
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        {/* Card Footer: Action Buttons */}
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            
                                            {/* Left Document Buttons */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {order.actions.show_invoice_download && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); alert('Mengunduh Invoice PDF resmi...'); }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span>Unduh Invoice PDF</span>
                                                    </a>
                                                )}

                                                {order.actions.show_efaktur_download && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); alert('Mengunduh e-Faktur Pajak resmi...'); }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>Unduh e-Faktur Pajak</span>
                                                    </a>
                                                )}

                                                {order.actions.show_invoice_paid && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); alert('Membuka Invoice Lunas PDF...'); }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/15 hover:bg-blue-100 dark:hover:bg-blue-600/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold transition"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>Invoice Lunas</span>
                                                    </a>
                                                )}

                                                {order.actions.show_efaktur_ppn && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); alert('Mengunduh e-Faktur PPN resmi...'); }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/15 hover:bg-blue-100 dark:hover:bg-blue-600/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold transition"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>e-Faktur PPN</span>
                                                    </a>
                                                )}

                                                {order.actions.show_bast_pdf && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); alert('Mengunduh Dokumen BAST PDF resmi...'); }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/15 hover:bg-blue-100 dark:hover:bg-blue-600/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold transition"
                                                    >
                                                        <FileCheck2 className="h-3.5 w-3.5" />
                                                        <span>Dokumen BAST PDF</span>
                                                    </a>
                                                )}

                                                {order.actions.show_proforma && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); alert('Mengunduh Proforma Invoice / SPH resmi...'); }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/15 hover:bg-blue-100 dark:hover:bg-blue-600/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold transition"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>Unduh Proforma Invoice / SPH</span>
                                                    </a>
                                                )}
                                            </div>

                                            {/* Right Action Buttons */}
                                            <div className="flex items-center gap-3">
                                                {order.actions.show_tracking && (
                                                    <button
                                                        type="button"
                                                        onClick={() => alert('Membuka status GPS Kurir Logistik & Teknisi Onsite...')}
                                                        className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
                                                    >
                                                        <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                        <span>Lacak Kurir &amp; Teknisi</span>
                                                    </button>
                                                )}

                                                {order.actions.show_confirm_bast && (
                                                    <button
                                                        type="button"
                                                        onClick={() => alert('Membuka form digital Berita Acara Serah Terima (BAST)...')}
                                                        className="px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium"
                                                    >
                                                        Konfirmasi Terima / BAST
                                                    </button>
                                                )}

                                                {order.actions.show_warranty_claim && (
                                                    <button
                                                        type="button"
                                                        onClick={() => alert('Membuka formulir klaim garansi produk resmi...')}
                                                        className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
                                                    >
                                                        Klaim Garansi / Servis
                                                    </button>
                                                )}

                                                {order.actions.show_repeat_order && (
                                                    <Link
                                                        href="/buyer/cart"
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium"
                                                    >
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                        <span>Pesan Ulang (Repeat Order)</span>
                                                    </Link>
                                                )}

                                                {order.actions.show_upload_proof && (
                                                    <button
                                                        type="button"
                                                        onClick={() => alert('Buka dialog upload Bukti Bayar Transfer / Dokumen PO...')}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg btn-ochre-bespoke text-xs font-medium"
                                                    >
                                                        <Upload className="h-3.5 w-3.5" />
                                                        <span>Unggah Bukti Bayar / Dokumen PO</span>
                                                    </button>
                                                )}
                                            </div>

                                        </div>

                                    </div>
                                ))
                            )}
                        </div>

                        {/* 5. Pagination Controls Sesuai Mockup */}
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(1)}
                                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                                    currentPage === 1
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
                                }`}
                            >
                                1
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(2)}
                                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                                    currentPage === 2
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
                                }`}
                            >
                                2
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(3)}
                                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                                    currentPage === 3
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
                                }`}
                            >
                                3
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
                                className="px-3 h-8 rounded-lg bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs font-medium transition flex items-center gap-1 shadow-sm"
                            >
                                <span>Berikutnya</span>
                                <ArrowRight className="h-3 w-3" />
                            </button>
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
