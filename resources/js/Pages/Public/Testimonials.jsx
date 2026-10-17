import MainLayout from '@/Layouts/MainLayout';

export default function Testimonials() {
    return (
        <MainLayout title="Testimoni (Wireframe)">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
                <div className="border border-dashed border-navy-700 bg-navy-900/30 p-6 rounded-xl space-y-2 font-mono">
                    <div className="text-[11px] text-blue-400 font-bold">[REGION: TESTIMONIALS_FEEDBACK]</div>
                    <h1 className="text-2xl font-bold text-white font-sans">Ulasan & Feedback Klien</h1>
                    <p className="text-xs text-slate-400 font-sans">
                        [SLOT_INFO: Kutipan testimoni resmi dari Pejabat Pembuat Komitmen (PPK) atau Manager Pengadaan mitra].
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="p-6 rounded-xl border border-navy-800 bg-navy-900/40 space-y-4">
                            <div className="text-[10px] text-amber-400 font-bold">[RATING_SLOT: ★★★★★]</div>
                            <p className="p-3 rounded border border-navy-800 bg-navy-950 text-slate-300 font-sans text-xs italic leading-relaxed">
                                "[TBA: Kutipan ulasan terkait ketepatan spesifikasi barang, transparansi dokumen administrasi tender, dan ketepatan jadwal kirim CV. Putra Nugraha]."
                            </p>
                            <div className="pt-2 border-t border-navy-850">
                                <div className="font-bold text-white font-sans">[NAMA_PEJABAT_PENGADAAN_{num}]</div>
                                <div className="text-[10px] text-slate-500">[JABATAN & NAMA INSTANSI]</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
