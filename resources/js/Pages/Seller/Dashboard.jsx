import SellerLayout from '@/Layouts/SellerLayout';
import { Link } from '@inertiajs/react';
import { PackageCheck, Handshake, Truck, FileCheck2, ArrowRight } from 'lucide-react';

export default function SellerDashboard() {
    return (
        <SellerLayout title="Dashboard Seller (Wireframe)">
            <div className="space-y-6 font-mono text-xs">
                {/* Wireframe Welcome Banner */}
                <div className="rounded-lg border border-dashed border-navy-700 bg-navy-900/40 p-5 space-y-1.5 font-sans">
                    <div className="text-[10px] font-mono text-amber-400 font-bold">[PANEL: SELLER_OPERATIONAL_OVERVIEW]</div>
                    <h1 className="text-xl font-bold text-white">Dashboard Operasional Internal CV. Putra Nugraha</h1>
                    <p className="text-slate-400 text-xs font-mono">
                        [SLOT_INFO: Manajemen katalog barang, verifikasi permohonan harga (RFQ), pemrosesan PO, dan arsip legalitas perusahaan].
                    </p>
                </div>

                {/* KPI Metrics Wireframe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { code: 'METRIC_01', title: 'Produk Aktif Terdaftar', val: 'xx Item', icon: PackageCheck },
                        { code: 'METRIC_02', title: 'Antrean Nego (RFQ) Masuk', val: 'xx Antrean', icon: Handshake },
                        { code: 'METRIC_03', title: 'Pesanan Diproses', val: 'xx Pesanan', icon: Truck },
                        { code: 'METRIC_04', title: 'Kepatuhan Legalitas Usaha', val: 'Terverifikasi', icon: FileCheck2 },
                    ].map((m, i) => (
                        <div key={i} className="p-4 rounded border border-navy-800 bg-navy-900/50 space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>[{m.code}]</span>
                                <m.icon className="h-3.5 w-3.5 text-amber-400" />
                            </div>
                            <div className="text-lg font-bold text-white font-sans">{m.val}</div>
                            <div className="text-[11px] text-slate-400 font-sans">{m.title}</div>
                        </div>
                    ))}
                </div>

                {/* RFQ Queue Table Wireframe */}
                <div className="rounded-lg border border-dashed border-navy-700 bg-navy-900/30 p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                        <span className="text-white font-bold font-sans">[TABEL_SLOT: ANTREAN_RFQ_MASUK]</span>
                        <Link href="/seller/negotiations" className="text-amber-400 hover:text-white flex items-center gap-1 text-[11px]">
                            <span>Buka Negosiasi</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="text-[10px] uppercase text-slate-500 border-b border-navy-800">
                                <tr>
                                    <th className="py-2.5 px-3">Kode RFQ</th>
                                    <th className="py-2.5 px-3">Nama Mitra Buyer</th>
                                    <th className="py-2.5 px-3">Komoditas / Volume</th>
                                    <th className="py-2.5 px-3">Target Harga Buyer</th>
                                    <th className="py-2.5 px-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-850 font-sans text-xs">
                                <tr>
                                    <td className="py-3 px-3 font-mono text-amber-400">RFQ-2026-xxxx</td>
                                    <td className="py-3 px-3 text-white">[TBA: Nama Instansi Pembeli]</td>
                                    <td className="py-3 px-3 text-slate-400">[TBA: Komoditas x Qty]</td>
                                    <td className="py-3 px-3 text-white font-mono">Rp xxx.xxx.xxx</td>
                                    <td className="py-3 px-3 text-right">
                                        <button className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px]">
                                            [RESPON_SPH]
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
