import { useState, useMemo } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, 
    ChevronDown, 
    Paperclip, 
    FileText, 
    CheckCircle2, 
    X, 
    Download, 
    Printer, 
    Send, 
    ShieldCheck, 
    Building2, 
    Clock, 
    AlertCircle, 
    Check, 
    SlidersHorizontal,
    FileSpreadsheet
} from 'lucide-react';

export default function SellerNegotiationsIndex() {
    // Filter State
    const [activeFilter, setActiveFilter] = useState('pending'); // 'all', 'pending', 'sent', 'deal'
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'highest'
    const [sortOpen, setSortOpen] = useState(false);

    // Toast state
    const [toastMessage, setToastMessage] = useState(null);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // RFQ Data State
    const [rfqs, setRfqs] = useState([
        {
            id: 1,
            code: '#RFQ-PN-2026-0118',
            created_at: 'Hari ini, 10:15 WIB',
            timestamp: 3,
            client_name: 'PT Maju Jaya Teknologi',
            tax_status: 'NPWP: 01.234.567.8 - PKP Aktif',
            items_summary: '4x Server HPE ML30 Gen10 + Jasa Instalasi LAN',
            attachment_name: 'RAB_Server.pdf',
            pagu: 131500000,
            status: 'pending', // 'pending' | 'sent' | 'deal'
            status_label: 'Menunggu SPH',
            margin_percent: 12,
            valid_days: 14,
            sph_code: null
        },
        {
            id: 2,
            code: '#RFQ-PN-2026-0117',
            created_at: 'Kemarin, 15:40 WIB',
            timestamp: 2,
            client_name: 'Dinas Komunikasi & Informatika',
            tax_status: 'Instansi Pemerintah',
            items_summary: '10x Cisco Catalyst Switch 24-Port + Kabel Belden',
            attachment_name: 'BoQ.xlsx',
            pagu: 170000000,
            status: 'pending',
            status_label: 'Menunggu SPH',
            margin_percent: 10,
            valid_days: 14,
            sph_code: null
        },
        {
            id: 3,
            code: '#RFQ-PN-2026-0110',
            created_at: '10 Okt 2026',
            timestamp: 1,
            client_name: 'CV Sinar Abadi Mandiri',
            tax_status: 'Non-PKP',
            items_summary: 'Pemasangan CCTV Hikvision 16 Titik',
            attachment_name: null,
            pagu: 25000000,
            status: 'sent',
            status_label: 'SPH Terkirim',
            margin_percent: 15,
            valid_days: 14,
            sph_code: 'SPH/PN/X/2026/084'
        }
    ]);

    // Modal States
    const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
    const [selectedRfq, setSelectedRfq] = useState(null);
    const [generatorMargin, setGeneratorMargin] = useState(12);
    const [generatorValidity, setGeneratorValidity] = useState(14);
    const [generatorNotes, setGeneratorNotes] = useState('Harga sudah termasuk PPN 11%, garansi resmi servis 1 tahun, dan sertifikat uji fungsi on-site.');
    const [previewPdfModalOpen, setPreviewPdfModalOpen] = useState(false);
    const [pdfRfq, setPdfRfq] = useState(null);

    // KPI Counts
    const counts = useMemo(() => {
        return {
            total: 24,
            pending: 3,
            sent: 8,
            deal: 13
        };
    }, []);

    // Filtered & Sorted RFQ List
    const filteredRfqs = useMemo(() => {
        let list = [...rfqs];

        // Status Filter
        if (activeFilter === 'pending') {
            list = list.filter(item => item.status === 'pending');
        } else if (activeFilter === 'sent') {
            list = list.filter(item => item.status === 'sent');
        } else if (activeFilter === 'deal') {
            list = list.filter(item => item.status === 'deal');
        }

        // Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(item => 
                item.code.toLowerCase().includes(q) ||
                item.client_name.toLowerCase().includes(q) ||
                item.items_summary.toLowerCase().includes(q)
            );
        }

        // Sort Order
        if (sortOrder === 'highest') {
            list.sort((a, b) => b.pagu - a.pagu);
        } else if (sortOrder === 'oldest') {
            list.sort((a, b) => a.timestamp - b.timestamp);
        } else {
            list.sort((a, b) => b.timestamp - a.timestamp);
        }

        return list;
    }, [rfqs, activeFilter, searchQuery, sortOrder]);

    // Open SPH Generator Modal
    const handleOpenGenerator = (rfq) => {
        setSelectedRfq(rfq);
        setGeneratorMargin(rfq.margin_percent || 12);
        setGeneratorValidity(rfq.valid_days || 14);
        setGeneratorModalOpen(true);
    };

    // Submit SPH Generator
    const handleGenerateSph = (e) => {
        e.preventDefault();
        if (!selectedRfq) return;

        const generatedSphCode = `SPH/PN/XI/2026/${Math.floor(100 + Math.random() * 900)}`;

        setRfqs(prev => prev.map(item => {
            if (item.id === selectedRfq.id) {
                return {
                    ...item,
                    status: 'sent',
                    status_label: 'SPH Terkirim',
                    sph_code: generatedSphCode,
                    margin_percent: generatorMargin,
                    valid_days: generatorValidity
                };
            }
            return item;
        }));

        setGeneratorModalOpen(false);
        showToast(`SPH resmi ${generatedSphCode} berhasil diterbitkan & dikirim ke portal klien ${selectedRfq.client_name}!`);
    };

    // Open PDF Preview Modal
    const handleOpenPreviewPdf = (rfq) => {
        setPdfRfq(rfq);
        setPreviewPdfModalOpen(true);
    };

    return (
        <SellerLayout 
            title="Antrean RFQ Masuk & Generator SPH"
            searchPlaceholder="Cari pengaturan sistem, akun staf, atau rekening bank..."
        >
            <Head title="Antrean RFQ Masuk & Generator SPH — CV. Putra Nugraha Internal" />

            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#171B26] border border-emerald-500/30 text-slate-900 dark:text-slate-100 font-medium text-xs shadow-2xl animate-modal">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="space-y-6">
                
                {/* ===================================================== */}
                {/* PAGE TITLE & SUBTITLE                                 */}
                {/* ===================================================== */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Antrean RFQ Masuk &amp; Generator SPH
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tinjau permintaan klien, unduh file RAB, atur harga diskon proyek, dan terbitkan PDF Surat Penawaran Harga (SPH).
                    </p>
                </div>

                {/* ===================================================== */}
                {/* TOP 4 KPI METRIC CARDS                                */}
                {/* ===================================================== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* Card 1: Total RFQ Bulan Ini */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Total RFQ Bulan Ini
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {counts.total}
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Permintaan masuk
                        </div>
                    </div>

                    {/* Card 2: Menunggu Diproses */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Menunggu Diproses
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-[#f59e0b] tracking-tight">
                            {counts.pending} Baru
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Perlu SPH hari ini
                        </div>
                    </div>

                    {/* Card 3: SPH Terkirim (Pending PO) */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            SPH Terkirim (Pending PO)
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#086f8e] dark:text-[#38bdf8] tracking-tight">
                            {counts.sent} Klien
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Menunggu persetujuan
                        </div>
                    </div>

                    {/* Card 4: SPH Disetujui (Deal) */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-1.5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            SPH Disetujui (Deal)
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {counts.deal} Proyek
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Lanjut ke Pesanan
                        </div>
                    </div>

                </div>

                {/* ===================================================== */}
                {/* FILTER TABS & SEARCH / SORT CARD                      */}
                {/* ===================================================== */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 space-y-3 shadow-xs">
                    
                    {/* Top Row: Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                activeFilter === 'all'
                                    ? 'bg-[#086f8e] text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            Semua ({counts.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('pending')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                activeFilter === 'pending'
                                    ? 'bg-[#086f8e] text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            Menunggu SPH ({counts.pending})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('sent')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                activeFilter === 'sent'
                                    ? 'bg-[#086f8e] text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            SPH Terkirim ({counts.sent})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('deal')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                activeFilter === 'deal'
                                    ? 'bg-[#086f8e] text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            Disetujui/Deal ({counts.deal})
                        </button>
                    </div>

                    {/* Bottom Row: Search Box & Sort Dropdown */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                        {/* Search Input with Magnifier Icon */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari RFQ..."
                                className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative shrink-0 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setSortOpen(!sortOpen)}
                                className="w-full sm:w-auto h-9 px-3.5 rounded-lg bg-white dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between sm:justify-start gap-2 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                            >
                                <span>
                                    {sortOrder === 'highest' ? 'Sortir Pagu Tertinggi' : sortOrder === 'oldest' ? 'Sortir Terlama' : 'Sortir Tanggal'}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </button>

                            {sortOpen && (
                                <div className="absolute right-0 mt-1 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-1.5 shadow-xl space-y-1 text-xs z-30 animate-modal">
                                    <button
                                        type="button"
                                        onClick={() => { setSortOrder('newest'); setSortOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                                    >
                                        Tanggal Terbaru
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSortOrder('oldest'); setSortOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                                    >
                                        Tanggal Terlama
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSortOrder('highest'); setSortOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                                    >
                                        Pagu Tertinggi
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ===================================================== */}
                {/* RFQ TABLE / LIST                                      */}
                {/* ===================================================== */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden shadow-xs">
                    
                    {/* Desktop Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#12161F] border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">No. RFQ &amp; Waktu</th>
                                    <th className="py-3 px-4">Perusahaan Klien &amp; Status Pajak</th>
                                    <th className="py-3 px-4">Rincian Kebutuhan &amp; RAB</th>
                                    <th className="py-3 px-4">Estimasi Pagu</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi Admin (SPH)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#171B26]">
                                {filteredRfqs.length > 0 ? (
                                    filteredRfqs.map((rfq) => (
                                        <tr key={rfq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                                            {/* Col 1: No. RFQ & Waktu */}
                                            <td className="py-4 px-4 align-top">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {rfq.code}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {rfq.created_at}
                                                </div>
                                            </td>

                                            {/* Col 2: Perusahaan Klien & Status Pajak */}
                                            <td className="py-4 px-4 align-top">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {rfq.client_name}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {rfq.tax_status}
                                                </div>
                                            </td>

                                            {/* Col 3: Rincian Kebutuhan & RAB */}
                                            <td className="py-4 px-4 align-top space-y-1">
                                                <div className="text-slate-800 dark:text-slate-200 font-medium">
                                                    {rfq.items_summary}
                                                </div>
                                                {rfq.attachment_name && (
                                                    <button
                                                        type="button"
                                                        onClick={() => showToast(`Mengunduh berkas lampiran klien: ${rfq.attachment_name}`)}
                                                        className="inline-flex items-center gap-1 text-xs text-[#086f8e] dark:text-[#38bdf8] hover:underline font-medium cursor-pointer"
                                                    >
                                                        <Paperclip className="h-3 w-3 shrink-0" />
                                                        <span>Unduh {rfq.attachment_name}</span>
                                                    </button>
                                                )}
                                            </td>

                                            {/* Col 4: Estimasi Pagu */}
                                            <td className="py-4 px-4 align-top">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    Rp {rfq.pagu.toLocaleString('id-ID')}
                                                </div>
                                            </td>

                                            {/* Col 5: Status */}
                                            <td className="py-4 px-4 align-top">
                                                {rfq.status === 'pending' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                                                        {rfq.status_label}
                                                    </span>
                                                ) : rfq.status === 'sent' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                                        {rfq.status_label}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        {rfq.status_label}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Col 6: Aksi Admin (SPH) */}
                                            <td className="py-4 px-4 align-top text-center">
                                                {rfq.status === 'pending' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenGenerator(rfq)}
                                                        className="px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap"
                                                    >
                                                        Verifikasi &amp; Buat SPH
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenPreviewPdf(rfq)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12161F] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#086f8e] dark:text-[#38bdf8] font-bold text-xs shadow-2xs transition cursor-pointer whitespace-nowrap"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>Lihat PDF SPH</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            Tidak ada pengajuan RFQ yang cocok dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>

            {/* ========================================================= */}
            {/* MODAL 1: SPH GENERATOR & VERIFIKASI MARGIN B2B            */}
            {/* ========================================================= */}
            {generatorModalOpen && selectedRfq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal text-xs">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-[#f59e0b]">
                                    Generator Dokumen Pengadaan B2B
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                    Verifikasi &amp; Terbitkan SPH: {selectedRfq.code}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setGeneratorModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleGenerateSph} className="space-y-4">
                            
                            {/* Klien & Permintaan */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                                <div className="text-[11px] text-slate-400">Perusahaan Klien:</div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{selectedRfq.client_name}</div>
                                <div className="text-[11px] text-slate-400 pt-1">Rincian Barang / Jasa:</div>
                                <div className="text-slate-800 dark:text-slate-200 font-medium">{selectedRfq.items_summary}</div>
                            </div>

                            {/* Pagu & Margin Calculation */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800/80">
                                    <div className="text-[10px] text-slate-400">Estimasi Pagu Klien</div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                        Rp {selectedRfq.pagu.toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Termasuk PPN 11%</div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800/80">
                                    <div className="text-[10px] text-slate-400">Margin Laba Grosir</div>
                                    <div className="text-sm font-bold text-amber-600 dark:text-[#f59e0b] mt-0.5">
                                        {generatorMargin}%
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Rekomendasi B2B</div>
                                </div>
                            </div>

                            {/* Margin Slider */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    <span>Penyesuaian Margin Harga:</span>
                                    <span className="text-[#086f8e] dark:text-[#38bdf8] font-bold">{generatorMargin}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="25"
                                    step="1"
                                    value={generatorMargin}
                                    onChange={(e) => setGeneratorMargin(Number(e.target.value))}
                                    className="w-full accent-[#086f8e] cursor-pointer"
                                />
                            </div>

                            {/* Masa Berlaku SPH */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Masa Berlaku Penawaran (Hari Kalender):
                                </label>
                                <input
                                    type="number"
                                    value={generatorValidity}
                                    onChange={(e) => setGeneratorValidity(Number(e.target.value))}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            {/* Catatan / Keterangan SPH */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Catatan Resmi Penawaran:
                                </label>
                                <textarea
                                    rows="2"
                                    value={generatorNotes}
                                    onChange={(e) => setGeneratorNotes(e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setGeneratorModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition"
                                >
                                    Terbitkan &amp; Kirim SPH Resmi (PDF)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: PRATINJAU PDF DOKUMEN SPH RESMI                  */}
            {/* ========================================================= */}
            {previewPdfModalOpen && pdfRfq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal text-xs">
                        
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-[#086f8e]" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Dokumen SPH Resmi: {pdfRfq.sph_code || 'SPH/PN/X/2026/084'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewPdfModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* PDF Document Simulation Box */}
                        <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12161F] p-6 space-y-4 shadow-sm">
                            {/* Kop Surat Header */}
                            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 dark:border-slate-200">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-black text-slate-900 dark:text-white tracking-wider">
                                        CV. PUTRA NUGRAHA (PUTRA NUGRAHA COMPUTER)
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Jl. Palintang Kav. 2 RT.03 Rw.05 Kel. Pasir Wangi Kec. Ujung Berung Bandung | Telp: 081320777874
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                        NPWP: 02.889.112.4-429.000 &bull; Pengusaha Kena Pajak (PKP)
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded bg-[#0a2540] text-white font-bold flex items-center justify-center text-xs shrink-0">
                                    PN
                                </div>
                            </div>

                            {/* Letter Metadata */}
                            <div className="text-center py-1">
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                                    SURAT PENAWARAN HARGA (SPH) RESMI
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">
                                    Nomor: {pdfRfq.sph_code || 'SPH/PN/X/2026/084'}
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                                <div>Kepada Yth: <strong>{pdfRfq.client_name}</strong></div>
                                <div>Status: {pdfRfq.tax_status}</div>
                                <div>Perihal: Penawaran Pengadaan {pdfRfq.items_summary}</div>
                            </div>

                            {/* Table of Items */}
                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="py-2 px-3">Deskripsi Barang / Jasa</th>
                                            <th className="py-2 px-3 text-right">Nilai Total (Termasuk PPN)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr>
                                            <td className="py-2 px-3 text-slate-800 dark:text-slate-200">{pdfRfq.items_summary}</td>
                                            <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                                                Rp {pdfRfq.pagu.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures & Stamp */}
                            <div className="pt-3 flex items-end justify-between">
                                <div className="text-[10px] text-slate-500 space-y-0.5">
                                    <div>&bull; Masa berlaku penawaran: 14 hari kalender</div>
                                    <div>&bull; Garansi resmi suku cadang &amp; servis 1 tahun</div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-[10px] text-slate-600 dark:text-slate-300">Bandung, {pdfRfq.created_at}</div>
                                    <div className="inline-flex items-center gap-2 p-1.5 rounded-lg border border-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20 text-[#086f8e] text-[9px] font-bold">
                                        <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                                        <span>TERSTEMPEL DIGITAL &amp; RESMI CV. PUTRA NUGRAHA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                                Status: Resmi Diterbitkan &amp; Siap Diunduh Klien
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        showToast(`Mengunduh PDF resmi ${pdfRfq.sph_code}...`);
                                        setPreviewPdfModalOpen(false);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Unduh PDF SPH</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </SellerLayout>
    );
}
