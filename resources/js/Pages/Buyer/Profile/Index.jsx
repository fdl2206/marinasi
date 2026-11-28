import { useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    LayoutDashboard,
    Package,
    FileText,
    Receipt,
    Wrench,
    LogOut,
    Check,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ShieldCheck,
    UploadCloud,
    Download,
    Plus,
    Trash2,
    MapPin,
    Lock,
    User,
    X,
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';

const DOCUMENT_TYPE_OPTIONS = [
    { value: 'npwp', label: 'NPWP Instansi / Perusahaan' },
    { value: 'nib', label: 'NIB / Legalitas Usaha' },
    { value: 'sk_pkp', label: 'SK PKP / SPPKP' },
    { value: 'surat_tugas', label: 'Surat Tugas / Identitas Instansi' },
    { value: 'dokumen_lainnya', label: 'Dokumen Pendukung Lainnya' },
];

const VERIFICATION_BADGES = {
    verified: {
        label: 'Akun Terverifikasi',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        icon: CheckCircle2,
    },
    pending: {
        label: 'Menunggu Review Admin',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        icon: Clock,
    },
    rejected: {
        label: 'Verifikasi Ditolak',
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        icon: AlertTriangle,
    },
    unverified: {
        label: 'Belum Terverifikasi',
        className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        icon: ShieldCheck,
    },
};

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ProfileIndex({
    profile: serverProfile = null,
    companyProfile: serverCompanyProfile = null,
    addresses: serverAddresses = [],
    verification: serverVerification = null,
}) {
    const { props } = usePage();
    const auth = props?.auth;
    const pageErrors = props?.errors || {};

    const initialName = serverProfile?.name ?? auth?.user?.name ?? '';
    const initialEmail = serverProfile?.email ?? auth?.user?.email ?? '';
    const initialPhone = serverProfile?.phone ?? serverCompanyProfile?.phone ?? auth?.user?.phone ?? '';
    const initialCompanyName = serverProfile?.company_name ?? serverCompanyProfile?.company_name ?? auth?.user?.company_name ?? '';
    const initialCompanyAddress = serverProfile?.company_address ?? serverCompanyProfile?.company_address ?? auth?.user?.company_address ?? '';

    const verificationStatus = serverVerification?.status ?? auth?.user?.verification_status ?? 'unverified';
    const verificationHistory = Array.isArray(serverVerification?.history) ? serverVerification.history : [];
    const latestVerification = serverVerification?.latest ?? null;
    const canSubmitVerification = verificationStatus === 'unverified' || verificationStatus === 'rejected';
    const badgeConfig = VERIFICATION_BADGES[verificationStatus] || VERIFICATION_BADGES.unverified;
    const BadgeIcon = badgeConfig.icon;

    const profileForm = useForm({
        company_name: initialCompanyName,
        company_address: initialCompanyAddress,
        phone: initialPhone,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const verificationForm = useForm({
        notes: '',
        documents: [{ document_type: 'npwp', file: null }],
    });

    const [isSaved, setIsSaved] = useState(false);
    const [verificationSubmitted, setVerificationSubmitted] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        profileForm.setData({
            company_name: serverProfile?.company_name ?? serverCompanyProfile?.company_name ?? auth?.user?.company_name ?? '',
            company_address: serverProfile?.company_address ?? serverCompanyProfile?.company_address ?? auth?.user?.company_address ?? '',
            phone: serverProfile?.phone ?? serverCompanyProfile?.phone ?? auth?.user?.phone ?? '',
        });
    }, [
        serverProfile?.company_name,
        serverProfile?.company_address,
        serverProfile?.phone,
        serverCompanyProfile?.company_name,
        serverCompanyProfile?.company_address,
        serverCompanyProfile?.phone,
    ]);

    const addresses = Array.isArray(serverAddresses) ? serverAddresses : [];

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Verifikasi', icon: Building2, href: '/buyer/profile' },
    ];

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setIsSaved(false);
        profileForm.patch(route('buyer.profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            },
        });
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setIsPasswordModalOpen(false);
                setPasswordSuccess(true);
                setTimeout(() => setPasswordSuccess(false), 3000);
            },
        });
    };

    const addDocumentRow = () => {
        if (verificationForm.data.documents.length >= 5) return;
        verificationForm.setData('documents', [
            ...verificationForm.data.documents,
            { document_type: 'dokumen_lainnya', file: null },
        ]);
    };

    const removeDocumentRow = (index) => {
        if (verificationForm.data.documents.length <= 1) return;
        verificationForm.setData(
            'documents',
            verificationForm.data.documents.filter((_, i) => i !== index)
        );
    };

    const updateDocumentRow = (index, field, value) => {
        verificationForm.setData(
            'documents',
            verificationForm.data.documents.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleSubmitVerification = (e) => {
        e.preventDefault();
        setVerificationSubmitted(false);
        verificationForm.post(route('buyer.verification.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                verificationForm.setData({
                    notes: '',
                    documents: [{ document_type: 'npwp', file: null }],
                });
                setVerificationSubmitted(true);
                setTimeout(() => setVerificationSubmitted(false), 4000);
            },
        });
    };

    const verificationErrors = Object.entries(verificationForm.errors)
        .filter(([key]) => key === 'verification' || key === 'documents' || key.startsWith('documents.') || key === 'notes')
        .map(([, msg]) => msg);

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Profil Perusahaan & Verifikasi Akun — CV. Putra Nugraha" />

            <BuyerNavbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT SIDEBAR */}
                    <aside className="lg:col-span-3 space-y-5">
                        <div className="rounded-2xl bg-[#0a2540] p-4 sm:p-5 space-y-2.5 text-white shadow-sm border border-[#0a2540]">
                            <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5 text-white" />
                                <span>Akun Pembeli</span>
                            </div>

                            <div className="space-y-0.5">
                                <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                                    {profileForm.data.company_name || initialName || 'Akun Pembeli'}
                                </h2>
                                <p className="text-xs text-slate-300 truncate">
                                    PIC: {initialName || 'Belum diisi'}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {initialEmail}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-2 space-y-1 shadow-sm">
                            {sidebarMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = item.id === 'company';
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                                            isActive
                                                ? 'bg-[#086f8e] text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-1 px-1">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Keluar Akun</span>
                            </Link>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT */}
                    <div className="lg:col-span-9 space-y-6">
                        <div>
                            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Profil Perusahaan, Verifikasi Akun &amp; Alamat
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Lengkapi profil perusahaan dan verifikasi dokumen instansi untuk mengaktifkan pengajuan RFQ dan checkout.
                            </p>
                        </div>

                        {pageErrors.verification && (
                            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-xs font-medium text-amber-800 dark:text-amber-300">
                                {pageErrors.verification}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                Kata sandi akun berhasil diperbarui.
                            </div>
                        )}

                        {/* CARD 0: VERIFIKASI AKUN BUYER */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        1. Status Verifikasi Akun Pembeli
                                    </h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Pembeli yang belum terverifikasi tetap dapat mengisi keranjang, namun pengajuan RFQ dan checkout memerlukan verifikasi pengelola.
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${badgeConfig.className}`}>
                                    <BadgeIcon className="h-3.5 w-3.5 shrink-0" />
                                    <span>{badgeConfig.label}</span>
                                </span>
                            </div>

                            {verificationSubmitted && (
                                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                    Dokumen verifikasi berhasil dikirim dan sedang menunggu peninjauan pengelola CV. Putra Nugraha.
                                </div>
                            )}

                            {verificationStatus === 'rejected' && latestVerification?.rejection_reason && (
                                <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs space-y-1">
                                    <div className="font-bold text-rose-700 dark:text-rose-300">
                                        Pengajuan #{latestVerification.attempt_number} Ditolak oleh Pengelola
                                    </div>
                                    <p className="text-rose-600 dark:text-rose-200 leading-relaxed">
                                        Alasan: {latestVerification.rejection_reason}
                                    </p>
                                    <p className="text-[11px] text-rose-500 dark:text-rose-300/80 pt-1">
                                        Anda dapat mengunggah ulang dokumen perbaikan pada formulir di bawah ini.
                                    </p>
                                </div>
                            )}

                            {verificationStatus === 'pending' && (
                                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-200">
                                    Pengajuan verifikasi #{latestVerification?.attempt_number ?? 1} sedang dalam proses peninjauan pengelola. Anda akan dapat mengajukan RFQ dan melakukan checkout segera setelah disetujui.
                                </div>
                            )}

                            {verificationStatus === 'verified' && (
                                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-800 dark:text-emerald-200">
                                    Akun Anda telah terverifikasi. Anda kini dapat mengajukan RFQ dan melakukan checkout pesanan di CV. Putra Nugraha.
                                </div>
                            )}

                            {canSubmitVerification && (
                                <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
                                    {verificationErrors.length > 0 && (
                                        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-3 text-rose-600 dark:text-rose-300 space-y-1">
                                            {verificationErrors.map((err, idx) => (
                                                <p key={idx}>{err}</p>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                                Unggah Dokumen Verifikasi (PDF / JPG / PNG, maks. 5 MB per berkas)
                                            </label>
                                            {verificationForm.data.documents.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={addDocumentRow}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#086f8e] hover:underline cursor-pointer"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    <span>Tambah Dokumen</span>
                                                </button>
                                            )}
                                        </div>

                                        {verificationForm.data.documents.map((docRow, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800"
                                            >
                                                <select
                                                    value={docRow.document_type}
                                                    onChange={(e) => updateDocumentRow(index, 'document_type', e.target.value)}
                                                    className="sm:col-span-5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#171B26] text-slate-900 dark:text-white text-xs"
                                                >
                                                    {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="file"
                                                    required
                                                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                    onChange={(e) => updateDocumentRow(index, 'file', e.target.files?.[0] || null)}
                                                    className="sm:col-span-6 text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#086f8e]/10 file:text-[#086f8e] hover:file:bg-[#086f8e]/20 cursor-pointer"
                                                />

                                                <div className="sm:col-span-1 flex justify-end">
                                                    {verificationForm.data.documents.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDocumentRow(index)}
                                                            className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                                                            aria-label="Hapus baris dokumen"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="verification_notes" className="font-semibold text-slate-700 dark:text-slate-300">
                                            Catatan Pengajuan (Opsional)
                                        </label>
                                        <textarea
                                            id="verification_notes"
                                            rows="2"
                                            value={verificationForm.data.notes}
                                            onChange={(e) => verificationForm.setData('notes', e.target.value)}
                                            placeholder="Tambahkan keterangan instansi atau revisi dokumen jika diperlukan..."
                                            className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={verificationForm.processing}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-60"
                                        >
                                            <UploadCloud className="h-4 w-4" />
                                            <span>
                                                {verificationForm.processing
                                                    ? 'Mengunggah...'
                                                    : verificationStatus === 'rejected'
                                                        ? 'Kirim Ulang Dokumen Verifikasi'
                                                        : 'Kirim Pengajuan Verifikasi'}
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Riwayat Pengajuan Verifikasi */}
                            {verificationHistory.length > 0 && (
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                                        Riwayat Pengajuan Verifikasi ({verificationHistory.length})
                                    </div>
                                    <div className="space-y-2">
                                        {verificationHistory.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 space-y-2"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        Pengajuan #{item.attempt_number}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                                                        {item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                                                    </span>
                                                </div>
                                                {item.rejection_reason && (
                                                    <p className="text-[11px] text-rose-600 dark:text-rose-400">
                                                        Alasan penolakan: {item.rejection_reason}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    {(item.documents || []).map((doc) => (
                                                        <a
                                                            key={doc.id}
                                                            href={doc.download_url}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-[#086f8e]"
                                                        >
                                                            <Download className="h-3 w-3 text-[#086f8e]" />
                                                            <span>{doc.original_name}</span>
                                                            {doc.file_size ? (
                                                                <span className="text-slate-400">({formatFileSize(doc.file_size)})</span>
                                                            ) : null}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            {/* CARD 2: DATA PERUSAHAAN & KONTAK */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                                <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        2. Data Perusahaan / Instansi &amp; Alamat Utama
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="company_name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Nama Resmi Perusahaan / Instansi
                                        </label>
                                        <input
                                            id="company_name"
                                            type="text"
                                            value={profileForm.data.company_name}
                                            onChange={(e) => profileForm.setData('company_name', e.target.value)}
                                            placeholder="Contoh: PT / CV / Instansi Anda"
                                            className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                        {profileForm.errors.company_name && (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400">{profileForm.errors.company_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Nomor WhatsApp / Telepon Aktif
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={profileForm.data.phone}
                                            onChange={(e) => profileForm.setData('phone', e.target.value)}
                                            placeholder="Contoh: 0812-3456-7890"
                                            className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                        {profileForm.errors.phone && (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400">{profileForm.errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 space-y-1.5">
                                        <label htmlFor="company_address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Alamat Perusahaan / Instansi
                                        </label>
                                        <textarea
                                            id="company_address"
                                            rows="3"
                                            value={profileForm.data.company_address}
                                            onChange={(e) => profileForm.setData('company_address', e.target.value)}
                                            placeholder="Masukkan alamat lengkap kantor atau instansi Anda..."
                                            className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                        />
                                        {profileForm.errors.company_address && (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400">{profileForm.errors.company_address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CARD 3: PIC & KEAMANAN LOGIN */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        3. Penanggung Jawab Akun (PIC) &amp; Keamanan Login
                                    </h2>
                                    <Link
                                        href={route('profile.edit')}
                                        className="text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8] hover:underline"
                                    >
                                        Ubah Nama / Email Akun
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Nama Lengkap Akun
                                        </label>
                                        <input
                                            type="text"
                                            value={initialName}
                                            readOnly
                                            className="w-full h-10 rounded-xl bg-slate-100 dark:bg-[#0C0D12]/60 border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Email Akun
                                        </label>
                                        <input
                                            type="email"
                                            value={initialEmail}
                                            readOnly
                                            className="w-full h-10 rounded-xl bg-slate-100 dark:bg-[#0C0D12]/60 border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            passwordForm.clearErrors();
                                            setIsPasswordModalOpen(true);
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition self-start shadow-2xs cursor-pointer"
                                    >
                                        <Lock className="h-3.5 w-3.5 text-[#086f8e] dark:text-[#38bdf8]" />
                                        <span>Ubah Kata Sandi</span>
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={profileForm.processing}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-60"
                                    >
                                        {profileForm.processing ? (
                                            <span>Menyimpan...</span>
                                        ) : isSaved ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                <span>Perubahan Tersimpan!</span>
                                            </>
                                        ) : (
                                            <span>Simpan Perubahan Profil</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* CARD 4: DAFTAR ALAMAT */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    4. Daftar Alamat Pengiriman &amp; Lokasi Instalasi
                                </h2>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0C0D12] p-6 text-center space-y-2">
                                    <MapPin className="h-6 w-6 text-slate-400 mx-auto" />
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Belum ada buku alamat terpisah.
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                        {profileForm.data.company_address
                                            ? `Alamat utama saat ini: ${profileForm.data.company_address}`
                                            : 'Silakan lengkapi Alamat Perusahaan / Instansi pada formulir di atas dan klik Simpan Perubahan Profil.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className="rounded-2xl p-4 sm:p-5 space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] shadow-sm"
                                        >
                                            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                                                {addr.label}
                                            </h3>
                                            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{addr.full_address}</span>
                                            </div>
                                            {addr.recipient && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>Penerima: {addr.recipient}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL: UBAH KATA SANDI */}
            <Modal show={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSavePassword} className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Ubah Kata Sandi Akun
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Perbarui kata sandi untuk keamanan akses akun Anda.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                placeholder="Masukkan kata sandi lama Anda"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                            {passwordForm.errors.current_password && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400">{passwordForm.errors.current_password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Kata Sandi Baru <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                            {passwordForm.errors.password && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400">{passwordForm.errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi kata sandi baru"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                            {passwordForm.errors.password_confirmation && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400">{passwordForm.errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="px-5 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-60"
                        >
                            {passwordForm.processing ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                        </button>
                    </div>
                </form>
            </Modal>

            <BuyerFooter />
        </div>
    );
}
