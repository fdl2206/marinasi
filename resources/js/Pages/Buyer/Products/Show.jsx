import { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
    User, 
    Server, 
    Network, 
    Wrench, 
    HardDrive, 
    Briefcase, 
    LogOut, 
    LayoutDashboard,
    ShieldCheck, 
    Check, 
    Plus, 
    Minus, 
    FileText, 
    Phone, 
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Download,
    ExternalLink,
    MapPin,
    ArrowRight
} from 'lucide-react';
import ProductCard, { formatRupiah } from '@/Components/Buyer/ProductCard';

/**
 * Data default produk server HPE ML30 Gen10 sesuai mockup Figma.
 * Backend dapat mengirimkan data produk melalui prop `product` dari controller.
 */
const DEFAULT_PRODUCT = {
    id: 1,
    name: 'Server HPE ProLiant ML30 Gen10 - Intel Xeon E-2224 16GB RAM 1TB SATA',
    sku: 'PN-HPE-ML30G10',
    brand: 'Hewlett Packard Enterprise',
    warranty: 'Garansi Resmi 3 Tahun',
    category: 'Hardware & Server',
    category_id: 'hardware',
    stock: 12,
    base_price: 32500000,
    tier_prices: [
        { min: 1, max: 2, price: 32500000, label: '1 - 2 Unit: Rp 32.500.000' },
        { min: 3, max: 5, price: 31750000, label: '3 - 5 Unit: Rp 31.750.000' },
        { min: 6, max: null, price: null, label: '≥ 6 Unit (Proyek): Harga Khusus RFQ' },
    ],
    installation_price: 1500000,
    images: [
        '/images/detail-server-main.png',
        '/images/detail-server-t2.png',
        '/images/detail-server-t3.png',
    ],
    specifications: [
        { label: 'Processor', value: 'Intel Xeon E-2224 3.4GHz' },
        { label: 'Memory', value: '16GB DDR4 UDIMM' },
        { label: 'Storage', value: '2× 1TB SATA 7.2K LFF' },
        { label: 'Network Controller', value: 'HPE Ethernet 1Gb 2-port' },
        { label: 'Power Supply', value: '350W ATX' },
        { label: 'Warranty', value: '3 Tahun Parts, Labor, Onsite' },
    ],
};

const DEFAULT_RELATED_PRODUCTS = [
    {
        id: 101,
        name: 'Cisco Catalyst Switch 24-Port',
        slug: 'cisco-catalyst-switch-24-port',
        price: 15450000,
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-cisco-switch.png',
    },
    {
        id: 102,
        name: 'Paket Jasa Instalasi Jaringan LAN Kantor',
        slug: 'paket-jasa-instalasi-jaringan-lan-kantor',
        price: 8500000,
        unit: 'paket',
        stock_status: 'official_service',
        badge_label: 'Jasa Resmi',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-lan-services.png',
    },
    {
        id: 103,
        name: 'Ubiquiti UniFi AP AC Pro',
        slug: 'ubiquiti-unifi-ap-ac-pro',
        price: 2450000,
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-ubiquiti-ap.png',
    },
    {
        id: 104,
        name: 'Kabel UTP Cat6 Belden 305m',
        slug: 'kabel-utp-cat6-belden-305m',
        price: 3100000,
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tags: ['B2B', 'Faktur Pajak'],
        image_url: '/images/product-belden-cable.png',
    },
];

export default function ProductDetail({ 
    product: serverProduct, 
    related_products: serverRelatedProducts,
    cartCount: serverCartCount = 0,
    id 
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const product = serverProduct || DEFAULT_PRODUCT;
    const relatedProducts = serverRelatedProducts && serverRelatedProducts.length > 0
        ? serverRelatedProducts
        : DEFAULT_RELATED_PRODUCTS;

    // Gallery state
    const [activeImage, setActiveImage] = useState(product.images?.[0] || '/images/detail-server-main.png');
    
    // Procurement configuration state
    const [quantity, setQuantity] = useState(1);
    const [includeInstallation, setIncludeInstallation] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [activeTab, setActiveTab] = useState('specs');
    const [cartCount, setCartCount] = useState(serverCartCount);

    // Navbar search & menu state
    const [searchQuery, setSearchQuery] = useState('');
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const categories = [
        { id: 'hardware', name: 'Hardware', icon: Server },
        { id: 'networking', name: 'Networking & Router', icon: Network },
        { id: 'services', name: 'Jasa Instalasi & Servis', icon: Wrench },
        { id: 'accessories', name: 'Aksesoris IT', icon: HardDrive },
        { id: 'procurement', name: 'Paket Pengadaan Kantor', icon: Briefcase },
    ];

    // Hitung harga satuan berdasarkan tier quantity
    const unitPrice = useMemo(() => {
        if (quantity >= 6) {
            return 31000000; // Harga tier estimasi RFQ
        } else if (quantity >= 3) {
            return 31750000;
        }
        return product.base_price;
    }, [quantity, product.base_price]);

    // Hitung total estimasi subtotal
    const subtotal = useMemo(() => {
        const productTotal = unitPrice * quantity;
        const installationTotal = includeInstallation ? (product.installation_price * quantity) : 0;
        return productTotal + installationTotal;
    }, [unitPrice, quantity, includeInstallation, product.installation_price]);

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, Math.min(product.stock, prev + delta)));
    };

    const handleAddToCart = () => {
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
                setTimeout(() => setIsAdded(false), 2500);
            },
            onError: () => {
                setIsAdding(false);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2500);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#070e1e] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
            <Head title={`${product.name} — CV. Putra Nugraha`} />

            {/* ========================================================= */}
            {/* HEADER NAVBAR & CATEGORY SUB-NAV */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#07132b]">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-20">
                    
                    {/* Brand Identity / Logo */}
                    <Link href="/portal" className="flex items-center gap-3 shrink-0">
                        <img
                            src="/images/logo-pn.png"
                            alt="Logo CV. Putra Nugraha"
                            className="h-10 w-10 rounded-lg object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-white uppercase">
                                CV. PUTRA NUGRAHA -
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">
                                Perdagangan Barang dan Jasa
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari produk hardware, perangkat jaringan, atau layanan servis..."
                                style={{ color: '#0f172a' }}
                                className="w-full h-10 rounded-lg bg-white border border-transparent pl-4 pr-11 text-xs !text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500">
                                <Search className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Right Actions: Keranjang & Akun */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link
                            href="/buyer/orders"
                            className="relative flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4 text-slate-300" />
                            <span>Keranjang</span>
                            {cartCount > 0 && (
                                <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Akun Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span>Akun</span>
                            </button>

                            {accountMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-[#0d1a38] p-2 shadow-2xl space-y-1 text-xs z-50">
                                    <div className="px-3 py-2 border-b border-slate-800">
                                        <div className="font-bold text-white truncate">{auth?.user?.name || 'Klien B2B'}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{auth?.user?.email || 'klien@instansi.co.id'}</div>
                                    </div>
                                    <Link
                                        href="/buyer/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Dashboard Pengadaan</span>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-left"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        <span>Keluar (Logout)</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Category Sub-nav */}
                <div className="border-t border-slate-800/80 bg-[#050c1e]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-between py-3 overflow-x-auto text-xs font-medium text-slate-300 gap-8">
                            {categories.map((cat) => {
                                const IconComponent = cat.icon;
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/portal?kategori=${cat.id}`}
                                        className="shrink-0 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                                    >
                                        <IconComponent className="h-4 w-4 text-slate-400" />
                                        <span>{cat.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-xs text-slate-400">
                    <Link href="/portal" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Portal</span>
                    </Link>
                    <span>/</span>
                    <span className="text-slate-300">Hardware &amp; Server</span>
                    <span>/</span>
                    <span className="text-white font-medium truncate max-w-xs sm:max-w-md">
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
                        <div className="w-full h-80 sm:h-96 bg-white rounded-2xl p-6 flex items-center justify-center overflow-hidden shadow-lg border border-slate-700/50">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
                            />
                        </div>

                        {/* Thumbnails Row + Warranty Badge */}
                        <div className="grid grid-cols-4 gap-2.5">
                            {/* Thumb 1 */}
                            <button
                                type="button"
                                onClick={() => setActiveImage(product.images?.[0] || '/images/detail-server-main.png')}
                                className={`h-16 rounded-xl bg-white p-1.5 flex items-center justify-center border-2 transition-all overflow-hidden ${
                                    activeImage === product.images?.[0] ? 'border-blue-500 shadow-md shadow-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={product.images?.[0] || '/images/detail-server-main.png'}
                                    alt="Front View"
                                    className="max-h-full max-w-full object-contain"
                                />
                            </button>

                            {/* Thumb 2 */}
                            <button
                                type="button"
                                onClick={() => setActiveImage(product.images?.[1] || '/images/detail-server-t2.png')}
                                className={`h-16 rounded-xl bg-white p-1.5 flex items-center justify-center border-2 transition-all overflow-hidden ${
                                    activeImage === product.images?.[1] ? 'border-blue-500 shadow-md shadow-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={product.images?.[1] || '/images/detail-server-t2.png'}
                                    alt="Rear View"
                                    className="max-h-full max-w-full object-contain"
                                />
                            </button>

                            {/* Thumb 3 */}
                            <button
                                type="button"
                                onClick={() => setActiveImage(product.images?.[2] || '/images/detail-server-t3.png')}
                                className={`h-16 rounded-xl bg-white p-1.5 flex items-center justify-center border-2 transition-all overflow-hidden ${
                                    activeImage === product.images?.[2] ? 'border-blue-500 shadow-md shadow-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={product.images?.[2] || '/images/detail-server-t3.png'}
                                    alt="Interior View"
                                    className="max-h-full max-w-full object-contain"
                                />
                            </button>

                            {/* Slot 4: Warranty Badge Box (Sesuai Desain Figma) */}
                            <div className="h-16 rounded-xl border border-blue-500/30 bg-[#0d1a38] p-1 flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="h-4 w-4 text-blue-400 mb-0.5" />
                                <span className="text-[11px] font-bold text-white leading-tight">
                                    3 Tahun
                                </span>
                                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-tight">
                                    GARANSI RESMI
                                </span>
                            </div>
                        </div>

                        {/* Official Product Guarantee Note */}
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                            <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                            <span>Produk resmi • Garansi Parts, Labor, Onsite</span>
                        </div>

                    </div>

                    {/* 2. MIDDLE COLUMN: PRODUCT DETAILS & PRICING (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Status Badges */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-400">
                                    Ready Stock
                                </span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#132247] text-blue-300 border border-blue-600/30">
                                B2B • S&amp;K Pajak Aktif (Faktur Pajak)
                            </span>
                        </div>

                        {/* Product Title */}
                        <h1 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight">
                            {product.name}
                        </h1>

                        {/* SKU & Brand Metadata */}
                        <p className="text-xs text-slate-400">
                            SKU: <span className="text-slate-300">{product.sku}</span> | Brand: <span className="text-slate-300">{product.brand}</span> | <span className="text-slate-300">{product.warranty}</span>
                        </p>

                        {/* Price Display */}
                        <div className="pt-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {formatRupiah(product.base_price)}
                                </span>
                                <span className="text-sm font-normal text-slate-400">
                                    / unit
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Harga sudah termasuk PPN 11% (Faktur Pajak Resmi)
                            </p>
                        </div>

                        {/* Tiered / Volume Pricing Box (B2B Grosir Sesuai Figma) */}
                        <div className="rounded-xl border border-slate-800 bg-[#0a162e] p-3 grid grid-cols-3 divide-x divide-slate-800 text-center">
                            <div className="px-2">
                                <div className="text-[11px] text-slate-400">1 - 2 Unit:</div>
                                <div className="text-xs font-bold text-white mt-0.5">Rp 32.500.000</div>
                            </div>
                            <div className="px-2">
                                <div className="text-[11px] text-slate-400">3 - 5 Unit:</div>
                                <div className="text-xs font-bold text-white mt-0.5">Rp 31.750.000</div>
                            </div>
                            <div className="px-2">
                                <div className="text-[11px] text-slate-400">≥ 6 Unit (Proyek):</div>
                                <div className="text-xs font-bold text-amber-400 mt-0.5">Harga Khusus RFQ</div>
                            </div>
                        </div>

                        {/* Procurement Custom Option Selector */}
                        <div className="pt-2 space-y-2.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                PILIH KEBUTUHAN PENGADAAN
                            </label>
                            
                            {/* Option 1: Hardware Only */}
                            <label
                                onClick={() => setIncludeInstallation(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    !includeInstallation 
                                        ? 'border-blue-600 bg-blue-600/10 text-white' 
                                        : 'border-slate-800 bg-[#0d1830] text-slate-300 hover:border-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="procurement_mode"
                                    checked={!includeInstallation}
                                    onChange={() => setIncludeInstallation(false)}
                                    className="text-blue-600 focus:ring-0 bg-transparent border-slate-600"
                                />
                                <span className="text-xs font-semibold">
                                    Hanya Unit Hardware
                                </span>
                            </label>

                            {/* Option 2: Hardware + Onsite Installation */}
                            <label
                                onClick={() => setIncludeInstallation(true)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    includeInstallation 
                                        ? 'border-blue-600 bg-blue-600/10 text-white' 
                                        : 'border-slate-800 bg-[#0d1830] text-slate-300 hover:border-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="procurement_mode"
                                    checked={includeInstallation}
                                    onChange={() => setIncludeInstallation(true)}
                                    className="text-blue-600 focus:ring-0 bg-transparent border-slate-600"
                                />
                                <span className="text-xs font-semibold">
                                    + Paket Instalasi &amp; Setup Server di Lokasi (+Rp 1.500.000)
                                </span>
                            </label>
                        </div>

                    </div>

                    {/* 3. RIGHT COLUMN: STICKY PROCUREMENT & ORDER BOX (3 Cols) */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-slate-800 bg-[#0d1830] p-5 space-y-5 sticky top-24 shadow-xl">
                            
                            <h3 className="font-bold text-white text-sm">
                                Atur Pengadaan &amp; Pesanan
                            </h3>

                            {/* Quantity Stepper */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-400">
                                    Jumlah unit
                                </label>
                                <div className="flex items-center justify-between rounded-lg bg-[#070e1e] border border-slate-800 p-1">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="h-8 w-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="font-bold text-sm text-white">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock}
                                        className="h-8 w-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="text-[11px] font-medium text-emerald-400">
                                    Stok Tersedia: {product.stock} Unit
                                </div>
                            </div>

                            {/* Subtotal Calculation */}
                            <div className="pt-2 border-t border-slate-800 space-y-1">
                                <span className="text-xs text-slate-400">
                                    Estimasi Subtotal:
                                </span>
                                <div className="text-xl font-extrabold text-white">
                                    {formatRupiah(subtotal)}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                                        isAdded 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
                                    }`}
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

                                <Link
                                    href={`/buyer/rfq/create?product_id=${product.id}&quantity=${quantity}`}
                                    className="w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-amber-500/50 text-amber-400 hover:bg-amber-400/10 text-center"
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
                <section className="space-y-6 pt-4 border-t border-slate-800/80">
                    
                    {/* Tabs Navigation Header */}
                    <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-800 text-xs sm:text-sm font-semibold overflow-x-auto">
                        <button 
                            type="button" 
                            onClick={() => setActiveTab('specs')}
                            className={`pb-3 transition-colors relative whitespace-nowrap ${
                                activeTab === 'specs' 
                                    ? 'text-blue-400 font-bold' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Spesifikasi Teknis Lengkap
                            {activeTab === 'specs' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setActiveTab('datasheet')}
                            className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'datasheet' 
                                    ? 'text-blue-400 font-bold' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Unduh Brosur / Datasheet PDF</span>
                            {activeTab === 'datasheet' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setActiveTab('warranty')}
                            className={`pb-3 transition-colors relative whitespace-nowrap ${
                                activeTab === 'warranty' 
                                    ? 'text-blue-400 font-bold' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Info Garansi &amp; Layanan Servis
                            {activeTab === 'warranty' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* Tab 1: Spesifikasi Teknis Lengkap */}
                    {activeTab === 'specs' && (
                        <div className="rounded-xl border border-slate-800/80 bg-[#0d1830] overflow-hidden divide-y divide-slate-800/80 text-xs sm:text-sm shadow-md">
                            {(product.specifications || []).map((item, idx) => (
                                <div 
                                    key={item.label} 
                                    className={`grid grid-cols-1 sm:grid-cols-12 px-5 sm:px-6 py-3.5 sm:py-4 transition-colors ${
                                        idx % 2 === 0 ? 'bg-[#0d1830]' : 'bg-[#0a152e]/60'
                                    }`}
                                >
                                    <span className="sm:col-span-4 font-semibold text-slate-300">
                                        {item.label}
                                    </span>
                                    <span className="sm:col-span-8 text-white font-medium mt-1 sm:mt-0">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab 2: Unduh Brosur / Datasheet PDF */}
                    {activeTab === 'datasheet' && (
                        <div className="rounded-xl border border-slate-800/80 bg-[#0d1830] p-6 sm:p-8 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#070e1e] border border-slate-800">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-3 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">
                                            Datasheet Resmi HPE ProLiant ML30 Gen10
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Format: PDF • Ukuran: 2.4 MB • Versi Bahasa Indonesia &amp; Inggris
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-2 max-w-lg leading-relaxed">
                                            Dokumen spesifikasi teknis lengkap dari produsen untuk kelengkapan administrasi pengadaan barang B2B, audit, atau lampiran proposal tender.
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="/images/hero-datacenter-clean.jpg"
                                    download="Datasheet-HPE-ProLiant-ML30-Gen10.pdf"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition shrink-0"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Unduh Datasheet</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Info Garansi & Layanan Servis */}
                    {activeTab === 'warranty' && (
                        <div className="rounded-xl border border-slate-800/80 bg-[#0d1830] p-6 space-y-5 text-xs sm:text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-[#070e1e] border border-slate-800 space-y-2">
                                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>Garansi Resmi HPE Indonesia</span>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Garansi 3 Tahun mencakup penggantian suku cadang (Parts), perbaikan (Labor), dan dukungan teknis langsung di lokasi perusahaan Anda (Onsite Next Business Day).
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#070e1e] border border-slate-800 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                        <Wrench className="h-5 w-5" />
                                        <span>Layanan Servis CV. Putra Nugraha</span>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Pendampingan setup awal RAID, instalasi OS Server, serta trouble-ticketing prioritas untuk klien kontrak B2B.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </section>

                {/* ===================================================== */}
                {/* SECTION 3: PRODUK PELENGKAP INFRASTRUKTUR SERVER      */}
                {/* ===================================================== */}
                <section className="space-y-6 pt-6 border-t border-slate-800/80">
                    <div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                            Produk &amp; Layanan Pelengkap Infrastruktur Server
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Perangkat jaringan dan aksesori pendukung operasional server perusahaan.
                        </p>
                    </div>

                    {/* Grid 4 Kartu Produk Pelengkap Sesuai Mockup */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {relatedProducts.map((relProduct) => (
                            <ProductCard
                                key={relProduct.id}
                                product={relProduct}
                                onAddToCart={() => setCartCount(prev => prev + 1)}
                            />
                        ))}
                    </div>
                </section>

            </main>

            {/* ========================================================= */}
            {/* FOOTER PORTAL B2B                                         */}
            {/* ========================================================= */}
            <footer className="border-t border-slate-800/80 bg-[#050c1e] mt-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Col 1: Brand & Desc */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo-pn.png"
                                    alt="Logo CV. Putra Nugraha"
                                    className="h-9 w-9 rounded-lg object-contain"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-tight text-white">
                                        CV. PUTRA NUGRAHA -
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        Perdagangan Barang dan Jasa
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Pengadaan perangkat IT dan layanan profesional untuk mendukung kebutuhan perusahaan Anda.
                            </p>
                        </div>

                        {/* Col 2: Panduan Pengadaan B2B */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Panduan Pengadaan B2B
                            </h4>
                            <ul className="space-y-2 text-xs">
                                {[
                                    { label: 'Cara Belanja & Pengajuan RFQ', href: '/buyer/rfq/create' },
                                    { label: 'Ketentuan Faktur Pajak', href: '#' },
                                    { label: 'Pembayaran & Pengiriman', href: '#' },
                                    { label: 'Garansi & Layanan Purnajual', href: '#' },
                                ].map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3: Layanan Pelanggan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Layanan Pelanggan
                            </h4>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                                <span className="text-sm font-bold text-white">
                                    (+62) 813-2077-7874
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Hubungi tim kami untuk konsultasi produk, penawaran, dan status pengadaan.
                            </p>
                            <div>
                                <a
                                    href="https://wa.me/6281320777874"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <span>Konsultasikan kebutuhan Anda</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Col 4: Alamat Kantor */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Alamat Kantor
                            </h4>
                            <div className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Melayani kebutuhan barang dan jasa IT perusahaan.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar / Copyright */}
                <div className="border-t border-slate-800/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                        <p>© 2026 CV. Putra Nugraha. All Right Reserved.</p>
                        <p className="hidden sm:block">Perdagangan Barang dan Jasa</p>
                    </div>
                </div>
            </footer>

            {/* ========================================================= */}
            {/* FLOATING WHATSAPP BUTTON (Sesuai Mockup)                  */}
            {/* ========================================================= */}
            <a
                href="https://wa.me/6281320777874"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Konsultasi Pengadaan via WhatsApp"
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-13 w-13 p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl shadow-emerald-950/60 transition-transform duration-200 hover:scale-110 active:scale-95"
            >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
            </a>

        </div>
    );
}

