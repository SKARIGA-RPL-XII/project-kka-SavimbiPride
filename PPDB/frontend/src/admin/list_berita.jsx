import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Notif from "../components/notif";
import SideBar from "../components/sidebar";
import { FaEdit } from "react-icons/fa";

export default function ListJurusan() {
  const navigate = useNavigate();

  const [dataJurusan, setDataJurusan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNotif, setShowNotif] = useState({
    show: false,
    type: "confirm",
    message: "",
  });

  const API_URL = "http://localhost:5000/api/berita";
  const token = sessionStorage.getItem("token");

  // Perbaikan fungsi fetch: tambah pengecekan res.ok
  const fetchJurusan = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setDataJurusan(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil data berita:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJurusan();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleDelete = () => {
    setShowNotif({
      show: true,
      type: "confirm",
      message: `Apakah anda yakin ingin menghapus ${selectedIds.length} data terpilih?`,
    });
  };

  // Perbaikan fungsi delete: Menggunakan Promise.all agar paralel dan lebih cepat
  const confirmDelete = async () => {
    try {
      const deletePromises = selectedIds.map((id) =>
        fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const responses = await Promise.all(deletePromises);
      
      // Cek apakah semua request berhasil
      const isAllSuccess = responses.every(res => res.ok);

      if (isAllSuccess) {
        setShowNotif({
          show: true,
          type: "success",
          message: "Data berhasil dihapus",
        });
        setSelectedIds([]);
        fetchJurusan();
      } else {
        throw new Error("Beberapa data gagal dihapus");
      }
    } catch (error) {
      console.error("Gagal hapus data:", error);
      setShowNotif({
        show: true,
        type: "failed",
        message: "Gagal menghapus beberapa data",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <SideBar />

      {showNotif.show && (
        <Notif
          type={showNotif.type}
          message={showNotif.message}
          onConfirm={confirmDelete}
          onCancel={() => setShowNotif({ ...showNotif, show: false })}
          onClose={() => setShowNotif({ ...showNotif, show: false })}
        />
      )}

      <div className="flex-1 p-8 bg-[#f5f5f5] flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-400 mb-6 lowercase">list berita</h1>
        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">

          <div className="flex justify-between items-center mb-6">
            <div className="text-white/50 text-xs uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Total Data: <span className="text-white">{dataJurusan.length}</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/tambah-berita")}
                className="bg-green-600 text-white px-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Tambah
              </button>

              <button
                disabled={selectedIds.length === 0}
                onClick={handleDelete}
                className={`px-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                  selectedIds.length
                    ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer active:scale-95"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                Hapus
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-inner flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr className="text-[#1E1E6F] text-sm">
                    <th className="p-4 text-center border-r">NO</th>
                    <th className="p-4 border-r">Gambar</th>
                    <th className="p-4 border-r">judul</th>
                    <th className="p-4 border-r">deskripsi</th>
                    <th className="p-4 text-center">Tools</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400">
                        Memuat data...
                      </td>
                    </tr>
                  ) : dataJurusan.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400">
                        Data jurusan kosong
                      </td>
                    </tr>
                  ) : (
                    dataJurusan.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="p-4 text-center text-sm border-r">{index + 1}</td>

                        <td className="p-4 border-r">
                          <div className="flex justify-center">
                            <img
                              src={`http://localhost:5000${item.gambar}`}
                              alt={item.judul}
                              className="w-48 h-28 object-cover rounded-lg shadow-sm border-2 border-[#1E1E6F]/20"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/150x150?text=No+Image";
                              }}
                            />
                          </div>
                        </td>

                        <td className="p-4 font-bold text-[#1E1E6F] border-r">
                          {item.judul}
                        </td>

                        <td className="p-4 border-r">
                          {item.deskripsi}
                        </td>

                        <td className="p-4">
                          <div className="flex justify-center items-center gap-4">
                            <button
                              onClick={() => navigate(`/edit-berita/${item.id}`)}
                              className="bg-blue-100 text-blue-700 px-4 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-200 transition-all cursor-pointer shadow-sm"
                            >
                              <FaEdit /> EDIT
                            </button>

                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelect(item.id)}
                              className="w-5 h-5 accent-[#1E1E6F] cursor-pointer"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}