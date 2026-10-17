import SellerLayout from '@/Layouts/SellerLayout';
import { Link } from '@inertiajs/react';
import { PackageCheck, Plus, Search, Edit3, Trash2 } from 'lucide-react';

export default function SellerCatalogIndex() {
    return (
        <SellerLayout title="Katalog & Manajemen Stok">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Katalog Produk & Stok</h1>
                        <p className="text-slate-400 text-xs mt-1">Tambah, edit, dan atur ketersediaan stok produk pada etalase B2B.</p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Item Baru
                    </button>
                </div>

                <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
                    <div className="p-8 text-center space-y-3">
                        <PackageCheck className="h-12 w-12 text-blue-400/60 mx-auto" />
                        <h3 className="text-base font-bold text-white">Inventaris Produk E-Catalog</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Daftar komoditas siap tayang, pengaturan harga bertingkat (tiered pricing), dan batas minimum pemesanan (MOQ) dapat dikonfigurasi melalui panel ini.
                        </p>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
