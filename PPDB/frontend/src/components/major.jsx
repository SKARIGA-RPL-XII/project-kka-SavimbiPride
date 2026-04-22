import React, { useEffect, useState } from "react";
import axios from "axios";
import sekolah from "../assets/sekulah.jpeg";
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaArrowRight,
  FaTimes
} from "react-icons/fa";

const MajorCard = ({ data, onDetail }) => (
  <div className="bg-white rounded-[30px] shadow-2xl text-blue-900 flex flex-col items-center p-2 border-[8px] border-[#312e81] transition-all hover:scale-105 h-full">
    <div className="w-full h-40 rounded-t-[20px]">
      <img
        src={`http://localhost:5000${data.gambar}`}
        alt={data.nama}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-6 text-center flex flex-col items-center flex-grow">
      <button
        onClick={() => onDetail(data)}
        className="bg-[#1E1E6F] text-white text-xs px-8 py-2 rounded-full font-black mb-4 uppercase tracking-tighter cursor-pointer hover:bg-blue-800 transition-colors"
      >
        Lihat
      </button>
      <h3 className="font-black text-lg leading-tight mb-3 uppercase tracking-tighter italic">
        {data.nama}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed font-bold italic line-clamp-2">
        {data.deskripsi}
      </p>
    </div>
  </div>
);

export default function Content() {
  const [jurusan, setJurusan] = useState([]);
  const [selectedJurusan, setSelectedJurusan] = useState(null);
  const [berita, setBerita] = useState([]);
  const [selectedBerita, setSelectedBerita] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsIndex, setNewsIndex] = useState(0);
  const [daftarMode, setDaftarMode] = useState("offline");

  const itemsPerPage = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resJurusan, resBerita] = await Promise.all([
          axios.get("http://localhost:5000/api/jurusan"),
          axios.get("http://localhost:5000/api/berita"),
        ]);
        setJurusan(resJurusan.data);
        setBerita(resBerita.data);
      } catch (err) {
        console.error("Gagal load data", err);
      }
    };
    fetchData();
  }, []);

  const nextSlide = () => {
    if (currentIndex + itemsPerPage < jurusan.length)
      setCurrentIndex(currentIndex + 1);
  };
  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const nextNews = () => {
    if (newsIndex < berita.length - 1) setNewsIndex(newsIndex + 1);
  };
  const prevNews = () => {
    if (newsIndex > 0) setNewsIndex(newsIndex - 1);
  };

  const langkahDaftar = {
    offline: [
      "1. Pertama login terlebih dahulu, jika tidak punya akun bikin akun lewat registrasi",
      "2. Setelah login, klik tombol daftar yang berada di atas navbar",
      "3. Mengisi data pendaftaran (Data diri, keluarga, jurusan) & Upload ijazah SMP (WAJIB VALID)",
      "4. Tunggu respon admin untuk verifikasi berkas",
      "5. Jika diterima, tombol pembayaran akan muncul di dashboard",
      "6. Klik button pembayaran lalu pilih metode Offline",
      "7. Maka akan muncul data username, jurusan, dan total harga",
      "8. Unduh bukti pembayaran, cetak, dan bawa ke Jl. Apel No. 9 Malang",
    ],
    online: [
      "1. Pertama login terlebih dahulu, jika tidak punya akun bikin akun lewat registrasi",
      "2. Setelah login, klik tombol daftar yang berada di atas navbar",
      "3. Mengisi data pendaftaran (Data diri, keluarga, jurusan) & Upload ijazah SMP (WAJIB VALID)",
      "4. Tunggu respon admin untuk verifikasi berkas",
      "5. Jika diterima, tombol pembayaran akan muncul di dashboard",
      "6. Klik button pembayaran lalu pilih metode Online",
      "7. Detail pembayaran akan muncul secara otomatis",
      "8. Klik button bayar dan selesaikan transaksi via aplikasi bank",
    ],
  };

  return (
    <div className="bg-[#1E1E6F] text-white font-barrio overflow-x-hidden">
      <div id="informasi" className="relative w-full h-[550px] overflow-hidden group">
        {berita.length > 0 ? (
          <>
            <img
              src={`http://localhost:5000${berita[newsIndex].gambar}`}
              className="w-full h-full object-cover grayscale-[20%] brightness-75 transition-all duration-700"
              alt="News Hero"
            />
            <div className="absolute bottom-0 w-full bg-[#1E1E6F]/90 backdrop-blur-md p-8 text-center border-t-4 border-yellow-400">
              <h4 className="text-yellow-400 font-black uppercase tracking-widest text-sm mb-2 italic">
                BERITA TERBARU: {berita[newsIndex].judul}
              </h4>
              <p className="max-w-6xl mx-auto text-base md:text-xl leading-relaxed italic font-black uppercase line-clamp-2 mb-4">
                "{berita[newsIndex].deskripsi}"
              </p>
            </div>

            {berita.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={prevNews} className="bg-white/20 p-4 rounded-full hover:bg-white/40 cursor-pointer">
                  <FaChevronLeft size={30} />
                </button>
                <button onClick={nextNews} className="bg-white/20 p-4 rounded-full hover:bg-white/40 cursor-pointer">
                  <FaChevronRight size={30} />
                </button>
              </div>
            )}
          </>
        ) : (
          <img src={sekolah} className="w-full h-full object-cover grayscale-[20%] brightness-75" alt="Default Hero" />
        )}
      </div>

      {selectedBerita && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[40px] border-[10px] border-yellow-400 overflow-hidden relative shadow-2xl animate-in zoom-in duration-300">
            <button
              onClick={() => setSelectedBerita(null)}
              className="absolute top-4 right-4 z-10 bg-red-600 text-white p-3 rounded-2xl hover:rotate-90 transition-all cursor-pointer"
            >
              <FaTimes size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
              <div className="w-full md:w-1/2 h-[300px] md:h-auto">
                <img
                  src={`http://localhost:5000${selectedBerita.gambar}`}
                  className="w-full h-full object-cover"
                  alt={selectedBerita.judul}
                />
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 text-blue-900 flex flex-col justify-center">
                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 leading-none">
                  {selectedBerita.judul}
                </h3>
                <div className="w-20 h-2 bg-yellow-400 mb-6 rounded-full"></div>
                <p className="text-lg font-bold italic leading-relaxed text-gray-700 mb-8">
                  {selectedBerita.deskripsi}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="w-full bg-purple-800 py-3 flex justify-center items-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
      <button
        onClick={() => setSelectedBerita(berita[newsIndex])}
        className="bg-yellow-400 text-[#1E1E6F] px-6 py-2 rounded-full font-black uppercase text-xs 
        hover:bg-white transition-all duration-300 cursor-pointer shadow-lg"
      >
        Baca Selengkapnya
      </button>
    </div>

      <section id="preview-jurusan" className="py-24 px-6 md:px-20 bg-[#1E1E6F]">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic">
            Jurusan <span className="text-yellow-400 underline decoration-white">Tersedia</span>
          </h2>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {!selectedJurusan ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 transition-all duration-500">
                {jurusan.slice(currentIndex, currentIndex + itemsPerPage).map((item) => (
                  <MajorCard key={item.id} data={item} onDetail={(val) => setSelectedJurusan(val)} />
                ))}
              </div>

              <div className="flex justify-center items-center gap-6 mt-12">
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all shadow-xl ${currentIndex === 0 ? "border-white/20 text-white/20" : "border-white text-white hover:bg-white hover:text-blue-900 cursor-pointer"}`}
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentIndex + itemsPerPage >= jurusan.length}
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all shadow-xl ${currentIndex + itemsPerPage >= jurusan.length ? "border-white/20 text-white/20" : "border-white text-white hover:bg-white hover:text-blue-900 cursor-pointer"}`}
                >
                  <FaChevronRight size={24} />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[40px] border-[10px] border-yellow-400 p-8 md:p-12 text-blue-900 animate-in fade-in zoom-in duration-500 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                <div className="w-full md:w-1/2 h-[350px] rounded-[30px] overflow-hidden border-8 border-blue-900/10 shadow-inner">
                  <img
                    src={`http://localhost:5000${selectedJurusan.gambar}`}
                    className="w-full h-full object-cover"
                    alt={selectedJurusan.nama}
                  />
                </div>
                <div className="w-full md:w-1/2 text-left">
                  <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 text-[#1E1E6F]">
                    {selectedJurusan.nama}
                  </h3>
                  <div className="w-24 h-2 bg-yellow-400 mb-6 rounded-full"></div>
                  <p className="text-lg md:text-xl font-bold italic leading-relaxed text-gray-700">
                    {selectedJurusan.deskripsi}
                  </p>
                  <button
                    onClick={() => setSelectedJurusan(null)}
                    className="mt-10 flex items-center gap-3 text-[#1E1E6F] font-black uppercase tracking-widest hover:gap-5 transition-all cursor-pointer"
                  >
                    <FaArrowLeft /> Kembali ke list
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="cara-daftar" className="bg-[#1E1E6F] py-24 px-6 md:px-10 border-t-8 border-[#312e81]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tighter italic text-white">
            Cara Daftar peserta baru
          </h2>
          <p className="text-3xl mb-12 font-black uppercase tracking-widest">
            secara <span className="text-red-500">offline</span> dan <span className="text-green-400">online</span>
          </p>

          <div className="bg-white rounded-[60px] w-full min-h-[600px] shadow-2xl p-8 md:p-16 border-[10px] border-blue-900/10 text-blue-900">
            <div className="flex justify-center items-center gap-8 mb-16">
              {daftarMode !== "offline" ? (
                <button onClick={() => setDaftarMode("offline")} className="text-black hover:scale-125 transition-transform cursor-pointer">
                  <FaArrowLeft size={30} />
                </button>
              ) : (
                <div className="w-[30px]"></div> 
              )}

              <h3 className={`text-5xl md:text-7xl font-black uppercase italic tracking-tighter transition-colors duration-500 ${daftarMode === "offline" ? "text-red-600" : "text-green-500"}`}>
                {daftarMode}
              </h3>
              {daftarMode !== "online" ? (
                <button onClick={() => setDaftarMode("online")} className="text-black hover:scale-125 transition-transform cursor-pointer">
                  <FaArrowRight size={30} />
                </button>
              ) : (
                <div className="w-[30px]"></div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-left">
              {langkahDaftar[daftarMode].map((step, index) => (
                <div key={index} className="flex gap-6 items-start group">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg transition-all group-hover:rotate-12 ${daftarMode === "offline" ? "bg-red-600 text-white" : "bg-green-500 text-white"}`}>
                    {index + 1}
                  </div>
                  <p className="text-[#1E1E6F] text-lg font-black leading-tight uppercase italic tracking-tighter pt-2">
                    {step.substring(3)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}