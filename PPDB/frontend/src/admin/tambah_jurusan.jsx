import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TambahJurusan() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama || !deskripsi || !gambar) {
      alert("Nama, deskripsi, dan gambar wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("deskripsi", deskripsi);
    formData.append("gambar", gambar);

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/jurusan/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Jurusan berhasil ditambahkan");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan jurusan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-100 min-h-screen">
      <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl min-h-[500px] flex flex-col">

        {/* Kembali */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-[#1E1E6F] px-5 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200"
          >
            &lt; kembali
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-12 text-white flex-1">

          {/* PREVIEW */}
          <div className="w-1/2">
            <div className="w-full h-80 rounded-2xl border-4 border-dashed border-gray-400 overflow-hidden flex items-center justify-center bg-gray-300">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500">Preview Gambar</span>
              )}
            </div>
          </div>

          {/* FORM INPUT */}
          <div className="w-1/2 flex flex-col justify-between">
            <div className="space-y-6">

              <div>
                <label className="block text-sm mb-2 uppercase tracking-widest font-semibold">
                  Nama :
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-white rounded-full py-3 px-6 text-black outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Masukkan nama jurusan"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 uppercase tracking-widest font-semibold">
                  Deskripsi :
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-white rounded-3xl py-3 px-6 h-32 text-black outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Masukkan deskripsi singkat"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 uppercase tracking-widest font-semibold">
                  Gambar :
                </label>
                <div className="w-full bg-white rounded-full p-1 shadow-inner">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-6
                      file:rounded-full file:border-0
                      file:text-sm file:font-bold
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
                className="bg-green-600 px-12 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-green-700 active:scale-95 transition"
              >
                {loading ? "Menyimpan..." : "Submit"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
