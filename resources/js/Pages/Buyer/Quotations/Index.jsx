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
    Plus,
    FileSpreadsheet,
    FileCheck2,
    ShieldCheck,
    MessageSquare,
    ExternalLink,
    AlertCircle,
    TrendingDown,
    Building,
    ChevronDown
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import ThemeToggle from '@/Components/Common/ThemeToggle';

/**
 * Data mock pengajuan penawaran harga (RFQ) dan SPH resmi
 * Backend dapat menyuplai prop `quotations`, `client`, dan `metrics` dari Controller.
 */
const DEFAULT_CLIENT = {
    company_name: 'PT Maju Jaya Teknologi',
    pic_name: 'Budi Santoso',
    pic_role: 'IT Procurement',
    tax_status: 'PKP & NPWP Terverifikasi',
};

const DEFAULT_METRICS = {
    total_rfq: 2,
    total_rfq_sub: '1 SPH Terbit, 1 Review Sales',
    efficiency_savings: 4250000,
    efficiency_sub: 'Hemat 6.5% dari harga katalog retail',
    ready_sph: 1,
    ready_sph_sub: 'Masa berlaku s/d 14 Nov 2026',
};

const DEFAULT_QUOTATIONS = [
    {
        id: '0115',
        rfq_number: '#RFQ-PN-2026-0115',
        sph_number: 'SPH/PN/B2B/2026/X-044',
        title: 'Pengadaan 10 Unit PC Workstation Kantor & Setup Jaringan',
        date: '05 Okt 2026',
        valid_until: '14 Nov 2026 (Masa Berlaku 14 Hari)',
        status: 'sph_issued',
        status_label: 'SPH Resmi Diterbitkan',
        category: 'hardware',
        retail_price: 65500000,
        negotiated_price: 61250000,
        savings_amount: 4250000,
        sales_rep: {
            name: 'Rian Hendrawan',
            role: 'B2B Corporate Account Executive',
            phone: '+62 813-2077-7874',
        },
        items: [
            {
                name: 'PC Workstation Core i7-13700 16GB RAM 512GB SSD NVMe',
                qty: 10,
                unit: 'Unit',
                spec: 'Tower Case, Windows 11 Pro OEM Resmi, Keyboard & Mouse Included',
                image_url: '/images/product-server-hpe.png',
            },
            {
                name: 'Monitor LED 24 Inch Full HD IPS 75Hz',
                qty: 10,
                unit: 'Unit',
                spec: 'HDMI/VGA, Low Blue Light, Garansi Resmi 3 Tahun',
                image_url: '/images/detail-server-main.png',
            },
            {
                name: 'Paket Jasa Setup OS, Join Active Directory & Mapping Printer Kantor',
                qty: 1,
                unit: 'Paket',
                spec: 'Instalasi onsite oleh 2 teknisi bersertifikat CV. Putra Nugraha',
                image_url: '/images/product-lan-services.png',
            },
        ],
        notes: 'Termin pembayaran disetujui: Net 30 Hari (TOP 30) setelah Berita Acara Serah Terima (BAST) dan e-Faktur diterbitkan.',
    },
    {
        id: '0119',
        rfq_number: '#RFQ-PN-2026-0119',
        sph_number: null,
        title: 'Pengadaan Server Rack 24U & Infrastruktur Kabel UTP Gedung B',
        date: '30 Okt 2026',
        valid_until: 'Estimasi Penawaran: < 24 Jam Kerja',
        status: 'under_review',
        status_label: 'Sedang Ditinjau Tim Estimator',
        category: 'infrastructure',
        retail_price: 48500000,
        negotiated_price: 45000000,
        savings_amount: null,
        sales_rep: {
            name: 'Tim Estimator Proyek CV. Putra Nugraha',
            role: 'Pre-sales Engineering Team',
            phone: '+62 813-2077-7874',
        },
        items: [
            {
                name: 'Server Rack Cabinet 24U Closed Rack Glass Door',
                qty: 1,
                unit: 'Unit',
                spec: 'Kedalaman 1000mm, Include PDU 8 Outlet, 2x Fan, 50x Cage Nut',
                image_url: '/images/detail-server-main.png',
            },
            {
                name: 'Kabel UTP Cat6 Belden Original 305m',
                qty: 8,
                unit: 'Roll',
                spec: '23 AWG Solid Bare Copper, ANSI/TIA-568-C.2, Barcode Original',
                image_url: '/images/product-belden-cable.png',
            },
            {
                name: 'Cisco Catalyst Switch 24-Port Gigabit Managed',
                qty: 2,
                unit: 'Unit',
                spec: '24x 1Gbps RJ45 + 4x 1G SFP Uplink, Layer 2+ Managed',
                image_url: '/images/product-cisco-switch.png',
            },
            {
                name: 'Jasa Penarikan Kabel & Terminasi Patch Panel 48 Titik',
                qty: 1,
                unit: 'Paket',
                spec: 'Termasuk sertifikasi Fluke Wiremap Test dan penataan kabel di rack',
                image_url: '/images/product-lan-services.png',
            },
        ],
        notes: 'Kebutuhan mendesak untuk relokasi kantor cabang Bandung Timur. Klien meminta opsi penawaran resmi berkop CV. Putra Nugraha untuk lampiran approval manajemen direksi.',
    },
];

export default function QuotationsIndex({
    quotations: serverQuotations,
    client: serverClient,
    metrics: serverMetrics,
    cartCount = 3,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const client = serverClient || DEFAULT_CLIENT;
    const metrics = serverMetrics || DEFAULT_METRICS;
    const initialQuotations = serverQuotations || DEFAULT_QUOTATIONS;

    // Filter states
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [selectedQuotationModal, setSelectedQuotationModal] = useState(null);

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman (14)', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH (2)', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak (e-Faktur)', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
    ];

    const statusTabs = [
        { id: 'all', label: 'Semua Pengajuan (2)' },
        { id: 'under_review', label: 'Menunggu Review Sales (1)' },
        { id: 'sph_issued', label: 'SPH Resmi Diterbitkan (1)' },
        { id: 'approved', label: 'Disetujui & Selesai (0)' },
    ];

    // Filter quotations
    const filteredQuotations = useMemo(() => {
        return initialQuotations.filter((q) => {
            if (selectedTab !== 'all' && q.status !== selectedTab) {
                return false;
            }
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchNumber = q.rfq_number.toLowerCase().includes(query);
                const matchTitle = q.title.toLowerCase().includes(query);
                const matchSPH = q.sph_number?.toLowerCase().includes(query);
                const matchItems = q.items.some(i => i.name.toLowerCase().includes(query));
                if (!matchNumber && !matchTitle && !matchSPH && !matchItems) return false;
            }
            return true;
        });
    }, [initialQuotations, selectedTab, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Status Pengajuan RFQ & SPH — CV. Putra Nugraha" />

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
                                placeholder="Cari nomor RFQ, nomor SPH, atau nama kebutuhan barang..."
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
                                const isActive = item.id === 'rfq';
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
                    {/* RIGHT CONTENT: RFQ & SPH NEGOTIATION WORKFLOW (9 Cols) */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* 1. Header Bar: Title + Button Ajukan RFQ */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Status Pengajuan RFQ &amp; Surat Penawaran (SPH)
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Kelola penawaran harga kuantitas besar, negosiasi B2B, dan unduh dokumen SPH resmi format PDF.
                                </p>
                            </div>

                            <Link
                                href="/portal"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition self-start sm:self-auto shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Ajukan RFQ dari Katalog</span>
                            </Link>
                        </div>

                        {/* 2. Three Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            {/* Metric 1 */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-xs font-medium">Total Pengajuan RFQ</span>
                                    <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.total_rfq} Pengajuan
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {metrics.total_rfq_sub}
                                </div>
                            </div>

                            {/* Metric 2 */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-xs font-medium">Potensi Efisiensi / Diskon</span>
                                    <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-[#8cd4b4]" />
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {formatRupiah(metrics.efficiency_savings)}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                    <span>{metrics.efficiency_sub}</span>
                                </div>
                            </div>

                            {/* Metric 3 */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-xs font-medium">SPH Siap Checkout</span>
                                    <FileCheck2 className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                </div>
                                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.ready_sph} Dokumen Sah
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {metrics.ready_sph_sub}
                                </div>
                            </div>

                        </div>

                        {/* 3. Status Filter Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* 4. RFQ / SPH CARDS LIST */}
                        <div className="space-y-5">
                            {filteredQuotations.length === 0 ? (
                                <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] space-y-3 shadow-sm">
                                    <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Pengajuan Sesuai Filter</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Silakan pilih filter lain atau ajukan penawaran baru untuk pengadaan kebutuhan kantor Anda.
                                    </p>
                                </div>
                            ) : (
                                filteredQuotations.map((q) => (
                                    <div
                                        key={q.id}
                                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700/80"
                                    >
                                        
                                        {/* Card Header: Nomor RFQ/SPH, Tanggal, Masa Berlaku, Status */}
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                            
                                            {/* Left: Code & Title */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                                                        {q.rfq_number}
                                                    </span>
                                                    {q.sph_number && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-mono">
                                                            No. SPH: {q.sph_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                                                    {q.title}
                                                </h3>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                                                    <span>Diajukan: {q.date}</span>
                                                    <span>•</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{q.valid_until}</span>
                                                </div>
                                            </div>

                                            {/* Right: Status Badge */}
                                            <div>
                                                {q.status === 'sph_issued' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium badge-ochre">
                                                        <span className="h-1.5 w-1.5 rounded-full dot-ochre shrink-0" />
                                                        <span>{q.status_label}</span>
                                                    </span>
                                                )}
                                                {q.status === 'under_review' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium badge-azure">
                                                        <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                                        <span>{q.status_label}</span>
                                                    </span>
                                                )}
                                            </div>

                                        </div>

                                        {/* Card Body: Items Preview & Pricing Comparison */}
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                            
                                            {/* Items List (8 Cols) */}
                                            <div className="md:col-span-8 space-y-3">
                                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Daftar Kebutuhan &amp; Spesifikasi Barang
                                                </div>

                                                <div className="space-y-2.5">
                                                    {q.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12]/80 border border-slate-200 dark:border-slate-800/80">
                                                            <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700/60">
                                                                <img
                                                                    src={item.image_url}
                                                                    alt={item.name}
                                                                    className="max-h-full max-w-full object-contain"
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-baseline justify-between gap-2">
                                                                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate">
                                                                        {item.name}
                                                                    </h4>
                                                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                                                        {item.qty} {item.unit}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                                    {item.spec}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Catatan Kebutuhan Khusus / TOP */}
                                                {q.notes && (
                                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-600/30 text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed flex items-start gap-2">
                                                        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                                        <span>{q.notes}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Financials / Negotiated Price Block (4 Cols) */}
                                            <div className="md:col-span-4 md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6 space-y-3">
                                                <div className="space-y-1">
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        {q.status === 'sph_issued' ? 'Total Harga Penawaran SPH:' : 'Estimasi Pagu Anggaran:'}
                                                    </span>
                                                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                        {formatRupiah(q.negotiated_price)}
                                                    </div>
                                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        Harga sudah termasuk Faktur Pajak PPN 11%
                                                    </div>
                                                </div>

                                                {/* Diskon / Efisiensi Info jika SPH sudah terbit */}
                                                {q.savings_amount && (
                                                    <div className="p-2.5 rounded-xl badge-sage space-y-0.5 text-xs">
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-through">
                                                            Harga Katalog: {formatRupiah(q.retail_price)}
                                                        </div>
                                                        <div className="font-bold text-emerald-700 dark:text-[#8cd4b4] text-xs">
                                                            Hemat {formatRupiah(q.savings_amount)} (Diskon B2B Disetujui)
                                                        </div>
                                                    </div>
                                                )}

                                                {/* PIC Sales Information */}
                                                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
                                                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                                                        {q.sales_rep.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                        {q.sales_rep.role}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Card Footer: Action Buttons */}
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            
                                            {/* Left Buttons: Dokumen SPH PDF / Draft */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {q.status === 'sph_issued' ? (
                                                    <a
                                                        href="/images/hero-datacenter-clean.jpg"
                                                        download={`SPH-${q.rfq_number.replace('#', '')}.pdf`}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-ochre-bespoke text-xs font-medium"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span>Unduh Dokumen SPH Resmi (PDF)</span>
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => alert(`Membuka berkas draft rincian spesifikasi pengajuan ${q.rfq_number}...`)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-primary-bespoke text-xs font-medium"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>Lihat Draft Spesifikasi RFQ</span>
                                                    </button>
                                                )}

                                                <a
                                                    href={`https://wa.me/6281320777874?text=Halo%20CV%20Putra%20Nugraha,%20saya%20PIC%20${encodeURIComponent(client.company_name)}%20ingin%20berdiskusi%20mengenai%20${encodeURIComponent(q.rfq_number)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg badge-sage hover:border-[#76C19F]/50 text-xs font-medium transition"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5 text-[#76C19F]" />
                                                    <span>Diskusi via WhatsApp</span>
                                                </a>
                                            </div>

                                            {/* Right Button: Lanjut Checkout & Terbitkan PO */}
                                            <div>
                                                {q.status === 'sph_issued' ? (
                                                    <Link
                                                        href="/buyer/checkout"
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium"
                                                    >
                                                        <span>Lanjut ke Checkout &amp; Terbitkan PO</span>
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => alert('Membuka formulir pembaruan rincian RFQ...')}
                                                        className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
                                                    >
                                                        Perbarui Dokumen RFQ
                                                    </button>
                                                )}
                                            </div>

                                        </div>

                                    </div>
                                ))
                            )}
                        </div>

                        {/* 5. Legal Guarantee Note Banner */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed shadow-sm">
                            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-slate-900 dark:text-white">Legalitas Dokumen Penawaran Resmi: </span>
                                Setiap Surat Penawaran Harga (SPH) yang diterbitkan oleh CV. Putra Nugraha dilengkapi dengan nomor surat resmi perusahaan, stempel basah/elektronik direksi, dan sah digunakan sebagai lampiran administrasi tender, verifikasi LPSE/BUMN, maupun pengajuan PO internal perusahaan.
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
