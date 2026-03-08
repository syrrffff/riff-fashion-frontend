import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Kumpulan Pertanyaan Umum Seputar Alur E-Commerce
  const faqs = [
    {
      question: "Bagaimana cara melakukan pemesanan di Riff Fashion?",
      answer:
        "Sangat mudah! Pilih produk yang Anda inginkan di halaman Koleksi, klik detail produk, pilih ukuran dan warna (Varian), lalu klik 'Masukkan Keranjang'. Setelah itu, buka ikon keranjang di kanan atas dan lanjutkan ke proses Checkout untuk mengisi alamat dan memilih kurir.",
    },
    {
      question: "Metode pembayaran apa saja yang diterima?",
      answer:
        "Kami menerima berbagai metode pembayaran otomatis melalui sistem Midtrans. Anda bisa membayar menggunakan Virtual Account (BCA, Mandiri, BNI, BRI), e-Wallet (GoPay, ShopeePay, OVO), QRIS, hingga minimarket (Indomaret/Alfamart).",
    },
    {
      question: "Berapa lama waktu yang dibutuhkan untuk pengiriman?",
      answer:
        "Pesanan yang masuk dan terbayar sebelum jam 15:00 WIB akan dikirim pada hari yang sama. Estimasi waktu tiba tergantung layanan kurir yang Anda pilih saat checkout (biasanya 1-3 hari untuk Jabodetabek & Jawa Barat, dan 3-5 hari untuk luar pulau).",
    },
    {
      question: "Apakah saya bisa melacak pesanan saya?",
      answer:
        "Tentu saja. Setelah pesanan Anda dikirim, nomor resi (AWB) akan otomatis muncul di halaman 'Riwayat Pesanan' pada akun Anda. Anda bisa melacaknya langsung dari sana atau melalui website kurir terkait.",
    },
    {
      question: "Bagaimana jika baju yang datang kebesaran/kekecilan?",
      answer:
        "Kami memberikan garansi tukar ukuran maksimal 3 hari sejak barang berstatus 'Diterima'. Syaratnya, hangtag/label belum dicopot, baju belum dicuci, dan biaya ongkos kirim retur & kirim balik ditanggung oleh pembeli.",
    },
    {
      question: "Apakah stok produk selalu tersedia?",
      answer:
        "Sistem kami secara otomatis tersinkronisasi dengan gudang. Jika sebuah ukuran atau warna masih bisa diklik dan dimasukkan ke keranjang, berarti stok fisiknya 100% aman dan siap kirim!",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="text-center border-b-8 border-black pb-10 mb-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
          BANTUAN & <br className="md:hidden" />
          <span className="italic">FAQ.</span>
        </h1>
        <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">
          Pertanyaan umum seputar belanja di Riff.
        </p>
      </div>

      {/* ACCORDION FAQ */}
      <div className="space-y-4 mb-20">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border-4 border-black bg-white transition-all duration-300 ${
              openIndex === index
                ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
                : "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
            >
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight pr-8">
                {faq.question}
              </h3>
              <span className="text-3xl font-mono font-black shrink-0">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? "max-h-96 border-t-4 border-black"
                  : "max-h-0"
              }`}
            >
              <div className="p-6 bg-gray-50">
                <p className="text-base md:text-lg font-bold text-gray-700 leading-relaxed uppercase tracking-wide text-sm">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CALL TO ACTION JIKA MASIH BINGUNG */}
      <div className="text-center border-4 border-black p-8 bg-black text-white shadow-[8px_8px_0px_0px_rgba(209,213,219,1)]">
        <h2 className="text-3xl font-black uppercase mb-4">
          Masih Punya Pertanyaan?
        </h2>
        <p className="font-bold text-gray-400 mb-6 uppercase tracking-widest text-sm">
          Tim support kami siap membantu Anda kapan saja.
        </p>
        <a
          href="https://instagram.com/syrrffff"
          target="_blank"
          className="inline-block border-2 border-white px-8 py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          Hubungi Kami
        </a>
      </div>
    </div>
  );
}
