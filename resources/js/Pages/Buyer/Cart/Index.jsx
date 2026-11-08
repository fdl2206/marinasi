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
    Plus, 
    Minus, 
    Trash2, 
    FileText, 
    ShieldCheck, 
    Phone, 
    MapPin, 
    ArrowRight,
    Check,
    Download
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import ThemeToggle from '@/Components/Common/ThemeToggle';

/**
 * Data default keranjang pengadaan B2B sesuai mockup Figma.
 * Backend dapat langsung mengirimkan prop `cart_items` dari CartController / Database.
 */
const DEFAULT_CART_ITEMS = [
    {
        id: 1,
        product_id: 1,
        name: 'Server HPE ProLiant ML30 Gen10 - Xeon E-2224 16GB RAM',
        sku: 'PN-SRV-ML30G10',
        price: 32500000,
        unit: 'unit',
        quantity: 1,
        stock: 12,
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tax_badge: 'Faktur Pajak Aktif',
        image_url: '/images/product-server-hpe.png',
        selected: true,
    },
    {
        id: 2,
        product_id: 101,
        name: 'Cisco Catalyst Switch 24-Port Gigabit',
        sku: 'PN-CSCO-24G',
        price: 15450000,
        unit: 'unit',
        quantity: 2,
        stock: 8,
        stock_status: 'ready_stock',
        badge_label: 'Ready Stock',
        tax_badge: 'B2B',
        image_url: '/images/product-cisco-switch.png',
        selected: true,
    },
    {
        id: 3,
        product_id: 102,
        name: 'Paket Jasa Instalasi Jaringan LAN Kantor (10 Titik)',
        sku: 'PN-SRV-LAN10',
        price: 8500000,
        unit: 'paket',
        quantity: 1,
        stock: 99,
        stock_status: 'official_service',
        badge_label: 'Jasa Resmi CV. Putra Nugraha',
        tax_badge: null,
        image_url: '/images/service-technician-lan.png',
        selected: true,
    },
];

export default function CartIndex({ cart_items: serverCartItems }) {
    const { props } = usePage();
    const auth = props?.auth;

    // Cart Items State
    const [items, setItems] = useState(serverCartItems || DEFAULT_CART_ITEMS);
    
    // Procurement & Tax Form Data (Backend-ready)
    const [prReference, setPrReference] = useState('');
    const [companyNpwp, setCompanyNpwp] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');

    // Voucher code state
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherApplied, setVoucherApplied] = useState(false);

    // Navbar state
    const [searchQuery, setSearchQuery] = useState('');
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const categories = [
        { id: 'hardware', name: 'Hardware', icon: Server },
        { id: 'networking', name: 'Networking & Router', icon: Network },
        { id: 'services', name: 'Jasa Instalasi & Servis', icon: Wrench },
        { id: 'accessories', name: 'Aksesoris IT', icon: HardDrive },
        { id: 'procurement', name: 'Paket Pengadaan Kantor', icon: Briefcase },
    ];

    // Checkbox toggles
    const allSelected = useMemo(() => items.length > 0 && items.every(i => i.selected), [items]);
    
    const toggleSelectAll = () => {
        const nextState = !allSelected;
        setItems(prev => prev.map(item => ({ ...item, selected: nextState })));
    };

    const toggleSelectItem = (id) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const handleQuantityChange = (id, delta) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const nextQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
                return { ...item, quantity: nextQty };
            }
            return item;
        }));
    };

    const handleRemoveSelected = () => {
        setItems(prev => prev.filter(item => !item.selected));
    };

    // Selected items metrics
    const selectedItems = useMemo(() => items.filter(i => i.selected), [items]);
    const totalUnits = useMemo(() => selectedItems.reduce((acc, curr) => acc + curr.quantity, 0), [selectedItems]);

    // Financial calculations (PPN 11% Inklusif)
    const totalPrice = useMemo(() => {
        return selectedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    }, [selectedItems]);

    // DPP = Total / 1.11
    const dppAmount = useMemo(() => {
        return Math.round(totalPrice / 1.11);
    }, [totalPrice]);

    // PPN 11% = Total - DPP
    const ppnAmount = useMemo(() => {
        return totalPrice - dppAmount;
    }, [totalPrice, dppAmount]);

    const handleApplyVoucher = (e) => {
        e.preventDefault();
        if (!voucherCode.trim()) return;
        setVoucherApplied(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Keranjang Pengadaan B2B — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR & CATEGORY SUB-NAV */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#12161F] backdrop-blur transition-colors duration-150">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 lg:px-8 h-16 sm:h-20">
                    
                    {/* Brand Logo */}
                    <Link href="/portal" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
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

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari produk hardware, perangkat jaringan, atau layanan servis..."
                                className="w-full h-10 rounded-lg bg-slate-100 dark:bg-white border border-slate-200 dark:border-transparent pl-4 pr-11 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                <Search className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-5 shrink-0">
                        <ThemeToggle />

                        <Link
                            href="/buyer/cart"
                            className="relative flex items-center gap-1.5 sm:gap-2 p-2 sm:p-0 text-xs font-semibold text-blue-600 dark:text-blue-400"
                        >
                            <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="hidden sm:inline">Keranjang</span>
                            {items.length > 0 && (
                                <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                    {items.length}
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

                {/* Sub-nav */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#12161F]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-start md:justify-between py-2.5 sm:py-3 overflow-x-auto text-xs font-medium text-slate-600 dark:text-slate-300 gap-6 sm:gap-8 scrollbar-none no-scrollbar whitespace-nowrap">
                            {categories.map((cat) => {
                                const IconComponent = cat.icon;
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/portal?kategori=${cat.id}`}
                                        className="shrink-0 flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
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
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Page Title & PPN Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Keranjang Pengadaan
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Tinjau produk, lengkapi data pengadaan, lalu pilih checkout atau penawaran resmi.
                        </p>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-[#1E2434] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600/30">
                        Faktur Pajak PPN 11%
                    </span>
                </div>

                {/* 2-Column Cart Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: ITEM LIST & PROCUREMENT FORM (8 COLS) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Select All Bar */}
                        <div className="flex items-center justify-between px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-xs shadow-sm">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    Pilih Semua ({items.length} Produk &amp; Layanan)
                                </span>
                            </label>

                            {selectedItems.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleRemoveSelected}
                                    className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition font-medium"
                                >
                                    Hapus Pilihan
                                </button>
                            )}
                        </div>

                        {/* Cart Items List */}
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] space-y-3 shadow-sm">
                                    <ShoppingCart className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Keranjang Pengadaan Kosong</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Belum ada barang atau jasa yang ditambahkan ke keranjang pengadaan.
                                    </p>
                                    <Link
                                        href="/portal"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                                    >
                                        Buka Katalog Pengadaan
                                    </Link>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Item Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={item.selected}
                                                onChange={() => toggleSelectItem(item.id)}
                                                className="h-4 w-4 mt-1 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />

                                            {/* Thumbnail Image Box */}
                                            <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-50 dark:bg-white rounded-xl p-2 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700/50">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0 space-y-2">
                                                
                                                {/* Title & SKU */}
                                                <div>
                                                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                                                        {item.name}
                                                    </h3>
                                                    {item.sku && (
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                            SKU: {item.sku}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Badges */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {item.stock_status === 'ready_stock' ? (
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium badge-sage">
                                                            <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                            <span>Ready Stock</span>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium badge-azure">
                                                            {item.badge_label}
                                                        </span>
                                                    )}

                                                    {item.tax_badge && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-[#1E2434] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600/30">
                                                            {item.tax_badge}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Price, Stepper & Subtotal Row */}
                                                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
                                                    <div>
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            {item.unit === 'paket' ? 'Harga per paket:' : 'Harga satuan:'}
                                                        </span>
                                                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                            {formatRupiah(item.price)}
                                                            {item.unit === 'paket' && <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400"> / paket</span>}
                                                        </div>
                                                    </div>

                                                    {/* Quantity Stepper & Item Subtotal */}
                                                    <div className="flex items-center justify-between sm:justify-end gap-5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">Jumlah</span>
                                                            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 p-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuantityChange(item.id, -1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="h-6 w-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </button>
                                                                <span className="font-bold text-xs text-slate-900 dark:text-white px-2.5">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuantityChange(item.id, 1)}
                                                                    disabled={item.quantity >= item.stock}
                                                                    className="h-6 w-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block sm:hidden">Subtotal</span>
                                                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                                {formatRupiah(item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Informasi Pengadaan & Pajak Card (Sesuai Mockup) */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>Informasi Pengadaan &amp; Pajak</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor Referensi PR / Proyek (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={prReference}
                                        onChange={(e) => setPrReference(e.target.value)}
                                        placeholder="Contoh: PR/IT/2026/001"
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        NPWP Perusahaan (Untuk Penerbitan e-Faktur Pajak)
                                    </label>
                                    <input
                                        type="text"
                                        value={companyNpwp}
                                        onChange={(e) => setCompanyNpwp(e.target.value)}
                                        placeholder="Masukkan NPWP perusahaan"
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Catatan Khusus Pengiriman / Jadwal Instalasi
                                </label>
                                <textarea
                                    rows="3"
                                    value={deliveryNotes}
                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                    placeholder="Tambahkan alamat tujuan, PIC penerima, atau jadwal instalasi yang diinginkan."
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: STICKY ORDER SUMMARY (4 COLS) */}
                    <div className="lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-5 sticky top-24 shadow-sm dark:shadow-xl">
                            
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                    Ringkasan Pengadaan B2B
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {selectedItems.length} produk &amp; layanan dipilih • {totalUnits} unit/paket
                                </p>
                            </div>

                            {/* Voucher / Kontrak Input */}
                            <form onSubmit={handleApplyVoucher} className="space-y-2">
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value)}
                                    placeholder="Kode Voucher / Kontrak Mitra"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-2 rounded-lg bg-slate-100 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition"
                                >
                                    Terapkan
                                </button>
                                {voucherApplied && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                        ✓ Kode kontrak mitra aktif
                                    </p>
                                )}
                            </form>

                            {/* Cost Breakdown */}
                            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                    <span>Total Harga ({selectedItems.length} Item):</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {formatRupiah(totalPrice)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>DPP (Dasar Pengenaan Pajak):</span>
                                    <span className="text-slate-700 dark:text-slate-300">{formatRupiah(dppAmount)}</span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>PPN 11% (Faktur Pajak Resmi):</span>
                                    <span className="text-slate-700 dark:text-slate-300">
                                        {formatRupiah(ppnAmount)}{' '}
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">(Termasuk)</span>
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>Estimasi Pengiriman &amp; Survei:</span>
                                    <span className="text-emerald-600 dark:text-[#8cd4b4] font-medium">
                                        Gratis <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(Area Bandung)</span>
                                    </span>
                                </div>
                            </div>

                            {/* Total Tagihan Box */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Total Tagihan
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {formatRupiah(totalPrice)}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Faktur Pajak PPN 11%
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2.5 pt-1">
                                <Link
                                    href="/buyer/checkout"
                                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center text-center active:scale-[0.98]"
                                >
                                    Lanjut ke Checkout / Bayar Langsung
                                </Link>

                                <Link
                                    href="/buyer/rfq/create?source=cart"
                                    className="w-full py-3 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold shadow-md transition-all flex items-center justify-center text-center active:scale-[0.98]"
                                >
                                    Unduh Draft SPH / Ajukan RFQ (PDF)
                                </Link>
                            </div>

                            {/* Document & Tax Legal Guarantee Notice */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                        Dokumen Faktur Pajak, Invoice, &amp; BAST diterbitkan resmi oleh CV. Putra Nugraha.
                                    </p>
                                </div>
                                <p className="pl-6 text-slate-400 dark:text-slate-500">
                                    Bantuan WhatsApp: (+62) 813-2077-7874
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

            </main>

            {/* ========================================================= */}
            {/* FOOTER PORTAL B2B */}
            {/* ========================================================= */}
            <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12161F] text-slate-500 dark:text-slate-400 mt-20 transition-colors duration-150">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Col 1 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo-pn.png"
                                    alt="Logo CV. Putra Nugraha"
                                    className="h-9 w-9 rounded-lg object-contain"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white">
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

                        {/* Col 2 */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
                                            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3 */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Layanan Pelanggan
                            </h4>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    (+62) 813-2077-7874
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Hubungi tim kami untuk konsultasi produk, penawaran, dan status pengadaan.
                            </p>
                            <div>
                                <a
                                    href="https://wa.me/6281320777874"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                                >
                                    <span>Konsultasikan kebutuhan Anda</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Col 4 */}
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

                {/* Bottom Bar */}
                <div className="border-t border-slate-200 dark:border-slate-800/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                        <p>© 2026 CV. Putra Nugraha. All Right Reserved.</p>
                        <p className="hidden sm:block">Perdagangan Barang dan Jasa</p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Widget */}
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

