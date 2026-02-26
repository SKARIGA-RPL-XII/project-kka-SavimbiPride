import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Notif from "../components/notif"; 

export default function TambahJurusan() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [notif, setNotif] = useState({ show: false, type: "", message: "" });

  const closeNotif = () => {
    setNotif({ ...notif, show: false });
    if (notif.type === "success") {
      navigate("/list-jurusan");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama || !deskripsi || !gambar) {
      setNotif({
        show: true,
        type: "failed",
        message: "Nama, deskripsi, dan gambar wajib diisi!"
      });
      return;
    }

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("deskripsi", deskripsi);
    formData.append("gambar", gambar);

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/jurusan/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setNotif({
        show: true,
        type: "success",
        message: "Jurusan berhasil ditambahkan!"
      });
      
    } catch (err) {
      console.error(err);
      setNotif({
        show: true,
        type: "failed",
        message: err.response?.data?.message || "Gagal menambahkan jurusan"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-100 min-h-screen relative">
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={closeNotif}
          onConfirm={closeNotif}
          onCancel={closeNotif}
        />
      )}

      <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl min-h-[500px] flex flex-col">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-[#1E1E6F] px-5 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 cursor-pointer"
          >
            &lt; kembali
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-12 text-white flex-1">
          <div className="w-full md:w-1/2">
            <div className="w-full h-80 rounded-2xl border-4 border-dashed border-white/30 overflow-hidden flex items-center justify-center bg-white/10">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/50 italic">Preview Gambar Muncul Di Sini</span>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <label className="block text-xs mb-2 uppercase tracking-widest font-black italic">
                  Nama Jurusan :
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-white rounded-full py-3 px-6 text-black outline-none focus:ring-4 focus:ring-blue-400 transition-all"
                  placeholder="Contoh: Teknik Komputer Jaringan"
                />
              </div>

              <div>
                <label className="block text-xs mb-2 uppercase tracking-widest font-black italic">
                  Deskripsi :
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-white rounded-3xl py-3 px-6 h-32 text-black outline-none focus:ring-4 focus:ring-blue-400 resize-none transition-all"
                  placeholder="Masukkan deskripsi singkat jurusan..."
                />
              </div>

              <div>
                <label className="block text-xs mb-2 uppercase tracking-widest font-black italic cursor-pointer">
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
                      file:text-xs file:font-black file:uppercase
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
                className={`px-12 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-lg ${
                  loading 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 active:scale-95 cursor-pointer"
                }`}
              >
                {loading ? "Proses Menyimpan..." : "Simpan Jurusan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}