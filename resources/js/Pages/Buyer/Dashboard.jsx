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
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';

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
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Dashboard Klien B2B — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <BuyerNavbar />

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
                                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#086f8e]/10 dark:bg-[#086f8e]/20 border border-[#086f8e]/30 dark:border-[#086f8e]/40">
                                        <div className="h-7 w-7 rounded-full bg-[#086f8e] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-[#086f8e]/30">
                                            <Truck className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Pengiriman &amp; Instalasi Teknisi</div>
                                            <div className="text-[10px] text-[#086f8e] dark:text-[#38bdf8] font-semibold">Sedang berlangsung</div>
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
                                        <div className="h-8 w-8 rounded-full bg-[#086f8e] border border-white/20 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-[#171B26] shadow-lg shadow-[#086f8e]/20">
                                            <Truck className="h-4 w-4" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                            Pengiriman &amp; Instalasi Teknisi
                                        </span>
                                        <span className="text-[10px] text-[#086f8e] dark:text-[#38bdf8] font-semibold">
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
            {/* FOOTER B2B CORPORATE 4 KOLOM & WA HOTLINE                 */}
            {/* ========================================================= */}
            <BuyerFooter />

        </div>
    );
}
