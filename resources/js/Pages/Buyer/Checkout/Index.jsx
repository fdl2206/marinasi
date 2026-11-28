import { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    MapPin, 
    ShieldCheck, 
    Plus,
    X,
    Building2,
    User,
    Phone,
    FileText,
    Check
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';

export default function CheckoutIndex({ orderSummary: serverSummary, buyerInfo: serverBuyerInfo }) {
    const { props } = usePage();
    const auth = props?.auth;

    // Financial Calculations
    const totalAmount = serverSummary?.total || 71900000;
    const dppAmount = Math.round(totalAmount / 1.11);
    const ppnAmount = totalAmount - dppAmount;

    // Saved Addresses State
    const [savedAddresses, setSavedAddresses] = useState([
        {
            id: 1,
            label: 'Kantor Pusat (Utama)',
            company_name: 'PT Maju Jaya Teknologi',
            pic_name: 'Budi Santoso',
            phone: '08123456789',
            recipient: 'PT Maju Jaya Teknologi (Attn: Budi Santoso - 08123456789)',
            address: 'Jl. Asia Afrika No. 128, Gedung Menara Lt. 5, Kota Bandung, Jawa Barat 40111',
            notes: 'Akses loading dock tersedia pk 09.00 - 17.00',
        }
    ]);
    const [selectedAddressId, setSelectedAddressId] = useState(1);

    // Modal & Form State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [formLabel, setFormLabel] = useState('');
    const [formCompany, setFormCompany] = useState('PT Maju Jaya Teknologi');
    const [formPic, setFormPic] = useState('Budi Santoso');
    const [formPhone, setFormPhone] = useState('08123456789');
    const [formAddress, setFormAddress] = useState('');
    const [formCity, setFormCity] = useState('Kota Bandung');
    const [formPostal, setFormPostal] = useState('40111');
    const [formNotes, setFormNotes] = useState('');
    const [formError, setFormError] = useState('');

    // Active Selected Address
    const currentAddress = useMemo(() => {
        return savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];
    }, [savedAddresses, selectedAddressId]);

    // Official WhatsApp Procurement Hotline URL (Dynamically reflects selected address)
    const whatsappMessage = useMemo(() => encodeURIComponent(
        `Halo CV. Putra Nugraha, saya ingin mengonfirmasi pesanan pengadaan B2B:\n\n` +
        `• Total Pembayaran: ${formatRupiah(totalAmount)} (Termasuk PPN 11%)\n` +
        `• Penerima: ${currentAddress.recipient}\n` +
        `• Alamat Pengiriman: ${currentAddress.address}\n\n` +
        `Mohon konfirmasi ketersediaan stok, invoice resmi, dan jadwal instalasi. Terima kasih!`
    ), [totalAmount, currentAddress]);

    const whatsappUrl = `https://wa.me/6281320777874?text=${whatsappMessage}`;

    const handleOpenModal = () => {
        setFormLabel('');
        setFormAddress('');
        setFormNotes('');
        setFormError('');
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        if (!formAddress.trim() || !formPic.trim() || !formPhone.trim()) {
            setFormError('Mohon lengkapi nama PIC, nomor telepon, dan alamat pengiriman.');
            return;
        }

        const newId = Date.now();
        const fullRecipient = `${formCompany.trim() || 'Perusahaan'} (Attn: ${formPic.trim()} - ${formPhone.trim()})`;
        const fullAddress = `${formAddress.trim()}, ${formCity.trim()}${formPostal.trim() ? ' ' + formPostal.trim() : ''}`;

        const newAddressObj = {
            id: newId,
            label: formLabel.trim() || `Alamat Pengiriman #${savedAddresses.length + 1}`,
            company_name: formCompany.trim(),
            pic_name: formPic.trim(),
            phone: formPhone.trim(),
            recipient: fullRecipient,
            address: fullAddress,
            notes: formNotes.trim(),
        };

        setSavedAddresses(prev => [...prev, newAddressObj]);
        setSelectedAddressId(newId);
        setIsAddressModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Pembayaran & Konfirmasi Pesanan — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <BuyerNavbar />

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
                            Pastikan alamat pengiriman untuk menyelesaikan pengadaan.
                        </p>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8]">
                        Faktur Pajak PPN 11%
                    </span>
                </div>

                {/* 2-Column Checkout Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: ADDRESS & TRANSACTION FLOW (8 COLS) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* CARD 1: ALAMAT PENGIRIMAN */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                    Alamat Pengiriman
                                </h2>
                                {savedAddresses.length > 1 && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {savedAddresses.length} Alamat Tersimpan
                                    </span>
                                )}
                            </div>

                            {/* List of Saved Addresses (Active one is highlighted) */}
                            <div className="space-y-3">
                                {savedAddresses.map((addr) => {
                                    const isSelected = addr.id === selectedAddressId;
                                    return (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`rounded-xl p-4 transition-all cursor-pointer relative ${
                                                isSelected
                                                    ? 'border border-[#086f8e] bg-sky-50/30 dark:bg-[#12161F] ring-1 ring-[#086f8e]/30'
                                                    : 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0C0D12] hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2.5">
                                                    <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#086f8e]' : 'text-slate-400'}`} />
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                                                {addr.recipient}
                                                            </p>
                                                            {addr.label && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                    {addr.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                            {addr.address}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#086f8e] dark:text-[#38bdf8] shrink-0">
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">Terpilih</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tambah Alamat Box */}
                            <button
                                type="button"
                                onClick={handleOpenModal}
                                className="w-full flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
                            >
                                <span className="h-4 w-4 rounded-full bg-[#086f8e] text-white flex items-center justify-center text-[10px] font-bold">
                                    +
                                </span>
                                <span>Tambah Alamat</span>
                            </button>
                        </div>

                        {/* CARD 2: KONFIRMASI ALUR TRANSAKSI VIA WHATSAPP */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-5 shadow-sm">
                            <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                Konfirmasi Alur Transaksi Via Whatsapp
                            </h2>

                            <div className="space-y-4">
                                {/* Step 1 */}
                                <div className="flex items-start gap-4">
                                    <div className="h-9 w-9 rounded-full bg-[#086f8e] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                        1
                                    </div>
                                    <div className="pt-1 space-y-0.5">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            Klik tombol "Lanjutkan Pesanan Via Whatsapp"
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Rincian produk, alamat tujuan, dan kalkulasi tagihan pengadaan Anda akan terangkum secara otomatis.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-4">
                                    <div className="h-9 w-9 rounded-full bg-[#086f8e] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                        2
                                    </div>
                                    <div className="pt-1 space-y-0.5">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            Koordinasi dengan Sales &amp; Tim Teknis CV. Putra Nugraha
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Tim kami akan memvalidasi jadwal instalasi perangkat keras, draft SPH, serta NPWP perusahaan untuk e-Faktur.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start gap-4">
                                    <div className="h-9 w-9 rounded-full bg-[#086f8e] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                        3
                                    </div>
                                    <div className="pt-1 space-y-0.5">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            Penerbitan Invoice Resmi, e-Faktur Pajak &amp; BAST
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Setelah kesepakatan final disetujui, faktur pajak resmi DJP dan dokumen BAST akan diterbitkan bersama pengiriman.
                                        </p>
                                    </div>
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
                            <div className="space-y-3 pt-1 text-xs border-t border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                    <span>Subtotal Produk:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {formatRupiah(totalAmount)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>Biaya Pengiriman &amp; Instalasi:</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
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
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Total Pembayaran
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {formatRupiah(totalAmount)}
                                </div>
                                <div className="text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8]">
                                    Faktur Pajak PPN 11%
                                </div>
                            </div>

                            {/* Action Button: Lanjutkan Pesanan Via Whatsapp */}
                            <div className="pt-1">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center text-center active:scale-[0.98]"
                                >
                                    Lanjutkan Pesanan Via Whatsapp
                                </a>
                            </div>

                            {/* Security SSL & Factur Pajak Guarantee */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 text-[#086f8e] shrink-0 mt-0.5" />
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
            {/* MODAL: TAMBAH ALAMAT PENGIRIMAN                           */}
            {/* ========================================================= */}
            <Modal show={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSaveAddress} className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                    
                    {/* Modal Header */}
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Tambah Alamat Pengiriman Baru
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Alamat kantor, gudang, atau data center untuk pengiriman &amp; instalasi perangkat.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {formError && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
                            {formError}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4 text-xs">
                        
                        {/* Label Alamat */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Label Alamat (Opsional)
                            </label>
                            <input
                                type="text"
                                value={formLabel}
                                onChange={(e) => setFormLabel(e.target.value)}
                                placeholder="Contoh: Kantor Cabang Dago, Gudang Cimahi, Server Room"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                        </div>

                        {/* Nama Perusahaan */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Nama Perusahaan / Instansi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formCompany}
                                onChange={(e) => setFormCompany(e.target.value)}
                                placeholder="PT Maju Jaya Teknologi"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                        </div>

                        {/* PIC & No Telepon */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Nama PIC Penerima <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formPic}
                                    onChange={(e) => setFormPic(e.target.value)}
                                    placeholder="Nama penanggung jawab"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    No. HP / WhatsApp PIC <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formPhone}
                                    onChange={(e) => setFormPhone(e.target.value)}
                                    placeholder="08123456789"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Alamat Lengkap */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Alamat Lengkap Gedung / Ruangan <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="3"
                                value={formAddress}
                                onChange={(e) => setFormAddress(e.target.value)}
                                placeholder="Nama jalan, gedung, nomor kavling, lantai/ruangan, RT/RW..."
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e] resize-none"
                                required
                            />
                        </div>

                        {/* Kota & Kode Pos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Kota / Kabupaten
                                </label>
                                <input
                                    type="text"
                                    value={formCity}
                                    onChange={(e) => setFormCity(e.target.value)}
                                    placeholder="Kota Bandung"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Kode Pos
                                </label>
                                <input
                                    type="text"
                                    value={formPostal}
                                    onChange={(e) => setFormPostal(e.target.value)}
                                    placeholder="40111"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>
                        </div>

                        {/* Catatan Khusus */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Catatan Pengiriman &amp; Akses (Opsional)
                            </label>
                            <input
                                type="text"
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                placeholder="Contoh: Izin loading dock satpam, lantai 3 lift barat"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                        </div>

                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(false)}
                            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-md transition"
                        >
                            Simpan &amp; Gunakan Alamat
                        </button>
                    </div>

                </form>
            </Modal>

            {/* ========================================================= */}
            {/* FOOTER PORTAL B2B & WA HOTLINE                            */}
            {/* ========================================================= */}
            <BuyerFooter />

        </div>
    );
}
