import MainLayout from '@/Layouts/MainLayout';
import { Link, router } from '@inertiajs/react';
import {
    Search,
    ArrowRight,
    Package,
    Wrench,
    SlidersHorizontal,
    RotateCcw,
    X,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Layers,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const cleanCategoryName = (name) => (name || '').replace(/^\d+[\.\)]\s*/, '').trim();

function formatPrice(price) {
    if (price === null || price === undefined || price === '') {
        return 'Hubungi untuk penawaran';
    }

    return `Rp ${Number(price).toLocaleString('id-ID')}`;
}

function getStockMeta(product) {
    if (product.stock_quantity === null || product.stock_quantity === undefined) {
        return {
            label: product.type === 'service' ? 'Layanan Tersedia' : 'Tanya Ketersediaan',
            dotClass: 'bg-sky-400',
            textClass: 'text-sky-600 dark:text-sky-400',
        };
    }

    if (Number(product.stock_quantity) >= 1) {
        return {
            label: `Stok Tersedia (${Number(product.stock_quantity)}${product.stock_unit ? ` ${product.stock_unit}` : ''})`,
            dotClass: 'bg-emerald-500',
            textClass: 'text-emerald-600 dark:text-emerald-400',
        };
    }

    return {
        label: 'Stok Habis',
        dotClass: 'bg-rose-500',
        textClass: 'text-rose-600 dark:text-rose-400',
    };
}

export default function CatalogIndex({ products = [], categories = [], filters = {}, pagination = {}, paginationLinks = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategoryId, setSelectedCategoryId] = useState(filters.category_id ? String(filters.category_id) : '');
    const [selectedType, setSelectedType] = useState(filters.type || '');

    useEffect(() => {
        setSearchQuery(filters.search || '');
        setSelectedCategoryId(filters.category_id ? String(filters.category_id) : '');
        setSelectedType(filters.type || '');
    }, [filters.search, filters.category_id, filters.type]);

    const applyFilters = (overrides = {}) => {
        const nextFilters = {
            search: searchQuery,
            category_id: selectedCategoryId,
            type: selectedType,
            ...overrides,
        };

        setSearchQuery(nextFilters.search || '');
        setSelectedCategoryId(nextFilters.category_id ? String(nextFilters.category_id) : '');
        setSelectedType(nextFilters.type || '');

        router.get(
            '/katalog',
            {
                search: nextFilters.search || undefined,
                category_id: nextFilters.category_id || undefined,
                type: nextFilters.type || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        applyFilters({ search: '', category_id: '', type: '' });
    };

    const hasActiveFilters = Boolean(filters.search || filters.category_id || filters.type);
    const activeCategory = categories.find((cat) => String(cat.id) === String(selectedCategoryId));

    return (
        <MainLayout title="Katalog Produk & Layanan">
            {/* HERO HEADER — selaras dengan Public/Home & Portfolio */}
            <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0C0D12] pt-10 pb-10 sm:pt-14 sm:pb-12 transition-colors duration-150">
                <div
                    aria-hidden="true"
                    className="absolute -top-24 right-0 w-[460px] h-[460px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[130px] pointer-events-none"
                />
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px] font-semibold tracking-wide uppercase">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                <span>E-Catalog B2B Resmi • CV. Putra Nugraha</span>
                            </div>

                            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                                Katalog Produk &amp; Layanan Pengadaan
                            </h1>

                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Temukan perangkat keras, infrastruktur jaringan, suku cadang, dan layanan servis IT resmi untuk kebutuhan instansi maupun perusahaan Anda.
                            </p>
                        </div>

                        {/* Search Bar Lega */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applyFilters();
                            }}
                            className="w-full lg:w-[420px] shrink-0"
                        >
                            <div className="flex items-center w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#171B26] shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 overflow-hidden transition">
                                <div className="pl-3.5 text-slate-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari nama produk, layanan, atau SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 h-11 px-3 bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => applyFilters({ search: '' })}
                                        aria-label="Hapus pencarian"
                                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="h-11 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shrink-0"
                                >
                                    Cari
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT: 2-COLUMN SIDEBAR + PRODUCT GRID */}
            <section className="py-10 bg-slate-50 dark:bg-[#0C0D12] min-h-[60vh] transition-colors duration-150">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                        {/* LEFT SIDEBAR FILTER */}
                        <aside className="w-full lg:w-72 shrink-0 space-y-5">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 shadow-sm space-y-5">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                        <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span>Filter Katalog</span>
                                    </div>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            <span>Reset</span>
                                        </button>
                                    )}
                                </div>

                                {/* Tipe Komoditas */}
                                <div className="space-y-2.5">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Tipe Komoditas
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#12161F] border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
                                        {[
                                            { value: '', label: 'Semua' },
                                            { value: 'goods', label: 'Barang' },
                                            { value: 'service', label: 'Jasa' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => applyFilters({ type: opt.value })}
                                                className={`py-1.5 px-2 rounded-lg transition ${
                                                    selectedType === opt.value
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Daftar Kategori Vertikal (Tanpa Scrollbar Jelek) */}
                                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Kategori Produk &amp; Jasa
                                    </div>
                                    <div className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => applyFilters({ category_id: '' })}
                                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium transition ${
                                                !selectedCategoryId
                                                    ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-500/30'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2434] border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2 truncate">
                                                <Layers className="h-3.5 w-3.5 shrink-0 opacity-75" />
                                                <span>Semua Kategori</span>
                                            </span>
                                        </button>

                                        {categories.map((category) => {
                                            const active = String(selectedCategoryId) === String(category.id);
                                            return (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    onClick={() => applyFilters({ category_id: String(category.id) })}
                                                    className={`w-full flex items-start gap-2 px-3 py-2 rounded-xl text-left text-xs leading-snug transition ${
                                                        active
                                                            ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-500/30'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2434] border border-transparent'
                                                    }`}
                                                >
                                                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${active ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-400/60'}`} />
                                                    <span>{cleanCategoryName(category.name)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Bantuan Pengadaan */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 shadow-sm space-y-3">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    Butuh Penawaran Resmi (RFQ)?
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Masuk dengan akun instansi Anda untuk mengajukan penawaran harga khusus atau konsultasi langsung via WhatsApp.
                                </p>
                                <div className="space-y-2 pt-1">
                                    <Link
                                        href="/login"
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-sm"
                                    >
                                        <span>Masuk Portal Pembeli</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                    <a
                                        href="https://wa.me/6281320777874?text=Halo%20CV.%20Putra%20Nugraha,%20saya%20ingin%20berkonsultasi%20mengenai%20katalog%20pengadaan."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>Konsultasi WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </aside>

                        {/* RIGHT MAIN AREA */}
                        <div className="flex-1 min-w-0 space-y-5 w-full">
                            {/* Summary & Active Filter Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] px-4 py-3 text-xs shadow-sm">
                                <div className="text-slate-600 dark:text-slate-300">
                                    Menampilkan{' '}
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {pagination.total ?? products.length}
                                    </span>{' '}
                                    item katalog aktif
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {filters.search && (
                                        <button
                                            type="button"
                                            onClick={() => applyFilters({ search: '' })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-[11px] font-medium"
                                        >
                                            <span>Kata kunci: &ldquo;{filters.search}&rdquo;</span>
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                    {activeCategory && (
                                        <button
                                            type="button"
                                            onClick={() => applyFilters({ category_id: '' })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-[11px] font-medium"
                                        >
                                            <span className="max-w-[200px] truncate">{cleanCategoryName(activeCategory.name)}</span>
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                    {filters.type && (
                                        <button
                                            type="button"
                                            onClick={() => applyFilters({ type: '' })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-[11px] font-medium"
                                        >
                                            <span>{filters.type === 'goods' ? 'Barang' : 'Jasa'}</span>
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Product Cards Grid */}
                            {products.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-14 text-center space-y-3 shadow-sm">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Tidak ada produk atau layanan yang cocok
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Coba gunakan kata kunci lain atau reset filter untuk melihat seluruh katalog aktif.
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            <span>Tampilkan Semua Produk</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {products.map((p) => {
                                        const coverImage = p.images?.[0]?.url || null;
                                        const stockMeta = getStockMeta(p);
                                        const isService = p.type === 'service';

                                        return (
                                            <div
                                                key={p.id}
                                                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden flex flex-col justify-between hover:border-blue-500/60 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-blue-950/30 transition-all duration-200 shadow-sm"
                                            >
                                                <div>
                                                    {/* Thumbnail Area — selaras Dark/Light Mode (tanpa kotak putih menyilaukan saat kosong) */}
                                                    <Link
                                                        href={`/katalog/${p.id}`}
                                                        className={`relative h-48 w-full flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800/80 ${
                                                            coverImage
                                                                ? 'bg-slate-50 dark:bg-[#12161F] p-4'
                                                                : 'bg-gradient-to-br from-slate-100 to-slate-50 dark:from-[#12161F] dark:to-[#181E2C] p-6'
                                                        }`}
                                                    >
                                                        {coverImage ? (
                                                            <img
                                                                src={coverImage}
                                                                alt={p.images[0]?.alt_text || p.name}
                                                                className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-center gap-2">
                                                                <div className="h-12 w-12 rounded-2xl bg-white dark:bg-[#1E2434] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm">
                                                                    {isService ? (
                                                                        <Wrench className="h-5 w-5" />
                                                                    ) : (
                                                                        <Package className="h-5 w-5" />
                                                                    )}
                                                                </div>
                                                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                                                    Foto belum tersedia
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Type Pill Badge Overlay */}
                                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold backdrop-blur-md bg-white/90 dark:bg-[#0C0D12]/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200">
                                                            {isService ? 'Jasa' : 'Barang'}
                                                        </span>

                                                        {p.sku && (
                                                            <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-mono font-semibold backdrop-blur-md bg-white/90 dark:bg-[#0C0D12]/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400">
                                                                {p.sku}
                                                            </span>
                                                        )}
                                                    </Link>

                                                    {/* Body Content */}
                                                    <div className="p-4 sm:p-5 space-y-2.5">
                                                        <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                                                            {cleanCategoryName(p.category?.name)}
                                                        </div>

                                                        <Link
                                                            href={`/katalog/${p.id}`}
                                                            className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2 min-h-[2.5rem] transition-colors"
                                                        >
                                                            {p.name}
                                                        </Link>

                                                        <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${stockMeta.dotClass}`} />
                                                            <span className={stockMeta.textClass}>{stockMeta.label}</span>
                                                            {p.moq ? (
                                                                <span className="text-slate-400">• Min. {p.moq}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer Price & Detail CTA */}
                                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                            Harga Acuan
                                                        </div>
                                                        <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                                                            {formatPrice(p.price)}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/katalog/${p.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 transition shrink-0"
                                                    >
                                                        <span>Detail</span>
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <nav
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] px-4 py-3 text-xs text-slate-600 dark:text-slate-300 shadow-sm"
                                    aria-label="Pagination katalog"
                                >
                                    {paginationLinks.previous ? (
                                        <Link
                                            href={paginationLinks.previous}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 font-semibold transition"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                            <span>Sebelumnya</span>
                                        </Link>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        Halaman {pagination.current_page} dari {pagination.last_page}
                                    </span>
                                    {paginationLinks.next ? (
                                        <Link
                                            href={paginationLinks.next}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 font-semibold transition"
                                        >
                                            <span>Berikutnya</span>
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    ) : (
                                        <span />
                                    )}
                                </nav>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
