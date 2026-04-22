import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; 
import Notif from "../components/notif"; 
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaSave } from "react-icons/fa";

export default function EditJurusan() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [oldGambar, setOldGambar] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jurusan/${id}`);
        const data = response.data;
        setNama(data.nama);
        setDeskripsi(data.deskripsi);
        setOldGambar(data.gambar);
      } catch (error) {
        console.error(error);
        setNotif({
          show: true,
          type: "failed",
          message: "Gagal mengambil data jurusan.",
        });
      }
    };
    fetchJurusan();
  }, [id]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotif({ show: true, type: "failed", message: "Ukuran file maksimal 5MB!" });
        e.target.value = "";
        return;
      }
      setGambar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("deskripsi", deskripsi);
    if (gambar) {
      formData.append("gambar", gambar);
    }

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/jurusan/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setNotif({
        show: true,
        type: "success",
        message: "Data jurusan berhasil diperbarui!",
      });
      
      setTimeout(() => navigate("/list-jurusan"), 1500);
    } catch (error) {
      setNotif({
        show: true,
        type: "failed",
        message: error.response?.data?.message || "Gagal mengupdate data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#1E1E6F] min-h-screen font-sans relative">
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={() => setNotif({ ...notif, show: false })}
          onConfirm={() => setNotif({ ...notif, show: false })}
        />
      )}

      <div className="max-w-6xl mx-auto bg-[#000045] p-8 rounded-3xl shadow-2xl border border-white/5">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-[#1E1E6F] px-6 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <IoMdArrowRoundBack size={16} /> KEMBALI
          </button>
          <h2 className="text-white font-black uppercase tracking-[0.2em] italic text-sm">
            Edit Informasi Jurusan
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 text-white">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="flex flex-col sm:flex-row lg:flex-col gap-6">
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold mb-2 opacity-50 tracking-widest">Gambar Saat Ini :</p>
                <div className="bg-black/30 w-full h-64 rounded-2xl border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                  {oldGambar ? (
                    <img 
                      src={`http://localhost:5000${oldGambar}`} 
                      className="object-cover w-full h-full" 
                      alt="Current"
                      onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Gambar+Tidak+Ditemukan"; }}
                    />
                  ) : (
                    <span className="text-gray-500 text-xs animate-pulse">Memuat gambar...</span>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold mb-2 text-blue-400 tracking-widest">Preview Gambar Baru :</p>
                <div className="bg-white/5 w-full h-64 rounded-2xl border-2 border-dashed border-blue-500/30 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-6">
                      <span className="text-white/20 text-[10px] italic leading-relaxed block">
                        Pilih file baru untuk mengganti gambar lama
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-blue-300">
                  Nama Jurusan :
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-white rounded-xl py-3 px-5 text-black outline-none focus:ring-4 focus:ring-blue-500/50 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-blue-300">
                  Deskripsi Jurusan :
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-white rounded-2xl py-4 px-5 h-44 text-black outline-none focus:ring-4 focus:ring-blue-500/50 resize-none transition-all font-medium"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-blue-300">
                  Unggah Gambar Baru :
                </label>
                <div className="flex bg-white rounded-xl overflow-hidden p-1 shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-400
                      file:mr-4 file:py-2 file:px-6
                      file:rounded-lg file:border-0
                      file:text-[10px] file:font-black file:uppercase
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
                className={`px-16 py-4 rounded-xl text-xs flex justify-center items-center gap-2 font-black uppercase tracking-[0.3em] transition-all shadow-xl cursor-pointer
                  ${loading 
                    ? "bg-gray-600 cursor-not-allowed opacity-50" 
                    : "bg-green-600 hover:bg-green-500 active:scale-95 shadow-green-900/40"}`}
              >
              <FaSave size={20} /> {loading ? "Menyimpan Data..." : "Perbarui Jurusan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}