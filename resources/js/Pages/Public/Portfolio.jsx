import MainLayout from '@/Layouts/MainLayout';

export default function Portfolio() {
    return (
        <MainLayout title="Portofolio (Wireframe)">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
                <div className="border border-dashed border-navy-700 bg-navy-900/30 p-6 rounded-xl space-y-2 font-mono">
                    <div className="text-[11px] text-blue-400 font-bold">[REGION: PORTFOLIO_PROJECTS_HEADER]</div>
                    <h1 className="text-2xl font-bold text-white font-sans">Rekam Jejak Kontrak & Pengadaan</h1>
                    <p className="text-xs text-slate-400 font-sans">
                        [SLOT_INFO: Daftar proyek pengadaan instansi pemerintah dan swasta yang telah selesai 100% dengan BAST].
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="p-6 rounded-xl border border-dashed border-navy-700 bg-navy-900/40 space-y-3">
                            <div className="text-[10px] text-slate-500">[PROJECT_CARD_0{num}] • TAHUN: 202x</div>
                            <h3 className="text-sm font-bold text-white font-sans">[NAMA_INSTANSI_KLIEN_{num}]</h3>
                            <div className="p-3 rounded border border-navy-800 bg-navy-950 text-slate-400 font-sans text-xs">
                                [TBA: Uraian lingkup kontrak, volume barang pengadaan, dan status serah terima BAST].
                            </div>
                            <div className="text-[10px] text-emerald-400 font-bold">[STATUS: SELESAI 100% - BAST TERBIT]</div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
