import React, { useState, useEffect, useCallback } from "react";
import SideBar from "../components/sidebar";
import axios from "axios";
import { FaCog, FaCheckCircle } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png"; 
import Notif from "../components/notif";

export default function Pembayaran() {
  const [dataPembayaran, setDataPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });
  const [isEdit, setIsEdit] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showLunasModal, setShowLunasModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [inputLunas, setInputLunas] = useState("");
  const [configHarga, setConfigHarga] = useState({
    uang_gedung: 0,
    harga_seragam: 0,
    spp: 0,
  });

  const token = localStorage.getItem("token");
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

  const openLunasModal = (item) => {
    setSelectedPayment(item);
    setInputLunas(item.total_harga || ""); 
    setShowLunasModal(true);
  };

  const handleConfirmLunas = async () => {
    if (!inputLunas || inputLunas <= 0) {
      alert("Masukkan nominal pembayaran yang valid");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/verifikasi-bayar/${selectedPayment.id}`, 
        { total_pembayaran: inputLunas }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotif({ show: true, type: "success", message: "Status Berhasil Diperbarui!" });
      setShowLunasModal(false);
      fetchData(); 
    } catch (err) {
      setNotif({ show: true, type: "failed", message: "Gagal verifikasi pembayaran" });
    }
  };

  const formatRupiah = (value) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

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
                className={`w-full border-2 border-black text-white py-3 text-xl font-black uppercase tracking-widest cursor-pointer transition-all 
                  ${isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {showLunasModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1E1E6F]">
            <div className="bg-[#1E1E6F] p-4 text-center">
              <h3 className="text-white font-black uppercase tracking-widest">Konfirmasi Pelunasan</h3>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Nama Siswa</p>
                <p className="text-lg font-black text-[#1E1E6F] uppercase">{selectedPayment?.username}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">Input Nominal Pembayaran</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={inputLunas ? formatRupiah(inputLunas) : ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      setInputLunas(rawValue);
                    }}
                    placeholder="Contoh: 1.500.000"
                    className="w-full border-4 border-gray-100 rounded-2xl p-4 focus:border-green-500 outline-none font-black text-2xl text-green-600 transition-all text-center"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => { setShowLunasModal(false); setInputLunas(""); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-400 font-bold hover:bg-gray-50 cursor-pointer transition-all"
                >
                  BATAL
                </button>
                <button 
                  onClick={handleConfirmLunas}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-black hover:bg-green-700 shadow-[0_4px_0_0_#15803d] cursor-pointer active:translate-y-1 active:shadow-none transition-all"
                >
                  LUNASKAN
                </button>
              </div>
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
                              onClick={() => openLunasModal(item)}
                              className={`px-6 py-1.5 rounded-full text-[10px] font-black transition-all ${
                                item.status === "lunas"
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-md"
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