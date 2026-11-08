import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { Wrench, ArrowLeft } from 'lucide-react';

export default function SellerServicesIndex() {
    return (
        <SellerLayout title="Jadwal Teknisi & Servis">
            <Head title="Jadwal Teknisi & Servis — CV. Putra Nugraha Internal" />

            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                            Jadwal Teknisi &amp; Servis
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Alokasi teknisi on-site, kalender instalasi jaringan LAN/server, dan pencatatan BAST pekerjaan teknis.
                        </p>
                    </div>
                </div>

                {/* Empty State / Awaiting Design Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-8 sm:p-12 text-center space-y-4 shadow-sm dark:shadow-xl">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-[#12161F] border border-blue-100 dark:border-slate-700/80 text-blue-600 dark:text-[#9bb8f5] flex items-center justify-center mx-auto shadow-sm dark:shadow-inner">
                        <Wrench className="h-8 w-8" />
                    </div>

                    <div className="space-y-1.5 max-w-md mx-auto">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium badge-azure">
                            <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                            <span>Menunggu Spesifikasi Desain UI/UX</span>
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-1">
                            Modul Jadwal Teknisi Belum Memiliki Desain
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Halaman ini sengaja dikosongkan terlebih dahulu karena belum ada rancangan desain visual resminya. Jadwal teknisi hari ini tetap dapat dipantau di halaman Ringkasan Operasional.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-3">
                        <Link
                            href="/seller/dashboard"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary-bespoke text-xs font-medium transition"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Ringkasan Operasional</span>
                        </Link>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}

