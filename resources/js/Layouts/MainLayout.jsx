import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Public/Navbar';
import Footer from '@/Components/Public/Footer';

export default function MainLayout({ children, title }) {
    const fullTitle = title ? `${title} | CV. Putra Nugraha` : 'CV. Putra Nugraha - B2B E-Catalog & Procurement';

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0C0D12] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white antialiased font-sans transition-colors duration-150">
            <Head title={title}>
                <meta name="description" content="Company Profile resmi & B2B E-Catalog platform CV. Putra Nugraha. Melayani pengadaan barang, penawaran harga, dan kemitraan skala industri." />
            </Head>

            {/* Global Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 w-full">
                {children}
            </main>

            {/* Global Footer */}
            <Footer />
        </div>
    );
}
