import React, { useEffect, useState, useRef } from "react";
import Notif from "../components/notif";
import SideBar from "../components/sidebar";
import { FaUserCircle, FaSearch, FaFilter } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png";
import { io } from "socket.io-client";

export default function ListUser() {
  const [dataUsers, setDataUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetId, setTargetId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [resetRequestEmail, setResetRequestEmail] = useState(null);
  
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const [showNotif, setShowNotif] = useState({
    show: false,
    type: "confirm",
    message: "",
    actionType: "",
  });

  const API_URL = "http://localhost:5000/api/list_user";
  const token = sessionStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDataUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchUsers();

      socketRef.current = io("http://localhost:5000");

      socketRef.current.on("connect", () => {
      });

      socketRef.current.on("admin_notif_reset", (data) => {

        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }

        setResetRequestEmail(data.email);

        setShowNotif({
          show: true,
          type: "success",
          message: `PERMINTAAN RESET: ${data.username?.toUpperCase()} (${data.email})`,
        });

        setTimeout(() => setResetRequestEmail(null), 30000);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off("admin_notif_reset");
          socketRef.current.disconnect();
        }
      };
    }, []);


  const handleAction = (id, type) => {
    setTargetId(id);
    setShowNotif({
      show: true,
      type: "confirm",
      message:
        type === "delete"
          ? "Apakah anda yakin ingin menghapus user ini?"
          : "Apakah anda yakin ingin mereset password user ini?",
      actionType: type,
    });
  };

  const handleConfirm = async () => {
    const isDelete = showNotif.actionType === "delete";
    const url = isDelete ? `${API_URL}/${targetId}` : `${API_URL}/reset/${targetId}`;
    const method = isDelete ? "DELETE" : "PUT";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const result = await res.json();
      if (res.ok) {
        setShowNotif({
          show: true,
          type: "success",
          message: result.message || (isDelete ? "User berhasil dihapus" : "Password berhasil direset"),
        });
        setResetRequestEmail(null);
        fetchUsers();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setShowNotif({
        show: true,
        type: "failed",
        message: error.message || "Terjadi kesalahan server",
      });
    }
  };

  const filteredUsers = dataUsers.filter((user) => {
    const matchesName = user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesName && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <SideBar />
      <audio ref={audioRef} src="/notif.wav" preload="auto" />

      {showNotif.show && (
        <Notif
          type={showNotif.type}
          message={showNotif.message}
          onConfirm={handleConfirm}
          onCancel={() => setShowNotif({ ...showNotif, show: false })}
          onClose={() => setShowNotif({ ...showNotif, show: false })}
        />
      )}

      <div className="flex-1 p-8 bg-[#f5f5f5] flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-400 mb-6 lowercase">list user</h1>

        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-white/50 text-xs uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10 shrink-0">
              Total: <span className="text-white">{filteredUsers.length}</span>
            </div>

            <div className="flex gap-3 w-full max-w-lg">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                <input
                  type="text"
                  placeholder="Cari nama user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                />
              </div>
              
              <div className="relative w-40 shrink-0">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="all" className="text-black">Semua</option>
                  <option value="diterima" className="text-black">Diterima</option>
                  <option value="tidak_diterima" className="text-black">Tidak Diterima</option>
                  <option value="proses" className="text-black">proses</option>
                </select>
                <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px] pointer-events-none" />
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
                    <th className="p-4 border-r">Status</th>
                    <th className="p-4 text-center">Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400">Memuat data...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400">Data tidak ditemukan</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => {
                      const isRequesting = resetRequestEmail === user.email;
                      return (
                        <tr 
                          key={user.id} 
                          className={`border-b border-gray-100 hover:bg-blue-50 transition-all duration-500 ${isRequesting ? 'bg-red-50' : ''}`}
                        >
                          <td className="p-4 text-center text-sm border-r text-gray-500">
                            {index + 1}
                          </td>
                          <td className="p-4 border-r">
                            <div className="flex justify-center relative">
                              {isRequesting && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                </span>
                              )}
                              <img
                                src={user.foto && user.foto !== "default-avatar.png" ? `http://localhost:5000/avatars/${user.foto}` : defaultAvatar}
                                className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm transition-all ${isRequesting ? 'border-red-500 scale-110' : 'border-[#1E1E6F]/20'}`}
                                onError={(e) => (e.target.src = defaultAvatar)}
                              />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[#1E1E6F] border-r text-sm">
                            <div className="flex flex-col">
                              {user.username}
                              {isRequesting && <span className="text-[10px] text-red-500 animate-pulse font-normal italic">Meminta reset password...</span>}
                            </div>
                          </td>
                          <td className="p-4 border-r text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                              user.status === 'diterima' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.status || 'belum daftar'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleAction(user.id, "reset")} 
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${isRequesting ? 'bg-[#FFCC00] text-white animate-bounce' : 'bg-[#FFCC00] text-black hover:brightness-110'}`}
                              >
                                {isRequesting ? 'RESET SEKARANG' : 'reset'}
                              </button>
                              <button onClick={() => handleAction(user.id, "delete")} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-red-700 uppercase">hapus</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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