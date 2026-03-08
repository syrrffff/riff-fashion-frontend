
import { useEffect, useState } from 'react';
import api from '../../api/axios';

// --- KOMPONEN TIMER HITUNG MUNDUR ---
const CountdownTimer = ({ createdAt, onTimeout }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            const orderTime = new Date(createdAt).getTime();
            const expiryTime = orderTime + (24 * 60 * 60 * 1000);
            const now = new Date().getTime();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setTimeLeft('WAKTU HABIS');
                if (onTimeout) onTimeout();
                return false;
            }

            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`);
            return true;
        };

        if (!calculateTime()) return;
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [createdAt, onTimeout]);

    if (timeLeft === 'WAKTU HABIS') {
        return <span className="text-red-600 font-black italic">WAKTU HABIS</span>;
    }

    return (
        <div className="flex items-center gap-1.5 text-red-600 font-black text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono tracking-tighter">{timeLeft}</span>
        </div>
    );
};

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Selesai');

    // State Tracking & Modal
    const [trackingData, setTrackingData] = useState(null);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
        // Load Midtrans Snap
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
        if (!document.querySelector(`script[src="${snapScript}"]`)) {
            const script = document.createElement('script');
            script.src = snapScript;
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil pesanan", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async (orderId) => {
        if (!window.confirm('Pesanan sudah diterima dengan baik? Status akan berubah menjadi Selesai.')) return;
        try {
            await api.post(`/orders/${orderId}/complete`);
            alert('Pesanan selesai. Terima kasih!');
            fetchOrders();
        } catch (error) {
            alert('Gagal menyelesaikan pesanan.');
        }
    };

    const handleTrackOrder = async (orderId) => {
        setIsTrackingModalOpen(true);
        setTrackingLoading(true);
        try {
            const res = await api.get(`/orders/${orderId}/track`);
            setTrackingData(res.data);
        } catch (error) {
            console.error("Gagal melacak", error);
        } finally {
            setTrackingLoading(false);
        }
    };

    const handlePayNow = (snapToken) => {
        if (window.snap) {
            window.snap.pay(snapToken, {
                onSuccess: () => fetchOrders(),
                onError: () => fetchOrders(),
            });
        }
    };

    const isOrderExpired = (createdAt) => {
        const diff = new Date().getTime() - new Date(createdAt).getTime();
        return diff > (24 * 60 * 60 * 1000);
    };

    const tabs = [
        { id: 'Semua', label: 'Semua', statuses: [] },
        { id: 'Belum Dibayar', label: 'Belum Dibayar', statuses: ['pending'] },
        { id: 'Dikemas', label: 'Dikemas', statuses: ['paid', 'processing'] },
        { id: 'Dikirim', label: 'Dikirim', statuses: ['shipped'] },
        { id: 'Selesai', label: 'Selesai', statuses: ['completed'] },
        { id: 'Dibatalkan', label: 'Dibatalkan', statuses: ['cancelled', 'failed', 'expired'] }
    ];

    const getOrderCount = (statuses) => {
        if (statuses.length === 0) return orders.length;
        return orders.filter(order => {
            let s = order.status.toLowerCase();
            if (s === 'pending' && isOrderExpired(order.created_at)) s = 'expired';
            return statuses.includes(s);
        }).length;
    };

    const getStatusDisplay = (status) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'pending': return { text: 'Belum Dibayar', color: 'bg-yellow-300 text-yellow-900 border-yellow-900' };
            case 'paid': case 'processing': return { text: 'Dikemas', color: 'bg-blue-300 text-blue-900 border-blue-900' };
            case 'shipped': return { text: 'Dikirim', color: 'bg-indigo-300 text-indigo-900 border-indigo-900' };
            case 'completed': return { text: 'Selesai', color: 'bg-green-300 text-green-900 border-green-900' };
            case 'cancelled': case 'failed': case 'expired': return { text: 'Dibatalkan', color: 'bg-red-300 text-red-900 border-red-900' };
            default: return { text: status, color: 'bg-gray-200 text-gray-800 border-gray-800' };
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'Semua') return true;
        let s = order.status.toLowerCase();
        if (s === 'pending' && isOrderExpired(order.created_at)) s = 'expired';
        return tabs.find(t => t.id === activeTab).statuses.includes(s);
    });

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-2xl font-black uppercase tracking-widest animate-pulse">Memuat Pesanan...</div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-2 inline-block">
                Riwayat Pesanan
            </h1>

            {/* TAB NAVIGATION */}
            <div className="flex overflow-x-auto border-b-4 border-black mb-10 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center min-w-[110px] flex-1 pb-4 relative transition-colors ${
                            activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        <span className={`text-2xl font-black mb-1 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
                            {getOrderCount(tab.statuses)}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black" />}
                    </button>
                ))}
            </div>

            {/* LIST ORDERS */}
            <div className="space-y-8">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 border-4 border-black border-dashed font-bold uppercase text-gray-400 bg-gray-50">
                        Tidak ada pesanan di kategori ini.
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        let actualStatus = order.status.toLowerCase();
                        const isExpired = isOrderExpired(order.created_at);
                        if (actualStatus === 'pending' && isExpired) actualStatus = 'expired';

                        const statusConfig = getStatusDisplay(actualStatus);

                        return (
                            <div key={order.id} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">

                                {/* HEADER CARD */}
                                <div className="p-4 sm:p-6 border-b-4 border-black bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Nomor Pesanan</p>
                                        <div className="flex items-center gap-3">
                                            <p className="font-mono font-black text-lg">{order.order_number}</p>
                                            <span className="text-xs text-gray-400 font-bold">
                                                {new Date(order.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-2">
                                        <span className={`px-4 py-1.5 border-2 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${statusConfig.color}`}>
                                            {statusConfig.text}
                                        </span>
                                        {actualStatus === 'pending' && (
                                            <CountdownTimer createdAt={order.created_at} onTimeout={fetchOrders} />
                                        )}
                                    </div>
                                </div>

                                {/* BODY CARD (Daftar Produk) */}
                                <div className="p-4 sm:p-6 bg-white">
                                    <div className="space-y-4">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="flex gap-4 items-center border-b-2 border-dashed border-gray-200 pb-4 last:border-0 last:pb-0">
                                                {/* Gambar Produk */}
                                                <div className="w-16 h-16 bg-gray-100 border-2 border-black flex-shrink-0 flex items-center justify-center overflow-hidden relative">

                                                    {/* Logika pemanggilan gambar dengan pengecekan URL eksternal vs Storage lokal */}
                                                    {item.product_variant?.product?.image_url && (
                                                        <img
                                                            src={
                                                                item.product_variant.product.image_url.startsWith('http')
                                                                ? item.product_variant.product.image_url
                                                                : `${import.meta.env.VITE_STORAGE_URL}/storage/${item.product_variant.product.image_url}`
                                                            }
                                                            alt={item.product_variant?.product?.name || 'Produk'}
                                                            className="w-full h-full object-cover transition-transform hover:scale-110 relative z-10"
                                                            onError={(e) => {
                                                                // Sembunyikan gambar jika link rusak agar SVG cadangan terlihat
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}

                                                    {/* Fallback SVG: Muncul jika gambar gagal dimuat atau kosong */}
                                                    <div className="absolute inset-0 flex items-center justify-center z-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                    <div>
                                                        <span className="font-black uppercase tracking-tighter text-sm">
                                                            {item.product_variant?.product?.name || 'Produk Tidak Diketahui'}
                                                        </span>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                                                            Size: {item.product_variant?.size || '-'} | Color: {item.product_variant?.color || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <span className="text-xs font-bold text-gray-400 mr-3">x{item.quantity}</span>
                                                        <span className="font-mono text-sm font-black">
                                                            Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* FOOTER CARD (Total & Tombol Aksi) */}
                                <div className="p-4 sm:p-6 bg-gray-50 border-t-4 border-black flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                    <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-start border-b-2 sm:border-0 border-gray-200 pb-4 sm:pb-0">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Belanja</p>
                                        <p className="text-xl sm:text-2xl font-black italic">
                                            Rp {new Intl.NumberFormat('id-ID').format(order.grand_total)}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                                        {actualStatus === 'pending' && (
                                            <button
                                                onClick={() => handlePayNow(order.snap_token)}
                                                className="flex-1 sm:flex-none bg-green-500 text-white px-6 py-2 border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                            >
                                                Bayar Sekarang
                                            </button>
                                        )}
                                        {actualStatus === 'paid' && (
                                            <button
                                                    onClick={() => handleTrackOrder(order.id)}
                                                    className="flex-1 sm:flex-none bg-blue-500 text-white px-6 py-2 border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                                >
                                                    Lacak
                                            </button>
                                        )}
                                        {actualStatus === 'shipped' && (
                                            <>
                                                <button
                                                    onClick={() => handleTrackOrder(order.id)}
                                                    className="flex-1 sm:flex-none bg-blue-500 text-white px-6 py-2 border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                                >
                                                    Lacak
                                                </button>
                                                <button
                                                    onClick={() => handleCompleteOrder(order.id)}
                                                    className="flex-1 sm:flex-none bg-green-500 text-white px-6 py-2 border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                                >
                                                    Diterima
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => window.location.href = `/order/${order.id}`}
                                            className="flex-1 sm:flex-none bg-black text-white px-6 py-2 border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* TRACKING MODAL */}
            {isTrackingModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 max-w-lg w-full relative">
                        <button
                            onClick={() => setIsTrackingModalOpen(false)}
                            className="absolute top-4 right-4 text-2xl font-black hover:scale-110 transition-transform"
                        >
                            ×
                        </button>

                        <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            <h2 className="text-xl font-black uppercase tracking-tight">Status Pelacakan</h2>
                        </div>

                        {trackingLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4">
                                <svg className="animate-spin h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-center font-black uppercase tracking-widest text-sm">Menghubungi Kurir...</p>
                            </div>
                        ) : trackingData?.history ? (
                            <div className="space-y-0 max-h-[50vh] overflow-y-auto pr-4">
                                {trackingData.history.map((h, i) => (
                                    <div key={i} className="relative pl-6 pb-6 border-l-4 border-black last:border-l-0 last:pb-0">
                                        {/* Titik Timeline */}
                                        <div className="absolute -left-[10px] top-0 w-4 h-4 bg-black rounded-full" />

                                        <div className="-mt-1.5 bg-gray-50 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <p className="text-sm font-black uppercase">{h.status}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mb-1 border-b border-gray-200 pb-1">
                                                {new Date(h.updated_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                                            </p>
                                            <p className="text-xs font-bold italic text-gray-700">{h.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 bg-red-100 border-4 border-red-500 text-center shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                                <p className="font-black text-red-800 uppercase tracking-widest text-sm">Data Tidak Ditemukan</p>
                                <p className="text-xs font-bold text-red-600 mt-2">Resi mungkin belum diperbarui oleh pihak kurir.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
