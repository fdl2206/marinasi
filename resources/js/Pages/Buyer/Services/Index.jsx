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
    Truck,
    HardDrive,
    BadgeAlert,
    ChevronRight,
    UserCheck,
    HelpCircle
} from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';

/**
 * Data mock jadwal instalasi & tiket servis B2B CV. Putra Nugraha
 * Backend dapat menyuplai prop `services`, `client`, dan `metrics` dari Controller.
 */
const DEFAULT_CLIENT = {
    company_name: 'PT Maju Jaya Teknologi',
    pic_name: 'Budi Santoso',
    tax_status: 'PKP & NPWP Terverifikasi',
};

const DEFAULT_METRICS = {
    active_schedules_count: 1,
    active_schedules_sub: 'Senin, 03 Nov 2026, 09:00 WIB',
    completed_tickets_count: 8,
    completed_tickets_sub: 'Rata-rata respon SLA 4.2 Jam',
    warranty_months: 6,
    warranty_sub: 'Kontrak Pemeliharaan Onsite',
    assigned_techs: '2 Teknisi',
    assigned_techs_sub: 'MTCNA & Hardware Specialist',
};

const DEFAULT_UPCOMING_SCHEDULE = {
    id: 'SCH-2026-0892',
    invoice_ref: '#INV-PN-2026-0892',
    po_ref: 'PO/MJT/IT/X/088',
    title: 'Instalasi & Setup Server HPE ProLiant ML30 & Switch Cisco 24-Port',
    date: 'Senin, 03 November 2026',
    time: '09:00 - 15:00 WIB (Estimasi 6 Jam Kerja)',
    location: 'Gedung Menara Lt. 5, Jl. Asia Afrika No. 128, Kota Bandung',
    status: 'confirmed',
    status_label: 'Teknisi Dikonfirmasi & Siap Meluncur',
    technicians: [
        {
            name: 'Dedi Kurniawan, S.T.',
            role: 'Lead Network Engineer (MTCNA / CCNA)',
            avatar_initial: 'DK',
            badge: 'Lead On-Site',
        },
        {
            name: 'Asep Saepuloh',
            role: 'Hardware & Cabling Specialist',
            avatar_initial: 'AS',
            badge: 'Field Tech',
        },
    ],
    scope_of_work: [
        'Perakitan awal & Cable Management di Server Rack Cabinet',
        'Konfigurasi RAID 1/RAID 5 & Setup Windows Server 2022',
        'Pemasangan 2x Switch Cisco 24-Port Gigabit & Konfigurasi VLAN Kantor',
        'Uji kontinuitas & kelayakan 10 titik kabel LAN Cat6 dengan Fluke Wiremap Test',
    ],
    tools_ready: 'Fluke Cable Tester, Crimping Kit, Console Cable, Label Maker, UPS Tester',
};

const DEFAULT_SERVICE_TICKETS = [
    {
        id: 'TKT-SRV-2026-088',
        date: '28 Okt 2026',
        category: 'Instalasi Baru (PO)',
        subject: 'Instalasi Server HPE ML30 & Konfigurasi VLAN Switch Cisco',
        ref_code: '#INV-PN-2026-0892',
        status: 'in_progress',
        status_label: 'Sedang Berjalan (On Progress)',
        tech_name: 'Dedi Kurniawan (Lead)',
        sla_info: '< 24 Jam Response Time',
        actions: ['Detail Pekerjaan', 'Checklist BAP'],
    },
    {
        id: 'TKT-SRV-2026-064',
        date: '14 Okt 2026',
        category: 'Pemeliharaan Rutin',
        subject: 'Inspeksi Kualitas Sinyal UniFi AP & Terminasi Ulang Port 8',
        ref_code: '#INV-PN-2026-0741',
        status: 'completed',
        status_label: 'Selesai & Berita Acara Ditandatangani',
        tech_name: 'Dedi Kurniawan & Asep Saepuloh',
        sla_info: 'Durasi Pengerjaan: 2.5 Jam (Tuntas)',
        actions: ['Unduh Laporan Kerja (PDF)'],
    },
    {
        id: 'TKT-SRV-2026-041',
        date: '02 Agu 2026',
        category: 'Klaim Garansi Servis',
        subject: 'Penggantian Power Supply Unit Cadangan Rack Server 42U',
        ref_code: '#INV-PN-2026-0411',
        status: 'completed',
        status_label: 'Selesai (Garansi Resmi 100% Bebas Biaya)',
        tech_name: 'Tim Support CV. Putra Nugraha',
        sla_info: 'Penggantian Unit Baru Selesai H+1',
        actions: ['Unduh Lembar Klaim Garansi'],
    },
];

export default function ServicesIndex({
    client: serverClient,
    metrics: serverMetrics,
    upcomingSchedule: serverUpcomingSchedule,
    tickets: serverTickets,
    cartCount = 3,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const client = serverClient || DEFAULT_CLIENT;
    const metrics = serverMetrics || DEFAULT_METRICS;
    const upcomingSchedule = serverUpcomingSchedule || DEFAULT_UPCOMING_SCHEDULE;
    const initialTickets = serverTickets || DEFAULT_SERVICE_TICKETS;

    // Filter states
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman (14)', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH (2)', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak (e-Faktur)', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
    ];

    const serviceTabs = [
        { id: 'all', label: 'Semua Layanan & Tiket (4)' },
        { id: 'active', label: 'Jadwal Instalasi Aktif (1)' },
        { id: 'completed', label: 'Riwayat Selesai (2)' },
    ];

    const filteredTickets = useMemo(() => {
        return initialTickets.filter((t) => {
            if (selectedTab === 'active' && t.status !== 'in_progress') return false;
            if (selectedTab === 'completed' && t.status !== 'completed') return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchId = t.id.toLowerCase().includes(q);
                const matchSubject = t.subject.toLowerCase().includes(q);
                const matchRef = t.ref_code.toLowerCase().includes(q);
                if (!matchId && !matchSubject && !matchRef) return false;
            }
            return true;
        });
    }, [initialTickets, selectedTab, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Jadwal Instalasi & Tiket Servis — CV. Putra Nugraha" />

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
                                placeholder="Cari nomor tiket servis, jadwal instalasi, atau nama teknisi..."
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
                                        <Wrench className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
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
                                        <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
                    {/* RIGHT CONTENT: ONSITE SCHEDULE & TICKETS (9 Cols)     */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* 1. Header Bar: Title + Request Service Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Jadwal Instalasi &amp; Tiket Servis On-Site
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Pantau jadwal teknisi bersertifikat, status perakitan infrastruktur IT, dan permohonan garansi purna jual.
                                </p>
                            </div>

                            <a
                                href="https://wa.me/6281320777874?text=Halo%20Tim%20Teknis%20CV%20Putra%20Nugraha,%20saya%20PIC%20PT%20Maju%20Jaya%20Teknologi%20ingin%20mengajukan%20tiket%20servis%20/%20kunjungan%20teknisi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition self-start sm:self-auto shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Ajukan Tiket / Kunjungan Teknisi</span>
                            </a>
                        </div>

                        {/* 2. Four Service Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-xs font-medium">Jadwal On-Site Aktif</span>
                                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {metrics.active_schedules_count} Kunjungan
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                                        {metrics.active_schedules_sub}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-xs font-medium">Tiket Servis Selesai</span>
                                    <CheckCircle2 className="h-4 w-4 text-[#8cd4b4]" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        {metrics.completed_tickets_count} Tiket
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                        <span>{metrics.completed_tickets_sub}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-xs font-medium">Garansi Pemeliharaan</span>
                                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {metrics.warranty_months} Bulan
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {metrics.warranty_sub}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-xs font-medium">Teknisi Bertugas</span>
                                    <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {metrics.assigned_techs}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {metrics.assigned_techs_sub}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* 3. FEATURED ACTIVE VISIT CARD: JADWAL INSTALASI ONSITE TERDEKAT */}
                        <div className="rounded-2xl border border-blue-500/30 dark:border-blue-600/40 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-md dark:shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                            {/* Header of Active Visit */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-[#8cd4b4] uppercase tracking-wider">
                                            Kunjungan Teknisi On-Site Terdekat
                                        </span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                        {upcomingSchedule.title}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                        Invoice Ref: <span className="text-blue-600 dark:text-[#9bb8f5]">{upcomingSchedule.invoice_ref}</span> • Ref PO: {upcomingSchedule.po_ref}
                                    </p>
                                </div>

                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium badge-azure self-start sm:self-auto shadow-sm">
                                    <Clock className="h-3.5 w-3.5 text-[#4361EE]" />
                                    <span>{upcomingSchedule.status_label}</span>
                                </span>
                            </div>

                            {/* Waktu & Lokasi Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 space-y-1">
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Hari &amp; Waktu Pelaksanaan:</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                        {upcomingSchedule.date}
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                                        {upcomingSchedule.time}
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 space-y-1">
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                                        <span>Lokasi Gedung / Ruang Server:</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                        {upcomingSchedule.location}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        PIC Penerima Lapangan: Budi Santoso (0812-3456-7890)
                                    </div>
                                </div>
                            </div>

                            {/* Tim Teknisi Bertugas */}
                            <div className="space-y-2.5">
                                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Tim Teknisi Resmi CV. Putra Nugraha yang Ditugaskan
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {upcomingSchedule.technicians.map((tech, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0C0D12]/80 border border-slate-200 dark:border-slate-800">
                                            <div className="h-9 w-9 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                                {tech.avatar_initial}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate">{tech.name}</span>
                                                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600/30">{tech.badge}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{tech.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lingkup Pekerjaan & Tools */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Wrench className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Rencana Cakupan Pekerjaan (Scope of Work):</span>
                                </div>
                                <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 pl-5 list-disc text-[11px]">
                                    {upcomingSchedule.scope_of_work.map((scope, sIdx) => (
                                        <li key={sIdx}>{scope}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Buttons for Schedule */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Butuh penyesuaian jam kedatangan? Hubungi helpdesk kami maksimal H-1.
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <a
                                        href="https://wa.me/6281320777874"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 text-xs font-bold transition"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>Koordinasi WhatsApp Teknisi</span>
                                    </a>
                                </div>
                            </div>

                        </div>

                        {/* 4. RIWAYAT TIKET PERMINTAAN SERVIS & PEMELIHARAAN B2B */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                    Daftar Tiket Bantuan Teknis &amp; Pemeliharaan
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {serviceTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setSelectedTab(tab.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                                                selectedTab === tab.id
                                                    ? 'btn-primary-bespoke'
                                                    : 'bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12]/80 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                <th className="py-3.5 px-4">No. Tiket &amp; Ref PO</th>
                                                <th className="py-3.5 px-3">Tanggal</th>
                                                <th className="py-3.5 px-4">Kategori &amp; Pokok Pekerjaan</th>
                                                <th className="py-3.5 px-4">Teknisi Ditugaskan</th>
                                                <th className="py-3.5 px-3">Status</th>
                                                <th className="py-3.5 px-4 text-right sm:text-left">Dokumen / Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                                            {filteredTickets.map((t) => (
                                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    
                                                    <td className="py-4 px-4 font-mono">
                                                        <div className="font-bold text-slate-900 dark:text-white text-xs">{t.id}</div>
                                                        <div className="text-[10px] text-blue-600 dark:text-[#9bb8f5]">{t.ref_code}</div>
                                                    </td>

                                                    <td className="py-4 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                        {t.date}
                                                    </td>

                                                    <td className="py-4 px-4 text-slate-800 dark:text-white font-medium max-w-xs">
                                                        <div className="text-[10px] font-semibold text-blue-600 dark:text-[#9bb8f5] uppercase tracking-wider">{t.category}</div>
                                                        <div className="text-xs text-slate-700 dark:text-slate-200 mt-0.5 line-clamp-1">{t.subject}</div>
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.sla_info}</div>
                                                    </td>

                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                        {t.tech_name}
                                                    </td>

                                                    <td className="py-4 px-3 whitespace-nowrap">
                                                        {t.status === 'in_progress' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium badge-azure">
                                                                <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                                                <span>{t.status_label}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium badge-sage">
                                                                <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                                <span>{t.status_label}</span>
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {t.actions.map((act, aIdx) => (
                                                                <button
                                                                    key={aIdx}
                                                                    type="button"
                                                                    onClick={() => alert(`Membuka berkas: ${act} untuk tiket ${t.id}`)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-secondary-bespoke text-[11px] font-medium transition"
                                                                >
                                                                    <FileText className="h-3 w-3 text-slate-400" />
                                                                    <span>{act}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                        
                        {/* Col 1 */}
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

                        {/* Col 2 */}
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

                        {/* Col 3 */}
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

                        {/* Col 4 */}
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
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                        <p>© 2026 CV. Putra Nugraha. All Right Reserved.</p>
                        <p className="hidden sm:block">Perdagangan Barang dan Jasa</p>
                    </div>
                </div>
            </footer>

            {/* FLOATING WHATSAPP BUTTON */}
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

