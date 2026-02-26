import React from "react";
import agethaSuccess from "../assets/agethaSuccess.png";
import agethaWarning from "../assets/agethaWarning.png";
import agethaFailed from "../assets/agethafailed.png";
import { FaTimes } from "react-icons/fa";

export default function Notif({ type, message, onConfirm, onCancel, onClose }) {
  const isFailed = type === "failed";
  const isSuccess = type === "success";
  const isConfirm = type === "confirm";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="w-full max-w-[400px] border-[6px] border-[#31269c] bg-[#31269c] shadow-2xl relative">

        {isFailed && (
          <div className="absolute -top-44 -right-10 w-52 h-52 pointer-events-none">
            <img src={agethaFailed} alt="Failed" className="w-full h-full object-contain" />
          </div>
        )}

        {isConfirm && (
          <div className="absolute -top-46 -right-10 w-52 h-52 pointer-events-none">
            <img src={agethaWarning} alt="Confirm" className="w-full h-full object-contain" />
          </div>
        )}

        {isSuccess && (
          <div className="absolute -top-53 -right-2 w-52 h-52 pointer-events-none">
            <img src={agethaSuccess} alt="Success" className="w-full h-full object-contain" />
          </div>
        )}

        <div className="flex justify-between items-center px-4 py-2">
          <h2 className="text-white text-2xl font-rubik-glitch tracking-wider">
            Agetha say:
          </h2>

          {!isConfirm && (
            <button
              onClick={onClose}
              className="bg-red-600 border-2 border-black text-black w-8 h-8 flex items-center justify-center font-bold hover:bg-red-700 cursor-pointer"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="bg-white p-8 min-h-[180px] flex flex-col items-center justify-center border-t-2 border-[#1E1E6F]">
          <p className="text-center text-xl font-medium text-black">
            {message}
          </p>

          {isConfirm && (
            <div className="flex space-x-4 w-full px-2 mt-8">
              <button onClick={onConfirm} className="flex-1 bg-green-700 text-white py-2 text-xl font-bold cursor-pointer">
                iya
              </button>
              <button onClick={onCancel} className="flex-1 bg-red-700 text-white py-2 text-xl font-bold cursor-pointer">
                tidak
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
