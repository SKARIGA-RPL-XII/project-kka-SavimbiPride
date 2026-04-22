import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import loginImg from "../assets/login.png"
import axios from "axios";
import { FaArrowLeft, FaTimes } from "react-icons/fa"; 
import Notif from "../components/notif";
import { io } from "socket.io-client";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [notif, setNotif] = useState({
    show: false,
    message: "",
    type: "",
    redirect: null
  });

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("USER CONNECT:", socketRef.current.id);

      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      if (storedUser?.email) {
        socketRef.current.emit("register_user", storedUser.email);
      }
    });

    socketRef.current.on("user_reset_done", (data) => {
      setNotif({
        show: true,
        message: data.message,
        type: "success",
        redirect: null
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseNotif = () => {
    setNotif((prev) => ({ ...prev, show: false }));
    if (notif.type === "success" && notif.redirect) {
      navigate(notif.redirect);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("adminId", res.data.user.id);

      const targetPath = res.data.user.role === "admin" ? "/dashboard" : "/home";

      setNotif({
        show: true,
        message: "Login berhasil! Selamat datang",
        type: "success",
        redirect: targetPath
      });
    } catch (err) {
      setNotif({
        show: true,
        message: err.response?.data?.message || "Login gagal, email atau password salah.",
        type: "failed",
        redirect: null
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email: resetEmail });

      socketRef.current.emit("forgot_password_request", {
        email: resetEmail,
        username: res.data.username || "User" 
      });

      setNotif({
        show: true,
        message: "request Email reset password berhasil dikirim!, tunggu beberapa menit :3",
        type: "success",
        redirect: null
      });
      setShowResetModal(false);
      setResetEmail("");
    } catch (err) {
      setNotif({
        show: true,
        message: err.response?.data?.message || "Email tidak ditemukan.",
        type: "failed",
        redirect: null
      });
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-white relative">
      {notif.show && (
        <Notif type={notif.type} message={notif.message} onClose={handleCloseNotif} />
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 relative shadow-2xl animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowResetModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaTimes size={24} />
            </button>
            
            <h2 className="text-[#1E1E6F] text-3xl font-black italic uppercase tracking-tighter mb-2">Lupa Sandi?</h2>
            <p className="text-gray-500 text-sm font-bold mb-8 uppercase">Masukkan email anda untuk menerima reset password.</p>
            
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-2 ml-1">Email Anda</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 text-blue-900 outline-none focus:border-[#1E1E6F] transition-all bg-gray-50 font-bold"
                  placeholder="name@mail.com"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black tracking-widest hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/30 uppercase"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FORM LOGIN */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-12 md:px-24 relative text-blue-900">
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-10 left-10 text-blue-900 text-3xl cursor-pointer hover:scale-110 transition-transform"
        >
          <FaArrowLeft />
        </button>

        <h1 className="text-[#1E1E6F] text-7xl mb-12 tracking-tighter font-black uppercase italic">LOGIN</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="text-gray-500 text-sm font-bold uppercase tracking-widest block mb-2 ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg text-blue-900 outline-none focus:border-[#1E1E6F] transition-all bg-gray-50 font-bold"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm font-bold uppercase tracking-widest block mb-2 ml-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg text-blue-900 outline-none focus:border-[#1E1E6F] transition-all bg-gray-50 font-bold"
              placeholder="••••••••"
            />
          </div>

          <div className="text-sm space-y-2 font-bold">
            <p 
              onClick={() => setShowResetModal(true)}
              className="text-blue-900/60 uppercase cursor-pointer hover:text-[#1E1E6F] hover:underline transition-all"
            >
              Lupa kata sandi anda?
            </p>
            <p className="text-blue-900/60 uppercase">
              Belum punya akun?{" "}
              <span 
                onClick={() => navigate("/register")} 
                className="text-yellow-600 cursor-pointer hover:underline"
              >
                Buat akun sekarang
              </span>
            </p>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              className="bg-[#1E1E6F] text-white px-16 py-4 rounded-2xl text-lg font-black tracking-[0.2em] shadow-2xl shadow-[#1E1E6F]/30 active:scale-95 hover:bg-[#2a2a8a] transition-all cursor-pointer uppercase"
            >
              LOG IN
            </button>
          </div>
        </form>
      </div>

      {/* ILLUSTRATION */}
      <div className="hidden lg:flex w-1/2 bg-[#1E1E6F] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent"></div>
        <img 
          src={loginImg} 
          alt="Login Illustration" 
          className="w-4/5 h-4/5 object-contain opacity-20" 
        />
      </div>
    </div>
  );
}