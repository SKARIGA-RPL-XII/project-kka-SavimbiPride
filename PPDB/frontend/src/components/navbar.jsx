import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiClock,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import logoFpe from "../assets/logo_fpe.png";
import defaultAvatar from "../assets/default-avatar.png"; // Import gambar default

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow-lg font-barrio">
      {/* TOPBAR */}
      <div className="bg-[#000045] text-white flex justify-between items-center h-10">
        <div className="flex-1 flex justify-center items-center space-x-6 text-[10px] md:text-[11px]">
          <div className="flex items-center space-x-2">
            <FiPhone size={14} />
            <span>+62-876-4335-7890</span>
          </div>
          <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
            <FiMail size={14} />
            <span className="underline decoration-blue-400">
              example@gmail.com
            </span>
          </div>
          <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
            <FiClock size={14} />
            <span>08:00 - 17:00</span>
          </div>
        </div>

        <div className="h-full relative">
          {user ? (
            <div className="h-full flex items-center">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#4c1d95] h-full px-12 flex items-center space-x-3 rounded-tl-2xl border-l border-white/10 cursor-pointer hover:bg-purple-700 transition-all select-none"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/50">
                  <img
                    src={user.foto || defaultAvatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[12px] font-bold uppercase tracking-wider">
                    {user.username}
                  </span>
                  <FiChevronDown
                    className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 top-10 w-48 bg-[#4c1d95] shadow-xl rounded-b-lg overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white hover:bg-[#37166d] transition-colors"
                  >
                    <FiUser className="text-white" />
                    <span className="font-semibold cursor-pointer">
                      Profile
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-300 hover:bg-[#37166d] transition-colors border-t border-white/10"
                  >
                    <FiLogOut />
                    <span className="font-semibold uppercase cursor-pointer">
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-[#4c1d95] h-full px-8 flex items-center space-x-2 hover:bg-purple-700 transition-all rounded-tl-2xl cursor-pointer"
            >
              <FiUser size={18} />
              <span className="text-[12px] font-bold uppercase">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN NAV */}
      <nav className="bg-[#1E1E6F] flex items-center h-20">
        <div className="bg-[#4c1d95] h-full flex items-center px-8 rounded-r-3xl shadow-xl">
          <div className="flex items-center space-x-4">
            <img
              src={logoFpe}
              alt="Logo"
              className="w-14 h-14 object-contain"
            />
            <div className="flex flex-col items-center leading-tight text-white font-barrio">
              <h1 className="text-lg font-bold tracking-[0.25em]">
                FOCUS POINT
              </h1>
              <p className="text-[9px] tracking-[0.4em] opacity-90 uppercase">
                EDUCATION
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-10 ml-12 text-white uppercase text-[12px]">
          <Link to="/" className="hover:text-yellow-400 transition-colors">
            Home
          </Link>
          <Link
            to="/program"
            className="hover:text-yellow-400 transition-colors"
          >
            Program Kami
          </Link>
          <Link
            to="/tentang"
            className="hover:text-yellow-400 transition-colors"
          >
            Tentang
          </Link>
        </div>

        <div className="ml-auto pr-8">
          <button className="bg-[#4c1d95] text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-purple-700 shadow-[0_4px_0_rgb(50,20,100)] active:shadow-none transition-all cursor-pointer">
            Contact Us
          </button>
        </div>
      </nav>
    </header>
  );
}
