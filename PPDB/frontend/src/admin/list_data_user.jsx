import React, { useState, useEffect, useCallback } from "react";
import SideBar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaEye, FaSearch } from "react-icons/fa"; // Tambahkan FaSearch
import defaultAvatar from "../assets/default-avatar.png";
import Notif from "../components/notif";

export default function ListDataUser() {
  const navigate = useNavigate();
  
  const [dataPembayaran, setDataPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State untuk pencarian
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/list_data_user";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/DataUserAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDataPembayaran(res.data);
    } catch (err) {
      console.error("Gagal ambil data pembayaran", err);
      setNotif({
        show: true,
        type: "failed",
        message: "Gagal memuat data pembayaran dari server.",
      });
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // LOGIKA FILTER PENCARIAN
  const filteredData = dataPembayaran.filter((item) =>
    item.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <SideBar />
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={() => setNotif({ ...notif, show: false })}
        />
      )}
      <div className="flex-1 p-8 bg-[#f5f5f5] flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-400 mb-6 lowercase">
          list Data User
        </h1>

        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-white/50 text-xs uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Total Data:{" "}
              <span className="text-white">{filteredData.length}</span>
            </div>

            {/* INPUT PENCARIAN */}
            <div className="relative w-full max-w-xs">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input
                type="text"
                placeholder="Cari nama user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-inner flex-1 overflow-hidden border-4 border-white/10">
            <div className="overflow-y-auto h-full custom-scrollbar">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr className="text-[#1E1E6F] text-xs uppercase tracking-tighter">
                    <th className="p-4 text-center border-r w-16">NO</th>
                    <th className="p-4 border-r w-32">Foto</th>
                    <th className="p-4 border-r text-left">Nama Lengkap</th>
                    <th className="p-4 border-r text-center">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-gray-400">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-gray-400 italic">
                        {searchTerm ? `Nama "${searchTerm}" tidak ditemukan.` : "Data kosong."}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-4 text-center text-sm border-r text-gray-500">
                          {index + 1}
                        </td>
                        <td className="p-4 border-r">
                          <div className="flex justify-center">
                            <img
                              src={
                                item.foto
                                  ? `http://localhost:5000/avatars/${item.foto}`
                                  : defaultAvatar
                              }
                              alt="User"
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#1E1E6F]/20 shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultAvatar;
                              }}
                            />
                          </div>
                        </td>
                        <td className="p-4 font-bold text-[#1E1E6F] border-r uppercase text-sm">
                          {item.username}
                        </td>
                        <td className="p-4 border-r">
                          <div className="flex justify-center">
                            <button
                              onClick={() => navigate(`/detail-data-user/${item.id}`)}
                              className="px-6 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer active:scale-95 transition-all"
                            >
                              <FaEye size={12} />
                              Detail
                            </button>
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