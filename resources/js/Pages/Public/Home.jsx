import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, Box, Layers, LayoutTemplate, Shield, FileText } from 'lucide-react';

export default function Home() {
    return (
        <MainLayout title="Beranda (Wireframe)">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
                {/* WIREFRAME NOTICE BANNER */}
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">[WIREFRAME BASELINE]</span>
                        <span>Layout struktural & blueprint awal. Komponen & visual siap digantikan aset mockup final.</span>
                    </div>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40">
                        V1.0 SKELETON
                    </span>
                </div>

                {/* HERO SECTION WIREFRAME */}
                <section className="rounded-xl border border-dashed border-navy-700 bg-navy-900/40 p-8 sm:p-12 space-y-6">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-navy-800 pb-3">
                        <span>[SECTION: HERO_BANNER]</span>
                        <span>[WIDTH: 100% • CONTAINER: MAX-7XL]</span>
                    </div>

                    <div className="max-w-3xl space-y-4">
                        <div className="inline-block px-3 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono text-xs">
                            [TAG: Official B2B E-Catalog Platform]
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            CV. Putra Nugraha — Company Profile & B2B E-Catalog
                        </h1>

                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-mono">
                            [SLOT: DESKRIPSI_HERO] — Tempat penempatan headline utama dan deskripsi nilai tawar pengadaan B2B, legalitas resmi, dan alur permohonan penawaran harga (RFQ) grosir.
                        </p>

                        <div className="pt-2 flex flex-wrap gap-3">
                            <Link
                                href="/katalog"
                                className="inline-flex items-center gap-2 rounded px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
                            >
                                <span>[BUTTON: Buka E-Catalog]</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/tentang-kami"
                                className="inline-flex items-center gap-2 rounded px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white text-xs font-semibold border border-navy-700 transition"
                            >
                                <span>[BUTTON: Profil Perusahaan]</span>
                            </Link>
                        </div>
                    </div>

                    {/* HERO METRICS WIREFRAME SLOT */}
                    <div className="pt-6 border-t border-navy-800/80">
                        <div className="text-[11px] font-mono text-slate-500 mb-3">[SLOT: STATS_SUMMARY_GRID (4 COLUMNS)]</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { title: 'Kemitraan Instansi', note: '[TBA: Angka Riil Klien]' },
                                { title: 'Komoditas Terdaftar', note: '[TBA: Jumlah SKU]' },
                                { title: 'Ketepatan Pengiriman', note: '[TBA: SLA Logistik %]' },
                                { title: 'Status Legalitas', note: '[NIB, NPWP, PKP Valid]' },
                            ].map((stat, i) => (
                                <div key={i} className="p-4 rounded border border-navy-800 bg-navy-950 text-left font-mono">
                                    <div className="text-[10px] text-slate-500">[STAT_CARD_0{i + 1}]</div>
                                    <div className="text-base font-bold text-white mt-1">{stat.note}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{stat.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* B2B WORKFLOW WIREFRAME */}
                <section className="rounded-xl border border-dashed border-navy-700 bg-navy-900/30 p-8 space-y-6">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-navy-800 pb-3">
                        <span>[SECTION: WORKFLOW_STEPPER]</span>
                        <span>[ALUR_PENGADAAN_B2B]</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded border border-navy-800 bg-navy-950 space-y-3 font-mono">
                            <div className="text-xs text-blue-400 font-bold">[STEP_01: RFQ_SUBMISSION]</div>
                            <h3 className="text-sm font-bold text-white font-sans">Katalog & Permintaan Nego</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                [Slot: Buyer meninjau produk, menentukan volume pesanan, lalu submit proposal penawaran harga grosir].
                            </p>
                        </div>

                        <div className="p-6 rounded border border-navy-800 bg-navy-950 space-y-3 font-mono">
                            <div className="text-xs text-indigo-400 font-bold">[STEP_02: NEGOTIATION_&_SPH]</div>
                            <h3 className="text-sm font-bold text-white font-sans">Kesepakatan & Administrasi</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                [Slot: Seller membalas dengan SPH resmi, counter-offer, atau menyetujui PO berbadan hukum].
                            </p>
                        </div>

                        <div className="p-6 rounded border border-navy-800 bg-navy-950 space-y-3 font-mono">
                            <div className="text-xs text-emerald-400 font-bold">[STEP_03: FULFILLMENT_&_BAST]</div>
                            <h3 className="text-sm font-bold text-white font-sans">Pengiriman & Dokumen BAST</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                [Slot: Pelacakan resi kurir logistik, serah terima barang, dan unduh faktur pajak/BAST].
                            </p>
                        </div>
                    </div>
                </section>

                {/* PORTAL ACCESS WIREFRAME BANNER */}
                <section className="rounded-xl border border-dashed border-navy-700 bg-navy-900/40 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono">
                    <div className="space-y-1">
                        <div className="text-[11px] text-blue-400 font-bold">[SLOT: QUICK_NAVIGATOR]</div>
                        <h3 className="text-base font-bold text-white font-sans">Akses Cepat Pengujian Portal Dashboard</h3>
                        <p className="text-xs text-slate-400 font-sans">Pilih zona dashboard untuk memeriksa wireframe fungsional internal:</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/buyer/dashboard"
                            className="px-4 py-2 rounded bg-navy-800 hover:bg-navy-750 text-white text-xs border border-navy-700"
                        >
                            → [Buka Dashboard Buyer]
                        </Link>
                        <Link
                            href="/seller/dashboard"
                            className="px-4 py-2 rounded bg-navy-800 hover:bg-navy-750 text-amber-300 text-xs border border-navy-700"
                        >
                            → [Buka Dashboard Seller]
                        </Link>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
