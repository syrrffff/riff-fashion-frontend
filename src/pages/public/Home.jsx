
import { useState, useEffect, useRef, memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

// --- OPTIMASI SUPER: Product Card dengan Custom Equality Check ---
// Mencegah render ulang kartu jika ID produknya tidak berubah.
const ProductCard = memo(({ product }) => {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block border-4 border-black bg-white hover:-translate-y-2 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full min-w-[260px] md:min-w-[280px]"
    >
      <div className="relative aspect-[3/4] border-b-4 border-black bg-gray-100 overflow-hidden">
        {product.image_url && (
          <img
            src={
              product.image_url.startsWith("http")
                ? product.image_url
                : `${import.meta.env.VITE_STORAGE_URL}/storage/${product.image_url}`
            }
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500 relative z-10"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="absolute top-4 left-4 z-20 bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
          Cek Detail
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between bg-white">
        <div>
          <h3 className="font-black uppercase text-lg leading-tight mb-1 text-black">
            {product.name}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {product.category?.name || "Koleksi Riff"}
          </p>
        </div>
        <div className="mt-4 flex justify-between items-end border-t-2 border-gray-100 pt-3">
          <p className="font-mono font-black text-xl text-black">
            Rp{" "}
            {product.price
              ? new Intl.NumberFormat("id-ID").format(product.price)
              : "0"}
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-black group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4-4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}, (prevProps, nextProps) => prevProps.product.id === nextProps.product.id);


export default function Home() {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA TANPA CACHE (Sinkron dengan Backend baru) ---
  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const [latestRes, categoryRes] = await Promise.all([
          api.get("/public-products"),
          api.get("/home-data"),
        ]);

        if (isMounted) {
          // Mengambil data dari struktur pagination (data.data.data)
          setLatestProducts(latestRes.data?.data?.data || []);
          // Mengambil data kategori dinamis
          setCategories(categoryRes.data?.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil data Home:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const slide = useCallback((direction) => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl font-black uppercase tracking-widest animate-pulse border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          Memuat Toko...
        </div>
      </div>
    );

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative bg-black min-h-[80vh] flex items-center justify-center overflow-hidden border-b-8 border-black">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Hero Background"
            fetchpriority="high"
            decoding="sync"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-10">
          <h1 className="text-[20vw] font-black text-white whitespace-nowrap tracking-tighter">
            STREETWEAR
          </h1>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <div className="bg-white border-4 border-black p-2 mb-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] transform -rotate-2">
            <span className="bg-black text-white px-4 py-1 text-sm font-black uppercase tracking-widest inline-block">
              Koleksi 2026
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 uppercase leading-none drop-shadow-2xl">
            Riff.
            <br />
            <span className="text-transparent border-text-white italic">
              Fashion
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 font-bold max-w-2xl uppercase tracking-widest text-sm">
            Koleksi eksklusif untuk gaya hidup modern. Temukan kenyamanan dan
            keanggunan dalam setiap potongan pakaian kami.
          </p>
          <Link
            to="/products"
            className="bg-white text-black border-4 border-black px-10 py-5 text-lg font-black uppercase tracking-widest hover:bg-black hover:text-white hover:border-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none"
          >
            Mulai Belanja
          </Link>
        </div>
      </section>

      {/* 2. FITUR & KELEBIHAN TOKO */}
      <section className="border-b-8 border-black bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black border-x-4 border-black">
          {[
            {
              title: "Gratis Ongkir",
              desc: "Ke seluruh Indonesia*",
              icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
            },
            {
              title: "100% Original",
              desc: "Kualitas premium terjamin",
              icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
            },
            {
              title: "Tukar Ukuran",
              desc: "Garansi retur 7 hari",
              icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="p-8 md:p-12 flex flex-col items-center text-center hover:bg-black hover:text-white transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={feat.icon}
                />
              </svg>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                {feat.title}
              </h3>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PRODUK TERBARU */}
      <section
        id="produk-terbaru"
        className="py-20 px-4 md:px-8 border-b-8 border-black"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b-4 border-black pb-4">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
                Baru Mendarat
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter italic">
                Produk Terbaru
              </h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => slide("left")}
                className="p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                onClick={() => slide("right")}
                className="p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 [&::-webkit-scrollbar]:hidden"
          >
            {latestProducts.length > 0 ? (
              latestProducts.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="snap-start flex-none w-[80vw] sm:w-[300px]"
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 font-black uppercase text-gray-400">
                Belum ada produk baru.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC CATEGORIES SECTION */}
      {categories.map((kategori) => (
        <section
          key={kategori.id}
          className="py-16 px-4 md:px-8 border-b-8 border-black bg-gray-50 even:bg-white"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 border-b-4 border-black pb-4 gap-4">
              <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter">
                Koleksi <span className="italic">{kategori.name}</span>
              </h2>
              <Link
                to={`/products?category=${kategori.slug}`}
                className="text-xs font-black uppercase tracking-widest border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
              >
                Lihat Semua {kategori.name} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kategori.products && kategori.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* 5. OUR PRODUCT CTA */}
      <section className="bg-black text-white py-24 px-4 text-center border-b-8 border-gray-900">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-6 text-white animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
            Explore Our Universe
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10 max-w-xl">
            Dari T-shirt basic hingga celana cargo fungsional. Temukan seluruh
            identitas Riff Fashion di katalog lengkap kami.
          </p>
          <Link
            to="/products"
            className="bg-white text-black border-4 border-white px-12 py-6 text-xl font-black uppercase tracking-widest hover:bg-transparent hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:translate-y-1 hover:shadow-none"
          >
            Semua Produk Riff.
          </Link>
        </div>
      </section>
    </div>
  );
}
