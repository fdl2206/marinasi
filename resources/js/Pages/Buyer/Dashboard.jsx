import BuyerLayout from '@/Layouts/BuyerLayout';
import { Link } from '@inertiajs/react';
import { FileSpreadsheet, Package, Receipt, ArrowRight } from 'lucide-react';

export default function BuyerDashboard() {
    return (
        <BuyerLayout title="Dashboard Buyer (Wireframe)">
            <div className="space-y-6 font-mono text-xs">
                {/* Wireframe Welcome Banner */}
                <div className="rounded-lg border border-dashed border-navy-700 bg-navy-900/40 p-5 space-y-1.5 font-sans">
                    <div className="text-[10px] font-mono text-blue-400 font-bold">[PANEL: BUYER_OVERVIEW]</div>
                    <h1 className="text-xl font-bold text-white">Dashboard Portal Buyer / Instansi Mitra</h1>
                    <p className="text-slate-400 text-xs font-mono">
                        [SLOT_INFO: Monitoring status permohonan penawaran harga (RFQ), tracking pengiriman barang, dan arsip faktur/BAST].
                    </p>
                </div>

                {/* KPI Metrics Wireframe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { code: 'METRIC_01', title: 'Permintaan RFQ Aktif', val: 'x Pengajuan', icon: FileSpreadsheet },
                        { code: 'METRIC_02', title: 'Pesanan Dalam Pengiriman', val: 'x Kontrak', icon: Package },
                        { code: 'METRIC_03', title: 'Pesanan Sukses Selesai', val: 'x Selesai', icon: Package },
                        { code: 'METRIC_04', title: 'Invoice Belum Terbayar', val: 'x Tagihan', icon: Receipt },
                    ].map((m, i) => (
                        <div key={i} className="p-4 rounded border border-navy-800 bg-navy-900/50 space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>[{m.code}]</span>
                                <m.icon className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <div className="text-lg font-bold text-white font-sans">{m.val}</div>
                            <div className="text-[11px] text-slate-400 font-sans">{m.title}</div>
                        </div>
                    ))}
                </div>

                {/* Table Wireframe Slot */}
                <div className="rounded-lg border border-dashed border-navy-700 bg-navy-900/30 p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                        <span className="text-white font-bold font-sans">[TABEL_SLOT: DAFTAR_RFQ_TERKINI]</span>
                        <Link href="/buyer/quotations" className="text-blue-400 hover:text-white flex items-center gap-1 text-[11px]">
                            <span>Lihat Semua</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="text-[10px] uppercase text-slate-500 border-b border-navy-800">
                                <tr>
                                    <th className="py-2.5 px-3">Kode RFQ</th>
                                    <th className="py-2.5 px-3">Komoditas / Item</th>
                                    <th className="py-2.5 px-3">Tanggal Pengajuan</th>
                                    <th className="py-2.5 px-3">Estimasi Nilai</th>
                                    <th className="py-2.5 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-850 font-sans text-xs">
                                <tr>
                                    <td className="py-3 px-3 font-mono text-blue-400">RFQ-2026-xxxx</td>
                                    <td className="py-3 px-3 text-white">[TBA: Nama Komoditas / Volume Pengadaan]</td>
                                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">dd/mm/yyyy</td>
                                    <td className="py-3 px-3 text-white font-mono">Rp xxx.xxx.xxx</td>
                                    <td className="py-3 px-3">
                                        <span className="px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-mono">
                                            [STATUS: MENUNGGU_RESPON]
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
