import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoFpe from "../assets/logo_fpe.png";
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
    <div className="flex h-screen w-full font-barrio overflow-hidden">

      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={handleCloseNotif}
        />
      )}

      <div className="w-1/2 bg-[#1E1E6F] flex items-center justify-center">
        <img
          src={logoFpe}
          alt="Logo"
          className="w-100 h-100 object-contain opacity-80"
        />
      </div>

      <div className="w-1/2 bg-white flex flex-col justify-center px-20">
        <h1 className="text-[#1E1E6F] text-6xl mb-12 tracking-widest uppercase">
          SIGN UP
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Username</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-3 text-blue-900 outline-none focus:border-blue-500"
            />
          </div>

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

          <div className="relative">
            <label className="text-gray-400 text-xs block mb-1">Password</label>
            <input
              name="password"
              type={showPass ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-3 text-blue-900 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-9 text-gray-400 hover:text-blue-900 cursor-pointer"
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <label className="text-gray-400 text-xs block mb-1">
              Konfirmasi Password
            </label>
            <input
              name="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-3 text-blue-900 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3 top-9 text-gray-400 hover:text-blue-900 cursor-pointer"
            >
              {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="text-[10px]">
            <p className="text-blue-900 uppercase">
              Sudah punya akun?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-yellow-500 cursor-pointer hover:underline"
              >
                Login sekarang!
              </span>
            </p>
          </div>

          <div className="flex justify-end mt-10">
            <button
              type="submit"
              className="bg-[#1E1E6F] text-white px-8 py-2 rounded-lg text-sm tracking-widest shadow-lg active:scale-95 transition-transform cursor-pointer uppercase"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
