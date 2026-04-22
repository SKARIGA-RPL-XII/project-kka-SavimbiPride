import { Routes, Route } from "react-router-dom";
import sekolah from "../assets/sekulah.jpeg";
import NavBar from "../components/navbar";
import { 
  FaInstagram, 
  FaFacebook, 
  FaTwitter, 
  FaYoutube, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone,
  FaSchool,
  FaRocket
} from "react-icons/fa";

function Tentang() {
  return (
    <div className="min-h-screen bg-[#1E1E6F] font-barrio text-white flex flex-col">
      <NavBar />

      <div className="flex flex-1 w-full pt-20">
        <main className="flex-1 flex flex-col">
          
          {/* SECTION: TENTANG SEKOLAH */}
          <div className="flex-1 py-20 px-6 md:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-16 mb-24">
                
                {/* Image Section dengan Frame Estetik */}
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute -inset-4 bg-yellow-400 rounded-[40px] rotate-3 shadow-xl"></div>
                  <div className="relative h-[450px] rounded-[30px] overflow-hidden border-[10px] border-white shadow-2xl">
                    <img 
                      src={sekolah} 
                      alt="Gedung Fokus Point Education" 
                      className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-red-600 p-6 rounded-2xl shadow-xl hidden md:block">
                    <FaSchool size={40} />
                  </div>
                </div>

                {/* Text Section */}
                <div className="w-full md:w-1/2 text-left">
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                    Tentang <br /> 
                    <span className="text-yellow-400 underline decoration-white">Kami</span>
                  </h2>
                  <p className="text-xl md:text-2xl font-bold italic leading-relaxed text-white/90 mb-6">
                    "FOCUS POINT EDUCATION adalah pusat keunggulan akademik yang berdedikasi untuk mencetak generasi cerdas, inovatif, dan berkarakter kuat."
                  </p>
                  <p className="text-lg font-medium opacity-80 leading-relaxed mb-8">
                    Berdiri sejak tahun 2024 di jantung Kota Malang, kami terus bertransformasi menjadi institusi pendidikan yang mengedepankan teknologi dan kreativitas siswa. Dengan fasilitas modern dan kurikulum yang adaptif, kami percaya setiap anak memiliki titik fokus untuk sukses.
                  </p>
                </div>
              </div>

              {/* SECTION: GOOGLE MAPS */}
              <div className="w-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-1 flex-1 bg-white/20"></div>
                  <h3 className="text-3xl font-black uppercase italic tracking-widest text-yellow-400">Kunjungi Kami</h3>
                  <div className="h-1 flex-1 bg-white/20"></div>
                </div>
                
                <div className="w-full h-[450px] rounded-[40px] overflow-hidden border-[10px] border-white/10 shadow-2xl relative">
                  <iframe 
                    title="Google Maps Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.2139626343!2d112.61783811477!3d-7.97711499425464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7882803362391b%3A0x6a0536c4b96791d0!2sJl.%20Apel%2C%20Bareng%2C%20Kec.%20Klojen%2C%20Kota%20Malang%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1713620000000!5m2!1sid!2sid" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="bg-[#000045] pt-12 pb-6 px-6 md:px-20 border-t-4 border-yellow-400">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
                <h4 className="text-yellow-400 font-black uppercase italic tracking-tighter text-lg">Lokasi Kami</h4>
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <FaMapMarkerAlt className="text-yellow-400" size={20} />
                  <p className="text-xs uppercase font-bold tracking-widest italic">
                    Jl. Apel No. 9, Kota Malang, Jawa Timur
                  </p>
                </div>
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <FaPhone className="text-yellow-400" size={16} />
                  <p className="text-xs font-bold tracking-widest">+62 812 3456 7890</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <h4 className="text-yellow-400 font-black uppercase italic tracking-tighter text-lg">Ikuti Kami</h4>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaInstagram size={28} />
                  </a>
                  <a href="#" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaFacebook size={28} />
                  </a>
                  <a href="#" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaTwitter size={28} />
                  </a>
                  <a href="#" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaYoutube size={28} />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/10 text-center">
              <p className="text-[10px] opacity-40 tracking-[0.3em] font-bold uppercase">
                &copy; 2026 FOCUS POINT EDUCATION. ALL RIGHTS RESERVED.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Tentang;