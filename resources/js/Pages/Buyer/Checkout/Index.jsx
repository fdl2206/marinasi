import { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    MapPin,
    ShieldCheck,
    X,
    Check,
    AlertTriangle,
    ShoppingCart,
    Package,
    Wrench,
    Loader2,
    FileText,
    ArrowLeft,
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';

export default function CheckoutIndex({
    checkout_items: checkoutItems = [],
    idempotency_key: idempotencyKey = '',
    summary = {},
    prefill = {},
}) {
    const { props } = usePage();
    const user = props?.auth?.user;
    const errors = props?.errors || {};

    const defaultCompany = user?.company_name || '';
    const defaultPic = user?.name || '';
    const defaultPhone = user?.phone || '';
    const defaultAddressText = user?.company_address || '';

    const initialAddress = {
        id: 'primary',
        label: 'Alamat Profil Akun',
        company_name: defaultCompany,
        pic_name: defaultPic,
        phone: defaultPhone,
        address: defaultAddressText,
    };

    const [savedAddresses, setSavedAddresses] = useState([initialAddress]);
    const [selectedAddressId, setSelectedAddressId] = useState('primary');

    const [prReference, setPrReference] = useState(prefill?.pr_reference || '');
    const [npwpNumber, setNpwpNumber] = useState(prefill?.npwp_number || '');
    const [shippingNotes, setShippingNotes] = useState(prefill?.shipping_notes || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal tambah/ubah alamat pengiriman
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingPrimary, setEditingPrimary] = useState(false);
    const [formLabel, setFormLabel] = useState('');
    const [formCompany, setFormCompany] = useState(defaultCompany);
    const [formPic, setFormPic] = useState(defaultPic);
    const [formPhone, setFormPhone] = useState(defaultPhone);
    const [formAddress, setFormAddress] = useState(defaultAddressText);
    const [formError, setFormError] = useState('');

    const currentAddress = useMemo(
        () => savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0],
        [savedAddresses, selectedAddressId]
    );

    const totalAmount = Number(summary?.total_amount ?? 0);
    const dppAmount = Number(summary?.dpp_amount ?? Math.round(totalAmount / 1.11));
    const ppnAmount = Number(summary?.ppn_amount ?? totalAmount - dppAmount);
    const hasUnpricedItems = Boolean(summary?.has_unpriced_items);
    const canSubmit = Boolean(summary?.can_submit) && checkoutItems.length > 0;

    const isAddressComplete = Boolean(
        currentAddress?.company_name?.trim() &&
        currentAddress?.pic_name?.trim() &&
        currentAddress?.phone?.trim() &&
        currentAddress?.address?.trim()?.length >= 10
    );

    const openAddressModal = (isEditPrimary = false) => {
        setEditingPrimary(isEditPrimary);
        if (isEditPrimary && currentAddress) {
            setFormLabel(currentAddress.label || 'Alamat Pengiriman Utama');
            setFormCompany(currentAddress.company_name || '');
            setFormPic(currentAddress.pic_name || '');
            setFormPhone(currentAddress.phone || '');
            setFormAddress(currentAddress.address || '');
        } else {
            setFormLabel('');
            setFormCompany(defaultCompany);
            setFormPic(defaultPic);
            setFormPhone(defaultPhone);
            setFormAddress('');
        }
        setFormError('');
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        if (!formCompany.trim() || !formPic.trim() || !formPhone.trim() || formAddress.trim().length < 10) {
            setFormError('Lengkapi nama instansi, nama PIC, nomor telepon, dan alamat lengkap (minimal 10 karakter).');
            return;
        }

        if (editingPrimary && currentAddress) {
            setSavedAddresses((prev) =>
                prev.map((addr) =>
                    addr.id === currentAddress.id
                        ? {
                              ...addr,
                              label: formLabel.trim() || addr.label,
                              company_name: formCompany.trim(),
                              pic_name: formPic.trim(),
                              phone: formPhone.trim(),
                              address: formAddress.trim(),
                          }
                        : addr
                )
            );
        } else {
            const newId = `addr-${Date.now()}`;
            setSavedAddresses((prev) => [
                ...prev,
                {
                    id: newId,
                    label: formLabel.trim() || `Alamat Pengiriman #${prev.length + 1}`,
                    company_name: formCompany.trim(),
                    pic_name: formPic.trim(),
                    phone: formPhone.trim(),
                    address: formAddress.trim(),
                },
            ]);
            setSelectedAddressId(newId);
        }

        setIsAddressModalOpen(false);
    };

    const handleSubmitOrder = () => {
        if (!canSubmit || isSubmitting) return;

        if (!isAddressComplete) {
            openAddressModal(true);
            return;
        }

        setIsSubmitting(true);
        router.post(
            '/buyer/checkout',
            {
                idempotency_key: idempotencyKey,
                cart_item_ids: checkoutItems.map((item) => item.id),
                company_name: currentAddress.company_name,
                buyer_name: currentAddress.pic_name,
                buyer_phone: currentAddress.phone,
                shipping_address: currentAddress.address,
                shipping_notes: shippingNotes || null,
                pr_reference: prReference || null,
                npwp_number: npwpNumber || null,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const firstError =
        errors?.cart_item_ids ||
        errors?.shipping_address ||
        errors?.company_name ||
        errors?.buyer_name ||
        errors?.buyer_phone ||
        errors?.idempotency_key ||
        errors?.verification;

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Checkout & Konfirmasi Pesanan — CV. Putra Nugraha" />

            <BuyerNavbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/buyer/cart"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#086f8e] dark:hover:text-[#38bdf8] mb-2 transition"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Keranjang</span>
                        </Link>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Checkout &amp; Konfirmasi Pesanan
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Periksa alamat pengiriman, rincian produk, lalu buat pesanan resmi untuk diproses ke tahap MOU &amp; DP.
                        </p>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8]">
                        Faktur Pajak PPN 11%
                    </span>
                </div>

                {firstError && (
                    <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{firstError}</span>
                    </div>
                )}

                {checkoutItems.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-12 text-center space-y-4 shadow-sm">
                        <ShoppingCart className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Belum Ada Item Siap Checkout
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            Tambahkan barang atau jasa aktif ke keranjang terlebih dahulu sebelum melanjutkan checkout pengadaan.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-1">
                            <Link
                                href="/portal"
                                className="px-4 py-2.5 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition"
                            >
                                Jelajahi Katalog
                            </Link>
                            <Link
                                href="/buyer/orders"
                                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
                            >
                                Lihat Pesanan Saya
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN (8 COLS) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* CARD 1: ALAMAT PENGIRIMAN */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                        Data Pemesan &amp; Alamat Pengiriman
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => openAddressModal(true)}
                                        className="text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8] hover:underline"
                                    >
                                        Ubah Alamat Terpilih
                                    </button>
                                </div>

                                {!isAddressComplete && (
                                    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <div>
                                            Data alamat/instansi di profil Anda belum lengkap. Klik{' '}
                                            <button
                                                type="button"
                                                onClick={() => openAddressModal(true)}
                                                className="font-bold underline"
                                            >
                                                Ubah Alamat Terpilih
                                            </button>{' '}
                                            sebelum membuat pesanan.
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {savedAddresses.map((addr) => {
                                        const isSelected = addr.id === selectedAddressId;
                                        return (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`rounded-xl p-4 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border border-[#086f8e] bg-sky-50/30 dark:bg-[#12161F] ring-1 ring-[#086f8e]/30'
                                                        : 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0C0D12] hover:border-slate-300 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <MapPin
                                                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                                                                isSelected ? 'text-[#086f8e]' : 'text-slate-400'
                                                            }`}
                                                        />
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                                                    {addr.company_name || 'Nama Instansi Belum Diisi'}
                                                                </p>
                                                                {addr.label && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                        {addr.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                                PIC: {addr.pic_name || '-'} • Telp: {addr.phone || '-'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                                {addr.address || 'Alamat pengiriman belum diisi'}
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

                                <button
                                    type="button"
                                    onClick={() => openAddressModal(false)}
                                    className="w-full flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0D12] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
                                >
                                    <span className="h-4 w-4 rounded-full bg-[#086f8e] text-white flex items-center justify-center text-[10px] font-bold">
                                        +
                                    </span>
                                    <span>Tambah Alamat Pengiriman Lain</span>
                                </button>
                            </div>

                            {/* CARD 2: RINCIAN PRODUK & JASA */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                        Rincian Item Pesanan ({checkoutItems.length})
                                    </h2>
                                    <Link
                                        href="/buyer/cart"
                                        className="text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8] hover:underline"
                                    >
                                        Ubah di Keranjang
                                    </Link>
                                </div>

                                {hasUnpricedItems && (
                                    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>
                                            Terdapat item yang belum memiliki harga acuan. Item tanpa harga harus diajukan melalui{' '}
                                            <Link href="/buyer/rfq/create" className="font-bold underline">
                                                Halaman RFQ
                                            </Link>{' '}
                                            atau hapus/uncheck item tersebut dari keranjang terlebih dahulu.
                                        </span>
                                    </div>
                                )}

                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {checkoutItems.map((item) => (
                                        <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] flex items-center justify-center overflow-hidden shrink-0">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="max-h-full max-w-full object-contain p-1"
                                                    />
                                                ) : item.type === 'service' ? (
                                                    <Wrench className="h-5 w-5 text-slate-400" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                        {item.name}
                                                    </p>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                                        {item.type === 'service' ? 'Jasa' : 'Barang'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {item.quantity} {item.unit} × {formatRupiah(item.price)}
                                                    {item.sku ? ` • SKU: ${item.sku}` : ''}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                    {item.is_priced ? formatRupiah(item.line_total) : 'Perlu RFQ'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CARD 3: REFERENSI PENGADAAN & CATATAN */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                    <FileText className="h-4 w-4 text-[#086f8e] dark:text-[#38bdf8]" />
                                    <span>Referensi Pengadaan &amp; Catatan (Opsional)</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Nomor Referensi PR / PO Internal
                                        </label>
                                        <input
                                            type="text"
                                            value={prReference}
                                            onChange={(e) => setPrReference(e.target.value)}
                                            placeholder="Contoh: PR/IT/2026/001"
                                            className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            NPWP Instansi / Perusahaan
                                        </label>
                                        <input
                                            type="text"
                                            value={npwpNumber}
                                            onChange={(e) => setNpwpNumber(e.target.value)}
                                            placeholder="Masukkan NPWP untuk keperluan faktur"
                                            className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Catatan Pengiriman / Jadwal Pelaksanaan
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={shippingNotes}
                                        onChange={(e) => setShippingNotes(e.target.value)}
                                        placeholder="Contoh: Kirim di jam kerja 09.00-16.00 WIB, hubungi satpam/PIC gudang..."
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: STICKY SUMMARY (4 COLS) */}
                        <div className="lg:col-span-4">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-5 sticky top-24 shadow-sm dark:shadow-xl">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                        Ringkasan Pesanan
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {summary?.item_count || checkoutItems.length} item • {summary?.total_units || 0} unit/paket
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                        <span>Subtotal Produk &amp; Jasa:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {formatRupiah(totalAmount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                        <span>Dasar Pengenaan Pajak (DPP):</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatRupiah(dppAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                        <span>PPN 11% (Inklusif):</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatRupiah(ppnAmount)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Tagihan</div>
                                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {formatRupiah(totalAmount)}
                                    </div>
                                    <div className="text-[11px] font-semibold text-[#086f8e] dark:text-[#38bdf8]">
                                        Tahap Awal: MOU / Pesanan
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleSubmitOrder}
                                        disabled={!canSubmit || isSubmitting}
                                        className="w-full py-3 rounded-lg bg-[#086f8e] hover:bg-[#065b75] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Menyimpan Pesanan...</span>
                                            </>
                                        ) : (
                                            <span>Buat Pesanan &amp; Lanjut Konfirmasi WA</span>
                                        )}
                                    </button>
                                </div>

                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                                    <div className="flex items-start gap-2">
                                        <ShieldCheck className="h-4 w-4 text-[#086f8e] shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">
                                            Pesanan disimpan resmi di sistem pada tahap <strong>MOU / Pesanan</strong>. Setelah itu Anda dapat langsung mengirim ringkasan pesanan ke WhatsApp resmi CV. Putra Nugraha untuk konfirmasi pembayaran DP/pelunasan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL TAMBAH / UBAH ALAMAT */}
            <Modal show={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSaveAddress} className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {editingPrimary ? 'Ubah Data Penerima & Alamat Pengiriman' : 'Tambah Alamat Pengiriman Baru'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Alamat instansi, kantor, atau lokasi pelaksanaan jasa.
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

                    <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Label Alamat (Opsional)</label>
                            <input
                                type="text"
                                value={formLabel}
                                onChange={(e) => setFormLabel(e.target.value)}
                                placeholder="Contoh: Kantor Pusat, Gudang, Ruang Server"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Nama Instansi / Perusahaan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formCompany}
                                onChange={(e) => setFormCompany(e.target.value)}
                                placeholder="Masukkan nama instansi atau perusahaan"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                        </div>

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
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
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
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="3"
                                value={formAddress}
                                onChange={(e) => setFormAddress(e.target.value)}
                                placeholder="Nama jalan, gedung, lantai/ruangan, kota, kode pos..."
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#086f8e] resize-none"
                                required
                            />
                        </div>
                    </div>

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

            <BuyerFooter />
        </div>
    );
}
