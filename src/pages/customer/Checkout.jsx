import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State Data
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  // State Form Alamat
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    recipient_name: '',
    phone_number: '',
    full_address: '',
    postal_code: '',
    city_id: '',
  });

  // State Pencarian Biteship
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAreaName, setSelectedAreaName] = useState('');

  // --- STATE BARU: ONGKOS KIRIM ---
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  // Efek Debounce untuk pencarian Biteship
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchKeyword.length >= 3 && searchKeyword !== selectedAreaName) {
        searchBiteshipArea(searchKeyword);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword, selectedAreaName]);

  // --- EFEK BARU: Ambil Ongkir Otomatis Jika Alamat Tersedia ---
  useEffect(() => {
    const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];

    // Tambahkan pengecekan cartItems.length > 0
    if (defaultAddress && defaultAddress.city_id && !showAddressForm && cartItems.length > 0) {
      fetchShippingRates(defaultAddress.city_id);
    }
  }, [addresses, showAddressForm, cartItems]);

  const fetchCheckoutData = async () => {
    try {
      const cartRes = await api.get('/cart');
      const cartData = cartRes.data.data ? cartRes.data.data : cartRes.data;

      if (!Array.isArray(cartData) || cartData.length === 0) {
        alert("Keranjang Anda kosong!");
        window.dispatchEvent(new Event('cartUpdated'));
        navigate('/cart');
        return;
      }
      setCartItems(cartData);

      const addressRes = await api.get('/user-addresses');
      setAddresses(addressRes.data);

      if (addressRes.data.length === 0) {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error("Gagal mengambil data checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchBiteshipArea = async (keyword) => {
    setIsSearching(true);
    try {
      const res = await api.get(`/areas?search=${keyword}`);
      setSearchResults(res.data.areas || []);
    } catch (error) {
      console.error("Gagal mencari wilayah", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedCourier) return alert("Pilih kurir terlebih dahulu!");

    try {
      const payload = {
        shipping_cost: shippingCost,
        courier_company: `${selectedCourier.company} - ${selectedCourier.type}`,
      };

      const res = await api.post('/checkout', payload);

      console.log("Respon Server:", res.data);

      if (res.data.success && res.data.snap_token) {

        if (typeof window.snap === 'undefined') {
          alert("Midtrans Snap belum terload. Pastikan script snap.js ada di index.html");
          return;
        }

        window.snap.pay(res.data.snap_token, {
          onSuccess: (result) => {
            console.log("Payment Success", result);
            window.dispatchEvent(new Event('cartUpdated'));
            navigate('/orders');
          },
          onPending: (result) => {
            window.dispatchEvent(new Event('cartUpdated'));
            navigate('/orders');
          },
          onError: (error) => {
            console.error("Snap Error:", error);
            alert("Pembayaran Gagal!");
          },
          onClose: () => {
            alert("Anda belum menyelesaikan pembayaran.");
            window.dispatchEvent(new Event('cartUpdated'));
            navigate('/orders');
          }
        });

      } else {
        alert("Server tidak mengirimkan token pembayaran.");
      }

    } catch (error) {
      console.error("FULL ERROR OBJECT:", error);

      if (error.response) {
        alert(error.response.data.message || "Gagal memproses di server.");
      } else {
        alert("Terjadi kesalahan di aplikasi: " + error.message);
      }
    }
  };

  const handleSelectArea = (area) => {
    const areaName = area.name;
    setFormData({
      ...formData,
      city_id: area.id,
      postal_code: area.postal_code ? String(area.postal_code) : ''
    });
    setSelectedAreaName(areaName);
    setSearchKeyword(areaName);
    setSearchResults([]);
  };

  const submitAddress = async (e) => {
    e.preventDefault();
    if (!formData.city_id) {
      alert("Silakan pilih wilayah dari daftar dropdown.");
      return;
    }

    try {
      if (formData.id) {
        await api.put(`/user-addresses/${formData.id}`, formData);
        alert("Alamat berhasil diperbarui!");
      } else {
        await api.post('/user-addresses', formData);
        alert("Alamat baru berhasil disimpan!");
      }

      setShowAddressForm(false);
      setFormData({ id: null, recipient_name: '', phone_number: '', full_address: '', postal_code: '', city_id: '' });
      setSearchKeyword('');
      fetchCheckoutData();
    } catch (error) {
      console.error("Gagal menyimpan alamat", error);
      alert("Mohon lengkapi semua data dengan benar.");
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      id: address.id,
      recipient_name: address.recipient_name,
      phone_number: address.phone_number,
      full_address: address.full_address,
      postal_code: address.postal_code,
      city_id: address.city_id,
    });
    setSearchKeyword('');
    setShowAddressForm(true);
  };

  // --- FUNGSI BARU: Hitung Ongkir ---
  const fetchShippingRates = async (destinationAreaId) => {
    setLoadingRates(true);
    try {
      const totalWeight = calculateTotalWeight();

      const response = await api.post('/rates', {
        destination_area_id: destinationAreaId,
        weight: totalWeight
      });

      console.log(`Cek Ongkir untuk Area: ${destinationAreaId}, Berat: ${totalWeight}gr`);
      console.log("Response dari API Biteship:", response.data);

      const pricingData = response.data.biteship_response?.pricing || response.data.pricing;

      if (pricingData && Array.isArray(pricingData)) {
        setCouriers(pricingData);
        if (pricingData.length > 0) {
          handleSelectCourier(pricingData[0]);
        }
      } else {
        console.error("Format pricing tidak ditemukan dalam response.");
        setCouriers([]);
      }
    } catch (error) {
      console.error("Gagal mengambil ongkos kirim:", error.response?.data || error);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleSelectCourier = (courier) => {
    setSelectedCourier(courier);
    setShippingCost(courier.price);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  const calculateTotalWeight = () => {
    return cartItems.reduce((total, item) => {
      const weight = item.product_weight || 300;
      return total + (weight * item.quantity);
    }, 0);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-4xl font-black uppercase tracking-widest animate-pulse border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        Memuat Checkout...
      </div>
    </div>
  );

  const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 max-w-7xl mx-auto">

      {/* HEADER BRUTALIST */}
      <div className="border-b-8 border-black pb-6 mb-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
          Checkout.
        </h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
          Selesaikan pesanan Anda.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

        {/* BAGIAN KIRI: ALAMAT & KURIR */}
        <div className="lg:w-2/3">

          {/* 1. SECTION ALAMAT */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
              1. Alamat Pengiriman
            </h2>

            {showAddressForm ? (
              <form onSubmit={submitAddress} className="border-4 border-black p-6 md:p-8 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nama Penerima</label>
                    <input type="text" required className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all"
                      value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nomor HP</label>
                    <input type="text" required className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all"
                      value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                  </div>
                </div>

                <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Cari Kecamatan / Kota (Biteship)</label>
                  <div className="relative">
                    <input
                      type="text"
                      // 1. Placeholder dinamis: Jika sedang edit (ada ID), tampilkan teks instruksi
                      placeholder={formData.id ? "Alamat tersimpan (Ketik ulang untuk mengubah)" : "Ketik minimal 3 huruf..."}

                      // 2. Required dinamis: Hanya wajib diisi jika city_id belum ada
                      required={!formData.city_id}

                      className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm uppercase transition-all placeholder:normal-case placeholder:text-gray-400"
                      value={searchKeyword}
                      onChange={e => setSearchKeyword(e.target.value)}
                    />
                    {isSearching && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">Mencari...</span>}

                    {/* DROPDOWN HASIL PENCARIAN */}
                    {searchResults.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border-4 border-black mt-2 max-h-60 overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {searchResults.map((area) => (
                          <li key={area.id}
                              onClick={() => handleSelectArea(area)}
                              className="p-4 hover:bg-black hover:text-white cursor-pointer border-b-2 border-black last:border-b-0 transition-colors">
                            <span className="font-bold text-sm uppercase">{area.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Alamat Lengkap (Jalan, RT/RW)</label>
                    <textarea required rows="3" className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all"
                      value={formData.full_address} onChange={e => setFormData({...formData, full_address: e.target.value})}></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Kode Pos</label>
                    <input type="text" required className="w-full px-4 py-3 border-2 border-black bg-gray-100 focus:outline-none font-bold text-sm"
                      value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t-2 border-black">
                  <button type="submit" className="flex-1 bg-black text-white px-6 py-4 border-4 border-black text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(209,213,219,1)]">
                    {formData.id ? 'Perbarui Alamat' : 'Simpan Alamat'}
                  </button>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-4 border-4 border-black bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="border-4 border-black p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="font-black text-xl uppercase mb-1">{defaultAddress?.recipient_name}</h3>
                  <p className="text-xs font-bold text-gray-500 font-mono mb-4">{defaultAddress?.phone_number}</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed uppercase">
                    {defaultAddress?.full_address}
                  </p>
                  <p className="text-xs font-bold text-gray-500 tracking-widest mt-2 uppercase">KODE POS: {defaultAddress?.postal_code}</p>
                </div>
                <button onClick={() => handleEditAddress(defaultAddress)} className="border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors whitespace-nowrap">
                  Ubah Alamat
                </button>
              </div>
            )}
          </div>

          {/* 2. SECTION KURIR PENGIRIMAN */}
          {!showAddressForm && defaultAddress && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
                2. Layanan Pengiriman
              </h2>

              {loadingRates ? (
                <div className="border-4 border-black p-8 text-center bg-gray-50">
                  <p className="text-lg font-black uppercase tracking-widest animate-pulse">Menghitung Ongkos Kirim...</p>
                </div>
              ) : couriers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {couriers.map((courier, index) => {
                    const isSelected = selectedCourier?.company === courier.company && selectedCourier?.type === courier.type;
                    return (
                      <div
                        key={index}
                        onClick={() => handleSelectCourier(courier)}
                        className={`border-4 p-6 cursor-pointer transition-all ${
                          isSelected
                          ? 'border-black bg-black text-white shadow-[8px_8px_0px_0px_rgba(209,213,219,1)] -translate-y-1'
                          : 'border-black bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="block font-black uppercase text-xl">{courier.company}</span>
                            <span className={`block text-xs font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                              {courier.type}
                            </span>
                          </div>
                          <span className="font-mono font-black text-lg whitespace-nowrap">
                            Rp {new Intl.NumberFormat('id-ID').format(courier.price)}
                          </span>
                        </div>
                        <div className={`border-t-2 pt-3 mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest ${isSelected ? 'border-gray-700' : 'border-gray-200'}`}>
                          <span>Estimasi Tiba:</span>
                          <span>{courier.duration || courier.description || '1-3 Hari'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border-4 border-black p-8 text-center bg-red-50 text-red-600">
                  <p className="font-black uppercase tracking-widest text-sm">Maaf, tidak ada layanan pengiriman yang tersedia untuk wilayah ini.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* BAGIAN KANAN: RINGKASAN PESANAN */}
        <div className="lg:w-1/3">
          <div className="border-4 border-black p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24">
            <h2 className="text-xl font-black text-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
              Ringkasan Pesanan
            </h2>

            {/* LIST ITEM KERANJANG */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.item_id} className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <span className="font-black text-sm">{item.quantity}x</span>
                    <span className="text-sm font-bold uppercase text-gray-700 leading-tight">{item.product_name}</span>
                  </div>
                  <span className="font-mono font-black text-sm whitespace-nowrap">
                    Rp {new Intl.NumberFormat('id-ID').format(item.product_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* RINCIAN HARGA */}
            <div className="border-t-4 border-black pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subtotal Produk</span>
                <span className="font-mono font-bold text-sm">Rp {new Intl.NumberFormat('id-ID').format(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Ongkos Kirim {selectedCourier ? `(${selectedCourier.company})` : ''}
                </span>
                <span className={`font-mono text-sm ${shippingCost === 0 ? "font-bold text-gray-400" : "font-black"}`}>
                  {shippingCost === 0 ? '---' : `Rp ${new Intl.NumberFormat('id-ID').format(shippingCost)}`}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="border-t-4 border-black mt-4 pt-4 flex justify-between items-end">
              <span className="text-sm font-black text-black uppercase tracking-widest">Total Bayar</span>
              <span className="text-2xl font-mono font-black text-black">
                Rp {new Intl.NumberFormat('id-ID').format(calculateSubtotal() + shippingCost)}
              </span>
            </div>

            {/* TOMBOL BAYAR */}
            <button
              onClick={handlePayment}
              disabled={!defaultAddress || shippingCost === 0 || loading}
              className={`w-full mt-8 py-5 text-sm font-black uppercase tracking-widest transition-all border-4 border-black ${
                (!defaultAddress || shippingCost === 0 || loading)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                : 'bg-black text-white hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
