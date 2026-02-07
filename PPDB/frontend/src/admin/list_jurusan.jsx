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

  /* =========================
     FETCH DATA
  ========================= */
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

  /* =========================
     SELECT CHECKBOX
  ========================= */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  /* =========================
     DELETE FLOW
  ========================= */
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
        type: "info",
        message: "Data jurusan berhasil dihapus",
      });

      setSelectedIds([]);
      fetchJurusan();
    } catch (error) {
      console.error("Gagal hapus jurusan:", error);
      setShowNotif({
        show: true,
        type: "info",
        message: "Gagal menghapus data",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-barrio overflow-hidden">
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

      <div className="flex-1 p-8 bg-[#f5f5f5] flex flex-col">
        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full">

          {/* HEADER */}
          <div className="flex justify-end gap-4 mb-6">
            <button
              onClick={() => navigate("/tambah-jurusan")}
              className="bg-green-600 text-white px-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-green-700"
            >
              Tambah
            </button>

            <button
              disabled={selectedIds.length === 0}
              onClick={handleDelete}
              className={`px-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedIds.length
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
              }`}
            >
              Hapus
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-inner flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="p-4 text-center">NO</th>
                    <th className="p-4">Gambar</th>
                    <th className="p-4">Nama</th>
                    <th className="p-4">Deskripsi</th>
                    <th className="p-4 text-center">Tools</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400">
                        Memuat data...
                      </td>
                    </tr>
                  )}

                  {!loading && dataJurusan.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400">
                        Data jurusan kosong
                      </td>
                    </tr>
                  )}

                  {dataJurusan.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50">
                      <td className="p-4 text-center">{index + 1}</td>

                      <td className="p-4">
                        <img
                          src={`http://localhost:5000${item.gambar}`}
                          alt={item.nama}
                          className="w-24 h-14 object-cover rounded-lg border"
                        />
                      </td>

                      <td className="p-4 font-bold text-[#1E1E6F]">
                        {item.nama}
                      </td>

                      <td className="p-4 text-sm text-gray-500 max-w-xs">
                        {item.deskripsi}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center items-center gap-4">
                          <button
                            onClick={() =>
                              navigate(`/edit-jurusan/${item.id}`)
                            }
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1"
                          >
                            <FaEdit /> EDIT
                          </button>

                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-5 h-5 accent-[#1E1E6F]"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
