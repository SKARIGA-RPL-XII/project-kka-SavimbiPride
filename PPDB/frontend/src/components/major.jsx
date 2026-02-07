import React from "react";
import sekolah from "../assets/sekulah.jpeg"; 
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const MajorCard = () => (
  <div className="bg-white rounded-[20px] overflow-hidden shadow-2xl text-blue-900 flex flex-col items-center p-1 border-[6px] border-[#312e81]">
    <div className="w-full h-40 overflow-hidden rounded-t-[15px]">
      <img src={sekolah} alt="Jurusan" className="w-full h-full object-cover" />
    </div>
    <div className="p-5 text-center flex flex-col items-center">
      <span className="bg-[#1E1E6F] text-white text-[10px] px-6 py-1 rounded-full font-sans mb-3">
        Lihat
      </span>
      <h3 className="font-bold text-sm leading-tight mb-2 uppercase tracking-wide">
        Rekayasa Perangkat Lunak
      </h3>
      <p className="text-[10px] text-gray-700 leading-relaxed font-sans">
        Pelajari pengembangan web, aplikasi mobile, dan logika pemrograman modern untuk masa depan digital.
      </p>
    </div>
  </div>
);

export default function Content() {
  return (
    <main id="informasi" className="bg-[#1E1E6F] text-white font-barrio">
      
      <div className="relative w-full h-[500px] overflow-hidden">
        <img 
          src={sekolah} 
          className="w-full h-full object-cover"
          alt="School Hero"
        />
        <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-8 text-center border-t-2 border-white/20">
          <p className="max-w-5xl mx-auto text-[13px] md:text-sm leading-relaxed tracking-wide italic">
            "Mewujudkan suasana lingkungan yang sejuk dan bersih, fasilitas lengkap (perpustakaan, lab lapangan), 
            guru yang berdedikasi, serta suasana belajar yang nyaman dan menyenangkan untuk membangun kesan positif 
            tentang tempat menimba ilmu dan mengembangkan potensi."
          </p>
        </div>
      </div>

      <section  id="preview-jurusan" className="py-20 px-6 md:px-20 bg-[#1E1E6F]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider uppercase">
            Berbagai Macam Jurusan <span className="text-yellow-400">Tersedia</span>
          </h2>
          <p className="text-xs md:text-sm opacity-80 max-w-2xl mx-auto">
            Jurusan-jurusan yang dirancang untuk kamu yang ingin mempersiapkan karier digital dan mempelajari skill baru.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <MajorCard />
          <MajorCard />
          <MajorCard />
        </div>

        <div className="flex justify-center space-x-4 mt-12">
          <button className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center hover:bg-white hover:text-blue-900 transition shadow-lg">
            <FaChevronLeft size={14} />
          </button>
          <button className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center hover:bg-white hover:text-blue-900 transition shadow-lg">
            <FaChevronRight size={14} />
          </button>
        </div>
      </section>

      <section id="cara-daftar" className="bg-[#4c1d95] py-20 px-6 md:px-10 border-t-4 border-[#312e81]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 uppercase tracking-widest">
            Cara Daftar peserta baru
          </h2>
          <p className="text-2xl mb-6">
            secara <span className="text-red-500 uppercase">offline</span> dan <span className="text-green-400 uppercase">online</span>
          </p>
          <p className="text-xs opacity-80 max-w-2xl mx-auto mb-10">
            Panduan lengkap pendaftaran peserta baru yang dapat dilakukan secara offline maupun online, 
            mulai dari persyaratan, alur pendaftaran, hingga proses verifikasi data.
          </p>
          
          <div className="bg-white rounded-[40px] w-full min-h-[600px] shadow-inner p-10">
          </div>
        </div>
      </section>
    </main>
  );
}