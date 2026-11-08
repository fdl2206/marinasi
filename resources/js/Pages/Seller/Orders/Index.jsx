import { useState, useMemo } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Package, 
    Box, 
    CheckCircle2, 
    Clock, 
    Truck, 
    FileText, 
    Download, 
    Search, 
    CreditCard, 
    Calendar, 
    ChevronDown, 
    AlertCircle, 
    Printer, 
    ExternalLink, 
    X, 
    Check, 
    FileCheck2, 
    Plus, 
    Building2, 
    User, 
    MapPin,
    ArrowRight
} from 'lucide-react';

export default function SellerOrdersIndex() {
    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('this_month');

    // Modals
    const [activeDetailOrder, setActiveDetailOrder] = useState(null);
    const [activeSuratJalan, setActiveSuratJalan] = useState(null);
    const [activePoValidation, setActivePoValidation] = useState(null);
    const [manualOrderModalOpen, setManualOrderModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Orders Dataset
    const [orders, setOrders] = useState([
        {
            id: 'INV-0892',
            invoice_code: '#INV-PN-2026-0892',
            date: '28 Okt 2026',
            po_number: 'PO/MJT/IT/X/088',
            po_status: 'valid',
            client_name: 'PT Maju Jaya Teknologi',
            pic_name: 'Budi Santoso',
            pic_phone: '0812-3456-7890',
            address: 'Gedung Menara Lt. 5, Jl. Asia Afrika No. 128, Bandung',
            items: '1x Server HPE ML30 Gen10, 2x Cisco Switch, + Paket Jasa Instalasi LAN',
            items_breakdown: [
                { name: 'Server HPE ProLiant ML30 Gen10 (Xeon E-2224 / 16GB)', qty: 1, unit_price: 32500000 },
                { name: 'Cisco Catalyst Switch 24-Port Gigabit', qty: 2, unit_price: 15450000 },
                { name: 'Paket Jasa Instalasi Jaringan LAN Kantor (10 Titik)', qty: 1, unit_price: 8500000 }
            ],
            total_price: 71900000,
            payment_status: 'VA Mandiri - Lunas',
            payment_type: 'va',
            payment_variant: 'emerald',
            fulfillment_status: 'Dikirim & Teknisi Dijadwalkan',
            fulfillment_key: 'shipping',
            fulfillment_icon: 'truck',
            documents: [
                { name: 'PO.pdf', type: 'po' },
                { name: 'e-Faktur', type: 'tax' },
                { name: 'BAST', type: 'bast' },
            ],
            driver_name: 'Asep Saepuloh (Mobil Operasional D 1482 PN)',
            technician_team: 'Dedi Kurniawan, S.T. (Lead On-Site)'
        },
        {
            id: 'INV-0885',
            invoice_code: '#INV-PN-2026-0885',
            date: '25 Okt 2026',
            po_number: 'PO/SAM/X/2026/19',
            po_status: 'valid',
            client_name: 'CV Sinar Abadi Mandiri',
            pic_name: 'Siska Dewi',
            pic_phone: '0813-8899-7711',
            address: 'Kawasan Industri Cimahi Selatan Blok B-4, Kota Cimahi',
            items: '5x Ubiquiti UniFi AP AC Pro + 2 Roll Kabel Belden',
            items_breakdown: [
                { name: 'Ubiquiti UniFi AP AC Pro', qty: 5, unit_price: 2450000 },
                { name: 'Kabel UTP Cat6 Belden 305m', qty: 2, unit_price: 3100000 }
            ],
            total_price: 18450000,
            payment_status: 'Termin PO 30 Hari',
            payment_type: 'termin',
            payment_variant: 'slate',
            fulfillment_status: 'Diproses Gudang Ujung Berung',
            fulfillment_key: 'warehouse',
            fulfillment_icon: 'box',
            documents: [
                { name: 'PO.pdf', type: 'po' },
                { name: 'e-Faktur', type: 'tax' },
            ],
            driver_name: 'Tim Ekspedisi Internal CV. Putra Nugraha',
            technician_team: null
        },
        {
            id: 'ORD-0901',
            invoice_code: '#ORD-PN-2026-0901',
            date: 'Hari Ini',
            po_number: 'Belum Upload',
            po_status: 'pending_review',
            client_name: 'PT Graha Media Nusantara',
            pic_name: 'Rian Hidayat',
            pic_phone: '0819-0011-2233',
            address: 'Jl. R.E. Martadinata No. 45, Kota Bandung',
            items: '1x Cabinet Server Close Rack 42U Glass Door',
            items_breakdown: [
                { name: 'Cabinet Server Close Rack 42U Glass Door (Includes PDU & Fans)', qty: 1, unit_price: 7850000 }
            ],
            total_price: 7850000,
            payment_status: 'Menunggu Verifikasi',
            payment_type: 'pending',
            payment_variant: 'amber',
            fulfillment_status: 'Menunggu Verifikasi PO Klien',
            fulfillment_key: 'verification',
            fulfillment_icon: 'clock',
            documents: [
                { name: 'Cek PO', type: 'warning' },
            ],
            driver_name: null,
            technician_team: null
        }
    ]);

    // Tab Counts
    const tabCounts = useMemo(() => {
        return {
            all: 18,
            verification: 1,
            warehouse: 2,
            shipping: 2,
            completed: 13,
        };
    }, []);

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(ord => {
            // Tab filter
            if (selectedTab === 'verification' && ord.fulfillment_key !== 'verification') return false;
            if (selectedTab === 'warehouse' && ord.fulfillment_key !== 'warehouse') return false;
            if (selectedTab === 'shipping' && ord.fulfillment_key !== 'shipping') return false;
            if (selectedTab === 'completed' && ord.fulfillment_key !== 'completed') return false;

            // Payment filter
            if (paymentFilter === 'va' && ord.payment_type !== 'va') return false;
            if (paymentFilter === 'termin' && ord.payment_type !== 'termin') return false;

            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchCode = ord.invoice_code.toLowerCase().includes(q);
                const matchClient = ord.client_name.toLowerCase().includes(q);
                const matchPic = ord.pic_name.toLowerCase().includes(q);
                const matchItems = ord.items.toLowerCase().includes(q);
                const matchPo = ord.po_number.toLowerCase().includes(q);
                if (!matchCode && !matchClient && !matchPic && !matchItems && !matchPo) return false;
            }

            return true;
        });
    }, [orders, selectedTab, paymentFilter, searchQuery]);

    // Handle PO Validation
    const handleApprovePo = (orderId) => {
        setOrders(prev => prev.map(ord => {
            if (ord.id === orderId) {
                return {
                    ...ord,
                    po_number: 'PO/GMN/XI/2026/04',
                    po_status: 'valid',
                    payment_status: 'Termin PO 30 Hari (Disetujui)',
                    payment_variant: 'slate',
                    fulfillment_status: 'Diproses Gudang Ujung Berung',
                    fulfillment_key: 'warehouse',
                    fulfillment_icon: 'box',
                    documents: [
                        { name: 'PO.pdf', type: 'po' }
                    ]
                };
            }
            return ord;
        }));
        setActivePoValidation(null);
        showToast('Dokumen PO berhasil divalidasi! Pesanan dialihkan ke antrean gudang.');
    };

    // Handle Reject PO
    const handleRejectPo = (orderId) => {
        setActivePoValidation(null);
        showToast(`Pesanan ${orderId} ditolak. Notifikasi perbaikan telah dikirim ke PIC klien.`);
    };

    return (
        <SellerLayout
            title="Riwayat Pesanan & Pengelolaan Pengiriman B2B"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Cari nomor Invoice, nomor PO, nama PT klien, atau ekspedisi..."
            actionButtonText="Buat Pesanan Manual"
            onActionClick={() => setManualOrderModalOpen(true)}
            adminRole="Admin Internal"
            adminSubRole="Logistik & Pesanan"
            secondarySidebarLabel="Logistik & Pesanan"
        >
            <Head title="Riwayat Pesanan & Pengelolaan Pengiriman B2B — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* FLOATING TOAST NOTIFICATION                               */}
            {/* ========================================================= */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#171B26] border border-emerald-500/30 dark:border-[#76C19F]/30 text-slate-900 dark:text-slate-100 font-medium text-xs shadow-2xl animate-modal">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#76C19F] shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ========================================================= */}
            {/* PAGE TITLE & SUBTITLE                                     */}
            {/* ========================================================= */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                        Riwayat Pesanan &amp; Pengelolaan Pengiriman B2B
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Pantau status pesanan korporat, verifikasi dokumen Purchase Order (PO), dan cetak surat jalan gudang.
                    </p>
                </div>

                {/* Export Button */}
                <button
                    type="button"
                    onClick={() => showToast('Mengekspor rekap 18 transaksi pesanan B2B ke format Excel (.XLSX)...')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition active:scale-95 shrink-0"
                >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>Unduh Laporan Transaksi (Excel)</span>
                </button>
            </div>

            {/* ========================================================= */}
            {/* TOP 3 KPI METRIC CARDS                                    */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                
                {/* Metric 1: Total Pesanan Aktif */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm dark:shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Total Pesanan Aktif
                        </span>
                        <div className="text-slate-400">
                            <Package className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        5 Transaksi
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        Dalam proses pengiriman &amp; setup
                    </div>
                </div>

                {/* Metric 2: Siap Kirim / QC Gudang */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm dark:shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Siap Kirim / QC Gudang
                        </span>
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-[#4361EE]/10 border border-blue-200 dark:border-[#4361EE]/20 text-blue-600 dark:text-[#9bb8f5]">
                            <Box className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        2 Pesanan
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                        <span>Unit siap di Ujung Berung</span>
                    </div>
                </div>

                {/* Metric 3: Selesai Bulan Ini */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3 shadow-sm dark:shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Selesai Bulan Ini
                        </span>
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-[#76C19F]/10 border border-emerald-200 dark:border-[#76C19F]/20 text-emerald-600 dark:text-[#8cd4b4]">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        13 Transaksi
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                        <span>BAST &amp; e-Faktur lengkap</span>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* STATUS TABS & SEARCH / DROPDOWN FILTER BAR                */}
            {/* ========================================================= */}
            <div className="space-y-4">
                
                {/* 5 Status Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: 'all', label: `Semua (${tabCounts.all})` },
                        { id: 'verification', label: `Menunggu Verifikasi PO (${tabCounts.verification})` },
                        { id: 'warehouse', label: `Diproses Gudang (${tabCounts.warehouse})` },
                        { id: 'shipping', label: `Dikirim & Teknisi (${tabCounts.shipping})` },
                        { id: 'completed', label: `Selesai & BAST (${tabCounts.completed})` },
                    ].map(tab => {
                        const active = selectedTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                    active
                                        ? 'btn-primary-bespoke'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar & Dropdown Selectors */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                            <Search className="h-3.5 w-3.5" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari kata kunci pesanan..."
                            className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                        />
                    </div>

                    {/* 2 Dropdown Filters */}
                    <div className="flex items-center gap-3">
                        {/* Dropdown 1: Payment Method */}
                        <div className="relative">
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                            >
                                <option value="all">Semua Pembayaran: VA &amp; Termin PO</option>
                                <option value="va">Virtual Account (Lunas)</option>
                                <option value="termin">Termin PO (TOP 30 Hari)</option>
                            </select>
                        </div>

                        {/* Dropdown 2: Period */}
                        <div className="relative">
                            <select
                                value={periodFilter}
                                onChange={(e) => setPeriodFilter(e.target.value)}
                                className="h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                            >
                                <option value="this_month">Bulan Berjalan</option>
                                <option value="last_month">Bulan Lalu</option>
                                <option value="quarter">Kuartal Ini (Q4 2026)</option>
                                <option value="all">Semua Periode</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* MAIN ORDERS TABLE: DAFTAR PESANAN & PURCHASE ORDER        */}
            {/* ========================================================= */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-4 shadow-sm dark:shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        Daftar Pesanan &amp; Purchase Order
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {tabCounts.all} Transaksi B2B
                    </span>
                </div>

                {/* Mobile Card List (md:hidden) */}
                <div className="md:hidden space-y-3">
                    {filteredOrders.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                            Tidak ada transaksi yang cocok dengan filter.
                        </div>
                    ) : (
                        filteredOrders.map((ord) => (
                            <div
                                key={ord.id}
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{ord.invoice_code}</span>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{ord.date}</div>
                                    </div>
                                    {ord.payment_variant === 'emerald' && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium badge-sage">
                                            <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                            <span>{ord.payment_status}</span>
                                        </span>
                                    )}
                                    {ord.payment_variant === 'amber' && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium badge-ochre">
                                            <span className="h-1.5 w-1.5 rounded-full dot-ochre shrink-0" />
                                            <span>{ord.payment_status}</span>
                                        </span>
                                    )}
                                    {ord.payment_variant === 'slate' && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium badge-azure">
                                            <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                            <span>{ord.payment_status}</span>
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{ord.client_name}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">PIC: {ord.pic_name} &bull; PO: {ord.po_number}</div>
                                    <div className="text-xs text-slate-600 dark:text-slate-300 pt-1">{ord.items}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                                    <div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Tagihan</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            Rp {ord.total_price.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-700/80 text-xs">
                                        {ord.fulfillment_icon === 'truck' && <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-[#9bb8f5] shrink-0" />}
                                        {ord.fulfillment_icon === 'box' && <Box className="h-3.5 w-3.5 text-blue-600 dark:text-[#9bb8f5] shrink-0" />}
                                        {ord.fulfillment_icon === 'clock' && <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-[#dec093] shrink-0" />}
                                        <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                            {ord.fulfillment_status}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end gap-2">
                                    {ord.po_status === 'pending_review' ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleRejectPo(ord.id)}
                                                className="px-3 py-1.5 rounded-lg btn-danger-subtle text-xs"
                                            >
                                                Tolak
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActivePoValidation(ord)}
                                                className="px-3 py-1.5 rounded-lg btn-primary-bespoke text-xs font-medium"
                                            >
                                                Validasi PO
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setActiveDetailModal(ord)}
                                                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                                            >
                                                Detail
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveDeliverySlip(ord)}
                                                className="px-3 py-1.5 rounded-lg btn-primary-bespoke text-xs font-medium"
                                            >
                                                Surat Jalan
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="pb-3 pr-4">No. Invoice &amp; Ref. PO</th>
                                <th className="pb-3 px-4">Perusahaan Klien &amp; PIC</th>
                                <th className="pb-3 px-4">Daftar Produk &amp; Layanan</th>
                                <th className="pb-3 px-4">Total Tagihan &amp; Pembayaran</th>
                                <th className="pb-3 px-4">Status Pengadaan &amp; Pengiriman</th>
                                <th className="pb-3 px-4">Dokumen</th>
                                <th className="pb-3 pl-4 text-center">Aksi Admin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
                            {filteredOrders.map((ord) => (
                                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                                    
                                    {/* Col 1: Invoice & Ref PO */}
                                    <td className="py-4 pr-4 align-top">
                                        <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                            {ord.invoice_code}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {ord.date}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            PO: <span className={ord.po_number === 'Belum Upload' ? 'text-amber-600 dark:text-[#dec093] font-medium' : 'text-slate-700 dark:text-slate-300'}>{ord.po_number}</span>
                                        </div>
                                    </td>

                                    {/* Col 2: Perusahaan & PIC */}
                                    <td className="py-4 px-4 align-top">
                                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                                            {ord.client_name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            PIC: {ord.pic_name}
                                        </div>
                                    </td>

                                    {/* Col 3: Daftar Produk & Layanan */}
                                    <td className="py-4 px-4 align-top max-w-xs">
                                        <div className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                                            {ord.items}
                                        </div>
                                    </td>

                                    {/* Col 4: Total & Pembayaran */}
                                    <td className="py-4 px-4 align-top">
                                        <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                            Rp {ord.total_price.toLocaleString('id-ID')}
                                        </div>
                                        <div className="mt-1">
                                            {ord.payment_variant === 'emerald' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium badge-sage">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                    <span>{ord.payment_status}</span>
                                                </span>
                                            )}
                                            {ord.payment_variant === 'amber' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium badge-ochre">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-ochre shrink-0" />
                                                    <span>{ord.payment_status}</span>
                                                </span>
                                            )}
                                            {ord.payment_variant === 'slate' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium badge-azure">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                                    <span>{ord.payment_status}</span>
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Col 5: Status Pengadaan Dropdown */}
                                    <td className="py-4 px-4 align-top min-w-[200px]">
                                        <div className="relative">
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200">
                                                {ord.fulfillment_icon === 'truck' && <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-[#9bb8f5] shrink-0" />}
                                                {ord.fulfillment_icon === 'box' && <Box className="h-3.5 w-3.5 text-blue-600 dark:text-[#9bb8f5] shrink-0" />}
                                                {ord.fulfillment_icon === 'clock' && <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-[#dec093] shrink-0" />}
                                                <span className={`truncate text-xs font-medium ${
                                                    ord.fulfillment_icon === 'clock' ? 'text-amber-600 dark:text-[#dec093]' : 'text-slate-800 dark:text-slate-200'
                                                }`}>
                                                    {ord.fulfillment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Col 6: Dokumen Stack */}
                                    <td className="py-4 px-4 align-top">
                                        <div className="space-y-1">
                                            {ord.documents.map((doc, idx) => {
                                                if (doc.type === 'warning') {
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setActivePoValidation(ord)}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium badge-ochre hover:border-[#C79B64]/50 transition"
                                                        >
                                                            <AlertCircle className="h-3 w-3 text-[#C79B64]" />
                                                            <span>{doc.name}</span>
                                                        </button>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => showToast(`Mengunduh dokumen: ${ord.invoice_code}-${doc.name}`)}
                                                        className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-[#9bb8f5] transition"
                                                    >
                                                        <FileText className="h-3 w-3 text-slate-400" />
                                                        <span>{doc.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>

                                    {/* Col 7: Aksi Admin */}
                                    <td className="py-4 pl-4 align-top min-w-[110px]">
                                        {ord.po_status === 'pending_review' ? (
                                            <div className="space-y-1.5 w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => setActivePoValidation(ord)}
                                                    className="w-full px-3 py-1.5 rounded-lg btn-primary-bespoke font-medium text-xs shadow-sm transition active:scale-95 text-center"
                                                >
                                                    Validasi PO
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRejectPo(ord.id)}
                                                    className="w-full px-3 py-1 rounded-lg btn-danger-subtle text-xs text-center"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveDetailOrder(ord)}
                                                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium block w-full hover:underline transition"
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSuratJalan(ord)}
                                                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium block w-full hover:underline transition"
                                                >
                                                    Surat Jalan
                                                </button>
                                            </div>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer: Pagination */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                        Menampilkan 1 - 3 dari 18 Transaksi B2B
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            className="h-7 w-7 rounded-lg bg-[#3651dc] text-white font-bold text-xs flex items-center justify-center shadow-sm border border-white/10"
                        >
                            1
                        </button>
                        <button
                            type="button"
                            onClick={() => showToast('Memuat halaman 2 transaksi...')}
                            className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-[#12161F] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs flex items-center justify-center transition"
                        >
                            2
                        </button>
                        <button
                            type="button"
                            onClick={() => showToast('Memuat halaman 3 transaksi...')}
                            className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-[#12161F] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs flex items-center justify-center transition"
                        >
                            3
                        </button>
                        <button
                            type="button"
                            onClick={() => showToast('Memuat halaman berikutnya...')}
                            className="px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs flex items-center gap-1 transition"
                        >
                            <span>Berikutnya</span>
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* MODAL 1: BUAT PESANAN MANUAL (WITH ANIMATION)             */}
            {/* ========================================================= */}
            {manualOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="text-[10px] font-semibold text-blue-600 dark:text-[#9bb8f5] uppercase tracking-wider">
                                    Admin Internal Back-Office
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Buat Pesanan &amp; Penugasan Manual
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setManualOrderModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setManualOrderModalOpen(false);
                            showToast('Pesanan baru berhasil dibuat dan diteruskan ke bagian gudang!');
                        }} className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Nama Instansi / Perusahaan Pembeli:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: PT Telkom Akses Regional 3"
                                    defaultValue="PT Sinergi Data Nusantara"
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Nama PIC &amp; Telepon:</label>
                                    <input
                                        type="text"
                                        defaultValue="Bambang (0812-9988-7766)"
                                        className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Metode Pembayaran:</label>
                                    <select className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]">
                                        <option>Termin PO 30 Hari (Mitra B2B)</option>
                                        <option>Virtual Account Mandiri / BCA</option>
                                        <option>Transfer Bank Manual</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Rincian Komoditas &amp; Layanan:</label>
                                <textarea
                                    rows={2}
                                    defaultValue="2x Switch Cisco 24-Port Gigabit + 1x Patch Panel 24 Cat6"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Nomor PO Pembeli:</label>
                                    <input
                                        type="text"
                                        defaultValue="PO/SDN/IT/2026/012"
                                        className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Total Tagihan (Rp):</label>
                                    <input
                                        type="text"
                                        defaultValue="Rp 33.200.000"
                                        className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc] font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setManualOrderModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium"
                                >
                                    Terbitkan Pesanan Manual
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: DETAIL PESANAN LENGKAP (WITH ANIMATION)          */}
            {/* ========================================================= */}
            {activeDetailOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <span className="text-[10px] font-semibold text-blue-600 dark:text-[#9bb8f5] uppercase tracking-wider">
                                    Informasi Lengkap Transaksi
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Detail Pesanan {activeDetailOrder.invoice_code}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveDetailOrder(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
                            {/* Klien & Alamat */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">Klien Instansi:</div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{activeDetailOrder.client_name}</div>
                                        <div className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                                            PIC: {activeDetailOrder.pic_name} ({activeDetailOrder.pic_phone})
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">No. Purchase Order:</div>
                                        <div className="font-mono font-semibold text-blue-600 dark:text-[#9bb8f5]">{activeDetailOrder.po_number}</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <span>Alamat Pengiriman: {activeDetailOrder.address}</span>
                                </div>
                            </div>

                            {/* Daftar Barang */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Rincian Barang &amp; Jasa
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {activeDetailOrder.items_breakdown.map((item, idx) => (
                                        <div key={idx} className="py-2 flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-900 dark:text-white font-medium">{item.name}</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">Qty: {item.qty} unit</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-900 dark:text-white font-bold">
                                                    Rp {(item.qty * item.unit_price).toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    @ Rp {item.unit_price.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-900 dark:text-white">Total Tagihan (Termasuk PPN 11%):</span>
                                    <span className="text-emerald-600 dark:text-[#8cd4b4] text-sm">
                                        Rp {activeDetailOrder.total_price.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Tim Pengiriman & Logistik */}
                            {activeDetailOrder.driver_name && (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 space-y-1">
                                    <div className="text-[11px] font-semibold text-blue-600 dark:text-[#9bb8f5]">Penugasan Ekspedisi Gudang:</div>
                                    <div className="text-slate-700 dark:text-slate-200">{activeDetailOrder.driver_name}</div>
                                    {activeDetailOrder.technician_team && (
                                        <div className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                                            Teknisi Instalasi: {activeDetailOrder.technician_team}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => {
                                    const ord = activeDetailOrder;
                                    setActiveDetailOrder(null);
                                    setActiveSuratJalan(ord);
                                }}
                                className="px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium flex items-center gap-1.5"
                            >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Buka Surat Jalan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveDetailOrder(null)}
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 3: SURAT JALAN RESMI GUDANG (WITH ANIMATION)        */}
            {/* ========================================================= */}
            {activeSuratJalan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <Printer className="h-5 w-5 text-blue-600 dark:text-[#9bb8f5]" />
                                <div>
                                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Dokumen Logistik Gudang
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Surat Jalan Pengiriman Resmi
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveSuratJalan(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Surat Jalan Paper Sheet View */}
                        <div className="p-5 rounded-xl bg-white text-slate-900 text-xs space-y-4 shadow-inner border border-slate-200">
                            {/* Kop Surat */}
                            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                                <div>
                                    <div className="font-black text-sm uppercase tracking-wide text-slate-900">
                                        CV. PUTRA NUGRAHA
                                    </div>
                                    <div className="text-[10px] text-slate-600">Perdagangan Barang dan Jasa Pengadaan IT</div>
                                    <div className="text-[10px] text-slate-600">
                                        Jl. Cinangka Kavling 2, RT 03 RW 05, Pasir Wangi, Ujung Berung, Bandung
                                    </div>
                                    <div className="text-[10px] text-slate-600">Telp: (+62) 813-2077-7874 | NPWP: 08.765.432.1-429.000</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-extrabold text-xs uppercase bg-slate-900 text-white px-2 py-0.5 rounded">
                                        SURAT JALAN
                                    </div>
                                    <div className="text-[10px] font-mono font-bold mt-1 text-slate-900">SJ-PN/2026/10/{activeSuratJalan.id}</div>
                                    <div className="text-[10px] text-slate-600">{activeSuratJalan.date}</div>
                                </div>
                            </div>

                            {/* Info Pengiriman */}
                            <div className="grid grid-cols-2 gap-4 text-[11px]">
                                <div>
                                    <span className="font-bold text-slate-500 uppercase text-[9px]">Penerima Barang:</span>
                                    <div className="font-bold text-slate-900">{activeSuratJalan.client_name}</div>
                                    <div className="text-slate-700">Attn: {activeSuratJalan.pic_name} ({activeSuratJalan.pic_phone})</div>
                                    <div className="text-slate-700 leading-tight mt-0.5">{activeSuratJalan.address}</div>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-500 uppercase text-[9px]">Referensi Pengadaan:</span>
                                    <div className="font-mono text-slate-900 font-bold">{activeSuratJalan.invoice_code}</div>
                                    <div className="text-slate-700">No. PO: {activeSuratJalan.po_number}</div>
                                    <div className="text-slate-700 font-medium">Armada: {activeSuratJalan.driver_name || 'Kurir Ekspedisi Internal'}</div>
                                </div>
                            </div>

                            {/* Tabel Barang */}
                            <table className="w-full text-left text-[11px] border border-slate-300">
                                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                                    <tr>
                                        <th className="p-2 border-r border-slate-300 w-10 text-center">No.</th>
                                        <th className="p-2 border-r border-slate-300">Nama Barang / Spesifikasi</th>
                                        <th className="p-2 border-r border-slate-300 w-20 text-center">Kuantitas</th>
                                        <th className="p-2 text-center w-28">Kondisi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300">
                                    {activeSuratJalan.items_breakdown.map((itm, i) => (
                                        <tr key={i}>
                                            <td className="p-2 border-r border-slate-300 text-center font-medium">{i + 1}</td>
                                            <td className="p-2 border-r border-slate-300 font-medium">{itm.name}</td>
                                            <td className="p-2 border-r border-slate-300 text-center font-bold">{itm.qty} Unit</td>
                                            <td className="p-2 text-center text-emerald-800 font-semibold">Baik (Segel QC)</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Tanda Tangan */}
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2">
                                <div>
                                    <div className="text-slate-500">Petugas Gudang / QC:</div>
                                    <div className="h-12 flex items-center justify-center font-mono text-[9px] text-slate-400">[Tanda Tangan]</div>
                                    <div className="font-bold border-t border-slate-300 pt-1 text-slate-800">Bag. Logistik PN</div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Supir / Pengantar:</div>
                                    <div className="h-12 flex items-center justify-center font-mono text-[9px] text-slate-400">[Tanda Tangan]</div>
                                    <div className="font-bold border-t border-slate-300 pt-1 text-slate-800">Kurir Pengantar</div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Penerima Barang / PIC:</div>
                                    <div className="h-12 flex items-center justify-center font-mono text-[9px] text-slate-400">[Stempel &amp; TTD]</div>
                                    <div className="font-bold border-t border-slate-300 pt-1 text-slate-800">{activeSuratJalan.pic_name}</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => showToast('Mencetak Surat Jalan resmi ke printer kantor...')}
                                className="px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium flex items-center gap-1.5"
                            >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Cetak Surat Jalan (PDF)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSuratJalan(null)}
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 4: VALIDASI PURCHASE ORDER (WITH ANIMATION)         */}
            {/* ========================================================= */}
            {activePoValidation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <span className="text-[10px] font-semibold text-amber-600 dark:text-[#dec093] uppercase tracking-wider">
                                    Verifikasi Legalitas Pengadaan
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Validasi Dokumen PO: {activePoValidation.client_name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActivePoValidation(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Nomor Invoice Sistem:</div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">{activePoValidation.invoice_code}</div>
                                <div className="text-slate-700 dark:text-slate-300">Komoditas: {activePoValidation.items}</div>
                                <div className="text-slate-900 dark:text-white font-bold text-sm">
                                    Nilai Tagihan: Rp {activePoValidation.total_price.toLocaleString('id-ID')}
                                </div>
                            </div>

                            {/* Checklist Verifikasi */}
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                                    Kriteria Pemeriksaan Purchase Order:
                                </div>
                                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12] text-[#3651dc]" />
                                        <span>Nomor PO &amp; Tanggal resmi tertera jelas</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12] text-[#3651dc]" />
                                        <span>Stempel basah / e-Meterai instansi terlampir</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12] text-[#3651dc]" />
                                        <span>Nominal tagihan sesuai SPH (Rp 7.850.000)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C0D12] text-[#3651dc]" />
                                        <span>Syarat pembayaran TOP 30 Hari memenuhi ketentuan limit kredit</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Catatan Validasi Admin (Opsional):</label>
                                <input
                                    type="text"
                                    defaultValue="Dokumen PO telah diverifikasi via telepon dengan PIC Rian Hidayat."
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleRejectPo(activePoValidation.id)}
                                className="px-4 py-2 rounded-lg btn-danger-subtle text-xs font-semibold"
                            >
                                Tolak PO
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApprovePo(activePoValidation.id)}
                                className="px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium flex items-center gap-1.5"
                            >
                                <Check className="h-3.5 w-3.5" />
                                <span>Validasi &amp; Teruskan ke Gudang</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
