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
    ChevronDown,
    Menu,
    X,
    LogOut,
} from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function SellerLayout({
    children,
    title = 'Dashboard Admin Internal',
    searchQuery = '',
    onSearchChange = null,
    searchPlaceholder = 'Cari pengaturan sistem, akun staf, atau rekening bank...',
    actionButtonText = null,
    onActionClick = null,
    adminRole = 'Admin Internal',
    adminSubRole = 'Finance & Operasional'
}) {
    const { url = '', props } = usePage();
    const auth = props?.auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

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
            name: 'Antrean RFQ & SPH',
            href: '/seller/negotiations',
            icon: FileText,
            badge: '3'
        },
        {
            id: 'orders',
            name: 'Kelola Pesanan & PO',
            href: '/seller/orders',
            icon: Package,
            badge: '5'
        },
        {
            id: 'invoices',
            name: 'Upload e-Faktur & BAST',
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
            name: 'Data Klien Mitra B2B',
            href: '/seller/clients',
            icon: Building2,
            badge: null
        },
        {
            id: 'settings',
            name: 'Profil Admin & Pengaturan',
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
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-[#086f8e] selection:text-white transition-colors duration-150">
            <Head title={`${title} — CV. Putra Nugraha Internal`} />

            {/* ========================================================= */}
            {/* TOP NAVBAR (Matching Buyer Navbar Proportions & Max-W)    */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-40 w-full bg-[#0a2540] dark:bg-[#071d33] border-b border-[#12365c] shadow-sm">
                <div className="flex h-16 sm:h-20 items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

                    {/* Brand Identity / Monogram */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
                        {/* Mobile Menu Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-[#0f345e] border border-white/20 text-white hover:bg-[#144275] transition cursor-pointer"
                            aria-label="Buka Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link href="/seller/dashboard" className="flex items-center shrink-0">
                            <ApplicationLogo variant="lockup-dark" />
                        </Link>
                    </div>

                    {/* Wide Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
                        <div className="flex items-center w-full bg-white rounded-lg overflow-hidden shadow-2xs border border-transparent focus-within:ring-2 focus-within:ring-[#f59e0b]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange ? onSearchChange(e.target.value) : null}
                                placeholder={searchPlaceholder || 'Cari pengaturan sistem, akun staf, atau rekening bank...'}
                                className="flex-1 h-10 px-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border-0 focus:outline-none focus:ring-0 bg-transparent font-medium"
                            />
                            <button
                                type="button"
                                aria-label="Cari"
                                className="h-10 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 flex items-center justify-center transition-colors shrink-0 font-bold cursor-pointer"
                            >
                                <Search className="h-4 w-4 stroke-[2.5]" />
                            </button>
                        </div>
                    </div>

                    {/* Right Actions: ThemeToggle, Profile Badge */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Admin Profile Dropdown [ R ] Restu – Super Admin ▾ */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e2f54] hover:bg-[#143e6d] border border-white/10 text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
                            >
                                <div className="h-6 w-6 rounded bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    R
                                </div>
                                <span className="hidden sm:inline font-bold">
                                    {auth?.user?.name || 'Restu – Super Admin'}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                            </button>

                            {/* User Profile Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-2 shadow-2xl space-y-1 text-xs z-50 animate-modal">
                                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                        <div className="font-bold text-slate-900 dark:text-white truncate">
                                            {auth?.user?.name || 'Restu – Super Admin'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                            {auth?.user?.email || 'admin@putranugraha.co.id'}
                                        </div>
                                    </div>
                                    <Link
                                        href="/seller/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-[#086f8e]" />
                                        <span>Dashboard Operasional</span>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-left cursor-pointer"
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
            {/* MOBILE DRAWER (Only rendered on < lg screens)             */}
            {/* ========================================================= */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative z-50 w-72 bg-white dark:bg-[#12161F] p-4 shadow-2xl overflow-y-auto space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">Workspace Internal</span>
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Admin Identity Card */}
                            <div className="rounded-2xl bg-[#0a2540] text-white p-4 space-y-1.5 border border-[#12365c] shadow-sm">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                    <ShieldCheck className="h-3 w-3 text-amber-400" />
                                    <span>SUPER ADMIN</span>
                                </div>
                                <div className="text-sm font-bold text-white leading-tight">
                                    Admin Operasional
                                </div>
                                <div className="text-[11px] text-slate-300">
                                    Pusat Ujung Berung
                                </div>
                            </div>

                            {/* Nav list */}
                            <nav className="flex flex-col gap-1">
                                {navigation.map((item) => {
                                    const IconComponent = item.icon;
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${active
                                                ? 'bg-[#086f8e] text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <IconComponent className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                    active ? 'bg-white text-[#086f8e]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                }`}>
                                                    ({item.badge})
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Bottom logout */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Keluar Back-Office</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MAIN DASHBOARD CONTAINER: EXACT 12-COL GRID PROPORTIONS   */}
            {/* MATCHING BUYER DASHBOARD PROPORTIONS (max-w-7xl, 3:9 COLS) */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ===================================================== */}
                    {/* LEFT SIDEBAR: DESKTOP ONLY (3 Cols)                   */}
                    {/* Strictly permanent in the grid, never floating!       */}
                    {/* ===================================================== */}
                    <aside className="hidden lg:block lg:col-span-3 space-y-4">

                        {/* Top Admin Identity Card (Deep Navy Sesuai Mockup) */}
                        <div className="rounded-2xl bg-[#0a2540] text-white p-4 space-y-1.5 border border-[#12365c] shadow-sm">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <ShieldCheck className="h-3 w-3 text-amber-400" />
                                <span>SUPER ADMIN</span>
                            </div>
                            <div className="text-sm font-bold text-white leading-tight">
                                Admin Operasional
                            </div>
                            <div className="text-[11px] text-slate-300">
                                Pusat Ujung Berung
                            </div>
                        </div>

                        {/* 1. Workspace Internal Navigation Card */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-2 sm:p-3 space-y-2 shadow-2xs">
                            <div className="px-3 pt-1">
                                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    MENU OPERASIONAL
                                </h2>
                            </div>

                            <nav className="flex flex-col gap-1">
                                {navigation.map((item) => {
                                    const IconComponent = item.icon;
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${active
                                                ? 'bg-[#086f8e] text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <IconComponent className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                    active
                                                        ? 'bg-white text-[#086f8e]'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                }`}>
                                                    ({item.badge})
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Inventory & Catalog sub-menu link */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 space-y-1">
                                <div className="flex items-center gap-2 px-2 py-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold select-none">
                                    <ShieldCheck className="h-3.5 w-3.5 text-[#086f8e]" />
                                    <span>Inventory &amp; Catalog</span>
                                </div>
                            </div>

                            {/* Divider & Logout Back-Office */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 space-y-1">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Keluar Back-Office</span>
                                </Link>
                                <p className="text-[10px] text-slate-400 px-2 leading-relaxed">
                                    Akses terbatas untuk staf internal yang berwenang.
                                </p>
                            </div>
                        </div>

                        {/* Company Brand Footer Card in Sidebar (Matching Mockup) */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 shadow-2xs">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded bg-[#086f8e] text-white flex items-center justify-center font-bold text-[10px]">
                                    PN
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white text-xs">CV. PUTRA NUGRAHA</span>
                            </div>
                            <p className="text-[10px] text-slate-400">Perdagangan Barang dan Jasa</p>
                            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                                Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung<br />
                                (+62) 813-2077-7874
                            </p>
                        </div>

                    </aside>

                    {/* ===================================================== */}
                    {/* RIGHT MAIN CONTENT: 9 COLS                            */}
                    {/* min-w-0 prevents CSS grid blow-out with tables!       */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 min-w-0 space-y-6">
                        {children}
                    </div>

                </div>

            </main>

            {/* ========================================================= */}
            {/* ADMIN BACK-OFFICE FOOTER (Matching Design Bar)            */}
            {/* ========================================================= */}
            <footer className="mt-auto bg-[#0a2540] dark:bg-[#071d33] border-t border-[#12365c] text-white py-4 px-4 sm:px-6 lg:px-8 text-xs">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                    <div className="text-[11px] text-slate-300">
                        Sistem Back-Office CV. PUTRA NUGRAHA &mdash; Jl. Palintang Kav. 2 Ujung Berung Bandung | Layanan Teknis &amp; Pengadaan: 081320777874
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 shrink-0">
                        <span>Portal Vendor B2B &bull; Akses Internal</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}
