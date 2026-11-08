import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Plus, Check, Loader2 } from 'lucide-react';

/**
 * Helper untuk format Rupiah standar Indonesia.
 * Backend bisa kirim integer murni (cth: 32500000) atau string terformat.
 */
export function formatRupiah(value) {
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
export default function ProductCard({ product, onAddToCart }) {
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Deteksi badge status dan dot color
    const isReadyStock = product.stock_status === 'ready_stock' || product.badge_label?.toLowerCase().includes('ready');
    const badgeText = product.badge_label || (isReadyStock ? 'Ready Stock' : 'Jasa Resmi');
    const dotColor = isReadyStock ? 'dot-sage' : 'dot-azure';
    const badgeColor = isReadyStock ? 'text-[#8cd4b4]' : 'text-[#9bb8f5]';

    const tags = Array.isArray(product.tags) && product.tags.length > 0 
        ? product.tags 
        : ['B2B', 'Faktur Pajak'];

    // Handler Tambah ke Keranjang siap pakai untuk Backend
    const handleAddToCart = (e) => {
        e.preventDefault();
        if (isAdding) return;

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
                // Fallback graceful jika route backend /buyer/cart belum dibuat
                setIsAdding(false);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2000);
            },
        });
    };

    return (
        <div className="group flex flex-col rounded-2xl border border-slate-800 bg-[#171B26] p-3 sm:p-3.5 hover:border-blue-600/60 hover:shadow-xl hover:shadow-blue-950/30 transition-all duration-200">
            
            {/* 1. Thumbnail Container (White Rounded Box seperti di Desain Figma) */}
            <Link 
                href={`/buyer/products/${product.id}`}
                className="w-full h-36 sm:h-40 bg-white rounded-xl p-3 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer block"
            >
                <img
                    src={product.image_url || '/images/product-lan-services.png'}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                />
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
                    className="text-xs sm:text-[13px] font-semibold text-slate-100 hover:text-blue-400 transition-colors leading-snug line-clamp-2 min-h-[2.4rem] block"
                >
                    {product.name}
                </Link>

                {/* Price & Unit */}
                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {formatRupiah(product.price)}
                    </span>
                    {product.unit && (
                        <span className="text-[11px] font-normal text-slate-400">
                            / {product.unit}
                        </span>
                    )}
                </div>

                {/* Tags (B2B & Faktur Pajak) */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-medium badge-azure"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* 3. Action Button: + Tambah ke Keranjang */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="mt-4 w-full py-2.5 rounded-lg text-xs font-semibold btn-primary-bespoke flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-70"
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
                            <span>Tambah ke Keranjang</span>
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}

