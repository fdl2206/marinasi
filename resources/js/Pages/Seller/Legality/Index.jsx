import SellerLayout from '@/Layouts/SellerLayout';
import { FileCheck2, Upload, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SellerLegalityIndex() {
    return (
        <SellerLayout title="Dokumen Legalitas Perusahaan">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Legalitas Perusahaan CV. Putra Nugraha</h1>
                    <p className="text-slate-400 text-xs mt-1">Kelola berkas izin usaha, NIB, NPWP, PKP, dan sertifikat mutu untuk keperluan verifikasi tender.</p>
                </div>

                <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
                    <div className="p-8 text-center space-y-3">
                        <ShieldCheck className="h-12 w-12 text-emerald-400/60 mx-auto" />
                        <h3 className="text-base font-bold text-white">Manajemen Kepatuhan Hukum & Tender</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Unggah pembaharuan dokumen legalitas agar dapat diverifikasi oleh mitra pengadaan dan instansi pemerintah secara instan.
                        </p>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
