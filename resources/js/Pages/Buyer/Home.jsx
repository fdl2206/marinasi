import { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
    User, 
    Server, 
    Network, 
    Wrench, 
    HardDrive, 
    Briefcase, 
    LogOut, 
    LayoutDashboard, 
    SlidersHorizontal, 
    ChevronDown, 
    Check, 
    FileText, 
    ClipboardList, 
    ShieldCheck, 
    Headphones, 
    Phone, 
    MapPin, 
    ArrowRight 
} from 'lucide-react';
import ProductCard from '@/Components/Buyer/ProductCard';

/**
 * Default catalog products yang merepresentasikan struktur data Eloquent Product Model:
 * Backend dapat langsung mengirim prop `products` dari Controller / API Resource.
 */
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'Server HPE ProLiant ML30 Gen10',
        slug: 'server-hpe-proliant-ml30-gen10',
        price: 32500000,
        unit: null,
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-server-hpe.png',
        category_id: 'hardware',
    },
    {
        id: 2,
        name: 'Paket Jasa Instalasi Jaringan LAN Kantor',
        slug: 'paket-jasa-instalasi-jaringan-lan-kantor-1',
        price: 8500000,
        unit: 'paket',
        stock_status: 'official_service',
        badge_label: 'Jasa Resmi',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-lan-services.png',
        category_id: 'services',
    },
    {
        id: 3,
        name: 'Paket Jasa Instalasi Jaringan LAN Kantor',
        slug: 'paket-jasa-instalasi-jaringan-lan-kantor-2',
        price: 8500000,
        unit: 'paket',
        stock_status: 'official_service',
        badge_label: 'Jasa Resmi',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-lan-services.png',
        category_id: 'services',
    },
    {
        id: 4,
        name: 'Paket Jasa Instalasi Jaringan LAN Kantor',
        slug: 'paket-jasa-instalasi-jaringan-lan-kantor-3',
        price: 8500000,
        unit: 'paket',
        stock_status: 'official_service',
        badge_label: 'Jasa Resmi',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-lan-services.png',
        category_id: 'services',
    },
    {
        id: 5,
        name: 'Paket Jasa Instalasi Jaringan LAN Kantor',
        slug: 'paket-jasa-instalasi-jaringan-lan-kantor-4',
        price: 8500000,
        unit: 'paket',
        stock_status: 'official_service',
        badge_label: 'Jasa Resmi',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-lan-services.png',
        category_id: 'services',
    },
];

const SORT_OPTIONS = [
    { key: 'popular', label: 'Terpopuler' },
    { key: 'price_asc', label: 'Harga: Terendah' },
    { key: 'price_desc', label: 'Harga: Tertinggi' },
    { key: 'ready_stock', label: 'Ready Stock Saja' },
];

const TRUST_FEATURES = [
    {
        icon: FileText,
        title: 'Faktur pajak resmi',
        desc: 'Dokumen lengkap untuk administrasi pengadaan perusahaan.',
    },
    {
        icon: ClipboardList,
        title: 'Pengajuan RFQ mudah',
        desc: 'Sesuaikan penawaran dengan spesifikasi dan kebutuhan bisnis.',
    },
    {
        icon: ShieldCheck,
        title: 'Garansi B2B',
        desc: 'Dukungan garansi produk sesuai syarat dan ketentuan.',
    },
    {
        icon: Headphones,
        title: 'Kontak Kami di WhatsApp',
        desc: 'Konsultasi pemilihan perangkat hingga layanan instalasi.',
    },
];

export default function BuyerHome({ 
    products: serverProducts, 
    filters: serverFilters = {}, 
    cartCount: serverCartCount = 0 
}) {
    const { props } = usePage();
    const auth = props?.auth;

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState(serverFilters.search || '');
    const [selectedSort, setSelectedSort] = useState(serverFilters.sort || 'popular');
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(serverCartCount);

    const categories = [
        { id: 'hardware', name: 'Hardware', icon: Server },
        { id: 'networking', name: 'Networking & Router', icon: Network },
        { id: 'services', name: 'Jasa Instalasi & Servis', icon: Wrench },
        { id: 'accessories', name: 'Aksesoris IT', icon: HardDrive },
        { id: 'procurement', name: 'Paket Pengadaan Kantor', icon: Briefcase },
    ];

    // Data produk: gunakan data dari backend jika ada, fallback ke DEFAULT_PRODUCTS
    const rawProducts = serverProducts && serverProducts.length > 0 
        ? serverProducts 
        : DEFAULT_PRODUCTS;

    // Client-side sorting fallback
    const displayedProducts = useMemo(() => {
        let list = [...rawProducts];
        if (selectedSort === 'price_asc') {
            list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (selectedSort === 'price_desc') {
            list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        } else if (selectedSort === 'ready_stock') {
            list = list.filter(p => p.stock_status === 'ready_stock');
        }
        return list;
    }, [rawProducts, selectedSort]);

    // Handle search submit (Backend-ready)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/portal', { 
            search: searchQuery, 
            sort: selectedSort 
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    // Handle sort selection (Backend-ready)
    const handleSelectSort = (sortKey) => {
        setSelectedSort(sortKey);
        setFilterMenuOpen(false);
        router.get('/portal', { 
            search: searchQuery, 
            sort: sortKey 
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    return (
        <div className="min-h-screen bg-[#070e1e] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
            <Head title="Portal Pengadaan B2B — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR & CATEGORY SUB-NAV */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#07132b]">
                
                {/* Main Top Bar */}
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-20">
                    
                    {/* Brand Identity / Logo */}
                    <Link href="/portal" className="flex items-center gap-3 shrink-0">
                        <img
                            src="/images/logo-pn.png"
                            alt="Logo CV. Putra Nugraha"
                            className="h-10 w-10 rounded-lg object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-white uppercase">
                                CV. PUTRA NUGRAHA -
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">
                                Perdagangan Barang dan Jasa
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari produk hardware, perangkat jaringan, atau layanan servis..."
                                style={{ color: '#0f172a' }}
                                className="w-full h-10 rounded-lg bg-white border border-transparent pl-4 pr-11 text-xs !text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-500 hover:text-blue-600 transition"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Right Actions: Keranjang & Akun */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link
                            href="/buyer/orders"
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
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span>Akun</span>
                            </button>

                            {/* Dropdown Menu */}
                            {accountMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-[#0d1a38] p-2 shadow-2xl space-y-1 text-xs z-50">
                                    <div className="px-3 py-2 border-b border-slate-800">
                                        <div className="font-bold text-white truncate">{auth?.user?.name || 'Klien B2B'}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{auth?.user?.email || 'klien@instansi.co.id'}</div>
                                    </div>
                                    <Link
                                        href="/buyer/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Dashboard Pengadaan</span>
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

                {/* Category Sub-nav Bar */}
                <div className="border-t border-slate-800/80 bg-[#050c1e]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-between py-3 overflow-x-auto text-xs font-medium text-slate-300 gap-8">
                            {categories.map((cat) => {
                                const IconComponent = cat.icon;
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/portal?kategori=${cat.id}`}
                                        className="shrink-0 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                                    >
                                        <IconComponent className="h-4 w-4 text-slate-400" />
                                        <span>{cat.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

            </header>

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                
                {/* Mobile Search Bar */}
                <form onSubmit={handleSearchSubmit} className="md:hidden">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk hardware atau layanan..."
                            style={{ color: '#0f172a' }}
                            className="w-full rounded-lg bg-white border border-transparent pl-4 pr-10 py-2.5 text-xs !text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>

                {/* ===================================================== */}
                {/* SECTION 1: HERO BANNER PENGADAAN B2B                  */}
                {/* ===================================================== */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001f4e] via-[#00388d] to-[#004ebf] border border-blue-500/20 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 lg:p-12 gap-8">
                        
                        {/* Left Side: Headline & CTAs */}
                        <div className="flex-1 max-w-xl z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="h-[2px] w-6 bg-amber-400 inline-block rounded-full"></span>
                                <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase">
                                    SOLUSI IT UNTUK BISNIS ANDA
                                </span>
                            </div>

                            <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight uppercase tracking-tight">
                                PORTAL PENGADAAN BARANG &amp; JASA IT RESMI CV. PUTRA NUGRAHA
                            </h1>

                            <p className="mt-3.5 text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-lg">
                                Belanja Mudah, Faktur Pajak Resmi &amp; Garansi B2B untuk Kebutuhan Perusahaan Anda
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/buyer/rfq/create"
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98]"
                                >
                                    Buat Pengajuan RFQ
                                </Link>
                                <a
                                    href="#katalog"
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-white/70 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold transition-all active:scale-[0.98]"
                                >
                                    Lihat Katalog
                                </a>
                            </div>
                        </div>

                        {/* Right Side: Server Rack Illustration (1:1 with Figma) */}
                        <div className="shrink-0 flex items-center justify-center md:justify-end">
                            <div className="relative">
                                <img
                                    src="/images/hero-banner-server.png"
                                    alt="Server & Jaringan CV. Putra Nugraha"
                                    className="w-56 sm:w-64 lg:w-72 h-auto object-contain drop-shadow-2xl rounded-xl"
                                />
                            </div>
                        </div>

                    </div>
                </section>

                {/* ===================================================== */}
                {/* SECTION 2: KATALOG B2B TERPOPULER & PENGADAAN CEPAT   */}
                {/* ===================================================== */}
                <section id="katalog" className="space-y-6 scroll-mt-24">
                    
                    {/* Header Bar Section: Title & Sort/Filter Button */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                                Katalog B2B Terpopuler &amp; Pengadaan Tercepat
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-400">
                                Produk dan layanan IT pilihan untuk kebutuhan operasional perusahaan.
                            </p>
                        </div>

                        {/* Sort / Filter Dropdown Button */}
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-700 bg-[#0d1830] hover:border-blue-500/60 text-slate-200 text-xs font-semibold shadow-sm transition-colors"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                                <span>Sort / Filter</span>
                                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${filterMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Options */}
                            {filterMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-[#0d1a38] p-1.5 shadow-2xl space-y-1 text-xs z-40">
                                    <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Urutkan Produk
                                    </div>
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleSelectSort(opt.key)}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-blue-600/20 hover:text-white transition text-left"
                                        >
                                            <span>{opt.label}</span>
                                            {selectedSort === opt.key && (
                                                <Check className="h-3.5 w-3.5 text-blue-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Cards Grid: 5 Kolom Sesuai Mockup Desain */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {displayedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={(item) => setCartCount((prev) => prev + 1)}
                            />
                        ))}
                    </div>

                </section>

            </main>

            {/* ========================================================= */}
            {/* SECTION 3: 4 PILAR KEUNGGULAN B2B                        */}
            {/* ========================================================= */}
            <section className="border-t border-slate-800/80 bg-[#07132b] mt-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {TRUST_FEATURES.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <div key={item.title} className="flex items-start gap-3.5">
                                    <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 shrink-0">
                                        <IconComponent className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white tracking-tight">
                                            {item.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 4: FOOTER PORTAL B2B                             */}
            {/* ========================================================= */}
            <footer className="border-t border-slate-800/80 bg-[#050c1e]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Col 1: Brand & Desc */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo-pn.png"
                                    alt="Logo CV. Putra Nugraha"
                                    className="h-9 w-9 rounded-lg object-contain"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-tight text-white">
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

                        {/* Col 2: Panduan Pengadaan B2B */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Panduan Pengadaan B2B
                            </h4>
                            <ul className="space-y-2 text-xs">
                                {[
                                    { label: 'Cara Belanja & Pengajuan RFQ', href: '/buyer/rfq/create' },
                                    { label: 'Ketentuan Faktur Pajak', href: '#' },
                                    { label: 'Pembayaran & Pengiriman', href: '#' },
                                    { label: 'Garansi & Layanan Purnajual', href: '#' },
                                ].map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3: Layanan Pelanggan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Layanan Pelanggan
                            </h4>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                                <span className="text-sm font-bold text-white">
                                    (+62) 813-2077-7874
                                </span>
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

                {/* Bottom Bar / Copyright */}
                <div className="border-t border-slate-800/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                        <p>© 2026 CV. Putra Nugraha. All Right Reserved.</p>
                        <p className="hidden sm:block">Perdagangan Barang dan Jasa</p>
                    </div>
                </div>
            </footer>

        </div>
    );
}
