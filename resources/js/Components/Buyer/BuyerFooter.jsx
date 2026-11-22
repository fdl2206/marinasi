import { Link } from '@inertiajs/react';
import { Phone, MapPin, ArrowRight } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function BuyerFooter() {
    return (
        <>
            <footer className="border-t border-[#12365c] bg-[#0a2540] dark:bg-[#071d33] text-slate-300 text-xs transition-colors duration-150 mt-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Col 1: Brand & Desc */}
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <ApplicationLogo variant="lockup-dark" />
                            </div>
                            <p className="text-xs text-slate-200 font-medium">
                                Perdagangan Barang dan Jasa
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Pengadaan perangkat IT dan layanan profesional untuk mendukung kebutuhan perusahaan Anda.
                            </p>
                        </div>

                        {/* Col 2: Panduan Pengadaan B2B */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Panduan Pengadaan B2B
                            </h4>
                            <ul className="space-y-2 text-xs">
                                {[
                                    { label: 'Cara Belanja & Pengajuan RFQ', href: '/buyer/help?category=rfq' },
                                    { label: 'Ketentuan Faktur Pajak', href: '/buyer/help?category=tax' },
                                    { label: 'Pembayaran & Pengiriman', href: '/buyer/help?category=payment' },
                                    { label: 'Garansi & Layanan Purnajual', href: '/buyer/help?category=warranty' },
                                ].map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3: Layanan Pelanggan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Layanan Pelanggan
                            </h4>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#f59e0b] shrink-0" />
                                <span className="text-sm font-bold text-white">
                                    (+62) 813-2077-7874
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Hubungi tim kami untuk konsultasi produk, penawaran, dan status pengadaan.
                            </p>
                            <div>
                                <a
                                    href="https://wa.me/6281320777874"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-amber-300 transition-colors"
                                >
                                    <span>Konsultasikan kebutuhan Anda</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Col 4: Alamat Kantor */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Alamat Kantor
                            </h4>
                            <div className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 text-[#f59e0b] shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Jl. Cinangka Kavling 2, RT 03, RW 05 Kel. Pasir Wangi Kec. Ujung Berung
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Melayani kebutuhan barang dan jasa IT perusahaan.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar / Copyright */}
                <div className="border-t border-[#12365c]/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                        <p>© 2026 CV. Putra Nugraha. All Right Reserved.</p>
                        <p className="hidden sm:block">Perdagangan Barang dan Jasa</p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Action Button */}
            <a
                href="https://wa.me/6281320777874"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Konsultasi WhatsApp"
                className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 group"
            >
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.977.575 3.824 1.572 5.385L2.094 22l4.757-1.442a9.97 9.97 0 0 0 5.18 1.473h.005c5.535 0 10.03-4.495 10.03-10.03A10.02 10.02 0 0 0 12.031 2zm0 18.23a8.17 8.17 0 0 1-4.26-1.19l-.305-.18-3.167.96.974-3.088-.198-.315a8.18 8.18 0 0 1-1.258-4.386c0-4.542 3.696-8.238 8.243-8.238a8.2 8.2 0 0 1 5.825 2.415 8.2 8.2 0 0 1 2.41 5.828c0 4.543-3.696 8.239-8.262 8.239zm4.52-6.177c-.248-.124-1.467-.724-1.695-.807-.228-.083-.393-.124-.559.124-.165.248-.641.807-.786.973-.145.165-.29.186-.538.062-.248-.124-1.047-.386-1.995-1.232-.738-.658-1.237-1.472-1.382-1.72-.145-.248-.016-.382.108-.506.112-.112.248-.29.373-.435.124-.145.166-.248.248-.414.083-.166.042-.311-.02-.435-.063-.124-.559-1.348-.766-1.846-.202-.486-.407-.42-.559-.428l-.477-.008c-.166 0-.435.062-.663.311-.228.248-.87 0.85-.87 2.073 0 1.223.89 2.405 1.015 2.571.124.166 1.752 2.674 4.243 3.75.593.256 1.056.409 1.417.524.596.189 1.138.162 1.567.098.479-.071 1.467-.6 1.674-1.18.207-.58.207-1.077.145-1.18-.062-.104-.228-.166-.476-.29z" />
                </svg>
            </a>
        </>
    );
}
