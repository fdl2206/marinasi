import { Link } from '@inertiajs/react';
import { Phone, MapPin, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="kontak" className="scroll-mt-20 w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#040a18] text-slate-600 dark:text-slate-400 font-sans text-sm transition-colors duration-150">
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    
                    {/* LEFT COLUMN: Brand Identity & Summary */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Logo & Name */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/logo-pn.png"
                                alt="Logo CV. Putra Nugraha"
                                className="h-11 w-11 rounded-lg object-contain shadow-sm"
                            />
                            <div className="flex flex-col">
                                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                                    CV. PUTRA NUGRAHA
                                </span>
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                    Perdagangan Barang dan Jasa
                                </span>
                            </div>
                        </div>

                        {/* Company Mission / Intro */}
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-lg font-normal">
                            Mitra pengadaan barang dan jasa IT untuk mendukung operasional perusahaan dengan perangkat andal dan layanan profesional.
                        </p>

                        {/* Category Tags */}
                        <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                            <a 
                                href="#layanan"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector('#layanan')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 transition shadow-sm"
                            >
                                Hardware Enterprise
                            </a>
                            <a 
                                href="#layanan"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector('#layanan')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 transition shadow-sm"
                            >
                                Jaringan &amp; Fiber Optic
                            </a>
                            <a 
                                href="#layanan"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector('#layanan')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 transition shadow-sm"
                            >
                                Maintenance SLA
                            </a>
                            <a 
                                href="#layanan"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector('#layanan')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 transition shadow-sm"
                            >
                                Suku Cadang Resmi
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Official Contact & Address */}
                    <div className="lg:col-span-5 space-y-6">
                        <h4 className="font-display text-base font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                            Hubungi Kami
                        </h4>

                        <div className="space-y-4">
                            {/* Phone / WhatsApp */}
                            <a 
                                href="https://wa.me/6281320777874" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-start gap-3.5 group text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">TELEPON / WHATSAPP</div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                        (+62) 813-2077-7874
                                    </div>
                                </div>
                            </a>

                            {/* Office Address */}
                            <div className="flex items-start gap-3.5 text-slate-600 dark:text-slate-300">
                                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 shrink-0">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">ALAMAT KANTOR</div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm">
                                        Jl. Cisangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTTOM BAR: Copyright & Trade Notice */}
                <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <p>© {new Date().getFullYear()} CV. Putra Nugraha. All Rights Reserved.</p>
                    <p className="font-medium">Perdagangan Barang dan Jasa</p>
                </div>
            </div>
        </footer>
    );
}
