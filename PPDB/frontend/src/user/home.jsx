import { useState } from "react";
import ChatBot from "../components/chatbot";
import Content from "../components/major";
import SideNav from "../components/sideNav";
import NavBar from "../components/navbar";
import icon from "../assets/agethaIcon.jpeg";
import { 
  FaInstagram, 
  FaFacebook, 
  FaTwitter, 
  FaYoutube, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone 
} from "react-icons/fa";

function Landing() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-[#1E1E6F] text-white flex flex-col">
      <NavBar />
      <div className="flex flex-1 w-full items-start pt-20 pr-[200px]">
        <main className="flex-1">
          <Content />
          <footer className="bg-[#000045] pt-12 pb-6 px-6 md:px-20 border-t-4 border-yellow-400">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
              
              {/* Bagian Lokasi */}
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

              {/* Bagian Sosmed */}
              <div className="flex flex-col items-center gap-4">
                <h4 className="text-yellow-400 font-black uppercase italic tracking-tighter text-lg">Ikuti Kami</h4>
                <div className="flex gap-6">
                  <a href="https://www.instagram.com" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaInstagram size={28} />
                  </a>
                  <a href="https://www.facebook.com" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaFacebook size={28} />
                  </a>
                  <a href="https://twitter.com" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaTwitter size={28} />
                  </a>
                  <a href="https://www.youtube.com" className="hover:text-yellow-400 transition-all hover:scale-125 transform cursor-pointer">
                    <FaYoutube size={28} />
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright bawah */}
            <div className="mt-12 pt-6 border-t border-white/10 text-center">
              <p className="text-[10px] opacity-40 tracking-[0.3em] font-bold uppercase">
                &copy; 2026 FOCUS POINT EDUCATION. ALL RIGHTS RESERVED.
              </p>
            </div>
          </footer>
        </main>
        <SideNav />
      </div>

      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-[#4c1d95] shadow-2xl flex items-center justify-center text-2xl z-[100] hover:scale-110 transition-transform active:scale-95"
      >
        <img src={icon} alt="Chat Bot" className="w-16 h-16 rounded-full cursor-pointer" />
      </button>

      {showChat && (
        <div className="fixed inset-0 z-[200]">
          <ChatBot onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
}

export default Landing;