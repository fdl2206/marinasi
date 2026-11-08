import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-150 relative">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="mb-6">
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/images/logo-pn.png"
                        alt="Logo CV. Putra Nugraha"
                        className="h-10 w-10 rounded-lg object-contain shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                            CV. PUTRA NUGRAHA
                        </span>
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            Perdagangan Barang dan Jasa
                        </span>
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-150">
                {children}
            </div>
        </div>
    );
}
