import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function SellerLegalityIndex() {
    return (
        <SellerLayout title="Upload e-Faktur & BAST">
            <Head title="Upload e-Faktur & BAST — CV. Putra Nugraha Internal" />

            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            CV. PUTRA NUGRAHA - Perdagangan Barang dan Jasa
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                            Dokumen Legalitas, e-Faktur &amp; BAST
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Kelola berkas izin usaha, NIB, NPWP, PKP, upload PDF e-Faktur pajak, dan penandatanganan BAST digital.
                        </p>
                    </div>
                </div>

                {/* Content / Placeholder */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-8 sm:p-12 text-center space-y-4 shadow-sm dark:shadow-xl">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-[#12161F] border border-blue-100 dark:border-slate-700/80 text-blue-600 dark:text-[#9bb8f5] flex items-center justify-center mx-auto shadow-sm dark:shadow-inner">
                        <ShieldCheck className="h-8 w-8" />
                    </div>

                    <div className="space-y-1.5 max-w-md mx-auto">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium badge-azure">
                            <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                            <span>Menunggu Spesifikasi Desain UI/UX</span>
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-1">
                            Modul Dokumen Pajak &amp; Legalitas Lengkap
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Halaman ini sengaja dikosongkan terlebih dahulu sambil menunggu instruksi desain resmi. Fitur upload e-Faktur PDF dan buat BAST per pesanan aktif di tabel kontrol pesanan.
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
