import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { 
    ArrowRight, 
    Server, 
    Network, 
    Wrench, 
    HardDrive,
    ArrowUpRight,
    Award,
    FileCheck,
    Clock,
    Building2,
    ShieldCheck
} from 'lucide-react';

export default function Home() {
    const services = [
        {
            title: 'HARDWARE SUPPLIER',
            tag: 'PENGADAAN PERANGKAT',
            description: 'Komputer workstation, laptop enterprise, server rack, & monitor berspesifikasi tinggi dengan garansi resmi distributor.',
            icon: Server,
            href: '/katalog',
        },
        {
            title: 'JARINGAN & NETWORKING',
            tag: 'INFRASTRUKTUR SISTEM',
            description: 'Instalasi jaringan LAN/Fiber Optic terstruktur, switch managed, router Mikrotik/Cisco, & access point korporat.',
            icon: Network,
            href: '/katalog',
        },
        {
            title: 'SERVIS & PERBAIKAN',
            tag: 'DUKUNGAN TEKNIS & SLA',
            description: 'Layanan servis darurat, perbaikan unit, kontrak pemeliharaan berkala (maintenance), & penggantian sparepart cepat.',
            icon: Wrench,
            href: '#kontak',
        },
        {
            title: 'AKSESORIS & SUKU CADANG',
            tag: 'SUPPLIER & PERIFERAL',
            description: 'Penyediaan suku cadang original, uninterruptible power supply (UPS), printer multifungsi, scanner, & aksesoris IT.',
            icon: HardDrive,
            href: '/katalog',
        },
    ];

    const whyChooseUs = [
        {
            title: 'Rekam Jejak & Berpengalaman',
            tag: 'KREDIBILITAS BISNIS',
            description: 'Dipercaya oleh berbagai instansi dan perusahaan swasta dalam menangani pengadaan hardware dan instalasi jaringan skala menengah hingga enterprise.',
            icon: Award,
        },
        {
            title: 'Legalitas Usaha Resmi (CV)',
            tag: 'KEMUDAHAN ADMINISTRASI',
            description: 'Badan usaha berbadan hukum lengkap dengan NIB, NPWP, dan PKP aktif. Siap menerbitkan Faktur Pajak resmi, SPK, dan dokumen Berita Acara Serah Terima (BAST).',
            icon: FileCheck,
        },
        {
            title: 'Garansi & Jaminan Purna Jual',
            tag: 'KOMITMEN LAYANAN',
            description: 'Semua unit pengadaan didukung garansi resmi dan tim teknisi berpengalaman untuk memberikan penanganan cepat saat terjadi kendala operasional.',
            icon: Clock,
        },
    ];

    return (
        <MainLayout title="Solusi IT, Jaringan & Supplier Terpercaya">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 bg-slate-50 dark:bg-[#0C0D12] transition-colors duration-150">
                {/* Subtle Ambient Glow */}
                <div 
                    aria-hidden="true" 
                    className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" 
                />

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        
                        {/* LEFT: Clean, Bold, Authoritative Headline */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            <h1 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 dark:text-white tracking-[-0.01em] leading-[1.18] uppercase">
                                Solusi IT, Jaringan &amp;<br className="hidden sm:inline" />
                                Supplier Terpercaya<br className="hidden sm:inline" />
                                Untuk Bisnis Anda
                            </h1>

                            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                                Mitra Utama untuk Kebutuhan Hardware, Jaringan (Networking), Layanan Servis &amp; Perbaikan, serta Supplier Aksesoris IT Terlengkap dan Profesional.
                            </p>

                            <div className="pt-2 flex flex-wrap items-center gap-4">
                                <a
                                    href="#kontak"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector('#kontak')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 active:scale-95"
                                >
                                    <span>Konsultasi Pengadaan</span>
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                <a
                                    href="#layanan"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector('#layanan')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white text-sm font-medium transition-colors shadow-sm"
                                >
                                    <span>Lihat Layanan &amp; Produk</span>
                                </a>
                            </div>
                        </div>

                        {/* RIGHT: High-Impact Clean Visual */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3]">
                                <img
                                    src="/images/hero-datacenter-clean.jpg"
                                    alt="Infrastruktur Hardware & Server Enterprise CV. Putra Nugraha"
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 2: TENTANG KAMI */}
            <section id="tentang-kami" className="scroll-mt-20 py-16 sm:py-24 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0C0D12] transition-colors duration-150">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
                    
                    {/* Section Header */}
                    <div className="space-y-3 max-w-3xl">
                        <span className="font-mono text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                            TENTANG KAMI
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Mengenal Lebih Dekat CV. Putra Nugraha
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                            Mitra andal pengadaan teknologi, perangkat keras, dan infrastruktur jaringan terpadu untuk kebutuhan instansi dan korporasi.
                        </p>
                    </div>

                    {/* 2-Column Story & Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        
                        {/* Story / Profil Deskripsi */}
                        <div className="lg:col-span-7 space-y-5 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                            <p>
                                <strong className="text-slate-900 dark:text-white">CV. Putra Nugraha</strong> adalah badan usaha berbadan hukum resmi yang bergerak di bidang <strong className="text-slate-900 dark:text-white">Perdagangan Barang dan Jasa</strong>, dengan spesialisasi utama dalam penyediaan perangkat keras (hardware), solusi infrastruktur jaringan (networking), layanan perbaikan, dan suku cadang teknologi informasi.
                            </p>
                            <p>
                                Berawal dari komitmen untuk memberikan kemudahan bagi sektor bisnis dan instansi dalam memperoleh perangkat teknologi yang berkualitas, kami menyediakan rantai pasok terpadu mulai dari tahap konsultasi spesifikasi kebutuhan, pengadaan unit orisinil bergaransi resmi, instalasi sistem, hingga dukungan purna jual (<em>after-sales support</em>).
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                                Dengan tata kelola administrasi yang tertib, kami siap mendukung proses pengadaan B2B maupun pengadaan pemerintah dengan kelengkapan dokumen resmi seperti SPK, Faktur Pajak, dan Berita Acara Serah Terima (BAST).
                            </p>
                        </div>

                        {/* Quick Fact / Credibility Snapshot */}
                        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#171B26]/90 space-y-2 shadow-sm">
                                <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Badan Usaha Resmi</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Persekutuan Komanditer (CV) dengan legalitas NIB, NPWP, dan izin usaha resmi.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#171B26]/90 space-y-2 shadow-sm">
                                <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Produk Bergaransi</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    100% barang original bersumber langsung dari distributor resmi bersertifikasi.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#171B26]/90 space-y-2 shadow-sm">
                                <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FileCheck className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Administrasi Tertib</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Kesiapan administrasi SPK, Faktur Pajak resmi, dan BAST untuk audit B2B.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#171B26]/90 space-y-2 shadow-sm">
                                <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Wrench className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Dukungan Teknisi</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Tim teknis berpengalaman yang siap memberikan pendampingan after-sales.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* SECTION 3: LAYANAN & PRODUK */}
            <section id="layanan" className="scroll-mt-20 py-16 sm:py-24 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0C0D12] transition-colors duration-150">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
                    
                    {/* Section Header: 2 Columns */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                        <div className="space-y-2">
                            <span className="font-mono text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                                LAYANAN KAMI
                            </span>
                            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Layanan &amp; Produk
                            </h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md md:text-right leading-relaxed font-normal">
                            Kebutuhan teknologi perusahaan Anda, ditangani secara menyeluruh dalam satu kemitraan.
                        </p>
                    </div>

                    {/* 4 Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => {
                            const IconComponent = service.icon;
                            return (
                                <a
                                    key={index}
                                    href="#kontak"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector('#kontak')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="group relative rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#171B26]/90 hover:bg-slate-50 dark:hover:bg-[#1E2434] p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl shadow-sm dark:shadow-none"
                                >
                                    <div className="space-y-4">
                                        <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                                            <IconComponent className="h-5 w-5" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                        <span className="font-mono text-[10px] tracking-wider text-slate-500 dark:text-slate-400 uppercase font-medium">
                                            {service.tag}
                                        </span>
                                        <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                                    </div>
                                </a>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* SECTION 4: MENGAPA MEMILIH KAMI */}
            <section id="komitmen" className="scroll-mt-20 py-16 sm:py-24 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-navy-950 transition-colors duration-150">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
                    
                    {/* Section Header */}
                    <div className="space-y-3 max-w-2xl">
                        <span className="font-mono text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                            KOMITMEN KAMI
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Mengapa Memilih CV. Putra Nugraha?
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                            Bukan sekadar penyedia perangkat. Kami hadir sebagai mitra untuk keberlangsungan bisnis Anda.
                        </p>
                    </div>

                    {/* 3 Pillars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {whyChooseUs.map((pillar, index) => {
                            const IconComponent = pillar.icon;
                            return (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#171B26]/80 p-7 sm:p-8 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                                >
                                    <div className="space-y-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <IconComponent className="h-6 w-6" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                                {pillar.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {pillar.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                                        <span className="font-mono text-[10px] tracking-wider text-slate-500 dark:text-slate-400 uppercase font-medium">
                                            {pillar.tag}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>
        </MainLayout>
    );
}
