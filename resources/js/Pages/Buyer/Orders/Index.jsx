import BuyerLayout from '@/Layouts/BuyerLayout';
import { Package, Truck, Calendar, MapPin } from 'lucide-react';

export default function OrdersIndex() {
    return (
        <BuyerLayout title="Pelacakan Pesanan & Logistik">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Status Pesanan & Pengiriman</h1>
                    <p className="text-slate-400 text-xs mt-1">Lacak pengiriman barang langsung dari gudang supplier ke lokasi proyek Anda.</p>
                </div>

                <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
                    <div className="p-8 text-center space-y-3">
                        <Truck className="h-12 w-12 text-indigo-400/60 mx-auto" />
                        <h3 className="text-base font-bold text-white">Monitoring Rantai Pasok Real-Time</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Pesanan yang telah diterbitkan Purchase Order (PO) dapat dimonitor nomor resi kurir logistik dan estimasi waktu tibanya di sini.
                        </p>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
