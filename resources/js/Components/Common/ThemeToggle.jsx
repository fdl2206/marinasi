import { Sun, Moon } from 'lucide-react';
import useTheme from '@/hooks/useTheme';

export default function ThemeToggle({ className = '', showLabel = false }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-90 border ${
                isDark
                    ? 'border-slate-800 bg-[#171B26] text-amber-300 hover:text-amber-200 hover:bg-[#1E2434] hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 shadow-sm'
            } ${className}`}
        >
            <span className="relative h-4 w-4 flex items-center justify-center">
                {isDark ? (
                    <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                    <Moon className="h-4 w-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
                )}
            </span>
            {showLabel && (
                <span className="ml-2 text-xs font-medium">
                    {isDark ? 'Mode Terang' : 'Mode Gelap'}
                </span>
            )}
        </button>
    );
}

