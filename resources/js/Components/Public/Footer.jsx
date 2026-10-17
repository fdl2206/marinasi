import { Link } from '@inertiajs/react';
import { Box, Code } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full border-t border-navy-800 bg-navy-950 text-slate-400 font-sans text-xs">
            {/* Wireframe Header Marker */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="border border-dashed border-navy-700 rounded-lg p-6 bg-navy-900/30">
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-navy-800 text-[11px] font-mono text-slate-500">
                        <span>[REGION: FOOTER_CONTAINER]</span>
                        <span>[LAYOUT: 4_COLUMNS_GRID]</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Column 1 */}
                        <div className="space-y-3">
                            <div className="font-mono text-xs text-blue-400 font-bold">[COL_1: BRAND_LEGAL]</div>
                            <div className="p-3 border border-navy-800 rounded bg-navy-950 space-y-2">
                                <div className="font-semibold text-white">CV. Putra Nugraha</div>
                                <p className="text-slate-400 leading-relaxed text-[11px]">
                                    [TBA: Ringkasan profil perusahaan, izin usaha NIB/SIUP, dan domisili kantor operasional]
                                </p>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-3">
                            <div className="font-mono text-xs text-blue-400 font-bold">[COL_2: QUICK_LINKS]</div>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="/" className="hover:text-white">• Beranda</Link></li>
                                <li><Link href="/tentang-kami" className="hover:text-white">• Tentang Perusahaan</Link></li>
                                <li><Link href="/katalog" className="hover:text-white">• Katalog Produk & Layanan</Link></li>
                                <li><Link href="/portofolio" className="hover:text-white">• Portofolio</Link></li>
                                <li><Link href="/testimoni" className="hover:text-white">• Testimoni</Link></li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-3">
                            <div className="font-mono text-xs text-blue-400 font-bold">[COL_3: B2B_PORTAL]</div>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="/buyer/dashboard" className="hover:text-white">• Buyer Dashboard (RFQ & Orders)</Link></li>
                                <li><Link href="/seller/dashboard" className="hover:text-white">• Seller Dashboard (Catalog & Stock)</Link></li>
                                <li><Link href="/kebijakan-privasi" className="hover:text-white">• Kebijakan Privasi & Legalitas</Link></li>
                            </ul>
                        </div>

                        {/* Column 4 */}
                        <div className="space-y-3">
                            <div className="font-mono text-xs text-blue-400 font-bold">[COL_4: CONTACT_INFO]</div>
                            <div className="p-3 border border-navy-800 rounded bg-navy-950 space-y-1.5 text-[11px]">
                                <div>[ALAMAT: TBA Sesuai Dokumen Perusahaan]</div>
                                <div>[TELP: (021) xxxxxxxx]</div>
                                <div>[EMAIL: info@putranugraha.co.id]</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
                        <div>© {new Date().getFullYear()} CV. Putra Nugraha — Wireframe Baseline</div>
                        <div className="flex gap-4 mt-2 sm:mt-0">
                            <span>[STATUS: READY_FOR_MOCKUP_REPLACEMENT]</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
