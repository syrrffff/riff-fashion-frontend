
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // State Tracking
    const [trackingData, setTrackingData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data.data);
        } catch (error) {
            console.error("Gagal memuat detail", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async () => {
        setIsTracking(true);
        try {
            const res = await api.get(`/orders/${order.id}/track`);
            setTrackingData(res.data);
        } catch (error) {
            console.error("Gagal melacak paket", error);
            alert("Gagal mengambil data dari kurir. Coba lagi nanti.");
        } finally {
            setIsTracking(false);
        }
    };

    // Helper untuk warna status
    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending': return 'bg-yellow-300 text-yellow-900 border-yellow-900';
            case 'paid': case 'processing': return 'bg-blue-300 text-blue-900 border-blue-900';
            case 'shipped': return 'bg-indigo-300 text-indigo-900 border-indigo-900';
            case 'completed': return 'bg-green-300 text-green-900 border-green-900';
            case 'cancelled': case 'failed': case 'expired': return 'bg-red-300 text-red-900 border-red-900';
            default: return 'bg-gray-200 text-gray-800 border-gray-800';
        }
    };

    // Helper untuk terjemahan status
    const getStatusText = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending': return 'Belum Dibayar';
            case 'paid': case 'processing': return 'Dikemas';
            case 'shipped': return 'Dikirim';
            case 'completed': return 'Selesai';
            case 'cancelled': case 'failed': case 'expired': return 'Dibatalkan';
            default: return status;
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-2xl font-black uppercase tracking-widest animate-pulse">Memuat Detail...</div>
        </div>
    );

    if (!order) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-2xl font-black uppercase text-red-500 border-4 border-red-500 p-8 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
                Pesanan Tidak Ditemukan
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            {/* Tombol Kembali */}
            <button onClick={() => navigate(-1)} className="mb-8 font-black uppercase text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Kembali
            </button>

            {/* HEADER PESANAN */}
            <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nomor Pesanan</p>
                    <h1 className="text-2xl md:text-3xl font-black uppercase font-mono tracking-tighter">{order.order_number}</h1>
                    <p className="text-xs font-bold mt-2 text-gray-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                </div>
                <div className={`px-6 py-2 border-4 font-black text-sm uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* SISI KIRI: INFORMASI PENGIRIMAN (7 Kolom) */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Alamat Card */}
                    <div className="border-4 border-black bg-white p-6">
                        <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="font-black uppercase text-xl tracking-tight">Alamat Pengiriman</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-lg uppercase">{order.recipient_name || 'Nama Tidak Tersedia'}</p>
                            <p className="font-bold text-gray-600">{order.phone_number || '-'}</p>
                            <p className="font-medium leading-relaxed mt-2 text-sm">{order.shipping_address || 'Alamat tidak ditemukan.'}</p>
                        </div>
                    </div>

                    {/* Kurir & Lacak Card */}
                    <div className="border-4 border-black bg-gray-50 p-6">
                        <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            <h3 className="font-black uppercase text-xl tracking-tight">Info Kurir</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Kurir & Layanan</p>
                                <p className="font-black text-lg uppercase">{order.courier_company} - {order.courier_type}</p>
                            </div>
                            {order.tracking_number && (
                                <div className="sm:text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase">No. Resi</p>
                                    <p className="font-mono font-black text-blue-600 text-lg">{order.tracking_number}</p>
                                </div>
                            )}
                        </div>

                        {order.tracking_number && (
                            <div className="mt-6 border-t-4 border-black pt-6">
                                <button
                                    onClick={handleTrack}
                                    disabled={isTracking}
                                    className={`w-full border-2 border-black text-white font-black py-3 uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                                        isTracking ? 'bg-gray-500 cursor-not-allowed' : 'bg-black'
                                    }`}
                                >
                                    {isTracking ? 'Mencari Data...' : 'Lacak Perjalanan Paket'}
                                </button>

                                {/* Timeline Pelacakan */}
                                {trackingData && trackingData.history && (
                                    <div className="mt-6 bg-white border-2 border-black p-4 max-h-80 overflow-y-auto">
                                        <div className="space-y-0">
                                            {trackingData.history.map((hist, index) => (
                                                <div key={index} className="relative pl-6 pb-6 border-l-2 border-black last:border-l-0 last:pb-0">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black border-2 border-white rounded-full" />
                                                    <div className="-mt-1.5">
                                                        <p className="text-sm font-black uppercase text-black">{hist.status}</p>
                                                        <p className="text-[10px] font-bold text-gray-500 mb-1">{new Date(hist.updated_at).toLocaleString('id-ID')}</p>
                                                        <p className="text-xs font-medium text-gray-700">{hist.note}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {trackingData && !trackingData.history && (
                                    <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold text-center uppercase">
                                        Resi belum masuk ke sistem kurir.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SISI KANAN: RINGKASAN PRODUK & HARGA (5 Kolom) */}
                <div className="lg:col-span-5 space-y-8">

                    {/* Item Card */}
                    <div className="border-4 border-black bg-white p-6">
                        <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h3 className="font-black uppercase text-xl tracking-tight">Item Pesanan</h3>
                        </div>

                        <div className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                    {/* Gambar Produk */}
                                    <div className="w-16 h-16 bg-gray-100 border-2 border-black flex-shrink-0 flex items-center justify-center overflow-hidden relative">

                                        {/* Pastikan nama kolom gambar Anda benar (misal: image_url atau product_image) */}
                                        {item.product_variant?.product?.image_url && (
                                            <img
                                                src={
                                                    item.product_variant.product.image_url.startsWith('http')
                                                    ? item.product_variant.product.image_url
                                                    : `${import.meta.env.VITE_API_BASE_URL}/storage/${item.product_variant.product.image_url}`
                                                }
                                                alt={item.product_variant?.product?.name || 'Produk'}
                                                className="w-full h-full object-cover transition-transform hover:scale-110 relative z-10"
                                                onError={(e) => {
                                                    // Jika gambar gagal dimuat (broken link), otomatis sembunyikan img tag
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}

                                        {/* Fallback SVG: Berada di layer bawah (z-0), hanya akan terlihat jika gambar tidak ada/error */}
                                        <div className="absolute inset-0 flex items-center justify-center z-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black uppercase text-sm leading-tight mb-1">
                                            {item.product_variant?.product?.name || 'Produk'}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                                            Size: {item.product_variant?.size || '-'} | Color: {item.product_variant?.color || '-'}
                                        </p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <p className="text-xs font-bold text-gray-500">Qty: {item.quantity}</p>
                                            <p className="font-mono text-sm font-black">
                                                Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ringkasan Harga Card (Mirip Struk/Invoice) */}
                    <div className="bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(209,213,219,1)]">
                        <h3 className="font-black uppercase text-xl tracking-tight border-b-4 border-white pb-4 mb-4">Rincian Bayar</h3>
                        <div className="space-y-3 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal Produk</span>
                                <span>Rp {new Intl.NumberFormat('id-ID').format(order.total_price)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Ongkos Kirim</span>
                                <span>Rp {new Intl.NumberFormat('id-ID').format(order.shipping_cost)}</span>
                            </div>

                            {/* Garis pemisah putus-putus ala struk */}
                            <div className="border-t-2 border-dashed border-gray-600 my-4"></div>

                            <div className="flex justify-between items-end">
                                <span className="font-black uppercase text-lg">Total</span>
                                <span className="font-black text-2xl text-green-400">
                                    Rp {new Intl.NumberFormat('id-ID').format(order.grand_total)}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
