import SellerLayout from '@/Layouts/SellerLayout';
import { Truck, Printer, FileText, CheckCircle2 } from 'lucide-react';

export default function SellerOrdersIndex() {
    return (
        <SellerLayout title="Pemrosesan Pesanan & Cetak Dokumen">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pemrosesan Pesanan & Dokumen Pengadaan</h1>
                    <p className="text-slate-400 text-xs mt-1">Cetak Surat Jalan, Faktur Penjualan, BAST, dan input resi pengiriman logistik.</p>
                </div>

                <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
                    <div className="p-8 text-center space-y-3">
                        <Printer className="h-12 w-12 text-indigo-400/60 mx-auto" />
                        <h3 className="text-base font-bold text-white">Administrasi Transaksi Terpadu</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Format berkas cetak siap pakai dengan kop surat resmi CV. Putra Nugraha, nomor seri faktur pajak, dan rincian spesifikasi barang.
                        </p>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
