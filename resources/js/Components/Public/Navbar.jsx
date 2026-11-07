import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const { url = '' } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const isHome = url === '/' || url === '';

    const navItems = [
        { name: 'Beranda', href: isHome ? '#' : '/', isAnchor: isHome },
        { name: 'Tentang Kami', href: isHome ? '#tentang-kami' : '/#tentang-kami', isAnchor: isHome },
        { name: 'Layanan & Produk', href: isHome ? '#layanan' : '/#layanan', isAnchor: isHome },
        { name: 'Portofolio', href: '/portofolio', isAnchor: false },
        { name: 'Kontak Kami', href: isHome ? '#kontak' : '/#kontak', isAnchor: isHome },
    ];

    const handleNavClick = (e, item) => {
        if (item.isAnchor && item.href.startsWith('#')) {
            e.preventDefault();
            if (item.href === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const target = document.querySelector(item.href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
            if (isOpen) setIsOpen(false);
        }
    };

    const isActive = (item) => {
        if (item.name === 'Beranda' && isHome) return true;
        if (!item.isAnchor && url.startsWith(item.href)) return true;
        return false;
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-[#07132b]/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12 h-20">
                {/* Brand Identity / Logo */}
                <Link 
                    href="/" 
                    onClick={(e) => {
                        if (isHome) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                    className="flex items-center gap-3"
                >
                    <img
                        src="/images/logo-pn.png"
                        alt="Logo CV. Putra Nugraha"
                        className="h-10 w-10 rounded-lg object-contain shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white uppercase">
                            CV. PUTRA NUGRAHA
                        </span>
                        <span className="text-[11px] font-normal text-slate-400">
                            Perdagangan Barang dan Jasa
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        return item.isAnchor ? (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item)}
                                className={`text-sm font-medium transition-colors duration-150 ${
                                    active
                                        ? 'text-white font-semibold'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                {item.name}
                            </a>
                        ) : (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors duration-150 ${
                                    active
                                        ? 'text-white font-semibold'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Action / Login Button */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
                    >
                        Masuk
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation menu"
                        className="p-2 text-slate-300 hover:text-white"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-800 bg-[#07132b] px-6 py-4 space-y-3">
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const active = isActive(item);
                            return item.isAnchor ? (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item)}
                                    className={`block py-2 text-sm font-medium transition ${
                                        active ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    {item.name}
                                </a>
                            ) : (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`block py-2 text-sm font-medium transition ${
                                        active ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-3 border-t border-slate-800">
                        <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-white"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
