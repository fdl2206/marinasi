import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';

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
        <div className="min-h-screen bg-slate-50 dark:bg-[#12161F] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between transition-colors duration-150">
            <Head title="Pendaftaran Akun Klien & Rekanan B2B" />

            {/* TOP HEADER */}
            <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#12161F]/95 backdrop-blur-md sticky top-0 z-50 transition-colors duration-150">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 h-20">
                    {/* Brand Identity / Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/images/logo-pn.png"
                            alt="Logo CV. Putra Nugraha"
                            className="h-10 w-10 rounded-lg object-contain shadow-sm"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                                CV. PUTRA NUGRAHA
                            </span>
                            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                Perdagangan Barang dan Jasa
                            </span>
                        </div>
                    </Link>

                    {/* Right: ThemeToggle + Login Link */}
                    <div className="flex items-center gap-2.5">
                        <ThemeToggle />
                        <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 mr-1">
                            Sudah memiliki akun?
                        </span>
                        <Link
                            href="/login"
                            className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-white transition-colors shadow-sm"
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
                    <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#171B26]/90 p-7 sm:p-8 flex flex-col justify-between space-y-8 shadow-sm dark:shadow-xl transition-colors duration-150">
                        <div className="space-y-6">
                            {/* Pill Badge */}
                            <div>
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold font-mono tracking-wide">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                                    KEMITRAAN B2B RESMI
                                </span>
                            </div>

                            {/* Heading */}
                            <h2 className="font-display text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white leading-[1.35] tracking-normal">
                                Keuntungan Mendaftar Akun Klien CV. Putra Nugraha
                            </h2>

                            {/* Benefit Items */}
                            <div className="space-y-6 pt-3">
                                {/* Item 1 */}
                                <div className="flex items-start gap-3.5">
                                    <div className="h-7 w-7 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-0.5">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-normal">
                                            Akses Katalog &amp; Harga Grosir B2B
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            Hardware, Server, Networking &amp; Aksesoris
                                        </p>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-start gap-3.5">
                                    <div className="h-7 w-7 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-0.5">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-normal">
                                            Pengajuan RFQ &amp; Penerbitan SPH Otomatis
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            Untuk kebutuhan RAB kantor/instansi
                                        </p>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="flex items-start gap-3.5">
                                    <div className="h-7 w-7 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-0.5">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-normal">
                                            Dukungan Administrasi Pajak Lengkap
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            e-Faktur PPN 11%, Invoice, &amp; BAST
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Fast Verification Box */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Verifikasi Akun Cepat:</span> (+62) 813-2077-7874 | Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Pendaftaran Akun Klien & Rekanan Form */}
                    <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#171B26]/90 p-7 sm:p-10 shadow-xl dark:shadow-2xl space-y-7 transition-colors duration-150">
                        <div>
                            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-normal leading-tight">
                                Pendaftaran Akun Klien &amp; Rekanan B2B
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                Daftarkan instansi atau perusahaan Anda untuk akses katalog grosir dan kemudahan RFQ resmi.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* SECTION 1: Informasi */}
                            <div className="space-y-4">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                                    1. Informasi Kontak
                                </div>

                                {/* Nama Lengkap */}
                                <div>
                                    <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Nama Lengkap Penanggung Jawab
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        placeholder="Contoh: Budi Santoso"
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#12161F] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#12161F] focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">{errors.name}</p>}
                                </div>

                                {/* Grid: Email & WhatsApp */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Email Perusahaan
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            placeholder="nama@perusahaan.co.id"
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#12161F] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#12161F] focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                            required
                                        />
                                        {errors.email && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Nomor WhatsApp Aktif
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            placeholder="08xx-xxxx-xxxx"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#12161F] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#12161F] focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Profil Perusahaan / Instansi */}
                            <div className="space-y-4 pt-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                                    2. Profil Perusahaan / Instansi
                                </div>

                                {/* Nama Perusahaan */}
                                <div>
                                    <label htmlFor="company_name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Nama Perusahaan / Instansi
                                    </label>
                                    <input
                                        id="company_name"
                                        type="text"
                                        name="company_name"
                                        value={data.company_name}
                                        placeholder="PT / CV / Instansi..."
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#12161F] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#12161F] focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Alamat Lengkap Perusahaan */}
                                <div>
                                    <label htmlFor="company_address" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Alamat Lengkap Perusahaan
                                    </label>
                                    <input
                                        id="company_address"
                                        type="text"
                                        name="company_address"
                                        value={data.company_address}
                                        placeholder="Alamat kantor..."
                                        onChange={(e) => setData('company_address', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#12161F] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#12161F] focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* SECTION 3: Keamanan Akun */}
                            <div className="space-y-4 pt-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                                    3. Keamanan Akun
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Buat Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#12161F] px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#12161F] focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">{errors.password}</p>}
                                    </div>

                                    {/* Konfirmasi Password */}
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Konfirmasi Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#12161F] px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#12161F] focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">{errors.password_confirmation}</p>
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
                                        className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12161F] text-blue-600 focus:ring-blue-500/30"
                                        required
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Saya menyetujui Syarat &amp; Ketentuan CV. Putra Nugraha.
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold tracking-wide text-white text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {processing ? 'Mendaftarkan Akun...' : 'Daftar Akun Klien Sekarang'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </main>

            {/* BOTTOM INFO FOOTER BAR */}
            <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0C0D12] py-6 transition-colors duration-150">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                    <p>
                        Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung | Telp: (+62) 813-2077-7874
                    </p>
                </div>
            </footer>
        </div>
    );
}
