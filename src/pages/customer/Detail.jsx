import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

// Helper function untuk memformat URL gambar agar lebih rapi
const getFullImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${import.meta.env.VITE_STORAGE_URL}/storage/${path}`;
};

export default function ProductDetailCus() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // State interaksi user
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // STATE BARU: Menyimpan gambar mana yang sedang ditampilkan di layar utama
  const [activeImage, setActiveImage] = useState(null);

  // State khusus Customer (Loading saat input keranjang)
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/public-products/${slug}`);
        const productData = res.data.data;
        setProduct(productData);

        // Jadikan gambar utama (cover) sebagai gambar yang pertama kali aktif
        if (productData.image_url) {
          setActiveImage(productData.image_url);
        }
      } catch (error) {
        console.error("Gagal memuat detail produk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // FUNGSI UTAMA CUSTOMER: ADD TO CART AKTIF!
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Pilih ukuran dan warna (varian) terlebih dahulu!");
      return;
    }

    // Double check sebelum kirim API, pastikan stok tidak dimanipulasi
    if (quantity > selectedVariant.stock) {
      alert(`Mohon maaf, stok untuk varian ini hanya tersisa ${selectedVariant.stock} pcs.`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await api.post('/addCart', {
        product_id: product.id,
        product_variant_id: selectedVariant.id,
        quantity: quantity
      });

      alert("Berhasil ditambahkan ke keranjang Riff!");

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Gagal menambah ke keranjang:", error);
      alert("Terjadi kesalahan jaringan. Gagal menambahkan produk.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // LOGIKA BARU: Handler Perubahan Kuantitas agar tidak tembus batas stok
  const handleIncreaseQuantity = () => {
    if (!selectedVariant) {
      alert("Pilih varian produk terlebih dahulu untuk melihat stok.");
      return;
    }
    if (quantity < selectedVariant.stock) {
      setQuantity(q => q + 1);
    } else {
      alert(`Maksimal pembelian untuk varian ini adalah ${selectedVariant.stock} pcs.`);
    }
  };

  const handleDecreaseQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  // LOGIKA BARU: Handler Pemilihan Varian (Reset quantity jika melebihi stok varian baru)
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    // Jika quantity saat ini lebih besar dari stok varian yang baru dipilih, turunkan quantity
    if (quantity > variant.stock) {
      setQuantity(variant.stock > 0 ? variant.stock : 1);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-4xl font-black uppercase tracking-widest animate-pulse border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        Memuat Produk...
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
      <div className="text-4xl font-black uppercase tracking-widest text-red-500 border-4 border-red-500 p-6 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
        Produk Tidak Ditemukan
      </div>
      <button onClick={() => navigate(-1)} className="font-black uppercase text-sm flex items-center gap-2 hover:underline">
        ← Kembali
      </button>
    </div>
  );

  // Tarik data 'images' dari object product
  const galleryImages = product.images || [];
  const activeImageUrl = getFullImageUrl(activeImage);

  // Cek apakah SEMUA stok benar-benar 0 (Sold Out Total)
  const isTotallySoldOut = product.total_stock === 0;

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 max-w-7xl mx-auto">

      {/* MODAL ZOOM GAMBAR */}
      {isZoomed && activeImageUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <div className="absolute top-6 right-6">
            <button
              className="text-white border-2 border-white px-4 py-2 font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              Tutup [X]
            </button>
          </div>
          <img
            src={activeImageUrl}
            alt={product.name}
            className="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="mb-8 font-black uppercase tracking-widest text-xs flex gap-2 text-gray-400">
        <Link to="/Home" className="hover:text-black transition-colors">Beranda</Link>
        <span>/</span>
        <Link to="/katalog" className="hover:text-black transition-colors">Koleksi</Link>
        <span>/</span>
        <span className="text-black truncate max-w-[200px] md:max-w-none">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

        {/* SISI KIRI: AREA GAMBAR UTAMA & GALERI */}
        <div className="flex flex-col gap-4">

          {/* GAMBAR UTAMA */}
          <div
            className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gray-100 aspect-[3/4] relative overflow-hidden group cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
          >
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center relative z-10 transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* BADGE SOLD OUT BESAR JIKA SEMUA HABIS */}
            {isTotallySoldOut && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 -rotate-12 bg-red-600 text-white border-4 border-white shadow-2xl px-6 py-2 pointer-events-none">
                  <span className="font-black text-3xl md:text-5xl uppercase tracking-widest drop-shadow-md">HABIS TERJUAL</span>
               </div>
            )}
          </div>

          {/* GALERI THUMBNAILS */}
          {(product.image_url || galleryImages.length > 0) && (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 custom-scrollbar">
              {/* Thumbnail Gambar Utama (Cover) */}
              {product.image_url && (
                <button
                  onClick={() => setActiveImage(product.image_url)}
                  className={`flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 border-4 transition-all duration-200 overflow-hidden bg-gray-100 ${
                    activeImage === product.image_url
                      ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                      : 'border-gray-300 hover:border-black hover:-translate-y-1'
                  }`}
                >
                  <img src={getFullImageUrl(product.image_url)} alt="Cover" className="w-full h-full object-cover" />
                </button>
              )}

              {/* Thumbnail Gambar Galeri Lainnya */}
              {galleryImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImage(image.image_url)}
                  className={`flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 border-4 transition-all duration-200 overflow-hidden bg-gray-100 ${
                    activeImage === image.image_url
                      ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                      : 'border-gray-300 hover:border-black hover:-translate-y-1'
                  }`}
                >
                  <img src={getFullImageUrl(image.image_url)} alt={`Gallery ${image.id}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SISI KANAN: DETAIL & AKSI */}
        <div className="flex flex-col justify-center">

          <div className="border-b-4 border-black pb-6 mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-2 leading-none">
              {product.name}
            </h1>
            <p className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-6">
              {product.category?.name || 'Koleksi Riff'}
            </p>
            <p className="font-mono text-3xl md:text-4xl font-black">
              Rp {product.price ? new Intl.NumberFormat('id-ID').format(product.price) : '0'}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
               <h3 className="font-black uppercase text-sm tracking-widest">Pilih Varian (Ukuran & Warna)</h3>
               {selectedVariant && (
                 <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 uppercase tracking-widest border-2 border-gray-300">
                    Sisa Stok: {selectedVariant.stock}
                 </span>
               )}
            </div>

            {product.variants && product.variants.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => {
                  const isOutOfStock = variant.stock <= 0;
                  const isSelected = selectedVariant?.id === variant.id;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (!isOutOfStock) handleVariantSelect(variant);
                      }}
                      disabled={isOutOfStock}
                      className={`border-4 px-4 py-2 font-black uppercase text-sm tracking-widest transition-all relative overflow-hidden
                        ${isOutOfStock
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : isSelected
                              ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(209,213,219,1)] translate-y-1'
                              : 'border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'
                        }
                      `}
                    >
                      {/* Coretan melintang jika habis */}
                      {isOutOfStock && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[120%] h-0.5 bg-gray-300 rotate-12"></div>
                         </div>
                      )}

                      <span className="relative z-10">
                        {variant.size} - {variant.color}
                        {isOutOfStock && <span className="ml-2 text-[10px] text-red-500"> [HABIS]</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm font-bold text-red-500 uppercase">Varian belum tersedia untuk produk ini.</p>
            )}
          </div>

          <div className="mb-8">
            <h3 className="font-black uppercase text-sm tracking-widest mb-4">Kuantitas</h3>
            <div className="flex items-center gap-4">
              <div className={`flex items-center border-4 w-fit transition-colors ${isTotallySoldOut ? 'border-gray-300' : 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                <button
                  onClick={handleDecreaseQuantity}
                  disabled={isTotallySoldOut}
                  className="px-4 py-2 hover:bg-black hover:text-white transition-colors font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >−</button>
                <div className={`w-12 text-center font-mono font-black text-lg border-x-4 py-2 ${isTotallySoldOut ? 'border-gray-300 text-gray-400' : 'border-black'}`}>
                  {isTotallySoldOut ? '0' : quantity}
                </div>
                <button
                  onClick={handleIncreaseQuantity}
                  disabled={isTotallySoldOut}
                  className="px-4 py-2 hover:bg-black hover:text-white transition-colors font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >+</button>
              </div>
            </div>
          </div>

          {/* TOMBOL ADD TO CART */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isTotallySoldOut || !product.variants?.length}
            className={`w-full py-5 border-4 text-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              isAddingToCart || isTotallySoldOut || !product.variants?.length
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 translate-y-2 shadow-none'
                : 'bg-black text-white border-black hover:bg-white hover:text-black hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {isAddingToCart ? (
              <span className="animate-pulse">Menambahkan...</span>
            ) : isTotallySoldOut ? (
              <span className="text-gray-500 line-through">Habis Terjual</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Masukkan Keranjang
              </>
            )}
          </button>

          <div className="mt-12 border-t-4 border-black pt-8">
            <h3 className="font-black uppercase text-lg tracking-widest mb-4 italic">Detail Produk</h3>
            <div className="prose prose-sm max-w-none font-medium leading-relaxed text-gray-700">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="italic text-gray-400">Tidak ada deskripsi untuk produk ini.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
