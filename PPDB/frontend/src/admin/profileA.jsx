import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash, FaSave, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import defaultAvatar from "../assets/default-avatar.png";
import Notif from "../components/notif";

export default function ProfileAdmin() {
  const navigate = useNavigate();
  const adminId = sessionStorage.getItem("adminId");
  const token = sessionStorage.getItem("token");

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notif, setNotif] = useState({
    show: false,
    type: "info",
    message: "",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    foto: "",
  });

  const showAlert = (message, type = "info") => {
    setNotif({ show: true, type, message });
  };

  const closeNotif = () => {
    setNotif((prev) => ({ ...prev, show: false }));
    setConfirmAction(null);
  };

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!adminId || !token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/profile/${adminId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFormData((prev) => ({
          ...prev,
          username: res.data.username || "",
          email: res.data.email || "",
          foto: res.data.foto || "",
        }));
      } catch (err) {
        showAlert(err.response?.data?.message || "Sesi habis, silakan login ulang", "failed");
      }
    };

    fetchAdmin();
  }, [adminId, token, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showAlert("Format salah! Gunakan JPG, PNG, atau WEBP.", "failed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showAlert("Maksimal ukuran file 2MB.", "failed");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const processUpdate = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);

      const isPasswordChanged = formData.password.trim() !== "";
      if (isPasswordChanged) {
        data.append("password", formData.password);
      }

      if (selectedFile) {
        data.append("foto", selectedFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/admin/profile/update/${adminId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (isPasswordChanged) {
        showAlert("Password diubah! Silakan login kembali.", "success");
        setTimeout(() => {
          sessionStorage.clear();
          navigate("/login");
        }, 2000);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
        foto: res.data.foto || prev.foto,
      }));
      setPreview(null);
      setSelectedFile(null);
      showAlert("Profil berhasil diperbarui!", "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Gagal update profil", "failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      showAlert("Konfirmasi password tidak cocok!", "failed");
      return;
    }

    setConfirmAction(() => processUpdate);
    setNotif({
      show: true,
      type: "confirm",
      message: "Simpan perubahan profil Anda?",
    });
  };

  return (
    <div className="flex min-h-screen bg-[#080841] p-6 lg:p-10 font-sans">
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={closeNotif}
          onConfirm={() => {
            if (confirmAction) confirmAction();
            closeNotif();
          }}
          onCancel={closeNotif}
        />
      )}

      <div className="flex-1 max-w-6xl  mx-auto w-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-full text-xs font-bold  transition-all cursor-pointer"
          >
            <FaArrowLeft /> KEMBALI
          </button>
          
          <button
            onClick={handleUpdateClick}
            disabled={loading}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer ${
              loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-500 text-white"
            }`}
          >
            <FaSave /> {loading ? "PROSES..." : "SIMPAN"}
          </button>
        </div>
        <div className="bg-[#1E1E6F] rounded-[40px] p-2 shadow-2xl flex-1 flex flex-col lg:flex-row overflow-hidden border border-white/5">
          <div className="w-full lg:w-1/3 bg-[#13134e] rounded-[38px] flex flex-col items-center justify-center p-10 relative">
            <div className="relative group">
              <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full border-8 border-[#1E1E6F] overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                <img
                  src={
                    preview ||
                    (formData.foto
                      ? `http://localhost:5000/avatars/${formData.foto}`
                      : defaultAvatar)
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-4 right-4 bg-white p-4 rounded-full shadow-xl text-[#1E1E6F] cursor-pointer hover:bg-blue-50 transition-colors border-2 border-[#1E1E6F]">
                <FaCamera size={22} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-8 font-bold">Foto Profil Admin</p>
          </div>
          <div className="flex-1 bg-white p-8 lg:p-16 rounded-[38px] lg:-ml-10 z-10 flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold pr-14"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Konfirmasi Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}