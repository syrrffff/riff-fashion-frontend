import { useState, useEffect, useCallback, useRef } from "react";
import {
  Link,
  Outlet,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import api from "../api/axios";

// Helper Image
const getImageUrl = (path) => {
  if (!path) return null;
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const cleanPath = path.replace(/^\/+/, '');
  return `${baseUrl}/storage/${cleanPath}`;
};

export default function CustomerLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // =====================================
  // STATE: LIVE SEARCH
  // =====================================
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Ref untuk mendeteksi klik di luar kotak pencarian
  const searchRef = useRef(null);

  // 1. Fungsi Cart
  const fetchCartCount = useCallback(async () => {
    try {
      const res = await api.get("/cart");
      const total = res.data.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(total);
    } catch (error) {
      console.error("Gagal mengambil data keranjang:", error);
    }
  }, []);

  // 2. Fungsi User
  const fetchUserData = useCallback(async () => {
    try {
      const userRes = await api.get("/user");
      setUser(userRes.data);
    } catch (error) {
      console.error("Gagal mengambil data user terbaru:", error);
    }
  }, []);

  // 3. Init & Auth Check
  useEffect(() => {
    let isMounted = true;

    const fetchUserAndCart = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        await fetchUserData();
        await fetchCartCount();
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("auth_token");
          if (isMounted) setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserAndCart();

    window.addEventListener("cartUpdated", fetchCartCount);
    window.addEventListener("profileUpdated", fetchUserData);

    return () => {
      isMounted = false;
      window.removeEventListener("cartUpdated", fetchCartCount);
      window.removeEventListener("profileUpdated", fetchUserData);
    };
  }, []);

  // =====================================
  // LOGIKA: LIVE SEARCH (Debounce)
  // =====================================
  useEffect(() => {
    // Jika input kosong, hapus hasil pencarian
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Set delay 500ms agar API tidak di-spam setiap ngetik 1 huruf
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/search?search=${searchQuery}`);
        // Asumsi API mengembalikan JSON dengan key 'data'
        const payload = res.data?.data || res.data || [];
        setSearchResults(Array.isArray(payload) ? payload : []);
        setShowSearchDropdown(true);
      } catch (error) {
        console.error("Gagal mencari produk:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Tutup dropdown search kalau user klik di luar area search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tutup dropdown saat berpindah rute halaman
  useEffect(() => {
    setShowSearchDropdown(false);
    setSearchQuery("");
  }, [location.pathname]);

  // =====================================
  // HANDLERS
  // =====================================
  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("auth_token");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  const goToProductDetail = (slug) => {
    setShowSearchDropdown(false);
    setSearchQuery(""); // Bersihkan search setelah diklik
    // Mengarahkan langsung ke halaman katalog / slug
    navigate(`/detail/${slug}`);
  };


  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-black uppercase tracking-tighter">
        <div className="animate-bounce mb-2 text-2xl">Riff.</div>
        <div className="text-[10px] text-gray-500">Memuat Sesi...</div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex justify-between items-center h-14">

            {/* Kiri: Hamburger Menu (Mobile) & Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-black hover:scale-110 transition-transform md:hidden"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <Link to="/" className="text-3xl md:text-4xl font-black tracking-tighter text-black uppercase hover:italic transition-all">
                Riff.
              </Link>
            </div>

            {/* Tengah: Search Bar & Menu Navigasi Desktop */}
            <div className="flex-1 flex justify-center items-center px-4 md:px-8">

              {/* Menu Text (Hanya terlihat di layar lebar) */}
              <div className="hidden lg:flex items-center space-x-8 font-black text-xs uppercase tracking-widest mr-8">
                <Link to="/" className="hover:underline decoration-2 underline-offset-4">Beranda</Link>
                <Link to="/katalog" className="hover:underline decoration-2 underline-offset-4">Koleksi</Link>
                <Link to="/AboutOurCompany" className="hover:underline decoration-2 underline-offset-4">Tentang</Link>
              </div>

              {/* SEARCH BAR (LIVE) */}
              <div className="relative w-full max-w-sm hidden md:block" ref={searchRef}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="CARI PRODUK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if(searchQuery) setShowSearchDropdown(true) }}
                    className="w-full bg-gray-100 border-2 border-transparent focus:border-black focus:bg-white text-xs font-black uppercase tracking-widest py-3 px-4 pr-10 transition-all outline-none"
                  />
                  <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* SEARCH RESULTS DROPDOWN (Melayang) */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[60vh] overflow-y-auto z-50 flex flex-col">
                    {isSearching ? (
                      <div className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">
                        Mencari...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => goToProductDetail(p.slug)}
                          className="w-full flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-100 transition-colors text-left group"
                        >
                          <div className="w-12 h-12 bg-black border border-gray-300 flex-shrink-0 overflow-hidden">
                            {p.image_url ? (
                              <img src={p.image_url.startsWith("http")
                                ? p.image_url
                                : `${import.meta.env.VITE_STORAGE_URL}/storage/${p.image_url}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                              <div className="w-full h-full bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-xs font-black uppercase tracking-widest text-black truncate">{p.name}</h4>
                            <p className="text-[10px] font-bold text-gray-500 mt-0.5">Rp {new Intl.NumberFormat('id-ID').format(p.price)}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Tidak ada hasil.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: Ikon Keranjang & User */}
            <div className="flex items-center space-x-3 md:space-x-6">

              {/* Ikon Kaca Pembesar Mobile (Bisa juga dibikin fungsi buka tutup search bar nantinya, tapi skrg kita pakaikan link dulu / disabled) */}
               <button className="md:hidden p-2 text-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </button>

              <Link to="/cart" className="relative p-2 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute 0 right-0 bg-black text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-1 border-2 border-black px-3 py-1.5 bg-black text-white hover:bg-white hover:text-black transition-colors"
                >
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>

                {isUserDropdownOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)}></div>
                )}

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 font-black text-[10px] uppercase flex flex-col">
                    <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="px-4 py-3 hover:bg-black hover:text-white transition-colors border-b border-gray-100">
                      Akun Saya
                    </Link>
                    <Link to="/orders" onClick={() => setIsUserDropdownOpen(false)} className="px-4 py-3 hover:bg-black hover:text-white transition-colors border-b border-gray-100">
                      Pesanan
                    </Link>
                    <button onClick={handleLogout} className="text-left px-4 py-3 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================== */}
        {/* MOBILE MENU DROPDOWN */}
        {/* ===================================== */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t-2 border-black border-b-4 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] absolute w-full left-0 flex flex-col z-40">
            {/* SEARCH BAR MOBILE (Muncul di dalam menu saat dibuka) */}
            <div className="p-4 border-b-2 border-gray-100 bg-gray-50 relative" ref={searchRef}>
               <div className="relative">
                  <input
                    type="text"
                    placeholder="CARI PRODUK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-black text-xs font-black uppercase tracking-widest py-3 px-4 pr-10 outline-none"
                  />
                </div>
                {/* Search Result Mobile */}
                {searchQuery && (
                  <div className="absolute left-4 right-4 top-16 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Mencari...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((p) => (
                        <button key={p.id} onClick={() => { goToProductDetail(p.slug); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 border-b border-gray-100 text-left">
                          <div className="w-10 h-10 bg-black border border-gray-300 flex-shrink-0"><img src={getImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" /></div>
                          <div>
                            <h4 className="text-[10px] font-black uppercase text-black truncate">{p.name}</h4>
                            <p className="text-[10px] font-bold text-gray-500">Rp {new Intl.NumberFormat('id-ID').format(p.price)}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Tidak ada hasil.</div>
                    )}
                  </div>
                )}
            </div>

            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b border-gray-100 hover:bg-black hover:text-white font-black text-sm uppercase tracking-widest">
              Beranda
            </Link>
            <Link to="/katalog" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b border-gray-100 hover:bg-black hover:text-white font-black text-sm uppercase tracking-widest">
              Koleksi
            </Link>
            <Link to="/AboutOurCompany" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b border-gray-100 hover:bg-black hover:text-white font-black text-sm uppercase tracking-widest">
              Tentang Kami
            </Link>
          </div>
        )}
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-grow bg-white">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Riff.</h2>
            <div className="space-y-3 text-gray-400 text-sm font-bold">
              <p className="text-white">Kecamatan Cileunyi, Kab. Bandung<br />Jawa Barat, Indonesia 40622</p>
              <a href="https://instagram.com/syrrffff" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer block">Instagram</a>
              <p className="hover:text-white transition-colors cursor-pointer">hello@riff-fashion.com</p>
              <p className="font-mono text-white">+62 812-3456-7890</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">Useful Links</h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li><Link to="/" className="hover:text-white hover:underline decoration-2 underline-offset-4">Homepage</Link></li>
              <li><Link to="/AboutOurCompany" className="hover:text-white hover:underline decoration-2 underline-offset-4">About Us</Link></li>
              <li><Link to="/katalog" className="hover:text-white hover:underline decoration-2 underline-offset-4">Our Products</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">Shopping</h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li><Link to="/katalog" className="hover:text-white hover:underline decoration-2 underline-offset-4">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">Help & Info</h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li><Link to="/orders" className="hover:text-white hover:underline decoration-2 underline-offset-4">Lacak Pesanan</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline decoration-2 underline-offset-4">Cara Pembelian</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline decoration-2 underline-offset-4">Pengiriman & Retur</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 border-t-2 border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            &copy; {new Date().getFullYear()} RIFF. FASHION. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
