import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {FiPhone, FiMail, FiClock, FiUser, FiLogOut, FiSettings, FiChevronDown} from "react-icons/fi";
import logoFpe from "../assets/logo_fpe.png";
import defaultAvatar from "../assets/default-avatar.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadRef = useRef(0);
  const audioRef = useRef(null);
  const [registration, setRegistration] = useState(null);

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isActive = (path) => location.pathname === path;

  const handleContactUs = () => {
    const email = "focuspoint@gmail.com";
    const subject = "Tanya Pendaftaran Fokus Point Education";
    const body = "Halo Admin, saya ingin bertanya mengenai...";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  useEffect(() => {
    const fetchLatestUserData = async () => {
      const token = sessionStorage.getItem("token");
      if (!user?.id || !token) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/profile/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(res.data);
        sessionStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Gagal sync user:", err.message);
      }
    };

    fetchLatestUserData();
  }, []);

  useEffect(() => {
  const fetchRegistration = async () => {
    const token = sessionStorage.getItem("token");
    if (!user?.id || !token) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/inbox/status/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRegistration(res.data);
    } catch (err) {
      console.error("Gagal ambil status daftar:", err.message);
    }
  };

  fetchRegistration();
}, [user?.id]);

  useEffect(() => {
  if (!user?.id) return;
    const fetchInboxNotif = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/inbox/inbox/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const inboxData = Array.isArray(res.data) ? res.data : [];

       const unread = inboxData.filter(
         (item) => item.is_read === 0 || item.is_read === "0"
       );

        const newCount = unread.length;

        if (newCount > prevUnreadRef.current) {
          if (audioRef.current) {
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(() => {});
          }
        }

        prevUnreadRef.current = newCount;
        setUnreadCount(newCount);

      } catch (err) {
        console.error("Gagal ambil inbox:", err.message);
      }
    };

    fetchInboxNotif();

    const interval = setInterval(fetchInboxNotif, 10000);
    return () => clearInterval(interval);

  }, [user?.id]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const getNavLabel = () => {
    if (registration?.payment_status === "lunas") return "BIO"; 
    if (registration?.registrationStatus === "diterima") return "PEMBAYARAN";
    if (registration?.registrationStatus === "proses") return "PENDING";
    return "DAFTAR";
  };

  const getNavLink = () => {
    if (registration?.payment_status === "lunas") return `/daftar/${user.id}`;
    if (registration?.registrationStatus === "diterima") return `/payment`;
    return `/daftar/${user.id}`;
  };

  return (
    <header className="fixed w-full top-0 z-50 shadow-lg">
      <div className="bg-[#000045] text-white flex justify-between items-center h-10">
        <div className="flex-1 flex justify-center items-center space-x-6 text-[10px] md:text-[11px]">
          <div className="flex items-center space-x-2">
            <FiPhone size={14} />
            <span>+62-876-4335-7890</span>
          </div>
          <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
            <FiMail size={14} />
            <span className="underline decoration-blue-400">
              focuspoint@gmail.com
            </span>
          </div>
          <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
            <FiClock size={14} />
            <span>07:00 - 16:00</span>
          </div>
        </div>

        <div className="h-full relative">
          {user ? (
            <div className="h-full flex items-center">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#4c1d95] h-full px-6 flex items-center space-x-3 rounded-tl-2xl border-l border-white/10 cursor-pointer hover:bg-purple-700 transition-all select-none"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/50">
                  <img
                    src={
                      user.foto && user.foto !== "default-avatar.png"
                        ? `http://localhost:5000/avatars/${user.foto}`
                        : defaultAvatar
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
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
                      navigate(`/profileU/${user.id}`);
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

        <div className="space-x-8 ml-10 text-white uppercase text-[12px] flex">
          <Link
            to={user ? "/home" : "/"}
            className={`${
              isActive(user ? "/home" : "/")
                ? "text-yellow-400 font-bold"
                : "hover:text-yellow-400"
            } transition-colors`}
          >
            Home
          </Link>
          <Link to="/tentang" className={`${isActive("/tentang") ? "text-yellow-400 font-bold" : "hover:text-yellow-400"} transition-colors`}>About us</Link>
        </div>

        <div className="space-x-8 ml-auto pr-8">
          {user && (
            <>
              <Link
                to={getNavLink()}
                className="bg-[#4c1d95] text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-purple-700 shadow-[0_4px_0_rgb(50,20,100)] active:shadow-none transition-all "
              >
                {getNavLabel()}
              </Link>
              
              <Link
                to="/inbox"
                className={`relative bg-[#4c1d95] hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase shadow-[0_4px_0_rgb(50,20,100)] active:shadow-none transition-all ${unreadCount > 0 ? "animate-pulse" : ""}`}
              >
                inbox
                {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-[2px] rounded-full">{unreadCount}</span>}
              </Link>
            </>
          )}
          <button 
            onClick={handleContactUs}
            className="bg-[#4c1d95] text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-purple-700 shadow-[0_4px_0_rgb(50,20,100)] active:shadow-none transition-all cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </nav>
      <audio ref={audioRef} src="/notif.wav" preload="auto" />
    </header>
  );
}