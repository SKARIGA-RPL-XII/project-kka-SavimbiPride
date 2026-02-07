import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditJurusan() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambarLama, setGambarLama] = useState("");
  const [gambarBaru, setGambarBaru] = useState(null);
  const [previewBaru, setPreviewBaru] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/jurusan";
  const token = localStorage.getItem("token");

  /* =========================
     GET DATA BY ID
  ========================= */
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        const data = await res.json();

        setNama(data.nama);
        setDeskripsi(data.deskripsi);
        setGambarLama(data.gambar);
      } catch (error) {
        console.error("Gagal ambil data jurusan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  /* =========================
     PREVIEW GAMBAR BARU
  ========================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGambarBaru(file);
    setPreviewBaru(URL.createObjectURL(file));
  };

  /* =========================
     SUBMIT EDIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("deskripsi", deskripsi);

    if (gambarBaru) {
      formData.append("gambar", gambarBaru);
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal update");

      navigate(-1);
    } catch (error) {
      console.error("Gagal edit jurusan:", error);
      alert("Gagal menyimpan perubahan");
    }
  };

  if (loading) {
    return <div className="p-8">Memuat data...</div>;
  }

  return (
    <div className="flex-1 p-8 bg-gray-100 min-h-screen">
      <div className="bg-[#1E1E6F] p-10 rounded-3xl shadow-xl min-h-[600px] max-w-[1400px] mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="bg-white text-[#1E1E6F] px-4 py-1 rounded-full text-xs font-bold mb-10"
        >
          &lt; kembali
        </button>

        <form onSubmit={handleSubmit} className="flex gap-14 text-white">

          {/* PREVIEW GAMBAR */}
          <div className="w-[55%] space-y-6">
            <div>
              <p className="text-xs italic mb-2">lama :</p>
              <div className="h-56 rounded-2xl overflow-hidden border-2 border-gray-400 bg-gray-200">
                <img
                  src={`http://localhost:5000${gambarLama}`}
                  alt="gambar lama"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-xs italic mb-2">baru :</p>
              <div className="h-56 rounded-2xl overflow-hidden border-2 border-white bg-gray-300">
                {previewBaru ? (
                  <img
                    src={previewBaru}
                    alt="preview baru"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs opacity-70">
                    belum ada gambar
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="w-[45%] flex flex-col justify-between">
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
                  required
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
                  required
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

            <div className="flex justify-end pt-8">
              <button
                type="submit"
                className="bg-green-600 px-12 py-3 rounded-full text-xs font-bold uppercase hover:bg-green-700 transition"
              >
                simpan
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
