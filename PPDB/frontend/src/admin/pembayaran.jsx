import React, { useState, useEffect, useCallback } from "react";
import SideBar from "../components/sidebar";
import axios from "axios";
import { FaCog, FaCheckCircle } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png"; 
import Notif from "../components/notif";

export default function Pembayaran() {
  const [dataPembayaran, setDataPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState({ 
    show: false, 
    type: "", 
    message: "", 
    item: null
  });
  const [showConfig, setShowConfig] = useState(false);
  const [configHarga, setConfigHarga] = useState({
    uang_gedung: 0,
    harga_seragam: 0,
    spp: 0,
  });

  const token = sessionStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/admin";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/data-bayar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataPembayaran(res.data);
    } catch (err) {
      console.error("Gagal ambil data pembayaran", err);
      setNotif({
        show: true,
        type: "failed",
        message: "Gagal memuat data pembayaran dari server."
      });
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/config-harga`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data) {
        setConfigHarga({
          uang_gedung: res.data.uang_gedung || 0,
          harga_seragam: res.data.harga_seragam || 0,
          spp: res.data.spp || 0,
        });
      }
    } catch (err) {
      console.error("Gagal ambil konfigurasi harga", err);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchData();
    fetchConfig();
  }, [fetchData, fetchConfig]);

  const handleSaveConfig = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/config-harga`,
        configHarga,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotif({
        show: true,
        type: "success",
        message: res.data.message
      });

      setShowConfig(false);
      fetchConfig();
    } catch (err) {
      setNotif({
        show: true,
        type: "failed",
        message: err.response?.data?.message || "Gagal menyimpan data"
      });
    }
  };

  const triggerConfirmLunas = (item) => {
    setNotif({
      show: true,
      type: "confirm",
      message: `Ubah status pembayaran ${item.username} menjadi LUNAS?`,
      item: item // Simpan data item yang mau dieksekusi
    });
  };

  const handleConfirmLunas = async () => {
    const item = notif.item;
    if (!item) return;

    try {
      // Tutup notif confirm dulu agar tidak tumpang tindih
      setNotif({ ...notif, show: false });
      setLoading(true);
      
      await axios.put(
        `${API_URL}/verifikasi-bayar/${item.id}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotif({ 
        show: true, 
        type: "success", 
        message: `Status ${item.username} Berhasil diperbarui!` 
      });
      fetchData();
    } catch {
      setNotif({ 
        show: true, 
        type: "failed", 
        message: "Gagal memperbarui status." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <SideBar />
        {notif.show && (
          <Notif 
            type={notif.type} 
            message={notif.message} 
            onConfirm={handleConfirmLunas}
            onCancel={() => setNotif({ ...notif, show: false })} 
            onClose={() => setNotif({ ...notif, show: false })} 
          />
        )}
      {showConfig && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E1E6F] border-4 border-black overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b-4 border-black">
              <h2 className="text-white text-xl font-black uppercase tracking-tighter">
                Konfigurasi Harga
              </h2>
              <button
                onClick={() => setShowConfig(false)}
                className="bg-red-600 border-2 border-black text-black w-10 h-10 flex items-center justify-center font-bold hover:bg-red-700 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                X
              </button>
            </div>

            <div className="bg-white p-8 flex flex-col gap-6 border-t-2 border-[#1E1E6F]">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#1E1E6F] uppercase flex justify-between">
                    <span>Uang Gedung</span>
                    <span className="text-green-600">Rp {Number(configHarga.uang_gedung).toLocaleString()}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={configHarga.uang_gedung}
                      onChange={(e) => setConfigHarga({...configHarga, uang_gedung: e.target.value})}
                      className="w-full border-2 border-[#1E1E6F] rounded-xl p-3 pl-10 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#1E1E6F] uppercase flex justify-between">
                    <span>Harga Seragam</span>
                    <span className="text-green-600">Rp {Number(configHarga.harga_seragam).toLocaleString()}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={configHarga.harga_seragam}
                      onChange={(e) => setConfigHarga({...configHarga, harga_seragam: e.target.value})}
                      className="w-full border-2 border-[#1E1E6F] rounded-xl p-3 pl-10 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#1E1E6F] uppercase flex justify-between">
                    <span>Harga SPP</span>
                    <span className="text-green-600">Rp {Number(configHarga.spp).toLocaleString()}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={configHarga.spp}
                      onChange={(e) => setConfigHarga({...configHarga, spp: e.target.value})}
                      className="w-full border-2 border-[#1E1E6F] rounded-xl p-3 pl-10 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveConfig}
                className="w-full border-2 border-black text-white py-3 text-xl font-black uppercase tracking-widest cursor-pointer transition-all">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-8 bg-[#f5f5f5] flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-400 mb-6 lowercase">list pembayaran</h1>

        <div className="bg-[#1E1E6F] p-8 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6">
             <div className="text-white/50 text-xs uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Total Data: <span className="text-white">{dataPembayaran.length}</span>
            </div>
            <button
              onClick={() => setShowConfig(true)}
              className="bg-yellow-500 text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-yellow-600 transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <FaCog /> Konfigurasi Harga
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-inner flex-1 overflow-hidden border-4 border-white/10">
            <div className="overflow-y-auto h-full custom-scrollbar">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr className="text-[#1E1E6F] text-xs uppercase tracking-tighter">
                    <th className="p-4 text-center border-r w-16">NO</th>
                    <th className="p-4 border-r w-32">Foto</th>
                    <th className="p-4 border-r text-left">Nama Lengkap</th>
                    <th className="p-4 border-r text-center">Status</th>
                    <th className="p-4 text-center w-40">Tools</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400">Memuat data...</td>
                    </tr>
                  ) : (
                    dataPembayaran.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="p-4 text-center text-sm border-r">{index + 1}</td>
                        <td className="p-4 border-r">
                          <div className="flex justify-center">
                            <img
                              src={item.foto ? `http://localhost:5000/avatars/${item.foto}` : defaultAvatar}
                              alt="User"
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#1E1E6F]/20 shadow-sm"
                            />
                          </div>
                        </td>
                        <td className="p-4 font-bold text-[#1E1E6F] border-r uppercase text-sm">
                          {item.username}
                        </td>
                        <td className="p-4 border-r">
                          <div className="flex justify-center">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              item.status === 'lunas' ? 'bg-green-100 text-green-700 border-green-200' :
                              item.status === 'proses' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              'bg-red-100 text-red-700 border-red-200'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              disabled={item.status === "lunas"}
                              onClick={() => triggerConfirmLunas(item)}
                              className={`px-6 py-1.5 rounded-full text-[10px] font-black transition-all ${
                                item.status === "lunas"
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-md active:scale-95"
                              }`}
                            >
                              <FaCheckCircle className="inline mr-1" /> LUNAS
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