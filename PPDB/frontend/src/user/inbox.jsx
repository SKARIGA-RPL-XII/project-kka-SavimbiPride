import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Inbox = () => {
  const navigate = useNavigate();
  const [selectedPesan, setSelectedPesan] = useState(null);
  const [dataPesan, setDataPesan] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchInbox = async () => {
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/inbox/inbox/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const handleMarkAsRead = () => {
    if (selectedPesan) {
      markAsReadLogic(selectedPesan);
    }
  };

  const handleBack = () => {
    if (selectedPesan) {
      setSelectedPesan(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#000045] p-4">
      <div className="bg-[#1a3a8a] rounded-2xl p-4 shadow-2xl h-[500px] w-full flex flex-col">

        <header className="mb-4">
          <p className="text-gray-400 text-xs mb-2">
            {selectedPesan ? "pesan inbox" : "list inbox"}
          </p>

          <button
            onClick={handleBack}
            className="bg-white text-black text-[10px] px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            ← kembali
          </button>
        </header>

        <main className="bg-white rounded-2xl p-4 flex-grow shadow-inner overflow-y-auto">

          {loading ? (
            <p className="text-center text-gray-500 text-sm">
              Memuat pesan...
            </p>
          ) : !selectedPesan ? (

            dataPesan.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">
                Tidak ada pesan.
              </p>
            ) : (
              <div className="space-y-4">
                {dataPesan.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleReadMessage(item)}
                    className={`cursor-pointer group ${item.is_read === 0 || item.is_read === "0" ? "opacity-100" : "opacity-70"}`}
                  >
                    <span className="text-[#1a3a8a] text-[10px] font-bold block mb-1">
                      dari : Agetha
                    </span>

                    <div className="bg-[#1a3a8a] h-10 w-full rounded-full flex items-center px-4 group-hover:opacity-90 transition-opacity">
                      <span className="text-white text-xs truncate">
                        {item.tentang}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )

          ) : (

            <div className="animate-fade-in">
              <span className="text-[#1a3a8a] text-[10px] font-bold block mb-3">
                dari : Agetha
              </span>

              <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none w-[85%] shadow-sm">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {selectedPesan.pesan}
                </p>

                <p className="text-gray-400 text-[10px] mt-3">
                  {selectedPesan.create_at
                    ? new Date(selectedPesan.create_at).toLocaleString()
                    : ""}
                </p>

                {(selectedPesan.is_read === 0 || selectedPesan.is_read === "0") && (
                  <button
                    onClick={handleMarkAsRead}
                    className="mt-4 bg-[#1a3a8a] text-white text-[10px] px-3 py-1 rounded-full font-bold hover:opacity-90 transition cursor-pointer"
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