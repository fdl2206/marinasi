import MainLayout from '@/Layouts/MainLayout';
import { Send } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
    const [sent, setSent] = useState(false);

    return (
        <MainLayout title="Kontak Perusahaan (Wireframe)">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
                <div className="border border-dashed border-navy-700 bg-navy-900/30 p-6 rounded-xl space-y-2 font-mono">
                    <div className="text-[11px] text-blue-400 font-bold">[REGION: CONTACT_HEADER]</div>
                    <h1 className="text-2xl font-bold text-white font-sans">Layanan Kontak & Konsultasi Pengadaan</h1>
                    <p className="text-xs text-slate-400 font-sans">
                        [SLOT_INFO: Jalur komunikasi resmi perwakilan sales, survei volume barang, dan proposal tender].
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono text-xs">
                    {/* Left: Office details slot */}
                    <div className="lg:col-span-5 p-6 rounded-xl border border-navy-800 bg-navy-900/50 space-y-4">
                        <div className="text-blue-400 font-bold pb-2 border-b border-navy-800">[SLOT: INFO_KANTOR_&_LOGISTIK]</div>
                        <div className="space-y-3 font-sans">
                            <div>
                                <span className="text-[10px] text-slate-500 font-mono block">[ALAMAT_KANTOR]</span>
                                <span className="text-white text-xs">[TBA: Jl. Industri No. xx, Kawasan Pergudangan, Kota, Provinsi]</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-mono block">[TELEPON_WA_RESMI]</span>
                                <span className="text-white text-xs">[TBA: (021) xxxxxxxx / +62 812-xxxx-xxxx]</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-mono block">[EMAIL_PENGADAAN]</span>
                                <span className="text-white text-xs">[TBA: procurement@putranugraha.co.id]</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-mono block">[JAM_OPERASIONAL]</span>
                                <span className="text-white text-xs">Senin - Jumat: 08:30 - 17:00 WIB</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form slot */}
                    <div className="lg:col-span-7 p-6 rounded-xl border border-dashed border-navy-700 bg-navy-900/30 space-y-4 font-sans">
                        <div className="text-[11px] font-mono text-slate-400 font-bold pb-2 border-b border-navy-800">
                            [FORM_SLOT: INQUIRY_RFQ_FORM]
                        </div>

                        {sent ? (
                            <div className="p-6 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono text-xs text-center">
                                [SIMULASI: Formulir terkirim ke sistem internal CV. Putra Nugraha]
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setSent(true);
                                }}
                                className="space-y-4 text-xs"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-mono">[INPUT_NAMA]</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nama Penanggung Jawab"
                                            className="w-full rounded bg-navy-950 border border-navy-800 px-3 py-2 text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-mono">[INPUT_INSTANSI]</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nama Perusahaan / Dinas"
                                            className="w-full rounded bg-navy-950 border border-navy-800 px-3 py-2 text-white text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-mono">[INPUT_EMAIL]</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="email@instansi.com"
                                            className="w-full rounded bg-navy-950 border border-navy-800 px-3 py-2 text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-mono">[INPUT_TELP]</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="0812xxxxxxxx"
                                            className="w-full rounded bg-navy-950 border border-navy-800 px-3 py-2 text-white text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1 font-mono">[INPUT_RINCIAN_KEBUTUHAN]</label>
                                    <textarea
                                        rows="3"
                                        required
                                        placeholder="Uraian barang atau volume yang dibutuhkan..."
                                        className="w-full rounded bg-navy-950 border border-navy-800 px-3 py-2 text-white text-xs"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
                                >
                                    [SUBMIT_BUTTON: Kirimkan Inquiry]
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
