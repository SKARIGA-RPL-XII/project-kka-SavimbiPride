import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoFpe from "../assets/logo_fpe.png";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa"; 

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    // Menghubungkan input dengan state
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      
      // 1. Simpan Token dan Data User
      localStorage.setItem("token", res.data.token); 
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert(res.data.message);

      // 2. Navigasi Berdasarkan Role
      if (res.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login gagal, periksa koneksi anda.");
    }
  };

  return (
    <div className="flex h-screen w-full font-barrio overflow-hidden">
      {/* SISI KIRI: FORM */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-20 relative text-blue-900">
        <button 
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 text-blue-900 text-2xl cursor-pointer hover:scale-110 transition-transform"
        >
          <FaArrowLeft />
        </button>

        <h1 className="text-[#1E1E6F] text-6xl mb-12 tracking-widest uppercase">LOGIN</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-3 text-blue-900 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-3 text-blue-900 outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="text-[10px] space-y-1">
            <p className="text-blue-900 uppercase cursor-pointer hover:underline">Lupa kata sandi anda?</p>
            <p className="text-blue-900 uppercase">
              Belum punya akun? <span onClick={() => navigate("/register")} className="text-yellow-500 cursor-pointer hover:underline">Buat akun sekarang</span>
            </p>
          </div>

          <div className="flex justify-end mt-10">
            <button 
              type="submit"
              className="bg-[#1E1E6F] text-white px-10 py-2 rounded-lg text-sm tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer uppercase"
            >
              LOG IN
            </button>
          </div>
        </form>
      </div>

      <div className="w-1/2 bg-[#1E1E6F] flex items-center justify-center">
          <img src={logoFpe} alt="Logo" className="w-100 h-100 object-contain opacity-90" />     
      </div>
    </div>
  );
}