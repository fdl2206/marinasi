import { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    FileText,
    ShieldCheck,
} from 'lucide-react';
import { formatRupiah } from '@/Components/Buyer/ProductCard';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';

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

function resolveCartItemUrl(action, cartItemId) {
    if (typeof window !== 'undefined' && typeof window.route === 'function') {
        const routeName =
            action === 'update' ? 'buyer.cart.items.update' : 'buyer.cart.items.destroy';
        try {
            return window.route(routeName, cartItemId);
        } catch {
            // Fallback ke URL langsung bila route helper belum memuat route ini
        }
    }

    return `/buyer/cart/items/${cartItemId}`;
}

function normalizeCartItems(rawItems, previousSelectionMap = {}) {
    const source = Array.isArray(rawItems) ? rawItems : DEFAULT_CART_ITEMS;
    return source.map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        stock: Number(item.stock) || 99,
        selected:
            Object.prototype.hasOwnProperty.call(previousSelectionMap, item.id)
                ? previousSelectionMap[item.id]
                : item.selected ?? true,
    }));
}

export default function CartIndex({ cart_items: serverCartItems }) {
    const [items, setItems] = useState(() => normalizeCartItems(serverCartItems));
    const [busyItemIds, setBusyItemIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);

    // Procurement & Tax Form Data (Backend-ready)
    const [prReference, setPrReference] = useState('');
    const [companyNpwp, setCompanyNpwp] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');

    useEffect(() => {
        if (Array.isArray(serverCartItems)) {
            setItems((prev) => {
                const selectionMap = Object.fromEntries(
                    prev.map((entry) => [entry.id, entry.selected])
                );
                return normalizeCartItems(serverCartItems, selectionMap);
            });
        }
    }, [serverCartItems]);

    const setItemBusy = (id, busy) => {
        setBusyItemIds((prev) =>
            busy ? [...new Set([...prev, id])] : prev.filter((itemId) => itemId !== id)
        );
    };

    const isItemBusy = (id) => busyItemIds.includes(id) || isBulkDeleting;

    // Checkbox toggles
    const allSelected = useMemo(
        () => items.length > 0 && items.every((i) => i.selected),
        [items]
    );

    const toggleSelectAll = () => {
        const nextState = !allSelected;
        setItems((prev) => prev.map((item) => ({ ...item, selected: nextState })));
    };

    const toggleSelectItem = (id) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
        );
    };

    const handleQuantityChange = (item, delta) => {
        if (isItemBusy(item.id)) return;

        const nextQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
        if (nextQty === item.quantity) return;

        const previousItems = items;
        setFeedbackMessage(null);
        setItemBusy(item.id, true);

        setItems((prev) =>
            prev.map((entry) =>
                entry.id === item.id ? { ...entry, quantity: nextQty } : entry
            )
        );

        router.patch(
            resolveCartItemUrl('update', item.id),
            { quantity: nextQty },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setItems(previousItems);
                    const errorText =
                        errors?.quantity ||
                        errors?.product_id ||
                        'Gagal memperbarui jumlah item di keranjang.';
                    setFeedbackMessage({ type: 'error', text: errorText });
                },
                onFinish: () => {
                    setItemBusy(item.id, false);
                },
            }
        );
    };

    const handleRemoveItem = (item) => {
        if (isItemBusy(item.id)) return;

        const previousItems = items;
        setFeedbackMessage(null);
        setItemBusy(item.id, true);

        setItems((prev) => prev.filter((entry) => entry.id !== item.id));

        router.delete(resolveCartItemUrl('destroy', item.id), {
            preserveScroll: true,
            onError: () => {
                setItems(previousItems);
                setFeedbackMessage({
                    type: 'error',
                    text: 'Gagal menghapus item dari keranjang.',
                });
            },
            onFinish: () => {
                setItemBusy(item.id, false);
            },
        });
    };

    const handleRemoveSelected = () => {
        const targets = items.filter((item) => item.selected);
        if (targets.length === 0 || isBulkDeleting) return;

        const previousItems = items;
        const targetIds = new Set(targets.map((t) => t.id));

        setFeedbackMessage(null);
        setIsBulkDeleting(true);
        setItems((prev) => prev.filter((entry) => !targetIds.has(entry.id)));

        const deleteSequentially = (index) => {
            if (index >= targets.length) {
                setIsBulkDeleting(false);
                return;
            }

            const currentTarget = targets[index];
            router.delete(resolveCartItemUrl('destroy', currentTarget.id), {
                preserveScroll: true,
                onSuccess: () => {
                    deleteSequentially(index + 1);
                },
                onError: () => {
                    setItems(previousItems);
                    setIsBulkDeleting(false);
                    setFeedbackMessage({
                        type: 'error',
                        text: 'Sebagian atau seluruh item pilihan gagal dihapus dari keranjang.',
                    });
                },
            });
        };

        deleteSequentially(0);
    };

    const cartCount = useMemo(
        () => items.reduce((acc, curr) => acc + curr.quantity, 0),
        [items]
    );

    // Selected items metrics
    const selectedItems = useMemo(() => items.filter((i) => i.selected), [items]);
    const totalUnits = useMemo(
        () => selectedItems.reduce((acc, curr) => acc + curr.quantity, 0),
        [selectedItems]
    );

    // Financial calculations (PPN 11% Inklusif)
    const totalPrice = useMemo(() => {
        return selectedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    }, [selectedItems]);

    const dppAmount = useMemo(() => {
        return Math.round(totalPrice / 1.11);
    }, [totalPrice]);

    const ppnAmount = useMemo(() => {
        return totalPrice - dppAmount;
    }, [totalPrice, dppAmount]);

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Keranjang Pengadaan B2B — CV. Putra Nugraha" />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <BuyerNavbar cartCount={cartCount} />

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA                                         */}
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
                    <span className="self-start sm:self-auto text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8]">
                        Faktur Pajak PPN 11%
                    </span>
                </div>

                {feedbackMessage && (
                    <div
                        role="alert"
                        className={`rounded-xl border px-4 py-3 text-xs font-medium ${
                            feedbackMessage.type === 'error'
                                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                        }`}
                    >
                        {feedbackMessage.text}
                    </div>
                )}

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
                                    disabled={isBulkDeleting}
                                    className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 disabled:opacity-40 transition font-medium cursor-pointer"
                                >
                                    {isBulkDeleting ? 'Menghapus...' : 'Hapus Pilihan'}
                                </button>
                            )}
                        </div>

                        {/* Cart Items List */}
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] space-y-3 shadow-sm">
                                    <ShoppingCart className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Keranjang Pengadaan Kosong
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Belum ada barang atau jasa yang ditambahkan ke keranjang pengadaan.
                                    </p>
                                    <Link
                                        href="/portal"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold transition"
                                    >
                                        Buka Katalog Pengadaan
                                    </Link>
                                </div>
                            ) : (
                                items.map((item) => {
                                    const itemBusy = isItemBusy(item.id);

                                    return (
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
                                                    <div className="flex items-start justify-between gap-2">
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

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item)}
                                                            disabled={itemBusy}
                                                            aria-label={`Hapus ${item.name}`}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-40 transition cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
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
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                                {item.tax_badge}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Price, Stepper & Subtotal Row */}
                                                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
                                                        <div>
                                                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                {item.unit === 'paket'
                                                                    ? 'Harga per paket:'
                                                                    : 'Harga satuan:'}
                                                            </span>
                                                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                                {formatRupiah(item.price)}
                                                                {item.unit === 'paket' && (
                                                                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                                                        {' '}
                                                                        / paket
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Quantity Stepper & Item Subtotal */}
                                                        <div className="flex items-center justify-between sm:justify-end gap-5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                                                                    Jumlah
                                                                </span>
                                                                <div className="flex items-center rounded-lg bg-slate-100 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 p-0.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleQuantityChange(item, -1)}
                                                                        disabled={itemBusy || item.quantity <= 1}
                                                                        className="h-6 w-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </button>
                                                                    <span className="font-bold text-xs text-slate-900 dark:text-white px-2.5">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleQuantityChange(item, 1)}
                                                                        disabled={itemBusy || item.quantity >= item.stock}
                                                                        className="h-6 w-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block sm:hidden">
                                                                    Subtotal
                                                                </span>
                                                                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                                    {formatRupiah(item.price * item.quantity)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Informasi Pengadaan & Pajak Card */}
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
                                    <span className="text-slate-700 dark:text-slate-300">
                                        {formatRupiah(dppAmount)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>PPN 11% (Faktur Pajak Resmi):</span>
                                    <span className="text-slate-700 dark:text-slate-300">
                                        {formatRupiah(ppnAmount)}{' '}
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                            (Termasuk)
                                        </span>
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span>Estimasi Pengiriman &amp; Survei:</span>
                                    <span className="text-emerald-600 dark:text-[#8cd4b4] font-medium">
                                        Gratis{' '}
                                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                                            (Area Bandung)
                                        </span>
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
                                    className="w-full py-3 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center text-center active:scale-[0.98]"
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
            {/* FOOTER PORTAL B2B & WA HOTLINE                            */}
            {/* ========================================================= */}
            <BuyerFooter />
        </div>
    );
}
