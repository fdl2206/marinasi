import { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
    User, 
    LogOut, 
    LayoutDashboard, 
    SlidersHorizontal, 
    ChevronDown, 
    ChevronUp,
    Check, 
    ShieldCheck, 
    Phone, 
    MapPin, 
    ArrowRight,
    LayoutGrid,
    List,
    RotateCcw
} from 'lucide-react';
import ProductCard from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';

const SORT_OPTIONS = [
    { key: 'newest', label: 'Terkait' },
    { key: 'price_asc', label: 'Harga: Terendah' },
    { key: 'price_desc', label: 'Harga: Tertinggi' },
    { key: 'ready_stock', label: 'Ready Stock Saja' },
];

const cleanCategoryName = (name) => (name || '').replace(/^\d+[\.\)]\s*/, '').trim();

export default function BuyerHome({ 
    products = [],
    categories: serverCategories = [],
    pagination = {},
    paginationLinks = {},
    filters: serverFilters = {}, 
    cartCount: serverCartCount = 0 
}) {
    const { props } = usePage();
    const auth = props?.auth;

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState(serverFilters.search || '');
    const [selectedSort, setSelectedSort] = useState(serverFilters.sort || 'newest');
    const [selectedCategory, setSelectedCategory] = useState(serverFilters.kategori || null);
    const [minPrice, setMinPrice] = useState(serverFilters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(serverFilters.max_price || '');
    const [viewMode, setViewMode] = useState('grid');
    const [catOpen, setCatOpen] = useState(true);
    const [stockOpen, setStockOpen] = useState(true);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(serverCartCount);

    const categories = serverCategories;
    const isSearchMode = Boolean(serverFilters.search || serverFilters.kategori || serverFilters.min_price || serverFilters.max_price);

    useEffect(() => {
        setSearchQuery(serverFilters.search || '');
        setSelectedSort(serverFilters.sort || 'newest');
        setSelectedCategory(serverFilters.kategori || null);
        setMinPrice(serverFilters.min_price || '');
        setMaxPrice(serverFilters.max_price || '');
    }, [serverFilters.search, serverFilters.sort, serverFilters.kategori, serverFilters.min_price, serverFilters.max_price]);

    // Handle search submit (Backend-ready)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/portal', { 
            search: searchQuery || undefined, 
            sort: selectedSort !== 'newest' ? selectedSort : undefined,
            kategori: selectedCategory || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    // Handle sort selection
    const handleSelectSort = (sortKey) => {
        setSelectedSort(sortKey);
        setFilterMenuOpen(false);
        router.get('/portal', { 
            search: searchQuery || undefined, 
            sort: sortKey !== 'newest' ? sortKey : undefined,
            kategori: selectedCategory || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    // Handle Category toggle in sidebar
    const handleCategoryToggle = (categoryId) => {
        const nextCategory = selectedCategory == categoryId ? undefined : categoryId;
        setSelectedCategory(nextCategory || null);
        router.get('/portal', {
            search: searchQuery || undefined,
            sort: selectedSort !== 'newest' ? selectedSort : undefined,
            kategori: nextCategory,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    // Handle Ready Stock toggle
    const handleToggleReadyStock = () => {
        const nextSort = selectedSort === 'ready_stock' ? 'newest' : 'ready_stock';
        setSelectedSort(nextSort);
        router.get('/portal', {
            search: searchQuery || undefined,
            sort: nextSort !== 'newest' ? nextSort : undefined,
            kategori: selectedCategory || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    // Handle Apply Price Filter
    const handleApplyPrice = (e) => {
        e.preventDefault();
        router.get('/portal', {
            search: searchQuery || undefined,
            sort: selectedSort !== 'newest' ? selectedSort : undefined,
            kategori: selectedCategory || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    // Handle Reset Filter
    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedSort('newest');
        setMinPrice('');
        setMaxPrice('');
        router.get('/portal');
    };

    // Handle Pagination Change
    const handlePageChange = (page) => {
        router.get('/portal', {
            search: searchQuery || undefined,
            sort: selectedSort !== 'newest' ? selectedSort : undefined,
            kategori: selectedCategory || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            page: page,
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Portal Pengadaan B2B — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <BuyerNavbar searchQuery={searchQuery} />

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                
                {/* Mobile Search Bar */}
                <form onSubmit={handleSearchSubmit} className="md:hidden">
                    <div className="flex items-center w-full bg-white dark:bg-[#171B26] rounded-lg overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk hardware atau layanan..."
                            className="flex-1 h-10 px-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 border-0 focus:outline-none focus:ring-0 bg-transparent"
                        />
                        <button
                            type="submit"
                            aria-label="Cari"
                            className="h-10 px-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 flex items-center justify-center transition-colors shrink-0"
                        >
                            <Search className="h-4 w-4 stroke-[2.5]" />
                        </button>
                    </div>
                </form>

                {isSearchMode ? (
                    /* ===================================================== */
                    /* SEARCH / FILTER RESULTS VIEW (1:1 with Figma)         */
                    /* ===================================================== */
                    <div className="space-y-6">
                        {/* Breadcrumbs */}
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Link href="/portal" className="hover:text-[#086f8e] dark:hover:text-cyan-400 transition-colors">
                                Beranda
                            </Link>
                            <span>/</span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">Hasil Pencarian</span>
                        </nav>

                        {/* Search Results Heading */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                            <div>
                                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Hasil Pencarian: {serverFilters.search || (selectedCategory ? cleanCategoryName(categories.find(c => c.id == selectedCategory)?.name) : 'Semua Produk')}
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                    Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{pagination.total ?? products.length}</span> produk untuk kata kunci <span className="text-[#086f8e] dark:text-cyan-400 font-semibold">&apos;{serverFilters.search || 'Katalog B2B'}&apos;</span>
                                </p>
                            </div>
                            <div className="shrink-0">
                                <span className="inline-flex items-center text-xs font-semibold text-[#086f8e] dark:text-cyan-400">
                                    Faktur Pajak PPN 11%
                                </span>
                            </div>
                        </div>

                        {/* 2-Column Content: Sidebar + Products */}
                        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
                            
                            {/* LEFT COLUMN: Filter Sidebar */}
                            <aside className="w-full lg:w-64 xl:w-72 shrink-0 bg-white dark:bg-[#151b26] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-5">
                                
                                {/* Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                                        <SlidersHorizontal className="h-4 w-4 text-[#086f8e]" />
                                        <span>Filter Katalog B2B</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResetFilter}
                                        className="text-xs text-[#086f8e] hover:text-[#065b75] dark:text-cyan-400 font-semibold transition-colors"
                                    >
                                        Reset Filter
                                    </button>
                                </div>

                                {/* Section 1: Kategori Produk & Layanan */}
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setCatOpen(!catOpen)}
                                        className="w-full flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white"
                                    >
                                        <span>Kategori Produk &amp; Layanan</span>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {catOpen && (
                                        <div className="space-y-1.5 pt-1">
                                            {categories.map((cat) => {
                                                const isChecked = selectedCategory == cat.id;
                                                return (
                                                    <label
                                                        key={cat.id}
                                                        className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer py-1 select-none"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleCategoryToggle(cat.id)}
                                                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#086f8e] focus:ring-[#086f8e] cursor-pointer"
                                                        />
                                                        <span className="flex-1 truncate">{cleanCategoryName(cat.name)}</span>
                                                        {cat.products_count !== undefined && (
                                                            <span className="text-slate-400 text-[11px]">({cat.products_count})</span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800"></div>

                                {/* Section 2: Status Ketersediaan */}
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setStockOpen(!stockOpen)}
                                        className="w-full flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white"
                                    >
                                        <span>Status Ketersediaan</span>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${stockOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {stockOpen && (
                                        <div className="space-y-1.5 pt-1">
                                            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer py-1 select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSort === 'ready_stock'}
                                                    onChange={handleToggleReadyStock}
                                                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#086f8e] focus:ring-[#086f8e] cursor-pointer"
                                                />
                                                <span>Ready Stock</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer py-1 select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={false}
                                                    onChange={() => {}}
                                                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#086f8e] focus:ring-[#086f8e] cursor-pointer"
                                                />
                                                <span>Pre-Order / Pengadaan Khusus</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800"></div>

                                {/* Section 3: Rentang Harga (Rupiah) */}
                                <form onSubmit={handleApplyPrice} className="space-y-3">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                        Rentang Harga (Rupiah)
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-[10px] text-slate-500 mb-1 block">Min</span>
                                            <input
                                                type="number"
                                                placeholder="Rp 0"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#12161F] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#086f8e]"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 mb-1 block">Max</span>
                                            <input
                                                type="number"
                                                placeholder="Rp Maks."
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#12161F] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#086f8e]"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full mt-2 py-2 bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                                    >
                                        Terapkan Harga
                                    </button>
                                </form>

                            </aside>

                            {/* RIGHT COLUMN: Controls Bar & Products Grid */}
                            <div className="flex-1 min-w-0 space-y-5">
                                
                                {/* Controls Bar: Sort, Product Count, View Mode Switcher */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151b26] p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                    
                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <span className="shrink-0 font-medium">Urutkan berdasarkan:</span>
                                        <select
                                            value={selectedSort}
                                            onChange={(e) => handleSelectSort(e.target.value)}
                                            className="h-8 px-2.5 pr-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#12161F] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#086f8e] cursor-pointer"
                                        >
                                            <option value="newest">Terkait</option>
                                            <option value="price_asc">Harga: Terendah</option>
                                            <option value="price_desc">Harga: Tertinggi</option>
                                            <option value="ready_stock">Ready Stock</option>
                                        </select>
                                    </div>

                                    {/* Count & View Switcher */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            {pagination.total ?? products.length} produk
                                        </span>
                                        <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:inline-block"></span>
                                        
                                        {/* Grid & List Toggle */}
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('grid')}
                                                aria-label="Tampilan Grid"
                                                className={`p-1.5 rounded-md transition-all ${
                                                    viewMode === 'grid'
                                                        ? 'bg-[#086f8e] text-white shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <LayoutGrid className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('list')}
                                                aria-label="Tampilan List"
                                                className={`p-1.5 rounded-md transition-all ${
                                                    viewMode === 'list'
                                                        ? 'bg-[#086f8e] text-white shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <List className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                {/* Empty State */}
                                {products.length === 0 && (
                                    <div className="py-16 text-center bg-white dark:bg-[#151b26] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            Belum ada produk yang sesuai dengan kriteria pencarian Anda.
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Coba ubah kata kunci atau kurangi filter untuk melihat lebih banyak produk.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleResetFilter}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-semibold rounded-lg transition-colors mt-2"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            <span>Reset Semua Filter</span>
                                        </button>
                                    </div>
                                )}

                                {/* Products Grid (3 Columns) / List Mode */}
                                {products.length > 0 && (
                                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-3"}>
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                viewMode={viewMode}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Numbered Pagination */}
                                {pagination.last_page > 1 && (
                                    <div className="flex items-center justify-center gap-1.5 pt-8">
                                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => handlePageChange(p)}
                                                className={`h-9 min-w-[36px] px-3 rounded-lg text-xs font-semibold transition-all ${
                                                    p === pagination.current_page
                                                        ? 'bg-[#086f8e] text-white shadow-xs'
                                                        : 'bg-white dark:bg-[#151b26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                        {pagination.current_page < pagination.last_page && (
                                            <button
                                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                                className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#151b26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                                            >
                                                <span>Berikutnya</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>
                ) : (
                    /* ===================================================== */
                    /* HOME VIEW (HERO BANNER + KATALOG B2B TERPOPULER)      */
                    /* ===================================================== */
                    <>
                        {/* SECTION 1: HERO BANNER PENGADAAN B2B */}
                        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#093554] via-[#0e4d74] to-[#0b3d60] border border-cyan-800/30 shadow-xl">
                            <div className="flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 lg:p-12 gap-8">
                                
                                {/* Left Side: Headline & CTAs */}
                                <div className="flex-1 max-w-xl z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="h-[2px] w-5 bg-[#f59e0b] inline-block rounded-full"></span>
                                        <span className="text-[11px] font-bold tracking-wider text-[#f59e0b] uppercase">
                                            SOLUSI IT UNTUK BISNIS ANDA
                                        </span>
                                    </div>

                                    <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight uppercase tracking-tight">
                                        PORTAL PENGADAAN BARANG &amp; JASA IT RESMI CV. PUTRA NUGRAHA
                                    </h1>

                                    <p className="mt-3.5 text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-lg">
                                        Belanja Mudah, Faktur Pajak Resmi &amp; Garansi B2B untuk Kebutuhan Perusahaan Anda
                                    </p>

                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <Link
                                            href="/buyer/rfq/create"
                                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98]"
                                        >
                                            Buat Pengajuan RFQ
                                        </Link>
                                        <a
                                            href="#katalog"
                                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-white hover:bg-white/10 text-white text-xs sm:text-sm font-semibold transition-all active:scale-[0.98]"
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

                        {/* SECTION 2: KATALOG B2B TERPOPULER & PENGADAAN CEPAT */}
                        <section id="katalog" className="space-y-6 scroll-mt-24">
                            
                            {/* Header Bar Section: Title & Sort/Filter Button */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        Katalog B2B Terpopuler &amp; Pengadaan Tercepat
                                    </h2>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                        Produk dan layanan IT pilihan untuk kebutuhan operasional perusahaan.
                                    </p>
                                </div>

                                {/* Sort / Filter Dropdown Button */}
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                                        className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#171B26] hover:border-blue-500/60 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors"
                                    >
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                        <span>Sort / Filter</span>
                                        <ChevronDown className={`h-3 w-3 text-slate-500 dark:text-slate-400 transition-transform ${filterMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Options */}
                                    {filterMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-1.5 shadow-2xl space-y-1 text-xs z-40">
                                            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Urutkan Produk
                                            </div>
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    type="button"
                                                    onClick={() => handleSelectSort(opt.key)}
                                                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-blue-600/20 dark:hover:text-white transition text-left"
                                                >
                                                    <span>{opt.label}</span>
                                                    {selectedSort === opt.key && (
                                                        <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </button>
                                            ))}

                                            {categories.length > 0 && (
                                                <>
                                                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                                                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        Filter Kategori
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFilterMenuOpen(false);
                                                            router.get('/portal', { search: searchQuery, sort: selectedSort }, { preserveState: true, preserveScroll: true });
                                                        }}
                                                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-blue-600/20 dark:hover:text-white transition text-left"
                                                    >
                                                        <span>Semua Kategori</span>
                                                        {!serverFilters.kategori && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                                                    </button>
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFilterMenuOpen(false);
                                                                router.get('/portal', { kategori: cat.id, search: searchQuery, sort: selectedSort }, { preserveState: true, preserveScroll: true });
                                                            }}
                                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-blue-600/20 dark:hover:text-white transition text-left truncate"
                                                        >
                                                            <span className="truncate">{cleanCategoryName(cat.name)}</span>
                                                            {serverFilters.kategori == cat.id && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Cards Grid: 5 Kolom Sesuai Mockup Desain */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {products.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-500 dark:text-slate-400">Belum ada produk yang sesuai.</p>}
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                            {pagination.last_page > 1 && (
                                <nav aria-label="Halaman katalog" className="flex items-center justify-between text-sm">
                                    {paginationLinks.previous ? <Link href={paginationLinks.previous}>Sebelumnya</Link> : <span />}
                                    <span>{pagination.current_page} / {pagination.last_page}</span>
                                    {paginationLinks.next ? <Link href={paginationLinks.next}>Berikutnya</Link> : <span />}
                                </nav>
                            )}
                        </section>
                    </>
                )}

            </main>

            {/* ========================================================= */}
            {/* FOOTER PORTAL B2B & WA HOTLINE                            */}
            {/* ========================================================= */}
            <BuyerFooter />

        </div>
    );
}
