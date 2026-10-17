import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Box, Send, FileText } from 'lucide-react';
import { useState } from 'react';

export default function CatalogShow({ id }) {
    const [quantity, setQuantity] = useState(10);
    const [notes, setNotes] = useState('');

    return (
        <MainLayout title="Detail Produk & RFQ (Wireframe)">
            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
                <Link
                    href="/katalog"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>[KEMBALI KE KATALOG]</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Product Spec Wireframe */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="h-72 w-full rounded-xl border border-dashed border-navy-700 bg-navy-900/40 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                            <Box className="h-10 w-10 mb-2 text-slate-600" />
                            <span>[SLOT: PRODUCT_IMAGE_GALLERY_PREVIEW]</span>
                        </div>

                        <div className="border border-navy-800 bg-navy-900/60 p-6 rounded-xl space-y-3 font-mono">
                            <div className="text-[10px] text-blue-400 font-bold">[CATEGORY: KOMODITAS_PENGADAAN] • SKU: PN-ITEM-{id || '001'}</div>
                            <h1 className="text-2xl font-bold text-white font-sans">
                                [NAMA_PRODUK]: Spesifikasi Komoditas Pengadaan Resmi
                            </h1>
                            <p className="text-xs text-slate-400 font-sans leading-relaxed">
                                [SLOT_DESKRIPSI: Uraian spesifikasi teknis barang, garansi resmi distributor, sertifikasi TKDN (Tingkat Komponen Dalam Negeri), dan kelengkapan dokumen pendukung].
                            </p>
                        </div>

                        {/* Specs Table Slot */}
                        <div className="border border-dashed border-navy-700 rounded-xl p-6 bg-navy-900/30 space-y-3 font-mono text-xs">
                            <div className="text-[11px] text-slate-400 font-bold pb-2 border-b border-navy-800">
                                [TABEL: SPESIFIKASI_TEKNIS]
                            </div>
                            <div className="space-y-2 text-[11px]">
                                {[
                                    { label: 'Merk / Pabrikan', val: '[TBA Sesuai Data Produk]' },
                                    { label: 'Standar Mutu', val: '[SNI / ISO / TKDN Terverifikasi]' },
                                    { label: 'Waktu Indent / Delivery', val: '[Ready Stock / Indent x Hari Kerja]' },
                                    { label: 'Lokasi Pengiriman Asal', val: '[Gudang Utama CV. Putra Nugraha]' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between py-1.5 border-b border-navy-850">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: RFQ Form Wireframe */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 rounded-xl border border-dashed border-navy-700 bg-navy-900/70 p-6 space-y-5 font-mono text-xs">
                            <div className="border-b border-navy-800 pb-3">
                                <div className="text-[10px] text-blue-400 font-bold">[PANEL: NEGOTIATION_RFQ_BOX]</div>
                                <div className="text-xl font-bold text-white font-sans mt-1">Rp xx.xxx.xxx <span className="text-xs text-slate-400 font-normal">/ unit acuan</span></div>
                            </div>

                            <div className="space-y-4 font-sans">
                                <div>
                                    <label className="text-xs text-slate-300 block mb-1 font-mono">[INPUT_QTY: Jumlah Unit Kebutuhan]</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full rounded bg-navy-950 border border-navy-800 px-3 py-2 text-white text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-300 block mb-1 font-mono">[INPUT_NOTES: Catatan Pengadaan / Lokasi Proyek]</label>
                                    <textarea
                                        rows="3"
                                        placeholder="[Placeholder: Masukkan rincian kebutuhan khusus atau alamat pengiriman...]"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full rounded bg-navy-950 border border-navy-800 px-3 py-2 text-white text-xs placeholder-slate-600"
                                    />
                                </div>

                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>[SUBMIT: Ajukan Permohonan Nego (RFQ)]</span>
                                </Link>

                                <div className="p-3 rounded bg-navy-950 border border-navy-800 text-[11px] text-slate-400 font-mono">
                                    [INFO: Pengajuan penawaran akan langsung masuk ke antrean negosiasi di dashboard Seller CV. Putra Nugraha].
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
