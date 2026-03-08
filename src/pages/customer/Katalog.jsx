import React from 'react';
import { useEffect } from 'react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function ProductsCus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // 1. Mengambil daftar Kategori untuk Dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/home-data');
        setCategories(res.data.data);
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      }
    };
    fetchCategories();
  }, []);

  // 2. Mengambil data Produk berdasarkan Halaman & Filter
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let endpoint = `/public-products?page=${currentPage}`;
        if (categoryFilter) {
          endpoint += `&category=${categoryFilter}`;
        }

        const res = await api.get(endpoint);

        setProducts(res.data.data.data);
        setCurrentPage(res.data.data.current_page);
        setLastPage(res.data.data.last_page);

      } catch (error) {
        console.error("Gagal memuat produk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, categoryFilter]);

  // 3. Fungsi saat Dropdown Kategori diubah
  const handleCategoryChange = (newCategory) => {
    setCurrentPage(1);
    if (newCategory) {
      setSearchParams({ category: newCategory });
    } else {
      setSearchParams({});
    }
  };

  // Komponen Kartu Produk (Diarahkan ke /customer/product/...)
  const ProductCard = ({ product }) => (
    <Link to={`/Detail/${product.slug}`} className="group block border-4 border-black bg-white hover:-translate-y-2 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
      <div className="relative aspect-[3/4] border-b-4 border-black bg-gray-100 overflow-hidden">
        {product.image_url && (
          <img
            src={
              product.image_url.startsWith('http')
              ? product.image_url
              : `${import.meta.env.VITE_API_BASE_URL}/storage/${product.image_url}`
            }
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500 relative z-10"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="absolute top-4 left-4 z-20 bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] group-hover:bg-white group-hover:text-black transition-colors">
          Pilih Varian
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between bg-white">
        <div>
          <h3 className="font-black uppercase text-lg leading-tight mb-1 text-black">{product.name}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category?.name || 'Koleksi Riff'}</p>
        </div>
        <div className="mt-4 flex justify-between items-end border-t-2 border-gray-100 pt-3">
          <p className="font-mono font-black text-xl text-black">
            Rp {product.price ? new Intl.NumberFormat('id-ID').format(product.price) : '0'}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 max-w-7xl mx-auto">

      {/* BREADCRUMB */}
      <div className="mb-6 font-black uppercase tracking-widest text-xs flex gap-2 text-gray-400">
        <Link to="/Home" className="hover:text-black transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-black">Katalog</span>
      </div>

      {/* HEADER & FILTER DROPDOWN */}
      <div className="border-b-8 border-black pb-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
            {categoryFilter ? `Kategori: ${categoryFilter.replace('-', ' ')}` : 'Semua Koleksi'}
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
            Pilih gaya terbaikmu hari ini.
          </p>
        </div>

        {/* DROPDOWN FILTER (BRUTALIST STYLE) */}
        <div className="relative inline-block w-full md:w-auto mt-4 md:mt-0">
          <select
            value={categoryFilter || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="appearance-none w-full md:w-64 border-4 border-black bg-white text-black px-4 py-3 pr-10 font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all cursor-pointer outline-none focus:bg-gray-100"
          >
            <option value="" className="font-bold">SEMUA KOLEKSI</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug} className="font-bold uppercase">
                {cat.name}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* GRID PRODUK */}
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="text-4xl font-black uppercase tracking-widest animate-pulse border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            Menyusun Katalog...
          </div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* KONTROL PAGINATION */}
          {lastPage > 1 && (
            <div className="flex justify-center items-center gap-4 border-t-4 border-black pt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-6 py-3 border-4 border-black font-black uppercase text-sm tracking-widest transition-all ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'}`}
              >
                &larr; Prev
              </button>

              <span className="font-mono font-black text-xl px-4">
                {currentPage} / {lastPage}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                disabled={currentPage === lastPage}
                className={`px-6 py-3 border-4 border-black font-black uppercase text-sm tracking-widest transition-all ${currentPage === lastPage ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'}`}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-gray-400">Katalog Kosong</h2>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Belum ada produk untuk kategori ini.</p>
          <button onClick={() => handleCategoryChange('')} className="mt-8 bg-black text-white px-8 py-4 font-black uppercase text-sm tracking-widest hover:bg-gray-800 transition-colors">
            Lihat Semua Koleksi
          </button>
        </div>
      )}

    </div>
  );
}
