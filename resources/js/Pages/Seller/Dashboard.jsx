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
            payment_status: 'VA Lunas (Rp 71.900.000)',
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
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#171B26] border border-[#76C19F]/30 text-slate-100 font-medium text-xs shadow-2xl animate-modal">
                    <CheckCircle2 className="h-4 w-4 text-[#76C19F] shrink-0" />
                    <span>{notificationToast}</span>
                </div>
            )}

            {/* ========================================================= */}
            {/* PAGE TITLE & SUBTITLE                                     */}
            {/* ========================================================= */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Dashboard Admin Internal
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                    </p>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                    Finance &amp; Operasional
                </div>
            </div>

            {/* ========================================================= */}
            {/* TOP 3 KPI METRIC CARDS                                    */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                
                {/* Metric 1: Omzet Pengadaan Bulan Ini */}
                <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">
                            Omzet Pengadaan Bulan Ini
                        </span>
                        <div className="p-1.5 rounded-lg bg-[#76C19F]/10 border border-[#76C19F]/20 text-[#8cd4b4]">
                            <Banknote className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                        Rp 342.850.000
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                        <span>Termasuk PPN 11% (18 Transaksi)</span>
                    </div>
                </div>

                {/* Metric 2: Antrean RFQ Masuk */}
                <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">
                            Antrean RFQ Masuk
                        </span>
                        <div className="p-1.5 rounded-lg bg-[#C79B64]/10 border border-[#C79B64]/20 text-[#dec093]">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                        3 Pengajuan
                    </div>
                    <div className="text-[11px] text-[#dec093] font-medium flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full dot-ochre shrink-0" />
                        <span>Perlu penerbitan SPH hari ini</span>
                    </div>
                </div>

                {/* Metric 3: Pesanan & Instalasi Aktif */}
                <Link
                    href="/seller/orders"
                    className="block rounded-2xl border border-slate-800 bg-[#171B26] p-5 space-y-3 shadow-lg hover:border-slate-700 hover:bg-[#1E2434] transition group cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400 group-hover:text-white transition">
                            Pesanan &amp; Instalasi Aktif
                        </span>
                        <div className="p-1.5 rounded-lg bg-[#4361EE]/10 border border-[#4361EE]/20 text-[#9bb8f5] group-hover:bg-[#4361EE]/20 transition">
                            <Truck className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                        5 Pesanan
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>3 Pengiriman, 2 Jadwal Teknisi</span>
                        <span className="text-[#9bb8f5] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                            Kelola &rarr;
                        </span>
                    </div>
                </Link>

            </div>

            {/* ========================================================= */}
            {/* SECTION 1: ANTREAN PENGAJUAN RFQ MASUK                     */}
            {/* ========================================================= */}
            <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            Antrean Pengajuan RFQ Masuk (Permintaan Surat Penawaran Harga / SPH)
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            2 pengajuan terbaru &bull; Prioritaskan verifikasi harga dan ketersediaan barang.
                        </p>
                    </div>
                    <Link
                        href="/seller/negotiations"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition shrink-0"
                    >
                        <span>Lihat Semua RFQ</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* Table RFQ */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3 pr-4">No. RFQ / Klien</th>
                                <th className="pb-3 px-4">Permintaan / Lampiran</th>
                                <th className="pb-3 px-4">Estimasi Total</th>
                                <th className="pb-3 pl-4 text-right sm:text-left">Tindak Lanjut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {/* Row 1 */}
                            <tr className="hover:bg-slate-800/30 transition">
                                <td className="py-4 pr-4 align-top">
                                    <div className="font-mono font-bold text-white text-xs">#RFQ-2026-0118</div>
                                    <div className="text-slate-300 font-medium text-xs mt-0.5">PT Maju Jaya Teknologi</div>
                                    <div className="mt-1">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium badge-sage">
                                            <span className="h-1 w-1 rounded-full dot-sage" />
                                            <span>NPWP Aktif</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 align-top space-y-1">
                                    <div className="text-white font-medium">4x Server HPE ProLiant ML30 Gen10 + Instalasi</div>
                                    <button 
                                        type="button"
                                        onClick={() => showToast('Membuka pratinjau dokumen: RAB_Server.pdf')}
                                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#9bb8f5] transition"
                                    >
                                        <Paperclip className="h-3 w-3" />
                                        <span>RAB_Server.pdf</span>
                                    </button>
                                </td>
                                <td className="py-4 px-4 align-top">
                                    <div className="text-xs sm:text-sm font-bold text-white">Rp 131.500.000</div>
                                    <div className="text-[11px] text-slate-400">Estimasi pengadaan</div>
                                </td>
                                <td className="py-4 pl-4 align-top">
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
                                        className="px-3.5 py-2 rounded-lg btn-ochre-bespoke text-xs font-semibold whitespace-nowrap active:scale-95"
                                    >
                                        Verifikasi Harga &amp; Terbitkan SPH
                                    </button>
                                </td>
                            </tr>

                            {/* Row 2 */}
                            <tr className="hover:bg-slate-800/30 transition">
                                <td className="py-4 pr-4 align-top">
                                    <div className="font-mono font-bold text-white text-xs">#RFQ-2026-0117</div>
                                    <div className="text-slate-300 font-medium text-xs mt-0.5">Dinas Komunikasi &amp; Informatika</div>
                                </td>
                                <td className="py-4 px-4 align-top space-y-1">
                                    <div className="text-white font-medium">10x Cisco Catalyst Switch 24-Port + Kabel Belden</div>
                                    <button 
                                        type="button"
                                        onClick={() => showToast('Membuka pratinjau dokumen: BoQ_Jaringan.xlsx')}
                                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#9bb8f5] transition"
                                    >
                                        <Paperclip className="h-3 w-3" />
                                        <span>BoQ_Jaringan.xlsx</span>
                                    </button>
                                </td>
                                <td className="py-4 px-4 align-top">
                                    <div className="text-xs sm:text-sm font-bold text-white">Rp 185.500.000</div>
                                    <div className="text-[11px] text-slate-400">Estimasi pengadaan</div>
                                </td>
                                <td className="py-4 pl-4 align-top">
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
                                        className="px-3.5 py-2 rounded-lg btn-ochre-bespoke text-xs font-semibold whitespace-nowrap active:scale-95"
                                    >
                                        Verifikasi Harga &amp; Terbitkan SPH
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 2: KONTROL PESANAN B2B, UPLOAD FAKTUR PAJAK        */}
            {/* ========================================================= */}
            <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            Kontrol Pesanan B2B, Upload Faktur Pajak (e-Faktur) &amp; Penugasan Teknisi
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Pantau pembayaran, progres pemenuhan, dan kelengkapan dokumen dalam satu tempat.
                        </p>
                    </div>
                    <Link
                        href="/seller/orders"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition shrink-0"
                    >
                        <span>Kelola Semua Pesanan</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3 pr-4">Invoice / Klien</th>
                                <th className="pb-3 px-4">Pesanan / Pembayaran</th>
                                <th className="pb-3 px-4">Status Pemenuhan</th>
                                <th className="pb-3 pl-4">Pajak &amp; Legalitas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {orders.map((ord) => (
                                <tr key={ord.id} className="hover:bg-slate-800/30 transition">
                                    {/* Col 1 */}
                                    <td className="py-4 pr-4 align-top">
                                        <div className="font-mono font-bold text-white text-xs">{ord.invoice_code}</div>
                                        <div className="text-slate-300 font-medium text-xs mt-0.5">{ord.client_name}</div>
                                    </td>

                                    {/* Col 2 */}
                                    <td className="py-4 px-4 align-top space-y-1.5">
                                        <div className="text-white font-medium">{ord.items}</div>
                                        <div>
                                            {ord.payment_variant === 'emerald' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium badge-sage">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                    <span>{ord.payment_status}</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium badge-azure">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                                    <span>{ord.payment_status}</span>
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Col 3: Status Pemenuhan Dropdown */}
                                    <td className="py-4 px-4 align-top">
                                        <div className="relative inline-block w-48">
                                            <select
                                                value={ord.fulfillment_status}
                                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                                className="w-full rounded-lg bg-[#12161F] border border-slate-700/80 text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3651dc] focus:border-[#3651dc] cursor-pointer"
                                            >
                                                <option value="Dikirim & Jadwal Teknisi">Dikirim &amp; Jadwal Teknisi</option>
                                                <option value="Diproses Gudang">Diproses Gudang</option>
                                                <option value="Pengiriman Ekspedisi">Pengiriman Ekspedisi</option>
                                                <option value="Selesai & BAST Ditandatangani">Selesai &amp; BAST</option>
                                            </select>
                                        </div>
                                    </td>

                                    {/* Col 4: Pajak & Legalitas Action Stack */}
                                    <td className="py-4 pl-4 align-top">
                                        <div className="space-y-1.5 max-w-[180px]">
                                            {ord.tax_status === 'unuploaded' ? (
                                                <>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium badge-crimson">
                                                        <span className="h-1 w-1 rounded-full dot-crimson shrink-0" />
                                                        <span>Belum Upload Pajak</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTaxModal(ord)}
                                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg btn-primary-bespoke text-xs font-medium active:scale-95"
                                                    >
                                                        <Upload className="h-3 w-3" />
                                                        <span>Upload e-Faktur PDF</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => showToast(`Draft BAST untuk ${ord.invoice_code} berhasil dibuat!`)}
                                                        className="text-xs text-slate-400 hover:text-slate-200 block text-center w-full transition"
                                                    >
                                                        Buat BAST
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium badge-sage">
                                                        <Check className="h-3 w-3 text-[#76C19F] shrink-0" />
                                                        <span>e-Faktur Terupload</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => showToast(`Mencetak Surat Jalan resmi untuk ${ord.invoice_code}...`)}
                                                        className="text-xs text-slate-300 hover:text-white block text-center w-full pt-1 transition hover:underline"
                                                    >
                                                        Cetak Surat Jalan
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 3: BOTTOM GRID 2 COLS                              */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Card: Kontrol Cepat Stok Gudang & Harga Grosir */}
                <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-[#9bb8f5]" />
                            <h3 className="text-sm font-bold text-white">
                                Kontrol Cepat Stok Gudang &amp; Harga Grosir
                            </h3>
                        </div>
                        <Link 
                            href="/seller/catalog" 
                            className="text-xs text-slate-400 hover:text-white transition"
                        >
                            Kelola Semua &rarr;
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {inventory.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex items-center justify-between p-3 rounded-xl bg-[#12161F] border border-slate-800/80 hover:border-slate-700/80 transition"
                            >
                                <div className="space-y-0.5 min-w-0 pr-3">
                                    <div className="text-xs font-semibold text-white truncate">
                                        {item.name}
                                    </div>
                                    <div className={`text-[11px] ${
                                        item.status === 'critical' ? 'text-[#e09494] font-medium' : 'text-slate-400'
                                    }`}>
                                        Stok: {item.stock} {item.unit}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {item.status === 'critical' ? (
                                        <>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium badge-crimson">
                                                <span className="h-1.5 w-1.5 rounded-full dot-crimson shrink-0" />
                                                <span>Stok Kritis</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setActiveRestockModal(item)}
                                                className="px-3 py-1 rounded-lg btn-primary-bespoke text-xs font-medium active:scale-95"
                                            >
                                                + Restock
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => toggleStockReady(item.id)}
                                            className="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition badge-neutral hover:border-white/20"
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'dot-sage' : 'dot-neutral'}`} />
                                            <span>{item.is_active ? 'Ready Stock' : 'Nonaktif'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Card: Penugasan Teknisi Jaringan & Servis Hari Ini */}
                <div className="rounded-2xl border border-slate-800 bg-[#171B26] p-5 space-y-3.5 shadow-lg">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-[#9bb8f5]" />
                            <h3 className="text-sm font-bold text-white">
                                Penugasan Teknisi Jaringan &amp; Servis Hari Ini
                            </h3>
                        </div>
                        <Link 
                            href="/seller/services" 
                            className="text-xs text-slate-400 hover:text-white transition"
                        >
                            Jadwal Lengkap &rarr;
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {/* Task 1 */}
                        <div className="p-3.5 rounded-xl bg-[#12161F] border border-slate-800/80 space-y-2 hover:border-slate-700/80 transition">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-[#9bb8f5]" />
                                    <span>Tim Teknisi 1 (Andi &amp; Rian)</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">On-Site Area Bandung</span>
                            </div>
                            <div className="text-xs text-slate-300">
                                Lokasi: PT Maju Jaya Teknologi
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium badge-ochre">
                                    <Clock className="h-3 w-3 text-[#C79B64]" />
                                    <span>Instalasi LAN 10 Titik - 09:00 WIB</span>
                                </span>
                            </div>
                        </div>

                        {/* Task 2 */}
                        <div className="p-3.5 rounded-xl bg-[#12161F] border border-slate-800/80 space-y-1.5 hover:border-slate-700/80 transition">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-[#9bb8f5]" />
                                    <span>Tim Teknisi 2 (Dedi)</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#8cd4b4] font-medium">
                                    <span className="h-1.5 w-1.5 rounded-full dot-sage" />
                                    <span>Tersedia</span>
                                </span>
                            </div>
                            <div className="text-xs text-slate-300">
                                Maintenance Server Rutin
                            </div>
                        </div>
                    </div>

                    {/* Bottom Tip Note */}
                    <div className="pt-1 flex items-start gap-1.5 text-[11px] text-slate-400">
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
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <div className="text-[10px] font-semibold text-[#dec093] uppercase tracking-wider">
                                    Verifikasi Pengadaan B2B
                                </div>
                                <h3 className="text-base font-bold text-white">
                                    Penerbitan SPH Resmi: {activeRfqModal.code}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRfqModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-[#12161F] border border-slate-800/80 space-y-1">
                                <div className="text-slate-400 text-[11px]">Klien Instansi:</div>
                                <div className="font-bold text-white">{activeRfqModal.client}</div>
                                <div className="text-slate-400 text-[11px] pt-1">Daftar Kebutuhan:</div>
                                <div className="text-slate-200">{activeRfqModal.items}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-[#12161F] border border-slate-800/80">
                                    <div className="text-slate-400 text-[11px]">Estimasi Total Penawaran</div>
                                    <div className="text-base font-bold text-white mt-0.5">
                                        Rp {activeRfqModal.total.toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-[10px] text-[#8cd4b4] mt-0.5">Sudah Termasuk PPN 11%</div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#12161F] border border-slate-800/80">
                                    <div className="text-slate-400 text-[11px]">Margin Laba B2B</div>
                                    <div className="text-base font-bold text-[#dec093] mt-0.5">{activeRfqModal.margin}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Harga Rekomendasi Sistem</div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-300">
                                    Catatan / Masa Berlaku SPH:
                                </label>
                                <input
                                    type="text"
                                    defaultValue="SPH berlaku 14 hari kalender sejak tanggal penerbitan resmi."
                                    className="w-full h-9 rounded-lg bg-[#12161F] border border-slate-700 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setActiveRfqModal(null)}
                                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
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
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <div className="text-[10px] font-semibold text-[#9bb8f5] uppercase tracking-wider">
                                    DJP Faktur Pajak Elektronik
                                </div>
                                <h3 className="text-base font-bold text-white">
                                    Upload e-Faktur: {activeTaxModal.invoice_code}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTaxModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-[#12161F] border border-slate-800/80 space-y-1">
                                <div className="text-slate-400 text-[11px]">Nama Pembeli / PKP:</div>
                                <div className="font-bold text-white">{activeTaxModal.client_name}</div>
                                <div className="text-slate-400 text-[11px] pt-1">Total Nilai DPP + PPN 11%:</div>
                                <div className="text-white font-bold">{activeTaxModal.payment_status}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-300">
                                    Nomor Seri Faktur Pajak (NSFP):
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: 010.003-26.89201928"
                                    defaultValue="010.003-26.92018274"
                                    className="w-full h-9 rounded-lg bg-[#12161F] border border-slate-700 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-5 text-center space-y-2 hover:border-[#3651dc] transition cursor-pointer">
                                <Upload className="h-7 w-7 text-[#9bb8f5] mx-auto" />
                                <div className="text-xs text-white font-medium">
                                    Klik atau seret file PDF e-Faktur resmi di sini
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Maksimal ukuran file 5 MB (.PDF dengan QR-Code Valid DJP)
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setActiveTaxModal(null)}
                                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
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
                    <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-[#171B26] p-5 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div>
                                <h3 className="text-sm font-bold text-white">
                                    Restock: {activeRestockModal.name}
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Stok saat ini: {activeRestockModal.stock} {activeRestockModal.unit}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRestockModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            <p className="text-slate-300">Pilih jumlah penambahan stok dari supplier:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[5, 10, 25].map(qty => (
                                    <button
                                        key={qty}
                                        type="button"
                                        onClick={() => handleRestock(activeRestockModal.id, qty)}
                                        className="py-2.5 rounded-lg bg-[#12161F] border border-slate-700 hover:border-[#3651dc] hover:bg-[#3651dc]/10 text-white font-medium text-xs transition"
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
                                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
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
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    Tambah Komoditas / Layanan Baru
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Produk akan langsung tampil di etalase Portal B2B CV. Putra Nugraha.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveAddProductModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
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
                                <label className="text-[11px] font-semibold text-slate-300">Nama Produk / Jasa:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Mikrotik Cloud Router Switch CRS328"
                                    className="w-full h-9 rounded-lg bg-[#12161F] border border-slate-700 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-300">Kategori:</label>
                                    <select className="w-full h-9 rounded-lg bg-[#12161F] border border-slate-700 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]">
                                        <option>Hardware &amp; Server</option>
                                        <option>Networking &amp; Router</option>
                                        <option>Jasa Instalasi &amp; Servis</option>
                                        <option>Aksesoris IT</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-300">Stok Awal:</label>
                                    <input
                                        type="number"
                                        defaultValue="10"
                                        className="w-full h-9 rounded-lg bg-[#12161F] border border-slate-700 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-300">Harga Satuan (Sebelum PPN):</label>
                                <input
                                    type="text"
                                    defaultValue="Rp 6.850.000"
                                    className="w-full h-9 rounded-lg bg-[#12161F] border border-slate-700 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3651dc]"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveAddProductModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
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
