import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        company_address: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-[#07132b] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
            <Head title="Pendaftaran Akun Klien & Rekanan B2B" />

            {/* TOP HEADER */}
            <header className="w-full border-b border-slate-800/80 bg-[#07132b]/95 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 h-20">
                    {/* Brand Identity / Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/images/logo-pn.png"
                            alt="Logo CV. Putra Nugraha"
                            className="h-10 w-10 rounded-lg object-contain shadow-sm"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-white uppercase">
                                CV. PUTRA NUGRAHA
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">
                                Perdagangan Barang dan Jasa
                            </span>
                        </div>
                    </Link>

                    {/* Right Login Link */}
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs text-slate-400">
                            Sudah memiliki akun?
                        </span>
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    
                    {/* LEFT COLUMN: Keuntungan Mendaftar Akun Klien */}
                    <div className="lg:col-span-5 rounded-2xl border border-slate-800/90 bg-[#0d1830]/90 p-7 sm:p-8 flex flex-col justify-between space-y-8">
                        <div className="space-y-6">
                            {/* Pill Badge */}
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold font-mono tracking-wide">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                    KEMITRAAN B2B RESMI
                                </span>
                            </div>

                            {/* Heading */}
                            <h2 className="font-display text-2xl sm:text-[26px] font-extrabold text-white leading-snug">
                                Keuntungan Mendaftar Akun Klien CV. Putra Nugraha
                            </h2>

                            {/* Benefit Items */}
                            <div className="space-y-5 pt-2">
                                {/* Item 1 */}
                                <div className="flex items-start gap-3.5">
                                    <div className="h-7 w-7 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            Akses Katalog &amp; Harga Grosir B2B
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                            Hardware, Server, Networking &amp; Aksesoris
                                        </p>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-start gap-3.5">
                                    <div className="h-7 w-7 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            Pengajuan RFQ &amp; Penerbitan SPH Otomatis
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                            Untuk kebutuhan RAB kantor/instansi
                                        </p>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="flex items-start gap-3.5">
                                    <div className="h-7 w-7 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            Dukungan Administrasi Pajak Lengkap
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                            e-Faktur PPN 11%, Invoice, &amp; BAST
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Fast Verification Box */}
                        <div className="pt-6 border-t border-slate-800/80">
                            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                                <span className="text-slate-300 font-medium">Verifikasi Akun Cepat:</span> (+62) 813-2077-7874 | Jl. Cisangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Pendaftaran Akun Klien & Rekanan Form */}
                    <div className="lg:col-span-7 rounded-2xl border border-slate-800/90 bg-[#0d1830]/90 p-7 sm:p-10 shadow-2xl space-y-7">
                        <div>
                            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Pendaftaran Akun Klien &amp; Rekanan B2B
                            </h1>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* SECTION 1: Informasi */}
                            <div className="space-y-4">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
                                    1. Informasi
                                </div>

                                {/* Nama Lengkap */}
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="block text-xs font-medium text-slate-300">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        placeholder="Contoh: Budi Santoso"
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700/80 bg-[#081226] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                                </div>

                                {/* Grid: Email & WhatsApp */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="block text-xs font-medium text-slate-300">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            placeholder="nama@perusahaan.co.id"
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700/80 bg-[#081226] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                            required
                                        />
                                        {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="block text-xs font-medium text-slate-300">
                                            Nomor WhatsApp Aktif
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            placeholder="08xx-xxxx-xxxx"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700/80 bg-[#081226] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Profil Perusahaan / Instansi */}
                            <div className="space-y-4 pt-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
                                    2. Profil Perusahaan / Instansi
                                </div>

                                {/* Nama Perusahaan */}
                                <div className="space-y-1.5">
                                    <label htmlFor="company_name" className="block text-xs font-medium text-slate-300">
                                        Nama Perusahaan / Instansi
                                    </label>
                                    <input
                                        id="company_name"
                                        type="text"
                                        name="company_name"
                                        value={data.company_name}
                                        placeholder="PT / CV / Instansi..."
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700/80 bg-[#081226] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Alamat Lengkap Perusahaan */}
                                <div className="space-y-1.5">
                                    <label htmlFor="company_address" className="block text-xs font-medium text-slate-300">
                                        Alamat Lengkap Perusahaan
                                    </label>
                                    <input
                                        id="company_address"
                                        type="text"
                                        name="company_address"
                                        value={data.company_address}
                                        placeholder="Alamat kantor..."
                                        onChange={(e) => setData('company_address', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700/80 bg-[#081226] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* SECTION 3: Keamanan Akun */}
                            <div className="space-y-4 pt-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
                                    3. Keamanan Akun
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                                            Buat Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full rounded-xl border border-slate-700/80 bg-[#081226] px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
                                    </div>

                                    {/* Konfirmasi Password */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="password_confirmation" className="block text-xs font-medium text-slate-300">
                                            Konfirmasi Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full rounded-xl border border-slate-700/80 bg-[#081226] px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="pt-2">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="terms"
                                        checked={data.terms}
                                        onChange={(e) => setData('terms', e.target.checked)}
                                        className="mt-0.5 rounded border-slate-700 bg-[#081226] text-blue-600 focus:ring-blue-500/30"
                                        required
                                    />
                                    <span className="text-xs text-slate-300 leading-relaxed">
                                        Saya menyetujui Syarat &amp; Ketentuan CV. Putra Nugraha.
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {processing ? 'Mendaftarkan Akun...' : 'Daftar Akun Klien Sekarang'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
