export default function ApplicationLogo({
    className = 'h-8 sm:h-10 w-auto',
    variant = 'full',
    alt = 'CV. Putra Nugraha - Perdagangan Barang dan Jasa',
}) {
    if (variant === 'lockup-dark') {
        return (
            <span className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
                <img
                    src="/images/logo-pn.png"
                    alt={alt}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain shrink-0"
                />
                <span className="flex flex-col text-left">
                    <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight">
                        CV. PUTRA NUGRAHA -
                    </span>
                    <span className="text-[10px] font-semibold text-white tracking-wide leading-tight">
                        Perdagangan <span className="text-red-500 font-bold">Barang dan Jasa</span>
                    </span>
                </span>
            </span>
        );
    }

    if (variant === 'icon') {
        return (
            <img
                src="/images/logo-pn.png"
                alt={alt}
                className={`rounded-lg object-contain ${className}`}
            />
        );
    }

    if (variant === 'responsive') {
        return (
            <span className="inline-flex items-center shrink-0">
                {/* Mobile View: Icon Only */}
                <span className="sm:hidden inline-flex items-center">
                    <img
                        src="/images/logo-pn.png"
                        alt={alt}
                        className="h-8 w-8 rounded-lg object-contain shrink-0"
                    />
                </span>

                {/* Tablet & Desktop View: Full Brand Logo (Light / Dark) */}
                <span className="hidden sm:inline-flex items-center">
                    <img
                        src="/images/logo-pn-full.png"
                        alt={alt}
                        className={`dark:hidden object-contain shrink-0 ${className}`}
                    />
                    <img
                        src="/images/logo-pn-full-dark.png"
                        alt={alt}
                        className={`hidden dark:block object-contain shrink-0 ${className}`}
                    />
                </span>
            </span>
        );
    }

    // Default: Full Brand Logo with Light / Dark Mode support
    return (
        <span className="inline-flex items-center shrink-0">
            {/* Light Mode Logo */}
            <img
                src="/images/logo-pn-full.png"
                alt={alt}
                className={`dark:hidden object-contain shrink-0 ${className}`}
            />
            {/* Dark Mode Logo */}
            <img
                src="/images/logo-pn-full-dark.png"
                alt={alt}
                className={`hidden dark:block object-contain shrink-0 ${className}`}
            />
        </span>
    );
}
