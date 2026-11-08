import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', ...defaultTheme.fontFamily.sans],
                display: ['"Outfit"', 'sans-serif'],
                mono: ['"Space Grotesk"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                dark: {
                    bg: '#0C0D12',
                    header: '#12161F',
                    card: '#171B26',
                    elevated: '#1E2434',
                    border: '#262C3A',
                },
                navy: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#262C3A',
                    850: '#1E2434',
                    900: '#171B26',
                    950: '#0C0D12',
                },
                brand: {
                    primary: '#2563eb',
                    secondary: '#0ea5e9',
                    accent: '#f59e0b',
                },
            },
            animation: {
                'modal-pop': 'modalContentPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'modal-backdrop': 'modalBackdropFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                modalContentPopIn: {
                    '0%': { opacity: '0', transform: 'scale(0.92) translateY(10px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                modalBackdropFadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },

    plugins: [forms],
};
