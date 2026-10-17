import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileSpreadsheet,
    Package,
    Receipt,
    LogOut,
    Menu,
    X,
    Box,
    ExternalLink
} from 'lucide-react';

export default function BuyerLayout({ children, title }) {
    const { url = '', props } = usePage();
    const auth = props?.auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard Buyer', href: '/buyer/dashboard', icon: LayoutDashboard },
        { name: 'Pengajuan RFQ (Nego)', href: '/buyer/quotations', icon: FileSpreadsheet },
        { name: 'Pesanan & Logistik', href: '/buyer/orders', icon: Package },
        { name: 'Invoice & BAST', href: '/buyer/invoices', icon: Receipt },
    ];

    const isActive = (path) => Boolean(url && url.startsWith(path));

    return (
        <div className="min-h-screen bg-navy-950 text-slate-100 flex font-sans antialiased text-xs">
            <Head title={`[Buyer Wireframe] ${title || 'Dashboard'}`} />

            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-900 border-r border-navy-800 flex flex-col font-mono text-xs transition-transform duration-200 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="h-16 flex items-center justify-between px-5 border-b border-navy-800">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded border border-dashed border-blue-400 bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Box className="h-3.5 w-3.5" />
                        </div>
                        <div className="font-bold text-white text-xs">[PORTAL_BUYER]</div>
                    </Link>
                    <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-3 mx-3 my-3 rounded border border-navy-850 bg-navy-950 text-[11px]">
                    <div className="text-slate-500">[ROLE: BUYER_ACCOUNT]</div>
                    <div className="text-white font-bold truncate mt-0.5">{auth?.user?.name || 'Mitra Instansi / Buyer'}</div>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs transition ${
                                    active
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                                        : 'text-slate-400 hover:text-white hover:bg-navy-800/60 border border-transparent'
                                }`}
                            >
                                <item.icon className="h-3.5 w-3.5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-3 mt-3 border-t border-navy-800">
                        <Link
                            href="/katalog"
                            className="flex items-center justify-between px-3 py-2 rounded text-xs text-slate-400 hover:text-white hover:bg-navy-800/60"
                        >
                            <span>[Lihat Katalog]</span>
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </nav>

                <div className="p-3 border-t border-navy-800">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full py-2 text-center rounded bg-navy-950 border border-navy-800 text-slate-400 hover:text-red-300 text-xs"
                    >
                        [Keluar Sesi]
                    </Link>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <header className="h-14 bg-navy-900 border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between font-mono sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-1.5 rounded border border-navy-800 text-slate-400"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                        <h2 className="text-xs font-bold text-white">[PANEL: {title || 'BUYER_VIEW'}]</h2>
                    </div>
                    <div className="text-[11px] text-slate-400">
                        USER: <span className="text-white font-bold">{auth?.user?.name || 'Tamu / Preview'}</span>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 font-sans">
                    {children}
                </main>
            </div>
        </div>
    );
}
