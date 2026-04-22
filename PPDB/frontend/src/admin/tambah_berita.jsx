import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Notif from "../components/notif"; 
import { IoMdArrowRoundBack } from "react-icons/io";

export default function TambahBerita() {
  const navigate = useNavigate();

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });

  // Membersihkan URL preview agar tidak membebani memori browser
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const closeNotif = () => {
    setNotif({ ...notif, show: false });
    if (notif.type === "success") {
      navigate("/list-berita");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setNotif({ show: true, type: "failed", message: "File harus berupa gambar!" });
      return;
    }

    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul || !deskripsi || !gambar) {
      setNotif({
        show: true,
        type: "failed",
        message: "Judul, deskripsi, dan gambar wajib diisi!"
      });
      return;
    }

    const formData = new FormData();
    formData.append("judul", judul);
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
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-[#1E1E6F] px-5 py-2 rounded-full text-xs font-bold hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2"
          >
            <IoMdArrowRoundBack size={16} /> kembali
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-12 text-white flex-1">
          {/* Kolom Kiri: Preview */}
          <div className="w-full md:w-1/2">
            <div className="w-full h-80 rounded-2xl border-4 border-dashed border-white/20 overflow-hidden flex items-center justify-center bg-white/5">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <span className="text-white/30 italic text-sm">Preview Gambar Muncul Di Sini</span>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Input */}
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] mb-2 uppercase tracking-widest font-black italic text-blue-300">
                  judul berita :
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-white rounded-xl py-3 px-5 text-black outline-none focus:ring-4 focus:ring-blue-500/50 transition-all font-medium"
                  placeholder="Masukkan judul berita..."
                />
              </div>

              <div>
                <label className="block text-[10px] mb-2 uppercase tracking-widest font-black italic text-blue-300">
                  Deskripsi :
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-white rounded-2xl py-4 px-5 h-44 text-black outline-none focus:ring-4 focus:ring-blue-500/50 resize-none transition-all font-medium"
                  placeholder="Masukkan isi berita secara lengkap..."
                />
              </div>

              <div>
                <label className="block text-[10px] mb-2 uppercase tracking-widest font-black italic text-blue-300">
                  Upload Gambar :
                </label>
                <div className="w-full bg-white rounded-full p-1 shadow-inner overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-6
                      file:rounded-full file:border-0
                      file:text-[10px] file:font-black file:uppercase
                      file:bg-[#1E1E6F] file:text-white
                      hover:file:bg-blue-800 transition cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                  loading 
                    ? "bg-gray-600 cursor-not-allowed opacity-50" 
                    : "bg-green-600 hover:bg-green-500 active:scale-95 cursor-pointer shadow-green-900/20"
                }`}
              >
                {loading ? "Sedang Mengirim..." : "Posting Berita"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}