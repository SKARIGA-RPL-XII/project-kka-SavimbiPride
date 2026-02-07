import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import defaultAvatar from "../assets/default-avatar.png";
import Notif from "../components/notif";

export default function ProfileAdmin() {
  const navigate = useNavigate();
  const adminId = localStorage.getItem("adminId");
  const token = localStorage.getItem("token");
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [notif, setNotif] = useState({
    show: false,
    type: "info",
    message: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    foto: "",
  });

  const showAlert = (message, type = "info") => {
    setNotif({ show: true, message, type });
  };

  const closeNotif = () => {
    setNotif({ ...notif, show: false });
  };

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!adminId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/${adminId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setFormData((prev) => ({
          ...prev,
          username: res.data.username,
          email: res.data.email,
          foto: res.data.foto,
        }));
      } catch (err) {
        showAlert(
          "Akses ditolak: " + (err.response?.data?.message || err.message),
        );
      }
    };
    fetchAdmin();
  }, [adminId, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      showAlert("Format file salah! Gunakan JPG, PNG, GIF, atau WEBP.");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert("Kegedean! Maksimal ukuran file cuma 5MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      return showAlert("Konfirmasi password tidak cocok!");
    }

    setNotif({
      show: true,
      type: "confirm",
      message: "Yakin ingin simpan perubahan?",
      onConfirm: async () => {
        try {
          const data = new FormData();
          data.append("username", formData.username);
          data.append("email", formData.email);

          // Cek apakah user mengisi password baru
          const isPasswordChanged = formData.password !== "";

          if (isPasswordChanged) {
            data.append("password", formData.password);
          }

          if (selectedFile) {
            data.append("foto", selectedFile);
          }

          const res = await axios.put(
            `http://localhost:5000/api/admin/edit/${adminId}`,
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );

          // LOGIKA LOGOUT OTOMATIS JIKA GANTI PASSWORD
          if (isPasswordChanged) {
            showAlert(
              "Password berhasil diubah. Silakan login kembali!",
              "info",
            );

            // Beri jeda sedikit agar user bisa membaca alert sebelum ditendang ke login
            setTimeout(() => {
              localStorage.clear();
              navigate("/login");
            }, 2000);

            return; // Hentikan eksekusi kode di bawahnya
          }

          // Jika hanya update data biasa (tanpa ganti password)
          setFormData((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
            foto: res.data.foto,
          }));

          setPreview(null);
          setSelectedFile(null);
          showAlert("Profil Berhasil Diperbarui!");
        } catch (err) {
          showAlert(err.response?.data?.message || "Gagal memperbarui profil");
        }
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-barrio">
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={closeNotif}
          onConfirm={() => {
            if (notif.onConfirm) notif.onConfirm();
            closeNotif();
          }}
          onCancel={closeNotif}
        />
      )}

      <div className="flex-1 p-8 bg-[#f5f5f5] h-full flex flex-col">
        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full relative overflow-hidden">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="bg-white text-[#1E1E6F] px-5 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 cursor-pointer"
            >
              ← kembali
            </button>
          </div>

          <div className="bg-white rounded-[40px] p-8 flex gap-8 h-full">
            <div className="w-1/3 bg-[#1E1E6F] rounded-[30px] flex flex-col items-center justify-center p-6 relative">
              <div className="relative mb-12">
                <div className="w-48 h-48 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
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
                <label className="absolute bottom-2 right-2 bg-[#1E1E6F] p-3 rounded-full border-2 border-white text-white cursor-pointer">
                  <FaCamera size={18} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <button
                onClick={handleUpdate}
                className="bg-green-800 text-white px-10 py-2 rounded-full text-sm font-bold uppercase hover:bg-green-900 cursor-pointer"
              >
                Simpan
              </button>
            </div>

            <div className="w-2/3 flex flex-col gap-6">
              <div className="bg-[#1E1E6F] p-6 rounded-[25px] grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white text-xs uppercase ml-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full bg-white rounded-full py-2.5 px-6 outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white text-xs uppercase ml-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-white rounded-full py-2.5 px-6 outline-none text-sm"
                  />
                </div>

                <div className="space-y-2 relative">
                  <label className="text-white text-xs uppercase ml-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full bg-white rounded-full py-2.5 px-6 outline-none text-sm pr-12"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E1E6F]"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white text-xs uppercase ml-2">
                    Konfirmasi
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full bg-white rounded-full py-2.5 px-6 outline-none text-sm"
                    placeholder="********"
                  />
                </div>
              </div>
              <div className="bg-[#1E1E6F] p-6 rounded-[25px] flex-1">
                <textarea
                  className="w-full h-full bg-transparent text-white outline-none resize-none text-sm italic"
                  placeholder="Catatan Admin"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}