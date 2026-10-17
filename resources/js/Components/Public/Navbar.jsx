import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, Box, User, LayoutGrid } from 'lucide-react';

export default function Navbar() {
    const { url = '', props } = usePage();
    const auth = props?.auth;
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Beranda', href: '/' },
        { name: 'Tentang Kami', href: '/tentang-kami' },
        { name: 'Katalog Produk', href: '/katalog' },
        { name: 'Portofolio', href: '/portofolio' },
        { name: 'Testimoni', href: '/testimoni' },
        { name: 'Kontak', href: '/kontak' },
    ];

    const isActive = (path) => {
        if (!url) return false;
        if (path === '/') return url === '/';
        return url.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-navy-800 bg-navy-950/95 backdrop-blur font-mono text-xs">
            {/* Top Wireframe System Bar */}
            <div className="bg-navy-900/80 border-b border-navy-850 px-4 py-1 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    <span>[SYS_WIREFRAME_V1.0] CV. Putra Nugraha — B2B E-Catalog & Company Profile</span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-slate-400">
                    <span>STATE: STRUCTURAL_BLUEPRINT</span>
                    <span>•</span>
                    <span className="text-blue-400">WAITING FOR FINAL MOCKUP</span>
                </div>
            </div>

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 font-sans">
                {/* Brand / Logo Placeholder */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-9 w-9 rounded border border-dashed border-blue-400/80 bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Box className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white tracking-wide">[LOGO: CV. Putra Nugraha]</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Company Profile & B2B E-Catalog</div>
                    </div>
                </Link>

                {/* Desktop Nav Items */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                                    active
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                                        : 'text-slate-300 hover:text-white hover:bg-navy-900 border border-transparent'
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Action Buttons */}
                <div className="hidden lg:flex items-center gap-2.5">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-navy-700 bg-navy-900 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-500"
                        >
                            <User className="h-3.5 w-3.5 text-blue-400" />
                            <span>Dashboard ({auth.user.name})</span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-navy-900 border border-navy-800"
                            >
                                [Masuk]
                            </Link>
                            <Link
                                href="/register"
                                className="px-3.5 py-1.5 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 border border-blue-500 shadow-sm"
                            >
                                [Daftar Kemitraan B2B]
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger Toggle */}
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded border border-navy-800 text-slate-300 hover:text-white hover:bg-navy-900"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="lg:hidden border-t border-navy-800 bg-navy-950 px-4 py-3 space-y-2">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded text-xs ${
                                    isActive(item.href)
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                        : 'text-slate-300 hover:bg-navy-900'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-2 border-t border-navy-800 flex gap-2">
                        <Link
                            href="/login"
                            className="flex-1 text-center py-2 rounded border border-navy-800 text-xs text-slate-300"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="flex-1 text-center py-2 rounded bg-blue-600 text-white text-xs font-semibold"
                        >
                            Daftar B2B
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
