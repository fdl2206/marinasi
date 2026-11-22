import { useState, useMemo } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head } from '@inertiajs/react';
import {
    Search,
    Plus,
    FileSpreadsheet,
    Box,
    AlertTriangle,
    CheckCircle2,
    Check,
    SlidersHorizontal,
    Edit3,
    Trash2,
    RefreshCw,
    X,
    UploadCloud,
    Download,
    ChevronLeft,
    ChevronRight,
    CheckCircle
} from 'lucide-react';

export default function SellerCatalogIndex() {
    // -------------------------------------------------------------------------
    // FILTER & SEARCH STATES
    // -------------------------------------------------------------------------
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'hardware', 'networking', 'services', 'accessories'
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'ready', 'critical'
    const [ppnOnlyFilter, setPpnOnlyFilter] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Toast notification state
    const [toastMessage, setToastMessage] = useState(null);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // -------------------------------------------------------------------------
    // CATALOG PRODUCTS & SERVICES DATA (24 SKUs: 19 Hardware/IT + 5 Jasa)
    // Synchronized strictly with design mockups, company assets, and color palette
    // -------------------------------------------------------------------------
    const [products, setProducts] = useState([
        {
            id: 1,
            sku: 'PN-SRV-ML30G10',
            name: 'Server HPE ProLiant ML30 Gen10',
            category: 'Hardware & Server',
            category_slug: 'hardware',
            price_unit: 32500000,
            price_wholesale: 31750000,
            stock: 12,
            unit: 'Unit',
            is_service: false,
            is_active: true,
            is_critical: false,
            tax_badge: 'e-Faktur Aktif',
            image: '/images/product-server-hpe.png',
        },
        {
            id: 2,
            sku: 'PN-NET-CSC24',
            name: 'Cisco Catalyst Switch 24-Port Gigabit',
            category: 'Networking & Router',
            category_slug: 'networking',
            price_unit: 15450000,
            price_wholesale: 14900000,
            stock: 8,
            unit: 'Unit',
            is_service: false,
            is_active: true,
            is_critical: false,
            tax_badge: 'e-Faktur Aktif',
            image: '/images/product-cisco-switch.png',
        },
        {
            id: 3,
            sku: 'PN-SRV-LAN10',
            name: 'Paket Jasa Instalasi Jaringan LAN Kantor (10 Titik)',
            category: 'Jasa Instalasi & Servis',
            category_slug: 'services',
            price_unit: 8500000,
            price_wholesale: 8000000,
            unit_label: '/ paket',
            stock: null,
            stock_text: 'Tim Tersedia',
            is_service: true,
            is_active: true,
            is_critical: false,
            tax_badge: 'Faktur Pajak',
            image: '/images/service-technician-lan.png',
        },
        {
            id: 4,
            sku: 'PN-NET-UAPAC',
            name: 'Ubiquiti UniFi AP AC Pro',
            category: 'Networking & Router',
            category_slug: 'networking',
            price_unit: 2450000,
            price_wholesale: 2300000,
            stock: 15,
            unit: 'Unit',
            is_service: false,
            is_active: true,
            is_critical: false,
            tax_badge: null,
            image: '/images/product-ubiquiti-ap.png',
        },
        {
            id: 5,
            sku: 'PN-ACC-BLD6',
            name: 'Kabel UTP Cat6 Belden 305m',
            category: 'Aksesoris IT',
            category_slug: 'accessories',
            price_unit: 3100000,
            price_wholesale: 2950000,
            stock: 2,
            unit: 'Roll',
            is_service: false,
            is_active: true,
            is_critical: true,
            tax_badge: null,
            image: '/images/product-belden-cable.png',
        },
        // Remaining items to represent the 24 SKU catalog
        {
            id: 6,
            sku: 'PN-SRV-DL380G10',
            name: 'Server HPE ProLiant DL380 Gen10 2U Rack',
            category: 'Hardware & Server',
            category_slug: 'hardware',
            price_unit: 68500000,
            price_wholesale: 66000000,
            stock: 4,
            unit: 'Unit',
            is_service: false,
            is_active: true,
            is_critical: false,
            tax_badge: 'e-Faktur Aktif',
            image: '/images/product-server-hpe.png',
        },
        {
            id: 7,
            sku: 'PN-NET-MKTRB4011',
            name: 'MikroTik RouterBOARD RB4011iGS+RM Gigabit',
            category: 'Networking & Router',
            category_slug: 'networking',
            price_unit: 4250000,
            price_wholesale: 4050000,
            stock: 11,
            unit: 'Unit',
            is_service: false,
            is_active: true,
            is_critical: false,
            tax_badge: 'e-Faktur Aktif',
            image: '/images/product-cisco-switch.png',
        },
        {
            id: 8,
            sku: 'PN-SRV-CCTV8',
            name: 'Paket Jasa Pemasangan & Konfigurasi CCTV IP (8 Titik)',
            category: 'Jasa Instalasi & Servis',
            category_slug: 'services',
            price_unit: 4500000,
            price_wholesale: 4200000,
            unit_label: '/ paket',
            stock: null,
            stock_text: 'Tim Tersedia',
            is_service: true,
            is_active: true,
            is_critical: false,
            tax_badge: 'Faktur Pajak',
            image: '/images/service-technician-lan.png',
        },
        {
            id: 9,
            sku: 'PN-ACC-RCK12U',
            name: 'Rack Server Wallmount 12U Indorack Depth 600mm',
            category: 'Aksesoris IT',
            category_slug: 'accessories',
            price_unit: 2650000,
            price_wholesale: 2450000,
            stock: 1,
            unit: 'Unit',
            is_service: false,
            is_active: true,
            is_critical: true,
            tax_badge: 'e-Faktur Aktif',
            image: '/images/product-belden-cable.png',
        },
        {
            id: 10,
            sku: 'PN-SRV-FIBER',
            name: 'Jasa Penarikan & Splicing Kabel Fiber Optic Back-bone',
            category: 'Jasa Instalasi & Servis',
            category_slug: 'services',
            price_unit: 6500000,
            price_wholesale: 6000000,
            unit_label: '/ proyek',
            stock: null,
            stock_text: 'Tim Tersedia',
            is_service: true,
            is_active: true,
            is_critical: false,
            tax_badge: 'Faktur Pajak',
            image: '/images/service-technician-lan.png',
        },
        {
            id: 11,
            sku: 'PN-SRV-RAM32G',
            name: 'RAM Server HPE 32GB DDR4 ECC Registered',
            category: 'Hardware & Server',
            category_slug: 'hardware',
            price_unit: 4800000,
            price_wholesale: 4550000,
            stock: 14,
            unit: 'Keping',
            is_service: false,
            is_active: true,
            is_critical: false,
            tax_badge: 'e-Faktur Aktif',
            image: '/images/product-server-hpe.png',
        },
        {
            id: 12,
            sku: 'PN-NET-CRS328',
            name: 'MikroTik Cloud Router Switch CRS328-24P-4S+RM PoE',
            category: 'Networking & Router',
            category_slug: 'networking',
            price_unit: 7850000,
            price_wholesale: 7500000,
            stock: 6,
            unit: 'Unit',
            is_service: false,
            is_active: true,
            is_critical: false,
            tax_badge: 'e-Faktur Aktif',
            image: '/images/product-cisco-switch.png',
        },
    ]);

    // -------------------------------------------------------------------------
    // MODAL STATES
    // -------------------------------------------------------------------------
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected item for Edit / Restock / Delete
    const [activeItem, setActiveItem] = useState(null);

    // Form State for Add / Edit
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category: 'Hardware & Server',
        category_slug: 'hardware',
        price_unit: '',
        price_wholesale: '',
        stock: '',
        unit: 'Unit',
        is_service: false,
        tax_badge: 'e-Faktur Aktif',
    });

    // Form State for Restock
    const [restockQty, setRestockQty] = useState(10);
    const [restockPoRef, setRestockPoRef] = useState('PO-IN-2026-089');

    // Format currency helper
    const formatRp = (num) => {
        if (!num) return 'Rp 0';
        return 'Rp ' + Number(num).toLocaleString('id-ID');
    };

    // Explicit, rock-solid grid template styling matching design mockup (vertical status & action)
    const catalogGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 2.5fr) minmax(115px, 1fr) minmax(120px, 1fr) minmax(125px, 1fr) minmax(85px, 0.8fr) 95px 60px',
        gap: '0.75rem',
        alignItems: 'center',
    };

    // -------------------------------------------------------------------------
    // FILTERING LOGIC
    // -------------------------------------------------------------------------
    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            // Tab filter
            if (activeTab !== 'all' && item.category_slug !== activeTab) {
                return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(query);
                const matchSku = item.sku.toLowerCase().includes(query);
                const matchCategory = item.category.toLowerCase().includes(query);
                if (!matchName && !matchSku && !matchCategory) return false;
            }

            // Stock filter
            if (stockFilter === 'ready' && (item.is_critical || item.stock <= 2)) return false;
            if (stockFilter === 'critical' && !item.is_critical) return false;

            // PPN filter
            if (ppnOnlyFilter && !item.tax_badge) return false;

            return true;
        });
    }, [products, activeTab, searchQuery, stockFilter, ppnOnlyFilter]);

    // Paginated slice
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedItems.map((p) => p.id));
        }
    };

    const toggleSelectItem = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Toggle active switch
    const handleToggleStatus = (id) => {
        setProducts(
            products.map((p) => {
                if (p.id === id) {
                    const newStatus = !p.is_active;
                    showToast(`Status "${p.name}" diubah ke ${newStatus ? 'Ready Stock' : 'Non-Aktif'}.`);
                    return { ...p, is_active: newStatus };
                }
                return p;
            })
        );
    };

    // Open Edit modal
    const handleOpenEdit = (item) => {
        setActiveItem(item);
        setFormData({
            sku: item.sku,
            name: item.name,
            category: item.category,
            category_slug: item.category_slug,
            price_unit: item.price_unit,
            price_wholesale: item.price_wholesale,
            stock: item.stock ?? '',
            unit: item.unit || 'Unit',
            is_service: item.is_service,
            tax_badge: item.tax_badge || '',
        });
        setIsEditModalOpen(true);
    };

    // Save Edit
    const handleSaveEdit = (e) => {
        e.preventDefault();
        setProducts(
            products.map((p) => {
                if (p.id === activeItem.id) {
                    return {
                        ...p,
                        name: formData.name,
                        sku: formData.sku,
                        category: formData.category,
                        category_slug: formData.category_slug,
                        price_unit: Number(formData.price_unit),
                        price_wholesale: Number(formData.price_wholesale),
                        stock: formData.is_service ? null : Number(formData.stock),
                        unit: formData.unit,
                        tax_badge: formData.tax_badge || null,
                    };
                }
                return p;
            })
        );
        setIsEditModalOpen(false);
        showToast(`SKU ${formData.sku} berhasil diperbarui.`);
    };

    // Open Add Modal
    const handleOpenAdd = () => {
        setFormData({
            sku: 'PN-ACC-' + Math.floor(1000 + Math.random() * 9000),
            name: '',
            category: 'Hardware & Server',
            category_slug: 'hardware',
            price_unit: '',
            price_wholesale: '',
            stock: 10,
            unit: 'Unit',
            is_service: false,
            tax_badge: 'e-Faktur Aktif',
        });
        setIsAddModalOpen(true);
    };

    // Save Add
    const handleSaveAdd = (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            sku: formData.sku,
            name: formData.name,
            category: formData.category,
            category_slug: formData.category_slug,
            price_unit: Number(formData.price_unit) || 0,
            price_wholesale: Number(formData.price_wholesale) || 0,
            stock: formData.is_service ? null : Number(formData.stock) || 0,
            stock_text: formData.is_service ? 'Tim Tersedia' : undefined,
            unit: formData.unit,
            is_service: formData.is_service,
            is_active: true,
            is_critical: !formData.is_service && Number(formData.stock) <= 2,
            tax_badge: formData.tax_badge || null,
            image: formData.is_service
                ? '/images/service-technician-lan.png'
                : '/images/product-cisco-switch.png',
        };

        setProducts([newItem, ...products]);
        setIsAddModalOpen(false);
        showToast(`SKU baru ${newItem.sku} berhasil ditambahkan ke katalog.`);
    };

    // Open Restock Modal
    const handleOpenRestock = (item) => {
        setActiveItem(item);
        setRestockQty(10);
        setIsRestockModalOpen(true);
    };

    // Confirm Restock
    const handleConfirmRestock = () => {
        setProducts(
            products.map((p) => {
                if (p.id === activeItem.id) {
                    const newStock = (p.stock || 0) + Number(restockQty);
                    return {
                        ...p,
                        stock: newStock,
                        is_critical: false,
                    };
                }
                return p;
            })
        );
        setIsRestockModalOpen(false);
        showToast(`Restock berhasil! Stok ${activeItem.name} bertambah ${restockQty} ${activeItem.unit}.`);
    };

    // Delete SKU
    const handleOpenDelete = (item) => {
        setActiveItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        setProducts(products.filter((p) => p.id !== activeItem.id));
        setIsDeleteModalOpen(false);
        showToast(`SKU ${activeItem.sku} berhasil dihapus dari katalog.`);
    };

    return (
        <SellerLayout title="Katalog Produk, Jasa & Stok B2B">
            <Head title="Manajemen Katalog Produk, Jasa & Stok B2B — Back-Office" />

            {/* TOAST ALERT NOTIFICATION */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0a2540] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-500/40 animate-fade-in text-xs font-semibold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>{toastMessage}</span>
                    <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        className="ml-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="space-y-6">

                {/* ========================================================= */}
                {/* 1. TOP HEADER & ACTION BUTTONS                            */}
                {/* ========================================================= */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                            Manajemen Katalog Produk, Jasa &amp; Stok B2B
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Atur ketersediaan stok gudang, harga grosir berjenjang, dan label Faktur Pajak PPN 11%.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {/* Import Massal Button */}
                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                        >
                            <FileSpreadsheet className="h-4 w-4 text-[#086f8e]" />
                            <span>Import Massal (Excel/CSV)</span>
                        </button>

                        {/* Tambah SKU Baru Button (Solid Teal) */}
                        <button
                            type="button"
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                            <span>Tambah SKU Baru</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 2. THREE TOP KPI STAT CARDS (Sesuai Mockup)               */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">

                    {/* Card 1: Total Katalog Aktif */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Total Katalog Aktif
                            </span>
                            <div className="p-1 rounded-lg text-[#086f8e] dark:text-[#38bdf8]">
                                <Box className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            24 SKU
                        </div>
                        <div className="text-[11px] text-slate-400">
                            19 Hardware + 5 Paket Jasa
                        </div>
                    </div>

                    {/* Card 2: Status Ready Stock */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Status Ready Stock
                            </span>
                            <div className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                            18 Produk
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Siap kirim dari gudang
                        </div>
                    </div>

                    {/* Card 3: Peringatan Stok Kritis */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Peringatan Stok Kritis
                            </span>
                            <div className="p-1 rounded-lg text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                            2 Produk
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Stok di bawah batas minimum
                        </div>
                    </div>

                </div>

                {/* ========================================================= */}
                {/* 3. CATEGORY PILL TABS                                     */}
                {/* ========================================================= */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'all'
                                ? 'bg-[#086f8e] text-white shadow-2xs'
                                : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        Semua Katalog (24)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab('hardware'); setCurrentPage(1); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'hardware'
                                ? 'bg-[#086f8e] text-white shadow-2xs'
                                : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        Hardware &amp; Server (8)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab('networking'); setCurrentPage(1); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'networking'
                                ? 'bg-[#086f8e] text-white shadow-2xs'
                                : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        Networking &amp; Router (7)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab('services'); setCurrentPage(1); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'services'
                                ? 'bg-[#086f8e] text-white shadow-2xs'
                                : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        Jasa Instalasi &amp; Servis (5)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab('accessories'); setCurrentPage(1); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'accessories'
                                ? 'bg-[#086f8e] text-white shadow-2xs'
                                : 'bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        Aksesoris IT (4)
                    </button>
                </div>

                {/* ========================================================= */}
                {/* 4. SEARCH & QUICK CONTROLS BAR                            */}
                {/* ========================================================= */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    
                    {/* Live Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Filter cepat SKU atau nama barang..."
                            className="w-full pl-9 pr-4 h-9.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                        />
                    </div>

                    {/* Stock Filter Dropdown */}
                    <div className="relative shrink-0">
                        <select
                            value={stockFilter}
                            onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
                            className="h-9.5 px-3.5 pr-8 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#086f8e] cursor-pointer appearance-none"
                        >
                            <option value="all">Semua Status Stok</option>
                            <option value="ready">Ready Stock</option>
                            <option value="critical">Stok Kritis</option>
                        </select>
                        <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* PPN 11% Toggle Pill */}
                    <button
                        type="button"
                        onClick={() => { setPpnOnlyFilter(!ppnOnlyFilter); setCurrentPage(1); }}
                        className={`h-9.5 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                            ppnOnlyFilter
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                                : 'bg-white dark:bg-[#171B26] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <CheckCircle2 className={`h-3.5 w-3.5 ${ppnOnlyFilter ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>PPN 11% Aktif</span>
                    </button>

                </div>

                {/* ========================================================= */}
                {/* 5. MAIN CATALOG TABLE CONTAINER (EXPLICIT GRID TRACKS)    */}
                {/* Impossible to overlap, perfectly aligned, high UX comfort */}
                {/* ========================================================= */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] shadow-2xs overflow-hidden">
                    
                    {/* Header bar within card */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Daftar Produk &amp; Layanan
                        </h2>
                        <span className="text-xs text-slate-400">
                            24 SKU katalog aktif
                        </span>
                    </div>

                    {/* Scrollable Container with Min-Width for Responsive Cleanliness */}
                    <div className="overflow-x-auto p-4 sm:p-5 no-scrollbar">
                        <div className="min-w-[880px] space-y-3">

                            {/* Table Column Titles Bar (EXACT SAME GRID TRACKS) */}
                            <div
                                style={catalogGridStyle}
                                className="catalog-grid-row px-5 py-2 text-[11px] font-semibold text-slate-400 select-none items-center"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === paginatedItems.length && paginatedItems.length > 0}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-slate-300 text-[#086f8e] focus:ring-0 cursor-pointer shrink-0"
                                    />
                                    <span>Info Produk / Layanan &amp; SKU</span>
                                </div>
                                <div>Kategori</div>
                                <div>Harga Satuan (1-2 Unit)</div>
                                <div>Harga Grosir B2B (≥3 Unit)</div>
                                <div>Stok Gudang</div>
                                <div className="text-center">Status Katalog</div>
                                <div className="text-center">Aksi</div>
                            </div>

                            {/* Empty State */}
                            {paginatedItems.length === 0 ? (
                                <div className="py-12 text-center space-y-2">
                                    <Box className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Tidak ada produk atau SKU yang cocok
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Coba ubah kata kunci pencarian atau ganti filter kategori di atas.
                                    </p>
                                </div>
                            ) : (
                                /* List of Product Card Rows with Rock-Solid Columns */
                                paginatedItems.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    const isCritical = item.is_critical;

                                    return (
                                        <div
                                            key={item.id}
                                            style={catalogGridStyle}
                                            className={`catalog-grid-row px-5 py-3.5 rounded-2xl border transition-all duration-150 ${
                                                isCritical
                                                    ? 'border-rose-300/80 dark:border-rose-900/60 bg-[#fffbfc] dark:bg-rose-950/20'
                                                    : isSelected
                                                    ? 'border-[#086f8e]/50 bg-sky-50/30 dark:bg-sky-950/20 shadow-2xs'
                                                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#171B26] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                                            }`}
                                        >
                                            {/* Column 1: Checkbox + Thumbnail + Details (SKU, Full Title, Tax) */}
                                            <div className="flex items-center gap-3.5 min-w-0 pr-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectItem(item.id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-[#086f8e] focus:ring-0 cursor-pointer shrink-0"
                                                />

                                                {/* Thumbnail Image */}
                                                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-contain"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>

                                                {/* SKU, Full Title, Tax Badge */}
                                                <div className="min-w-0 space-y-1">
                                                    <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f0f9ff] dark:bg-sky-950/60 text-[#0284c7] dark:text-[#38bdf8] border border-[#bae6fd] dark:border-sky-800/50">
                                                        {item.sku}
                                                    </div>
                                                    <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                                                        {item.name}
                                                    </div>
                                                    {item.tax_badge && (
                                                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                                                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                                                            <span>{item.tax_badge}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Column 2: Kategori */}
                                            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {item.category}
                                            </div>

                                            {/* Column 3: Harga Satuan */}
                                            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                                                {formatRp(item.price_unit)} {item.unit_label || ''}
                                            </div>

                                            {/* Column 4: Harga Grosir B2B */}
                                            <div className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                {formatRp(item.price_wholesale)}
                                            </div>

                                            {/* Column 5: Stok Gudang */}
                                            <div className="text-xs">
                                                {item.is_service ? (
                                                    <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                                                        {item.stock_text}
                                                    </span>
                                                ) : isCritical ? (
                                                    <div className="text-rose-600 dark:text-rose-400 font-bold leading-tight">
                                                        <div>{item.stock} {item.unit}</div>
                                                        <div className="text-[10px] font-semibold">(Stok Kritis!)</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                                                        {item.stock} {item.unit}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Column 6: Status Katalog (Vertikal Sesuai Mockup) */}
                                            <div className="flex flex-col items-center justify-center text-center">
                                                {item.is_service ? (
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                            Jasa Resmi
                                                        </span>
                                                    </div>
                                                ) : isCritical ? (
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1 whitespace-nowrap">
                                                            <AlertTriangle className="h-3 w-3 shrink-0" />
                                                            <span>Stok Kritis</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRestock(item)}
                                                            className="px-2.5 py-0.5 bg-[#086f8e] hover:bg-[#065871] text-white text-[10px] font-bold rounded shadow-2xs transition cursor-pointer text-center whitespace-nowrap"
                                                        >
                                                            + Restock
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(item.id)}
                                                            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                item.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                                            }`}
                                                            role="switch"
                                                            aria-checked={item.is_active}
                                                        >
                                                            <span
                                                                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                    item.is_active ? 'translate-x-3.5' : 'translate-x-0'
                                                                }`}
                                                            />
                                                        </button>
                                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                            Ready Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Column 7: Aksi (Vertikal Sesuai Mockup: Edit di atas, Trash di bawah) */}
                                            <div className="flex flex-col items-center justify-center gap-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#086f8e] hover:underline cursor-pointer"
                                                    title="Edit SKU"
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDelete(item)}
                                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-md transition cursor-pointer"
                                                    title="Hapus SKU"
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

                    {/* Pagination Footer Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#12161F]/30 text-xs">
                        <div className="text-slate-500 dark:text-slate-400">
                            Menampilkan {paginatedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
                            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari 24 SKU Katalog CV. Putra Nugraha
                        </div>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {[1, 2, 3, 4].map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-8 w-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        currentPage === page
                                            ? 'bg-[#086f8e] text-white shadow-2xs'
                                            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={currentPage >= 4}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                </div>

            </div>

            {/* ========================================================= */}
            {/* MODAL 1: TAMBAH SKU BARU                                  */}
            {/* ========================================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-modal">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F]">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Tambah SKU Produk / Jasa Baru
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Input spesifikasi katalog B2B dan aturan harga grosir CV. Putra Nugraha
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdd} className="p-6 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Kode SKU
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-mono font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Kategori
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => {
                                            const cat = e.target.value;
                                            let slug = 'hardware';
                                            if (cat === 'Networking & Router') slug = 'networking';
                                            if (cat === 'Jasa Instalasi & Servis') slug = 'services';
                                            if (cat === 'Aksesoris IT') slug = 'accessories';
                                            setFormData({
                                                ...formData,
                                                category: cat,
                                                category_slug: slug,
                                                is_service: slug === 'services',
                                            });
                                        }}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    >
                                        <option value="Hardware & Server">Hardware &amp; Server</option>
                                        <option value="Networking & Router">Networking &amp; Router</option>
                                        <option value="Jasa Instalasi & Servis">Jasa Instalasi &amp; Servis</option>
                                        <option value="Aksesoris IT">Aksesoris IT</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Produk / Paket Layanan
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Cisco Catalyst 2960-X Switch 48 GigE"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Harga Satuan (1-2 Unit)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Rp"
                                        value={formData.price_unit}
                                        onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Harga Grosir B2B (≥3 Unit)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Rp"
                                        value={formData.price_wholesale}
                                        onChange={(e) => setFormData({ ...formData, price_wholesale: e.target.value })}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>
                            </div>

                            {!formData.is_service && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Stok Awal Gudang
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Satuan Unit
                                        </label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                        >
                                            <option value="Unit">Unit</option>
                                            <option value="Roll">Roll</option>
                                            <option value="Box">Box</option>
                                            <option value="Keping">Keping</option>
                                            <option value="Paket">Paket</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* PPN Label Checkbox */}
                            <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(formData.tax_badge)}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tax_badge: e.target.checked
                                                ? formData.is_service
                                                    ? 'Faktur Pajak'
                                                    : 'e-Faktur Aktif'
                                                : '',
                                        })
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-[#086f8e] focus:ring-0 cursor-pointer"
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Aktifkan label PPN 11% (Diterbitkan e-Faktur Resmi PKP)
                                </span>
                            </label>

                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white font-bold transition shadow-xs cursor-pointer"
                                >
                                    Simpan SKU ke Katalog
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: EDIT SKU                                         */}
            {/* ========================================================= */}
            {isEditModalOpen && activeItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-modal">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F]">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Edit SKU: {activeItem.sku}
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Perbarui nama, batas harga grosir B2B, atau stok produk
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Produk / Layanan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Harga Satuan (1-2 Unit)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price_unit}
                                        onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Harga Grosir B2B (≥3 Unit)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price_wholesale}
                                        onChange={(e) => setFormData({ ...formData, price_wholesale: e.target.value })}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>
                            </div>

                            {!activeItem.is_service && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Stok Gudang
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Satuan Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(formData.tax_badge)}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tax_badge: e.target.checked
                                                ? activeItem.is_service
                                                    ? 'Faktur Pajak'
                                                    : 'e-Faktur Aktif'
                                                : '',
                                        })
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-[#086f8e] focus:ring-0 cursor-pointer"
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Aktifkan label e-Faktur PPN 11% Resmi
                                </span>
                            </label>

                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white font-bold transition shadow-xs cursor-pointer"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 3: RESTOCK CEPAT (Khusus Barang Stok Kritis)       */}
            {/* ========================================================= */}
            {isRestockModalOpen && activeItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-modal">
                        <div className="p-6 space-y-4 text-xs">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Restock Barang Masuk
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        {activeItem.name} ({activeItem.sku})
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200/80 dark:border-slate-800 space-y-1">
                                <div className="text-[11px] text-slate-400">Stok Saat Ini:</div>
                                <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                    {activeItem.stock} {activeItem.unit} (Di bawah batas minimum)
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Jumlah Restock Masuk ({activeItem.unit})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={restockQty}
                                    onChange={(e) => setRestockQty(e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    No. Surat Jalan / Purchase Order Distributor
                                </label>
                                <input
                                    type="text"
                                    value={restockPoRef}
                                    onChange={(e) => setRestockPoRef(e.target.value)}
                                    placeholder="Contoh: PO-DIST-BELDEN-2026"
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] text-slate-900 dark:text-white font-mono font-medium focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRestockModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmRestock}
                                    className="px-5 py-2 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white font-bold transition shadow-xs cursor-pointer"
                                >
                                    Konfirmasi Restock (+{restockQty})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 4: IMPORT MASSAL EXCEL / CSV                        */}
            {/* ========================================================= */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-modal">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F]">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Import Katalog Massal (Excel / CSV)
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Unggah daftar SKU hardware &amp; servis sekaligus ke sistem back-office
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsImportModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-xs">
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2 hover:border-[#086f8e] transition cursor-pointer">
                                <UploadCloud className="h-10 w-10 text-[#086f8e] mx-auto" />
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                    Klik atau seret file spreadsheet ke sini
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Mendukung format .xlsx, .xls, atau .csv (Maksimal 10 MB)
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800">
                                <div className="space-y-0.5">
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                                        Template Katalog B2B
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Download format standar kolom SKU, harga grosir, dan PPN
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => showToast('Template_Katalog_Putra_Nugraha.xlsx berhasil diunduh.')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 cursor-pointer"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        showToast('Data massal berhasil diimpor ke katalog.');
                                    }}
                                    className="px-5 py-2 rounded-xl bg-[#086f8e] hover:bg-[#065871] text-white font-bold transition shadow-xs cursor-pointer"
                                >
                                    Mulai Proses Import
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 5: KONFIRMASI HAPUS SKU                             */}
            {/* ========================================================= */}
            {isDeleteModalOpen && activeItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-xs space-y-4 animate-modal">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Hapus SKU Katalog?
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    {activeItem.name}
                                </p>
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Apakah Anda yakin ingin menghapus item SKU <strong>{activeItem.sku}</strong> dari katalog etalase B2B CV. Putra Nugraha? Tindakan ini dapat dibatalkan sewaktu-waktu.
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
                                onClick={handleConfirmDelete}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
                            >
                                Hapus SKU
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </SellerLayout>
    );
}
