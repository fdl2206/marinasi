import { useState, useMemo, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Wrench, 
    ShieldCheck, 
    Check, 
    Plus, 
    Minus, 
    FileText, 
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Download
} from 'lucide-react';
import ProductCard, { formatRupiah } from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';

export default function ProductDetail({ 
    product,
    related_products: relatedProducts = [],
    cartCount: serverCartCount = 0,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    // Gallery state
    const [activeImage, setActiveImage] = useState(product.images?.[0] || null);
    
    // Auto sync gambar aktif ketika id produk berubah
    useEffect(() => {
        setActiveImage(product.images?.[0] || null);
        setQuantity(Math.max(1, product.moq || 1));
        setIncludeInstallation(false);
        setIsAdded(false);
    }, [product.id, product.images?.[0]]);

    // Procurement configuration state
    const [quantity, setQuantity] = useState(Math.max(1, product.moq || 1));
    const [includeInstallation, setIncludeInstallation] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [activeTab, setActiveTab] = useState('specs');
    const [cartCount, setCartCount] = useState(serverCartCount);

    const unitPrice = product.base_price;

    // Hitung total estimasi subtotal
    const subtotal = useMemo(() => {
        if (unitPrice === null) return null;
        const productTotal = unitPrice * quantity;
        const installationTotal = includeInstallation ? ((product.installation_price || 0) * quantity) : 0;
        return productTotal + installationTotal;
    }, [unitPrice, quantity, includeInstallation, product.installation_price]);

    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const next = Math.max(product.moq || 1, prev + delta);
            return product.stock === null ? next : Math.min(Number(product.stock), next);
        });
    };

    const handleAddToCart = () => {
        if (product.cart_enabled === false || isAdding) return;
        setIsAdding(true);
        router.post('/buyer/cart', {
            product_id: product.id,
            quantity: quantity,
            include_installation: includeInstallation,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdding(false);
                setIsAdded(true);
                setCartCount(prev => prev + quantity);
                setTimeout(() => setIsAdded(false), 2500);
            },
            onError: () => {
                setIsAdding(false);
                setIsAdded(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title={`${product.name} — CV. Putra Nugraha`} />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <BuyerNavbar cartCount={cartCount} />

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
                
                {/* Responsive Breadcrumb Navigation */}
                {/* 1. Mobile Version: Clean Back Pill Button (Mencegah teks patah berbaris-baris) */}
                <div className="flex sm:hidden items-center justify-between gap-2">
                    <Link 
                        href="/portal" 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Kembali ke Portal</span>
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1 rounded-md bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 truncate max-w-[150px]">
                        {product.category || 'Katalog B2B'}
                    </span>
                </div>

                {/* 2. Tablet & Desktop Version: Complete Breadcrumb Hierarchy */}
                <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-hidden whitespace-nowrap">
                    <Link href="/portal" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 shrink-0">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Portal</span>
                    </Link>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <Link href={`/portal?kategori=${product.category_id || 'all'}`} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">
                        {product.category || 'Katalog B2B'}
                    </Link>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span className="text-slate-900 dark:text-white font-medium truncate">
                        {product.name}
                    </span>
                </nav>

                {/* ===================================================== */}
                {/* SECTION 1: PRODUCT OVERVIEW, GALLERY & ORDER BOX      */}
                {/* ===================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* 1. LEFT COLUMN: IMAGE GALLERY (4 Cols) */}
                    <div className="lg:col-span-4 space-y-3.5">
                        
                        {/* Main Image Box (White Rounded Container Sesuai Figma) */}
                        <div className="w-full h-72 sm:h-96 bg-white dark:bg-[#171B26] rounded-2xl p-6 flex items-center justify-center overflow-hidden shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 transition-colors">
                            {activeImage ? <img
                                src={activeImage}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
                            /> : <span className="text-sm text-slate-500">Foto belum tersedia</span>}
                        </div>

                        {/* Thumbnails Row + Warranty Badge */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                            {product.images && product.images.length > 1 ? (
                                product.images.slice(0, 3).map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImage(img)}
                                        className={`h-14 sm:h-16 rounded-xl bg-white dark:bg-[#171B26] p-1.5 flex items-center justify-center border-2 transition-all overflow-hidden ${
                                            activeImage === img ? 'border-blue-600 shadow-md shadow-blue-500/20' : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} thumb ${idx + 1}`}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </button>
                                ))
                            ) : product.images?.length === 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveImage(product.images?.[0] || activeImage)}
                                    className="h-14 sm:h-16 rounded-xl bg-white dark:bg-[#171B26] p-1.5 flex items-center justify-center border-2 border-blue-600 shadow-md shadow-blue-500/20 overflow-hidden"
                                >
                                    <img
                                        src={product.images?.[0] || activeImage}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </button>
                            ) : null}

                            {/* Slot cadangan jika gambar tunggal agar susunan grid 4 kolom tetap rapi */}
                            {product.images && product.images.length === 1 && (
                                <>
                                    <div className="h-14 sm:h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-1 flex flex-col items-center justify-center text-center shadow-sm">
                                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 dark:text-emerald-400 mb-0.5" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white leading-tight">Foto produk</span>
                                        <span className="text-[7px] sm:text-[8px] text-slate-500 dark:text-slate-400 uppercase">Katalog</span>
                                    </div>
                                    <div className="h-14 sm:h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-1 flex flex-col items-center justify-center text-center shadow-sm">
                                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mb-0.5" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white leading-tight">Informasi</span>
                                        <span className="text-[7px] sm:text-[8px] text-blue-600 dark:text-blue-400 uppercase font-semibold">Hubungi penjual</span>
                                    </div>
                                </>
                            )}

                            {/* Slot 4: Warranty Badge Box (Sesuai Desain Figma) */}
                            <div className="h-14 sm:h-16 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-[#1E2434] p-1 flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mb-0.5" />
                                <span className="text-[10px] sm:text-[11px] font-bold text-blue-900 dark:text-white leading-tight">
                                    {product.warranty_badge_top || 'Belum tersedia'}
                                </span>
                                <span className="text-[7px] sm:text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                                    {product.warranty_badge_sub || 'Informasi garansi'}
                                </span>
                            </div>
                        </div>

                        {/* Official Product Guarantee Note */}
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>{product.warranty || 'Informasi garansi belum tersedia.'}</span>
                        </div>

                    </div>

                    {/* 2. MIDDLE COLUMN: PRODUCT SPEC & SELECTION (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Status Badges */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium badge-sage">
                                <span className={`h-1.5 w-1.5 rounded-full ${product.stock_status === 'ready_stock' ? 'dot-sage' : 'dot-azure'}`} />
                                <span>
                                    {product.badge_label}
                                </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium badge-azure">
                                {product.type === 'goods' ? 'Barang' : 'Jasa'}
                            </span>
                        </div>

                        {/* Product Title */}
                        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                            {product.name}
                        </h1>

                        {/* SKU & Brand Metadata */}
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            SKU: <span className="text-slate-700 dark:text-slate-300 font-medium">{product.sku || 'Belum diisi'}</span>
                        </p>

                        {/* Price Display */}
                        <div className="pt-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {formatRupiah(product.base_price)}
                                </span>
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                    {product.unit ? '/ ' + product.unit : ''}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Ketentuan pajak belum tersedia.
                            </p>
                        </div>

                        {/* Tiered / Volume Pricing Box (B2B Grosir Sesuai Figma) */}
                        {product.tier_prices && product.tier_prices.length > 0 && (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-[#0a162e] p-3 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 text-center">
                                {product.tier_prices.map((tier, idx) => (
                                    <div key={idx} className="px-2">
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{tier.label?.split(':')[0] || `Tier ${idx + 1}`}:</div>
                                        <div className={`text-xs font-bold mt-0.5 ${tier.price ? 'text-blue-900 dark:text-white' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {tier.price ? formatRupiah(tier.price) : (tier.label?.split(':')[1]?.trim() || 'Harga Khusus RFQ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Procurement Custom Option Selector */}
                        {product.installation_label && (
                            <div className="pt-2 space-y-2.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    PILIH KEBUTUHAN PENGADAAN
                                </label>
                                
                                {/* Option 1: Hardware Only / Default Paket */}
                                <label
                                    onClick={() => setIncludeInstallation(false)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        !includeInstallation 
                                            ? 'border-[#086f8e] bg-[#086f8e]/10 text-slate-900 dark:text-white shadow-xs' 
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="procurement_mode"
                                        checked={!includeInstallation}
                                        onChange={() => setIncludeInstallation(false)}
                                        className="text-[#086f8e] focus:ring-0 bg-transparent border-slate-300 dark:border-slate-600 cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold">
                                        {product.default_procurement_label || 'Hanya Unit Perangkat'}
                                    </span>
                                </label>

                                {/* Option 2: Add-on Installation / Servis */}
                                <label
                                    onClick={() => setIncludeInstallation(true)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        includeInstallation 
                                            ? 'border-[#086f8e] bg-[#086f8e]/10 text-slate-900 dark:text-white shadow-xs' 
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="procurement_mode"
                                        checked={includeInstallation}
                                        onChange={() => setIncludeInstallation(true)}
                                        className="text-[#086f8e] focus:ring-0 bg-transparent border-slate-300 dark:border-slate-600 cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold">
                                        {product.installation_label}
                                    </span>
                                </label>
                            </div>
                        )}

                    </div>

                    {/* 3. RIGHT COLUMN: STICKY PROCUREMENT & ORDER BOX (3 Cols) */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-5 sticky top-24 shadow-sm dark:shadow-xl transition-colors">
                            
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                Atur Pengadaan &amp; Pesanan
                            </h3>

                            {/* Quantity Stepper */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500 dark:text-slate-400">
                                    Jumlah {product.unit || 'unit'}
                                </label>
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 p-1">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= (product.moq || 1) || Number(product.stock) === 0 && product.stock !== null}
                                        className="h-8 w-8 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={product.stock !== null && quantity >= Number(product.stock)}
                                        className="h-8 w-8 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="text-[11px] font-medium text-emerald-600 dark:text-[#8cd4b4]">
                                    {product.stock === null ? 'Ketersediaan belum dikonfirmasi' : 'Stok tercatat: ' + product.stock + ' ' + (product.unit || '')}
                                </div>
                            </div>

                            {/* Subtotal Calculation */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Estimasi Subtotal:
                                </span>
                                <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    {formatRupiah(subtotal)}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isAdding || product.cart_enabled === false}
                                    className="w-full py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#086f8e] hover:bg-[#065b75] text-white flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-xs"
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

                                <Link
                                    href={`/buyer/rfq/create?product_id=${product.id}&quantity=${quantity}`}
                                    className="w-full py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-[#086f8e] text-[#086f8e] dark:text-cyan-400 hover:bg-[#086f8e]/10 text-center"
                                >
                                    Buat Pengajuan RFQ / Unduh SPH
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>

                {/* ===================================================== */}
                {/* SECTION 2: TABS SPESIFIKASI, DATASHEET & GARANSI      */}
                {/* ===================================================== */}
                <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                    
                    {/* Tabs Navigation Header */}
                    <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none no-scrollbar">
                        <button 
                            type="button" 
                            onClick={() => setActiveTab('specs')}
                            className={`pb-3 transition-colors relative whitespace-nowrap ${
                                activeTab === 'specs' 
                                    ? 'text-[#086f8e] dark:text-cyan-400 font-bold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            Spesifikasi Teknis Lengkap
                            {activeTab === 'specs' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#086f8e] dark:bg-cyan-400 rounded-full" />
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setActiveTab('datasheet')}
                            className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'datasheet' 
                                    ? 'text-[#086f8e] dark:text-cyan-400 font-bold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Unduh Brosur / Datasheet PDF</span>
                            {activeTab === 'datasheet' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#086f8e] dark:bg-cyan-400 rounded-full" />
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setActiveTab('warranty')}
                            className={`pb-3 transition-colors relative whitespace-nowrap ${
                                activeTab === 'warranty' 
                                    ? 'text-[#086f8e] dark:text-cyan-400 font-bold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            Info Garansi &amp; Layanan Servis
                            {activeTab === 'warranty' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#086f8e] dark:bg-cyan-400 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* Tab 1: Spesifikasi Teknis Lengkap */}
                    {activeTab === 'specs' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#171B26] overflow-hidden divide-y divide-slate-200 dark:divide-slate-800/80 text-xs sm:text-sm shadow-sm">
                            {product.specifications.length === 0 && <p className="p-5 text-slate-500">Spesifikasi belum tersedia.</p>}
                            {(product.specifications || []).map((item, idx) => (
                                <div 
                                    key={item.label} 
                                    className={`grid grid-cols-1 sm:grid-cols-12 px-5 sm:px-6 py-3.5 sm:py-4 transition-colors ${
                                        idx % 2 === 0 ? 'bg-white dark:bg-[#171B26]' : 'bg-slate-50/80 dark:bg-[#171B26]/60'
                                    }`}
                                >
                                    <span className="sm:col-span-4 font-semibold text-slate-600 dark:text-slate-300">
                                        {item.label}
                                    </span>
                                    <span className="sm:col-span-8 text-slate-900 dark:text-white font-medium mt-1 sm:mt-0">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab 2: Unduh Brosur / Datasheet PDF */}
                    {activeTab === 'datasheet' && !product.datasheet_url && <p className="text-sm text-slate-500">Datasheet belum tersedia.</p>}
                    {activeTab === 'datasheet' && product.datasheet_url && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#171B26] p-5 sm:p-8 space-y-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-3 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {product.datasheet_title || `Datasheet Resmi ${product.name}`}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Format: {product.datasheet_size || 'PDF • 2.4 MB'} • Versi Bahasa Indonesia &amp; Inggris
                                        </p>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 max-w-lg leading-relaxed">
                                            Dokumen spesifikasi teknis lengkap dari produsen untuk kelengkapan administrasi pengadaan barang B2B, audit, atau lampiran proposal tender.
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="/images/hero-datacenter-clean.jpg"
                                    download={`${product.name.replace(/\s+/g, '-').slice(0, 30)}.pdf`}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition shrink-0"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Unduh Datasheet</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Info Garansi & Layanan Servis */}
                    {activeTab === 'warranty' && !product.warranty_desc && <p className="text-sm text-slate-500">Informasi garansi belum tersedia.</p>}
                    {activeTab === 'warranty' && product.warranty_desc && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 text-xs sm:text-sm shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>{product.warranty_title || `Garansi Resmi ${product.brand}`}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                        {product.warranty_desc || `${product.warranty} mencakup jaminan kualitas operasional, kelengkapan administrasi faktur pajak, dan pendampingan klaim suku cadang.`}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                        <Wrench className="h-5 w-5" />
                                        <span>Layanan Servis CV. Putra Nugraha</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                        Pendampingan setup awal perangkat, instalasi on-site oleh teknisi tersertifikasi, serta trouble-ticketing prioritas untuk klien kontrak pengadaan B2B.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </section>

                {/* ===================================================== */}
                {/* SECTION 3: PRODUK PELENGKAP INFRASTRUKTUR SERVER      */}
                {/* ===================================================== */}
                <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Produk &amp; Layanan Pelengkap Infrastruktur Server
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {relatedProducts.length === 0 && <p className="col-span-full text-sm text-slate-500">Belum ada produk terkait.</p>}
                        {relatedProducts.map((p) => (
                            <ProductCard 
                                key={p.id} 
                                product={p}
                            />
                        ))}
                    </div>
                </section>

            </main>

            {/* ========================================================= */}
            {/* FOOTER B2B CORPORATE 4 KOLOM & WA HOTLINE                 */}
            {/* ========================================================= */}
            <BuyerFooter />

        </div>
    );
}
