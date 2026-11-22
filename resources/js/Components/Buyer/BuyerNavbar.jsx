import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
    User, 
    LogOut, 
    LayoutDashboard, 
    Building2,
    HelpCircle
} from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function BuyerNavbar({ 
    searchQuery: initialSearch = '', 
    cartCount: customCartCount = null 
}) {
    const { props } = usePage();
    const auth = props?.auth;
    const cartCount = customCartCount !== null ? customCartCount : (props?.cartCount || 0);

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/portal', { search: searchQuery || undefined });
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-[#0a2540] dark:bg-[#071d33] border-b border-[#12365c] shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
                
                {/* Brand Identity / Logo */}
                <Link href="/portal" className="flex items-center shrink-0">
                    <ApplicationLogo variant="lockup-dark" />
                </Link>

                {/* Search Bar (Desktop) */}
                <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
                    <div className="flex items-center w-full bg-white rounded-lg overflow-hidden shadow-xs border border-transparent focus-within:ring-2 focus-within:ring-[#f59e0b]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk hardware, perangkat jaringan, atau layanan servis..."
                            className="flex-1 h-10 px-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border-0 focus:outline-none focus:ring-0 bg-transparent"
                        />
                        <button
                            type="submit"
                            aria-label="Cari"
                            className="h-10 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 flex items-center justify-center transition-colors shrink-0 font-bold"
                        >
                            <Search className="h-4 w-4 stroke-[2.5]" />
                        </button>
                    </div>
                </form>

                {/* Right Actions: Theme Toggle, Keranjang, + Ajukan RFQ, Akun */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
                    <ThemeToggle />

                    {/* Keranjang Button */}
                    <Link
                        href="/buyer/cart"
                        className="flex items-center gap-1.5 text-white hover:text-amber-300 transition-colors py-2 px-1"
                    >
                        <div className="relative">
                            <ShoppingCart className="h-4 w-4 text-white" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 flex items-center justify-center h-3.5 min-w-[14px] px-1 rounded-full bg-[#f59e0b] text-[9px] font-bold text-slate-950">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-semibold hidden sm:inline">Keranjang</span>
                    </Link>

                    {/* + Ajukan RFQ Button */}
                    <Link
                        href="/buyer/rfq/create"
                        className="flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <span>+ Ajukan RFQ</span>
                    </Link>

                    {/* Akun Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg bg-[#0f345e] hover:bg-[#144275] border border-white/20 text-white text-xs font-semibold transition-all shadow-xs shrink-0"
                        >
                            <User className="h-3.5 w-3.5 text-white" />
                            <span className="hidden sm:inline">Akun</span>
                        </button>

                        {/* Dropdown Menu */}
                        {accountMenuOpen && (
                            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-2 shadow-2xl space-y-1 text-xs z-50">
                                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <div className="font-bold text-slate-900 dark:text-white truncate">{auth?.user?.name || 'Klien B2B'}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{auth?.user?.email || 'klien@instansi.co.id'}</div>
                                </div>
                                <Link
                                    href="/buyer/dashboard"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                >
                                    <LayoutDashboard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Dashboard Pengadaan</span>
                                </Link>
                                <Link
                                    href="/buyer/profile"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                >
                                    <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                    <span>Profil Perusahaan</span>
                                </Link>
                                <Link
                                    href="/buyer/help"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                >
                                    <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Pusat Bantuan (FAQ)</span>
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
    );
}
