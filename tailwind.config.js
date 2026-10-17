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
                sans: ['Inter', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                navy: {
                    50: '#f0f5ff',
                    100: '#e0ebff',
                    200: '#c7d9fe',
                    300: '#a3c0fd',
                    400: '#759cfb',
                    500: '#4e74f6',
                    600: '#3452ec',
                    700: '#273ed4',
                    800: '#1e309f',
                    850: '#131e50',
                    900: '#0c1635',
                    950: '#070d1e',
                },
                brand: {
                    primary: '#2563eb',
                    secondary: '#0ea5e9',
                    accent: '#f59e0b',
                },
            },
        },
    },

    plugins: [forms],
};
