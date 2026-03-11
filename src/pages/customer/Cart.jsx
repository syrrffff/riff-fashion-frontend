import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      const finalData = response.data.data ? response.data.data : response.data;

      if (Array.isArray(finalData)) {
        setCartItems(finalData);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data keranjang:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UBAH JUMLAH (+ / -) DENGAN PERTAHANAN STOK ---
  const updateQuantity = async (itemId, currentQuantity, change, maxStock) => {
    const newQuantity = currentQuantity + change;

    // 1. Jangan izinkan jumlah kurang dari 1
    if (newQuantity < 1) return;

    // 2. LOGIKA BARU: Jangan izinkan melebihi stok maksimal di database
    if (change > 0 && newQuantity > maxStock) {
        alert(`Maksimal pembelian untuk varian ini adalah ${maxStock} pcs.`);
        return;
    }

    try {
      // Tembak API Update (PUT)
      await api.put(`/editCart/${itemId}`, {
        quantity: newQuantity
      });

      // Refresh keranjang & Update Navbar
      fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Gagal mengubah jumlah:", error);
      // Tangkap pesan error dari backend jika ada (misal validasi stok di server)
      alert(error.response?.data?.message || "Gagal mengubah jumlah barang.");
    }
  };

  // --- FUNGSI HAPUS BARANG ---
  const removeItem = async (itemId) => {
    // Beri konfirmasi sebelum menghapus agar tidak kepencet
    if (!window.confirm("Yakin ingin menghapus barang ini dari keranjang?")) return;

    try {
      // Tembak API Delete
      await api.delete(`/deleteCart/${itemId}`);

      // Refresh keranjang & Update Navbar
      fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Gagal menghapus barang:", error);
      alert("Gagal menghapus barang.");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  if (loading) {
    return <div className="min-h-[70vh] flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-widest mb-10">Keranjang Belanja</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-gray-100">
          <p className="text-gray-500 mb-6">Keranjang Anda masih kosong.</p>
          <Link to="/Home" className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">

          <div className="lg:w-2/3">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-bold text-gray-400 uppercase tracking-wide">
              <div className="col-span-5">Produk</div>
              <div className="col-span-2 text-center">Harga</div>
              <div className="col-span-3 text-center">Jumlah</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => {
                // Asumsi data item memiliki properti 'stock' atau 'variant_stock' dari API
                // Jika API Anda menamakannya berbeda (misal item.variant.stock), sesuaikan di sini.
                // Saya asumsikan namanya item.stock berdasarkan kebiasaan standar API Cart.
                const maxStock = item.stock || item.variant_stock || 999;

                return (
                  <div key={item.item_id} className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    {/* Info Produk */}
                    <div className="col-span-12 md:col-span-5 flex items-center space-x-4">
                      <img
                        src={
                          item.product_image?.startsWith('http')
                          ? item.product_image
                          : `${import.meta.env.VITE_STORAGE_URL}/storage/${item.product_image}`
                        }
                        alt={item.product_name}
                        className="w-20 h-24 object-cover bg-gray-100 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />

                      <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2">{item.product_name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Varian: {item.size || 'All Size'} {item.color ? `- ${item.color}` : ''}
                        </p>

                        {/* Indikator Peringatan Jika Stok Menipis */}
                        {maxStock <= 10 && (
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">
                              Sisa Stok: {maxStock}
                            </p>
                        )}

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => removeItem(item.item_id)}
                          className="text-xs text-red-500 hover:text-red-700 font-black uppercase tracking-wider mt-2 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Hapus
                        </button>
                      </div>
                    </div>

                    {/* Harga */}
                    <div className="hidden md:block col-span-2 text-center font-mono font-bold text-gray-900">
                      Rp {new Intl.NumberFormat('id-ID').format(item.product_price)}
                    </div>

                    {/* Kontrol Jumlah (+/-) */}
                    <div className="col-span-6 md:col-span-3 flex justify-start md:justify-center items-center mt-4 md:mt-0">
                      <div className="flex items-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
                        <button
                          onClick={() => updateQuantity(item.item_id, item.quantity, -1, maxStock)}
                          className="px-3 py-1 text-black hover:bg-gray-200 transition font-black"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-sm font-mono font-black text-gray-900 border-x-2 border-black min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.item_id, item.quantity, 1, maxStock)}
                          // Tombol plus di-disable jika qty sudah sama dengan maxStock
                          className={`px-3 py-1 transition font-black ${item.quantity >= maxStock ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
                          disabled={item.quantity >= maxStock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-6 md:col-span-2 text-right font-mono font-black text-gray-900 mt-4 md:mt-0">
                      Rp {new Intl.NumberFormat('id-ID').format(item.product_price * item.quantity)}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Belanja */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-6">Ringkasan Pesanan</h2>

              <div className="flex justify-between font-bold text-gray-600 mb-4 text-sm uppercase">
                <span>Total Item</span>
                <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} Pcs</span>
              </div>

              <div className="border-t-4 border-black my-4 pt-4 flex justify-between items-center">
                <span className="text-base font-black text-gray-900 uppercase">Total Harga</span>
                <span className="text-xl font-mono font-black text-gray-900">
                  Rp {new Intl.NumberFormat('id-ID').format(calculateTotal())}
                </span>
              </div>

              <Link to="/checkout" className="block text-center w-full mt-8 bg-black text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black border-4 border-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Proses Checkout
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
