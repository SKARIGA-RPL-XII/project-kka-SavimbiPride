import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaEnvelopeOpen, FaCheckDouble } from "react-icons/fa";
import axios from "axios";

const Inbox = () => {
  const navigate = useNavigate();
  const [selectedPesan, setSelectedPesan] = useState(null);
  const [dataPesan, setDataPesan] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchInbox = async () => {
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/inbox/inbox/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDataPesan(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Gagal mengambil inbox:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [token, user?.id]);

  const markAsReadLogic = async (pesan) => {
    if (pesan.is_read === 0 || pesan.is_read === "0") {
      try {
        await axios.put(
          `http://localhost:5000/api/inbox/markAsRead/${pesan.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDataPesan((prevData) =>
          prevData.map((p) => (p.id === pesan.id ? { ...p, is_read: 1 } : p))
        );

        setSelectedPesan((prev) => ({ ...prev, is_read: 1 }));
      } catch (err) {
        console.error("Gagal update status baca:", err);
      }
    }
  };

  const handleReadMessage = (pesan) => {
    setSelectedPesan(pesan);
    markAsReadLogic(pesan);
  };

  const handleBack = () => {
    if (selectedPesan) {
      setSelectedPesan(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#080841] p-6 font-barrio">
      <div className="bg-[#1E1E6F] rounded-[40px] p-8 shadow-2xl h-[650px] w-full max-w-4xl flex flex-col border border-white/10">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-white text-3xl tracking-widest uppercase italic font-black">
              {selectedPesan ? "Detail Pesan" : "Kotak Masuk"}
            </h2>
            <p className="text-blue-300/60 text-sm uppercase tracking-[0.2em] mt-1 font-bold">
              {selectedPesan ? "Pesan dari Agetha" : `${dataPesan.length} Pesan Tersedia`}
            </p>
          </div>

          <button
            onClick={handleBack}
            className="bg-white text-[#1E1E6F] px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <FaArrowLeft /> {selectedPesan ? "TUTUP" : "KEMBALI"}
          </button>
        </header>

        {/* Content Area */}
        <main className="bg-white rounded-[30px] p-6 flex-grow shadow-inner overflow-y-auto relative border-4 border-[#13134e]/10">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-900 font-bold animate-pulse">MEMUAT INBOX...</p>
            </div>
          ) : !selectedPesan ? (
            
            dataPesan.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-30">
                <FaEnvelope size={80} className="mb-4 text-blue-900" />
                <p className="text-blue-900 text-xl font-bold uppercase tracking-widest">Kosong</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dataPesan.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleReadMessage(item)}
                    className={`group flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      item.is_read === 0 || item.is_read === "0" 
                        ? "bg-blue-50 border-blue-100 shadow-md" 
                        : "bg-gray-50 border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className={`${item.is_read === 0 || item.is_read === "0" ? "text-blue-600" : "text-gray-400"}`}>
                      {item.is_read === 0 || item.is_read === "0" ? <FaEnvelope size={24} /> : <FaEnvelopeOpen size={24} />}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#1E1E6F] text-lg font-black uppercase">Agetha</span>
                        <span className="text-gray-400 text-[10px] font-bold italic">
                           {item.create_at ? new Date(item.create_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm font-bold truncate max-w-[500px]">
                        {item.tentang}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="bg-[#1E1E6F] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">Buka</span>
                    </div>
                  </div>
                ))}
              </div>
            )

          ) : (

            <div className="p-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-8 border-b-2 border-gray-100 pb-6">
                <div className="w-16 h-16 bg-[#1E1E6F] rounded-full flex items-center justify-center text-white shadow-xl">
                  <FaEnvelope size={28} />
                </div>
                <div>
                  <h3 className="text-[#1E1E6F] text-2xl font-black uppercase italic tracking-tighter leading-none">Dari: Agetha</h3>
                  <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">
                    Dikirim pada: {new Date(selectedPesan.create_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[30px] rounded-tl-none border-2 border-gray-100 shadow-sm min-h-[200px]">
                <p className="text-gray-800 text-lg font-bold leading-relaxed whitespace-pre-wrap italic">
                  "{selectedPesan.pesan}"
                </p>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <span className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                  <FaCheckDouble /> Terverifikasi oleh Sistem
                </span>
                
                {(selectedPesan.is_read === 0 || selectedPesan.is_read === "0") && (
                  <button
                    onClick={() => markAsReadLogic(selectedPesan)}
                    className="bg-[#1E1E6F] text-white text-xs px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blue-800 transition shadow-lg shadow-blue-900/20 cursor-pointer"
                  >
                    Tandai Sudah Dibaca
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Inbox;