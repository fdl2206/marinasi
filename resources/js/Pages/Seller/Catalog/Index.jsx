import { useEffect, useMemo, useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Search,
    Plus,
    Box,
    AlertTriangle,
    CheckCircle2,
    SlidersHorizontal,
    Edit3,
    Trash2,
    RefreshCw,
    X,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    FolderTree,
    ImagePlus,
} from 'lucide-react';

function specsObjectToRows(specs) {
    if (!specs || typeof specs !== 'object') {
        return [];
    }

    return Object.entries(specs).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
    }));
}

function specRowsToObject(rows) {
    const obj = {};
    rows.forEach((row) => {
        const k = (row.key || '').trim();
        if (k) {
            obj[k] = (row.value || '').trim();
        }
    });

    return Object.keys(obj).length > 0 ? obj : '';
}

function formatRp(num) {
    if (num === null || num === undefined || num === '') {
        return 'Hubungi untuk penawaran';
    }

    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function formatStock(qty, unit) {
    if (qty === null || qty === undefined || qty === '') {
        return 'Belum dikonfirmasi';
    }

    const numeric = Number(qty);
    const formatted = Number.isInteger(numeric) ? String(numeric) : String(numeric);
    return `${formatted}${unit ? ` ${unit}` : ''}`;
}

export default function SellerCatalogIndex({
    products: paginatedProducts = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    categories = [],
    filters = {},
    stats = {},
}) {
    const productRows = Array.isArray(paginatedProducts?.data) ? paginatedProducts.data : [];
    const activeCategories = useMemo(
        () => categories.filter((cat) => cat.is_active),
        [categories]
    );

    // Filter & Search States (synced with server query)
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategoryId, setSelectedCategoryId] = useState(filters.category_id || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [stockFilter, setStockFilter] = useState(filters.stock_status || 'all');

    useEffect(() => {
        setSearchQuery(filters.search || '');
        setSelectedCategoryId(filters.category_id || '');
        setSelectedType(filters.type || '');
        setStockFilter(filters.stock_status || 'all');
    }, [filters.search, filters.category_id, filters.type, filters.stock_status]);

    // Toast notification state
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [specRows, setSpecRows] = useState([]);
    const [deletingImageId, setDeletingImageId] = useState(null);

    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockTarget, setRestockTarget] = useState(null);
    const [restockQty, setRestockQty] = useState(10);
    const [restockBusy, setRestockBusy] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryError, setCategoryError] = useState('');

    const productForm = useForm({
        category_id: activeCategories[0]?.id ? String(activeCategories[0].id) : '',
        name: '',
        type: 'goods',
        sku: '',
        description: '',
        price: '',
        stock_quantity: '',
        stock_unit: 'Unit',
        moq: '',
        is_active: true,
        images: [],
    });

    const categoryForm = useForm({
        name: '',
        is_active: true,
    });

    const applyServerFilters = (overrides = {}) => {
        const next = {
            search: searchQuery,
            category_id: selectedCategoryId,
            type: selectedType,
            stock_status: stockFilter,
            ...overrides,
        };

        router.get(
            route('seller.catalog.index'),
            {
                search: next.search || undefined,
                category_id: next.category_id || undefined,
                type: next.type || undefined,
                stock_status: next.stock_status && next.stock_status !== 'all' ? next.stock_status : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Keep editingProduct in sync after image deletion / server reload
    useEffect(() => {
        if (editingProduct) {
            const refreshed = productRows.find((row) => row.id === editingProduct.id);
            if (refreshed) {
                setEditingProduct(refreshed);
            }
        }
    }, [productRows]);

    const openAddProductModal = () => {
        setEditingProduct(null);
        productForm.clearErrors();
        productForm.setData({
            category_id: activeCategories[0]?.id ? String(activeCategories[0].id) : '',
            name: '',
            type: 'goods',
            sku: '',
            description: '',
            price: '',
            stock_quantity: '',
            stock_unit: 'Unit',
            moq: '',
            is_active: true,
            images: [],
        });
        setSpecRows([]);
        setIsProductModalOpen(true);
    };

    const openEditProductModal = (item) => {
        setEditingProduct(item);
        productForm.clearErrors();
        productForm.setData({
            category_id: String(item.category_id ?? ''),
            name: item.name ?? '',
            type: item.type ?? 'goods',
            sku: item.sku ?? '',
            description: item.description ?? '',
            price: item.price !== null && item.price !== undefined ? String(Number(item.price)) : '',
            stock_quantity: item.stock_quantity !== null && item.stock_quantity !== undefined ? String(Number(item.stock_quantity)) : '',
            stock_unit: item.stock_unit ?? '',
            moq: item.moq !== null && item.moq !== undefined ? String(item.moq) : '',
            is_active: Boolean(item.is_active),
            images: [],
        });
        setSpecRows(specsObjectToRows(item.specifications));
        setIsProductModalOpen(true);
    };

    const handleProductSubmit = (e) => {
        e.preventDefault();

        const payloadBuilder = (data) => {
            const payload = {
                category_id: data.category_id,
                name: data.name,
                type: data.type,
                sku: data.sku,
                description: data.description,
                specifications: specRowsToObject(specRows),
                price: data.price,
                stock_quantity: data.type === 'service' ? '' : data.stock_quantity,
                stock_unit: data.stock_unit,
                moq: data.moq,
                is_active: data.is_active ? 1 : 0,
            };

            if (Array.isArray(data.images) && data.images.length > 0) {
                payload.images = data.images;
            }

            if (editingProduct) {
                payload._method = 'put';
            }

            return payload;
        };

        productForm.transform(payloadBuilder);

        const targetUrl = editingProduct
            ? route('seller.products.update', editingProduct.id)
            : route('seller.products.store');

        productForm.post(targetUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsProductModalOpen(false);
                productForm.setData('images', []);
                showToast(
                    editingProduct
                        ? `Produk "${productForm.data.name}" berhasil diperbarui.`
                        : `Produk "${productForm.data.name}" berhasil ditambahkan ke katalog.`
                );
            },
        });
    };

    const handleDeleteProductImage = (productId, imageId) => {
        setDeletingImageId(imageId);
        router.delete(route('seller.products.images.destroy', [productId, imageId]), {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Foto produk berhasil dihapus.');
            },
            onError: () => {
                showToast('Gagal menghapus foto produk.', 'error');
            },
            onFinish: () => {
                setDeletingImageId(null);
            },
        });
    };

    const handleToggleProductActive = (item) => {
        const nextStatus = !item.is_active;
        router.put(
            route('seller.products.update', item.id),
            {
                category_id: item.category_id,
                name: item.name,
                type: item.type,
                sku: item.sku,
                is_active: nextStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(`Status "${item.name}" diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}.`);
                },
                onError: () => {
                    showToast('Gagal mengubah status produk.', 'error');
                },
            }
        );
    };

    const handleOpenRestock = (item) => {
        setRestockTarget(item);
        setRestockQty(10);
        setIsRestockModalOpen(true);
    };

    const handleConfirmRestock = (e) => {
        e.preventDefault();
        if (!restockTarget) return;

        const currentStock = restockTarget.stock_quantity !== null ? Number(restockTarget.stock_quantity) : 0;
        const added = Number(restockQty) || 0;
        if (added <= 0) return;

        setRestockBusy(true);
        router.put(
            route('seller.products.update', restockTarget.id),
            {
                category_id: restockTarget.category_id,
                name: restockTarget.name,
                type: restockTarget.type,
                sku: restockTarget.sku,
                stock_quantity: currentStock + added,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsRestockModalOpen(false);
                    showToast(`Stok "${restockTarget.name}" bertambah +${added} ${restockTarget.stock_unit || 'unit'}.`);
                },
                onError: () => {
                    showToast('Gagal memperbarui stok produk.', 'error');
                },
                onFinish: () => {
                    setRestockBusy(false);
                },
            }
        );
    };

    const handleConfirmDeleteProduct = () => {
        if (!deleteTarget) return;

        setDeleteBusy(true);
        router.delete(route('seller.products.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                showToast(`Produk "${deleteTarget.name}" berhasil dihapus.`);
                setDeleteTarget(null);
            },
            onError: () => {
                showToast('Gagal menghapus produk.', 'error');
            },
            onFinish: () => {
                setDeleteBusy(false);
            },
        });
    };

    // Category CRUD handlers
    const openCategoryModal = () => {
        setEditingCategory(null);
        setCategoryError('');
        categoryForm.clearErrors();
        categoryForm.setData({ name: '', is_active: true });
        setIsCategoryModalOpen(true);
    };

    const startEditCategory = (cat) => {
        setEditingCategory(cat);
        setCategoryError('');
        categoryForm.clearErrors();
        categoryForm.setData({ name: cat.name, is_active: Boolean(cat.is_active) });
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        setCategoryError('');

        if (editingCategory) {
            categoryForm.patch(route('seller.categories.update', editingCategory.id), {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(`Kategori "${categoryForm.data.name}" berhasil diperbarui.`);
                    setEditingCategory(null);
                    categoryForm.reset();
                    categoryForm.setData('is_active', true);
                },
            });
            return;
        }

        categoryForm.post(route('seller.categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Kategori "${categoryForm.data.name}" berhasil ditambahkan.`);
                categoryForm.reset();
                categoryForm.setData('is_active', true);
            },
        });
    };

    const handleDeleteCategory = (cat) => {
        setCategoryError('');
        router.delete(route('seller.categories.destroy', cat.id), {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Kategori "${cat.name}" berhasil dihapus.`);
            },
            onError: (errors) => {
                setCategoryError(errors?.category || 'Kategori tidak dapat dihapus.');
            },
        });
    };

    // Collect image upload validation errors
    const imageErrors = Object.entries(productForm.errors)
        .filter(([key]) => key === 'images' || key.startsWith('images.'))
        .map(([, msg]) => msg);

    const catalogGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 2.5fr) minmax(130px, 1.1fr) minmax(130px, 1fr) minmax(105px, 0.9fr) 105px 80px',
        gap: '0.75rem',
        alignItems: 'center',
    };

    const totalKpi = stats.total ?? paginatedProducts.total ?? productRows.length;
    const goodsKpi = stats.goods ?? 0;
    const servicesKpi = stats.services ?? 0;
    const readyStockKpi = stats.ready_stock ?? 0;
    const criticalStockKpi = stats.critical_stock ?? 0;

    return (
        <SellerLayout title="Katalog Produk, Jasa & Stok B2B">
            <Head title="Manajemen Katalog Produk, Jasa & Stok B2B — Back-Office" />

            {/* TOAST ALERT */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-semibold ${
                        toast.type === 'error'
                            ? 'bg-rose-950 text-rose-100 border-rose-500/40'
                            : 'bg-[#0a2540] text-white border-sky-500/40'
                    }`}
                >
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${toast.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span>{toast.message}</span>
                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        className="ml-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* 1. HEADER & ACTION BUTTONS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                            Manajemen Katalog Produk, Jasa &amp; Stok B2B
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Kelola kategori, produk/jasa, foto katalog, harga acuan, dan ketersediaan stok secara langsung.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={openCategoryModal}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                        >
                            <FolderTree className="h-4 w-4 text-[#086f8e]" />
                            <span>Kelola Kategori ({categories.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={openAddProductModal}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                            <span>Tambah Produk / Jasa</span>
                        </button>
                    </div>
                </div>

                {/* 2. KPI STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Total Item Katalog
                            </span>
                            <div className="p-1 rounded-lg text-[#086f8e] dark:text-[#38bdf8]">
                                <Box className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {totalKpi} Item
                        </div>
                        <div className="text-[11px] text-slate-400">
                            {goodsKpi} Barang + {servicesKpi} Jasa ({stats.active ?? 0} aktif)
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Stok Tercatat Tersedia
                            </span>
                            <div className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {readyStockKpi} Produk
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Item dengan jumlah stok lebih dari 0
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Peringatan Stok Kritis / Habis
                            </span>
                            <div className="p-1 rounded-lg text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                            {criticalStockKpi} Produk
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Barang dengan stok tercatat ≤ 2 unit
                        </div>
                    </div>
                </div>

                {/* 3. CATEGORY PILL TABS */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCategoryId('');
                            applyServerFilters({ category_id: '' });
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            !selectedCategoryId
                                ? 'bg-[#086f8e] text-white shadow-2xs'
                                : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        Semua Kategori ({totalKpi})
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                                setSelectedCategoryId(cat.id);
                                applyServerFilters({ category_id: cat.id });
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                Number(selectedCategoryId) === cat.id
                                    ? 'bg-[#086f8e] text-white shadow-2xs'
                                    : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            {cat.name} ({cat.products_count ?? 0})
                            {!cat.is_active ? ' • Nonaktif' : ''}
                        </button>
                    ))}
                </div>

                {/* 4. SEARCH & FILTER BAR */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyServerFilters();
                        }}
                        className="relative flex-1"
                    >
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama produk atau SKU lalu tekan Enter..."
                            className="w-full pl-9 pr-20 h-10 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#086f8e] hover:bg-[#065871] text-white text-[11px] font-semibold cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>

                    <select
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            applyServerFilters({ type: e.target.value });
                        }}
                        className="h-10 px-3.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#086f8e] cursor-pointer"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="goods">Barang</option>
                        <option value="service">Jasa</option>
                    </select>

                    <div className="relative shrink-0">
                        <select
                            value={stockFilter}
                            onChange={(e) => {
                                setStockFilter(e.target.value);
                                applyServerFilters({ stock_status: e.target.value });
                            }}
                            className="h-10 px-3.5 pr-8 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#086f8e] cursor-pointer appearance-none"
                        >
                            <option value="all">Semua Status Stok</option>
                            <option value="ready">Ready Stock (&gt;2)</option>
                            <option value="critical">Stok Kritis (1–2)</option>
                            <option value="out_of_stock">Stok Habis (0)</option>
                            <option value="unknown">Stok Belum Diisi</option>
                        </select>
                        <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* 5. MAIN CATALOG TABLE */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] shadow-2xs overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Daftar Produk &amp; Layanan
                        </h2>
                        <span className="text-xs text-slate-400">
                            {paginatedProducts.total ?? productRows.length} item ditemukan
                        </span>
                    </div>

                    <div className="overflow-x-auto p-4 sm:p-5 no-scrollbar">
                        <div className="min-w-[820px] space-y-3">
                            <div
                                style={catalogGridStyle}
                                className="px-5 py-2 text-[11px] font-semibold text-slate-400 select-none items-center"
                            >
                                <div>Info Produk / Layanan &amp; SKU</div>
                                <div>Kategori</div>
                                <div>Harga Acuan</div>
                                <div>Stok Gudang</div>
                                <div className="text-center">Status Publikasi</div>
                                <div className="text-center">Aksi</div>
                            </div>

                            {productRows.length === 0 ? (
                                <div className="py-12 text-center space-y-2">
                                    <Box className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Belum ada produk atau SKU yang cocok
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Tambahkan produk baru atau ubah kata kunci pencarian di atas.
                                    </p>
                                </div>
                            ) : (
                                productRows.map((item) => {
                                    const stockNum = item.stock_quantity !== null && item.stock_quantity !== undefined ? Number(item.stock_quantity) : null;
                                    const isCritical = item.type === 'goods' && stockNum !== null && stockNum <= 2;
                                    const coverUrl = item.images?.[0]?.url || null;

                                    return (
                                        <div
                                            key={item.id}
                                            style={catalogGridStyle}
                                            className={`px-5 py-3.5 rounded-2xl border transition-all duration-150 ${
                                                isCritical
                                                    ? 'border-rose-300/80 dark:border-rose-900/60 bg-[#fffbfc] dark:bg-rose-950/20'
                                                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#171B26] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                                            }`}
                                        >
                                            {/* Col 1: Thumbnail + SKU + Name */}
                                            <div className="flex items-center gap-3.5 min-w-0 pr-2">
                                                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                                    {coverUrl ? (
                                                        <img
                                                            src={coverUrl}
                                                            alt={item.name}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Box className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {item.sku && (
                                                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f0f9ff] dark:bg-sky-950/60 text-[#0284c7] dark:text-[#38bdf8] border border-[#bae6fd] dark:border-sky-800/50">
                                                                {item.sku}
                                                            </span>
                                                        )}
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                            {item.type === 'goods' ? 'Barang' : 'Jasa'}
                                                        </span>
                                                        {item.images?.length > 0 && (
                                                            <span className="text-[10px] text-slate-400">
                                                                {item.images.length} foto
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Col 2: Category */}
                                            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                <div>{item.category?.name || '-'}</div>
                                                {item.category && !item.category.is_active && (
                                                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                                        Kategori nonaktif
                                                    </span>
                                                )}
                                            </div>

                                            {/* Col 3: Price */}
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                <div>{formatRp(item.price)}</div>
                                                {item.moq && (
                                                    <div className="text-[10px] font-normal text-slate-400">
                                                        Min. {item.moq} {item.stock_unit || 'unit'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Col 4: Stock */}
                                            <div className="text-xs space-y-1">
                                                {item.type === 'service' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        Tanpa Stok (Jasa)
                                                    </span>
                                                ) : (
                                                    <>
                                                        <div
                                                            className={
                                                                isCritical
                                                                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                                                                    : 'text-slate-800 dark:text-slate-200 font-semibold'
                                                            }
                                                        >
                                                            {formatStock(item.stock_quantity, item.stock_unit)}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRestock(item)}
                                                            className="px-2 py-0.5 bg-[#086f8e]/10 hover:bg-[#086f8e] text-[#086f8e] hover:text-white text-[10px] font-bold rounded transition cursor-pointer"
                                                        >
                                                            + Restock
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Col 5: Active Toggle */}
                                            <div className="flex flex-col items-center justify-center gap-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleProductActive(item)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        item.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                                    }`}
                                                    role="switch"
                                                    aria-checked={item.is_active}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            item.is_active ? 'translate-x-4' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <span
                                                    className={`text-[10px] font-semibold ${
                                                        item.is_active
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>

                                            {/* Col 6: Actions */}
                                            <div className="flex flex-col items-center justify-center gap-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditProductModal(item)}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#086f8e] hover:underline cursor-pointer"
                                                    title="Edit Produk"
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDeleteTarget(item);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-md transition cursor-pointer"
                                                    title="Hapus Produk"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#12161F]/30 text-xs">
                        <div className="text-slate-500 dark:text-slate-400">
                            Menampilkan {paginatedProducts.from || 0} - {paginatedProducts.to || 0} dari {paginatedProducts.total || 0} item katalog
                        </div>

                        <div className="flex items-center gap-1.5">
                            {paginatedProducts.prev_page_url ? (
                                <Link
                                    href={paginatedProducts.prev_page_url}
                                    preserveScroll
                                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Prev</span>
                                </Link>
                            ) : (
                                <span className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#171B26]/50 text-slate-400 flex items-center gap-1 opacity-50">
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Prev</span>
                                </span>
                            )}

                            <span className="px-2.5 text-slate-600 dark:text-slate-300 font-semibold">
                                {paginatedProducts.current_page || 1} / {paginatedProducts.last_page || 1}
                            </span>

                            {paginatedProducts.next_page_url ? (
                                <Link
                                    href={paginatedProducts.next_page_url}
                                    preserveScroll
                                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-50"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#171B26]/50 text-slate-400 flex items-center gap-1 opacity-50">
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL 1: TAMBAH / EDIT PRODUK */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F]">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk / Jasa Baru'}
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Perubahan langsung tersimpan ke database dan tampil di katalog aktif
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                            {activeCategories.length === 0 && !editingProduct && (
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                                    Belum ada kategori aktif. Silakan tambahkan kategori terlebih dahulu melalui tombol <strong>Kelola Kategori</strong>.
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Produk / Jasa <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.data.name}
                                        onChange={(e) => productForm.setData('name', e.target.value)}
                                        placeholder="Contoh: SSD V-GeN 256GB"
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                    {productForm.errors.name && (
                                        <p className="text-[11px] text-rose-500">{productForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Kategori <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={productForm.data.category_id}
                                        onChange={(e) => productForm.setData('category_id', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories
                                            .filter((cat) => cat.is_active || (editingProduct && cat.id === editingProduct.category_id))
                                            .map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}{!cat.is_active ? ' (Nonaktif)' : ''}
                                                </option>
                                            ))}
                                    </select>
                                    {productForm.errors.category_id && (
                                        <p className="text-[11px] text-rose-500">{productForm.errors.category_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Tipe <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={productForm.data.type}
                                        onChange={(e) => {
                                            const nextType = e.target.value;
                                            productForm.setData({
                                                ...productForm.data,
                                                type: nextType,
                                                stock_quantity: nextType === 'service' ? '' : productForm.data.stock_quantity,
                                                stock_unit:
                                                    nextType === 'service' && (!productForm.data.stock_unit || productForm.data.stock_unit === 'Unit')
                                                        ? 'Paket'
                                                        : nextType === 'goods' && productForm.data.stock_unit === 'Paket'
                                                            ? 'Unit'
                                                            : productForm.data.stock_unit,
                                            });
                                        }}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    >
                                        <option value="goods">Barang (Goods)</option>
                                        <option value="service">Jasa (Service)</option>
                                    </select>
                                    {productForm.errors.type && (
                                        <p className="text-[11px] text-rose-500">{productForm.errors.type}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Kode SKU (Opsional, Unik)
                                    </label>
                                    <input
                                        type="text"
                                        value={productForm.data.sku}
                                        onChange={(e) => productForm.setData('sku', e.target.value)}
                                        placeholder="Contoh: PN-SSD-256"
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-mono font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                    {productForm.errors.sku && (
                                        <p className="text-[11px] text-rose-500">{productForm.errors.sku}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Harga Acuan (Rp, Opsional)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={productForm.data.price}
                                        onChange={(e) => productForm.setData('price', e.target.value)}
                                        placeholder="Kosongkan jika RFQ"
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                    {productForm.errors.price && (
                                        <p className="text-[11px] text-rose-500">{productForm.errors.price}</p>
                                    )}
                                </div>

                                {productForm.data.type === 'goods' ? (
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Stok (Opsional)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            value={productForm.data.stock_quantity}
                                            onChange={(e) => productForm.setData('stock_quantity', e.target.value)}
                                            placeholder="Kosongkan jika belum dikonfirmasi"
                                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                        {productForm.errors.stock_quantity && (
                                            <p className="text-[11px] text-rose-500">{productForm.errors.stock_quantity}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Ketersediaan Jasa
                                        </label>
                                        <div className="h-9 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#12161F]/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                                            Tanpa stok — diatur via Aktif/Nonaktif
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Satuan &amp; MOQ
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={productForm.data.stock_unit}
                                            onChange={(e) => productForm.setData('stock_unit', e.target.value)}
                                            placeholder="Unit"
                                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            value={productForm.data.moq}
                                            onChange={(e) => productForm.setData('moq', e.target.value)}
                                            placeholder="MOQ"
                                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                    </div>
                                    {(productForm.errors.stock_unit || productForm.errors.moq) && (
                                        <p className="text-[11px] text-rose-500">
                                            {productForm.errors.stock_unit || productForm.errors.moq}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Deskripsi Produk / Layanan
                                </label>
                                <textarea
                                    rows="3"
                                    value={productForm.data.description}
                                    onChange={(e) => productForm.setData('description', e.target.value)}
                                    placeholder="Jelaskan detail produk, cakupan jasa, atau catatan penting..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                />
                                {productForm.errors.description && (
                                    <p className="text-[11px] text-rose-500">{productForm.errors.description}</p>
                                )}
                            </div>

                            {/* Spesifikasi Key-Value */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Spesifikasi Teknis (Opsional)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setSpecRows((prev) => [...prev, { key: '', value: '' }])}
                                        className="text-[11px] font-semibold text-[#086f8e] hover:underline cursor-pointer"
                                    >
                                        + Tambah Baris Spesifikasi
                                    </button>
                                </div>
                                {specRows.map((row, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <input
                                            type="text"
                                            value={row.key}
                                            onChange={(e) =>
                                                setSpecRows((prev) =>
                                                    prev.map((r, i) => (i === index ? { ...r, key: e.target.value } : r))
                                                )
                                            }
                                            placeholder="Label (cth: Kapasitas)"
                                            className="col-span-5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={row.value}
                                            onChange={(e) =>
                                                setSpecRows((prev) =>
                                                    prev.map((r, i) => (i === index ? { ...r, value: e.target.value } : r))
                                                )
                                            }
                                            placeholder="Nilai (cth: 256 GB)"
                                            className="col-span-6 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSpecRows((prev) => prev.filter((_, i) => i !== index))}
                                            className="col-span-1 flex justify-center text-rose-500 hover:text-rose-700 cursor-pointer"
                                            aria-label="Hapus spesifikasi"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Foto Existing (Saat Edit) */}
                            {editingProduct?.images?.length > 0 && (
                                <div className="space-y-2">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Foto Saat Ini ({editingProduct.images.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {editingProduct.images.map((img) => (
                                            <div
                                                key={img.id}
                                                className="relative h-20 w-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white p-1 flex items-center justify-center overflow-hidden"
                                            >
                                                <img src={img.url} alt={img.alt_text || editingProduct.name} className="max-h-full max-w-full object-contain" />
                                                <button
                                                    type="button"
                                                    disabled={deletingImageId === img.id}
                                                    onClick={() => handleDeleteProductImage(editingProduct.id, img.id)}
                                                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                                                    title="Hapus foto"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Foto Baru */}
                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <ImagePlus className="h-3.5 w-3.5 text-[#086f8e]" />
                                    <span>Unggah Foto Produk (JPG/PNG/WebP, maks. 5 MB per berkas)</span>
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => productForm.setData('images', Array.from(e.target.files || []))}
                                    className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#086f8e]/10 file:text-[#086f8e] hover:file:bg-[#086f8e]/20 cursor-pointer"
                                />
                                {productForm.data.images.length > 0 && (
                                    <p className="text-[11px] text-slate-500">
                                        {productForm.data.images.length} berkas siap diunggah.
                                    </p>
                                )}
                                {imageErrors.map((err, idx) => (
                                    <p key={idx} className="text-[11px] text-rose-500">{err}</p>
                                ))}
                            </div>

                            <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={productForm.data.is_active}
                                    onChange={(e) => productForm.setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#086f8e] focus:ring-0 cursor-pointer"
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Aktifkan produk (tampil di katalog publik &amp; portal pembeli)
                                </span>
                            </label>

                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={productForm.processing}
                                    className="px-5 py-2 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                                >
                                    {productForm.processing
                                        ? 'Menyimpan...'
                                        : editingProduct
                                            ? 'Simpan Perubahan'
                                            : 'Simpan Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: KELOLA KATEGORI */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F]">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Kelola Kategori Katalog
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Kategori yang masih dipakai produk hanya dapat dinonaktifkan
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 text-xs">
                            <form onSubmit={handleCategorySubmit} className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    {editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Tambah Kategori Baru'}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={categoryForm.data.name}
                                        onChange={(e) => categoryForm.setData('name', e.target.value)}
                                        placeholder="Nama kategori..."
                                        className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-900 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={categoryForm.processing}
                                        className="px-4 h-9 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white font-bold cursor-pointer disabled:opacity-60"
                                    >
                                        {editingCategory ? 'Update' : 'Tambah'}
                                    </button>
                                    {editingCategory && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCategory(null);
                                                categoryForm.reset();
                                                categoryForm.setData('is_active', true);
                                            }}
                                            className="px-3 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                                        >
                                            Batal
                                        </button>
                                    )}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={categoryForm.data.is_active}
                                        onChange={(e) => categoryForm.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-[#086f8e]"
                                    />
                                    <span className="text-slate-600 dark:text-slate-300">Kategori aktif di katalog publik</span>
                                </label>
                                {categoryForm.errors.name && (
                                    <p className="text-[11px] text-rose-500">{categoryForm.errors.name}</p>
                                )}
                            </form>

                            {categoryError && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300">
                                    {categoryError}
                                </div>
                            )}

                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                                {categories.length === 0 ? (
                                    <p className="p-4 text-center text-slate-400">Belum ada kategori.</p>
                                ) : (
                                    categories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 dark:text-white truncate">
                                                    {cat.name}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {cat.products_count ?? 0} produk • {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditCategory(cat)}
                                                    className="text-[#086f8e] hover:underline font-semibold cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="text-rose-500 hover:text-rose-700 p-1 rounded cursor-pointer"
                                                    title="Hapus Kategori"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: RESTOCK CEPAT */}
            {isRestockModalOpen && restockTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <form
                        onSubmit={handleConfirmRestock}
                        className="bg-white dark:bg-[#171B26] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 text-xs"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <RefreshCw className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Tambah Stok Produk
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    {restockTarget.name}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200/80 dark:border-slate-800 space-y-1">
                            <div className="text-[11px] text-slate-400">Stok Saat Ini:</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                {formatStock(restockTarget.stock_quantity, restockTarget.stock_unit)}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Jumlah Tambahan Stok ({restockTarget.stock_unit || 'unit'})
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-[#086f8e]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsRestockModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={restockBusy}
                                className="px-5 py-2 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                            >
                                {restockBusy ? 'Menyimpan...' : `Simpan Restock (+${restockQty})`}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL 4: KONFIRMASI HAPUS PRODUK */}
            {isDeleteModalOpen && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-xs space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Hapus Produk Katalog?
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    {deleteTarget.name}
                                </p>
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Produk dan seluruh foto terkait akan dihapus secara permanen dari katalog. Jika hanya ingin menyembunyikan produk sementara, gunakan tombol nonaktifkan.
                        </p>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={deleteBusy}
                                onClick={handleConfirmDeleteProduct}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                            >
                                {deleteBusy ? 'Menghapus...' : 'Hapus Produk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
