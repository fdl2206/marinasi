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

    return (
        <MainLayout title="Katalog Produk">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
                {/* Header Wireframe */}
                <div className="border border-dashed border-navy-700 bg-navy-900/30 p-6 rounded-xl space-y-2">
                    <div className="text-[11px] font-mono text-blue-400 font-bold">[REGION: CATALOG_HEADER]</div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">E-Catalog & Daftar Komoditas Pengadaan</h1>
                    <p className="text-xs text-slate-400 font-mono">
                        [SLOT_INFO: Filter multi-kategori, pencarian kode SKU/KBLI, acuan harga satuan & pengajuan negosiasi kuantitas besar]
                    </p>
                </div>

                {/* Filter & Search Bar Wireframe */}
                <div className="border border-navy-800 bg-navy-900/60 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between font-mono text-xs">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="[INPUT_SEARCH: Cari nama komoditas, SKU, atau spesifikasi...]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full pl-9 pr-4 py-2 rounded bg-navy-950 border border-navy-800 text-white placeholder-slate-500 text-xs focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        <button
                            type="button"
                            onClick={() => applyFilters({ category_id: undefined })}
                            className={`px-2.5 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition ${!selectedCategoryId ? 'bg-blue-600 text-white font-bold' : 'bg-navy-950 text-slate-400 border border-navy-800 hover:text-white'}`}
                        >
                            Semua
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => applyFilters({ category_id: String(category.id) })}
                                className={`px-2.5 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition ${
                                    Number(selectedCategoryId) === category.id
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'bg-navy-950 text-slate-400 border border-navy-800 hover:text-white'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                        className="rounded bg-navy-950 border border-navy-800 text-white text-xs px-3 py-2"
                    >
                        <option value="">Semua tipe</option>
                        <option value="goods">Barang</option>
                        <option value="service">Jasa</option>
                    </select>
                </div>

                {/* Catalog Grid Wireframe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.length === 0 && (
                        <p className="col-span-full rounded-xl border border-navy-800 p-8 text-center text-sm text-slate-400">
                            Belum ada produk yang tersedia.
                        </p>
                    )}
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-xl border border-dashed border-navy-700 bg-navy-900/40 p-5 flex flex-col justify-between hover:border-blue-500/50 transition font-mono"
                        >
                            <div className="space-y-3">
                                <div className="h-40 w-full rounded border border-navy-800 bg-navy-950 flex flex-col items-center justify-center text-slate-600 text-[11px]">
                                    <Box className="h-8 w-8 mb-1 text-slate-700" />
                                    <span>Gambar belum tersedia</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span className="text-blue-400 font-semibold">{p.category?.name}</span>
                                    <span>{p.sku}</span>
                                </div>
                                <h3 className="text-xs font-bold text-white font-sans leading-snug">
                                    {p.name}
                                </h3>
                                <div className="text-[11px] text-slate-400">
                                    <span>{p.type === 'goods' ? 'Barang' : 'Jasa'}</span>{p.moq ? <> • <span>Min. {p.moq}</span></> : null}
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-navy-800 flex items-center justify-between">
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase">Estimasi Acuan</div>
                                    <div className="text-sm font-bold text-white">{p.price ? `Rp ${Number(p.price).toLocaleString('id-ID')}` : 'Hubungi untuk penawaran'}</div>
                                </div>
                                <Link
                                    href={`/katalog/${p.id}`}
                                    className="px-2.5 py-1.5 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white text-[11px] flex items-center gap-1 transition"
                                >
                                    <span>Detail</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                {pagination.last_page > 1 && (
                    <nav className="flex items-center justify-between text-sm text-slate-300" aria-label="Pagination katalog">
                        {paginationLinks.previous ? <Link href={paginationLinks.previous}>Sebelumnya</Link> : <span />}
                        <span>Halaman {pagination.current_page} dari {pagination.last_page}</span>
                        {paginationLinks.next ? <Link href={paginationLinks.next}>Berikutnya</Link> : <span />}
                    </nav>
                )}
            </div>
        </MainLayout>
    );
}
