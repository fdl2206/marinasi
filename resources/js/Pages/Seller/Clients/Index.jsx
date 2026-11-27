import { useEffect, useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2,
    Search,
    CheckCircle2,
    Clock,
    AlertTriangle,
    UserX,
    Users,
    Download,
    X,
    Eye,
    ShieldCheck,
    Ban,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const STATUS_META = {
    verified: {
        label: 'Terverifikasi',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
    pending: {
        label: 'Menunggu Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    rejected: {
        label: 'Ditolak',
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    },
    unverified: {
        label: 'Belum Mengajukan',
        className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
};

export default function SellerClientsIndex({
    clients: paginatedClients = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    filters = {},
    stats = {},
}) {
    const clientRows = Array.isArray(paginatedClients?.data) ? paginatedClients.data : [];

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [verificationFilter, setVerificationFilter] = useState(filters.verification_status || 'all');
    const [activeFilter, setActiveFilter] = useState(filters.active_status || 'all');

    const [selectedClient, setSelectedClient] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [actionBusyId, setActionBusyId] = useState(null);
    const [toast, setToast] = useState(null);

    const rejectForm = useForm({
        rejection_reason: '',
    });

    useEffect(() => {
        setSearchQuery(filters.search || '');
        setVerificationFilter(filters.verification_status || 'all');
        setActiveFilter(filters.active_status || 'all');
    }, [filters.search, filters.verification_status, filters.active_status]);

    useEffect(() => {
        if (selectedClient) {
            const refreshed = clientRows.find((row) => row.id === selectedClient.id);
            if (refreshed) {
                setSelectedClient(refreshed);
            }
        }
    }, [clientRows]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const applyFilters = (overrides = {}) => {
        const next = {
            search: searchQuery,
            verification_status: verificationFilter,
            active_status: activeFilter,
            ...overrides,
        };

        router.get(
            route('seller.clients.index'),
            {
                search: next.search || undefined,
                verification_status: next.verification_status !== 'all' ? next.verification_status : undefined,
                active_status: next.active_status !== 'all' ? next.active_status : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleApprove = (client) => {
        setActionBusyId(client.id);
        router.post(
            route('seller.clients.verification.approve', client.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(`Verifikasi "${client.company_name || client.name}" disetujui.`);
                },
                onError: (errors) => {
                    showToast(errors?.verification || 'Gagal menyetujui verifikasi.', 'error');
                },
                onFinish: () => setActionBusyId(null),
            }
        );
    };

    const openRejectModal = (client) => {
        setRejectTarget(client);
        rejectForm.clearErrors();
        rejectForm.setData('rejection_reason', '');
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectTarget) return;

        rejectForm.post(route('seller.clients.verification.reject', rejectTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Verifikasi "${rejectTarget.company_name || rejectTarget.name}" ditolak.`);
                setRejectTarget(null);
                rejectForm.reset();
            },
        });
    };

    const handleToggleActive = (client) => {
        const nextActive = !client.is_active;
        setActionBusyId(client.id);
        router.patch(
            route('seller.clients.active.update', client.id),
            { is_active: nextActive },
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(`Akun "${client.name}" ${nextActive ? 'diaktifkan kembali' : 'dinonaktifkan'}.`);
                },
                onError: () => {
                    showToast('Gagal mengubah status aktif akun.', 'error');
                },
                onFinish: () => setActionBusyId(null),
            }
        );
    };

    return (
        <SellerLayout title="Verifikasi Klien & Akun Pembeli">
            <Head title="Verifikasi Klien & Akun Pembeli — CV. Putra Nugraha Internal" />

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
                    <button type="button" onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                        Verifikasi Klien Mitra &amp; Manajemen Akun Pembeli
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tinjau dokumen verifikasi pembeli untuk mengaktifkan RFQ &amp; checkout, serta kelola status aktif akun pembeli.
                    </p>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Total Pembeli</span>
                            <Users className="h-4 w-4 text-[#086f8e]" />
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total ?? 0}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Menunggu Review</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pending ?? 0}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Terverifikasi</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.verified ?? 0}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Ditolak</span>
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{stats.rejected ?? 0}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Akun Nonaktif</span>
                            <UserX className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">{stats.inactive ?? 0}</div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters();
                        }}
                        className="relative flex-1"
                    >
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama PIC, email, instansi/perusahaan, atau telepon..."
                            className="w-full pl-9 pr-20 h-10 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#086f8e] text-white text-[11px] font-semibold cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>

                    <select
                        value={verificationFilter}
                        onChange={(e) => {
                            setVerificationFilter(e.target.value);
                            applyFilters({ verification_status: e.target.value });
                        }}
                        className="h-10 px-3.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-200"
                    >
                        <option value="all">Semua Status Verifikasi</option>
                        <option value="pending">Menunggu Review</option>
                        <option value="verified">Terverifikasi</option>
                        <option value="rejected">Ditolak</option>
                        <option value="unverified">Belum Mengajukan</option>
                    </select>

                    <select
                        value={activeFilter}
                        onChange={(e) => {
                            setActiveFilter(e.target.value);
                            applyFilters({ active_status: e.target.value });
                        }}
                        className="h-10 px-3.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] text-slate-700 dark:text-slate-200"
                    >
                        <option value="all">Semua Status Akun</option>
                        <option value="active">Akun Aktif</option>
                        <option value="inactive">Akun Nonaktif</option>
                    </select>
                </div>

                {/* Client List */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Akun Pembeli</h2>
                        <span className="text-xs text-slate-400">{paginatedClients.total ?? clientRows.length} akun</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {clientRows.length === 0 ? (
                            <div className="p-12 text-center space-y-2">
                                <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada akun pembeli yang sesuai filter.</p>
                            </div>
                        ) : (
                            clientRows.map((client) => {
                                const meta = STATUS_META[client.verification_status] || STATUS_META.unverified;
                                const hasPending = client.verification_status === 'pending';
                                const isBusy = actionBusyId === client.id;

                                return (
                                    <div key={client.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {client.company_name || client.name}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${meta.className}`}>
                                                    {meta.label}
                                                </span>
                                                {!client.is_active && (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                                        Dinonaktifkan
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                                                <span>PIC: <strong className="text-slate-700 dark:text-slate-200">{client.name}</strong></span>
                                                <span>Email: {client.email}</span>
                                                {client.phone && <span>Telp: {client.phone}</span>}
                                            </div>
                                            {client.latest_verification && (
                                                <div className="text-[11px] text-slate-400">
                                                    Pengajuan #{client.latest_verification.attempt_number} • {(client.latest_verification.documents || []).length} dokumen
                                                    {client.latest_verification.rejection_reason
                                                        ? ` • Alasan tolak terakhir: ${client.latest_verification.rejection_reason}`
                                                        : ''}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedClient(client)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Detail &amp; Berkas</span>
                                            </button>

                                            {hasPending && (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleApprove(client)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                                                    >
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        <span>Setujui</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => openRejectModal(client)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Ban className="h-3.5 w-3.5" />
                                                        <span>Tolak</span>
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                type="button"
                                                disabled={isBusy}
                                                onClick={() => handleToggleActive(client)}
                                                className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer disabled:opacity-50 ${
                                                    client.is_active
                                                        ? 'border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                                        : 'border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                }`}
                                            >
                                                {client.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-[#12161F]/30 text-xs">
                        <span className="text-slate-500">
                            Menampilkan {paginatedClients.from || 0} - {paginatedClients.to || 0} dari {paginatedClients.total || 0} akun
                        </span>
                        <div className="flex items-center gap-2">
                            {paginatedClients.prev_page_url ? (
                                <Link href={paginatedClients.prev_page_url} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] inline-flex items-center gap-1">
                                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                                </Link>
                            ) : <span />}
                            <span className="font-semibold">{paginatedClients.current_page || 1} / {paginatedClients.last_page || 1}</span>
                            {paginatedClients.next_page_url ? (
                                <Link href={paginatedClients.next_page_url} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] inline-flex items-center gap-1">
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : <span />}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: DETAIL KLIEN & DOKUMEN VERIFIKASI */}
            {selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#171B26] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F]">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Detail Klien: {selectedClient.company_name || selectedClient.name}
                                </h3>
                                <p className="text-[11px] text-slate-400">{selectedClient.email}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedClient(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-800">
                                <div><span className="text-slate-400">Nama PIC:</span> <strong className="text-slate-900 dark:text-white">{selectedClient.name}</strong></div>
                                <div><span className="text-slate-400">Telepon:</span> <strong className="text-slate-900 dark:text-white">{selectedClient.phone || '-'}</strong></div>
                                <div className="sm:col-span-2"><span className="text-slate-400">Alamat:</span> <strong className="text-slate-900 dark:text-white">{selectedClient.company_address || '-'}</strong></div>
                            </div>

                            <div className="space-y-3">
                                <div className="font-bold text-slate-900 dark:text-white">
                                    Riwayat Pengajuan &amp; Dokumen Verifikasi ({selectedClient.verifications.length})
                                </div>
                                {selectedClient.verifications.length === 0 ? (
                                    <p className="text-slate-500">Klien belum mengunggah dokumen verifikasi.</p>
                                ) : (
                                    selectedClient.verifications.map((ver) => (
                                        <div key={ver.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-900 dark:text-white">Pengajuan #{ver.attempt_number}</span>
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 capitalize">
                                                    {ver.status}
                                                </span>
                                            </div>
                                            {ver.notes && <p className="text-slate-600 dark:text-slate-300">Catatan klien: {ver.notes}</p>}
                                            {ver.rejection_reason && (
                                                <p className="text-rose-600 dark:text-rose-400">Alasan penolakan: {ver.rejection_reason}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                {ver.documents.map((doc) => (
                                                    <a
                                                        key={doc.id}
                                                        href={doc.download_url}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 hover:border-[#086f8e] font-medium"
                                                    >
                                                        <Download className="h-3.5 w-3.5 text-[#086f8e]" />
                                                        <span>[{doc.document_type}] {doc.original_name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: TOLAK VERIFIKASI */}
            {rejectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <form
                        onSubmit={handleRejectSubmit}
                        className="bg-white dark:bg-[#171B26] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Tolak Pengajuan Verifikasi
                            </h3>
                            <button type="button" onClick={() => setRejectTarget(null)} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                            Klien <strong>{rejectTarget.company_name || rejectTarget.name}</strong> akan melihat alasan ini dan dapat mengunggah ulang dokumen perbaikan.
                        </p>
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Alasan Penolakan <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="3"
                                required
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                placeholder="Contoh: Foto NPWP kurang jelas / dokumen tidak sesuai nama instansi."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] px-3 py-2 text-slate-900 dark:text-white"
                            />
                            {rejectForm.errors.rejection_reason && (
                                <p className="text-[11px] text-rose-500">{rejectForm.errors.rejection_reason}</p>
                            )}
                            {rejectForm.errors.verification && (
                                <p className="text-[11px] text-rose-500">{rejectForm.errors.verification}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setRejectTarget(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={rejectForm.processing}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer disabled:opacity-60"
                            >
                                {rejectForm.processing ? 'Memproses...' : 'Tolak Verifikasi'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </SellerLayout>
    );
}
