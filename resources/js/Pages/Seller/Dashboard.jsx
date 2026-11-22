import { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Link } from '@inertiajs/react';
import { 
    Banknote, 
    Clock, 
    Truck, 
    ArrowUpRight, 
    FileText, 
    Paperclip, 
    Check, 
    CheckCircle2, 
    AlertCircle, 
    Upload, 
    Printer, 
    Boxes, 
    Wrench, 
    Users, 
    User, 
    Calendar, 
    ChevronDown, 
    Plus, 
    RotateCcw,
    FileSpreadsheet,
    FileCheck2,
    X,
    ExternalLink
} from 'lucide-react';

export default function SellerDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Status orders state
    const [orders, setOrders] = useState([
        {
            id: 'INV-0892',
            invoice_code: '#INV-PN-2026-0892',
            client_name: 'PT Maju Jaya Teknologi',
            items: 'Server HPE ML30 + Jasa Instalasi LAN',
            payment_status: 'VA Lunas (Rp 71.800.000)',
            payment_variant: 'emerald',
            fulfillment_status: 'Dikirim & Jadwal Teknisi',
            tax_status: 'unuploaded', // 'unuploaded' or 'uploaded'
            bast_status: 'pending'
        },
        {
            id: 'INV-0885',
            invoice_code: '#INV-PN-2026-0885',
            client_name: 'CV Sinar Abadi Mandiri',
            items: '5x Ubiquiti UniFi AP AC Pro',
            payment_status: 'Termin PO 30 Hari (Rp 12.250.000)',
            payment_variant: 'blue',
            fulfillment_status: 'Diproses Gudang',
            tax_status: 'uploaded',
            bast_status: 'ready'
        }
    ]);

    // Inventory Stock State
    const [inventory, setInventory] = useState([
        {
            id: 1,
            name: 'Server HPE ProLiant ML30 Gen10',
            stock: 12,
            unit: 'Unit',
            status: 'ready',
            is_active: true
        },
        {
            id: 2,
            name: 'Cisco Catalyst Switch 24-Port',
            stock: 8,
            unit: 'Unit',
            status: 'ready',
            is_active: true
        },
        {
            id: 3,
            name: 'Kabel UTP Cat6 Belden 305m',
            stock: 2,
            unit: 'Roll',
            status: 'critical',
            is_active: true
        }
    ]);

    // Modal States
    const [activeRfqModal, setActiveRfqModal] = useState(null);
    const [activeTaxModal, setActiveTaxModal] = useState(null);
    const [activeRestockModal, setActiveRestockModal] = useState(null);
    const [activeAddProductModal, setActiveAddProductModal] = useState(false);
    const [notificationToast, setNotificationToast] = useState(null);

    const showToast = (message) => {
        setNotificationToast(message);
        setTimeout(() => setNotificationToast(null), 3500);
    };

    // Toggle stock status
    const toggleStockReady = (id) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                const nextActive = !item.is_active;
                return {
                    ...item,
                    is_active: nextActive,
                    status: nextActive ? 'ready' : 'empty'
                };
            }
            return item;
        }));
        showToast('Status ketersediaan stok berhasil diperbarui!');
    };

    // Restock handler
    const handleRestock = (id, amount) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                const newStock = item.stock + amount;
                return {
                    ...item,
                    stock: newStock,
                    status: newStock > 5 ? 'ready' : 'critical'
                };
            }
            return item;
        }));
        setActiveRestockModal(null);
        showToast(`Stok berhasil ditambah sebanyak ${amount} unit!`);
    };

    // Change fulfillment status
    const handleStatusChange = (orderId, newStatus) => {
        setOrders(prev => prev.map(ord => {
            if (ord.id === orderId) {
                return { ...ord, fulfillment_status: newStatus };
            }
            return ord;
        }));
        showToast(`Status pesanan ${orderId} diubah ke: ${newStatus}`);
    };

    // Upload Tax Invoice Simulated
    const handleUploadTaxInvoice = (orderId) => {
        setOrders(prev => prev.map(ord => {
            if (ord.id === orderId) {
                return { ...ord, tax_status: 'uploaded' };
            }
            return ord;
        }));
        setActiveTaxModal(null);
        showToast(`Faktur Pajak Elektronik (e-Faktur) berhasil diunggah untuk order ${orderId}!`);
    };

    // Approve SPH
    const handleApproveSph = (rfqCode) => {
        setActiveRfqModal(null);
        showToast(`Surat Penawaran Harga (SPH) resmi untuk ${rfqCode} berhasil diterbitkan dan dikirim ke klien!`);
    };

    return (
        <SellerLayout 
            title="Dashboard Admin Internal" 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddProduct={() => setActiveAddProductModal(true)}
        >
            {/* ========================================================= */}
            {/* FLOATING TOAST NOTIFICATION                               */}
            {/* ========================================================= */}
            {notificationToast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#171B26] border border-emerald-500/30 dark:border-[#76C19F]/30 text-slate-900 dark:text-slate-100 font-medium text-xs shadow-2xl animate-modal">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#76C19F] shrink-0" />
                    <span>{notificationToast}</span>
                </div>
            )}

            {/* ========================================================= */}
            {/* PAGE TITLE & SUBTITLE                                     */}
            {/* ========================================================= */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Dashboard Admin Internal
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                    </p>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Finance &amp; Operasional
                </div>
            </div>

            {/* ========================================================= */}
            {/* TOP 3 KPI METRIC CARDS                                    */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                
                {/* Metric 1: Omzet Pengadaan Bulan Ini */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Omzet Pengadaan Bulan Ini
                        </span>
                        <div className="p-1 rounded-lg text-[#086f8e] dark:text-[#38bdf8]">
                            <Banknote className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#086f8e] dark:text-[#38bdf8] tracking-tight break-words">
                        Rp 342.850.000
                    </div>
                    <div className="text-[11px] text-slate-400">
                        Termasuk PPN 11% (18 Transaksi)
                    </div>
                </div>

                {/* Metric 2: Antrean RFQ Masuk */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Antrean RFQ Masuk
                        </span>
                        <div className="p-1 rounded-lg text-[#086f8e] dark:text-[#38bdf8]">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        3 Pengajuan
                    </div>
                    <div className="text-[11px] text-slate-400">
                        Perlu penerbitan SPH hari ini
                    </div>
                </div>

                {/* Metric 3: Pesanan & Instalasi Aktif */}
                <Link
                    href="/seller/orders"
                    className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer sm:col-span-2 md:col-span-1"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Pesanan &amp; Instalasi Aktif
                        </span>
                        <div className="p-1 rounded-lg text-[#086f8e] dark:text-[#38bdf8]">
                            <Truck className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        5 Pesanan
                    </div>
                    <div className="text-[11px] text-slate-400">
                        3 Pengiriman, 2 Jadwal Teknisi
                    </div>
                </Link>

            </div>

            {/* ========================================================= */}
            {/* SECTION 1: ANTREAN PENGAJUAN RFQ MASUK                     */}
            {/* ========================================================= */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-slate-800/80">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            Antrean Pengajuan RFQ Masuk (Permintaan Surat Penawaran Harga / SPH)
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            2 pengajuan terbaru &bull; Prioritaskan verifikasi harga dan ketersediaan barang.
                        </p>
                    </div>
                    <Link
                        href="/seller/negotiations"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#086f8e] dark:text-[#38bdf8] hover:underline transition shrink-0"
                    >
                        <span>Lihat Semua RFQ</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* Table Column Headers (Desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <div className="col-span-3">No. RFQ / Klien</div>
                    <div className="col-span-4">Permintaan / Lampiran</div>
                    <div className="col-span-2">Estimasi Total</div>
                    <div className="col-span-3 text-right sm:text-left">Tindak Lanjut</div>
                </div>

                {/* RFQ List Items as Card Enclosures */}
                <div className="space-y-3">
                    {/* RFQ 1 Box */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12161F] p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                            {/* Col 1 */}
                            <div className="md:col-span-3">
                                <div className="font-mono font-bold text-[#086f8e] dark:text-[#38bdf8] text-xs">#RFQ-2026-0118</div>
                                <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">PT Maju Jaya Teknologi</div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">(NPWP Aktif)</div>
                            </div>

                            {/* Col 2 */}
                            <div className="md:col-span-4 space-y-1">
                                <div className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                                    4x Server HPE ProLiant ML30 Gen10 + Instalasi
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => showToast('Membuka pratinjau dokumen: RAB_Server.pdf')}
                                    className="inline-flex items-center gap-1 text-xs text-[#086f8e] dark:text-[#38bdf8] hover:underline font-medium cursor-pointer"
                                >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span>RAB_Server.pdf</span>
                                </button>
                            </div>

                            {/* Col 3 */}
                            <div className="md:col-span-2">
                                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Rp 131.500.000</div>
                                <div className="text-[10px] text-slate-400">Estimasi pengadaan</div>
                            </div>

                            {/* Col 4 */}
                            <div className="md:col-span-3 text-left md:text-right">
                                <button
                                    type="button"
                                    onClick={() => setActiveRfqModal({
                                        code: '#RFQ-2026-0118',
                                        client: 'PT Maju Jaya Teknologi',
                                        items: '4x Server HPE ProLiant ML30 Gen10 + Jasa Instalasi & Setup RAID',
                                        total: 131500000,
                                        margin: '12%',
                                        notes: 'Spesifikasi sesuai permintaan TOR IT Procurement'
                                    })}
                                    className="w-full md:w-auto px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold whitespace-nowrap active:scale-95 shadow-xs transition cursor-pointer"
                                >
                                    Verifikasi Harga &amp; Terbitkan SPH
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RFQ 2 Box */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12161F] p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                            {/* Col 1 */}
                            <div className="md:col-span-3">
                                <div className="font-mono font-bold text-[#086f8e] dark:text-[#38bdf8] text-xs">#RFQ-2026-0117</div>
                                <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">Dinas Komunikasi &amp; Informatika</div>
                            </div>

                            {/* Col 2 */}
                            <div className="md:col-span-4 space-y-1">
                                <div className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                                    10x Cisco Catalyst Switch 24-Port + Kabel Belden
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => showToast('Membuka pratinjau dokumen: BoQ_Jaringan.xlsx')}
                                    className="inline-flex items-center gap-1 text-xs text-[#086f8e] dark:text-[#38bdf8] hover:underline font-medium cursor-pointer"
                                >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span>BoQ_Jaringan.xlsx</span>
                                </button>
                            </div>

                            {/* Col 3 */}
                            <div className="md:col-span-2">
                                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Rp 185.500.000</div>
                                <div className="text-[10px] text-slate-400">Estimasi pengadaan</div>
                            </div>

                            {/* Col 4 */}
                            <div className="md:col-span-3 text-left md:text-right">
                                <button
                                    type="button"
                                    onClick={() => setActiveRfqModal({
                                        code: '#RFQ-2026-0117',
                                        client: 'Dinas Komunikasi & Informatika',
                                        items: '10x Cisco Catalyst Switch 24-Port Gigabit + 5 Roll Kabel UTP Cat6 Belden',
                                        total: 185500000,
                                        margin: '10%',
                                        notes: 'Pengadaan APBD Perubahan Diskominfo'
                                    })}
                                    className="w-full md:w-auto px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold whitespace-nowrap active:scale-95 shadow-xs transition cursor-pointer"
                                >
                                    Verifikasi Harga &amp; Terbitkan SPH
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 2: KONTROL PESANAN B2B, UPLOAD FAKTUR PAJAK        */}
            {/* ========================================================= */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="pb-1 border-b border-slate-200 dark:border-slate-800/80">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        Kontrol Pesanan B2B, Upload Faktur Pajak (e-Faktur) &amp; Penugasan Teknisi
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pantau pembayaran, progres pemenuhan, dan kelengkapan dokumen dalam satu tempat.
                    </p>
                </div>

                {/* Table Column Headers (Desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <div className="col-span-3">Invoice / Klien</div>
                    <div className="col-span-3">Pesanan / Pembayaran</div>
                    <div className="col-span-3">Status Pemenuhan</div>
                    <div className="col-span-3 text-center">Pajak &amp; Legalitas</div>
                </div>

                {/* Order List Items as Card Enclosures */}
                <div className="space-y-3">
                    {/* Order 1: INV-0892 */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12161F] p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                            {/* Col 1: Invoice / Klien */}
                            <div className="md:col-span-3">
                                <div className="font-mono font-bold text-[#086f8e] dark:text-[#38bdf8] text-xs">#INV-PN-2026-0892</div>
                                <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">PT Maju Jaya Teknologi</div>
                            </div>

                            {/* Col 2: Pesanan / Pembayaran */}
                            <div className="md:col-span-3 space-y-1">
                                <div className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                                    Server HPE ML30 + Jasa Instalasi LAN
                                </div>
                                <div>
                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                        VA Lunas (Rp 71.800.000)
                                    </span>
                                </div>
                            </div>

                            {/* Col 3: Status Pemenuhan */}
                            <div className="md:col-span-3">
                                <select
                                    value={orders[0].fulfillment_status}
                                    onChange={(e) => handleStatusChange(orders[0].id, e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#171B26] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#086f8e] cursor-pointer"
                                >
                                    <option value="Dikirim & Jadwal Teknisi">Dikirim &amp; Jadwal Teknisi</option>
                                    <option value="Diproses Gudang">Diproses Gudang</option>
                                    <option value="Pengiriman Ekspedisi">Pengiriman Ekspedisi</option>
                                    <option value="Selesai & BAST Ditandatangani">Selesai &amp; BAST</option>
                                </select>
                            </div>

                            {/* Col 4: Pajak & Legalitas */}
                            <div className="md:col-span-3 flex flex-col items-center justify-center space-y-1.5 max-w-[200px] mx-auto md:ml-auto md:mr-0 w-full">
                                <div className="text-rose-600 dark:text-rose-400 font-bold text-[11px] text-center">
                                    Belum Upload Pajak
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTaxModal(orders[0])}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold active:scale-95 shadow-xs transition cursor-pointer"
                                >
                                    <span>Upload e-Faktur PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => showToast(`Draft BAST untuk #INV-PN-2026-0892 berhasil dibuat!`)}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs py-1.5 px-3 rounded-lg transition text-center cursor-pointer"
                                >
                                    Buat BAST
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order 2: INV-0885 */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12161F] p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                            {/* Col 1: Invoice / Klien */}
                            <div className="md:col-span-3">
                                <div className="font-mono font-bold text-[#086f8e] dark:text-[#38bdf8] text-xs">#INV-PN-2026-0885</div>
                                <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">CV Sinar Abadi Mandiri</div>
                            </div>

                            {/* Col 2: Pesanan / Pembayaran */}
                            <div className="md:col-span-3 space-y-1">
                                <div className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                                    5x Ubiquiti UniFi AP AC Pro
                                </div>
                                <div>
                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        Termin PO 30 Hari (Rp 12.250.000)
                                    </span>
                                </div>
                            </div>

                            {/* Col 3: Status Pemenuhan */}
                            <div className="md:col-span-3">
                                <select
                                    value={orders[1].fulfillment_status}
                                    onChange={(e) => handleStatusChange(orders[1].id, e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#171B26] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#086f8e] cursor-pointer"
                                >
                                    <option value="Diproses Gudang">Diproses Gudang</option>
                                    <option value="Dikirim & Jadwal Teknisi">Dikirim &amp; Jadwal Teknisi</option>
                                    <option value="Pengiriman Ekspedisi">Pengiriman Ekspedisi</option>
                                    <option value="Selesai & BAST Ditandatangani">Selesai &amp; BAST</option>
                                </select>
                            </div>

                            {/* Col 4: Pajak & Legalitas */}
                            <div className="md:col-span-3 flex flex-col items-center justify-center space-y-1.5 max-w-[200px] mx-auto md:ml-auto md:mr-0 w-full">
                                <div className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>e-Faktur Terupload</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => showToast(`Mencetak Surat Jalan resmi untuk #INV-PN-2026-0885...`)}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs py-1.5 px-3 rounded-lg transition text-center cursor-pointer"
                                >
                                    Cetak Surat Jalan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 3: BOTTOM GRID 2 COLS                              */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Card: Kontrol Cepat Stok Gudang & Harga Grosir */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800/80">
                        <Boxes className="h-4 w-4 text-[#086f8e] dark:text-[#38bdf8]" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Kontrol Cepat Stok Gudang &amp; Harga Grosir
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {inventory.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#12161F] border border-slate-200/80 dark:border-slate-800/80 transition"
                            >
                                <div className="space-y-0.5 min-w-0 pr-3">
                                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                        {item.name}
                                    </div>
                                    <div className={`text-[11px] ${
                                        item.status === 'critical' ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                        Stok: {item.stock} {item.unit}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {item.status === 'critical' ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                                STOK KRITIS
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setActiveRestockModal(item)}
                                                className="px-3.5 py-1.5 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                                            >
                                                + Restock
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => toggleStockReady(item.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                                        >
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Ready Stock</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Card: Penugasan Teknisi Jaringan & Servis Hari Ini */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800/80">
                        <Wrench className="h-4 w-4 text-[#086f8e] dark:text-[#38bdf8]" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Penugasan Teknisi Jaringan &amp; Servis Hari Ini
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {/* Task 1 */}
                        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#12161F] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                <span>Tim Teknisi 1 (Andi &amp; Rian)</span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                                Lokasi: PT Maju Jaya Teknologi
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60">
                                    <Clock className="h-3 w-3 text-amber-600" />
                                    <span>Instalasi LAN 10 Titik - 09:00 WIB</span>
                                </span>
                            </div>
                        </div>

                        {/* Task 2 */}
                        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#12161F] border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                <span>Tim Teknisi 2 (Dedi)</span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                                Maintenance Server Rutin
                            </div>
                        </div>
                    </div>

                    {/* Bottom Tip Note */}
                    <div className="pt-1 flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Pastikan BAST disiapkan sebelum pekerjaan instalasi dan servis selesai.</span>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* MODAL 1: VERIFIKASI HARGA & TERBITKAN SPH                */}
            {/* ========================================================= */}
            {activeRfqModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="text-[10px] font-semibold text-amber-600 dark:text-[#dec093] uppercase tracking-wider">
                                    Verifikasi Pengadaan B2B
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Penerbitan SPH Resmi: {activeRfqModal.code}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRfqModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800/80 space-y-1">
                                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Klien Instansi:</div>
                                <div className="font-bold text-slate-900 dark:text-white">{activeRfqModal.client}</div>
                                <div className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">Daftar Kebutuhan:</div>
                                <div className="text-slate-700 dark:text-slate-200">{activeRfqModal.items}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800/80">
                                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Estimasi Total Penawaran</div>
                                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                        Rp {activeRfqModal.total.toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-[10px] text-emerald-600 dark:text-[#8cd4b4] mt-0.5">Sudah Termasuk PPN 11%</div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800/80">
                                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Margin Laba B2B</div>
                                    <div className="text-base font-bold text-amber-600 dark:text-[#dec093] mt-0.5">{activeRfqModal.margin}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Harga Rekomendasi Sistem</div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Catatan / Masa Berlaku SPH:
                                </label>
                                <input
                                    type="text"
                                    defaultValue="SPH berlaku 14 hari kalender sejak tanggal penerbitan resmi."
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setActiveRfqModal(null)}
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApproveSph(activeRfqModal.code)}
                                className="px-4 py-2 rounded-lg btn-ochre-bespoke text-xs font-semibold"
                            >
                                Setujui &amp; Terbitkan SPH Resmi (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: UPLOAD E-FAKTUR PDF                              */}
            {/* ========================================================= */}
            {activeTaxModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="text-[10px] font-semibold text-blue-600 dark:text-[#9bb8f5] uppercase tracking-wider">
                                    DJP Faktur Pajak Elektronik
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Upload e-Faktur: {activeTaxModal.invoice_code}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTaxModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800/80 space-y-1">
                                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Nama Pembeli / PKP:</div>
                                <div className="font-bold text-slate-900 dark:text-white">{activeTaxModal.client_name}</div>
                                <div className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">Total Nilai DPP + PPN 11%:</div>
                                <div className="text-slate-900 dark:text-white font-bold">{activeTaxModal.payment_status}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nomor Seri Faktur Pajak (NSFP):
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: 010.003-26.89201928"
                                    defaultValue="010.003-26.92018274"
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center space-y-2 hover:border-[#3651dc] transition cursor-pointer">
                                <Upload className="h-7 w-7 text-blue-600 dark:text-[#9bb8f5] mx-auto" />
                                <div className="text-xs text-slate-900 dark:text-white font-medium">
                                    Klik atau seret file PDF e-Faktur resmi di sini
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                    Maksimal ukuran file 5 MB (.PDF dengan QR-Code Valid DJP)
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setActiveTaxModal(null)}
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleUploadTaxInvoice(activeTaxModal.id)}
                                className="px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium flex items-center gap-1.5"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                <span>Simpan &amp; Terbitkan e-Faktur</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 3: RESTOCK BARANG CEPAT                            */}
            {/* ========================================================= */}
            {activeRestockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Restock: {activeRestockModal.name}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Stok saat ini: {activeRestockModal.stock} {activeRestockModal.unit}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRestockModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            <p className="text-slate-700 dark:text-slate-300">Pilih jumlah penambahan stok dari supplier:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[5, 10, 25].map(qty => (
                                    <button
                                        key={qty}
                                        type="button"
                                        onClick={() => handleRestock(activeRestockModal.id, qty)}
                                        className="py-2.5 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 hover:border-[#3651dc] hover:bg-blue-50 dark:hover:bg-[#3651dc]/10 text-slate-900 dark:text-white font-medium text-xs transition"
                                    >
                                        +{qty} {activeRestockModal.unit}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-1 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveRestockModal(null)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 4: + TAMBAH PRODUK / JASA CEPAT                    */}
            {/* ========================================================= */}
            {activeAddProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Tambah Komoditas / Layanan Baru
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Produk akan langsung tampil di etalase Portal B2B CV. Putra Nugraha.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveAddProductModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setActiveAddProductModal(false);
                            showToast('Produk baru berhasil didaftarkan ke etalase pengadaan!');
                        }} className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Nama Produk / Jasa:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Mikrotik Cloud Router Switch CRS328"
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Kategori:</label>
                                    <select className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]">
                                        <option>Hardware &amp; Server</option>
                                        <option>Networking &amp; Router</option>
                                        <option>Jasa Instalasi &amp; Servis</option>
                                        <option>Aksesoris IT</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Stok Awal:</label>
                                    <input
                                        type="number"
                                        defaultValue="10"
                                        className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Harga Satuan (Sebelum PPN):</label>
                                <input
                                    type="text"
                                    defaultValue="Rp 6.850.000"
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveAddProductModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg btn-primary-bespoke text-xs font-medium"
                                >
                                    Simpan Produk
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
