import MainLayout from '@/Layouts/MainLayout';

export default function PrivacyPolicy() {
    return (
        <MainLayout title="Kebijakan Privasi (Wireframe)">
            <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
                <div className="border border-dashed border-navy-700 bg-navy-900/30 p-6 rounded-xl space-y-2 font-mono">
                    <div className="text-[11px] text-blue-400 font-bold">[REGION: PRIVACY_POLICY_CONTAINER]</div>
                    <h1 className="text-2xl font-bold text-white font-sans">Kebijakan Privasi & Ketentuan B2B</h1>
                    <p className="text-xs text-slate-400 font-sans">[TBA: Draft regulasi perlindungan data dan kerahasiaan penawaran harga]</p>
                </div>

                <div className="border border-navy-800 bg-navy-900/50 p-6 rounded-xl space-y-5 font-mono text-xs">
                    <div className="space-y-2">
                        <div className="text-white font-bold">[PASAL_01: KERAHASIAAN_HARGA_RFQ]</div>
                        <p className="text-slate-400 font-sans leading-relaxed text-xs">
                            [TBA: Ketentuan bahwa seluruh quotation harga khusus kuantitas grosir bersifat rahasia antara pembeli dan CV. Putra Nugraha].
                        </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-navy-800">
                        <div className="text-white font-bold">[PASAL_02: VERIFIKASI_LEGALITAS_BADAN_USAHA]</div>
                        <p className="text-slate-400 font-sans leading-relaxed text-xs">
                            [TBA: Ketentuan pengumpulan NPWP dan NIB untuk kebutuhan penerbitan faktur pajak resmi].
                        </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-navy-800">
                        <div className="text-white font-bold">[PASAL_03: KEABSAHAN_DOKUMEN_DIGITAL]</div>
                        <p className="text-slate-400 font-sans leading-relaxed text-xs">
                            [TBA: Pengakuan legalitas PO, Invoice, dan BAST yang dihasilkan oleh sistem digital ini].
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
