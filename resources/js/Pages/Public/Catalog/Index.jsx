import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { Search, ArrowRight, Box } from 'lucide-react';
import { useState } from 'react';

export default function CatalogIndex({ products = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const categories = ['Semua', 'Peralatan Kantor', 'Perangkat IT & Komputer', 'Material & Teknik', 'Alat Keselamatan Kerja (K3)'];

    const wireframeItems = [
        {
            id: 1,
            name: '[PRODUK_01]: Perangkat Komputer / Workstation Enterprise',
            category: 'Perangkat IT & Komputer',
            sku: 'PN-IT-001',
            priceEst: 'Rp xx.xxx.xxx',
            moq: 'Minimal x Unit',
        },
        {
            id: 2,
            name: '[PRODUK_02]: Perangkat Jaringan & Server Rack',
            category: 'Perangkat IT & Komputer',
            sku: 'PN-IT-002',
            priceEst: 'Rp xx.xxx.xxx',
            moq: 'Minimal x Unit',
        },
        {
            id: 3,
            name: '[PRODUK_03]: Paket Mobiler Kantor Modular',
            category: 'Peralatan Kantor',
            sku: 'PN-OF-001',
            priceEst: 'Rp xx.xxx.xxx',
            moq: 'Minimal x Set',
        },
        {
            id: 4,
            name: '[PRODUK_04]: Perlengkapan K3 Standar SNI',
            category: 'Alat Keselamatan Kerja (K3)',
            sku: 'PN-K3-001',
            priceEst: 'Rp xxx.xxx',
            moq: 'Minimal xx Unit',
        },
    ];

    const displayProducts = products.length > 0 ? products : wireframeItems;

    return (
        <MainLayout title="Katalog Produk (Wireframe)">
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
                            className="w-full pl-9 pr-4 py-2 rounded bg-navy-950 border border-navy-800 text-white placeholder-slate-500 text-xs focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition ${
                                    selectedCategory === cat
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'bg-navy-950 text-slate-400 border border-navy-800 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Catalog Grid Wireframe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-xl border border-dashed border-navy-700 bg-navy-900/40 p-5 flex flex-col justify-between hover:border-blue-500/50 transition font-mono"
                        >
                            <div className="space-y-3">
                                <div className="h-40 w-full rounded border border-navy-800 bg-navy-950 flex flex-col items-center justify-center text-slate-600 text-[11px]">
                                    <Box className="h-8 w-8 mb-1 text-slate-700" />
                                    <span>[IMAGE_PLACEHOLDER_400x300]</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span className="text-blue-400 font-semibold">{p.category}</span>
                                    <span>{p.sku}</span>
                                </div>
                                <h3 className="text-xs font-bold text-white font-sans leading-snug">
                                    {p.name}
                                </h3>
                                <div className="text-[11px] text-slate-400">
                                    <span>[STATUS: READY / PO]</span> • <span>{p.moq}</span>
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-navy-800 flex items-center justify-between">
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase">Estimasi Acuan</div>
                                    <div className="text-sm font-bold text-white">{p.priceEst}</div>
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
            </div>
        </MainLayout>
    );
}
