
import { useEffect } from 'react';
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR PUBLIK (Belum Login) */}
      <nav className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          {/* 1. Tombol Hamburger Mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black hover:scale-110 transition-transform"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* 2. LOGO */}
          <Link
            to="/"
            className="text-4xl font-black tracking-tighter text-black uppercase hover:italic transition-all"
          >
            Riff.
          </Link>

          {/* 3. Menu Utama (Desktop) */}
          <div className="hidden md:flex space-x-8 font-black text-sm uppercase tracking-widest">
            <Link
              to="/"
              className="hover:underline decoration-4 underline-offset-4"
            >
              Beranda
            </Link>
            <Link
              to="/products"
              className="hover:underline decoration-4 underline-offset-4"
            >
              Koleksi
            </Link>
            <a
              href="#produk-terbaru"
              className="font-black uppercase tracking-widest hover:text-gray-500 cursor-pointer"
            >
              Produk Terbaru
            </a>
            <Link
              to="/About"
              className="hover:underline decoration-4 underline-offset-4"
            >
              Tentang Kami
            </Link>
          </div>

          {/* 4. Bagian Kanan (Cart Icon Teaser, Login / Daftar) */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Ikon Keranjang (Diarahkan ke login karena belum masuk) */}
            <Link
              to="/login"
              className="relative p-2 border-2 border-transparent hover:border-black transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hidden sm:block"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </Link>

            <Link
              to="/login"
              className="text-sm font-black uppercase tracking-widest hover:underline decoration-4 underline-offset-4"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="border-4 border-black px-4 py-2 bg-black text-white hover:bg-white hover:text-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-widest"
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* 5. Dropdown Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t-4 border-black border-b-4 shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] absolute w-full left-0 font-black text-lg uppercase tracking-widest flex flex-col">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-4 border-b-2 border-gray-100 hover:bg-black hover:text-white"
            >
              Beranda
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-4 border-b-2 border-gray-100 hover:bg-black hover:text-white"
            >
              Koleksi
            </Link>
            <a
              href="#produk-terbaru"
              className="p-4 border-b-2 border-gray-100 hover:bg-black hover:text-white"
            >
              Produk Terbaru
            </a>
            <Link
              to="/About"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-4 border-b-2 border-gray-100 hover:bg-black hover:text-white"
            >
              Tentang Kami
            </Link>
          </div>
        )}
      </nav>

      {/* Area Konten Dinamis */}
      <main className="flex-grow bg-white">
        <Outlet />
      </main>

      {/* FOOTER (Sama Persis dengan CustomerLayout) */}
      <footer className="bg-black text-white border-t-8 border-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Kolom 1: Informasi Toko */}
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
              Riff.
            </h2>
            <div className="space-y-3 text-gray-400 text-sm font-bold">
              <p className="text-white">
                Kecamatan Cileunyi, Kab. Bandung
                <br />
                Jawa Barat, Indonesia 40622
              </p>
              <a
                href="https://instagram.com/syrrffff"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors cursor-pointer block"
              >
                Instagram
              </a>
              <p className="hover:text-white transition-colors cursor-pointer">
                hello@riff-fashion.com
              </p>
              <p className="font-mono text-white">+62 812-3456-7890</p>
            </div>
          </div>

          {/* Kolom 2: Useful Links */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">
              Useful Links
            </h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li>
                <Link
                  to="/"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Homepage
                </Link>
              </li>
              <li>
                <Link
                  to="/About"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Our Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Shopping & Categories */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">
              Shopping
            </h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li>
                <Link
                  to="/products"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Pria
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Wanita
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Aksesoris
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Help & Information */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-800 pb-2 mb-6 text-white">
              Help & Info
            </h3>
            <ul className="space-y-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <li>
                <Link
                  to="FAQ"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link
                  to="FAQ"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Cara Pembelian
                </Link>
              </li>
              <li>
                <Link
                  to="FAQ"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Pengiriman & Retur
                </Link>
              </li>
              <li>
                <Link
                  to="FAQ"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Panduan Ukuran
                </Link>
              </li>
              <li>
                <Link
                  to="FAQ"
                  className="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 border-t-2 border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            &copy; {new Date().getFullYear()} RIFF. FASHION. ALL RIGHTS
            RESERVED.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link to="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
