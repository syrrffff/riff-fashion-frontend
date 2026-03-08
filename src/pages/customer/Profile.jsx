import React from 'react';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Profile() {

  // 1. STATE UNTUK PROFIL & PASSWORD TOGGLE
  const [user, setUser] = useState({ name: '', email: '', password: '', google_id: null });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. STATE UNTUK ALAMAT (CRUD)
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    id: null,
    recipient_name: '',
    phone_number: '',
    full_address: '',
    city_id: '',
    postal_code: '',
    is_default: false
  });

  // 3. STATE UNTUK PENCARIAN AREA BITESHIP
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 4. FETCH DATA AWAL (User & Addresses)
  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      setUser({
        name: userRes.data.name || '',
        email: userRes.data.email || '',
        password: '',
        google_id: userRes.data.google_id || null
      });

      const addressRes = await api.get('/user-addresses');
      setAddresses(addressRes.data.data || addressRes.data);
    } catch (error) {
      console.error("Gagal memuat data profil:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  // 5. EFFECT UNTUK AUTOCOMPLETE PENCARIAN BITESHIP
  useEffect(() => {
    // Tambahkan syarat: HANYA mencari jika city_id BELUM TERPILIH
    if (searchKeyword.length >= 3 && !addressForm.city_id) {
      const fetchAreas = async () => {
        setIsSearching(true);
        try {
          const res = await api.get(`/areas?search=${searchKeyword}`);
          setSearchResults(res.data.areas || res.data.data || res.data);
        } catch (error) {
          console.error("Gagal mencari area:", error);
        } finally {
          setIsSearching(false);
        }
      };

      const timeoutId = setTimeout(fetchAreas, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchKeyword, addressForm.city_id]); // Jangan lupa tambahkan addressForm.city_id di sini

  // HANDLER SAAT AREA BITESHIP DIPILIH
  const handleSelectArea = (area) => {
    setAddressForm({
      ...addressForm,
      city_id: area.id,
      // Opsional: Jika Anda ingin otomatis mengisi kode pos dari data Biteship
      // postal_code: area.postal_code || addressForm.postal_code
    });
    setSearchKeyword(area.name); // Tampilkan nama area yang dipilih di input
    setSearchResults([]); // Tutup dropdown
  };

  // 6. HANDLER PROFIL
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const payload = { name: user.name };
      if (!user.google_id) payload.email = user.email;
      if (user.password.trim() !== '') payload.password = user.password;

      await api.put('/user/profile', payload);
      window.dispatchEvent(new Event('profileUpdated'));
      alert("Profil berhasil diperbarui!");
      setUser(prev => ({ ...prev, password: '' }));
      setShowPassword(false);
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 7. HANDLER CRUD ALAMAT
  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

    const openAddAddress = () => {
    // Tambahkan original_is_default: false
    setAddressForm({ id: null, recipient_name: '', phone_number: '', full_address: '', city_id: '', postal_code: '', is_default: false, original_is_default: false });
    setSearchKeyword('');
    setShowAddressForm(true);
  };

  const openEditAddress = (address) => {
    // Titipkan status aslinya ke dalam state
    setAddressForm({ ...address, original_is_default: address.is_default });
    setSearchKeyword('');
    setShowAddressForm(true);
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.city_id) {
      alert("Silakan cari dan pilih Kecamatan / Kota dari daftar Biteship!");
      return;
    }

    setIsSavingAddress(true);
    try {
      if (addressForm.id) {
        await api.put(`/user-addresses/${addressForm.id}`, addressForm);
        alert("Alamat berhasil diperbarui!");
      } else {
        await api.post('/user-addresses', addressForm);
        alert("Alamat baru berhasil ditambahkan!");
      }
      setShowAddressForm(false);
      fetchData();
    } catch (error) {
      console.error("Gagal menyimpan alamat:", error);
      alert("Terjadi kesalahan saat menyimpan alamat.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Yakin ingin menghapus alamat ini?")) return;
    try {
      await api.delete(`/user-addresses/${id}`);
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus alamat:", error);
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      await api.put(`/user-addresses/${id}/default`);
      fetchData();
    } catch (error) {
      console.error("Gagal mengubah alamat utama:", error);
    }
  };


  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen">

      <div className="border-b-8 border-black pb-6 mb-12">
        <h1 className="text-5xl md:text-6xl font-black text-black uppercase tracking-tighter italic">
          Pengaturan <br/>Akun.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* KOLOM KIRI: INFO PROFIL */}
        <div className="lg:col-span-1">
          <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24">
            <h2 className="text-xl font-black text-black mb-6 uppercase tracking-widest border-b-4 border-black pb-2">Data Pribadi</h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className="w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Email {user.google_id && '(Terkunci dari Google)'}
                </label>
                <input type="email" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} readOnly={!!user.google_id} className={`w-full px-4 py-3 border-2 focus:outline-none transition-all ${user.google_id ? 'border-gray-300 bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-black bg-white text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`} required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ganti Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                    onChange={(e) => setUser({...user, password: e.target.value})}
                    placeholder="Kosongkan jika tidak diubah"
                    className="w-full px-4 py-3 pr-20 border-2 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-sm placeholder:font-normal"
                  />
                  {user.password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                    >
                      {showPassword ? "Tutup" : "Lihat"}
                    </button>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isUpdatingProfile} className="w-full mt-6 bg-black text-white px-6 py-4 text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black border-4 border-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: DAFTAR ALAMAT */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-8">
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Buku Alamat</h2>
            {!showAddressForm && (
              <button onClick={openAddAddress} className="border-4 border-black bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                + Tambah Alamat
              </button>
            )}
          </div>

          {showAddressForm ? (
            <div className="border-4 border-black p-6 md:p-8 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
              <h3 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-2">
                {addressForm.id ? 'Edit Alamat' : 'Alamat Baru'}
              </h3>
              <form onSubmit={saveAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nama Penerima</label>
                    <input type="text" name="recipient_name" value={addressForm.recipient_name} onChange={handleAddressChange} required className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">No. HP Penerima</label>
                    <input type="text" name="phone_number" value={addressForm.phone_number} onChange={handleAddressChange} required className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Alamat Lengkap (Jalan, RT/RW, Patokan)</label>
                  <textarea name="full_address" rows="3" value={addressForm.full_address} onChange={handleAddressChange} required className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></textarea>
                </div>

                {/* --- AREA PENCARIAN BITESHIP BRUTALIST --- */}
                <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
                    Cari Kecamatan / Kota (Biteship)
                  </label>

                  {addressForm.id && !searchKeyword && (
                    <div className="mb-3 text-xs font-bold text-yellow-600 bg-yellow-100 border-2 border-yellow-500 p-2">
                      City ID Saat Ini: {addressForm.city_id} <br/>
                      (Ketik area baru di bawah jika ingin mengubah lokasi)
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ketik minimal 3 huruf..."
                      className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-sm uppercase"
                      value={searchKeyword}
                      onChange={e => {
                        setSearchKeyword(e.target.value);
                        // Kunci utamanya di sini: Jika user mengetik/mengubah teks, reset city_id
                        if (addressForm.city_id) {
                          setAddressForm({ ...addressForm, city_id: '' });
                        }
                      }}
                    />

                    {isSearching && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">
                        Mencari...
                      </span>
                    )}

                    {/* HASIL PENCARIAN (DROPDOWN) */}
                    {searchResults.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border-4 border-black mt-2 max-h-60 overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {searchResults.map((area) => (
                          <li
                            key={area.id}
                            onClick={() => handleSelectArea(area)}
                            className="p-4 hover:bg-black hover:text-white cursor-pointer border-b-2 border-black last:border-b-0 transition-colors"
                          >
                            <span className="font-bold text-sm uppercase">{area.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* -------------------------------------- */}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Kode Pos</label>
                  <input type="text" name="postal_code" value={addressForm.postal_code} onChange={handleAddressChange} required className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                </div>

                  {/* --- CHECKBOX ALAMAT UTAMA DENGAN PENGAMAN --- */}
                <div className="flex items-center gap-2 mt-4 p-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={addressForm.is_default}
                    onChange={(e) => {
                      // Jika aslinya memang alamat utama, tolak perubahan jadi false
                      if (addressForm.original_is_default == 1 && !e.target.checked) {
                        alert("Alamat utama tidak bisa dihapus centangnya. Silakan jadikan alamat lain sebagai utama terlebih dahulu.");
                        return;
                      }
                      setAddressForm({...addressForm, is_default: e.target.checked});
                    }}
                    className={`w-5 h-5 border-2 border-black accent-black ${addressForm.original_is_default == 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  />
                  <label
                    htmlFor="is_default"
                    onClick={(e) => {
                      // Mencegah label diklik jika ini adalah alamat utama
                      if (addressForm.original_is_default == 1) {
                        e.preventDefault();
                        alert("Alamat utama tidak bisa dihapus centangnya. Silakan jadikan alamat lain sebagai utama terlebih dahulu.");
                      }
                    }}
                    className={`text-sm font-bold uppercase ${addressForm.original_is_default == 1 ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                  >
                    Jadikan Alamat Utama
                  </label>
                </div>

                <div className="flex gap-4 pt-6 mt-6 border-t-2 border-gray-200">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-3 border-4 border-black bg-white text-black font-black uppercase text-sm tracking-widest hover:bg-gray-100 transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={isSavingAddress} className="flex-1 px-6 py-3 border-4 border-black bg-black text-white font-black uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(209,213,219,1)]">
                    {isSavingAddress ? 'Menyimpan...' : 'Simpan Alamat'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* LIST ALAMAT (READ & DELETE) */
            <div className="space-y-6">
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <div key={address.id} className={`border-4 border-black p-6 transition-all ${address.is_default ? 'bg-gray-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black uppercase">{address.recipient_name}</h3>
                        {/* Pakai ternary agar angka 0 tidak bocor ke layar */}
                          {address.is_default == 1 ? (
                            <span className="bg-black text-white text-[10px] px-2 py-1 font-black uppercase tracking-widest">Utama</span>
                          ) : null}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditAddress(address)} className="text-xs font-black uppercase tracking-widest border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">Edit</button>
                        <button onClick={() => deleteAddress(address.id)} className="text-xs font-black uppercase tracking-widest border-2 border-red-500 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white transition-colors">Hapus</button>
                      </div>
                    </div>

                    <p className="text-sm font-bold font-mono mb-2">{address.phone_number}</p>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed mb-1">{address.full_address}</p>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">City ID: {address.city_id}</p>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Kode Pos: {address.postal_code}</p>

                    {address.is_default == 0 ? (
                      <button onClick={() => setDefaultAddress(address.id)} className="mt-4 text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
                        Jadikan Alamat Utama
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="border-4 border-black border-dashed p-10 text-center bg-gray-50">
                  <p className="text-gray-500 font-bold uppercase tracking-widest mb-4">Belum ada alamat tersimpan.</p>
                  <button onClick={openAddAddress} className="border-4 border-black bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                    Tambah Alamat Pertama
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
