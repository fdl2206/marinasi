import BuyerLayout from '@/Layouts/BuyerLayout';
import { Receipt, Download, FileText, CheckCircle } from 'lucide-react';

export default function InvoicesIndex() {
    return (
        <BuyerLayout title="Bukti Pembelian & Invoice">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Invoice & Bukti Transaksi</h1>
                    <p className="text-slate-400 text-xs mt-1">Unduh faktur pajak, kwitansi pembayaran, dan Berita Acara Serah Terima (BAST).</p>
                </div>

                <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
                    <div className="p-8 text-center space-y-3">
                        <Receipt className="h-12 w-12 text-emerald-400/60 mx-auto" />
                        <h3 className="text-base font-bold text-white">Arsip Dokumen Finansial & Administrasi</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Seluruh berkas transaksi dapat diunduh dalam format PDF resmi dengan stempel digital CV. Putra Nugraha untuk pelaporan akuntansi internal Anda.
                        </p>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
