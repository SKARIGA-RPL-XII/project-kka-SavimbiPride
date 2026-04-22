import React, { useEffect, useState } from "react";
import SideBar from "../components/sidebar";
import defaultAvatar from "../assets/default-avatar.png";

export default function ListUser() {
  const [dataUsers, setDataUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJurusan, setSelectedJurusan] = useState("");
  const [loading, setLoading] = useState(true);
  const filteredUsers = dataUsers.filter((user) => {
    const matchesName = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJurusan = selectedJurusan === "" || user.jurusan === selectedJurusan;
    return matchesName && matchesJurusan;
  });

  const daftarJurusan = [...new Set(dataUsers.map((u) => u.jurusan))].filter(Boolean);

  const API_URL = "http://localhost:5000/api/list_user/calon";
  const token = sessionStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      
      setDataUsers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Gagal ambil data user:", error);
      setDataUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <SideBar />

      <div className="flex-1 p-8 bg-[#f5f5f5] flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-400 mb-6 lowercase">
          list calon siswa
        </h1>

        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="text-white/50 text-xs uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Total Data: <span className="text-white">{dataUsers.length}</span>
            </div>
            <div className="flex flex-1 justify-end items-center gap-3 w-full max-w-2xl">

            <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
            />
            </div>
            
            <div className="relative w-full max-w-[180px]">
            <select
                value={selectedJurusan}
                onChange={(e) => setSelectedJurusan(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-white/15 transition-all"
            >
                <option value="" className="text-black">Semua Jurusan</option>
                {daftarJurusan.map((jur, idx) => (
                <option key={idx} value={jur} className="text-black">{jur}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/30">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
            </div>
        </div>
          </div>
          <div className="bg-white rounded-2xl shadow-inner flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr className="text-[#1E1E6F] text-sm">
                    <th className="p-4 text-center border-r">NO</th>
                    <th className="p-4 border-r">Foto</th>
                    <th className="p-4 border-r">Nama</th>
                    <th className="p-4 border-r">Jurusan</th>
                  </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                    <td
                        colSpan="4"
                        className="p-10 text-center text-gray-400 italic"
                    >
                        <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Memuat data calon siswa...
                        </div>
                    </td>
                    </tr>
                ) : filteredUsers.length === 0 ? (
                    <tr>
                    <td
                        colSpan="4"
                        className="p-10 text-center text-gray-400 font-medium"
                    >
                        {searchTerm ? `Nama "${searchTerm}" tidak ditemukan` : "Data calon siswa kosong"}
                    </td>
                    </tr>
                ) : (
                    filteredUsers.map((user, index) => (
                    <tr
                        key={user.id || index}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                    >
                        <td className="p-4 text-center text-sm border-r text-gray-600 font-medium">
                        {index + 1}
                        </td>
                        <td className="p-4 border-r">
                        <div className="flex justify-center">
                            <img
                            src={
                                user.foto && user.foto !== "default-avatar.png"
                                ? `http://localhost:5000/avatars/${user.foto}`
                                : defaultAvatar
                            }
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#1E1E6F]/20 shadow-md"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultAvatar;
                            }}
                            />
                        </div>
                        </td>
                        <td className="p-4 font-bold text-[#1E1E6F] border-r text-sm">
                        {user.username}
                        </td>
                        <td className="p-4 text-sm text-gray-600 border-r">
                        <span className="bg-blue-100 text-[#1E1E6F] px-3 py-1 rounded-full text-[11px] font-black uppercase">
                            {user.jurusan || "Belum Pilih Jurusan"}
                        </span>
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