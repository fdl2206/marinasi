import BuyerLayout from '@/Layouts/BuyerLayout';
import { Link } from '@inertiajs/react';
import { FileSpreadsheet, Plus, Download, MessageSquareText, CheckCircle2 } from 'lucide-react';

export default function QuotationsIndex() {
    return (
        <BuyerLayout title="Permintaan Nego Harga (RFQ)">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Daftar Pengajuan Penawaran (RFQ)</h1>
                        <p className="text-slate-400 text-xs mt-1">Kelola dan pantau proses negosiasi harga kuantitas besar dengan seller.</p>
                    </div>
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
                    >
                        <Plus className="h-4 w-4" />
                        Ajukan RFQ dari Katalog
                    </Link>
                </div>

                <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
                    <div className="p-8 text-center space-y-3">
                        <FileSpreadsheet className="h-12 w-12 text-blue-400/60 mx-auto" />
                        <h3 className="text-base font-bold text-white">Sistem Negosiasi Digital Aktif</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Setiap item katalog yang Anda ajukan untuk negosiasi akan tercatat di sini lengkap dengan riwayat tawar-menawar harga dan penerbitan Surat Penawaran Resmi (PDF).
                        </p>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
