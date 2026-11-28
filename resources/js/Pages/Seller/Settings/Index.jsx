import { useState, useRef } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    ShieldCheck, 
    Lock, 
    Building2, 
    FileText, 
    Users, 
    Landmark, 
    Check, 
    CheckCircle2, 
    Upload, 
    Plus, 
    RotateCcw, 
    X, 
    AlertCircle, 
    FileSpreadsheet, 
    Printer, 
    CreditCard, 
    ChevronRight,
    HelpCircle,
    UserCheck,
    FileCheck2,
    Paperclip
} from 'lucide-react';

export default function SellerSettingsIndex() {
    // Tab navigation state
    const [activeTab, setActiveTab] = useState('profile');

    // Toast notification state
    const [toastMessage, setToastMessage] = useState(null);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Hidden file input refs for asset uploads
    const kopSuratInputRef = useRef(null);
    const stempelInputRef = useRef(null);

    // Section 1 State: Admin Profile
    const [adminProfile, setAdminProfile] = useState({
        name: 'Admin Utama CV. Putra Nugraha',
        role_label: 'Super Admin (Akses Penuh)',
        division: 'Kepala Operasional & Administrasi Pajak',
        email: 'admin@putranugraha.co.id',
        whatsapp: '0813-2077-7874'
    });

    // Section 2 State: Vendor Identity
    const [vendorIdentity, setVendorIdentity] = useState({
        business_name: 'CV. PUTRA NUGRAHA (Putra Nugraha Computer)',
        npwp: '02.889.112.4-429.000',
        is_pkp: true,
        hotline: '(+62) 813-2077-7874',
        address: 'Jl. Palintang Kav. 2 RT.03 Rw.05 Kel. Pasir Wangi Kec. Ujung Berung Bandung',
        kop_filename: 'kop-surat-putra-nugraha.pdf',
        stempel_filename: 'stempel-digital-vendor.png'
    });

    // Section 3 State: Staff List (RBAC)
    const [staffList, setStaffList] = useState([
        {
            id: 1,
            name: 'Admin Utama',
            role: 'Super Admin',
            permissions: 'Semua Modul (Full Access)',
            status: 'Aktif',
            is_active: true
        },
        {
            id: 2,
            name: 'Siti Rahma',
            role: 'Admin Finance & Pajak',
            permissions: 'Verifikasi PO, Invoice, & Upload e-Faktur PPN 11%',
            status: 'Aktif',
            is_active: true
        },
        {
            id: 3,
            name: 'Dedi Kurniawan',
            role: 'Admin Gudang & Katalog',
            permissions: 'Stok Barang, Harga Grosir, & Cetak Surat Jalan',
            status: 'Aktif',
            is_active: true
        },
        {
            id: 4,
            name: 'Andi Pratama',
            role: 'Koordinator Teknisi',
            permissions: 'Jadwal Instalasi LAN, Pemasangan CCTV & Servis',
            status: 'Aktif',
            is_active: true
        }
    ]);

    // Section 4 State: Bank Accounts & Default Rules
    const [banks, setBanks] = useState([
        {
            id: 1,
            name: 'Bank Mandiri Corporate / Virtual Account',
            account_number: 'No. Rek / VA: 130-00-8122077-4 (A.n. CV. PUTRA NUGRAHA)',
            badge: 'Utama',
            badge_variant: 'blue'
        },
        {
            id: 2,
            name: 'Bank BCA Bisnis',
            account_number: 'No. Rek: 437-9888-774 (A.n. CV. PUTRA NUGRAHA)',
            badge: 'Aktif',
            badge_variant: 'green'
        }
    ]);

    const [defaultRules, setDefaultRules] = useState({
        tax_rate: 'PPN 11%',
        tax_notes: 'Diterapkan pada dokumen pengadaan kena pajak.',
        payment_term: 'Sesuai kesepakatan pada PO',
        term_notes: 'Mengikuti termin yang disetujui dengan klien B2B.'
    });

    // Modal States
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new_pass: '', confirm: '' });
    const [staffModalOpen, setStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [staffFormData, setStaffFormData] = useState({ name: '', role: '', permissions: '' });

    // Handle Save Admin Profile
    const handleSaveAdminProfile = (e) => {
        e.preventDefault();
        showToast('Profil admin & kontak operasional berhasil diperbarui!');
    };

    // Handle Password Change
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!passwordData.current || !passwordData.new_pass || !passwordData.confirm) {
            alert('Semua kolom kata sandi wajib diisi!');
            return;
        }
        if (passwordData.new_pass !== passwordData.confirm) {
            alert('Konfirmasi kata sandi baru tidak sesuai!');
            return;
        }
        setPasswordModalOpen(false);
        setPasswordData({ current: '', new_pass: '', confirm: '' });
        showToast('Kata sandi Super Admin berhasil diperbarui dengan aman!');
    };

    // Handle Kop Surat Upload
    const handleKopSuratChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setVendorIdentity(prev => ({ ...prev, kop_filename: file.name }));
            showToast(`Template Kop Surat berhasil diperbarui: ${file.name}`);
        }
    };

    // Handle Stempel Upload
    const handleStempelChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setVendorIdentity(prev => ({ ...prev, stempel_filename: file.name }));
            showToast(`Stempel & Tanda Tangan digital berhasil diperbarui: ${file.name}`);
        }
    };

    // Open Staff Modal for create or edit
    const openStaffModal = (staff = null) => {
        if (staff) {
            setEditingStaff(staff);
            setStaffFormData({
                name: staff.name,
                role: staff.role,
                permissions: staff.permissions
            });
        } else {
            setEditingStaff(null);
            setStaffFormData({
                name: '',
                role: 'Admin Operasional',
                permissions: 'Akses terbatas modul operasional'
            });
        }
        setStaffModalOpen(true);
    };

    // Save Staff
    const handleSaveStaff = (e) => {
        e.preventDefault();
        if (!staffFormData.name.trim() || !staffFormData.role.trim()) {
            alert('Mohon isi nama dan role staf.');
            return;
        }

        if (editingStaff) {
            setStaffList(prev => prev.map(s => s.id === editingStaff.id ? {
                ...s,
                name: staffFormData.name,
                role: staffFormData.role,
                permissions: staffFormData.permissions
            } : s));
            showToast(`Hak akses untuk ${staffFormData.name} berhasil diperbarui!`);
        } else {
            const newStaff = {
                id: Date.now(),
                name: staffFormData.name,
                role: staffFormData.role,
                permissions: staffFormData.permissions,
                status: 'Aktif',
                is_active: true
            };
            setStaffList(prev => [...prev, newStaff]);
            showToast(`Akun staf baru ${staffFormData.name} berhasil ditambahkan!`);
        }
        setStaffModalOpen(false);
    };

    // Smooth scroll to section
    const scrollToSection = (sectionId, tabKey) => {
        setActiveTab(tabKey);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <SellerLayout title="Profil Admin & Pengaturan Portal Vendor">
            <Head title="Profil Admin, Hak Akses Staf & Pengaturan Portal Vendor — CV. Putra Nugraha" />

            {/* Hidden File Inputs for Document Automation */}
            <input 
                type="file" 
                ref={kopSuratInputRef} 
                onChange={handleKopSuratChange} 
                accept="application/pdf" 
                className="hidden" 
            />
            <input 
                type="file" 
                ref={stempelInputRef} 
                onChange={handleStempelChange} 
                accept="image/png,image/jpeg" 
                className="hidden" 
            />

            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#171B26] border border-emerald-500/30 text-slate-900 dark:text-slate-100 font-medium text-xs shadow-2xl animate-modal">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="space-y-6">
                
                {/* ===================================================== */}
                {/* BREADCRUMB & PAGE HEADER                              */}
                {/* ===================================================== */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Link href="/seller/dashboard" className="hover:text-slate-600 dark:hover:text-slate-300 transition">
                            Back-Office
                        </Link>
                        <span>&gt;</span>
                        <span className="text-[#086f8e] dark:text-[#38bdf8] font-semibold">Pengaturan Portal Vendor</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Profil Admin, Hak Akses Staf &amp; Pengaturan Portal Vendor
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kelola akun pengelola internal, identitas legal CV. Putra Nugraha, stempel digital SPH/BAST, dan rekening pembayaran B2B.
                    </p>
                </div>

                {/* ===================================================== */}
                {/* 4 TAB SHORTCUT NAVIGATION BAR                         */}
                {/* ===================================================== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
                    <button
                        type="button"
                        onClick={() => scrollToSection('sec-profile', 'profile')}
                        className={`px-3 py-2.5 rounded-xl font-bold transition text-center cursor-pointer ${
                            activeTab === 'profile'
                                ? 'bg-[#086f8e] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        1. Profil &amp; Keamanan Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollToSection('sec-identity', 'identity')}
                        className={`px-3 py-2.5 rounded-xl font-bold transition text-center cursor-pointer ${
                            activeTab === 'identity'
                                ? 'bg-[#086f8e] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        2. Identitas Vendor &amp; Kop SPH
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollToSection('sec-rbac', 'rbac')}
                        className={`px-3 py-2.5 rounded-xl font-bold transition text-center cursor-pointer ${
                            activeTab === 'rbac'
                                ? 'bg-[#086f8e] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        3. Hak Akses Staf (RBAC)
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollToSection('sec-banking', 'banking')}
                        className={`px-3 py-2.5 rounded-xl font-bold transition text-center cursor-pointer ${
                            activeTab === 'banking'
                                ? 'bg-[#086f8e] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        4. Rekening Bank &amp; VA
                    </button>
                </div>

                {/* ===================================================== */}
                {/* SECTION 1: PROFIL PENGELOLA & KEAMANAN AKUN INTERNAL   */}
                {/* ===================================================== */}
                <div id="sec-profile" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-xs">
                    <div className="space-y-1">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            1. Profil Pengelola &amp; Keamanan Akun Internal
                        </h2>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                                <span>Role: {adminProfile.role_label}</span>
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Field 1: Nama Lengkap Admin */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Lengkap Admin
                                </label>
                                <input
                                    type="text"
                                    value={adminProfile.name}
                                    onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            {/* Field 2: Jabatan / Divisi Internal */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Jabatan / Divisi Internal
                                </label>
                                <input
                                    type="text"
                                    value={adminProfile.division}
                                    onChange={(e) => setAdminProfile({ ...adminProfile, division: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            {/* Field 3: Email Login Back-Office */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Email Login Back-Office
                                </label>
                                <input
                                    type="email"
                                    value={adminProfile.email}
                                    onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            {/* Field 4: Nomor WhatsApp Notifikasi Pesanan/RFQ */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nomor WhatsApp Notifikasi Pesanan/RFQ
                                </label>
                                <input
                                    type="text"
                                    value={adminProfile.whatsapp}
                                    onChange={(e) => setAdminProfile({ ...adminProfile, whatsapp: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setPasswordModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                            >
                                <Lock className="h-3.5 w-3.5 text-slate-500" />
                                <span>Ubah Kata Sandi Admin</span>
                            </button>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                            >
                                <span>Simpan Profil Admin</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* ===================================================== */}
                {/* SECTION 2: IDENTITAS RESMI VENDOR & OTOMATISASI DOK    */}
                {/* ===================================================== */}
                <div id="sec-identity" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-xs">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            2. Identitas Resmi Vendor &amp; Otomatisasi Dokumen B2B (SPH, Invoice, e-Faktur)
                        </h2>
                    </div>

                    <div className="space-y-4 text-xs">
                        {/* 2x2 Form Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nama Badan Usaha Resmi */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Badan Usaha Resmi
                                </label>
                                <input
                                    type="text"
                                    value={vendorIdentity.business_name}
                                    onChange={(e) => setVendorIdentity({ ...vendorIdentity, business_name: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            {/* NPWP Perusahaan Vendor (PKP) */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    NPWP Perusahaan Vendor (PKP)
                                </label>
                                <input
                                    type="text"
                                    value={vendorIdentity.npwp}
                                    onChange={(e) => setVendorIdentity({ ...vendorIdentity, npwp: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs font-mono text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                                <div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                        <span>Pengusaha Kena Pajak (PKP)</span>
                                    </span>
                                </div>
                            </div>

                            {/* Nomor WhatsApp & Hotline Resmi */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nomor WhatsApp &amp; Hotline Resmi
                                </label>
                                <input
                                    type="text"
                                    value={vendorIdentity.hotline}
                                    onChange={(e) => setVendorIdentity({ ...vendorIdentity, hotline: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            {/* Alamat Kantor & Gudang Utama */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Alamat Kantor &amp; Gudang Utama
                                </label>
                                <input
                                    type="text"
                                    value={vendorIdentity.address}
                                    onChange={(e) => setVendorIdentity({ ...vendorIdentity, address: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>
                        </div>

                        {/* Document Assets Subtitle */}
                        <div className="pt-2 flex items-center gap-1.5 text-xs text-[#086f8e] dark:text-[#38bdf8] font-medium">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>Asset berikut digunakan otomatis pada dokumen pengadaan B2B:</span>
                        </div>

                        {/* 2 Document Asset Visual Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Asset 1: Kop Surat Resmi */}
                            <div className="rounded-xl border border-dashed border-sky-300 dark:border-sky-800/80 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-3">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    Kop Surat Resmi (Header PDF SPH &amp; Invoice)
                                </div>

                                {/* Visual Paper Mockup */}
                                <div className="rounded-lg bg-white dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 p-3 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700/80">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-[#e11d48] text-white font-black text-[10px] flex items-center justify-center">
                                                PN
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-tight">PUTRA NUGRAHA</div>
                                                <div className="text-[9px] text-slate-400">Computer</div>
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 tracking-wider">
                                            VENDOR B2B
                                        </div>
                                    </div>
                                    <div className="text-[8px] text-slate-400 leading-tight">
                                        Jl. Palintang Kav. 2, Ujungberung, Bandung | 0813-2077-7874
                                    </div>
                                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                                        <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200">
                                            SURAT PENAWARAN HARGA
                                        </div>
                                        <div className="h-1 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mt-1" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => showToast(`Membuka pratinjau dokumen: ${vendorIdentity.kop_filename}`)}
                                        className="inline-flex items-center gap-1 text-[11px] text-[#086f8e] dark:text-[#38bdf8] hover:underline font-medium truncate"
                                    >
                                        <Paperclip className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{vendorIdentity.kop_filename}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => kopSuratInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer"
                                    >
                                        <RotateCcw className="h-3 w-3 text-slate-500" />
                                        <span>Ganti Kop Surat</span>
                                    </button>
                                </div>
                            </div>

                            {/* Asset 2: Stempel Basah & Tanda Tangan Digital */}
                            <div className="rounded-xl border border-dashed border-sky-300 dark:border-sky-800/80 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-3">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    Stempel Basah &amp; Tanda Tangan Digital Direktur (PNG Transparan)
                                </div>

                                {/* Visual Stamp & Signature Mockup */}
                                <div className="rounded-lg bg-white dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 p-3 shadow-xs flex items-center justify-around gap-4 min-h-[92px]">
                                    {/* Round Stamp Seal */}
                                    <div className="relative h-16 w-16 rounded-full border-2 border-dashed border-[#086f8e] text-[#086f8e] flex flex-col items-center justify-center p-1 text-center shrink-0">
                                        <div className="text-[7px] font-bold uppercase tracking-tighter">CV. PUTRA NUGRAHA</div>
                                        <div className="text-[8px] font-black my-0.5">BANDUNG</div>
                                        <div className="text-[6px] tracking-widest text-[#086f8e]/80">RESMI</div>
                                    </div>

                                    {/* Signature Block */}
                                    <div className="space-y-0.5 text-right">
                                        <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                                            Disetujui
                                        </div>
                                        {/* Stylized SVG signature line */}
                                        <svg className="w-24 h-6 text-slate-600 dark:text-slate-300 ml-auto" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 18 C 20 5, 30 22, 45 10 C 60 0, 70 20, 95 12" />
                                        </svg>
                                        <div className="text-[9px] text-slate-500 font-medium">
                                            Direktur Utama &bull; CV. Putra Nugraha
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => showToast(`Membuka pratinjau asset: ${vendorIdentity.stempel_filename}`)}
                                        className="inline-flex items-center gap-1 text-[11px] text-[#086f8e] dark:text-[#38bdf8] hover:underline font-medium truncate"
                                    >
                                        <Paperclip className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{vendorIdentity.stempel_filename}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => stempelInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer"
                                    >
                                        <RotateCcw className="h-3 w-3 text-slate-500" />
                                        <span>Perbarui Stempel</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ===================================================== */}
                {/* SECTION 3: DAFTAR AKUN STAF INTERNAL & RBAC           */}
                {/* ===================================================== */}
                <div id="sec-rbac" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-slate-800/80">
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                3. Daftar Akun Staf Internal &amp; Pembagian Hak Akses (Role Permissions)
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                👥 {staffList.length} akun staf internal &bull; {staffList.filter(s => s.is_active).length} aktif
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => openStaffModal()}
                            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer shrink-0"
                        >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Tambah Akun Staf</span>
                        </button>
                    </div>

                    {/* Desktop Table with Deep Navy Header */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-[#0a2540] text-white text-[11px] font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-4">Nama Staf</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Hak Akses</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#171B26]">
                                {staffList.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                            {staff.name}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                            {staff.role}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                                            {staff.permissions}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                <span>Aktif</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openStaffModal(staff)}
                                                className="text-xs font-semibold text-[#086f8e] dark:text-[#38bdf8] hover:underline cursor-pointer"
                                            >
                                                {staff.id === 1 ? 'Edit' : 'Edit Akses'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Lock className="h-3 w-3 shrink-0" />
                        <span>Hak akses dibatasi sesuai tanggung jawab staf. Perubahan izin hanya dapat dilakukan oleh Super Admin.</span>
                    </div>
                </div>

                {/* ===================================================== */}
                {/* SECTION 4: REKENING BANK & ATURAN DEFAULT PENGADAAN    */}
                {/* ===================================================== */}
                <div id="sec-banking" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-5 sm:p-6 space-y-4 shadow-xs">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            4. Rekening Bank Resmi &amp; Aturan Default Pengadaan (PPN &amp; Termin)
                        </h2>
                    </div>

                    {/* 2 Bank Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {banks.map((bank) => (
                            <div 
                                key={bank.id} 
                                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#12161F] p-4 space-y-2.5 transition hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-white dark:bg-[#171B26] border border-slate-200 dark:border-slate-700/80 text-[#086f8e] dark:text-[#38bdf8]">
                                        <Landmark className="h-4 w-4" />
                                    </div>
                                    {bank.badge_variant === 'blue' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                            {bank.badge}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span>{bank.badge}</span>
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                        {bank.name}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                                        {bank.account_number}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2 Default Rules Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                        {/* Pajak Pengadaan Default */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Pajak Pengadaan Default
                            </label>
                            <input
                                type="text"
                                value={defaultRules.tax_rate}
                                onChange={(e) => setDefaultRules({ ...defaultRules, tax_rate: e.target.value })}
                                className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                            <p className="text-[11px] text-slate-400">
                                {defaultRules.tax_notes}
                            </p>
                        </div>

                        {/* Termin Pembayaran */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Termin Pembayaran
                            </label>
                            <input
                                type="text"
                                value={defaultRules.payment_term}
                                onChange={(e) => setDefaultRules({ ...defaultRules, payment_term: e.target.value })}
                                className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700/80 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                            />
                            <p className="text-[11px] text-slate-400">
                                {defaultRules.term_notes}
                            </p>
                        </div>
                    </div>

                    {/* Blue Callout Banner */}
                    <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs flex items-center gap-2 font-medium">
                        <ShieldCheck className="h-4 w-4 text-[#086f8e] dark:text-[#38bdf8] shrink-0" />
                        <span>Gunakan hanya rekening atas nama CV. PUTRA NUGRAHA untuk seluruh pembayaran pengadaan B2B.</span>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* MODAL 1: UBAH KATA SANDI ADMIN                            */}
            {/* ========================================================= */}
            {passwordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-[#086f8e]" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Ubah Kata Sandi Super Admin
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPasswordModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Kata Sandi Saat Ini
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Kata Sandi Baru
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.new_pass}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_pass: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Konfirmasi Kata Sandi Baru
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white font-bold"
                                >
                                    Simpan Kata Sandi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: TAMBAH / EDIT AKUN STAF                          */}
            {/* ========================================================= */}
            {staffModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop">
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 shadow-2xl space-y-4 animate-modal text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#086f8e]" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {editingStaff ? `Edit Hak Akses: ${editingStaff.name}` : 'Tambah Akun Staf Internal'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStaffModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveStaff} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Staf
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={staffFormData.name}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Role / Divisi
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={staffFormData.role}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                                    className="w-full h-9 rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Cakupan Hak Akses Modul
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    value={staffFormData.permissions}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, permissions: e.target.value })}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#086f8e]"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStaffModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#086f8e] hover:bg-[#065b75] text-white font-bold"
                                >
                                    Simpan Akun Staf
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
