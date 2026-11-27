import MainLayout from '@/Layouts/MainLayout';
import { Link, router } from '@inertiajs/react';
import { Search, ArrowRight, Box } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CatalogIndex({ products = [], categories = [], filters = {}, pagination = {}, paginationLinks = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategoryId, setSelectedCategoryId] = useState(filters.category_id || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');

    useEffect(() => {
        setSearchQuery(filters.search || '');
        setSelectedCategoryId(filters.category_id || '');
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
        setSelectedCategoryId(nextFilters.category_id || '');
        setSelectedType(nextFilters.type || '');

        router.get('/katalog', {
            search: nextFilters.search || undefined,
            category_id: nextFilters.category_id || undefined,
            type: nextFilters.type || undefined,
        }, { preserveState: true, replace: true });
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === '') {
            return 'Hubungi untuk penawaran';
        }

        return `Rp ${Number(price).toLocaleString('id-ID')}`;
    };

    return (
        <MainLayout title="Katalog Produk & Layanan">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
                {/* Header */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 sm:p-8 shadow-sm space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        E-Catalog CV. Putra Nugraha
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        Katalog Produk &amp; Layanan Pengadaan
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                        Telusuri barang dan jasa IT resmi untuk kebutuhan instansi maupun perusahaan. Gunakan pencarian atau filter kategori untuk menemukan spesifikasi yang sesuai.
                    </p>
                </div>

                {/* Filter & Search Bar */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters();
                        }}
                        className="relative flex-1"
                    >
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama produk, jasa, atau kode SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </form>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        <button
                            type="button"
                            onClick={() => applyFilters({ category_id: undefined })}
                            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                                !selectedCategoryId
                                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                    : 'bg-slate-100 dark:bg-[#0C0D12] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => applyFilters({ category_id: String(category.id) })}
                                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                                    Number(selectedCategoryId) === category.id
                                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                        : 'bg-slate-100 dark:bg-[#0C0D12] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                        className="rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3.5 py-2.5"
                    >
                        <option value="">Semua tipe</option>
                        <option value="goods">Barang</option>
                        <option value="service">Jasa</option>
                    </select>
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-12 text-center space-y-2">
                            <Box className="h-10 w-10 text-slate-400 mx-auto" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Belum ada produk yang sesuai filter.
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Coba ubah kata kunci pencarian atau pilih kategori lain.
                            </p>
                        </div>
                    )}
                    {products.map((p) => {
                        const coverImage = p.images?.[0]?.url || null;

                        return (
                            <div
                                key={p.id}
                                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 flex flex-col justify-between hover:border-blue-500/60 hover:shadow-lg transition shadow-sm"
                            >
                                <div className="space-y-3">
                                    <Link
                                        href={`/katalog/${p.id}`}
                                        className="h-44 w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-white flex flex-col items-center justify-center overflow-hidden p-3"
                                    >
                                        {coverImage ? (
                                            <img
                                                src={coverImage}
                                                alt={p.images[0]?.alt_text || p.name}
                                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 text-xs">
                                                <Box className="h-8 w-8 mb-1 text-slate-300" />
                                                <span>Foto belum tersedia</span>
                                            </div>
                                        )}
                                    </Link>

                                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                        <span className="text-blue-600 dark:text-blue-400 font-semibold truncate">
                                            {p.category?.name}
                                        </span>
                                        {p.sku && <span className="font-mono shrink-0">{p.sku}</span>}
                                    </div>

                                    <Link
                                        href={`/katalog/${p.id}`}
                                        className="block text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 leading-snug line-clamp-2 transition"
                                    >
                                        {p.name}
                                    </Link>

                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        <span>{p.type === 'goods' ? 'Barang' : 'Jasa'}</span>
                                        {p.moq ? (
                                            <>
                                                {' '}• <span>Min. {p.moq} {p.stock_unit || 'unit'}</span>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                            Harga Acuan
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {formatPrice(p.price)}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/katalog/${p.id}`}
                                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition shrink-0"
                                    >
                                        <span>Detail</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {pagination.last_page > 1 && (
                    <nav className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2" aria-label="Pagination katalog">
                        {paginationLinks.previous ? (
                            <Link
                                href={paginationLinks.previous}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] hover:border-blue-500 transition"
                            >
                                Sebelumnya
                            </Link>
                        ) : <span />}
                        <span>Halaman {pagination.current_page} dari {pagination.last_page}</span>
                        {paginationLinks.next ? (
                            <Link
                                href={paginationLinks.next}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] hover:border-blue-500 transition"
                            >
                                Berikutnya
                            </Link>
                        ) : <span />}
                    </nav>
                )}
            </div>
        </MainLayout>
    );
}
