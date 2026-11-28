import { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    User,
    Landmark,
    Lock,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Trash2,
    Save,
} from 'lucide-react';

export default function SellerSettingsIndex({ admin = {}, company = {} }) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const errors = props?.errors || {};

    // 1. Account Profile Form
    const accountForm = useForm({
        name: admin?.name || '',
        email: admin?.email || '',
        phone: admin?.phone || '',
    });

    // 2. Password Form (existing Breeze PUT /password)
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // 3. Company Identity & Bank Accounts Form
    const [companyName, setCompanyName] = useState(company?.company_name || 'CV. Putra Nugraha');
    const [tagline, setTagline] = useState(company?.tagline || 'Perdagangan Barang dan Jasa');
    const [npwp, setNpwp] = useState(company?.npwp || '');
    const [isPkp, setIsPkp] = useState(Boolean(company?.is_pkp ?? true));
    const [whatsappNumber, setWhatsappNumber] = useState(company?.whatsapp_number || '6281320777874');
    const [displayPhone, setDisplayPhone] = useState(company?.display_phone || '(+62) 813-2077-7874');
    const [companyEmail, setCompanyEmail] = useState(company?.email || '');
    const [address, setAddress] = useState(company?.address || '');
    const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(
        company?.default_payment_terms || 'DP / Pelunasan sesuai kesepakatan'
    );
    const [taxNote, setTaxNote] = useState(company?.tax_note || 'PPN 11% (Faktur Pajak Resmi)');
    const [bankAccounts, setBankAccounts] = useState(
        Array.isArray(company?.bank_accounts) ? company.bank_accounts : []
    );
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    const handleAccountSubmit = (e) => {
        e.preventDefault();
        accountForm.patch('/seller/settings/account', { preserveScroll: true });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put('/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleAddBank = () => {
        if (bankAccounts.length >= 5) return;
        setBankAccounts((prev) => [
            ...prev,
            { bank_name: '', account_number: '', account_holder: companyName || 'CV. Putra Nugraha' },
        ]);
    };

    const handleBankChange = (idx, field, value) => {
        setBankAccounts((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
        );
    };

    const handleRemoveBank = (idx) => {
        setBankAccounts((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();
        if (isSavingCompany) return;

        setIsSavingCompany(true);
        router.patch(
            '/seller/settings/company',
            {
                company_name: companyName,
                tagline,
                npwp: npwp || null,
                is_pkp: isPkp,
                whatsapp_number: whatsappNumber,
                display_phone: displayPhone,
                email: companyEmail || null,
                address: address || null,
                default_payment_terms: defaultPaymentTerms || null,
                tax_note: taxNote || null,
                bank_accounts: bankAccounts.filter(
                    (b) => b.bank_name.trim() && b.account_number.trim() && b.account_holder.trim()
                ),
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSavingCompany(false),
            }
        );
    };

    const firstError =
        errors?.whatsapp_number ||
        errors?.company_name ||
        errors?.name ||
        errors?.email ||
        errors?.current_password ||
        errors?.password;

    return (
        <SellerLayout title="Pengaturan Akun & Portal Vendor">
            <Head title="Pengaturan Akun & Portal Vendor — CV. Putra Nugraha" />

            <div className="space-y-6 max-w-5xl">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Pengaturan Akun Owner &amp; Identitas Perusahaan
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola profil akun pengelola tunggal, nomor WhatsApp resmi (dipakai otomatis di link konfirmasi pesanan), NPWP, dan rekening bank perusahaan.
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {firstError && (
                    <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{firstError}</span>
                    </div>
                )}

                {/* 1. IDENTITAS PERUSAHAAN & REKENING */}
                <form
                    onSubmit={handleCompanySubmit}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-5 shadow-sm text-xs"
                >
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <h2 className="text-sm font-bold">Identitas Resmi CV. Putra Nugraha &amp; Kontak WhatsApp</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="font-semibold">Nama Perusahaan *</label>
                            <input
                                type="text"
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Tagline / Bidang Usaha</label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Nomor WhatsApp Resmi (Format 628xxx, tanpa spasi) *</label>
                            <input
                                type="text"
                                required
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="6281320777874"
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Format Tampilan Nomor Telepon *</label>
                            <input
                                type="text"
                                required
                                value={displayPhone}
                                onChange={(e) => setDisplayPhone(e.target.value)}
                                placeholder="(+62) 813-2077-7874"
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">NPWP Perusahaan</label>
                            <input
                                type="text"
                                value={npwp}
                                onChange={(e) => setNpwp(e.target.value)}
                                placeholder="Masukkan NPWP resmi perusahaan"
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Email Resmi Perusahaan</label>
                            <input
                                type="email"
                                value={companyEmail}
                                onChange={(e) => setCompanyEmail(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                            <label className="font-semibold">Alamat Kantor / Gudang</label>
                            <textarea
                                rows="2"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Catatan Pajak Default</label>
                            <input
                                type="text"
                                value={taxNote}
                                onChange={(e) => setTaxNote(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold">Ketentuan Pembayaran Default</label>
                            <input
                                type="text"
                                value={defaultPaymentTerms}
                                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                            />
                        </div>

                        <label className="md:col-span-2 inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPkp}
                                onChange={(e) => setIsPkp(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600"
                            />
                            <span className="font-semibold">Berstatus Pengusaha Kena Pajak (PKP — menerbitkan e-Faktur PPN 11%)</span>
                        </label>
                    </div>

                    {/* Rekening Bank Manual */}
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold">
                                <Landmark className="h-4 w-4 text-blue-600" />
                                <span>Daftar Rekening Transfer Resmi Perusahaan</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddBank}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Tambah Rekening</span>
                            </button>
                        </div>

                        {bankAccounts.length === 0 ? (
                            <p className="text-slate-500">Belum ada rekening bank ditambahkan.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {bankAccounts.map((bank, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-xl bg-slate-50 dark:bg-[#12161F] p-3 border border-slate-200 dark:border-slate-800">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nama Bank (cth: Bank Mandiri)"
                                            value={bank.bank_name}
                                            onChange={(e) => handleBankChange(idx, 'bank_name', e.target.value)}
                                            className="sm:col-span-3 rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nomor Rekening"
                                            value={bank.account_number}
                                            onChange={(e) => handleBankChange(idx, 'account_number', e.target.value)}
                                            className="sm:col-span-4 rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Atas Nama"
                                            value={bank.account_holder}
                                            onChange={(e) => handleBankChange(idx, 'account_holder', e.target.value)}
                                            className="sm:col-span-4 rounded-lg bg-white dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBank(idx)}
                                            className="sm:col-span-1 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg justify-self-end"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSavingCompany}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSavingCompany ? 'Menyimpan...' : 'Simpan Pengaturan Perusahaan'}</span>
                        </button>
                    </div>
                </form>

                {/* 2. AKUN PENGELOLA & GANTI PASSWORD */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form
                        onSubmit={handleAccountSubmit}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm text-xs"
                    >
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <User className="h-4 w-4 text-blue-600" />
                            <h2 className="text-sm font-bold">Profil Akun Pengelola (Owner)</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="font-semibold">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.data.name}
                                    onChange={(e) => accountForm.setData('name', e.target.value)}
                                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-semibold">Email Login *</label>
                                <input
                                    type="email"
                                    required
                                    value={accountForm.data.email}
                                    onChange={(e) => accountForm.setData('email', e.target.value)}
                                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-semibold">No. HP / WhatsApp</label>
                                <input
                                    type="text"
                                    value={accountForm.data.phone}
                                    onChange={(e) => accountForm.setData('phone', e.target.value)}
                                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={accountForm.processing}
                                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-bold"
                            >
                                Simpan Profil Akun
                            </button>
                        </div>
                    </form>

                    <form
                        onSubmit={handlePasswordSubmit}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 space-y-4 shadow-sm text-xs"
                    >
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <Lock className="h-4 w-4 text-blue-600" />
                            <h2 className="text-sm font-bold">Ubah Kata Sandi Admin</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="font-semibold">Kata Sandi Saat Ini *</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-semibold">Kata Sandi Baru *</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-semibold">Konfirmasi Kata Sandi Baru *</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-bold"
                            >
                                Perbarui Kata Sandi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
