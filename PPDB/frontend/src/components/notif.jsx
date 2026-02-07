import React from "react";

export default function Notif({ type, message, onConfirm, onCancel, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      {/* Container Utama */}
      <div className="w-full max-w-[400px] border-[6px] border-[#31269c] bg-[#31269c] shadow-2xl">
        
        {/* Header - Agetha say: */}
        <div className="flex justify-between items-center px-4 py-2">
  <h2 className="text-white text-2xl font-rubik-glitch tracking-wider">
    Agetha say:
  </h2>
  
  {/* Tombol Close (X) */}
  {type === "info" && (
    <button 
      onClick={onClose}
      className="bg-red-600 border-2 border-black text-black w-8 h-8 flex items-center justify-center font-bold hover:bg-red-700 transition-colors cursor-pointer"
    >
      X
    </button>
  )}
</div>

        {/* Body Notifikasi */}
        <div className="bg-white p-8 min-h-[180px] flex flex-col items-center justify-center">
          <p className="text-center text-xl font-medium text-black leading-relaxed">
            {message}
          </p>

          {/* Tombol Konfirmasi - Hanya muncul untuk tipe confirm */}
          {type === "confirm" && (
            <div className="flex space-x-4 w-full px-2 mt-8">
              <button
                onClick={onConfirm}
                className="flex-1 bg-[#14532d] text-white py-2 text-xl font-bold border border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
              >
                iya
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-[#b91c1c] text-white py-2 text-xl font-bold border border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
              >
                tidak
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}