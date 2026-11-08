import { useState, useMemo, useEffect } from 'react';
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
import ThemeToggle from '@/Components/Common/ThemeToggle';

/**
 * Database dummy lengkap untuk fallback katalog produk B2B CV. Putra Nugraha.
 * Backend dapat menyuplai prop `product` dari Controller secara dinamis.
 */
const PRODUCTS_DATABASE = {
    1: {
        id: 1,
        name: 'Server HPE ProLiant ML30 Gen10 - Intel Xeon E-2224 16GB RAM 1TB SATA',
        sku: 'PN-HPE-ML30G10',
        brand: 'Hewlett Packard Enterprise',
        warranty: 'Garansi Resmi 3 Tahun',
        warranty_badge_top: '3 Tahun',
        warranty_badge_sub: 'GARANSI RESMI',
        category: 'Hardware & Server',
        category_id: 'hardware',
        stock: 12,
        base_price: 32500000,
        unit: 'unit',
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tax_badge: 'B2B • S&K Pajak Aktif (Faktur Pajak)',
        tier_prices: [
            { min: 1, max: 2, price: 32500000, label: '1 - 2 Unit: Rp 32.500.000' },
            { min: 3, max: 5, price: 31750000, label: '3 - 5 Unit: Rp 31.750.000' },
            { min: 6, max: null, price: null, label: '≥ 6 Unit (Proyek): Harga Khusus RFQ' },
        ],
        default_procurement_label: 'Hanya Unit Hardware',
        installation_price: 1500000,
        installation_label: '+ Paket Instalasi & Setup Server di Lokasi (+Rp 1.500.000)',
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
        datasheet_title: 'Datasheet Resmi HPE ProLiant ML30 Gen10',
        datasheet_size: 'PDF • 2.4 MB',
        warranty_title: 'Garansi Resmi HPE Enterprise Indonesia',
        warranty_desc: 'Garansi 3 Tahun mencakup penggantian suku cadang (Parts), perbaikan (Labor), dan dukungan teknis langsung di lokasi perusahaan Anda (Onsite Next Business Day).',
    },
    2: {
        id: 2,
        name: 'Paket Jasa Instalasi Jaringan LAN Kantor (10 Titik Integrasi)',
        sku: 'PN-SRV-LAN10P',
        brand: 'Layanan Resmi CV. Putra Nugraha',
        warranty: 'Garansi Pemeliharaan 6 Bulan',
        warranty_badge_top: '6 Bulan',
        warranty_badge_sub: 'GARANSI SERVIS',
        category: 'Jasa Instalasi & Servis',
        category_id: 'services',
        stock: 50,
        base_price: 8500000,
        unit: 'paket',
        stock_status: 'official_service',
        badge_label: 'Jasa Resmi',
        tax_badge: 'B2B • Faktur Pajak Resmi',
        tier_prices: [
            { min: 1, max: 2, price: 8500000, label: '1 - 2 Paket: Rp 8.500.000' },
            { min: 3, max: 5, price: 8100000, label: '3 - 5 Paket: Rp 8.100.000' },
            { min: 6, max: null, price: null, label: '≥ 6 Paket (Proyek): Harga Khusus RFQ' },
        ],
        default_procurement_label: 'Paket Standar Instalasi 10 Titik',
        installation_price: 750000,
        installation_label: '+ Uji Sertifikasi Fluke Networks & Dokumentasi As-Built (+Rp 750.000)',
        images: [
            '/images/product-lan-services.png',
            '/images/service-technician-lan.png',
        ],
        specifications: [
            { label: 'Cakupan Pekerjaan', value: 'Penarikan kabel UTP Cat6 10 titik, crimping RJ45, labelling & patch panel' },
            { label: 'Material Termasuk', value: 'Modular Jack Cat6, Faceplate 10 pcs, Patch Cord 1m & 2m' },
            { label: 'Pengujian & Sertifikasi', value: 'Fluke Cable Analyzer Continuity & Wiremap Test Report' },
            { label: 'Estimasi Durasi', value: '2 - 3 Hari Kerja Onsite di Lokasi Klien' },
            { label: 'Tenaga Ahli', value: 'Teknisi Jaringan Tersertifikasi MTCNA / CCNA' },
            { label: 'Garansi Purna Jual', value: '6 Bulan Garansi Pemeliharaan & Troubleshooting Onsite' },
        ],
        datasheet_title: 'SOP & Scope of Work Instalasi Jaringan LAN Kantor',
        datasheet_size: 'PDF • 1.8 MB',
        warranty_title: 'Garansi Servis Resmi CV. Putra Nugraha',
        warranty_desc: 'Jaminan pemeliharaan purna instalasi selama 6 bulan, penanganan insiden kabel putus atau koneksi drop tanpa biaya tambahan.',
    },
    3: {
        id: 3,
        name: 'Cisco Catalyst Switch 24-Port Gigabit Managed',
        sku: 'PN-CSCO-24G',
        brand: 'Cisco Systems',
        warranty: 'Garansi Resmi 1 Tahun',
        warranty_badge_top: '1 Tahun',
        warranty_badge_sub: 'GARANSI RESMI',
        category: 'Networking & Router',
        category_id: 'networking',
        stock: 8,
        base_price: 15450000,
        unit: 'unit',
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tax_badge: 'B2B • S&K Pajak Aktif (Faktur Pajak)',
        tier_prices: [
            { min: 1, max: 2, price: 15450000, label: '1 - 2 Unit: Rp 15.450.000' },
            { min: 3, max: 5, price: 14900000, label: '3 - 5 Unit: Rp 14.900.000' },
            { min: 6, max: null, price: null, label: '≥ 6 Unit (Proyek): Harga Khusus RFQ' },
        ],
        default_procurement_label: 'Hanya Unit Switch Hardware',
        installation_price: 850000,
        installation_label: '+ Konfigurasi VLAN, Trunking & Pemasangan Rackmount (+Rp 850.000)',
        images: [
            '/images/product-cisco-switch.png',
        ],
        specifications: [
            { label: 'Port Configuration', value: '24x 10/100/1000 Gigabit Ethernet + 4x 1G SFP' },
            { label: 'Switching Capacity', value: '56 Gbps Full Wire-Speed' },
            { label: 'Forwarding Rate', value: '41.66 Mpps' },
            { label: 'Form Factor', value: '1U Rackmount (Include Rack Ear Kit)' },
            { label: 'Management', value: 'Web UI, CLI via Console, SNMP v1/v2/v3' },
            { label: 'Garansi', value: '1 Tahun Garansi Resmi Cisco Indonesia' },
        ],
        datasheet_title: 'Datasheet Cisco Catalyst 24-Port Managed Switch',
        datasheet_size: 'PDF • 3.1 MB',
        warranty_title: 'Garansi Resmi Cisco Enterprise Indonesia',
        warranty_desc: 'Garansi 1 tahun penggantian unit (RMA hardware) dan akses download update firmware resmi.',
    },
    4: {
        id: 4,
        name: 'Ubiquiti UniFi AP AC Pro Dual-Band Gigabit Access Point',
        sku: 'PN-UBNT-UAPACPRO',
        brand: 'Ubiquiti Networks',
        warranty: 'Garansi Resmi 1 Tahun',
        warranty_badge_top: '1 Tahun',
        warranty_badge_sub: 'GARANSI RESMI',
        category: 'Networking & Router',
        category_id: 'networking',
        stock: 24,
        base_price: 2450000,
        unit: 'unit',
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tax_badge: 'B2B • Faktur Pajak Resmi',
        tier_prices: [
            { min: 1, max: 4, price: 2450000, label: '1 - 4 Unit: Rp 2.450.000' },
            { min: 5, max: 10, price: 2350000, label: '5 - 10 Unit: Rp 2.350.000' },
            { min: 11, max: null, price: null, label: '≥ 11 Unit: Harga Khusus RFQ' },
        ],
        default_procurement_label: 'Hanya Unit Access Point',
        installation_price: 350000,
        installation_label: '+ Setup UniFi Controller & Multi-SSID Guest (+Rp 350.000)',
        images: [
            '/images/product-ubiquiti-ap.png',
        ],
        specifications: [
            { label: 'Wi-Fi Standards', value: '802.11 a/b/g/n/ac Dual-Band (3x3 MIMO)' },
            { label: 'Speed Throughput', value: 'Up to 1300 Mbps (5GHz) + 450 Mbps (2.4GHz)' },
            { label: 'Ethernet Ports', value: '2x 10/100/1000 Gigabit Ethernet' },
            { label: 'Power Method', value: '802.3af PoE / 802.3at PoE+' },
            { label: 'Environment', value: 'Indoor / Outdoor Weatherproof' },
            { label: 'Garansi', value: '1 Tahun Garansi Resmi Distributor' },
        ],
        datasheet_title: 'Datasheet Ubiquiti UniFi AP AC Pro',
        datasheet_size: 'PDF • 1.5 MB',
        warranty_title: 'Garansi Resmi Ubiquiti Distributor Indonesia',
        warranty_desc: 'Garansi ganti unit 1 tahun jika terjadi kerusakan hardware non-human-error.',
    },
    5: {
        id: 5,
        name: 'Kabel UTP Cat6 Belden 305m (1 Roll Original)',
        sku: 'PN-BLD-7814A',
        brand: 'Belden Original',
        warranty: 'Garansi 100% Original',
        warranty_badge_top: '100%',
        warranty_badge_sub: 'ORIGINAL',
        category: 'Aksesoris IT',
        category_id: 'accessories',
        stock: 35,
        base_price: 3100000,
        unit: 'roll',
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tax_badge: 'B2B • Faktur Pajak Resmi',
        tier_prices: [
            { min: 1, max: 2, price: 3100000, label: '1 - 2 Roll: Rp 3.100.000' },
            { min: 3, max: 5, price: 2980000, label: '3 - 5 Roll: Rp 2.980.000' },
            { min: 6, max: null, price: null, label: '≥ 6 Roll: Harga Khusus RFQ' },
        ],
        default_procurement_label: 'Hanya Material Roll Kabel',
        installation_price: 500000,
        installation_label: '+ Jasa Penarikan Kabel di Jalur Tray / Conduit (+Rp 500.000)',
        images: [
            '/images/product-belden-cable.png',
        ],
        specifications: [
            { label: 'Kategori', value: 'UTP Category 6 (Unshielded Twisted Pair)' },
            { label: 'Panjang per Roll', value: '305 Meter (1.000 Feet)' },
            { label: 'Ukuran Konduktor', value: '23 AWG Solid Bare Copper' },
            { label: 'Frekuensi Maksimal', value: 'Up to 250 MHz' },
            { label: 'Jacket Material', value: 'PVC Flame Retardant' },
            { label: 'Standardisasi', value: 'ANSI/TIA-568-C.2, ISO/IEC 11801' },
        ],
        datasheet_title: 'Spesifikasi Teknis Kabel UTP Cat6 Belden 7814A',
        datasheet_size: 'PDF • 950 KB',
        warranty_title: 'Jaminan Keaslian Produk Belden',
        warranty_desc: 'Sertifikasi keaslian tembaga murni 100% Belden original dengan barcode hologram resmi.',
    },
};

// Aliases agar id 101-104 juga berfungsi konsisten
PRODUCTS_DATABASE[101] = PRODUCTS_DATABASE[3];
PRODUCTS_DATABASE[102] = PRODUCTS_DATABASE[2];
PRODUCTS_DATABASE[103] = PRODUCTS_DATABASE[4];
PRODUCTS_DATABASE[104] = PRODUCTS_DATABASE[5];

export default function ProductDetail({ 
    product: serverProduct, 
    related_products: serverRelatedProducts,
    cartCount: serverCartCount = 0,
    id 
}) {
    const { props } = usePage();
    const auth = props?.auth;

    // Resolusi produk aktif secara dinamis berdasarkan prop `id` atau `serverProduct`
    const currentId = Number(id || serverProduct?.id || 1);
    const defaultProduct = PRODUCTS_DATABASE[currentId] || PRODUCTS_DATABASE[1];
    const product = serverProduct || defaultProduct;

    // Gallery state
    const [activeImage, setActiveImage] = useState(product.images?.[0] || '/images/detail-server-main.png');
    
    // Auto sync gambar aktif ketika id produk berubah
    useEffect(() => {
        if (product.images?.[0]) {
            setActiveImage(product.images[0]);
        }
    }, [product.id]);

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

    // Filter produk pelengkap (rekomendasi) agar produk yang sedang dibuka tidak muncul dobel
    const relatedProducts = useMemo(() => {
        if (serverRelatedProducts && serverRelatedProducts.length > 0) {
            return serverRelatedProducts.filter(p => Number(p.id) !== Number(product.id));
        }
        return [
            PRODUCTS_DATABASE[1],
            PRODUCTS_DATABASE[2],
            PRODUCTS_DATABASE[3],
            PRODUCTS_DATABASE[4],
            PRODUCTS_DATABASE[5],
        ].filter(p => Number(p.id) !== Number(product.id)).slice(0, 4);
    }, [serverRelatedProducts, product.id]);

    // Hitung harga satuan berdasarkan tier quantity dinamis
    const unitPrice = useMemo(() => {
        if (!product?.tier_prices || product.tier_prices.length === 0) {
            return product?.base_price || 0;
        }
        if (quantity >= 6) {
            return product.tier_prices[2]?.price || Math.round((product.base_price || 0) * 0.95);
        } else if (quantity >= 3) {
            return product.tier_prices[1]?.price || Math.round((product.base_price || 0) * 0.975);
        }
        return product.base_price || 0;
    }, [quantity, product]);

    // Hitung total estimasi subtotal
    const subtotal = useMemo(() => {
        const productTotal = unitPrice * quantity;
        const installationTotal = includeInstallation ? ((product.installation_price || 0) * quantity) : 0;
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
                setCartCount(prev => prev + quantity);
                setTimeout(() => setIsAdded(false), 2500);
            },
            onError: () => {
                setIsAdding(false);
                setIsAdded(true);
                setCartCount(prev => prev + quantity);
                setTimeout(() => setIsAdded(false), 2500);
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title={`${product.name} — CV. Putra Nugraha`} />

            {/* ========================================================= */}
            {/* HEADER NAVBAR & CATEGORY SUB-NAV */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#12161F] backdrop-blur transition-colors duration-150">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 lg:px-8 h-16 sm:h-20">
                    
                    {/* Brand Identity / Logo */}
                    <Link href="/portal" className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
                        <img
                            src="/images/logo-pn.png"
                            alt="Logo CV. Putra Nugraha"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase truncate">
                                <span className="sm:hidden">CV. PN</span>
                                <span className="hidden sm:inline">CV. PUTRA NUGRAHA</span>
                            </span>
                            <span className="hidden sm:inline text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                Perdagangan Barang dan Jasa
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari produk hardware, perangkat jaringan, atau layanan servis..."
                                className="w-full h-10 rounded-lg bg-slate-100 dark:bg-[#171B26] border border-slate-200 dark:border-slate-700/60 pl-4 pr-11 text-xs text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                <Search className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Right Actions: ThemeToggle, Keranjang & Akun */}
                    <div className="flex items-center gap-1.5 sm:gap-5 shrink-0">
                        <ThemeToggle />

                        <Link
                            href="/buyer/cart"
                            className="relative flex items-center gap-1.5 sm:gap-2 p-2 sm:p-0 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                            <span className="hidden sm:inline">Keranjang</span>
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
                                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Akun</span>
                            </button>

                            {accountMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-2 shadow-2xl space-y-1 text-xs z-50">
                                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                        <div className="font-bold text-slate-900 dark:text-white truncate">{auth?.user?.name || 'Klien B2B'}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{auth?.user?.email || 'klien@instansi.co.id'}</div>
                                    </div>
                                    <Link
                                        href="/buyer/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Dashboard Pengadaan</span>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-left"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        <span>Keluar (Logout)</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Category Sub-nav dengan Smooth Horizontal Scroll di Mobile */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#12161F]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-start md:justify-between py-2.5 sm:py-3 overflow-x-auto text-xs font-medium text-slate-600 dark:text-slate-300 gap-6 sm:gap-8 scrollbar-none no-scrollbar whitespace-nowrap">
                            {categories.map((cat) => {
                                const IconComponent = cat.icon;
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/portal?kategori=${cat.id}`}
                                        className="shrink-0 flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        <IconComponent className="h-4 w-4 text-slate-400 dark:text-slate-400" />
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
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
                            />
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
                            ) : (
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
                            )}

                            {/* Slot cadangan jika gambar tunggal agar susunan grid 4 kolom tetap rapi */}
                            {product.images && product.images.length === 1 && (
                                <>
                                    <div className="h-14 sm:h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-1 flex flex-col items-center justify-center text-center shadow-sm">
                                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 dark:text-emerald-400 mb-0.5" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white leading-tight">100% Asli</span>
                                        <span className="text-[7px] sm:text-[8px] text-slate-500 dark:text-slate-400 uppercase">Resmi CV</span>
                                    </div>
                                    <div className="h-14 sm:h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2434] p-1 flex flex-col items-center justify-center text-center shadow-sm">
                                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mb-0.5" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white leading-tight">Faktur Pajak</span>
                                        <span className="text-[7px] sm:text-[8px] text-blue-600 dark:text-blue-400 uppercase font-semibold">PPN 11%</span>
                                    </div>
                                </>
                            )}

                            {/* Slot 4: Warranty Badge Box (Sesuai Desain Figma) */}
                            <div className="h-14 sm:h-16 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-[#1E2434] p-1 flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mb-0.5" />
                                <span className="text-[10px] sm:text-[11px] font-bold text-blue-900 dark:text-white leading-tight">
                                    {product.warranty_badge_top || '3 Tahun'}
                                </span>
                                <span className="text-[7px] sm:text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                                    {product.warranty_badge_sub || 'GARANSI RESMI'}
                                </span>
                            </div>
                        </div>

                        {/* Official Product Guarantee Note */}
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Produk resmi • Garansi Parts, Labor, Onsite</span>
                        </div>

                    </div>

                    {/* 2. MIDDLE COLUMN: PRODUCT SPEC & SELECTION (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Status Badges */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium badge-sage">
                                <span className={`h-1.5 w-1.5 rounded-full ${product.stock_status === 'ready_stock' ? 'dot-sage' : 'dot-azure'}`} />
                                <span>
                                    {product.badge_label || (product.stock_status === 'ready_stock' ? 'Ready Stock' : 'Jasa Resmi')}
                                </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium badge-azure">
                                {product.tax_badge || 'B2B • S&K Pajak Aktif (Faktur Pajak)'}
                            </span>
                        </div>

                        {/* Product Title */}
                        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                            {product.name}
                        </h1>

                        {/* SKU & Brand Metadata */}
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            SKU: <span className="text-slate-700 dark:text-slate-300 font-medium">{product.sku}</span> | Brand: <span className="text-slate-700 dark:text-slate-300 font-medium">{product.brand}</span> | <span className="text-slate-700 dark:text-slate-300 font-medium">{product.warranty}</span>
                        </p>

                        {/* Price Display */}
                        <div className="pt-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {formatRupiah(product.base_price)}
                                </span>
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                    / {product.unit || 'unit'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Harga sudah termasuk PPN 11% (Faktur Pajak Resmi)
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
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 text-blue-900 dark:text-white shadow-sm' 
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="procurement_mode"
                                        checked={!includeInstallation}
                                        onChange={() => setIncludeInstallation(false)}
                                        className="text-blue-600 focus:ring-0 bg-transparent border-slate-300 dark:border-slate-600 cursor-pointer"
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
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 text-blue-900 dark:text-white shadow-sm' 
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="procurement_mode"
                                        checked={includeInstallation}
                                        onChange={() => setIncludeInstallation(true)}
                                        className="text-blue-600 focus:ring-0 bg-transparent border-slate-300 dark:border-slate-600 cursor-pointer"
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
                                        disabled={quantity <= 1}
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
                                        disabled={quantity >= product.stock}
                                        className="h-8 w-8 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="text-[11px] font-medium text-emerald-600 dark:text-[#8cd4b4]">
                                    Stok Tersedia: {product.stock} {product.unit || 'Unit'}
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
                                    disabled={isAdding}
                                    className="w-full py-2.5 rounded-lg text-xs font-semibold btn-primary-bespoke flex items-center justify-center gap-1.5 active:scale-[0.98]"
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
                                    className="w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-amber-500/60 dark:border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 text-center"
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
                                    ? 'text-blue-600 dark:text-blue-400 font-bold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            Spesifikasi Teknis Lengkap
                            {activeTab === 'specs' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setActiveTab('datasheet')}
                            className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'datasheet' 
                                    ? 'text-blue-600 dark:text-blue-400 font-bold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Unduh Brosur / Datasheet PDF</span>
                            {activeTab === 'datasheet' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setActiveTab('warranty')}
                            className={`pb-3 transition-colors relative whitespace-nowrap ${
                                activeTab === 'warranty' 
                                    ? 'text-blue-600 dark:text-blue-400 font-bold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            Info Garansi &amp; Layanan Servis
                            {activeTab === 'warranty' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* Tab 1: Spesifikasi Teknis Lengkap */}
                    {activeTab === 'specs' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#171B26] overflow-hidden divide-y divide-slate-200 dark:divide-slate-800/80 text-xs sm:text-sm shadow-sm">
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
                    {activeTab === 'datasheet' && (
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
                    {activeTab === 'warranty' && (
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
                        <div>
                            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Produk &amp; Layanan Pelengkap Infrastruktur Server
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Perangkat pendukung integrasi jaringan dan instalasi siap pesan.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {relatedProducts.map((p) => (
                            <ProductCard 
                                key={p.id} 
                                product={p}
                                onAddToCart={() => {
                                    setCartCount(prev => prev + 1);
                                }}
                            />
                        ))}
                    </div>
                </section>

            </main>

            {/* ========================================================= */}
            {/* FOOTER B2B CORPORATE 4 KOLOM                              */}
            {/* ========================================================= */}
            <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12161F] text-slate-500 dark:text-slate-400 text-xs transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        
                        {/* Col 1: Brand & Profil Perusahaan */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo-pn.png"
                                    alt="Logo CV. Putra Nugraha"
                                    className="h-9 w-9 rounded-lg object-contain"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                                        CV. PUTRA NUGRAHA -
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Perdagangan Barang dan Jasa
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Pengadaan perangkat IT dan layanan profesional untuk mendukung kebutuhan perusahaan Anda.
                            </p>
                        </div>

                        {/* Col 2: Panduan Pengadaan B2B */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Panduan Pengadaan B2B
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link href="/panduan/cara-belanja" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Cara Belanja &amp; Pengajuan RFQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/faktur-pajak" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Ketentuan Faktur Pajak
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/pembayaran" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Pembayaran &amp; Pengiriman
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/panduan/garansi" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                        Garansi &amp; Layanan Purnajual
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Layanan Pelanggan & WhatsApp Hotline */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Layanan Pelanggan
                            </h4>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                <Phone className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                <a 
                                    href="https://wa.me/6281320777874" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                                >
                                    (+62) 813-2077-7874
                                </a>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Hubungi tim kami untuk konsultasi produk, penawaran, dan status pengadaan.
                            </p>
                            <div>
                                <a
                                    href="https://wa.me/6281320777874"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    <span>Konsultasikan kebutuhan Anda</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Col 4: Alamat Kantor */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Alamat Kantor
                            </h4>
                            <div className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Melayani kebutuhan barang dan jasa IT perusahaan.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar / Copyright */}
                <div className="border-t border-slate-200 dark:border-slate-800/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                        <p>© 2026 CV. Putra Nugraha. All Right Reserved.</p>
                        <p className="hidden sm:block">Perdagangan Barang dan Jasa</p>
                    </div>
                </div>
            </footer>

            {/* ========================================================= */}
            {/* FLOATING WHATSAPP BUTTON (Responsif & Rapi di Mobile)     */}
            {/* ========================================================= */}
            <a
                href="https://wa.me/6281320777874"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Konsultasi Pengadaan via WhatsApp"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center h-11 w-11 sm:h-13 sm:w-13 p-2.5 sm:p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl shadow-emerald-950/60 transition-transform duration-200 hover:scale-110 active:scale-95"
            >
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 fill-current">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
            </a>

        </div>
    );
}
