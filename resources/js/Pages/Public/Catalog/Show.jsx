import MainLayout from '@/Layouts/MainLayout';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Package, Wrench, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const cleanCategoryName = (name) => (name || '').replace(/^\d+[\.\)]\s*/, '').trim();

export default function CatalogShow({ product }) {
    const { props } = usePage();
    const user = props?.auth?.user;
    const [activeImage, setActiveImage] = useState(product.images?.[0]?.url || null);
    const [quantity, setQuantity] = useState(product.moq || 1);
    const [notes, setNotes] = useState('');

    const isService = product.type === 'service';

    const priceLabel =
        product.price !== null && product.price !== undefined && product.price !== ''
            ? `Rp ${Number(product.price).toLocaleString('id-ID')}`
            : 'Hubungi untuk penawaran';

    const stockLabel = isService
        ? 'Layanan tersedia sesuai jadwal'
        : product.stock_quantity === null || product.stock_quantity === undefined
            ? 'Ketersediaan belum dikonfirmasi'
            : Number(product.stock_quantity) >= 1
                ? `Stok tersedia: ${Number(product.stock_quantity)} ${product.stock_unit || 'unit'}`.trim()
                : 'Stok habis';

    const whatsappText = encodeURIComponent(
        `Halo CV. Putra Nugraha, saya ingin menanyakan penawaran untuk:\n` +
        `• Produk: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}\n` +
        `• Jumlah: ${quantity} ${product.stock_unit || 'unit'}\n` +
        (notes.trim() ? `• Catatan: ${notes.trim()}\n` : '') +
        `Mohon informasi ketersediaan dan penawarannya. Terima kasih.`
    );

    const specEntries = Object.entries(product.specifications || {});

    return (
        <MainLayout title={`${product.name} — Detail Produk`}>
            <section className="py-10 bg-slate-50 dark:bg-[#0C0D12] min-h-[70vh] transition-colors duration-150">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-6 font-sans">
                    {/* Breadcrumb */}
                    <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Link
                            href="/katalog"
                            className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Katalog</span>
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/katalog?category_id=${product.category?.id || ''}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition truncate max-w-[220px]"
                        >
                            {cleanCategoryName(product.category?.name)}
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white font-semibold truncate">
                            {product.name}
                        </span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left: Image Gallery & Specifications */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="space-y-3">
                                <div
                                    className={`h-80 sm:h-96 w-full rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-sm ${
                                        activeImage
                                            ? 'bg-white dark:bg-[#171B26] p-6'
                                            : 'bg-gradient-to-br from-slate-100 to-slate-50 dark:from-[#12161F] dark:to-[#171B26] p-8'
                                    }`}
                                >
                                    {activeImage ? (
                                        <img
                                            src={activeImage}
                                            alt={product.name}
                                            className="max-h-full max-w-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2.5 text-center">
                                            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-[#1E2434] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm">
                                                {isService ? <Wrench className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                                Foto produk belum tersedia
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {product.images?.length > 1 && (
                                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                                        {product.images.map((img) => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() => setActiveImage(img.url)}
                                                className={`h-16 w-16 shrink-0 rounded-xl border-2 bg-white dark:bg-[#171B26] p-1.5 flex items-center justify-center overflow-hidden transition ${
                                                    activeImage === img.url
                                                        ? 'border-blue-600 shadow-sm'
                                                        : 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.alt_text || product.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-sm space-y-3">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 font-semibold">
                                        {cleanCategoryName(product.category?.name)}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                        {isService ? 'Jasa' : 'Barang'}
                                    </span>
                                    {product.sku && (
                                        <span className="px-2.5 py-1 rounded-lg font-mono bg-slate-100 dark:bg-[#12161F] text-slate-500 dark:text-slate-400">
                                            SKU: {product.sku}
                                        </span>
                                    )}
                                </div>

                                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                                    {product.name}
                                </h1>

                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {product.description || 'Deskripsi produk belum tersedia.'}
                                </p>
                            </div>

                            {/* Specs Table */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-sm space-y-3 text-xs">
                                <div className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
                                    Spesifikasi Teknis
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {specEntries.length > 0 ? (
                                        specEntries.map(([label, value]) => (
                                            <div key={label} className="flex justify-between gap-4 py-2.5">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                                                <span className="text-slate-900 dark:text-white font-semibold text-right">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-2 text-slate-500 dark:text-slate-400">Spesifikasi teknis belum ditambahkan.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Procurement & Inquiry Card */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-sm space-y-5 text-xs">
                                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1.5">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        Informasi Harga &amp; Pengadaan
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {priceLabel}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {stockLabel}
                                        {product.moq ? ` • Min. order ${product.moq} ${product.stock_unit || 'unit'}` : ''}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                                            Jumlah Kebutuhan ({product.stock_unit || 'unit'})
                                        </label>
                                        <input
                                            type="number"
                                            min={product.moq || 1}
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                            className="w-full rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                                            Catatan Pengadaan / Lokasi Proyek (Opsional)
                                        </label>
                                        <textarea
                                            rows="3"
                                            placeholder="Masukkan rincian kebutuhan khusus, jadwal, atau alamat pengiriman..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <Link
                                        href={user ? (user.is_seller ? '/seller/catalog' : `/buyer/products/${product.id}`) : '/login'}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        <span>
                                            {user
                                                ? user.is_seller
                                                    ? 'Kelola di Katalog Seller'
                                                    : 'Buka di Portal Buyer / Tambah ke Keranjang'
                                                : 'Masuk untuk Pesan / Ajukan RFQ'}
                                        </span>
                                    </Link>

                                    <a
                                        href={`https://wa.me/6281320777874?text=${whatsappText}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-semibold text-xs transition"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>Tanya Penawaran via WhatsApp</span>
                                    </a>

                                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <span>
                                            Untuk menambahkan item ke keranjang dan memantau proses pengadaan instansi, silakan masuk menggunakan akun pembeli CV. Putra Nugraha.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
