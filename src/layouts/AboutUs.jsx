
import { useEffect } from 'react';
import { Link } from "react-router-dom";
import bgAbout from "../assets/bg-about.jpg";

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* 1. COMPANY PROFILE WITH BACKGROUND */}
      <section className="relative overflow-hidden border-b-8 border-black mb-16">
        {/* KONTEN GAMBAR LATAR (BACKGROUND) */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgAbout} // Ganti URL ini dengan gambar Anda
            alt="Streetwear Culture Background"
            className="w-full h-full object-cover grayscale opacity-50 mix-blend-luminosity"
          />
          {/* Lapisan Overlay Gelap agar tulisan terbaca */}
          <div className="absolute inset-0 bg-black/80"></div>
        </div>

        {/* KONTEN TEKS (relative z-10 agar berada di atas gambar) */}
        <div className="relative z-10 max-w-4xl py-20 px-6 md:px-10 text-white mx-auto lg:mx-0">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-none drop-shadow-2xl text-white">
            MENDOBRAK <br />
            {/* Diubah jadi italic saja untuk dark bg */}
            <span className="italic">BATASAN.</span>
          </h1>

          {/* Warna teks disesuaikan ke abu terang (text-gray-100) dan border jadi putih (border-white) */}
          <p className="text-xl md:text-2xl font-bold text-gray-100 leading-relaxed mb-6 border-l-8 border-white pl-6">
            Riff Fashion lahir dari jalanan untuk jalanan. Kami bukan sekadar
            toko pakaian, kami adalah manifestasi dari kebebasan berekspresi
            melalui kultur streetwear modern.
          </p>

          {/* Warna teks disesuaikan ke abu sedang (text-gray-400) */}
          <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-3xl">
            Berdiri sejak tahun 2024, kami berdedikasi untuk menyediakan koleksi
            apparel berkualitas tinggi yang memadukan kenyamanan absolut dengan
            estetika brutalist yang tajam. Setiap potongan kain, setiap jahitan,
            dirancang bagi mereka yang berani tampil beda dan menolak seragam.
          </p>
        </div>
      </section>

      {/* 2. WHY CHOOSE US / SERVICES */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 border-b-4 border-black pb-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            Kenapa Memilih Kami?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Kualitas Premium",
              desc: "Material pilihan yang tahan banting. Dibuat untuk pemakaian jangka panjang tanpa menurunkan kualitas warna dan bentuk.",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              title: "Pengiriman Kilat",
              desc: "Pesanan Anda adalah prioritas. Kami bekerja sama dengan ekspedisi terbaik untuk memastikan baju baru Anda tiba tepat waktu.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
            {
              title: "Garansi Retur",
              desc: "Ukuran tidak pas? Ada cacat produksi? Jangan panik. Kami memberikan garansi tukar barang hingga 7 hari setelah barang diterima.",
              icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
            },
          ].map((service, idx) => (
            <div
              key={idx}
              className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-6 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={service.icon}
                />
              </svg>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                {service.title}
              </h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MAPS & CONTACT INFO */}
      <section className="border-t-8 border-black pt-16">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            Markas Kami.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Kiri: Google Maps (Contoh titik: Cileunyi) */}
          <div className="border-4 border-black bg-gray-100 aspect-square md:aspect-video lg:aspect-square shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden p-2">
            <div className="w-full h-full border-2 border-black">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126732.1234567!2d107.7123456!3d-6.9321234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c6c748aa55bd%3A0x401e8f1fc28c110!2sCileunyi%2C%20Bandung%20Regency%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Riff Fashion Location"
              ></iframe>
            </div>
          </div>

          {/* Kanan: Contact Information */}
          <div className="flex flex-col justify-center">
            <div className="bg-black text-white p-8 md:p-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(209,213,219,1)]">
              <h3 className="text-3xl font-black uppercase mb-8 border-b-2 border-gray-700 pb-4">
                Info Kontak
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    Lokasi Toko
                  </p>
                  <p className="text-lg font-bold">
                    Kecamatan Cileunyi, Kab. Bandung
                    <br />
                    Jawa Barat, Indonesia 40622
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    Jam Operasional
                  </p>
                  <p className="text-lg font-bold">
                    Senin - Sabtu: 09:00 - 21:00 WIB
                    <br />
                    Minggu: Libur (Tidur)
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    Telepon / WhatsApp
                  </p>
                  <p className="text-lg font-bold font-mono">
                    +62 812 3456 7890
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    Email
                  </p>
                  <p className="text-lg font-bold">hello@riff-fashion.com</p>
                </div>

                <div className="pt-6 border-t-2 border-gray-700">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">
                    Sosial Media
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="#"
                      className="border-2 border-white px-4 py-2 font-black uppercase text-sm hover:bg-white hover:text-black transition-colors"
                    >
                      Instagram
                    </a>
                    <a
                      href="#"
                      className="border-2 border-white px-4 py-2 font-black uppercase text-sm hover:bg-white hover:text-black transition-colors"
                    >
                      TikTok
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
