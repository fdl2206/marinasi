import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Box, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

export default function CatalogShow({ product }) {
    const [activeImage, setActiveImage] = useState(product.images?.[0]?.url || null);
    const [quantity, setQuantity] = useState(product.moq || 1);
    const [notes, setNotes] = useState('');

    const priceLabel =
        product.price !== null && product.price !== undefined && product.price !== ''
            ? `Rp ${Number(product.price).toLocaleString('id-ID')}`
            : 'Hubungi untuk penawaran';

    const stockLabel =
        product.stock_quantity === null || product.stock_quantity === undefined
            ? 'Ketersediaan belum dikonfirmasi'
            : Number(product.stock_quantity) > 0
                ? `Stok tersedia: ${product.stock_quantity} ${product.stock_unit || ''}`.trim()
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
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
                <Link
                    href="/katalog"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Kembali ke Katalog</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Image Gallery & Specifications */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-3">
                            <div className="h-80 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 flex flex-col items-center justify-center overflow-hidden shadow-sm">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 text-xs">
                                        <Box className="h-10 w-10 mb-2 text-slate-300 dark:text-slate-600" />
                                        <span>Foto produk belum tersedia</span>
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
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold">
                                    {product.category?.name}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                    {product.type === 'goods' ? 'Barang' : 'Jasa'}
                                </span>
                                {product.sku && (
                                    <span className="font-mono text-slate-500 dark:text-slate-400">
                                        SKU: {product.sku}
                                    </span>
                                )}
                            </div>

                            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                                {product.name}
                            </h1>

                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {product.description || 'Deskripsi produk belum tersedia.'}
                            </p>
                        </div>

                        {/* Specs Table */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-sm space-y-3 text-xs">
                            <div className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
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
                                    <p className="py-2 text-slate-500 dark:text-slate-400">Spesifikasi belum tersedia.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Procurement & Inquiry Card */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-sm space-y-5 text-xs">
                            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                                    Informasi Harga &amp; Pengadaan
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
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
                                        className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white text-xs"
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
                                        className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400"
                                    />
                                </div>

                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Masuk untuk Pesan / Ajukan RFQ</span>
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

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Untuk menambahkan item ke keranjang dan memantau riwayat pengadaan perusahaan, silakan masuk menggunakan akun pembeli CV. Putra Nugraha.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
