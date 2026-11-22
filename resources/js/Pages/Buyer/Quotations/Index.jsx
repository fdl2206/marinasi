import { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
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
    Plus,
    FileSpreadsheet,
    FileCheck2,
    ShieldCheck,
    MessageSquare,
    Info,
    ExternalLink,
    X
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';

/**
 * Data mock status pengajuan RFQ & Surat Penawaran Harga (SPH)
 * Sesuai mockup UI/UX terbaru (media_1795278415261_989d0017.jpg)
 */
const DEFAULT_CLIENT = {
    company_name: 'PT Maju Jaya Teknologi',
    pic_name: 'Budi Santoso',
    pic_role: 'IT Procurement',
    tax_status: 'NPWP Terverifikasi • PKP Aktif',
};

const DEFAULT_METRICS = {
    total_rfq: 6,
    total_rfq_sub: 'Tahun berjalan 2026',
    pending_rfq: 1,
    pending_rfq_sub: 'Estimasi respon maks. 1x24 jam',
    issued_sph: 1,
    issued_sph_sub: 'Berlaku 14 hari kalender',
    approved_rfq: 4,
    approved_rfq_sub: 'Termasuk PPN 11%',
};

const DEFAULT_QUOTATIONS = [
    {
        id: '0115',
        rfq_number: '#RFQ-PN-2026-0115',
        sph_ref: 'Ref SPH: SPH/PN/X/2026/084',
        date: '05 Okt 2026',
        title: 'Pengadaan 10 Unit PC Workstation Kantor + Instalasi LAN',
        subtitle: 'Lampiran RAB: RAB_Workstation_MJT.pdf',
        price: 61250000,
        price_note: 'Termasuk PPN 11% (e-Faktur)',
        status: 'sph_issued',
        status_label: 'SPH Diterbitkan',
        status_note: 'Berlaku s.d. 19 Okt 2026',
        can_download_sph: true,
        can_confirm: true,
        can_view_detail: false,
        can_chat_wa: false,
        can_view_order: false,
        items: [
            '10x PC Workstation Core i7-13700 16GB RAM 512GB SSD',
            '10x Monitor LED 24 Inch Full HD IPS',
            '1x Paket Jasa Setup OS & LAN Kantor',
        ],
    },
    {
        id: '0119',
        rfq_number: '#RFQ-PN-2026-0119',
        sph_ref: 'Menunggu penomoran SPH',
        date: 'Hari ini, 09:40 WIB',
        title: '4x Server HPE ML30 Gen10 + 2x Cisco Switch 24-Port',
        subtitle: 'Termin PO 30 Hari Diajukan',
        price: 128500000,
        price_note: 'Menunggu kalkulasi grosir admin',
        status: 'under_review',
        status_label: 'Menunggu SPH',
        status_note: 'Diproses tim CV. Putra Nugraha',
        can_download_sph: false,
        can_confirm: false,
        can_view_detail: true,
        can_chat_wa: true,
        can_view_order: false,
        items: [
            '4x Server HPE ProLiant ML30 Gen10',
            '2x Cisco Catalyst Switch 24-Port Gigabit',
            'Termin Pembayaran: Net 30 Hari (Corporate TOP)',
        ],
    },
    {
        id: '0102',
        rfq_number: '#RFQ-PN-2026-0102',
        sph_ref: 'Ref SPH: SPH/PN/IX/2026/051',
        date: '14 Sep 2026',
        title: 'Paket Pemasangan CCTV 8 Titik + DVR & Kabel',
        subtitle: 'Selesai & Terbit Invoice',
        price: 24750000,
        price_note: 'PPN 11% Terverifikasi',
        status: 'approved',
        status_label: 'Disetujui / PO Terbit',
        status_note: 'Invoice #INV-PN-2026-0710',
        can_download_sph: true,
        can_confirm: false,
        can_view_detail: false,
        can_chat_wa: false,
        can_view_order: true,
        order_url: '/buyer/orders',
        items: [
            '8x Kamera CCTV Outdoor IP 4MP IR Night Vision',
            '1x NVR 8-Channel 4K H.265+',
            '1x Harddisk Surveillance 4TB WD Purple',
            '1x Jasa Instalasi & Penarikan Kabel Coaxial/UTP',
        ],
    },
];

export default function QuotationsIndex({
    quotations: serverQuotations,
    client: serverClient,
    metrics: serverMetrics,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const client = serverClient || DEFAULT_CLIENT;
    const metrics = serverMetrics || DEFAULT_METRICS;
    const initialQuotations = serverQuotations || DEFAULT_QUOTATIONS;

    // Filter states
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [detailModalQuotation, setDetailModalQuotation] = useState(null);

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman (4)', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH (2)', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak (e-Faktur)', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
    ];

    const filterTabs = [
        { id: 'all', label: 'Semua (6)' },
        { id: 'under_review', label: 'Menunggu Review (1)' },
        { id: 'sph_issued', label: 'SPH Diterbitkan (1)' },
        { id: 'approved', label: 'Disetujui (4)' },
    ];

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Filtered quotations logic
    const filteredQuotations = useMemo(() => {
        return initialQuotations.filter((q) => {
            if (selectedTab !== 'all' && q.status !== selectedTab) {
                return false;
            }
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchNumber = q.rfq_number.toLowerCase().includes(query);
                const matchTitle = q.title.toLowerCase().includes(query);
                const matchSPH = q.sph_ref.toLowerCase().includes(query);
                if (!matchNumber && !matchTitle && !matchSPH) return false;
            }
            return true;
        });
    }, [initialQuotations, selectedTab, searchQuery]);

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Status Pengajuan RFQ & SPH — CV. Putra Nugraha" />

            {/* Navbar Header */}
            <BuyerNavbar />

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA                                         */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ===================================================== */}
                    {/* LEFT SIDEBAR: PROFILE & NAVIGATION MENU (3 Cols)      */}
                    {/* ===================================================== */}
                    <aside className="lg:col-span-3 space-y-5">
                        
                        {/* 1. Akun Perusahaan Card (Deep Navy Sesuai Mockup) */}
                        <div className="rounded-2xl bg-[#0a2540] p-4 sm:p-5 space-y-3 text-white shadow-sm border border-[#0a2540]">
                            <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5 text-white" />
                                <span>Akun Perusahaan</span>
                            </div>

                            <div className="space-y-0.5">
                                <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                                    {client.company_name}
                                </h2>
                                <p className="text-xs text-slate-300">
                                    PIC: {client.pic_name} ({client.pic_role})
                                </p>
                            </div>

                            {/* Verification Pill */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-emerald-300 text-[10px] font-semibold w-full">
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
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
                                                ? 'bg-[#086f8e] text-white shadow-md'
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
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Keluar Akun</span>
                            </Link>
                        </div>

                    </aside>

                    {/* ===================================================== */}
                    {/* RIGHT CONTENT: RFQ & SPH TABLE VIEW (9 Cols)          */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* 1. Header Bar: Title + Button + Buat Pengajuan RFQ Baru */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="text-[10px] sm:text-xs font-bold text-[#086f8e] dark:text-[#38bdf8] uppercase tracking-wider">
                                    DASHBOARD KLIEN / RFQ &amp; SPH
                                </div>
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Status Pengajuan RFQ &amp; Surat Penawaran Harga (SPH)
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                    Pantau status review permintaan pengadaan, unduh PDF SPH resmi berstempel, dan lanjutkan ke konfirmasi pesanan.
                                </p>
                            </div>

                            {/* + Buat Pengajuan RFQ Baru Button (Golden Yellow) */}
                            <Link
                                href="/buyer/rfq/create"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-xs transition self-start sm:self-auto shrink-0 cursor-pointer"
                            >
                                <Plus className="h-4 w-4 text-slate-950" />
                                <span>+ Buat Pengajuan RFQ Baru</span>
                            </Link>
                        </div>

                        {/* 2. Four Summary Metric Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            {/* Card 1: Total Pengajuan RFQ */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-sm">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Total Pengajuan RFQ
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.total_rfq} RFQ
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {metrics.total_rfq_sub}
                                </div>
                            </div>

                            {/* Card 2: Menunggu Review SPH */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-sm">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Menunggu Review SPH
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                                    {metrics.pending_rfq} RFQ
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {metrics.pending_rfq_sub}
                                </div>
                            </div>

                            {/* Card 3: SPH Terbit (Siap PO) */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-sm">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    SPH Terbit (Siap PO)
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-[#086f8e] dark:text-[#38bdf8]">
                                    {metrics.issued_sph} SPH
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {metrics.issued_sph_sub}
                                </div>
                            </div>

                            {/* Card 4: Disetujui / Jadi Pesanan */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-sm">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Disetujui / Jadi Pesanan
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {metrics.approved_rfq} RFQ
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {metrics.approved_rfq_sub}
                                </div>
                            </div>

                        </div>

                        {/* 3. Filter Tabs & Search Bar Container */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3.5 shadow-sm">
                            
                            {/* Filter Tabs */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                                {filterTabs.map((tab) => {
                                    const isActive = selectedTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setSelectedTab(tab.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#086f8e] text-white shadow-xs'
                                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Input */}
                            <div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari No. RFQ, No. SPH, atau nama barang..."
                                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                        </div>

                        {/* 4. RFQ / SPH B2B CORPORATE DATA TABLE */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    
                                    {/* Table Header */}
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#12161F] text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="py-3.5 px-4 sm:px-5">NO. RFQ &amp; TANGGAL</th>
                                            <th className="py-3.5 px-4">RINCIAN BARANG / JASA</th>
                                            <th className="py-3.5 px-4">NILAI PENAWARAN SPH (INCL. PPN 11%)</th>
                                            <th className="py-3.5 px-4">MASA BERLAKU &amp; STATUS</th>
                                            <th className="py-3.5 px-4 sm:px-5 text-center">AKSI KLIEN</th>
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {filteredQuotations.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                                    Tidak ada data pengajuan RFQ / SPH yang sesuai dengan filter atau kata kunci.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredQuotations.map((q) => (
                                                <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                                    
                                                    {/* Col 1: NO. RFQ & TANGGAL */}
                                                    <td className="py-4 px-4 sm:px-5 align-top space-y-1 whitespace-nowrap">
                                                        <div className="font-mono font-bold text-[#086f8e] dark:text-[#38bdf8] text-xs">
                                                            {q.rfq_number}
                                                        </div>
                                                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            {q.date}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            {q.sph_ref}
                                                        </div>
                                                    </td>

                                                    {/* Col 2: RINCIAN BARANG / JASA */}
                                                    <td className="py-4 px-4 align-top space-y-1 min-w-[220px]">
                                                        <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                                                            {q.title}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            {q.subtitle}
                                                        </div>
                                                    </td>

                                                    {/* Col 3: NILAI PENAWARAN SPH (INCL. PPN 11%) */}
                                                    <td className="py-4 px-4 align-top space-y-1 whitespace-nowrap">
                                                        <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                                            {formatRupiah(q.price)}
                                                        </div>
                                                        <div className={`text-[10px] font-medium ${
                                                            q.price_note.includes('PPN')
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : 'text-slate-500 dark:text-slate-400'
                                                        }`}>
                                                            {q.price_note}
                                                        </div>
                                                    </td>

                                                    {/* Col 4: MASA BERLAKU & STATUS */}
                                                    <td className="py-4 px-4 align-top space-y-1.5 whitespace-nowrap">
                                                        {q.status === 'sph_issued' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-sky-50 text-[#086f8e] border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                                                                {q.status_label}
                                                            </span>
                                                        )}
                                                        {q.status === 'under_review' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                                                {q.status_label}
                                                            </span>
                                                        )}
                                                        {q.status === 'approved' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                                                {q.status_label}
                                                            </span>
                                                        )}
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            {q.status_note}
                                                        </div>
                                                    </td>

                                                    {/* Col 5: AKSI KLIEN */}
                                                    <td className="py-4 px-4 sm:px-5 align-top whitespace-nowrap">
                                                        <div className="flex flex-col items-stretch gap-2 min-w-[130px]">
                                                            
                                                            {/* Download SPH Button */}
                                                            {q.can_download_sph && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => alert(`Mengunduh dokumen PDF SPH resmi untuk ${q.rfq_number}...`)}
                                                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                                                                >
                                                                    <Download className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                                                                    <span>Unduh PDF SPH</span>
                                                                </button>
                                                            )}

                                                            {/* Lanjut Konfirmasi (Golden Yellow) */}
                                                            {q.can_confirm && (
                                                                <Link
                                                                    href="/buyer/checkout"
                                                                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-2xs transition cursor-pointer"
                                                                >
                                                                    <span>Lanjut Konfirmasi</span>
                                                                    <ArrowRight className="h-3.5 w-3.5 text-slate-950" />
                                                                </Link>
                                                            )}

                                                            {/* Lihat Rincian RFQ */}
                                                            {q.can_view_detail && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDetailModalQuotation(q)}
                                                                    className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                                                                >
                                                                    Lihat Rincian RFQ
                                                                </button>
                                                            )}

                                                            {/* Chat Admin WA */}
                                                            {q.can_chat_wa && (
                                                                <a
                                                                    href={`https://wa.me/6281320777874?text=Halo%20Admin%20CV%20Putra%20Nugraha,%20saya%20PIC%20${encodeURIComponent(client.company_name)}%20ingin%20menanyakan%20status%20${encodeURIComponent(q.rfq_number)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs font-bold text-[#086f8e] dark:text-[#38bdf8] hover:underline text-center transition cursor-pointer py-0.5"
                                                                >
                                                                    Chat Admin WA
                                                                </a>
                                                            )}

                                                            {/* Lihat Pesanan */}
                                                            {q.can_view_order && (
                                                                <Link
                                                                    href={q.order_url || '/buyer/orders'}
                                                                    className="text-xs font-bold text-[#086f8e] dark:text-[#38bdf8] hover:underline text-center transition cursor-pointer py-0.5"
                                                                >
                                                                    Lihat Pesanan
                                                                </Link>
                                                            )}

                                                        </div>
                                                    </td>

                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 5. Catatan B2B Info Box */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <Info className="h-4 w-4 text-[#086f8e] dark:text-[#38bdf8] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 dark:text-white">Catatan B2B: </span>
                                <span>
                                    Setelah SPH diterbitkan dan disetujui, konfirmasi pesanan dan pengiriman/instalasi dilanjutkan bersama admin CV. Putra Nugraha (0813-2077-7874) dengan dukungan Faktur Pajak PPN 11%.
                                </span>
                            </div>
                        </div>

                    </div>

                </div>

            </main>

            {/* ========================================================= */}
            {/* MODAL: DETAIL RINCIAN PENGAJUAN RFQ                       */}
            {/* ========================================================= */}
            <Modal show={!!detailModalQuotation} onClose={() => setDetailModalQuotation(null)} maxWidth="lg">
                {detailModalQuotation && (
                    <div className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                                <span className="text-xs font-mono font-bold text-[#086f8e] dark:text-[#38bdf8]">
                                    {detailModalQuotation.rfq_number}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                    {detailModalQuotation.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Tanggal Pengajuan: {detailModalQuotation.date}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModalQuotation(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                                Item &amp; Kebutuhan yang Diajukan:
                            </h4>
                            <ul className="space-y-2 list-disc list-inside bg-slate-50 dark:bg-[#0C0D12] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                {detailModalQuotation.items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>

                            <div className="pt-2 flex justify-between items-center text-xs">
                                <span className="text-slate-500">Estimasi Budget:</span>
                                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                                    {formatRupiah(detailModalQuotation.price)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDetailModalQuotation(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                Tutup
                            </button>
                            <a
                                href={`https://wa.me/6281320777874?text=Halo%20Admin%20CV%20Putra%20Nugraha,%20saya%20PIC%20${encodeURIComponent(client.company_name)}%20ingin%20menanyakan%20status%20${encodeURIComponent(detailModalQuotation.rfq_number)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-md transition cursor-pointer"
                            >
                                Chat Admin via WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Footer */}
            <BuyerFooter />

        </div>
    );
}
