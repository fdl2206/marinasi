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
    Phone, 
    MapPin, 
    ChevronDown, 
    FileCheck2, 
    ShieldCheck, 
    QrCode, 
    FileSpreadsheet, 
    TrendingUp,
    ExternalLink,
    Percent,
    Building
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';

/**
 * Data mock dokumen faktur pajak & invoice resmi CV. Putra Nugraha
 * Backend dapat menyuplai prop `documents`, `client`, `taxSummary` dari Controller.
 */
const DEFAULT_CLIENT = {
    company_name: 'PT Maju Jaya Teknologi',
    pic_name: 'Budi Santoso',
    npwp_number: '01.234.567.8-429.000',
    tax_status: 'PKP & NPWP Terverifikasi',
};

const DEFAULT_TAX_SUMMARY = {
    total_efaktur_count: 12,
    total_efaktur_sub: 'Semua valid & terdaftar DJP',
    total_ppn_amount: 14716216,
    total_ppn_sub: 'Pajak Masukan dapat dikreditkan',
    total_bast_count: 10,
    total_bast_sub: 'Berita Acara Serah Terima sah',
    tax_status_badge: 'PKP Aktif',
    tax_status_sub: 'e-Faktur otomatis terbit',
};

const DEFAULT_DOCUMENTS = [
    {
        id: 'DOC-0892',
        doc_type: 'efaktur',
        doc_type_label: 'e-Faktur PPN 11%',
        doc_number: '010.002-26.8920114',
        invoice_ref: '#INV-PN-2026-0892',
        date: '28 Okt 2026',
        tax_period: 'Oktober 2026',
        description: 'Server HPE ProLiant ML30 Gen10 + Switch Cisco 24-Port & Jasa LAN',
        dpp_amount: 64774775,
        ppn_amount: 7125225,
        total_amount: 71900000,
        status: 'approved',
        status_label: 'DJP Approved & Valid',
        qr_available: true,
        files: [
            { label: 'Unduh PDF e-Faktur', variant: 'amber', icon: Download },
            { label: 'Invoice B2B', variant: 'blue', icon: FileText },
        ],
    },
    {
        id: 'DOC-0741',
        doc_type: 'efaktur',
        doc_type_label: 'e-Faktur PPN 11%',
        doc_number: '010.002-26.7410982',
        invoice_ref: '#INV-PN-2026-0741',
        date: '12 Okt 2026',
        tax_period: 'Oktober 2026',
        description: '4x Ubiquiti UniFi AP AC Pro + 1 Roll Kabel UTP Cat6 Belden',
        dpp_amount: 11621622,
        ppn_amount: 1278378,
        total_amount: 12900000,
        status: 'approved',
        status_label: 'DJP Approved & Valid',
        qr_available: true,
        files: [
            { label: 'Unduh PDF e-Faktur', variant: 'amber', icon: Download },
            { label: 'Kwitansi Lunas', variant: 'blue', icon: FileText },
        ],
    },
    {
        id: 'DOC-BAST-099',
        doc_type: 'bast',
        doc_type_label: 'Berita Acara (BAST)',
        doc_number: 'BAST/PN/2026/X-099',
        invoice_ref: 'PO/MJT/IT/X/042',
        date: '15 Okt 2026',
        tax_period: 'Oktober 2026',
        description: 'Berita Acara Pekerjaan Pengadaan & Terminasi Access Point Kantor',
        dpp_amount: 11621622,
        ppn_amount: 1278378,
        total_amount: 12900000,
        status: 'signed',
        status_label: 'BAST Resmi Ditandatangani',
        qr_available: false,
        files: [
            { label: 'Unduh Dokumen BAST (PDF)', variant: 'blue', icon: FileCheck2 },
        ],
    },
    {
        id: 'DOC-0650',
        doc_type: 'efaktur',
        doc_type_label: 'e-Faktur PPN 11%',
        doc_number: '010.002-26.6500129',
        invoice_ref: '#INV-PN-2026-0650',
        date: '18 Sep 2026',
        tax_period: 'September 2026',
        description: '2x Storage NAS Synology DS923+ 4-Bay & 8x HDD 4TB IronWolf',
        dpp_amount: 28828829,
        ppn_amount: 3171171,
        total_amount: 32000000,
        status: 'approved',
        status_label: 'DJP Approved & Valid',
        qr_available: true,
        files: [
            { label: 'Unduh PDF e-Faktur', variant: 'amber', icon: Download },
            { label: 'Invoice Lunas', variant: 'blue', icon: FileText },
        ],
    },
    {
        id: 'DOC-BAST-088',
        doc_type: 'bast',
        doc_type_label: 'Berita Acara (BAST)',
        doc_number: 'BAST/PN/2026/IX-071',
        invoice_ref: 'PO/MJT/IT/IX/019',
        date: '22 Sep 2026',
        tax_period: 'September 2026',
        description: 'Berita Acara Serah Terima Instalasi & Setup Storage NAS Kantor',
        dpp_amount: 28828829,
        ppn_amount: 3171171,
        total_amount: 32000000,
        status: 'signed',
        status_label: 'BAST Resmi Ditandatangani',
        qr_available: false,
        files: [
            { label: 'Unduh Dokumen BAST (PDF)', variant: 'blue', icon: FileCheck2 },
        ],
    },
    {
        id: 'DOC-0580',
        doc_type: 'invoice',
        doc_type_label: 'Kwitansi & Proforma',
        doc_number: 'KW-PN-2026-0580',
        invoice_ref: '#INV-PN-2026-0580',
        date: '10 Agu 2026',
        tax_period: 'Agustus 2026',
        description: 'Paket Pemeliharaan Rutin Server & Jaringan Triwulan III',
        dpp_amount: 7657658,
        ppn_amount: 842342,
        total_amount: 8500000,
        status: 'approved',
        status_label: 'Lunas & Berstempel',
        qr_available: false,
        files: [
            { label: 'Unduh Kwitansi Sah', variant: 'blue', icon: Download },
        ],
    },
];

export default function InvoicesIndex({
    documents: serverDocuments,
    client: serverClient,
    taxSummary: serverTaxSummary,
    cartCount = 3,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const client = serverClient || DEFAULT_CLIENT;
    const taxSummary = serverTaxSummary || DEFAULT_TAX_SUMMARY;
    const initialDocuments = serverDocuments || DEFAULT_DOCUMENTS;

    // Filter states
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman (14)', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH (2)', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak (e-Faktur)', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
    ];

    const documentTabs = [
        { id: 'all', label: 'Semua Dokumen (12)' },
        { id: 'efaktur', label: 'e-Faktur PPN (7)' },
        { id: 'bast', label: 'Berita Acara (BAST) (2)' },
        { id: 'invoice', label: 'Invoice & Kwitansi Lunas (3)' },
    ];

    // Filter dokumen
    const filteredDocuments = useMemo(() => {
        return initialDocuments.filter((doc) => {
            if (selectedTab !== 'all' && doc.doc_type !== selectedTab) {
                return false;
            }
            if (selectedPeriod !== 'all' && doc.tax_period !== selectedPeriod) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchNumber = doc.doc_number.toLowerCase().includes(q);
                const matchInvoice = doc.invoice_ref.toLowerCase().includes(q);
                const matchDesc = doc.description.toLowerCase().includes(q);
                if (!matchNumber && !matchInvoice && !matchDesc) return false;
            }
            return true;
        });
    }, [initialDocuments, selectedTab, selectedPeriod, searchQuery]);

    return (
        <div className="min-h-screen bg-[#0C0D12] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
            <Head title="Dokumen & Faktur Pajak (e-Faktur) — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#12161F]">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
                    
                    {/* Brand Identity / Logo */}
                    <Link href="/portal" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        <img
                            src="/images/logo-pn.png"
                            alt="Logo CV. Putra Nugraha"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase">
                                CV. PUTRA NUGRAHA -
                            </span>
                            <span className="hidden sm:inline text-[11px] font-normal text-slate-400">
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
                                placeholder="Cari nomor Faktur Pajak (010.xxx), No. Invoice, atau nama barang..."
                                style={{ color: '#0f172a' }}
                                className="w-full h-10 rounded-lg bg-white border border-transparent pl-4 pr-11 text-xs !text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500">
                                <Search className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Right Actions: Keranjang & Akun */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <Link
                            href="/buyer/cart"
                            className="relative flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4 text-slate-300" />
                            <span>Keranjang</span>
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
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span>Akun</span>
                            </button>

                            {accountMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-[#1E2434] p-2 shadow-2xl space-y-1 text-xs z-50">
                                    <div className="px-3 py-2 border-b border-slate-800">
                                        <div className="font-bold text-white truncate">{client.company_name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{client.pic_name}</div>
                                    </div>
                                    <Link
                                        href="/buyer/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Dashboard Pengadaan</span>
                                    </Link>
                                    <Link
                                        href="/buyer/orders"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <Package className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Riwayat Pesanan</span>
                                    </Link>
                                    <Link
                                        href="/buyer/quotations"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <FileText className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Pengajuan RFQ &amp; SPH</span>
                                    </Link>
                                    <Link
                                        href="/portal"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <Receipt className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Katalog Pengadaan B2B</span>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-left"
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
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 shrink-0 mt-0.5 border border-blue-500/20">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <h2 className="text-sm font-bold text-white leading-tight truncate">
                                        {client.company_name}
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        PIC: {client.pic_name}
                                    </p>
                                </div>
                            </div>

                            {/* Verification Pill */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-500/30 text-blue-400 text-[10px] font-semibold w-full">
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-blue-400" />
                                <span className="truncate">{client.tax_status}</span>
                            </div>
                        </div>

                        {/* 2. Sidebar Navigation Items */}
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-2 space-y-1 shadow-lg">
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
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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
                                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Keluar Akun</span>
                            </Link>
                        </div>

                    </aside>

                    {/* ===================================================== */}
                    {/* RIGHT CONTENT: TAX & INVOICE MANAGEMENT (9 Cols)       */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* 1. Header Bar: Title + Export Rekap Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    Dokumen &amp; Faktur Pajak (e-Faktur)
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                    Arsip faktur pajak elektronik resmi DJP, dokumen BAST, dan kwitansi berstempel sah perusahaan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => alert('Mengekspor seluruh berkas Faktur Pajak Masukan tahun berjalan format ZIP & CSV untuk pelaporan SPT Masa...')}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171B26] hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold shadow-sm transition self-start sm:self-auto shrink-0"
                            >
                                <Download className="h-3.5 w-3.5 text-blue-400" />
                                <span>Ekspor Rekap Pajak (ZIP/CSV)</span>
                            </button>
                        </div>

                        {/* 2. Four Tax & Document Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            {/* Metric 1 */}
                            <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-md">
                                <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-xs font-medium">Dokumen e-Faktur Sah</span>
                                    <Receipt className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-white">
                                        {taxSummary.total_efaktur_count} Dokumen
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">
                                        {taxSummary.total_efaktur_sub}
                                    </div>
                                </div>
                            </div>

                            {/* Metric 2 */}
                            <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-md">
                                <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-xs font-medium">Total PPN 11% Terkumpul</span>
                                    <TrendingUp className="h-4 w-4 text-[#8cd4b4]" />
                                </div>
                                <div>
                                    <div className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                                        {formatRupiah(taxSummary.total_ppn_amount)}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                        <span>{taxSummary.total_ppn_sub}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Metric 3 */}
                            <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-md">
                                <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-xs font-medium">BAST Ditandatangani</span>
                                    <FileCheck2 className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-white">
                                        {taxSummary.total_bast_count} Dokumen
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">
                                        {taxSummary.total_bast_sub}
                                    </div>
                                </div>
                            </div>

                            {/* Metric 4 */}
                            <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-md">
                                <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-xs font-medium">Status Pajak Klien</span>
                                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-lg sm:text-xl font-extrabold text-white">
                                        {taxSummary.tax_status_badge}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">
                                        {taxSummary.tax_status_sub}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* 3. Filter Tabs (Horizontal Pills) */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                            {documentTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedTab === tab.id
                                            ? 'btn-primary-bespoke'
                                            : 'bg-[#171B26] text-slate-300 hover:text-white border border-slate-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* 4. Search & Period Filter Dropdown Box */}
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-3 sm:p-4 space-y-3 shadow-md">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                
                                {/* Search Bar (8 Cols) */}
                                <div className="sm:col-span-8 relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nomor Faktur Pajak (010.xxx), No. Invoice, atau nama barang..."
                                        style={{ color: '#0f172a' }}
                                        className="w-full h-10 rounded-xl bg-[#0C0D12] border border-slate-800 pl-10 pr-4 text-xs !text-slate-200 font-medium placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Masa Pajak Dropdown (4 Cols) */}
                                <div className="sm:col-span-4 relative">
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-[#0C0D12] border border-slate-800 px-3 text-xs text-slate-300 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">Semua Masa Pajak 2026</option>
                                        <option value="Oktober 2026">Masa Pajak Oktober 2026</option>
                                        <option value="September 2026">Masa Pajak September 2026</option>
                                        <option value="Agustus 2026">Masa Pajak Agustus 2026</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                                </div>

                            </div>
                        </div>

                        {/* 5. TAX DOCUMENTS & INVOICES TABLE LIST */}
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-[#0C0D12]/80 text-[11px] font-bold text-slate-400">
                                            <th className="py-3.5 px-4">Nomor Dokumen &amp; Jenis</th>
                                            <th className="py-3.5 px-3">Tanggal / Masa</th>
                                            <th className="py-3.5 px-4">Deskripsi Transaksi</th>
                                            <th className="py-3.5 px-4">Rincian Finansial (DPP &amp; PPN)</th>
                                            <th className="py-3.5 px-3">Status DJP</th>
                                            <th className="py-3.5 px-4 text-right sm:text-left">Unduh Berkas PDF</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/80">
                                        {filteredDocuments.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-slate-400">
                                                    Tidak ditemukan berkas pajak atau dokumen yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDocuments.map((doc) => (
                                                <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                                                    
                                                    {/* Nomor Dokumen */}
                                                    <td className="py-4 px-4 font-mono">
                                                        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                                                            {doc.qr_available && <QrCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                                                            <span>{doc.doc_number}</span>
                                                        </div>
                                                        <div className="text-[10px] text-blue-400 font-sans mt-0.5 font-semibold">
                                                            {doc.doc_type_label} • Ref: {doc.invoice_ref}
                                                        </div>
                                                    </td>

                                                    {/* Tanggal / Masa Pajak */}
                                                    <td className="py-4 px-3 text-slate-300 whitespace-nowrap">
                                                        <div>{doc.date}</div>
                                                        <div className="text-[10px] text-slate-500">{doc.tax_period}</div>
                                                    </td>

                                                    {/* Deskripsi Transaksi */}
                                                    <td className="py-4 px-4 text-white font-medium max-w-xs">
                                                        <div className="line-clamp-2" title={doc.description}>
                                                            {doc.description}
                                                        </div>
                                                    </td>

                                                    {/* Finansial (DPP, PPN, Total) */}
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="font-bold text-white text-xs">
                                                            Total: {formatRupiah(doc.total_amount)}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            DPP: {formatRupiah(doc.dpp_amount)} | <span className="text-[#8cd4b4] font-medium">PPN: {formatRupiah(doc.ppn_amount)}</span>
                                                        </div>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-4 px-3 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium badge-sage">
                                                            <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                            <span>{doc.status_label}</span>
                                                        </span>
                                                    </td>

                                                    {/* Action Buttons */}
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {doc.files.map((file, fIdx) => (
                                                                <a
                                                                    key={fIdx}
                                                                    href="/images/hero-datacenter-clean.jpg"
                                                                    download={`${doc.doc_number.replace(/\s+/g, '-')}-${file.label.replace(/\s+/g, '-')}.pdf`}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition shadow-sm ${
                                                                        file.variant === 'amber'
                                                                            ? 'btn-ochre-bespoke'
                                                                            : 'btn-primary-bespoke'
                                                                    }`}
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                    <span>{file.label}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </td>

                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 6. Legalitas Kepatuhan Pajak CV. Putra Nugraha */}
                        <div className="p-5 rounded-2xl border border-slate-800 bg-[#171B26] space-y-3 shadow-md">
                            <div className="flex items-center gap-2.5 text-[#9bb8f5] font-semibold text-xs uppercase tracking-wider">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Informasi Perpajakan &amp; Legalitas PKP CV. Putra Nugraha</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                                <div className="p-3 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
                                    <div className="text-[11px] text-slate-400">NPWP Resmi Perusahaan:</div>
                                    <div className="font-mono font-bold text-white">08.765.432.1-429.000</div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
                                    <div className="text-[11px] text-slate-400">Surat Pengukuhan PKP:</div>
                                    <div className="font-mono font-bold text-white">S-124PKP/WPJ.09/KP.0303/2020</div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
                                    <div className="text-[11px] text-slate-400">Aplikasi e-Faktur:</div>
                                    <div className="font-semibold text-[#8cd4b4]">DJP Online e-Faktur Host-to-Host</div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed pt-1">
                                Seluruh faktur pajak diterbitkan dengan barcode QR resmi Direktorat Jenderal Pajak (DJP) yang dapat dipindai secara langsung. Dokumen sah sebagai Pajak Masukan resmi untuk pelaporan SPT Masa PPN instansi Anda.
                            </p>
                        </div>

                    </div>

                </div>

            </main>

            {/* ========================================================= */}
            {/* FOOTER B2B CORPORATE 4 KOLOM                              */}
            {/* ========================================================= */}
            <footer className="mt-16 border-t border-slate-800/80 bg-[#12161F] text-slate-400 text-xs">
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
                                    <span className="text-xs font-bold tracking-tight text-white uppercase">
                                        CV. PUTRA NUGRAHA -
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        Perdagangan Barang dan Jasa
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Pengadaan perangkat IT dan layanan profesional untuk mendukung kebutuhan perusahaan Anda.
                            </p>
                        </div>

                        {/* Col 2: Panduan Pengadaan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Panduan Pengadaan B2B
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link href="/panduan/cara-belanja" className="text-slate-400 hover:text-white transition">
                                        Cara Belanja &amp; Pengajuan RFQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/faktur-pajak" className="text-slate-400 hover:text-white transition">
                                        Ketentuan Faktur Pajak
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/pembayaran" className="text-slate-400 hover:text-white transition">
                                        Pembayaran &amp; Pengiriman
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/garansi" className="text-slate-400 hover:text-white transition">
                                        Garansi &amp; Layanan Purnajual
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Layanan Pelanggan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Layanan Pelanggan
                            </h4>
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Phone className="h-4 w-4 text-emerald-400" />
                                <a 
                                    href="https://wa.me/6281320777874" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-emerald-400 transition"
                                >
                                    (+62) 813-2077-7874
                                </a>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Hubungi tim kami untuk konsultasi produk, penawaran, dan status pengadaan.
                            </p>
                            <div>
                                <a
                                    href="https://wa.me/6281320777874"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <span>Konsultasikan kebutuhan Anda</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Col 4: Alamat Kantor */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Alamat Kantor
                            </h4>
                            <div className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Melayani kebutuhan barang dan jasa IT perusahaan.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
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
