import { useState } from 'react';
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
    Plus,
    FileCheck2,
    ShieldCheck,
    Save,
    Edit3,
    FileSpreadsheet,
    Mail,
    Building,
    CreditCard
} from 'lucide-react';

/**
 * Data mock profil perusahaan, legalitas perpajakan & alamat B2B
 * Backend dapat menyuplai prop `client`, `companyProfile`, `addresses` dari Controller.
 */
const DEFAULT_COMPANY_PROFILE = {
    company_name: 'PT Maju Jaya Teknologi',
    business_entity: 'Perseroan Terbatas (PT)',
    npwp_number: '01.234.567.8-429.000',
    npwp_name: 'PT Maju Jaya Teknologi',
    npwp_address: 'Gedung Menara Lt. 5, Jl. Asia Afrika No. 128, Kota Bandung, Jawa Barat 40111',
    tax_status: 'PKP & NPWP Terverifikasi',
    sppkp_file: 'SPPKP-PT-Maju-Jaya-Teknologi.pdf',
    nib_number: '9120003418291 (OSS RBA Terverifikasi)',
    top_terms: 'Term of Payment (TOP 30 Hari)',
    top_status: 'Disetujui untuk Transaksi B2B',
};

const DEFAULT_PICS = [
    {
        id: 'pic-1',
        name: 'Budi Santoso, S.Kom.',
        role: 'Head of IT Procurement & Infrastructure',
        email: 'procurement@majujayatekno.co.id',
        phone: '0812-3456-7890',
        is_primary: true,
        tag: 'PIC Pengadaan Utama',
    },
    {
        id: 'pic-2',
        name: 'Siti Rahmawati, S.E.',
        role: 'Finance & Tax Accounting Officer',
        email: 'tax-finance@majujayatekno.co.id',
        phone: '0813-9876-5432',
        is_primary: false,
        tag: 'PIC Faktur Pajak & Keuangan',
    },
];

const DEFAULT_ADDRESSES = [
    {
        id: 'addr-1',
        label: 'Kantor Pusat (Alamat Penagihan & e-Faktur)',
        is_default: true,
        recipient: 'PT Maju Jaya Teknologi (Attn: Budi Santoso)',
        phone: '0812-3456-7890',
        full_address: 'Gedung Menara Lt. 5, Jl. Asia Afrika No. 128, Kel. Braga, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40111',
        notes: 'Titik penurunan barang lobi utama Gedung Menara, wajib konfirmasi security H-1.',
    },
    {
        id: 'addr-2',
        label: 'Site Proyek Gedung B (Lokasi Instalasi On-Site)',
        is_default: false,
        recipient: 'PT Maju Jaya Teknologi - Site Office (Attn: Hendra)',
        phone: '0818-2233-4455',
        full_address: 'Kawasan Pergudangan Soekarno-Hatta Blok C No. 15, Kec. Batununggal, Kota Bandung, Jawa Barat 40266',
        notes: 'Khusus pengiriman barang rack server dan penarikan kabel gedung baru.',
    },
];

export default function ProfileIndex({
    companyProfile: serverCompanyProfile,
    pics: serverPics,
    addresses: serverAddresses,
    cartCount = 3,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const [company, setCompany] = useState(serverCompanyProfile || DEFAULT_COMPANY_PROFILE);
    const [pics, setPics] = useState(serverPics || DEFAULT_PICS);
    const [addresses, setAddresses] = useState(serverAddresses || DEFAULT_ADDRESSES);
    const [isSaved, setIsSaved] = useState(false);
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

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    };

    return (
        <div className="min-h-screen bg-[#0C0D12] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
            <Head title="Profil Perusahaan & Alamat — CV. Putra Nugraha" />

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
                                placeholder="Cari produk hardware, perangkat jaringan, atau layanan servis..."
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
                                        <div className="font-bold text-white truncate">{company.company_name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">budi.santoso@majujayatekno.co.id</div>
                                    </div>
                                    <Link
                                        href="/buyer/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Dashboard Pengadaan</span>
                                    </Link>
                                    <Link
                                        href="/buyer/profile"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <Building2 className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Profil Perusahaan</span>
                                    </Link>
                                    <Link
                                        href="/portal"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <Package className="h-3.5 w-3.5 text-blue-400" />
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
                                        {company.company_name}
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        PIC: Budi Santoso
                                    </p>
                                </div>
                            </div>

                            {/* Verification Pill */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-500/30 text-blue-400 text-[10px] font-semibold w-full">
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-blue-400" />
                                <span className="truncate">{company.tax_status}</span>
                            </div>
                        </div>

                        {/* 2. Sidebar Navigation Items */}
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-2 space-y-1 shadow-lg">
                            {sidebarMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = item.id === 'company';
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
                    {/* RIGHT CONTENT: COMPANY PROFILE & ADDRESSES (9 Cols)   */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* 1. Header Bar: Title + Save Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    Profil Perusahaan, Legalitas &amp; Alamat
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                    Kelola identitas instansi, nomor NPWP untuk penerbitan e-Faktur resmi, data PIC, dan buku alamat kantor.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md self-start sm:self-auto shrink-0 ${
                                    isSaved 
                                        ? 'bg-emerald-600 text-white shadow-emerald-900/40' 
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
                                }`}
                            >
                                {isSaved ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Perubahan Tersimpan!</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>Simpan Perubahan Data</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* 2. CARD 1: IDENTITAS & LEGALITAS PERUSAHAAN (NPWP / PKP) */}
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-xl">
                            
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                                <div className="space-y-0.5">
                                    <h2 className="text-sm sm:text-base font-bold text-white">
                                        Identitas Badan Usaha &amp; Legalitas Pajak
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Data ini digunakan secara otomatis untuk penerbitan e-Faktur PPN 11% dan Surat Perjanjian Pengadaan.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium badge-sage">
                                    <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                    <span>PKP Terdaftar di DJP</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">
                                        Nama Resmi Perusahaan / Instansi
                                    </label>
                                    <input
                                        type="text"
                                        value={company.company_name}
                                        onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-[#0C0D12] border border-slate-800 px-3.5 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">
                                        Bentuk Badan Usaha
                                    </label>
                                    <input
                                        type="text"
                                        value={company.business_entity}
                                        onChange={(e) => setCompany({ ...company, business_entity: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-[#0C0D12] border border-slate-800 px-3.5 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">
                                        Nomor Pokok Wajib Pajak (NPWP 16 Digit)
                                    </label>
                                    <input
                                        type="text"
                                        value={company.npwp_number}
                                        onChange={(e) => setCompany({ ...company, npwp_number: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-[#0C0D12] border border-slate-800 px-3.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">
                                        Nomor Induk Berusaha (NIB)
                                    </label>
                                    <input
                                        type="text"
                                        value={company.nib_number}
                                        onChange={(e) => setCompany({ ...company, nib_number: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-[#0C0D12] border border-slate-800 px-3.5 text-xs text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">
                                        Alamat Terdaftar pada NPWP / SPPKP
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={company.npwp_address}
                                        onChange={(e) => setCompany({ ...company, npwp_address: e.target.value })}
                                        className="w-full rounded-xl bg-[#0C0D12] border border-slate-800 p-3 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                                    />
                                </div>

                            </div>

                            {/* Dokumen Terunggah */}
                            <div className="p-3.5 rounded-xl bg-[#0C0D12] border border-slate-800 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                                        <FileCheck2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{company.sppkp_file}</div>
                                        <div className="text-[10px] text-[#8cd4b4] font-medium">Terverifikasi Otentik oleh Tim Legal CV. Putra Nugraha</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => alert('Membuka pratinjau berkas SPPKP resmi perusahaan...')}
                                    className="px-3 py-1.5 rounded-lg btn-secondary-bespoke text-[11px] font-medium transition"
                                >
                                    Lihat Berkas
                                </button>
                            </div>

                        </div>

                        {/* 3. CARD 2: PENANGGUNG JAWAB PENGADAAN (PIC) */}
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-xl">
                            
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                                <div className="space-y-0.5">
                                    <h2 className="text-sm sm:text-base font-bold text-white">
                                        Kontak Penanggung Jawab (Person In Charge - PIC)
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Tim kami akan menghubungi PIC ini untuk konfirmasi teknis penawaran dan tanda terima logistik.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pics.map((pic, idx) => (
                                    <div key={pic.id} className="p-4 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded badge-azure">
                                                {pic.tag}
                                            </span>
                                            <span className="text-[11px] text-slate-500">PIC #{idx + 1}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="font-bold text-white text-sm">
                                                {pic.name}
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                {pic.role}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                                <span className="truncate">{pic.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                                <span>{pic.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* 4. CARD 3: BUKU ALAMAT KANTOR & PENGIRIMAN LOGISTIK */}
                        <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-xl">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                                <div className="space-y-0.5">
                                    <h2 className="text-sm sm:text-base font-bold text-white">
                                        Buku Alamat Pengiriman &amp; Lokasi On-Site
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Pilih alamat tujuan pengiriman barang fisik atau lokasi pelaksanaan instalasi server/jaringan.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => alert('Membuka modal tambah alamat pengiriman baru...')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition self-start sm:self-auto"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Tambah Alamat Baru</span>
                                </button>
                            </div>

                            <div className="space-y-3.5">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        className="p-4 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-2 hover:border-slate-700 transition"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                                                <h3 className="font-bold text-white text-xs sm:text-sm">
                                                    {addr.label}
                                                </h3>
                                                {addr.is_default && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded badge-sage">
                                                        Alamat Utama
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => alert(`Mengedit alamat: ${addr.label}`)}
                                                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-xs text-slate-300 font-medium">
                                            Penerima: {addr.recipient} • Telp: {addr.phone}
                                        </div>

                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {addr.full_address}
                                        </p>

                                        {addr.notes && (
                                            <div className="text-[11px] text-slate-500 pt-1">
                                                Catatan: {addr.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* 5. CARD 4: KETENTUAN KONTRAK & TERMS OF PAYMENT (TOP) */}
                        <div className="p-5 rounded-2xl border border-slate-800 bg-[#171B26] space-y-3 shadow-md">
                            <div className="flex items-center gap-2.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
                                <CreditCard className="h-4 w-4" />
                                <span>Ketentuan Transaksi &amp; Termin Pembayaran (TOP)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                                <div className="p-3.5 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
                                    <div className="text-[11px] text-slate-400">Fasilitas Termin Pembayaran:</div>
                                    <div className="font-bold text-white text-xs sm:text-sm">{company.top_terms}</div>
                                    <div className="text-[10px] text-emerald-400 font-medium">{company.top_status}</div>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
                                    <div className="text-[11px] text-slate-400">Rekening Resmi Pembayaran:</div>
                                    <div className="font-bold text-white text-xs sm:text-sm">Bank Mandiri &amp; BCA (a.n CV. Putra Nugraha)</div>
                                    <div className="text-[10px] text-slate-400">Virtual Account otomatis terverifikasi</div>
                                </div>
                            </div>
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
                        
                        {/* Col 1 */}
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

                        {/* Col 2 */}
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

                        {/* Col 3 */}
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

                        {/* Col 4 */}
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

