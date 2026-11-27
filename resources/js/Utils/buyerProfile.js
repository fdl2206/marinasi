export function getBuyerClientProfile(user) {
    const status = user?.verification_status || 'unverified';

    const statusMeta = {
        verified: {
            label: 'Akun Instansi Terverifikasi',
            badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
            darkBadgeClass: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
        },
        pending: {
            label: 'Menunggu Verifikasi Admin',
            badgeClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400',
            darkBadgeClass: 'bg-amber-500/20 border-amber-400/30 text-amber-200',
        },
        rejected: {
            label: 'Verifikasi Ditolak — Perlu Unggah Ulang',
            badgeClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400',
            darkBadgeClass: 'bg-rose-500/20 border-rose-400/30 text-rose-200',
        },
        unverified: {
            label: 'Belum Terverifikasi',
            badgeClass: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
            darkBadgeClass: 'bg-white/10 border-white/20 text-slate-200',
        },
    };

    const meta = statusMeta[status] || statusMeta.unverified;

    return {
        company_name: user?.company_name || 'Nama Perusahaan Belum Diisi',
        pic_name: user?.name || 'PIC Belum Diisi',
        pic_role: 'PIC Pengadaan',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.company_address || 'Alamat instansi belum dilengkapi',
        npwp_number: '',
        verification_status: status,
        is_verified: Boolean(user?.is_verified_buyer),
        tax_status: meta.label,
        badge_class: meta.badgeClass,
        dark_badge_class: meta.darkBadgeClass,
    };
}
