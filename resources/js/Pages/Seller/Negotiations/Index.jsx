import SellerLayout from '@/Layouts/SellerLayout';
import { Handshake, FileText, Send, CheckCircle2 } from 'lucide-react';

export default function SellerNegotiationsIndex() {
    return (
        <SellerLayout title="Respon Negosiasi Harga (RFQ)">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola Negosiasi & Permintaan Penawaran</h1>
                    <p className="text-slate-400 text-xs mt-1">Evaluasi margin harga per unit, volume kuantitas, dan terbitkan Surat Penawaran Resmi.</p>
                </div>

                <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
                    <div className="p-8 text-center space-y-3">
                        <Handshake className="h-12 w-12 text-amber-400/60 mx-auto" />
                        <h3 className="text-base font-bold text-white">Pusat Negosiasi B2B Interaktif</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Balas tawaran harga buyer dengan counter-offer resmi atau setujui harga untuk menerbitkan purchase confirmation secara otomatis.
                        </p>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
