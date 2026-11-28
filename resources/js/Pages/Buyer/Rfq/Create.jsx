import { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Search, 
    ShoppingCart, 
    Building2, 
    FileText, 
    Calendar, 
    UploadCloud, 
    Trash2, 
    Plus, 
    Minus, 
    ChevronDown, 
    MessageSquare, 
    FileCheck2, 
    Download, 
    Server, 
    Layers, 
    Wrench, 
    Laptop, 
    CheckCircle2, 
    FileSpreadsheet,
    X
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';

const CATEGORY_OPTIONS = [
    { id: 'server', label: 'Pengadaan IT / Server', icon: Server, unit: 'Unit' },
    { id: 'network', label: 'Spare Part & Jaringan', icon: Layers, unit: 'Unit' },
    { id: 'cctv_lan', label: 'Pemasangan CCTV & LAN', icon: Wrench, unit: 'Paket' },
    { id: 'computer', label: 'Komputer & Laptop Kantor', icon: Laptop, unit: 'Unit' },
];

export default function RfqCreate() {
    const { props } = usePage();
    const auth = props?.auth;

    // 1. Data Perusahaan & Administrasi Pajak
    const [companyName, setCompanyName] = useState('PT Maju Jaya Teknologi');
    const [npwpNumber, setNpwpNumber] = useState('01.234.567.8-423.000');
    const [picName, setPicName] = useState('Budi Santoso (IT Procurement)');
    const [picContact, setPicContact] = useState('budi@majujaya.co.id / 0812-3456-7890');

    // 2. Rincian Kebutuhan Barang / Jasa IT (Sesuai Mockup 1:1)
    const [items, setItems] = useState([
        {
            id: 'item-1',
            category_id: 'server',
            category_label: 'Pengadaan IT / Server',
            name: 'Server HPE ProLiant ML30 Gen10 (PN:SRV-ML30G10)',
            qty: 4,
            unit: 'Unit',
            target_budget: 31500000,
        },
        {
            id: 'item-2',
            category_id: 'network',
            category_label: 'Spare Part & Jaringan',
            name: 'Cisco Catalyst Switch 24-Port Gigabit',
            qty: 6,
            unit: 'Unit',
            target_budget: 15000000,
        },
        {
            id: 'item-3',
            category_id: 'cctv_lan',
            category_label: 'Pemasangan CCTV & LAN',
            name: 'Paket Jasa Instalasi Jaringan LAN Kantor (10 Titik)',
            qty: 1,
            unit: 'Paket',
            target_budget: 8500000,
        },
    ]);

    // 3. Lampiran Dokumen RAB & Preferensi Pembayaran
    const [attachedFile, setAttachedFile] = useState(null);
    const [paymentTerms, setPaymentTerms] = useState('Termin PO 30 Hari (Khusus Klien Korporat Terverifikasi)');
    const [targetDate, setTargetDate] = useState('2026-11-20');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const fileInputRef = useRef(null);

    // Dynamic Calculations
    const totalPagu = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.target_budget || 0)), 0);
    const dpp = Math.round(totalPagu / 1.11);
    const ppn = totalPagu - dpp;
    const totalUnits = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleQtyChange = (id, delta) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleCategoryChange = (id, newCatId) => {
        const cat = CATEGORY_OPTIONS.find(c => c.id === newCatId);
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    category_id: newCatId,
                    category_label: cat ? cat.label : 'Kebutuhan Pengadaan',
                    unit: cat ? cat.unit : 'Unit',
                };
            }
            return item;
        }));
    };

    const handleAddItem = () => {
        const newItem = {
            id: `item-${Date.now()}`,
            category_id: 'computer',
            category_label: 'Komputer & Laptop Kantor',
            name: '',
            qty: 1,
            unit: 'Unit',
            target_budget: 0,
        };
        setItems(prev => [...prev, newItem]);
    };

    const handleDeleteItem = (id) => {
        if (items.length <= 1) {
            alert('Minimal satu baris rincian kebutuhan harus diisi.');
            return;
        }
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile({
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            });
        }
    };

    const handleSubmitRfq = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccessModal(true);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Formulir Pengajuan RFQ & Permintaan SPH Resmi — CV. Putra Nugraha" />

            {/* Navbar Header */}
            <BuyerNavbar />

            {/* ========================================================= */}
            {/* HERO BANNER SECTION (SOLID OCEAN TEAL / NAVY GRADIENT)    */}
            {/* ========================================================= */}
            <div 
                className="rfq-hero-banner text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-teal-900/50"
                style={{
                    backgroundColor: '#086f8e',
                    backgroundImage: 'linear-gradient(135deg, #075269 0%, #086f8e 50%, #064557 100%)',
                }}
            >
                <div className="max-w-7xl mx-auto space-y-2.5">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs text-teal-100/90 font-medium">
                        <Link href="/portal" className="hover:text-white hover:underline transition">Beranda</Link>
                        <span>/</span>
                        <Link href="/buyer/dashboard" className="hover:text-white hover:underline transition">Pengadaan IT (B2B)</Link>
                        <span>/</span>
                        <span className="text-white font-semibold">Formulir Pengajuan RFQ &amp; SPH</span>
                    </nav>

                    {/* Page Headline */}
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white uppercase font-display drop-shadow-xs">
                            Formulir Pengajuan RFQ &amp; Permintaan SPH Resmi
                        </h1>
                        <p className="text-xs sm:text-sm text-teal-50/95 max-w-4xl leading-relaxed">
                            Ajukan daftar kebutuhan pengadaan laptop, komputer, printer, server, jaringan LAN, atau pemasangan CCTV untuk mendapatkan harga grosir proyek beserta Faktur Pajak PPN 11%.
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MAIN TWO-COLUMN CONTENT AREA                              */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmitRfq} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ===================================================== */}
                    {/* LEFT COLUMN: FORM SECTIONS 1, 2, 3 (8 COLS)           */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* ------------------------------------------------- */}
                        {/* 1. DATA PERUSAHAAN & ADMINISTRASI FAKTUR PAJAK    */}
                        {/* ------------------------------------------------- */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-sm">
                            
                            <div className="space-y-2 border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    1. Data Perusahaan / Instansi &amp; Administrasi Faktur Pajak
                                </h2>
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                                        <FileText className="h-3 w-3 shrink-0 text-rose-500" />
                                        <span>Wajib NPWP untuk e-Faktur</span>
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                
                                {/* Nama Perusahaan */}
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Perusahaan / Instansi <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                        required
                                    />
                                </div>

                                {/* Nomor NPWP */}
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor NPWP Perusahaan (16 Digit) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={npwpNumber}
                                        onChange={(e) => setNpwpNumber(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs font-mono text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                        required
                                    />
                                </div>

                                {/* PIC Pengadaan */}
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Lengkap PIC Pengadaan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={picName}
                                        onChange={(e) => setPicName(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                        required
                                    />
                                </div>

                                {/* Email & WhatsApp */}
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Email Resmi &amp; Nomor WhatsApp PIC <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={picContact}
                                        onChange={(e) => setPicContact(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                        required
                                    />
                                </div>

                            </div>

                        </div>

                        {/* ------------------------------------------------- */}
                        {/* 2. RINCIAN KEBUTUHAN BARANG / JASA IT             */}
                        {/* ------------------------------------------------- */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            
                            {/* Card Header & Add Button */}
                            <div className="space-y-2.5 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    2. Rincian Kebutuhan Barang / Jasa IT
                                </h2>

                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                    <span>Tambah Baris Produk/Jasa</span>
                                </button>
                            </div>

                            {/* Item Rows List */}
                            <div className="space-y-4">
                                {items.map((item) => {
                                    const CurrentCat = CATEGORY_OPTIONS.find(c => c.id === item.category_id) || CATEGORY_OPTIONS[0];
                                    const CatIcon = CurrentCat.icon;

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0C0D12] p-4 space-y-3.5 relative"
                                        >
                                            {/* Top Row: Category Dropdown & Trash Button */}
                                            <div className="flex items-center justify-between gap-3">
                                                
                                                {/* Category Selector Pill with Proper Padding */}
                                                <div className="relative inline-flex items-center">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#086f8e] dark:text-[#38bdf8] z-10">
                                                        <CatIcon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <select
                                                        value={item.category_id}
                                                        onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                                        className="appearance-none bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e] cursor-pointer shadow-2xs"
                                                    >
                                                        {CATEGORY_OPTIONS.map(cat => (
                                                            <option key={cat.id} value={cat.id}>
                                                                {cat.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    </div>
                                                </div>

                                                {/* Delete Row Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                                    title="Hapus baris ini"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Product / Service Name Input */}
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                    Nama Produk / Spesifikasi Barang atau Jasa
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                    placeholder="Contoh: Server HPE ProLiant ML30 Gen10, Cisco Switch, etc."
                                                    className="w-full h-10 rounded-xl bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                                    required
                                                />
                                            </div>

                                            {/* Quantity Stepper & Target Budget Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                                
                                                {/* Kuantitas Stepper */}
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                        Kuantitas
                                                    </label>
                                                    <div className="flex items-center h-10 rounded-xl bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-2 justify-between">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(item.id, -1)}
                                                            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold text-sm"
                                                        >
                                                            &minus;
                                                        </button>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {item.qty} {item.unit}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(item.id, 1)}
                                                            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold text-sm"
                                                        >
                                                            &#43;
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Target Budget / Unit */}
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                        Target Budget{item.unit === 'Unit' ? '/Unit' : ''}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={item.target_budget ? `Rp ${new Intl.NumberFormat('id-ID').format(item.target_budget)}` : ''}
                                                            onChange={(e) => {
                                                                const rawNum = Number(e.target.value.replace(/[^0-9]/g, ''));
                                                                handleItemChange(item.id, 'target_budget', rawNum);
                                                            }}
                                                            placeholder="Rp 0"
                                                            className="w-full h-10 rounded-xl bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        {/* ------------------------------------------------- */}
                        {/* 3. LAMPIRAN DOKUMEN RAB & PREFERENSI TERMIN       */}
                        {/* ------------------------------------------------- */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            
                            <div className="border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    3. Lampiran Dokumen RAB / BoQ &amp; Preferensi Termin Pembayaran
                                </h2>
                            </div>

                            {/* Drag & Drop Upload Container */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".pdf,.xlsx,.xls,.docx,.doc"
                                className="hidden"
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-[#086f8e]/50 dark:border-slate-700 hover:border-[#086f8e] rounded-2xl p-6 text-center space-y-2 bg-slate-50/70 dark:bg-[#0C0D12] hover:bg-teal-50/20 dark:hover:bg-[#12161F] transition cursor-pointer"
                            >
                                <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#086f8e] dark:text-[#38bdf8] flex items-center justify-center mx-auto">
                                    <UploadCloud className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                        Tarik &amp; letakkan file RAB, Daftar Spesifikasi, atau KAK di sini, atau <span className="text-[#086f8e] dark:text-[#38bdf8] underline">Klik Cari File</span>
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Mendukung PDF, Excel (.xlsx), atau Word (.docx) &mdash; Maks. 10MB
                                    </p>
                                </div>
                            </div>

                            {/* Attached File Preview Pill (If selected) */}
                            {attachedFile && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs">
                                    <div className="flex items-center gap-2 text-[#086f8e] dark:text-teal-300 font-semibold truncate">
                                        <FileSpreadsheet className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{attachedFile.name} ({attachedFile.size})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }}
                                        className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Row 2: Metode Pembayaran & Target Tanggal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                                
                                {/* Metode Pembayaran */}
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Metode Pembayaran yang Diajukan
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={paymentTerms}
                                            onChange={(e) => setPaymentTerms(e.target.value)}
                                            className="w-full h-10 appearance-none rounded-xl bg-slate-50/70 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 pr-8 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e] cursor-pointer"
                                        >
                                            <option value="Termin PO 30 Hari (Khusus Klien Korporat Terverifikasi)">
                                                Termin PO 30 Hari (Khusus Klien Korporat Terverifikasi)
                                            </option>
                                            <option value="Termin PO 14 Hari">
                                                Termin PO 14 Hari
                                            </option>
                                            <option value="DP 50% & Pelunasan Setelah BAST">
                                                DP 50% &amp; Pelunasan Setelah BAST
                                            </option>
                                            <option value="Cash Before Delivery (CBD)">
                                                Cash Before Delivery (CBD)
                                            </option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Target Tanggal Kebutuhan */}
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Target Tanggal Barang / Instalasi Dibutuhkan
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={targetDate}
                                            onChange={(e) => setTargetDate(e.target.value)}
                                            className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 pr-9 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Row 3: Catatan Tambahan */}
                            <div className="space-y-1.5 text-xs pt-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Catatan Tambahan / Permintaan Survei Lokasi (Misal: Jadwal survei titik CCTV &amp; kabel LAN)
                                </label>
                                <textarea
                                    rows="3"
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    placeholder="Tuliskan kebutuhan teknis, alamat lokasi, atau jadwal survei yang diinginkan..."
                                    className="w-full rounded-xl bg-slate-50/70 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#086f8e] focus:ring-1 focus:ring-[#086f8e] resize-none"
                                />
                            </div>

                        </div>

                    </div>

                    {/* ===================================================== */}
                    {/* RIGHT COLUMN: RINGKASAN & WORKFLOW STEPS (4 COLS)     */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-4 space-y-5 sticky top-24">
                        
                        {/* 1. Card Ringkasan Pengajuan RFQ */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            
                            {/* Top Header Badge */}
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#086f8e] dark:text-[#38bdf8] uppercase tracking-wider">
                                <FileCheck2 className="h-3.5 w-3.5" />
                                <span>PENGADAAN KORPORAT</span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Ringkasan Pengajuan RFQ
                            </h3>

                            {/* Breakdown Data */}
                            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <div className="flex items-center justify-between">
                                    <span>Total Kategori:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {items.length} Jenis ({totalUnits} Unit/Paket)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Estimasi DPP:</span>
                                    <span>{formatRupiah(dpp)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>PPN 11% (e-Faktur Resmi):</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        {formatRupiah(ppn)}
                                    </span>
                                </div>
                            </div>

                            {/* Total Pagu (Warna Merah Sesuai Mockup) */}
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    Estimasi Total Pagu:
                                </span>
                                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                                    {formatRupiah(totalPagu)}
                                </div>
                            </div>

                            {/* 3 Step Workflow Process (Numbered Circles Sesuai Mockup) */}
                            <div className="space-y-3 pt-2 text-xs border-t border-slate-200 dark:border-slate-800/80">
                                
                                {/* Step 1 */}
                                <div className="flex items-start gap-2.5">
                                    <div className="h-5 w-5 rounded-full bg-[#086f8e] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                        1
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 leading-snug">
                                        Kirim Formulir RFQ &amp; Lampiran RAB
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-2.5">
                                    <div className="h-5 w-5 rounded-full bg-[#086f8e] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                        2
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 leading-snug">
                                        Verifikasi Stok &amp; Harga Diskon Grosir oleh Admin CV. Putra Nugraha (Maks. 1&times;24 Jam)
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start gap-2.5">
                                    <div className="h-5 w-5 rounded-full bg-[#086f8e] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                        3
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 leading-snug">
                                        Terima Dokumen SPH Resmi (PDF Berstempel) di Dashboard untuk Penerbitan PO
                                    </p>
                                </div>

                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2.5 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan RFQ Sekarang'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => alert('Mengunduh berkas draft rincian estimasi SPH format PDF resmi CV. Putra Nugraha...')}
                                    className="w-full py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <FileText className="h-3.5 w-3.5 text-slate-950" />
                                    <span>Unduh Draft Estimasi SPH (PDF)</span>
                                </button>
                            </div>

                        </div>

                        {/* 2. Card Hotline Bantuan Survei Jaringan (Deep Navy Sesuai Mockup) */}
                        <div className="rounded-2xl bg-[#0a2540] text-white p-4 sm:p-5 space-y-2 border border-[#0a2540] shadow-sm">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                                <MessageSquare className="h-4 w-4" />
                                <span>Butuh Survei Jaringan / Konsultasi RAB?</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                WhatsApp Teknis: <a href="https://wa.me/6281320777874" target="_blank" rel="noopener noreferrer" className="text-white font-semibold underline hover:text-amber-300">081320777874</a> | Jl. Palintang Kav. 2 Ujung Berung Bandung
                            </p>
                        </div>

                    </div>

                </form>
            </main>

            {/* ========================================================= */}
            {/* SUCCESS SUBMISSION MODAL                                  */}
            {/* ========================================================= */}
            <Modal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="md">
                <div className="p-6 text-center space-y-4 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Pengajuan RFQ Berhasil Dikirim!
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Tim Sales &amp; Estimator CV. Putra Nugraha akan segera meninjau spesifikasi barang/jasa dan menerbitkan Surat Penawaran Harga (SPH) resmi dalam 1&times;24 jam kerja.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1">
                        <div className="flex justify-between text-slate-500">
                            <span>Perusahaan:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{companyName}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Estimasi Total Pagu:</span>
                            <span className="font-bold text-rose-600 dark:text-rose-400">{formatRupiah(totalPagu)}</span>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-3">
                        <Link
                            href="/buyer/quotations"
                            className="w-full py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition shadow-sm"
                        >
                            Pantau di Status Pengajuan SPH
                        </Link>
                    </div>
                </div>
            </Modal>

            {/* Footer */}
            <BuyerFooter />

        </div>
    );
}
