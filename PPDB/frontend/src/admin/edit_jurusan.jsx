import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; 
import Notif from "../components/notif"; 

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
        setNotif({
          show: true,
          type: "failed",
          message: "Gagal mengambil data jurusan.",
        });
      }
    };
    fetchJurusan();
  }, [id]);

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
      const token = localStorage.getItem("token");
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
      
      setTimeout(() => navigate("/list-jurusan"), 2000);
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
    <div className="flex-1 p-8 bg-gray-100 min-h-screen">
    
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={() => setNotif({ ...notif, show: false })}
        />
      )}

      <div className="max-w-6xl mx-auto bg-[#1E1E6F] p-8 rounded-3xl shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-[#1E1E6F] px-6 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
          >
            &lt; kembali
          </button>
          <h2 className="text-white font-bold uppercase tracking-widest">Edit Jurusan</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 text-white">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="flex flex-col sm:flex-row lg:flex-col gap-6">
              <div className="flex-1">
                <p className="text-xs italic mb-2 opacity-70">Gambar Saat Ini :</p>
                <div className="bg-gray-800 w-full h-64 rounded-2xl border-2 border-gray-500 flex items-center justify-center overflow-hidden">
                  {oldGambar ? (
                    <img 
                      src={`http://localhost:5000${oldGambar}`} 
                      className="object-cover w-full h-full" 
                      alt="Lama"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">Loading gambar...</span>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs italic mb-2 text-blue-300">Preview Baru :</p>
                <div className="bg-white/10 w-full h-64 rounded-2xl border-2 border-dashed border-white/40 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/30 text-xs italic text-center px-4">
                      Gambar baru akan muncul di sini jika dipilih
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase">Nama Jurusan :</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase">Deskripsi :</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-white rounded-2xl p-4 h-40 text-black outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase">Ganti Gambar :</label>
                <div className="flex bg-white rounded-xl overflow-hidden p-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-6
                      file:rounded-lg file:border-0
                      file:text-xs file:font-bold
                      file:bg-[#1E1E6F] file:text-white
                      hover:file:bg-blue-800 transition cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`px-16 py-3 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all
                  ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-900/20"}`}
              >
                {loading ? "Menyimpan..." : "Update Data"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}