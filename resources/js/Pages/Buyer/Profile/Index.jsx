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
    MapPin,
    Lock,
    User,
    X,
    Info,
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';

export default function ProfileIndex({
    profile: serverProfile = null,
    companyProfile: serverCompanyProfile = null,
    addresses: serverAddresses = [],
}) {
    const { props } = usePage();
    const auth = props?.auth;

    const initialName = serverProfile?.name ?? auth?.user?.name ?? '';
    const initialEmail = serverProfile?.email ?? auth?.user?.email ?? '';
    const initialPhone = serverProfile?.phone ?? serverCompanyProfile?.phone ?? auth?.user?.phone ?? '';
    const initialCompanyName = serverProfile?.company_name ?? serverCompanyProfile?.company_name ?? auth?.user?.company_name ?? '';
    const initialCompanyAddress = serverProfile?.company_address ?? serverCompanyProfile?.company_address ?? auth?.user?.company_address ?? '';

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

    const [isSaved, setIsSaved] = useState(false);
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
    const taxStatus = serverCompanyProfile?.tax_status || '';
    const npwpNumber = serverCompanyProfile?.npwp_number || '';
    const nibNumber = serverCompanyProfile?.nib_number || '';

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
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

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Profil Perusahaan & Alamat — CV. Putra Nugraha" />

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
                                Profil Perusahaan, Kontak &amp; Alamat
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Perbarui informasi perusahaan, alamat utama, dan nomor kontak aktif akun Anda.
                            </p>
                        </div>

                        {passwordSuccess && (
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                Kata sandi akun berhasil diperbarui.
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            {/* CARD 1: DATA PERUSAHAAN & KONTAK */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        1. Data Perusahaan / Instansi &amp; Alamat Utama
                                    </h2>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 shrink-0">
                                        <span>{taxStatus || 'Profil Dasar'}</span>
                                    </span>
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

                                {(npwpNumber || nibNumber) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="text-xs">
                                            <div className="text-slate-500 dark:text-slate-400">NPWP</div>
                                            <div className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5">{npwpNumber || '-'}</div>
                                        </div>
                                        <div className="text-xs">
                                            <div className="text-slate-500 dark:text-slate-400">NIB</div>
                                            <div className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5">{nibNumber || '-'}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                                        <Info className="h-4 w-4 text-[#086f8e] shrink-0 mt-0.5" />
                                        <span>
                                            Pengelolaan dokumen perpajakan (NPWP/PKP/NIB) dan verifikasi termin pembayaran belum diaktifkan pada backend. Koordinasi administrasi pajak dilakukan langsung bersama tim CV. Putra Nugraha.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* CARD 2: PIC & KEAMANAN LOGIN */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        2. Penanggung Jawab Akun (PIC) &amp; Keamanan Login
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

                        {/* CARD 3: DAFTAR ALAMAT */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    3. Daftar Alamat Pengiriman &amp; Lokasi Instalasi
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
