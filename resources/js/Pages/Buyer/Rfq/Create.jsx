import { useState, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    FileText,
    UploadCloud,
    Trash2,
    Plus,
    Minus,
    AlertTriangle,
    Loader2,
    ShieldCheck,
    Paperclip,
    X,
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import { formatRupiah } from '@/Components/Buyer/ProductCard';

const PAYMENT_TERM_PRESETS = [
    'DP 50% + Pelunasan saat Serah Terima (Sesuai Kesepakatan)',
    'Lunas di Awal (Transfer Resmi)',
    'DP 30% + Pelunasan sebelum Pengiriman',
    'Termin Instansi / SPK (Sesuai Kesepakatan)',
];

function createEmptyItem() {
    return {
        local_id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        product_id: '',
        product_name: '',
        product_type: 'goods',
        unit: 'unit',
        quantity: 1,
        requested_unit_price: '',
    };
}

export default function RfqCreate({ prefill_items: prefillItems = [], catalog_products: catalogProducts = [] }) {
    const { props } = usePage();
    const user = props?.auth?.user;
    const errors = props?.errors || {};

    // 1. Data Instansi & Pengiriman (dari akun yang login)
    const [companyName, setCompanyName] = useState(user?.company_name || '');
    const [picName, setPicName] = useState(user?.name || '');
    const [picEmail, setPicEmail] = useState(user?.email || '');
    const [picPhone, setPicPhone] = useState(user?.phone || '');
    const [npwpNumber, setNpwpNumber] = useState('');
    const [shippingAddress, setShippingAddress] = useState(user?.company_address || '');

    // 2. Rincian Kebutuhan Barang / Jasa
    const [items, setItems] = useState(() => {
        if (Array.isArray(prefillItems) && prefillItems.length > 0) {
            return prefillItems.map((item, idx) => ({
                local_id: `prefill-${idx}-${item.product_id || idx}`,
                product_id: item.product_id ?? '',
                product_name: item.product_name || '',
                product_type: item.product_type || 'goods',
                unit: item.unit || (item.product_type === 'service' ? 'paket' : 'unit'),
                quantity: Math.max(1, Number(item.quantity) || 1),
                requested_unit_price:
                    item.requested_unit_price !== null && item.requested_unit_price !== undefined
                        ? String(item.requested_unit_price)
                        : '',
            }));
        }

        return [createEmptyItem()];
    });

    // 3. Lampiran & Preferensi
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [paymentTermsNote, setPaymentTermsNote] = useState(PAYMENT_TERM_PRESETS[0]);
    const [targetDeliveryDate, setTargetDeliveryDate] = useState('');
    const [buyerNotes, setBuyerNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    const totalPagu = items.reduce((sum, item) => {
        const price = Number(item.requested_unit_price);
        if (!Number.isFinite(price) || price <= 0) return sum;
        return sum + price * (Number(item.quantity) || 0);
    }, 0);
    const dpp = Math.round(totalPagu / 1.11);
    const ppn = totalPagu - dpp;
    const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    const handleItemChange = (localId, field, value) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.local_id !== localId) return item;
                if (field === 'product_type') {
                    return {
                        ...item,
                        product_type: value,
                        unit: value === 'service' ? 'paket' : 'unit',
                    };
                }
                return { ...item, [field]: value };
            })
        );
    };

    const handleCatalogSelect = (localId, productIdStr) => {
        if (!productIdStr) {
            handleItemChange(localId, 'product_id', '');
            return;
        }
        const product = catalogProducts.find((p) => String(p.id) === String(productIdStr));
        if (!product) return;

        setItems((prev) =>
            prev.map((item) =>
                item.local_id === localId
                    ? {
                          ...item,
                          product_id: product.id,
                          product_name: product.name,
                          product_type: product.type,
                          unit: product.unit || (product.type === 'service' ? 'paket' : 'unit'),
                          quantity: Math.max(item.quantity, Number(product.moq) || 1),
                          requested_unit_price:
                              product.price !== null && product.price !== undefined ? String(product.price) : '',
                      }
                    : item
            )
        );
    };

    const handleQtyChange = (localId, delta) => {
        setItems((prev) =>
            prev.map((item) =>
                item.local_id === localId
                    ? { ...item, quantity: Math.max(1, (Number(item.quantity) || 1) + delta) }
                    : item
            )
        );
    };

    const handleAddItem = () => {
        setItems((prev) => [...prev, createEmptyItem()]);
    };

    const handleRemoveItem = (localId) => {
        if (items.length <= 1) return;
        setItems((prev) => prev.filter((item) => item.local_id !== localId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        router.post(
            '/buyer/rfq',
            {
                company_name: companyName,
                pic_name: picName,
                pic_email: picEmail,
                pic_phone: picPhone,
                npwp_number: npwpNumber || null,
                shipping_address: shippingAddress,
                payment_terms_note: paymentTermsNote || null,
                target_delivery_date: targetDeliveryDate || null,
                buyer_notes: buyerNotes || null,
                attachment: attachmentFile || null,
                items: items.map((item) => ({
                    product_id: item.product_id || null,
                    product_name: item.product_name,
                    product_type: item.product_type,
                    unit: item.unit || null,
                    quantity: Number(item.quantity) || 1,
                    requested_unit_price:
                        item.requested_unit_price !== '' && item.requested_unit_price !== null
                            ? Number(item.requested_unit_price)
                            : null,
                })),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const errorEntries = Object.values(errors || {});

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-150">
            <Head title="Formulir Pengajuan RFQ & Permintaan SPH — CV. Putra Nugraha" />

            <BuyerNavbar />

            {/* HERO BANNER */}
            <div
                className="text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-teal-900/50"
                style={{
                    backgroundColor: '#086f8e',
                    backgroundImage: 'linear-gradient(135deg, #075269 0%, #086f8e 50%, #064557 100%)',
                }}
            >
                <div className="max-w-7xl mx-auto space-y-2.5">
                    <nav className="flex items-center gap-2 text-xs text-teal-100/90 font-medium">
                        <Link href="/portal" className="hover:text-white hover:underline transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <Link href="/buyer/quotations" className="hover:text-white hover:underline transition">
                            Status RFQ &amp; SPH
                        </Link>
                        <span>/</span>
                        <span className="text-white font-semibold">Ajukan RFQ Baru</span>
                    </nav>

                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white uppercase font-display">
                            Formulir Pengajuan RFQ &amp; Permintaan SPH Resmi
                        </h1>
                        <p className="text-xs sm:text-sm text-teal-50/95 max-w-4xl leading-relaxed">
                            Ajukan rincian pengadaan barang maupun jasa IT beserta lampiran RAB/BoQ untuk mendapatkan penawaran harga resmi (SPH) dari CV. Putra Nugraha.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {errorEntries.length > 0 && (
                    <div className="mb-6 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>Mohon periksa kembali isian formulir RFQ:</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5">
                            {errorEntries.map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN (8 COLS) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. DATA PERUSAHAAN */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-sm">
                            <div className="border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    1. Data Instansi / Perusahaan &amp; Alamat Pengiriman
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Otomatis diisi dari profil akun Anda dan dapat disesuaikan untuk proyek ini.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Instansi / Perusahaan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor NPWP (Opsional untuk e-Faktur)
                                    </label>
                                    <input
                                        type="text"
                                        value={npwpNumber}
                                        onChange={(e) => setNpwpNumber(e.target.value)}
                                        placeholder="Contoh: 01.234.567.8-423.000"
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Lengkap PIC <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={picName}
                                        onChange={(e) => setPicName(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Email PIC <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={picEmail}
                                        onChange={(e) => setPicEmail(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor WhatsApp / Telepon PIC <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={picPhone}
                                        onChange={(e) => setPicPhone(e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Target Tanggal Pengiriman / Pelaksanaan (Opsional)
                                    </label>
                                    <input
                                        type="date"
                                        value={targetDeliveryDate}
                                        onChange={(e) => setTargetDeliveryDate(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Alamat Pengiriman / Lokasi Pekerjaan <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows="2"
                                        required
                                        minLength={10}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Alamat lengkap instansi, gedung, kota..."
                                        className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. RINCIAN ITEM */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        2. Rincian Kebutuhan Barang / Jasa
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Pilih item dari katalog resmi atau ketik spesifikasi kebutuhan proyek secara manual.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Tambah Baris</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div
                                        key={item.local_id}
                                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0C0D12] p-4 space-y-3 text-xs"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-slate-500">Item #{idx + 1}</span>
                                                <select
                                                    value={item.product_type}
                                                    onChange={(e) => handleItemChange(item.local_id, 'product_type', e.target.value)}
                                                    className="rounded-lg bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold"
                                                >
                                                    <option value="goods">Barang</option>
                                                    <option value="service">Jasa</option>
                                                </select>
                                                {catalogProducts.length > 0 && (
                                                    <select
                                                        value={item.product_id || ''}
                                                        onChange={(e) => handleCatalogSelect(item.local_id, e.target.value)}
                                                        className="rounded-lg bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs max-w-[240px]"
                                                    >
                                                        <option value="">-- Pilih dari katalog (opsional) --</option>
                                                        {catalogProducts.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                [{p.type === 'service' ? 'Jasa' : 'Barang'}] {p.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.local_id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                            <div className="md:col-span-5 space-y-1">
                                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                                    Nama Barang / Jasa &amp; Spesifikasi <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.product_name}
                                                    onChange={(e) => handleItemChange(item.local_id, 'product_name', e.target.value)}
                                                    placeholder="Contoh: Server HPE ML30 Gen10 / Jasa Instalasi LAN"
                                                    className="w-full h-9 rounded-lg bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-3 text-xs"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-1">
                                                <label className="font-semibold text-slate-700 dark:text-slate-300">Satuan</label>
                                                <input
                                                    type="text"
                                                    value={item.unit}
                                                    onChange={(e) => handleItemChange(item.local_id, 'unit', e.target.value)}
                                                    placeholder="unit / paket"
                                                    className="w-full h-9 rounded-lg bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-3 text-xs"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-1">
                                                <label className="font-semibold text-slate-700 dark:text-slate-300">Jumlah</label>
                                                <div className="flex items-center justify-between h-9 rounded-lg bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQtyChange(item.local_id, -1)}
                                                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="font-bold">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQtyChange(item.local_id, 1)}
                                                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="md:col-span-3 space-y-1">
                                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                                    Target Harga / Unit (Opsional)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    value={item.requested_unit_price}
                                                    onChange={(e) =>
                                                        handleItemChange(item.local_id, 'requested_unit_price', e.target.value)
                                                    }
                                                    placeholder="Kosongkan jika minta harga"
                                                    className="w-full h-9 rounded-lg bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700 px-3 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. LAMPIRAN RAB & TERMIN */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-sm text-xs">
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/80 pb-3">
                                3. Lampiran RAB / BoQ &amp; Preferensi Pembayaran
                            </h2>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Lampiran Dokumen RAB / BoQ / KAK (Opsional, maks 5 MB)
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {attachmentFile ? (
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Paperclip className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span className="font-semibold truncate">{attachmentFile.name}</span>
                                            <span className="text-[11px] text-slate-500 shrink-0">
                                                ({(attachmentFile.size / (1024 * 1024)).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttachmentFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="p-1 rounded text-slate-500 hover:text-rose-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#086f8e] p-5 text-center space-y-1.5 transition"
                                    >
                                        <UploadCloud className="h-6 w-6 text-[#086f8e] mx-auto" />
                                        <div className="font-semibold text-slate-700 dark:text-slate-200">
                                            Klik untuk unggah PDF, Excel, Word, atau Gambar
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            Disimpan di penyimpanan privat — hanya bisa dilihat Anda &amp; Admin CV. Putra Nugraha
                                        </div>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Skema Pembayaran yang Diusulkan (DP / Lunas Sesuai Kesepakatan)
                                </label>
                                <select
                                    value={paymentTermsNote}
                                    onChange={(e) => setPaymentTermsNote(e.target.value)}
                                    className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 text-xs"
                                >
                                    {PAYMENT_TERM_PRESETS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Catatan Tambahan untuk Tim Penawaran (Opsional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={buyerNotes}
                                    onChange={(e) => setBuyerNotes(e.target.value)}
                                    placeholder="Tuliskan kebutuhan khusus, spesifikasi tambahan, jadwal survei lokasi, dll."
                                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STICKY SUMMARY (4 COLS) */}
                    <div className="lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-5 sticky top-24 shadow-sm">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                    Ringkasan Pengajuan RFQ
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {items.length} baris kebutuhan • {totalUnits} total unit/paket
                                </p>
                            </div>

                            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>Estimasi Pagu Anda:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {totalPagu > 0 ? formatRupiah(totalPagu) : 'Menunggu Penawaran Admin'}
                                    </span>
                                </div>
                                {totalPagu > 0 && (
                                    <>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Estimasi DPP:</span>
                                            <span>{formatRupiah(dpp)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Estimasi PPN 11%:</span>
                                            <span>{formatRupiah(ppn)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl bg-[#086f8e] hover:bg-[#065b75] disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Mengirim Pengajuan RFQ...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4" />
                                        <span>Kirim Pengajuan RFQ Resmi</span>
                                    </>
                                )}
                            </button>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                                <ShieldCheck className="h-4 w-4 text-[#086f8e] shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    Admin akan meninjau kebutuhan Anda dan menerbitkan penawaran resmi (SPH). Setelah Anda menyepakati penawaran, <strong>harga &amp; jumlah akan terkunci</strong> dan langsung menjadi Pesanan resmi.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <BuyerFooter />
        </div>
    );
}
