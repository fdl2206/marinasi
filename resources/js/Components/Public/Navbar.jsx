import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [url]);

    // Close menu on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

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
        <header 
            className="sticky top-0 z-50 w-full bg-[#12161F] border-b border-slate-800/80"
            style={{ backgroundColor: '#12161F' }}
        >
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
                    className="flex items-center gap-3 group"
                >
                    <img
                        src="/images/logo-pn.png"
                        alt="Logo CV. Putra Nugraha"
                        className="h-10 w-10 rounded-lg object-contain shadow-sm transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white uppercase group-hover:text-blue-400 transition-colors">
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

                {/* Right Action / Login Button (Desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-xl border border-slate-700/80 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition-all active:scale-95 shadow-sm"
                    >
                        Masuk
                    </Link>
                </div>

                {/* Mobile Menu Minimalist Animated Hamburger */}
                <div className="flex md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                        aria-expanded={isOpen}
                        className="relative h-11 w-11 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-[#12161F] text-slate-200 hover:text-white active:scale-95 transition-all shadow-sm"
                    >
                        <span 
                            className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ease-out origin-center ${
                                isOpen ? 'rotate-45 translate-y-[3.75px]' : ''
                            }`} 
                        />
                        <span 
                            className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ease-out origin-center ${
                                isOpen ? '-rotate-45 -translate-y-[3.75px]' : ''
                            }`} 
                        />
                    </button>
                </div>
            </div>

            {/* ========================================================= */}
            {/* FULLSCREEN EDITORIAL MOBILE NAVIGATION                    */}
            {/* Minimal, confident, human craftsmanship (No AI-Slop)      */}
            {/* ========================================================= */}
            {isOpen && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigasi Menu"
                    style={{ backgroundColor: '#0C0D12' }}
                    className="fixed inset-x-0 top-20 bottom-0 z-50 flex flex-col justify-between px-7 py-8 md:hidden animate-mobile-overlay border-t border-slate-800/80 overflow-y-auto mobile-nav-overlay bg-navy-950"
                >
                    {/* Top: Large, Bold Editorial Nav Links */}
                    <nav className="flex flex-col space-y-3 pt-2">
                        {navItems.map((item, index) => {
                            const active = isActive(item);
                            const delayStyle = { animationDelay: `${index * 35}ms` };

                            const linkContent = (
                                <>
                                    <span className="tracking-tight">{item.name}</span>
                                    {active && (
                                        <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                    )}
                                </>
                            );

                            return (
                                <div 
                                    key={item.name} 
                                    style={delayStyle}
                                    className="animate-mobile-link"
                                >
                                    {item.isAnchor ? (
                                        <a
                                            href={item.href}
                                            onClick={(e) => handleNavClick(e, item)}
                                            className={`flex items-center justify-between py-2 text-2xl font-medium transition-colors ${
                                                active 
                                                    ? 'text-white font-semibold' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {linkContent}
                                        </a>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center justify-between py-2 text-2xl font-medium transition-colors ${
                                                active 
                                                    ? 'text-white font-semibold' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {linkContent}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Bottom: Minimalist Action & Editorial Footer */}
                    <div 
                        style={{ animationDelay: '200ms' }}
                        className="pt-6 border-t border-slate-800/80 space-y-4 animate-mobile-link"
                    >
                        <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center justify-center py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition active:scale-[0.99] shadow-lg shadow-blue-600/20"
                        >
                            Masuk ke Portal
                        </Link>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 pt-1 tracking-wider">
                            <span>CV. PUTRA NUGRAHA</span>
                            <span>KOTA BANDUNG</span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
