import { useState, useMemo, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Search, 
    FileText, 
    Receipt, 
    CreditCard, 
    Truck, 
    Wrench, 
    ChevronDown, 
    ChevronUp, 
    MessageSquare, 
    Phone,
    ArrowRight,
    HelpCircle
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';

/**
 * Daftar kategori topik bantuan & FAQ lengkap
 * Berdasarkan desain Pusat Bantuan CV. Putra Nugraha (media_1795279333116_775954c1.jpg)
 */
const FAQ_CATEGORIES = [
    {
        id: 'rfq',
        label: 'Panduan RFQ & SPH',
        title: '1. Panduan RFQ & Surat Penawaran Harga (SPH)',
        description: 'Informasi alur pengajuan RFQ, masa berlaku SPH, dan ketentuan negosiasi harga proyek B2B.',
        icon: FileText,
        faqs: [
            {
                id: 'rfq-1',
                question: 'Bagaimana cara meminta penawaran harga (RFQ) untuk proyek pengadaan?',
                answer: 'Anda bisa menekan tombol "Ajukan RFQ" di pojok kanan atas halaman. Isi formulir rincian barang/jasa yang dibutuhkan atau unggah langsung file Rencana Anggaran Biaya (RAB) / Kerangka Acuan Kerja (KAK) perusahaan Anda. Tim admin kami akan merespons dengan mengunggah Surat Penawaran Harga (SPH) berstempel resmi ke dashboard Anda maksimal dalam 1x24 jam kerja.',
            },
            {
                id: 'rfq-2',
                question: 'Berapa lama masa berlaku SPH yang diterbitkan CV. Putra Nugraha?',
                answer: 'Secara default, harga dan ketersediaan stok pada dokumen SPH berlaku selama 14 hari kalender sejak tanggal diterbitkan, kecuali ada kesepakatan khusus yang tertera pada dokumen penawaran tersebut.',
            },
            {
                id: 'rfq-3',
                question: 'Apakah harga di katalog masih bisa dinegosiasi untuk pembelian jumlah besar?',
                answer: 'Tentu. Harga di etalase adalah harga eceran retail. Untuk pembelian grosir B2B atau kebutuhan proyek, silakan gunakan alur pengajuan RFQ. Admin kami akan mengalkulasi dan memberikan harga khusus (diskon proyek) melalui SPH.',
            },
        ],
    },
    {
        id: 'tax',
        label: 'Pajak & e-Faktur PPN 11%',
        title: '2. Pajak (e-Faktur PPN 11%) & Legalitas',
        description: 'Ketentuan Pengusaha Kena Pajak (PKP), unduh e-Faktur resmi, dan validasi data NPWP 16 digit.',
        icon: Receipt,
        faqs: [
            {
                id: 'tax-1',
                question: 'Apakah CV. Putra Nugraha menerbitkan Faktur Pajak (PPN 11%)?',
                answer: 'Ya, kami adalah Pengusaha Kena Pajak (PKP) resmi. Setiap transaksi pengadaan B2B akan otomatis disertai dengan e-Faktur PPN 11%.',
            },
            {
                id: 'tax-2',
                question: 'Di mana saya bisa mengunduh file e-Faktur dan Invoice?',
                answer: 'Setelah pesanan diproses atau selesai, staf keuangan Anda dapat mengunduh dokumen Invoice (PDF) dan e-Faktur Pajak (PDF) langsung melalui menu "Dokumen & Faktur Pajak" di Dashboard Klien.',
            },
            {
                id: 'tax-3',
                question: 'Dokumen apa saja yang diperlukan agar e-Faktur perusahaan saya valid?',
                answer: 'Anda hanya perlu memastikan Nomor NPWP (16 Digit) dan alamat perusahaan sudah terisi dengan benar di menu "Profil Perusahaan". Admin kami akan memverifikasi data tersebut sebelum menerbitkan faktur ke sistem DJP.',
            },
        ],
    },
    {
        id: 'payment',
        label: 'Metode Pembayaran & Termin PO',
        title: '3. Metode Pembayaran & Termin PO',
        description: 'Fasilitas pembayaran tempo (Termin Net 30) dan prosedur konfirmasi pesanan dengan dokumen PO.',
        icon: CreditCard,
        faqs: [
            {
                id: 'pay-1',
                question: 'Apakah CV. Putra Nugraha melayani sistem pembayaran tempo (Termin PO)?',
                answer: 'Ya, kami menyediakan fasilitas pembayaran Termin 14 Hari hingga 30 Hari (Net 30) khusus bagi klien instansi atau korporat yang telah bermitra dan terverifikasi.',
            },
            {
                id: 'pay-2',
                question: 'Bagaimana cara mengonfirmasi pesanan menggunakan Purchase Order (PO)?',
                answer: 'Setelah Anda menyetujui nominal di dalam SPH, Anda dapat menekan tombol "Lanjut ke Checkout" di dashboard dan memilih metode bayar Termin. Sistem akan meminta Anda untuk mengunggah file PDF Dokumen PO yang sudah ditandatangani oleh manajemen Anda. Pesanan akan segera diproses setelah PO diverifikasi admin.',
            },
        ],
    },
    {
        id: 'shipping',
        label: 'Pengiriman & Instalasi Teknisi',
        title: '4. Pengiriman & Jadwal Instalasi Teknisi',
        description: 'Ketentuan ongkos kirim, integrasi jasa instalasi, dan pemantauan kedatangan teknisi on-site.',
        icon: Truck,
        faqs: [
            {
                id: 'ship-1',
                question: 'Apakah harga barang sudah termasuk biaya pengiriman dan jasa instalasi?',
                answer: 'Harga unit hardware umumnya belum termasuk jasa instalasi khusus, kecuali Anda memilih item kategori "Paket Jasa". Jika Anda membutuhkan setup server, penarikan kabel LAN, atau pemasangan CCTV, sebutkan kebutuhan tersebut saat mengajukan RFQ agar admin dapat memasukkannya ke dalam satu pagu anggaran SPH.',
            },
            {
                id: 'ship-2',
                question: 'Bagaimana cara mengetahui kapan teknisi akan datang ke kantor?',
                answer: 'Buka menu "Jadwal Instalasi & Tiket Servis" di Dashboard Klien. Anda bisa memantau secara real-time apakah status teknisi sedang dipersiapkan, dalam perjalanan, atau sedang melangsungkan proses instalasi di lokasi Anda. Dokumen Berita Acara Serah Terima (BAST) akan diterbitkan setelah pengerjaan selesai.',
            },
        ],
    },
    {
        id: 'warranty',
        label: 'Garansi & Layanan Purnajual',
        title: '5. Garansi & Klaim Layanan Purnajual',
        description: 'Prosedur klaim garansi hardware, kunjungan teknisi on-site, dan dukungan retur ke distributor resmi.',
        icon: Wrench,
        faqs: [
            {
                id: 'war-1',
                question: 'Bagaimana prosedur klaim garansi jika hardware bermasalah?',
                answer: 'Siapkan Nomor Invoice transaksi Anda dan hubungi tim layanan pelanggan kami melalui WhatsApp di 0813-2077-7874. Berdasarkan jenis kerusakan dan cakupan garansi, kami akan mengirimkan teknisi untuk pengecekan lokasi (on-site support) atau membantu Anda memproses retur unit ke pusat servis distributor resmi (seperti HP, Dell, Asus, Lenovo, dsb).',
            },
        ],
    },
];

export default function BuyerHelpIndex() {
    // Ambil initial category dari URL parameter jika ada (misal: ?category=tax)
    const [activeCategoryId, setActiveCategoryId] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const cat = params.get('category');
            if (cat && FAQ_CATEGORIES.some((c) => c.id === cat)) {
                return cat;
            }
        }
        return 'rfq';
    });

    // Search query state
    const [searchQuery, setSearchQuery] = useState('');

    // State accordion yang terbuka (default item pertama pada kategori aktif)
    const [expandedFaqId, setExpandedFaqId] = useState('rfq-1');

    // Kategori terpilih saat ini
    const activeCategory = useMemo(() => {
        return FAQ_CATEGORIES.find((c) => c.id === activeCategoryId) || FAQ_CATEGORIES[0];
    }, [activeCategoryId]);

    // Filter FAQs berdasarkan pencarian (jika ada input search, cari di seluruh kategori)
    const displayFaqs = useMemo(() => {
        if (!searchQuery.trim()) {
            return activeCategory.faqs;
        }

        const query = searchQuery.toLowerCase();
        const results = [];
        FAQ_CATEGORIES.forEach((cat) => {
            cat.faqs.forEach((faq) => {
                if (
                    faq.question.toLowerCase().includes(query) ||
                    faq.answer.toLowerCase().includes(query)
                ) {
                    results.push({ ...faq, categoryLabel: cat.label });
                }
            });
        });
        return results;
    }, [searchQuery, activeCategory]);

    const toggleFaq = (id) => {
        setExpandedFaqId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Pusat Bantuan & Panduan Pengadaan B2B — CV. Putra Nugraha" />

            {/* Navbar Header */}
            <BuyerNavbar />

            {/* ========================================================= */}
            {/* HERO BANNER: Solid Deep Ocean Teal Sesuai Mockup         */}
            {/* ========================================================= */}
            <section
                className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-white text-center shadow-inner"
                style={{
                    backgroundColor: '#086f8e',
                    backgroundImage: 'radial-gradient(circle at 50% 20%, #0d82a6 0%, #086f8e 65%, #055067 100%)',
                }}
            >
                <div className="max-w-3xl mx-auto space-y-3">
                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                        Halo, ada yang bisa kami bantu?
                    </h1>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl mx-auto">
                        Temukan panduan pengadaan B2B, syarat faktur pajak, dan informasi garansi teknisi.
                    </p>

                    {/* Search Bar Input */}
                    <div className="pt-4 max-w-xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ketik pertanyaan Anda di sini... (Misal: Cara bayar dengan PO)"
                                className="w-full h-12 pl-5 pr-12 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] transition"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA: 2 COLUMNS (TOPICS & FAQ ACCORDIONS)    */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ===================================================== */}
                    {/* LEFT COLUMN: Kategori Topik (3 or 4 Cols)             */}
                    {/* ===================================================== */}
                    <aside className="lg:col-span-4 space-y-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-4 sm:p-5 shadow-xs space-y-2">
                            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-2 pb-1">
                                Kategori Topik
                            </h2>

                            <nav className="space-y-1">
                                {FAQ_CATEGORIES.map((category) => {
                                    const IconComponent = category.icon;
                                    const isActive = activeCategoryId === category.id && !searchQuery.trim();
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveCategoryId(category.id);
                                                setSearchQuery('');
                                                // Buka item pertama kategori tersebut
                                                if (category.faqs.length > 0) {
                                                    setExpandedFaqId(category.faqs[0].id);
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer ${
                                                isActive
                                                    ? 'bg-sky-50 dark:bg-sky-950/40 text-[#086f8e] dark:text-[#38bdf8] border border-sky-100 dark:border-sky-900/60 shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                            }`}
                                        >
                                            <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#086f8e] dark:text-[#38bdf8]' : 'text-slate-400'}`} />
                                            <span className="truncate">{category.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* ===================================================== */}
                    {/* RIGHT COLUMN: FAQ ACCORDION LIST (8 Cols)             */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Section Header */}
                        <div>
                            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {searchQuery.trim()
                                    ? `Hasil Pencarian: "${searchQuery}"`
                                    : activeCategory.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {searchQuery.trim()
                                    ? `Ditemukan ${displayFaqs.length} pertanyaan terkait.`
                                    : activeCategory.description}
                            </p>
                        </div>

                        {/* Accordion FAQ Cards */}
                        <div className="space-y-3.5">
                            {displayFaqs.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-8 text-center space-y-2">
                                    <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Tidak ada pertanyaan yang sesuai
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Coba gunakan kata kunci lain atau langsung tanyakan ke layanan pelanggan kami via WhatsApp.
                                    </p>
                                </div>
                            ) : (
                                displayFaqs.map((faq) => {
                                    const isOpen = expandedFaqId === faq.id;
                                    return (
                                        <div
                                            key={faq.id}
                                            className={`rounded-2xl bg-white dark:bg-[#171B26] shadow-xs transition-all overflow-hidden ${
                                                isOpen
                                                    ? 'border-2 border-[#086f8e] dark:border-[#086f8e]'
                                                    : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                        >
                                            {/* Accordion Header / Trigger Button */}
                                            <button
                                                type="button"
                                                onClick={() => toggleFaq(faq.id)}
                                                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                                            >
                                                <div className="space-y-0.5">
                                                    {faq.categoryLabel && (
                                                        <div className="text-[10px] font-bold text-[#086f8e] dark:text-[#38bdf8] uppercase tracking-wider">
                                                            {faq.categoryLabel}
                                                        </div>
                                                    )}
                                                    <span className={`text-xs sm:text-sm ${isOpen ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                                                        {faq.question}
                                                    </span>
                                                </div>

                                                <div className="shrink-0">
                                                    {isOpen ? (
                                                        <ChevronUp className="h-4 w-4 text-[#086f8e] dark:text-[#38bdf8]" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Accordion Body / Content */}
                                            {isOpen && (
                                                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                                                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>

                </div>

                {/* ========================================================= */}
                {/* BOTTOM CALL TO ACTION: Dark Navy Box Sesuai Mockup        */}
                {/* ========================================================= */}
                <div className="rounded-2xl bg-[#0a2540] dark:bg-[#071d33] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-[#12365c]">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                            Masih belum menemukan jawaban?
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                            Tim layanan pelanggan dan teknisi kami siap membantu kebutuhan pengadaan dan kendala teknis Anda.
                        </p>
                    </div>

                    <a
                        href="https://wa.me/6281320777874?text=Halo%20Admin%20CV%20Putra%20Nugraha,%20saya%20ingin%20berkonsultasi%20seputar%20pengadaan%20B2B"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
                    >
                        <MessageSquare className="h-4 w-4 fill-slate-950 text-slate-950" />
                        <span>Chat WhatsApp Bantuan (0813-2077-7874)</span>
                    </a>
                </div>

            </main>

            {/* Footer */}
            <BuyerFooter />

        </div>
    );
}
