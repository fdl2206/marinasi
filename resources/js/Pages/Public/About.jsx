import MainLayout from '@/Layouts/MainLayout';
import { Building2, ShieldCheck, Target, Award } from 'lucide-react';

export default function About() {
    return (
        <MainLayout title="Tentang Kami (Wireframe)">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
                {/* Header Wireframe */}
                <div className="border border-dashed border-navy-700 bg-navy-900/30 p-8 rounded-xl space-y-2 font-mono">
                    <div className="text-[11px] text-blue-400 font-bold">[SECTION: COMPANY_PROFILE_HEADER]</div>
                    <h1 className="text-3xl font-extrabold text-white font-sans">Profil Perusahaan & Legalitas</h1>
                    <p className="text-xs text-slate-400 font-sans">
                        [SLOT_DESKRIPSI: Sejarah pendirian CV. Putra Nugraha, fokus bidang usaha pengadaan barang dan jasa, serta komitmen standar pelayanan].
                    </p>
                </div>

                {/* Visi & Misi Wireframe Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                    <div className="p-6 rounded-xl border border-navy-800 bg-navy-900/50 space-y-3">
                        <div className="text-blue-400 font-bold">[BLOCK_VISI]</div>
                        <h2 className="text-base font-bold text-white font-sans">Visi CV. Putra Nugraha</h2>
                        <div className="p-4 rounded border border-navy-800 bg-navy-950 text-slate-400 leading-relaxed font-sans">
                            [TBA: Uraian visi jangka panjang perusahaan dalam rantai pasok B2B dan pengadaan pemerintah].
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border border-navy-800 bg-navy-900/50 space-y-3">
                        <div className="text-indigo-400 font-bold">[BLOCK_MISI]</div>
                        <h2 className="text-base font-bold text-white font-sans">Misi CV. Putra Nugraha</h2>
                        <div className="p-4 rounded border border-navy-800 bg-navy-950 text-slate-400 leading-relaxed space-y-1.5 font-sans">
                            <div>• [TBA: Misi 1 - Kualitas produk & jaminan garansi resmi]</div>
                            <div>• [TBA: Misi 2 - Kepatuhan administrasi, tender, dan perpajakan]</div>
                            <div>• [TBA: Misi 3 - Kecepatan dan kepastian logistik rantai pasok]</div>
                        </div>
                    </div>
                </div>

                {/* Legalitas Wireframe Table */}
                <div className="border border-dashed border-navy-700 bg-navy-900/30 p-6 rounded-xl space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center pb-3 border-b border-navy-800">
                        <span className="text-blue-400 font-bold">[SECTION: LEGALITAS_USAHA_&_KBLI]</span>
                        <span className="text-slate-500">[STATUS: VERIFIED_DOCS]</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Bentuk Badan Usaha', val: '[CV - Persekutuan Komanditer]' },
                            { label: 'Nomor Induk Berusaha (NIB)', val: '[TBA: No. NIB Terdaftar]' },
                            { label: 'NPWP Perusahaan', val: '[TBA: NPWP & Status PKP]' },
                            { label: 'Sertifikasi / Bidang Usaha', val: '[TBA: Klasifikasi Baku KBLI]' },
                        ].map((d, i) => (
                            <div key={i} className="p-3.5 rounded border border-navy-800 bg-navy-950">
                                <div className="text-[10px] text-slate-500">{d.label}</div>
                                <div className="text-xs font-bold text-white mt-1">{d.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
