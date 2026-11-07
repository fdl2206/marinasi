import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Building2, Store } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('buyer'); // 'buyer' (klien) or 'seller' (rekanan/internal)

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        portal: 'buyer',
    });

    const handleRoleSwitch = (selectedRole) => {
        setRole(selectedRole);
        setData('portal', selectedRole);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#12161F] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
            <Head title={role === 'buyer' ? 'Masuk Klien B2B' : 'Masuk Rekanan & Mitra B2B'} />

            {/* TOP HEADER */}
            <header className="w-full border-b border-slate-800/80 bg-[#12161F]/95 backdrop-blur-md sticky top-0 z-50">
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

                    {/* Back to Comprof */}
                    <div>
                        <Link
                            href="/"
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-10 lg:py-16 flex items-center">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* LEFT COLUMN: Value Proposition */}
                    <div className="lg:col-span-7 space-y-6 lg:pr-6">
                        {/* Pill Badge */}
                        <div>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold font-mono tracking-wide">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                {role === 'buyer'
                                    ? 'PORTAL KLIEN & E-PROCUREMENT RESMI'
                                    : 'PORTAL REKANAN & RANTAI PASOK CV'}
                            </span>
                        </div>

                        {/* Dynamic Heading based on Role */}
                        <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-[1.16] tracking-tight transition-all duration-200">
                            {role === 'buyer'
                                ? 'Kelola Pengadaan Hardware & Jaringan Bisnis Lebih Cepat'
                                : 'Pusat Manajemen Logistik, Katalog & Pengadaan Mitra'}
                        </h1>

                        {/* Description */}
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg font-normal transition-all duration-200">
                            {role === 'buyer'
                                ? 'Kelola kebutuhan pengadaan bisnis, dokumen, dan pesanan perusahaan Anda melalui portal klien resmi kami.'
                                : 'Akses khusus tim dan rekanan CV. Putra Nugraha untuk pemrosesan PO, pembaruan stok perangkat, dan kelengkapan administrasi tender.'}
                        </p>
                    </div>

                    {/* RIGHT COLUMN: Form Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="w-full max-w-md rounded-2xl border border-slate-800/90 bg-[#171B26]/90 p-7 sm:p-10 shadow-2xl space-y-6">
                            
                            {/* Segmented Role Switcher */}
                            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#12161F] border border-slate-800 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => handleRoleSwitch('buyer')}
                                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                                        role === 'buyer'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>Klien B2B</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleSwitch('seller')}
                                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                                        role === 'seller'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Store className="h-3.5 w-3.5" />
                                    <span>Rekanan / Tim CV</span>
                                </button>
                            </div>

                            {/* Card Header */}
                            <div className="space-y-1">
                                <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                                    {role === 'buyer' ? 'Masuk Klien B2B' : 'Masuk Rekanan / Tim CV'}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400">
                                    {role === 'buyer'
                                        ? 'Masuk menggunakan akun perusahaan atau instansi Anda.'
                                        : 'Gunakan kredensial resmi rekanan / internal Anda.'}
                                </p>
                            </div>

                            {status && (
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                    {status}
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={submit} className="space-y-5">
                                
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-xs font-medium text-slate-300">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder={role === 'buyer' ? 'nama@perusahaan.co.id' : 'rekanan@putranugraha.com'}
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700/80 bg-[#12161F] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                        required
                                    />
                                    {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                                        Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700/80 bg-[#12161F] px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
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

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded border-slate-700 bg-[#12161F] text-blue-600 focus:ring-blue-500/30"
                                        />
                                        <span>Ingat Saya</span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            Lupa Kata Sandi?
                                        </Link>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {processing ? 'Memproses Masuk...' : `Masuk ${role === 'buyer' ? 'Klien' : 'Rekanan'}`}
                                    </button>
                                </div>

                            </form>

                            {/* Help & Register Link */}
                            <div className="pt-3 border-t border-slate-800/80 text-center space-y-2 text-xs">
                                <div>
                                    <a
                                        href="https://wa.me/6281320777874?text=Halo%20CV%20Putra%20Nugraha,%20saya%20butuh%20bantuan%20akses%20akun"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        atau butuh bantuan akses akun?
                                    </a>
                                </div>
                                <div className="text-slate-400 pt-1">
                                    {role === 'buyer' ? (
                                        <>
                                            Belum terdaftar sebagai klien rekanan?{' '}
                                            <Link
                                                href="/register"
                                                className="text-white hover:text-blue-400 font-semibold transition-colors"
                                            >
                                                Daftar Akun Baru
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            Kemitraan pengadaan baru?{' '}
                                            <a
                                                href="https://wa.me/6281320777874?text=Halo%20CV%20Putra%20Nugraha,%20saya%20tertarik%20menjadi%20rekanan%20resmi"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white hover:text-blue-400 font-semibold transition-colors"
                                            >
                                                Hubungi Tim Kemitraan
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            {/* BOTTOM INFO FOOTER BAR */}
            <footer className="w-full border-t border-slate-800/80 bg-[#0C0D12] py-6">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 text-xs text-slate-400 text-center sm:text-left">
                    <p>
                        Jl. Cisangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung | Telp: (+62) 813-2077-7874
                    </p>
                </div>
            </footer>
        </div>
    );
}
