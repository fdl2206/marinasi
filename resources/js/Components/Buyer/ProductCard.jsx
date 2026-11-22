import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Plus, Check, Loader2 } from 'lucide-react';

/**
 * Helper untuk format Rupiah standar Indonesia.
 * Backend bisa kirim integer murni (cth: 32500000) atau string terformat.
 */
export function formatRupiah(value) {
    if (value === null || value === undefined || value === '') {
        return 'Hubungi untuk penawaran';
    }
    if (typeof value === 'string' && value.includes('Rp')) {
        return value;
    }
    const num = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * ProductCard B2B Component
 * Didesain 100% modular agar backend developer tinggal inject data Eloquent / API Resource:
 * 
 * Props expected:
 * @param {Object} product
 * @param {number|string} product.id
 * @param {string} product.name
 * @param {string} [product.slug]
 * @param {number|string} product.price - cth: 32500000 atau "Rp 32.500.000"
 * @param {string} [product.unit] - cth: "paket", "unit", "bulan"
 * @param {string} [product.badge_label] - cth: "Ready Stock", "Jasa Resmi"
 * @param {string} [product.stock_status] - "ready_stock" | "official_service" | "indent"
 * @param {string[]} [product.tags] - cth: ["B2B", "Faktur Pajak"]
 * @param {string} [product.image_url] - path url gambar
 * @param {Function} [onAddToCart] - custom callback jika backend pakai custom state cart
 */
export default function ProductCard({ product, onAddToCart, viewMode = 'grid' }) {
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Deteksi badge status dan dot color
    const isReadyStock = product.stock_status === 'ready_stock' || product.badge_label?.toLowerCase().includes('ready');
    const badgeText = product.badge_label || (isReadyStock ? 'Ready Stock' : 'Jasa Resmi');
    const dotColor = isReadyStock ? 'bg-emerald-500' : 'bg-[#086f8e]';
    const badgeColor = isReadyStock ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#086f8e] dark:text-cyan-400';

    const tags = product.tags || [];

    // Handler Tambah ke Keranjang siap pakai untuk Backend
    const handleAddToCart = (e) => {
        e.preventDefault();
        if (isAdding || product.cart_enabled === false) return;

        setIsAdding(true);

        if (typeof onAddToCart === 'function') {
            onAddToCart(product);
            setIsAdding(false);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
            return;
        }

        // Default Inertia POST endpoint ke cart/orders
        router.post('/buyer/cart', {
            product_id: product.id,
            quantity: 1,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdding(false);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2000);
            },
            onError: () => {
                setIsAdding(false);
                setIsAdded(false);
            },
        });
    };

    if (viewMode === 'list') {
        return (
            <div className="group flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b26] p-4 hover:border-blue-600/50 hover:shadow-md transition-all shadow-xs">
                {/* Thumbnail */}
                <Link 
                    href={`/buyer/products/${product.id}`}
                    className="w-full sm:w-36 h-32 bg-slate-50 dark:bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer block border border-slate-100 dark:border-transparent"
                >
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-xs text-slate-500">Foto belum tersedia</span>
                    )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1 w-full">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                            <span className={`text-[11px] font-semibold tracking-tight ${badgeColor}`}>
                                {badgeText}
                            </span>
                        </div>
                        <Link 
                            href={`/buyer/products/${product.id}`}
                            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug line-clamp-1 block"
                        >
                            {product.name}
                        </Link>
                        {product.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                {product.description}
                            </p>
                        )}
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div>
                        <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {formatRupiah(product.price)}
                        </span>
                        {product.unit && (
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {' '}/ {product.unit}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdding || product.cart_enabled === false}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#086f8e] hover:bg-[#065b75] text-white flex items-center justify-center gap-1.5 active:scale-[0.98] transition-colors disabled:opacity-70 shadow-xs"
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Menambahkan...</span>
                            </>
                        ) : isAdded ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Sudah di Keranjang</span>
                            </>
                        ) : (
                            <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>{product.cart_enabled === false ? 'Belum tersedia' : 'Tambah'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-3 sm:p-3.5 hover:border-blue-600/60 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-blue-950/30 transition-all duration-200 shadow-sm">
            
            {/* 1. Thumbnail Container (White Rounded Box seperti di Desain Figma) */}
            <Link 
                href={`/buyer/products/${product.id}`}
                className="w-full h-36 sm:h-40 bg-slate-50 dark:bg-white rounded-xl p-3 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer block border border-slate-100 dark:border-transparent"
            >
                {product.image_url ? <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                /> : <span className="text-xs text-slate-500">Foto belum tersedia</span>}
            </Link>

            {/* 2. Card Content */}
            <div className="flex flex-col flex-1 pt-3">
                
                {/* Status Badge */}
                <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                    <span className={`text-[11px] font-semibold tracking-tight ${badgeColor}`}>
                        {badgeText}
                    </span>
                </div>

                {/* Product Name (Linked to Detail Page) */}
                <Link 
                    href={`/buyer/products/${product.id}`}
                    className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug line-clamp-2 min-h-[2.4rem] block"
                >
                    {product.name}
                </Link>

                {/* Price & Unit */}
                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {formatRupiah(product.price)}
                    </span>
                    {product.unit && (
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            / {product.unit}
                        </span>
                    )}
                </div>

                {/* Tags (B2B & Faktur Pajak) */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* 3. Action Button: + Tambah ke Keranjang */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || product.cart_enabled === false}
                    className="mt-4 w-full py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#086f8e] hover:bg-[#065b75] text-white flex items-center justify-center gap-1.5 active:scale-[0.98] transition-colors disabled:opacity-70 shadow-xs"
                >
                    {isAdding ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Menambahkan...</span>
                        </>
                    ) : isAdded ? (
                        <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Sudah di Keranjang</span>
                        </>
                    ) : (
                        <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>{product.cart_enabled === false ? 'Keranjang belum tersedia' : 'Tambah ke Keranjang'}</span>
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}

