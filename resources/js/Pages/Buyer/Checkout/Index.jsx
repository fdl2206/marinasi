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
    MapPin, 
    ShieldCheck, 
    Check, 
    Copy, 
    Printer, 
    FileText, 
    Phone, 
    ArrowRight,
    Loader2
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function CheckoutIndex({ orderSummary: serverSummary, buyerInfo: serverBuyerInfo }) {
    const { props } = usePage();
    const auth = props?.auth;

    // Delivery & Shipping Selection
    const [shippingMethod, setShippingMethod] = useState('mitra_courier'); // 'mitra_courier' | 'pickup'
    
    // Payment Method Selection
    const [paymentMethod, setPaymentMethod] = useState('va'); // 'va' | 'manual_transfer'
    const [selectedBank, setSelectedBank] = useState('mandiri'); // 'mandiri' | 'bca' | 'bni'
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

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

    // VA Details based on selected bank
    const vaNumbers = {
        mandiri: '8808-081320777874',
        bca: '3901-081320777874',
        bni: '9880-081320777874',
    };

    const currentVaNumber = vaNumbers[selectedBank] || vaNumbers.mandiri;

    // Calculations
    const totalAmount = serverSummary?.total || 71900000;
    const dppAmount = Math.round(totalAmount / 1.11);
    const ppnAmount = totalAmount - dppAmount;

    const handleCopyVA = () => {
        navigator.clipboard.writeText(currentVaNumber.replace(/-/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirmPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentSuccess(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Pembayaran & Konfirmasi Pesanan — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR & CATEGORY SUB-NAV */}
            {/* ========================================================= */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#12161F] backdrop-blur transition-colors duration-150">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 lg:px-8 h-16 sm:h-20">
                    
                    {/* Brand Logo */}
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
                            className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-0 text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                            <span className="hidden sm:inline">Keranjang</span>
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
                            Pembayaran &amp; Konfirmasi Pesanan
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Pastikan alamat pengiriman dan pilih metode pembayaran untuk menyelesaikan pengadaan.
                        </p>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-[#1E2434] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600/30">
                        Faktur Pajak PPN 11%
                    </span>
                </div>

                {/* 2-Column Checkout Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: ADDRESS & PAYMENT METHOD (8 COLS) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* CARD 1: ALAMAT PENGIRIMAN & EKSPEDISI KANTOR */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm">
                            <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                Alamat Pengiriman &amp; Ekspedisi Kantor
                            </h2>

                            {/* Recipient Address Box (Sesuai Mockup) */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12] p-4 space-y-1.5">
                                <div className="flex items-start gap-2.5">
                                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                            Penerima: PT Maju Jaya Teknologi (Attn: Budi Santoso - 08123456789)
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            Jl. Asia Afrika No. 128, Gedung Menara Lt. 5, Kota Bandung, Jawa Barat 40111
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Method Radios */}
                            <div className="space-y-2.5 pt-1">
                                
                                {/* Option 1: Kurir Logistik CV. Putra Nugraha (Selected) */}
                                <label
                                    onClick={() => setShippingMethod('mitra_courier')}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                        shippingMethod === 'mitra_courier'
                                            ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-600/10 text-slate-900 dark:text-white'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="shipping_method"
                                        checked={shippingMethod === 'mitra_courier'}
                                        onChange={() => setShippingMethod('mitra_courier')}
                                        className="text-blue-600 focus:ring-0 bg-transparent border-slate-400"
                                    />
                                    <span className="text-xs font-semibold">
                                        Kurir Logistik Ekspedisi Mitra CV. Putra Nugraha (Free / Area Bandung)
                                    </span>
                                </label>

                                {/* Option 2: Pickup */}
                                <label
                                    onClick={() => setShippingMethod('pickup')}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                        shippingMethod === 'pickup'
                                            ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-600/10 text-slate-900 dark:text-white'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="shipping_method"
                                        checked={shippingMethod === 'pickup'}
                                        onChange={() => setShippingMethod('pickup')}
                                        className="text-blue-600 focus:ring-0 bg-transparent border-slate-400"
                                    />
                                    <span className="text-xs font-semibold">
                                        Ambil Sendiri di Kantor (Jl. Cinangka Kavling 2, Ujung Berung)
                                    </span>
                                </label>

                            </div>

                        </div>

                        {/* CARD 2: PILIH METODE PEMBAYARAN REKANAN B2B */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm">
                            <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                Pilih Metode Pembayaran Rekanan B2B
                            </h2>

                            <div className="space-y-3">
                                
                                {/* Option 1: Virtual Account (Selected) */}
                                <div
                                    className={`rounded-xl border transition-all overflow-hidden ${
                                        paymentMethod === 'va'
                                            ? 'border-blue-500 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-600/5'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12]'
                                    }`}
                                >
                                    <label
                                        onClick={() => setPaymentMethod('va')}
                                        className="flex items-center gap-3 p-4 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === 'va'}
                                            onChange={() => setPaymentMethod('va')}
                                            className="text-blue-600 focus:ring-0 bg-transparent border-slate-400"
                                        />
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Virtual Account Bank Mandiri / BCA / BNI (Verifikasi Otomatis)
                                        </span>
                                    </label>

                                    {/* Expanded VA Bank Selector & Account Details */}
                                    {paymentMethod === 'va' && (
                                        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-200 dark:border-slate-800/80">
                                            
                                            {/* Bank Selector Pills */}
                                            <div className="flex items-center gap-2.5">
                                                {[
                                                    { id: 'mandiri', label: 'mandiri' },
                                                    { id: 'bca', label: 'BCA' },
                                                    { id: 'bni', label: '▶ BNI' },
                                                ].map((bank) => (
                                                    <button
                                                        key={bank.id}
                                                        type="button"
                                                        onClick={() => setSelectedBank(bank.id)}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                                                            selectedBank === bank.id
                                                                ? 'bg-blue-600 text-white shadow-sm'
                                                                : 'bg-white dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        {bank.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* VA Number & Verification Box */}
                                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C0D12] p-3.5 space-y-1.5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                                                        No. VA: <span className="text-blue-600 dark:text-blue-400 font-bold">{currentVaNumber}</span>{' '}
                                                        <span className="text-slate-500 dark:text-slate-400 font-sans">(Atas Nama: CV Putra Nugraha)</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyVA}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 transition"
                                                    >
                                                        {copied ? <Check className="h-3 w-3 text-emerald-600 dark:text-[#76C19F]" /> : <Copy className="h-3 w-3" />}
                                                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-[#8cd4b4] font-medium">
                                                    <Check className="h-3 w-3 text-emerald-600 dark:text-[#76C19F]" />
                                                    <span>Siap menerima pembayaran • Verifikasi otomatis</span>
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>

                                {/* Option 2: Transfer Bank Manual */}
                                <div
                                    className={`rounded-xl border transition-all overflow-hidden ${
                                        paymentMethod === 'manual_transfer'
                                            ? 'border-blue-500 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-600/5'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12]'
                                    }`}
                                >
                                    <label
                                        onClick={() => setPaymentMethod('manual_transfer')}
                                        className="flex items-center gap-3 p-4 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === 'manual_transfer'}
                                            onChange={() => setPaymentMethod('manual_transfer')}
                                            className="text-blue-600 focus:ring-0 bg-transparent border-slate-400"
                                        />
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Transfer Bank Manual (Rekening Resmi Perusahaan)
                                        </span>
                                    </label>

                                    {paymentMethod === 'manual_transfer' && (
                                        <div className="px-4 pb-4 pt-1 space-y-2 text-xs border-t border-slate-200 dark:border-slate-800/80">
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Silakan transfer ke rekening giro resmi perusahaan:
                                            </p>
                                            <div className="p-3 rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 space-y-1">
                                                <div className="font-bold text-slate-900 dark:text-white">Bank Mandiri: 131-00-1234567-8</div>
                                                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Atas Nama: CV. Putra Nugraha</div>
                                            </div>
                                            <p className="text-[11px] text-slate-500">
                                                *Kirimkan bukti setor/transfer ke finance melalui WhatsApp resmi untuk penerbitan kuitansi resmi &amp; BAST.
                                            </p>
                                        </div>
                                    )}
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT COLUMN: STICKY ORDER SUMMARY (4 COLS) */}
                    <div className="lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-5 sticky top-24 shadow-sm dark:shadow-xl">
                            
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                    Ringkasan Pembayaran Pesanan
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Total 3 Item Barang &amp; Jasa
                                </p>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-3 pt-1 text-xs">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                    <span>Subtotal Produk:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {formatRupiah(totalAmount)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>Biaya Pengiriman &amp; Instalasi:</span>
                                    <span className="text-emerald-600 dark:text-[#8cd4b4] font-medium">
                                        Rp 0 (Gratis)
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>Dasar Pengenaan Pajak (DPP):</span>
                                    <span className="text-slate-700 dark:text-slate-300">{formatRupiah(dppAmount)}</span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>PPN 11% (Faktur Pajak):</span>
                                    <span className="text-slate-700 dark:text-slate-300">{formatRupiah(ppnAmount)}</span>
                                </div>
                            </div>

                            {/* Total Pembayaran Box (Sesuai Mockup) */}
                            <div className="rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Total Pembayaran
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {formatRupiah(totalAmount)}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Faktur Pajak PPN 11%
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2.5 pt-1">
                                
                                {paymentSuccess ? (
                                    <div className="p-4 rounded-xl badge-sage text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-[#8cd4b4] font-bold text-xs">
                                            <Check className="h-4 w-4" />
                                            <span>Pesanan Berhasil Dikonfirmasi!</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                            Invoice &amp; instruksi VA telah dikirimkan ke email PIC Anda.
                                        </p>
                                        <Link
                                            href="/buyer/dashboard"
                                            className="inline-block mt-1 text-xs font-semibold text-blue-600 dark:text-[#9bb8f5] hover:underline"
                                        >
                                            Buka Dashboard Pengadaan →
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleConfirmPayment}
                                            disabled={isProcessing}
                                            className="w-full py-3 rounded-lg btn-primary-bespoke text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Memproses Pembayaran...</span>
                                                </>
                                            ) : (
                                                <span>Bayar Sekarang &amp; Konfirmasi Pesanan</span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="w-full py-3 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <Printer className="h-3.5 w-3.5" />
                                            <span>Cetak Invoice / Unduh PO Resmi (PDF)</span>
                                        </button>
                                    </>
                                )}

                            </div>

                            {/* Security SSL & Factur Pajak Guarantee */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                        Transaksi aman dilindungi enkripsi SSL. Bukti bayar dan e-Faktur akan dikirimkan ke email PIC perusahaan.
                                    </p>
                                </div>
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

