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

  const API_URL = "http://localhost:5000/api/jurusan";
  const token = localStorage.getItem("token");

  const fetchJurusan = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setDataJurusan(data);
    } catch (error) {
      console.error("Gagal ambil data jurusan:", error);
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
      message: "Apakah anda yakin ingin menghapus jurusan terpilih?",
    });
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedIds) {
        await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setShowNotif({
        show: true,
        type: "success",
        message: "Data jurusan berhasil dihapus",
      });

      setSelectedIds([]);
      fetchJurusan();
    } catch (error) {
      console.error("Gagal hapus jurusan:", error);
      setShowNotif({
        show: true,
        type: "failed",
        message: "Gagal menghapus data",
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
        
        <h1 className="text-2xl font-bold text-gray-400 mb-6 lowercase">list jurusan</h1>
        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">

          <div className="flex justify-between items-center mb-6">
            <div className="text-white/50 text-xs uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Total Data: <span className="text-white">{dataJurusan.length}</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/tambah-jurusan")}
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

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-2xl shadow-inner flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr className="text-[#1E1E6F] text-sm">
                    <th className="p-4 text-center border-r">NO</th>
                    <th className="p-4 border-r">Gambar</th>
                    <th className="p-4 border-r">Nama</th>
                    <th className="p-4 border-r text-left">Deskripsi</th>
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
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="p-4 text-center text-sm border-r">{index + 1}</td>

                        <td className="p-4 border-r">
                          <div className="flex justify-center">
                            <img
                              src={`http://localhost:5000${item.gambar}`}
                              alt={item.nama}
                              className="w-48 h-28 object-cover rounded-lg shadow-sm border-2 border-[#1E1E6F]/20"
                            />
                          </div>
                        </td>

                        <td className="p-4 font-bold text-[#1E1E6F] border-r">
                          {item.nama}
                        </td>

                        <td className="p-4 text-sm text-gray-500 max-w-xs border-r truncate">
                          {item.deskripsi}
                        </td>

                        <td className="p-4">
                          <div className="flex justify-center items-center gap-4">
                            <button
                              onClick={() => navigate(`/edit-jurusan/${item.id}`)}
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