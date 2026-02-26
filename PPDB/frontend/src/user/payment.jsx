import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import schoolIcon from "../assets/school.png"; 
import cardIcon from "../assets/card.png"; 

const Payment = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000045] flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-2xl flex flex-col">
        {/* Title */}
        <h1 className="text-gray-400 text-xl mb-4 self-start">
          pilih metode pembayaran
        </h1>

        {/* Card Container Utama */}
        <div className="bg-[#1a3a8a] p-4 rounded-2xl shadow-2xl w-full flex flex-col h-[400px]">
          
          {/* Tombol Kembali ke Home */}
          <header className="mb-4">
           <button
              onClick={() => navigate("/home")} // Navigasi ke home
              className="absolute top-6 left-6 z-10 bg-white text-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer border border-transparent"
            >
              <FaArrowLeft className="text-[9px] mb-[1px]" />
              <span>kembali</span>
            </button>
          </header>

          {/* Wadah Abu-abu (Inner Card) sesuai mockup */}
          <div className="bg-gray-200 rounded-2xl flex-grow flex items-center justify-center gap-8 px-6">

            {/* Tombol OFFLINE */}
            <div
              onClick={() => navigate("/payment/offline")}
              className="cursor-pointer bg-[#1a3a8a] w-48 h-64 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
            >
              {/* Logo dari Asset */}
              <img 
                src={schoolIcon} 
                alt="Offline" 
                className="w-24 h-24 mb-6 object-contain"
              />
              <p className="font-bold tracking-[0.2em] text-xs">
                OFFLINE
              </p>
            </div>

            {/* Tombol ONLINE */}
            <div
              onClick={() => navigate("/payment/online")}
              className="cursor-pointer bg-[#1a3a8a] w-48 h-64 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
            >
              {/* Logo dari Asset */}
              <img 
                src={cardIcon} 
                alt="Online" 
                className="w-24 h-24 mb-6 object-contain"
              />
              <p className="font-bold tracking-[0.2em] text-xs">
                ONLINE
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;