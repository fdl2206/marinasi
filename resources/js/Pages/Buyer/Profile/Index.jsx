import { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Building2, 
    LayoutDashboard, 
    Package, 
    FileText, 
    Receipt, 
    Wrench, 
    LogOut, 
    Check, 
    CheckCircle2, 
    MapPin, 
    Plus, 
    Lock,
    User,
    Clock,
    X,
    Upload
} from 'lucide-react';
import BuyerNavbar from '@/Components/Buyer/BuyerNavbar';
import BuyerFooter from '@/Components/Buyer/BuyerFooter';
import Modal from '@/Components/Modal';

/**
 * Data mock profil perusahaan, legalitas perpajakan & alamat B2B
 * Sesuai mockup UI/UX terbaru (media_1795276878752_3f5e253b.jpg)
 */
const DEFAULT_COMPANY_DATA = {
    company_name: 'PT Maju Jaya Teknologi',
    industry: 'Teknologi Informasi & Konsultan',
    npwp_number: '01.234.567.8-423.000',
    nib_number: '9120301829102',
    npwp_address: 'Jl. Asia Afrika No. 128, Gedung Menara Lt. 5, Kec. Sumur Bandung, Kota Bandung 40111',
    pdf_file: 'SK_PKP_dan_NPWP_PT_Maju_Jaya.pdf',
    pdf_verified_by: 'Terverifikasi oleh Admin CV. Putra Nugraha',
};

const DEFAULT_PIC_DATA = {
    name: 'Budi Santoso',
    role: 'IT Procurement Officer',
    email: 'budi.santoso@majujaya.co.id',
    phone: '0812-3456-7890',
};

const DEFAULT_ADDRESSES_DATA = [
    {
        id: 'addr-1',
        label: 'Kantor Pusat Bandung (Gedung Menara Lt. 5)',
        tag: 'Alamat Utama & Lokasi Server',
        is_default: true,
        full_address: 'Jl. Asia Afrika No. 128, Kota Bandung, Jawa Barat 40111',
        recipient: 'Budi Santoso (0812-3456-7890)',
        notes: 'Akses lift barang via basement',
    },
    {
        id: 'addr-2',
        label: 'Kantor Operasional Cimahi',
        tag: 'Kantor Cabang / Gudang',
        is_default: false,
        full_address: 'Jl. Raya Cibabat No. 45, Kota Cimahi, Jawa Barat 40513',
        recipient: 'Andi Wijaya - GA (0813-8988-7766)',
        notes: '',
    },
];

export default function ProfileIndex({
    companyProfile: serverCompanyProfile,
    pics: serverPics,
    addresses: serverAddresses,
}) {
    const { props } = usePage();
    const auth = props?.auth;

    // State Section 1: Legalitas Perusahaan
    const [company, setCompany] = useState(() => {
        if (!serverCompanyProfile) return DEFAULT_COMPANY_DATA;
        return {
            ...DEFAULT_COMPANY_DATA,
            company_name: serverCompanyProfile.company_name || auth?.user?.company_name || DEFAULT_COMPANY_DATA.company_name,
            industry: serverCompanyProfile.industry || DEFAULT_COMPANY_DATA.industry,
            npwp_number: serverCompanyProfile.npwp_number || DEFAULT_COMPANY_DATA.npwp_number,
            nib_number: serverCompanyProfile.nib_number || DEFAULT_COMPANY_DATA.nib_number,
            npwp_address: serverCompanyProfile.npwp_address || DEFAULT_COMPANY_DATA.npwp_address,
            pdf_file: serverCompanyProfile.pdf_file || DEFAULT_COMPANY_DATA.pdf_file,
            pdf_verified_by: serverCompanyProfile.pdf_verified_by || DEFAULT_COMPANY_DATA.pdf_verified_by,
        };
    });

    // State Section 2: PIC & Keamanan
    const [pic, setPic] = useState(() => {
        if (serverPics && serverPics.length > 0) {
            const firstPic = serverPics[0];
            return {
                name: firstPic.name || DEFAULT_PIC_DATA.name,
                role: firstPic.role || DEFAULT_PIC_DATA.role,
                email: firstPic.email || DEFAULT_PIC_DATA.email,
                phone: firstPic.phone || DEFAULT_PIC_DATA.phone,
            };
        }
        return {
            ...DEFAULT_PIC_DATA,
            name: auth?.user?.name || DEFAULT_PIC_DATA.name,
            email: auth?.user?.email || DEFAULT_PIC_DATA.email,
        };
    });

    // State Section 3: Daftar Alamat
    const [addresses, setAddresses] = useState(
        serverAddresses && serverAddresses.length > 0 ? serverAddresses : DEFAULT_ADDRESSES_DATA
    );

    // Feedback State
    const [isSaved, setIsSaved] = useState(false);
    const fileInputRef = useRef(null);

    // Modal Ubah Kata Sandi State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordFeedback, setPasswordFeedback] = useState('');

    // Modal Tambah / Ubah Alamat State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addrLabel, setAddrLabel] = useState('');
    const [addrTag, setAddrTag] = useState('');
    const [addrFullAddress, setAddrFullAddress] = useState('');
    const [addrRecipient, setAddrRecipient] = useState('');
    const [addrNotes, setAddrNotes] = useState('');
    const [addrIsDefault, setAddrIsDefault] = useState(false);
    const [addrError, setAddrError] = useState('');

    const sidebarMenuItems = [
        { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
        { id: 'orders', label: 'Riwayat Pesanan & Pengiriman (4)', icon: Package, href: '/buyer/orders' },
        { id: 'rfq', label: 'Status Pengajuan RFQ / SPH (2)', icon: FileText, href: '/buyer/quotations' },
        { id: 'invoices', label: 'Dokumen & Faktur Pajak (e-Faktur)', icon: Receipt, href: '/buyer/invoices' },
        { id: 'services', label: 'Jadwal Instalasi & Tiket Servis', icon: Wrench, href: '/buyer/services' },
        { id: 'company', label: 'Profil Perusahaan & Alamat', icon: Building2, href: '/buyer/profile' },
    ];

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    };

    const handleGantiPdf = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handlePdfFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setCompany(prev => ({
                ...prev,
                pdf_file: file.name,
                pdf_verified_by: 'Dokumen baru diunggah (Menunggu verifikasi admin)',
            }));
            alert(`Dokumen PDF "${file.name}" berhasil diunggah!`);
        }
    };

    const openCreateAddressModal = () => {
        setEditingAddressId(null);
        setAddrLabel('');
        setAddrTag('Kantor Cabang / Gudang');
        setAddrFullAddress('');
        setAddrRecipient(`${pic.name} (${pic.phone})`);
        setAddrNotes('');
        setAddrIsDefault(addresses.length === 0);
        setAddrError('');
        setIsAddressModalOpen(true);
    };

    const openEditAddressModal = (addr) => {
        setEditingAddressId(addr.id);
        setAddrLabel(addr.label || '');
        setAddrTag(addr.tag || (addr.is_default ? 'Alamat Utama & Lokasi Server' : 'Kantor Cabang / Gudang'));
        setAddrFullAddress(addr.full_address || '');
        setAddrRecipient(addr.recipient || '');
        setAddrNotes(addr.notes || '');
        setAddrIsDefault(addr.is_default || false);
        setAddrError('');
        setIsAddressModalOpen(true);
    };

    const handleSetDefaultAddress = (id) => {
        setAddresses(prev => prev.map(a => ({
            ...a,
            is_default: a.id === id,
            tag: a.id === id ? 'Alamat Utama & Lokasi Server' : (a.tag.includes('Server') ? 'Kantor Cabang / Gudang' : a.tag),
        })));
    };

    const handleDeleteAddress = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus alamat ini dari buku alamat perusahaan?')) {
            setAddresses(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        if (!addrLabel.trim() || !addrFullAddress.trim() || !addrRecipient.trim()) {
            setAddrError('Mohon lengkapi nama alamat, alamat lengkap, dan informasi penerima.');
            return;
        }

        if (editingAddressId) {
            setAddresses(prev => prev.map(a => {
                if (a.id === editingAddressId) {
                    return {
                        ...a,
                        label: addrLabel.trim(),
                        tag: addrIsDefault ? 'Alamat Utama & Lokasi Server' : addrTag.trim(),
                        full_address: addrFullAddress.trim(),
                        recipient: addrRecipient.trim(),
                        notes: addrNotes.trim(),
                        is_default: addrIsDefault,
                    };
                }
                return addrIsDefault ? { ...a, is_default: false, tag: a.tag.includes('Server') ? 'Kantor Cabang / Gudang' : a.tag } : a;
            }));
        } else {
            const newAddr = {
                id: `addr-${Date.now()}`,
                label: addrLabel.trim(),
                tag: addrIsDefault ? 'Alamat Utama & Lokasi Server' : addrTag.trim() || 'Kantor Cabang / Gudang',
                is_default: addrIsDefault || addresses.length === 0,
                full_address: addrFullAddress.trim(),
                recipient: addrRecipient.trim(),
                notes: addrNotes.trim(),
            };

            setAddresses(prev => {
                const updated = addrIsDefault 
                    ? prev.map(a => ({ ...a, is_default: false, tag: a.tag.includes('Server') ? 'Kantor Cabang / Gudang' : a.tag })) 
                    : [...prev];
                return [...updated, newAddr];
            });
        }

        setIsAddressModalOpen(false);
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordFeedback('Semua kolom kata sandi wajib diisi.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordFeedback('Konfirmasi kata sandi baru tidak cocok.');
            return;
        }
        setPasswordFeedback('');
        alert('Kata sandi akun pengadaan berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f3f7fa] dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#086f8e] selection:text-white flex flex-col transition-colors duration-150">
            <Head title="Profil Perusahaan, Legalitas Pajak & Alamat — CV. Putra Nugraha" />

            {/* Hidden PDF file input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePdfFileChange} 
                accept="application/pdf" 
                className="hidden" 
            />

            {/* ========================================================= */}
            {/* HEADER NAVBAR                                             */}
            {/* ========================================================= */}
            <BuyerNavbar />

            {/* ========================================================= */}
            {/* MAIN CONTENT AREA                                         */}
            {/* ========================================================= */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ===================================================== */}
                    {/* LEFT SIDEBAR: PROFILE & NAVIGATION MENU (3 Cols)      */}
                    {/* ===================================================== */}
                    <aside className="lg:col-span-3 space-y-5">
                        
                        {/* 1. Akun Perusahaan Card (Deep Navy Sesuai Mockup) */}
                        <div className="rounded-2xl bg-[#0a2540] p-4 sm:p-5 space-y-2.5 text-white shadow-sm border border-[#0a2540]">
                            <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5 text-white" />
                                <span>Akun Perusahaan</span>
                            </div>

                            <div className="space-y-0.5">
                                <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                                    {company.company_name}
                                </h2>
                                <p className="text-xs text-slate-300">
                                    PIC: {pic.name} ({pic.role})
                                </p>
                            </div>
                        </div>

                        {/* 2. Sidebar Navigation Items */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-2 space-y-1 shadow-sm">
                            {sidebarMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = item.id === 'company';
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                                            isActive
                                                ? 'bg-[#086f8e] text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* 3. Keluar Akun */}
                        <div className="pt-1 px-1">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Keluar Akun</span>
                            </Link>
                        </div>

                    </aside>

                    {/* ===================================================== */}
                    {/* RIGHT CONTENT: COMPANY PROFILE & ADDRESSES (9 Cols)   */}
                    {/* ===================================================== */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* Page Title */}
                        <div>
                            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Profil Perusahaan, Legalitas Pajak &amp; Alamat
                            </h1>
                        </div>

                        {/* ================================================= */}
                        {/* CARD 1: DATA LEGALITAS & ADMINISTRASI E-FAKTUR   */}
                        {/* ================================================= */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    1. Data Legalitas Perusahaan &amp; Administrasi e-Faktur PPN 11%
                                </h2>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shrink-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Data Pajak Valid</span>
                                </span>
                            </div>

                            {/* Form Fields: 2 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Nama Resmi Perusahaan / Instansi */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Resmi Perusahaan / Instansi
                                    </label>
                                    <input
                                        type="text"
                                        value={company.company_name}
                                        onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                                {/* Bidang Usaha / Industri */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Bidang Usaha / Industri
                                    </label>
                                    <input
                                        type="text"
                                        value={company.industry}
                                        onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                                {/* Nomor NPWP Perusahaan (16 Digit) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor NPWP Perusahaan (16 Digit)
                                    </label>
                                    <input
                                        type="text"
                                        value={company.npwp_number}
                                        onChange={(e) => setCompany({ ...company, npwp_number: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs font-mono text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                                {/* Nomor Induk Berusaha (NIB) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor Induk Berusaha (NIB)
                                    </label>
                                    <input
                                        type="text"
                                        value={company.nib_number}
                                        onChange={(e) => setCompany({ ...company, nib_number: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                                {/* Alamat Sesuai NPWP (Full Width) */}
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Alamat Sesuai NPWP (Untuk Pencetakan Faktur Pajak)
                                    </label>
                                    <input
                                        type="text"
                                        value={company.npwp_address}
                                        onChange={(e) => setCompany({ ...company, npwp_address: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                            </div>

                            {/* Dokumen PDF Box */}
                            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shrink-0">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                            {company.pdf_file}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                            ({company.pdf_verified_by})
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGantiPdf}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0 transition shadow-2xs cursor-pointer"
                                >
                                    Ganti Dokumen PDF
                                </button>
                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* CARD 2: PIC & KEAMANAN LOGIN                     */}
                        {/* ================================================= */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            
                            {/* Card Header */}
                            <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    2. Penanggung Jawab Pengadaan (PIC) &amp; Keamanan Login
                                </h2>
                            </div>

                            {/* Form Fields: 2 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Nama Lengkap PIC */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Lengkap PIC
                                    </label>
                                    <input
                                        type="text"
                                        value={pic.name}
                                        onChange={(e) => setPic({ ...pic, name: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                                {/* Jabatan / Divisi */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Jabatan / Divisi
                                    </label>
                                    <input
                                        type="text"
                                        value={pic.role}
                                        onChange={(e) => setPic({ ...pic, role: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                                {/* Email Resmi Perusahaan */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Email Resmi Perusahaan
                                    </label>
                                    <input
                                        type="email"
                                        value={pic.email}
                                        onChange={(e) => setPic({ ...pic, email: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                                {/* Nomor WhatsApp Aktif */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor WhatsApp Aktif (Untuk Notifikasi Kurir &amp; Teknisi)
                                    </label>
                                    <input
                                        type="tel"
                                        value={pic.phone}
                                        onChange={(e) => setPic({ ...pic, phone: e.target.value })}
                                        className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                    />
                                </div>

                            </div>

                            {/* Card Footer: Ubah Password & Simpan Profil */}
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition self-start shadow-2xs cursor-pointer"
                                >
                                    <Lock className="h-3.5 w-3.5 text-[#086f8e] dark:text-[#38bdf8]" />
                                    <span>Ubah Kata Sandi</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSaveProfile}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                                >
                                    {isSaved ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            <span>Perubahan Tersimpan!</span>
                                        </>
                                    ) : (
                                        <span>Simpan Perubahan Profil</span>
                                    )}
                                </button>
                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* CARD 3: DAFTAR ALAMAT PENGIRIMAN & INSTALASI      */}
                        {/* ================================================= */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-5 shadow-sm">
                            
                            {/* Card Header with Yellow Action Button */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    3. Daftar Alamat Pengiriman Barang &amp; Lokasi Instalasi Jaringan
                                </h2>

                                <button
                                    type="button"
                                    onClick={openCreateAddressModal}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-xs transition self-start sm:self-auto cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5 text-slate-950" />
                                    <span>Tambah Alamat Kantor / Cabang</span>
                                </button>
                            </div>

                            {/* 2-Column Address Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        className={`rounded-2xl p-4 sm:p-5 space-y-3.5 transition flex flex-col justify-between ${
                                            addr.is_default
                                                ? 'border-2 border-[#086f8e] bg-white dark:bg-[#171B26] shadow-sm'
                                                : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            {/* Tag / Badge */}
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                                                    addr.is_default
                                                        ? 'bg-[#086f8e] text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                                                }`}>
                                                    {addr.tag || (addr.is_default ? 'Alamat Utama & Lokasi Server' : 'Kantor Cabang / Gudang')}
                                                </span>
                                            </div>

                                            {/* Address Label / Title */}
                                            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                                                {addr.label}
                                            </h3>

                                            {/* Full Address Row */}
                                            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{addr.full_address}</span>
                                            </div>

                                            {/* Recipient & Phone Row */}
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                <span>Penerima: {addr.recipient}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 pt-2">
                                            {/* Action Links Row */}
                                            <div className="flex items-center gap-3.5 text-xs font-semibold pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditAddressModal(addr)}
                                                    className="text-slate-900 dark:text-white hover:text-[#086f8e] dark:hover:text-[#38bdf8] transition cursor-pointer"
                                                >
                                                    Ubah Alamat
                                                </button>

                                                {!addr.is_default && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetDefaultAddress(addr.id)}
                                                            className="text-[#086f8e] dark:text-[#38bdf8] hover:underline transition cursor-pointer"
                                                        >
                                                            Jadikan Utama
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                            className="text-rose-600 hover:text-rose-700 hover:underline transition cursor-pointer ml-auto"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Catatan Teknisi (Optional Note Box) */}
                                            {addr.notes && (
                                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0C0D12] border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-[#086f8e] dark:text-[#38bdf8] shrink-0" />
                                                    <span>Catatan Teknisi: {addr.notes}</span>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ))}
                            </div>

                        </div>

                    </div>

                </div>

            </main>

            {/* ========================================================= */}
            {/* MODAL: UBAH KATA SANDI AKUN PENGADAAN                     */}
            {/* ========================================================= */}
            <Modal show={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSavePassword} className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Ubah Kata Sandi Akun
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Perbarui kata sandi untuk keamanan akses dashboard pengadaan B2B Anda.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {passwordFeedback && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
                            {passwordFeedback}
                        </div>
                    )}

                    <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Masukkan kata sandi lama Anda"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Kata Sandi Baru <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimal 8 karakter kombinasi huruf & angka"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi kata sandi baru"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-md transition cursor-pointer"
                        >
                            Simpan Kata Sandi
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================================= */}
            {/* MODAL: TAMBAH / EDIT ALAMAT PENGIRIMAN B2B                */}
            {/* ========================================================= */}
            <Modal show={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSaveAddress} className="p-6 space-y-5 bg-white dark:bg-[#171B26] text-slate-900 dark:text-slate-100">
                    
                    {/* Modal Header */}
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {editingAddressId ? 'Edit Alamat Kantor / Cabang' : 'Tambah Alamat Kantor / Cabang Baru'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Alamat kantor, gudang, atau data center untuk pengiriman fisik &amp; instalasi perangkat on-site.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {addrError && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
                            {addrError}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4 text-xs">
                        
                        {/* Nama / Label Alamat */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Label Alamat Kantor / Cabang <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={addrLabel}
                                onChange={(e) => setAddrLabel(e.target.value)}
                                placeholder="Contoh: Kantor Pusat Bandung (Gedung Menara Lt. 5)"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                        </div>

                        {/* Tag Kategori Alamat */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Kategori / Tipe Lokasi
                            </label>
                            <input
                                type="text"
                                value={addrTag}
                                onChange={(e) => setAddrTag(e.target.value)}
                                placeholder="Contoh: Kantor Cabang / Gudang, Server Room, dsb"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                        </div>

                        {/* Penerima & Telepon */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Nama Penerima &amp; Nomor Kontak PIC <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={addrRecipient}
                                onChange={(e) => setAddrRecipient(e.target.value)}
                                placeholder="Contoh: Budi Santoso (0812-3456-7890) atau Andi Wijaya - GA (0813-8988-7766)"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                required
                            />
                        </div>

                        {/* Alamat Lengkap */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Alamat Lengkap Gedung / Lokasi <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="3"
                                value={addrFullAddress}
                                onChange={(e) => setAddrFullAddress(e.target.value)}
                                placeholder="Contoh: Jl. Asia Afrika No. 128, Kota Bandung, Jawa Barat 40111"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e] resize-none"
                                required
                            />
                        </div>

                        {/* Catatan Khusus Pengiriman */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Catatan Teknisi / Akses Masuk (Opsional)
                            </label>
                            <input
                                type="text"
                                value={addrNotes}
                                onChange={(e) => setAddrNotes(e.target.value)}
                                placeholder="Contoh: Akses lift barang via basement, wajib konfirmasi security H-1"
                                className="w-full rounded-lg bg-slate-50 dark:bg-[#0C0D12] border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                        </div>

                        {/* Checkbox Jadikan Alamat Utama */}
                        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={addrIsDefault}
                                onChange={(e) => setAddrIsDefault(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#086f8e] focus:ring-0 focus:ring-offset-0 bg-transparent"
                            />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                Jadikan sebagai alamat utama &amp; lokasi server
                            </span>
                        </label>

                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(false)}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-md transition cursor-pointer"
                        >
                            {editingAddressId ? 'Perbarui Alamat' : 'Simpan Alamat'}
                        </button>
                    </div>

                </form>
            </Modal>

            {/* ========================================================= */}
            {/* FOOTER B2B CORPORATE 4 KOLOM & WA HOTLINE                 */}
            {/* ========================================================= */}
            <BuyerFooter />

        </div>
    );
}
