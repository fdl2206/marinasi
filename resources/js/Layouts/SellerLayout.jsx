import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    Package,
    Receipt,
    Layers,
    Wrench,
    Building2,
    Settings,
    ShieldCheck,
    Search,
    Plus,
    Bell,
    ChevronDown,
    Menu,
    X,
    LogOut,
    ExternalLink,
    Store,
    Phone,
    MapPin,
    CheckCircle2
} from 'lucide-react';

export default function SellerLayout({ 
    children, 
    title = 'Dashboard Admin Internal',
    searchQuery = '',
    onSearchChange = null,
    searchPlaceholder = 'Cari No. Invoice, No. PO, Nama PT Klien, NPWP, atau SKU Barang...',
    actionButtonText = null,
    onActionClick = null,
    adminRole = 'Admin Internal',
    adminSubRole = 'Finance & Operasional'
}) {
    const { url = '', props } = usePage();
    const auth = props?.auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const navigation = [
        { 
            id: 'dashboard', 
            name: 'Ringkasan Operasional', 
            href: '/seller/dashboard', 
            icon: LayoutDashboard,
            badge: null
        },
        { 
            id: 'rfq', 
            name: 'Antrean RFQ & SPH (3)', 
            href: '/seller/negotiations', 
            icon: FileText,
            badge: '3'
        },
        { 
            id: 'orders', 
            name: 'Kelola Pesanan & PO', 
            href: '/seller/orders', 
            icon: Package,
            badge: null
        },
        { 
            id: 'invoices', 
            name: 'Upload e-Faktur & BAST (2)', 
            href: '/seller/legality', 
            icon: Receipt,
            badge: '2'
        },
        { 
            id: 'catalog', 
            name: 'Katalog Produk & Stok', 
            href: '/seller/catalog', 
            icon: Layers,
            badge: null
        },
        { 
            id: 'services', 
            name: 'Jadwal Teknisi & Servis', 
            href: '/seller/services', 
            icon: Wrench,
            badge: null
        },
        { 
            id: 'clients', 
            name: 'Verifikasi Klien Mitra B2B', 
            href: '/seller/clients', 
            icon: Building2,
            badge: null
        },
        { 
            id: 'settings', 
            name: 'Pengaturan Portal Vendor', 
            href: '/seller/settings', 
            icon: Settings,
            badge: null
        },
    ];

    const isActive = (itemHref) => {
        if (!url) return false;
        if (itemHref === '/seller/dashboard') {
            return url === '/seller/dashboard' || url === '/seller' || url === '/admin' || url === '/admin/dashboard';
        }
        return url.startsWith(itemHref);
    };

    return (
        <div className="min-h-screen bg-[#0C0D12] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
            <Head title={`${title} — CV. Putra Nugraha Internal`} />

            {/* ========================================================= */}
            {/* TOP NAVBAR                                                */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#12161F] shadow-lg">
                <div className="flex h-16 sm:h-20 items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8">
                    
                    {/* Brand Identity / Monogram */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Mobile Menu Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition"
                            aria-label="Buka Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link href="/seller/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
                            <img
                                src="/images/logo-pn.png"
                                alt="Logo CV. Putra Nugraha"
                                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain shrink-0 shadow-md shadow-blue-900/30"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                                    CV. PUTRA NUGRAHA
                                </span>
                                <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                                    ADMIN BACK-OFFICE
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Wide Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-6">
                        <div className="relative w-full">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange ? onSearchChange(e.target.value) : null}
                                placeholder={searchPlaceholder}
                                className="w-full h-10 rounded-lg bg-[#171B26] border border-slate-700/60 pl-10 pr-4 text-xs text-slate-100 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3651dc] focus:border-[#3651dc] transition shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Right Actions: Header Action, Bell Notification, Profile */}
                    <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                        {/* Header Action Button */}
                        <button
                            type="button"
                            onClick={() => onActionClick ? onActionClick() : null}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {actionButtonText ? actionButtonText.replace(/^\+\s*/, '') : 'Tambah Produk / Jasa'}
                            </span>
                            <span className="sm:hidden">
                                {actionButtonText ? actionButtonText.replace(/^\+\s*/, '') : 'Tambah'}
                            </span>
                        </button>

                        {/* Bell Notification */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                                aria-label="Notifikasi"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#C56363] text-white text-[9px] font-semibold flex items-center justify-center ring-2 ring-[#12161F]">
                                    5
                                </span>
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-[#171B26] p-3 shadow-2xl space-y-2 z-50 text-xs animate-modal">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                                        <span className="font-bold text-white">Notifikasi Masuk</span>
                                        <span className="text-[10px] text-[#dec093] font-semibold">5 Baru</span>
                                    </div>
                                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                        <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 space-y-1 hover:bg-slate-800/80 transition cursor-pointer">
                                            <div className="text-[10px] text-[#dec093] font-semibold uppercase tracking-wider">Permintaan RFQ Baru</div>
                                            <div className="text-white font-medium">PT Maju Jaya Teknologi meminta penawaran 4x Server HPE ML30.</div>
                                            <div className="text-[10px] text-slate-400">10 menit yang lalu</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 space-y-1 hover:bg-slate-800/80 transition cursor-pointer">
                                            <div className="text-[10px] text-[#8cd4b4] font-semibold uppercase tracking-wider">Pembayaran VA Berhasil</div>
                                            <div className="text-white font-medium">Invoice #INV-PN-2026-0892 lunas via Virtual Account Mandiri.</div>
                                            <div className="text-[10px] text-slate-400">45 menit yang lalu</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 space-y-1 hover:bg-slate-800/80 transition cursor-pointer">
                                            <div className="text-[10px] text-[#e09494] font-semibold uppercase tracking-wider">Peringatan Stok Kritis</div>
                                            <div className="text-white font-medium">Kabel UTP Cat6 Belden tersisa 2 Roll di gudang utama.</div>
                                            <div className="text-[10px] text-slate-400">2 jam yang lalu</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin Profile Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition"
                            >
                                <div className="h-7 w-7 rounded-full bg-[#1E2434] border border-[#3651dc]/40 text-[#9bb8f5] font-semibold text-xs flex items-center justify-center shrink-0">
                                    AI
                                </div>
                                <div className="hidden lg:flex flex-col text-left">
                                    <span className="text-xs font-semibold text-white leading-tight">
                                        {adminRole}
                                    </span>
                                    <span className="text-[10px] text-slate-400 leading-tight">
                                        ({adminSubRole})
                                    </span>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </button>

                            {/* User Profile Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-[#171B26] p-2 shadow-2xl space-y-1 text-xs z-50 animate-modal">
                                    <div className="px-3 py-2 border-b border-slate-800">
                                        <div className="font-bold text-white truncate">Admin Internal CV. Putra Nugraha</div>
                                        <div className="text-[10px] text-slate-400 truncate">admin@putranugraha.co.id</div>
                                    </div>
                                    <Link
                                        href="/seller/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Dashboard Operasional</span>
                                    </Link>
                                    <Link
                                        href="/portal"
                                        target="_blank"
                                        className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Store className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>Lihat Portal Buyer B2B</span>
                                        </div>
                                        <ExternalLink className="h-3 w-3 text-slate-500" />
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-left"
                                        onClick={() => setUserMenuOpen(false)}
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
            {/* BODY CONTAINER (SIDEBAR + MAIN CONTENT)                   */}
            {/* ========================================================= */}
            <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
                
                {/* Mobile Drawer Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ===================================================== */}
                {/* LEFT SIDEBAR: MENU OPERASIONAL (Fixed desktop / drawer mobile) */}
                {/* ===================================================== */}
                <aside
                    className={`fixed lg:sticky top-0 lg:top-20 z-50 lg:z-30 h-screen lg:h-[calc(100vh-5rem)] w-64 lg:w-72 bg-[#0C0D12] border-r border-slate-800/80 p-4 flex flex-col justify-between overflow-y-auto scrollbar-none transition-transform duration-200 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                >
                    <div className="space-y-4">
                        {/* Mobile Drawer Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 lg:hidden">
                            <span className="text-xs font-bold uppercase text-white">Menu Internal</span>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Title: MENU OPERASIONAL */}
                        <div className="px-3 pt-1">
                            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                MENU OPERASIONAL
                            </h2>
                        </div>

                        {/* Nav Items List */}
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const IconComponent = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                                            active
                                                ? 'bg-[#3651dc] text-white shadow-sm border border-white/10'
                                                : 'text-slate-300 hover:text-white hover:bg-[#171B26]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <IconComponent className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Secondary Link: Inventory & Catalog */}
                        <div className="pt-2 px-1">
                            <Link
                                href="/seller/catalog"
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
                            >
                                <ShieldCheck className="h-4 w-4 text-slate-400" />
                                <span>Inventory &amp; Catalog</span>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Company Identity Card */}
                    <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
                        <div className="rounded-xl border border-slate-800 bg-[#171B26] p-3.5 space-y-2 shadow-lg">
                            <div className="flex items-start gap-2.5">
                                <img
                                    src="/images/logo-pn.png"
                                    alt="Logo CV. Putra Nugraha"
                                    className="h-7 w-7 rounded-lg object-contain shrink-0 mt-0.5"
                                />
                                <div className="space-y-0.5 min-w-0">
                                    <div className="text-xs font-bold text-white truncate">CV. PUTRA NUGRAHA</div>
                                    <div className="text-[10px] text-slate-400 truncate">Perdagangan Barang dan Jasa</div>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 leading-snug">
                                Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                            </div>
                            <div className="text-[10px] font-medium text-[#9bb8f5] flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>(+62) 813-2077-7874</span>
                            </div>
                        </div>

                        {/* Logout Option */}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-[#e09494] transition"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Keluar Sesi Admin</span>
                        </Link>
                    </div>
                </aside>

                {/* ===================================================== */}
                {/* RIGHT MAIN CONTENT AREA                               */}
                {/* ===================================================== */}
                <main className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                        {children}
                    </div>

                    {/* Admin Dashboard Footer */}
                    <footer className="border-t border-slate-800/80 bg-[#12161F]/50 px-4 sm:px-6 lg:px-8 py-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                        <div>
                            &copy; 2026 CV. PUTRA NUGRAHA. All Right Reserved.
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                            <span className="inline-block h-1.5 w-1.5 rounded-full dot-sage"></span>
                            <span>Portal Internal &bull; Akses Terbatas</span>
                        </div>
                    </footer>
                </main>

            </div>
        </div>
    );
}
