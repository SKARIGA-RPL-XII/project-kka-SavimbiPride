import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Notif from "../components/notif"; 
import { IoMdArrowRoundBack } from "react-icons/io";

export default function TambahBerita() {
  const navigate = useNavigate();

  // State disesuaikan dengan controller: judul, deskripsi, gambar
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [notif, setNotif] = useState({ show: false, type: "", message: "" });

  // Membersihkan memori preview saat komponen tidak lagi digunakan
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const closeNotif = () => {
    setNotif({ ...notif, show: false });
    if (notif.type === "success") {
      navigate("/list-berita"); // Arahkan ke list berita setelah sukses
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file sederhana
    if (!file.type.startsWith("image/")) {
      setNotif({ show: true, type: "failed", message: "File harus berupa gambar!" });
      return;
    }

    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Client Side
    if (!judul || !deskripsi || !gambar) {
      setNotif({
        show: true,
        type: "failed",
        message: "Judul, deskripsi, dan gambar wajib diisi!"
      });
      return;
    }

    const formData = new FormData();
    formData.append("judul", judul); // Menggunakan "judul" agar sesuai controller
    formData.append("deskripsi", deskripsi);
    formData.append("gambar", gambar);

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/berita/", formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setNotif({
        show: true,
        type: "success",
        message: "Berita berhasil ditambahkan!"
      });
      
    } catch (err) {
      console.error(err);
      setNotif({
        show: true,
        type: "failed",
        message: err.response?.data?.message || "Gagal menambahkan berita"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#1E1E6F] min-h-screen relative font-sans">
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={closeNotif}
          onConfirm={closeNotif}
          onCancel={closeNotif}
        />
      )}

      <div className="bg-[#000045] p-8 rounded-3xl shadow-xl min-h-[500px] flex flex-col border border-white/5">
        {/* Tombol Kembali */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-[#1E1E6F] px-5 py-2 rounded-full text-xs font-bold hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2"
          >
            <IoMdArrowRoundBack size={16} /> KEMBALI
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-12 text-white flex-1">
          {/* Sisi Kiri: Preview Gambar */}
          <div className="w-full md:w-1/2">
            <div className="w-full h-80 rounded-2xl border-4 border-dashed border-white/30 overflow-hidden flex items-center justify-center bg-white/5 relative group">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-white/40 italic text-sm">Preview Gambar Muncul Di Sini</p>
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Input Data */}
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <label className="block text-xs mb-2 uppercase tracking-widest font-black italic text-blue-300">
                  Judul Berita :
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-white rounded-full py-3 px-6 text-black outline-none focus:ring-4 focus:ring-blue-400/50 transition-all placeholder:text-gray-400"
                  placeholder="Masukkan judul berita..."
                />
              </div>

              <div>
                <label className="block text-xs mb-2 uppercase tracking-widest font-black italic text-blue-300">
                  Deskripsi Berita :
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-white rounded-3xl py-4 px-6 h-40 text-black outline-none focus:ring-4 focus:ring-blue-400/50 resize-none transition-all placeholder:text-gray-400"
                  placeholder="Tuliskan isi atau deskripsi berita di sini..."
                />
              </div>

              <div>
                <label className="block text-xs mb-2 uppercase tracking-widest font-black italic text-blue-300">
                  Upload Gambar Utama :
                </label>
                <div className="w-full bg-white rounded-full p-1 shadow-inner overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-6
                      file:rounded-full file:border-0
                      file:text-xs file:font-black file:uppercase
                      file:bg-[#1E1E6F] file:text-white
                      hover:file:bg-blue-800 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-4 rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-2xl ${
                  loading 
                    ? "bg-gray-500 cursor-not-allowed opacity-70" 
                    : "bg-green-600 hover:bg-green-500 active:scale-95 cursor-pointer"
                }`}
              >
                {loading ? "Sedang Menyimpan..." : "Posting Berita"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}