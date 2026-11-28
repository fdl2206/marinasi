import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/Common/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-150 relative">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="mb-6">
                <Link href="/" className="flex items-center">
                    <ApplicationLogo className="h-11 sm:h-12 w-auto" />
                </Link>
            </div>

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171B26] p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-150">
                {children}
            </div>
        </div>
    );
}
