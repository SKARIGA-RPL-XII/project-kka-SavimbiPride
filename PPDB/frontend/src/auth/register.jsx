import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import register from "../assets/register.png";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Notif from "../components/notif";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [notif, setNotif] = useState({
    show: false,
    message: "",
    type: "",
    redirect: null,
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseNotif = () => {
    setNotif({ ...notif, show: false });
    if (notif.type === "success" && notif.redirect) {
      navigate(notif.redirect);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setNotif({
        show: true,
        message: "Password dan konfirmasi password tidak cocok!",
        type: "failed",
        redirect: null,
      });
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setNotif({
        show: true,
        message: res.data.message || "Registrasi berhasil! Silakan login.",
        type: "success",
        redirect: "/login",
      });

    } catch (err) {
      setNotif({
        show: true,
        message:
          err.response?.data?.message ||
          "Registrasi gagal, silakan coba lagi.",
        type: "failed",
        redirect: null,
      });
    }
  };

  return (
    <div className="flex h-screen w-full font-barrio overflow-hidden bg-white">

      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={handleCloseNotif}
        />
      )}

      {/* Sisi Kiri: Gambar (Sekarang lebih gelap agar kontras) */}
      <div className="hidden lg:flex w-1/2 bg-[#1E1E6F] items-center justify-center p-20">
        <img
          src={register}
          alt="Register Illustration"
          className="w-full h-full object-contain opacity-30 transform scale-110"
        />
      </div>

      {/* Sisi Kanan: Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-12 md:px-24 text-blue-900">
        <h1 className="text-[#1E1E6F] text-7xl mb-10 tracking-tighter font-black uppercase italic">
          SIGN UP
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-gray-500 text-sm font-bold uppercase tracking-widest block mb-2 ml-1">Username</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="JhonDoe123"
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg text-blue-900 outline-none focus:border-[#1E1E6F] transition-all bg-gray-50 font-bold"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm font-bold uppercase tracking-widest block mb-2 ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@mail.com"
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg text-blue-900 outline-none focus:border-[#1E1E6F] transition-all bg-gray-50 font-bold"
            />
          </div>

          <div className="relative">
            <label className="text-gray-500 text-sm font-bold uppercase tracking-widest block mb-2 ml-1">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg text-blue-900 outline-none focus:border-[#1E1E6F] transition-all bg-gray-50 font-bold pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E1E6F] transition-colors cursor-pointer"
              >
                {showPass ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-gray-500 text-sm font-bold uppercase tracking-widest block mb-2 ml-1">Konfirmasi Password</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg text-blue-900 outline-none focus:border-[#1E1E6F] transition-all bg-gray-50 font-bold pr-14"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E1E6F] transition-colors cursor-pointer"
              >
                {showConfirmPass ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
              </button>
            </div>
          </div>

          <div className="text-sm font-bold">
            <p className="text-blue-900/60 uppercase">
              Sudah punya akun?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-yellow-600 cursor-pointer hover:underline"
              >
                Login sekarang!
              </span>
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-[#1E1E6F] text-white px-16 py-4 rounded-2xl text-lg font-black tracking-[0.2em] shadow-2xl shadow-[#1E1E6F]/30 active:scale-95 hover:bg-[#2a2a8a] transition-all cursor-pointer uppercase"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}