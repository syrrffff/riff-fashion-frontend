import { useEffect, useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";


export default function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();


  // =====================================
  // STATE: LIVE SEARCH
  // =====================================
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Ref untuk mendeteksi klik di luar kotak pencarian
  const searchRef = useRef(null);

  // =====================================
  // LOGIKA: LIVE SEARCH (Debounce)
  // =====================================
  useEffect(() => {
    // Jika input kosong, bersihkan dropdown
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Set delay 500ms agar API tidak di-spam saat mengetik
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Menggunakan endpoint /search sesuai instruksi Anda
        const res = await api.get(`/search?search=${searchQuery}`);

        // Amankan data jika API menggunakan pagination (menembus 2 lapis .data)
        const payload = res.data?.data?.data || res.data?.data || res.data || [];
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

  // Tutup dropdown jika user klik di area luar pencarian
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tutup dropdown dan mobile menu saat berpindah rute (pindah halaman)
  useEffect(() => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0); // Scroll ke atas saat pindah halaman
  }, [location.pathname]);

  // Handler klik produk dari hasil pencarian
  const goToProductDetail = (slug) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    setIsMobileMenuOpen(false);
    navigate(`/product/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR PUBLIK (Belum Login) */}
      <nav className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-3">

          {/* 1. Kiri: Hamburger Mobile & Logo */}
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

          {/* 2. Tengah: Menu Utama (Desktop) & Search Bar */}
          <div className="flex-1 flex justify-center items-center px-4 md:px-8">

            {/* Menu Teks (Hanya Desktop) */}
            <div className="hidden lg:flex items-center space-x-8 font-black text-xs uppercase tracking-widest mr-8">
              <Link to="/" className="hover:underline decoration-2 underline-offset-4">Beranda</Link>
              <Link to="/products" className="hover:underline decoration-2 underline-offset-4">Koleksi</Link>
              <Link to="/About" className="hover:underline decoration-2 underline-offset-4">Tentang</Link>
            </div>

            {/* SEARCH BAR DESKTOP (Live Search) */}
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

              {/* DROPDOWN HASIL SEARCH DESKTOP */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[60vh] overflow-y-auto z-50 flex flex-col custom-scrollbar">
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
                        <div className="w-12 h-12 bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                          {p.image_url ? (
                            <img
                               src={p.image_url.startsWith("http")
                               ? p.image_url
                               : `${import.meta.env.VITE_STORAGE_URL}/storage/${p.image_url}`}
                               alt={p.name}
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
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

          {/* 3. Kanan: Cart Icon (Link ke Login), Login / Daftar */}
          <div className="flex items-center space-x-3 md:space-x-6">

            {/* Tombol Kaca Pembesar Mobile (Buka Menu Mobile untuk Search) */}
            <button className="md:hidden p-2 text-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>

            <Link
              to="/login"
              className="relative p-2 hover:bg-gray-100 transition-colors hidden sm:block"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>

            <Link to="/login" className="hidden sm:block text-xs font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Login
            </Link>

            <Link to="/register" className="border-2 border-black px-4 py-2 bg-black text-white hover:bg-white hover:text-black transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest">
              Daftar
            </Link>
          </div>
        </div>

        {/* 4. Dropdown Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t-2 border-black border-b-4 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] absolute w-full left-0 flex flex-col z-40">

            {/* SEARCH BAR MOBILE */}
            <div className="p-4 border-b-2 border-gray-100 bg-gray-50 relative" ref={searchRef}>
               <div className="relative">
                  <input
                    type="text"
                    placeholder="CARI PRODUK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-black text-xs font-black uppercase tracking-widest py-3 px-4 pr-10 outline-none"
                  />
                  <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* DROPDOWN HASIL SEARCH MOBILE */}
                {searchQuery && (
                  <div className="absolute left-4 right-4 top-16 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto z-50 flex flex-col custom-scrollbar">
                    {isSearching ? (
                      <div className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Mencari...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((p) => (
                        <button key={p.id} onClick={() => goToProductDetail(p.slug)} className="w-full flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-100 text-left">
                          <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex-shrink-0">
                            {p.image_url ? (
                                <img src={p.image_url.startsWith("http") ? p.image_url : `${import.meta.env.VITE_BASE_URL}/storage/${p.image_url}`} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
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

            <Link to="/" className="p-4 border-b border-gray-100 hover:bg-black hover:text-white font-black text-sm uppercase tracking-widest">Beranda</Link>
            <Link to="/products" className="p-4 border-b border-gray-100 hover:bg-black hover:text-white font-black text-sm uppercase tracking-widest">Koleksi</Link>
            <Link to="/About" className="p-4 hover:bg-black hover:text-white font-black text-sm uppercase tracking-widest">Tentang Kami</Link>
          </div>
        )}
      </nav>

      {/* Area Konten Dinamis */}
      <main className="flex-grow bg-white">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white border-t-8 border-gray-900 pt-16 pb-8">
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
              <li><Link to="/" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Homepage</Link></li>
              <li><Link to="/About" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">About Us</Link></li>
              <li><Link to="/products" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Our Products</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">Shopping</h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li><Link to="/products" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">New Arrivals</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Pria</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Wanita</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Aksesoris</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">Help & Info</h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li><Link to="/FAQ" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Lacak Pesanan</Link></li>
              <li><Link to="/FAQ" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Cara Pembelian</Link></li>
              <li><Link to="/FAQ" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Pengiriman & Retur</Link></li>
              <li><Link to="/FAQ" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Panduan Ukuran</Link></li>
              <li><Link to="/FAQ" className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">FAQ</Link></li>
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
