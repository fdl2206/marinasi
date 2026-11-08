import { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Building2, 
    ShieldCheck, 
    FileCheck2, 
    CheckCircle2, 
    ArrowUpRight, 
    Search, 
    Server, 
    Network, 
    Laptop, 
    Calendar, 
    FileText, 
    X, 
    ArrowRight,
    Award,
    Layers,
    Clock,
    PhoneCall
} from 'lucide-react';

export default function Portfolio() {
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModalProject, setActiveModalProject] = useState(null);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setActiveModalProject(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (activeModalProject) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [activeModalProject]);

    const categories = [
        'Semua',
        'Pemerintahan (B2G)',
        'Korporasi (B2B)',
        'Infrastruktur & Jaringan',
        'Pendidikan & Kampus'
    ];

    const stats = [
        {
            value: '50+',
            label: 'Kontrak Pengadaan Selesai',
            description: 'Instansi pemerintah dan swasta'
        },
        {
            value: '100%',
            label: 'BAST & e-Faktur Terbit',
            description: 'Kepatuhan perpajakan dan SPK'
        },
        {
            value: 'Rp 4.8M+',
            label: 'Total Nilai Pengadaan',
            description: 'Realisasi proyek terlaksana'
        },
        {
            value: '0 Hari',
            label: 'Deviasi Serah Terima',
            description: 'Komitmen SLA on-time delivery'
        }
    ];

    const projects = [
        {
            id: 1,
            title: 'Pengadaan Server Rackmount Datacenter & Core Switch Managed',
            client: 'Dinas Komunikasi dan Informatika Provinsi Jawa Barat',
            sector: 'Pemerintahan (B2G)',
            categoryTag: 'Infrastruktur & Jaringan',
            year: '2026',
            bastNumber: 'BAST-Diskominfo-2026-089',
            contractValue: 'Rp 317.000.000',
            image: '/images/hero-datacenter-clean.jpg',
            summary: 'Penyediaan 4 unit Server HPE ProLiant Gen10, 2 unit Core Switch Cisco 24-Port Managed SFP+, serta penataan rak server 42U di pusat data provinsi.',
            fullDescription: 'Proyek pengadaan perangkat keras pusat data untuk memperkuat kapasitas komputasi dan keandalan sistem informasi pemerintahan daerah. Seluruh unit diuji beban nonstop selama 72 jam, lulus sertifikasi burn-in test, dan diserahterimakan dengan BAST resmi beserta Faktur Pajak PPN 11% yang telah divalidasi.',
            deliverables: [
                '4x Server HPE ProLiant ML30 Gen10 (Intel Xeon, 64GB ECC RAM, 4TB SAS RAID)',
                '2x Core Switch Cisco Catalyst 24-Port Managed Gigabit SFP+',
                '1x Server Cabinet Close Rack 42U Heavy Duty + PDU 8-Way',
                '4x Kabel Belden UTP Cat6 Shielded 305m & Terminasi Patch Panel',
                'Sertifikasi Uji Beban & Garansi Distributor Resmi 3 Tahun'
            ],
            documents: [
                'Surat Perjanjian Kerja (SPK) No. 027/SPK/DISKOMINFO/2026',
                'Faktur Pajak Elektronik (e-Faktur PPN 11% Terverifikasi DJP)',
                'Berita Acara Pemeriksaan Hasil Pekerjaan (BAPHP)',
                'Berita Acara Serah Terima (BAST) 100% Sah'
            ],
            duration: '14 Hari Kerja',
            location: 'Bandung, Jawa Barat'
        },
        {
            id: 2,
            title: 'Instalasi Jaringan LAN Terstruktur & Wi-Fi Enterprise Head Office',
            client: 'PT Maju Jaya Teknologi',
            sector: 'Korporasi (B2B)',
            categoryTag: 'Infrastruktur & Jaringan',
            year: '2026',
            bastNumber: 'BAST/PN-MJT/X/2026-014',
            contractValue: 'Rp 71.900.000',
            image: '/images/service-technician-lan.png',
            summary: 'Penarikan kabel UTP Cat6 Belden 48 titik kerja, pemasangan 8 unit Access Point UniFi, dan konfigurasi VLAN manajemen bertingkat.',
            fullDescription: 'Modernisasi infrastruktur jaringan kabel dan nirkabel kantor pusat untuk mendukung 150 staf operasional dan pengembang software. Pekerjaan dilakukan di luar jam kerja efektif guna menjamin zero-downtime bagi aktivitas perusahaan, dilengkapi labelisasi kabel rapi dan as-built drawing dokumentasi jaringan.',
            deliverables: [
                '48 Titik Penarikan Kabel UTP Belden Cat6 Original',
                '8x Ubiquiti UniFi AP AC Pro Long Range (Dual Band)',
                '2x Switch Cisco 24-Port Gigabit PoE Managed',
                '1x Wallmount Rack 15U dengan Cable Management Modular',
                'Konfigurasi Pemisahan VLAN Tamu, Manajemen, & Server'
            ],
            documents: [
                'Purchase Order Korporat PO/MJT/IT/X/088',
                'Invoice & Faktur Pajak #INV-PN-2026-0892',
                'BAST Pekerjaan Instalasi & Dokumentasi Kabel',
                'Garansi Instalasi Teknis CV. Putra Nugraha 1 Tahun'
            ],
            duration: '7 Hari Kerja',
            location: 'Kawasan Industri Pasir Wangi, Bandung'
        },
        {
            id: 3,
            title: 'Pengadaan 35 Unit PC Workstation & Server Mini Laboratorium AI',
            client: 'Fakultas Ilmu Komputer Universitas Pasundan',
            sector: 'Pendidikan & Kampus',
            categoryTag: 'Pendidikan & Kampus',
            year: '2025',
            bastNumber: 'BAST-UNPAS-FT-2025-11',
            contractValue: 'Rp 485.000.000',
            image: '/images/product-server-hpe.png',
            summary: 'Pengadaan 35 unit PC Workstation Core i7 generasi terbaru, 1 unit Server Mini AI GPU Training, serta 35 unit UPS pendukung.',
            fullDescription: 'Penyediaan sarana laboratorium riset kecerdasan buatan dan rekayasa perangkat lunak mahasiswa. Semua unit dirakit, diinstalasi sistem operasi berlisensi, diintegrasikan dengan jaringan domain kampus, dan dilengkapi asuransi perlindungan lonjakan daya UPS.',
            deliverables: [
                '35x PC Workstation Core i7, RAM 32GB DDR5, SSD NVMe 1TB, RTX 4060',
                '1x Mini Tower Server GPU AI Research (Dual RTX Support)',
                '35x UPS ICA 1200VA AVR Pure Sinewave',
                '35x Monitor IPS 24-Inch Full HD 100Hz Low Blue Light',
                'Pelatihan Pengoperasian & Maintenance Tool Admin Lab'
            ],
            documents: [
                'Kontrak Pengadaan Peralatan Laboratorium No. 114/UNPAS/2025',
                'e-Faktur PPN Resmi CV. Putra Nugraha',
                'Berita Acara Uji Fungsi & Serah Terima Komputer (BAST)',
                'Kartu Garansi Pabrikan Resmi 2 Tahun'
            ],
            duration: '21 Hari Kerja',
            location: 'Kota Bandung'
        },
        {
            id: 4,
            title: 'Redundansi Link Jaringan & Server Backup Rekam Medis (RME)',
            client: 'RSUD Bandung Timur (Layanan Publik)',
            sector: 'Pemerintahan (B2G)',
            categoryTag: 'Infrastruktur & Jaringan',
            year: '2025',
            bastNumber: 'BAST/RSUD-BT/MED/2025-08',
            contractValue: 'Rp 195.500.000',
            image: '/images/product-cisco-switch.png',
            summary: 'Instalasi link fiber optic antargedung rawat inap, switch PoE gigabit redundant, dan storage server NAS Synology 64TB.',
            fullDescription: 'Proyek pemenuhan standar akreditasi rumah sakit dan integrasi sistem SatuSehat Kemenkes. Memastikan seluruh rekam medis pasien terdistribusi secara instan antardokter dengan keamanan data tinggi dan toleransi failover otomatis tanpa jeda transaksi.',
            deliverables: [
                '3x Switch Cisco Catalyst PoE Gigabit Redundant Power',
                '1x Storage Server NAS Synology 8-Bay Enterprise 64TB RAW',
                'Penarikan Kabel Fiber Optic Multimode 12 Core Antargedung',
                'Konfigurasi Snapshot Backup Otomatis & Enkripsi AES-256',
                'Uji Coba Simulasi Pemadaman Jalur (Failover Test 100% Lulus)'
            ],
            documents: [
                'Surat Perjanjian Pengadaan No. 445/SPK-RSUD/2025',
                'e-Faktur Pajak Resmi Instansi Pemerintah',
                'Berita Acara Pengujian Sistem dan Jaringan (BAP)',
                'BAST Serah Terima Peralatan Medis IT 100%'
            ],
            duration: '10 Hari Kerja',
            location: 'Ujung Berung, Kota Bandung'
        },
        {
            id: 5,
            title: 'Pengadaan Perangkat Kasir, Barcode Scanner & Wi-Fi Gudang Logistik',
            client: 'CV Sinar Abadi Mandiri (Logistik & Distribusi)',
            sector: 'Korporasi (B2B)',
            categoryTag: 'Korporasi (B2B)',
            year: '2026',
            bastNumber: 'BAST-SAM-LOG-2026-03',
            contractValue: 'Rp 42.800.000',
            image: '/images/product-ubiquiti-ap.png',
            summary: 'Pengadaan 5 unit Access Point Ubiquiti Long Range tahan debu untuk area pergudangan 2.000 m2 dan perangkat scanner barcode mobile.',
            fullDescription: 'Implementasi konektivitas nirkabel performa tinggi untuk mendukung sistem manajemen pergudangan (WMS) secara real-time. Memastikan pekerja gudang dapat melakukan scanning barcode palet barang tanpa terputus sinyal di antara tumpukan rak kontainer tinggi.',
            deliverables: [
                '5x Ubiquiti UniFi AP Long Range Industrial Grade',
                '6x Wireless Barcode Scanner 2D Rugged Drop-Proof',
                '1x Switch 16-Port Gigabit PoE Managed',
                'Setting Seamless Roaming Fast-Handover 802.11r'
            ],
            documents: [
                'PO Pembelian No. PO/SAM/X/2026/19',
                'Kuitansi & e-Faktur Pajak Terbit #INV-PN-2026-0885',
                'BAST Pengujian Sinyal Wi-Fi (Heatmap Report Lolos)',
                'SLA Layanan Servis 1 Tahun'
            ],
            duration: '5 Hari Kerja',
            location: 'Kabupaten Bandung Barat'
        },
        {
            id: 6,
            title: 'Pengadaan Paket 60 Unit Laptop Edukasi & Router Asesmen ANBK',
            client: 'Dinas Pendidikan & Kebudayaan Kabupaten Bandung',
            sector: 'Pemerintahan (B2G)',
            categoryTag: 'Pendidikan & Kampus',
            year: '2025',
            bastNumber: 'BAST-DISDIK-ANBK-2025-22',
            contractValue: 'Rp 360.000.000',
            image: '/images/product-belden-cable.png',
            summary: 'Penyediaan 60 unit laptop edukasi berstandar Kemendikbudristek untuk 4 sekolah binaan, router Mikrotik CCR, dan simulasi jaringan asesmen.',
            fullDescription: 'Dukungan fasilitas infrastruktur digital pendidikan untuk menyukseskan Asesmen Nasional Berbasis Komputer (ANBK). Tim CV. Putra Nugraha melakukan konfigurasi jaringan semi-online dan mendampingi pelaksanaan simulasi ujian hingga seluruh siswa dan guru terlatih dengan baik.',
            deliverables: [
                '60x Laptop Edukasi 14 Inch (Intel Quad-Core, SSD 256GB, Garansi Resmi)',
                '4x Router Mikrotik Cloud Core Series (CCR)',
                '4x Switch 24-Port Fast & Gigabit Layer-2',
                'Pendampingan Teknis On-Site Selama Gladi Bersih ANBK'
            ],
            documents: [
                'Surat Perintah Mulai Kerja (SPMK) Dinas Pendidikan',
                'Dokumen Faktur Pajak Lengkap & Berkas Pembayaran Termin',
                'Berita Acara Hasil Uji Mutu Barang (BAHUM)',
                'BAST Serah Terima Barang ke 4 Kepala Sekolah'
            ],
            duration: '18 Hari Kerja',
            location: 'Soreang, Kabupaten Bandung'
        }
    ];

    // Filter projects based on tab and search query
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesCategory = 
                selectedCategory === 'Semua' || 
                project.sector === selectedCategory || 
                project.categoryTag === selectedCategory;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = 
                !q || 
                project.title.toLowerCase().includes(q) ||
                project.client.toLowerCase().includes(q) ||
                project.bastNumber.toLowerCase().includes(q) ||
                project.sector.toLowerCase().includes(q) ||
                project.categoryTag.toLowerCase().includes(q);

            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    return (
        <MainLayout title="Portofolio Rekam Jejak Pengadaan & BAST">
            <Head title="Portofolio Rekam Jejak Kontrak & BAST — CV. Putra Nugraha" />

            <div className="bg-slate-50 dark:bg-[#0C0D12] min-h-screen text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-150">
                {/* ========================================================= */}
                {/* HERO / HEADER SECTION                                     */}
                {/* ========================================================= */}
                <section className="relative overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#12161F] dark:to-[#0C0D12] transition-colors duration-150">
                    {/* Subtle ambient light */}
                    <div 
                        aria-hidden="true" 
                        className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" 
                    />

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-azure text-xs font-semibold tracking-wide uppercase">
                                <span className="h-1.5 w-1.5 rounded-full dot-azure shrink-0" />
                                <span>REKAM JEJAK &amp; PORTOFOLIO KONTRAK</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
                                Portofolio Pengadaan &amp; Implementasi IT
                            </h1>

                            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                                Bukti nyata komitmen CV. Putra Nugraha dalam menyediakan solusi perangkat keras, infrastruktur jaringan terstruktur, dan layanan teknis enterprise. Seluruh pekerjaan diselesaikan 100% dengan Berita Acara Serah Terima (BAST) dan kepatuhan faktur pajak resmi.
                            </p>
                        </div>

                        {/* STATS COUNTER GRID */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800/80">
                            {stats.map((stat, idx) => (
                                <div 
                                    key={idx}
                                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#171B26]/60 backdrop-blur-sm shadow-sm dark:shadow-none"
                                >
                                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                                        {stat.label}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        {stat.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========================================================= */}
                {/* FILTER CONTROLS & SEARCH                                  */}
                {/* ========================================================= */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 sm:pt-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                        {/* Category Tab Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                            {categories.map((cat) => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-sm dark:bg-[#1E293B] dark:text-white dark:border-slate-600'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 border border-transparent'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-80 shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari instansi, perangkat, SPK..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#171B26] border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Filter Indicator */}
                    <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div>
                            Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{filteredProjects.length}</span> proyek pengadaan
                            {selectedCategory !== 'Semua' && (
                                <span> dalam kategori <span className="font-medium text-blue-600 dark:text-[#9bb8f5]">"{selectedCategory}"</span></span>
                            )}
                            {searchQuery && (
                                <span> dengan kata kunci <span className="font-medium text-blue-600 dark:text-[#9bb8f5]">"{searchQuery}"</span></span>
                            )}
                        </div>
                    </div>
                </section>

                {/* ========================================================= */}
                {/* PROJECT CARDS GRID                                        */}
                {/* ========================================================= */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6">
                    {filteredProjects.length === 0 ? (
                        <div className="py-20 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-8 space-y-3 shadow-sm">
                            <FileText className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Tidak ada proyek yang cocok</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                Coba sesuaikan kata kunci pencarian atau pilih kategori tab yang lain.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory('Semua');
                                    setSearchQuery('');
                                }}
                                className="px-3.5 py-1.5 rounded-lg btn-primary-bespoke text-xs font-medium inline-block mt-2"
                            >
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <article
                                    key={project.id}
                                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl"
                                >
                                    <div>
                                        {/* Card Image Thumbnail */}
                                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80">
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            {/* Top badges over image */}
                                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide badge-azure backdrop-blur-md">
                                                    {project.sector}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-800 dark:text-slate-300 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 backdrop-blur-md">
                                                    {project.year}
                                                </span>
                                            </div>

                                            {/* Status Badge overlay bottom */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium badge-sage backdrop-blur-md">
                                                    <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                                    <span>Selesai 100% • BAST Terbit</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 space-y-3">
                                            {/* Client Name */}
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-[#9bb8f5]">
                                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{project.client}</span>
                                            </div>

                                            {/* Project Title */}
                                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                                {project.title}
                                            </h3>

                                            {/* Short Summary */}
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                {project.summary}
                                            </p>

                                            {/* Contract Value & BAST Reference */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                                <div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Nilai Kontrak</div>
                                                    <div className="font-bold text-slate-900 dark:text-slate-200">{project.contractValue}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Ref. Dokumen</div>
                                                    <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                                                        {project.bastNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer Button */}
                                    <div className="px-5 pb-5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setActiveModalProject(project)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium transition active:scale-95 group/btn shadow-sm"
                                        >
                                            <span>Lihat Ringkasan Proyek &amp; BAST</span>
                                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ========================================================= */}
                {/* COMPLIANCE & TENDER STANDARDS SECTION                     */}
                {/* ========================================================= */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-24">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12161F] p-8 sm:p-12 space-y-8 shadow-sm">
                        <div className="max-w-2xl space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-[#9bb8f5]">
                                STANDAR TENDER &amp; KEPATUHAN PENGADAAN
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Mengapa Instansi Mempercayakan Pengadaan Kepada Kami
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Kelancaran tender dan pengadaan tidak hanya bergantung pada barang yang berkualitas, namun juga keabsahan administrasi perpajakan dan dokumen legalitas hukum yang dapat dipertanggungjawabkan kepada auditor.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#171B26] space-y-2.5">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-[#9bb8f5]">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Legalitas Lengkap (CV)</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    NIB terverifikasi OSS, NPWP aktif, dan status Pengusaha Kena Pajak (PKP) resmi terdaftar.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#171B26] space-y-2.5">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-[#92d8b8]">
                                    <FileCheck2 className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">e-Faktur &amp; BAST Sah</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Penerbitan Faktur Pajak PPN 11% otomatis terintegrasi DJP dan berkas BAST tanda tangan basah / digital.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#171B26] space-y-2.5">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-[#e8a36e]">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Termin Pembayaran PO</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Fleksibilitas pembayaran tempo 14–30 hari kalender bagi mitra instansi dan perusahaan terverifikasi.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#171B26] space-y-2.5">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-[#9bb8f5]">
                                    <Award className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Garansi &amp; Tim On-Site</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Perangkat original dengan garansi distributor resmi, didukung teknisi lokal bersertifikat untuk support cepat.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================================= */}
                {/* BOTTOM CALL-TO-ACTION                                     */}
                {/* ========================================================= */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-24">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 via-white to-slate-50 dark:from-[#171B26] dark:to-[#12161F] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-md dark:shadow-2xl">
                        <div className="max-w-xl space-y-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#92d8b8]">
                                KONSULTASI PENGADAAN &amp; SPH CEPAT
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Rencanakan Pengadaan IT Bersama CV. Putra Nugraha
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Butuh estimasi harga (RAB/BoQ), surat penawaran harga resmi (SPH), atau ketersediaan unit untuk tender instansi? Tim pengadaan kami siap menerbitkan respon dalam waktu 1x24 jam kerja.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                            <Link
                                href="/#kontak"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl btn-primary-bespoke text-xs font-semibold transition shadow-lg active:scale-95"
                            >
                                <PhoneCall className="h-4 w-4" />
                                <span>Konsultasi &amp; Ajukan RFQ</span>
                            </Link>

                            <Link
                                href="/katalog"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold transition active:scale-95 shadow-sm"
                            >
                                <span>Lihat Katalog Produk B2B</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* ========================================================= */}
            {/* PROJECT DETAIL MODAL (ANIMATED AS PER RULES)              */}
            {/* ========================================================= */}
            {activeModalProject && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-project-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                >
                    {/* Backdrop with Fade-In Animation */}
                    <div 
                        onClick={() => setActiveModalProject(null)}
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-modal-backdrop" 
                    />

                    {/* Modal Window with Smooth Scale/Pop-In Animation */}
                    <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#171B26] shadow-2xl overflow-hidden z-10 animate-modal my-8">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F]">
                            <div className="space-y-1.5 pr-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold badge-azure">
                                        {activeModalProject.sector}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                                        Tahun {activeModalProject.year}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium badge-sage">
                                        <span className="h-1.5 w-1.5 rounded-full dot-sage shrink-0" />
                                        <span>BAST Terbit &amp; Disahkan</span>
                                    </span>
                                </div>
                                <h3 id="modal-project-title" className="text-base sm:text-xl font-bold text-slate-900 dark:text-white pt-1">
                                    {activeModalProject.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-[#9bb8f5] font-medium">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>{activeModalProject.client}</span>
                                    <span className="text-slate-400 dark:text-slate-500">•</span>
                                    <span className="text-slate-500 dark:text-slate-400">{activeModalProject.location}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveModalProject(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/80 dark:hover:text-white dark:hover:bg-slate-800/80 transition shrink-0"
                                aria-label="Tutup Detail Proyek"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Scrollable Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
                            {/* Project Photo / Banner Preview */}
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[21/9] bg-slate-900">
                                <img
                                    src={activeModalProject.image}
                                    alt={activeModalProject.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                                    <span className="text-slate-200 font-medium">Nilai Kontrak Pekerjaan</span>
                                    <span className="text-base font-extrabold text-white">{activeModalProject.contractValue}</span>
                                </div>
                            </div>

                            {/* Uraian Lengkap */}
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Deskripsi &amp; Lingkup Pekerjaan
                                </h4>
                                <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-xs sm:text-[13px]">
                                    {activeModalProject.fullDescription}
                                </p>
                            </div>

                            {/* Deliverables / Item Pengadaan */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Daftar Komoditas &amp; Deliverables Fisik
                                </h4>
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] p-4 space-y-2">
                                    {activeModalProject.deliverables.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#92d8b8] shrink-0 mt-0.5" />
                                            <span className="text-slate-800 dark:text-slate-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Verified Documents Checklist */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Verifikasi Dokumen &amp; Legalitas Administrasi
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {activeModalProject.documents.map((doc, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#12161F] flex items-center gap-2.5"
                                        >
                                            <FileCheck2 className="h-4 w-4 text-blue-600 dark:text-[#9bb8f5] shrink-0" />
                                            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono leading-tight">
                                                {doc}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ringkasan Durasi & Lokasi */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Durasi Pelaksanaan</div>
                                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{activeModalProject.duration}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Lokasi Serah Terima</div>
                                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{activeModalProject.location}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Status Validasi Pajak</div>
                                    <div className="font-semibold text-emerald-600 dark:text-[#92d8b8] mt-0.5">e-Faktur Valid DJP</div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                Dokumen Referensi: {activeModalProject.bastNumber}
                            </span>
                            <div className="flex items-center gap-2.5 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setActiveModalProject(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition shadow-sm"
                                >
                                    Tutup
                                </button>
                                <Link
                                    href="/#kontak"
                                    className="px-4 py-2 rounded-xl btn-primary-bespoke text-xs font-semibold transition active:scale-95 inline-flex items-center gap-1.5 shadow"
                                >
                                    <span>Konsultasi Proyek Serupa</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
