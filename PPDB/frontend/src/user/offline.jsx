import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import Notif from "../components/Notif";
import characterIcon from "../assets/horey.png"; 

const OfflinePayment = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const [notif, setNotif] = useState({
    show: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/payment/data-pembayaran-offline",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBayar = () => {
    setNotif({
      show: true,
      type: "confirm",
      message: "Yakin ingin melakukan pembayaran offline?"
    });
  };

  const submitPembayaran = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payment/submit-offline",
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // update status langsung tanpa reload
      setData(prev => ({
        ...prev,
        status_pembayaran: "proses"
      }));

      setNotif({
        show: true,
        type: "success",
        message: "Pembayaran berhasil dikirim! Silakan unduh bukti."
      });

    } catch (err) {
      setNotif({
        show: true,
        type: "failed",
        message: err.response?.data?.message || "Gagal submit pembayaran"
      });
    }
  };

  const handleUnduh = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/pdf/bukti-offline",
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // WAJIB untuk PDF
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bukti-pembayaran.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error(error);
      setNotif({
        show: true,
        type: "failed",
        message: "Gagal mengunduh bukti pembayaran"
      });
    }
  };

  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(angka);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000045] py-10 px-4 md:px-10 text-white font-sans">
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onConfirm={() => {
            setNotif({ show: false });
            submitPembayaran();
          }}
          onCancel={() => setNotif({ show: false })}
          onClose={() => setNotif({ show: false })}
        />
      )}

      <div className="max-w-6xl mx-auto bg-[#1e3a8a] rounded-[40px] p-6 md:p-10 shadow-2xl relative border border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 bg-white text-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
        >
          <FaArrowLeft className="text-[9px]" />
          <span>kembali</span>
        </button>

        <div className="bg-[#D9D9D9] rounded-[32px] p-6 md:p-10 text-black relative mt-10 shadow-inner">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            <div className="space-y-6">
              <div className="bg-[#1a3a8a] p-6 rounded-3xl text-white shadow-xl border border-white/10">
                <h3 className="text-center text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-80">Data Diri</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase ml-3 mb-1 block opacity-60">Nama Lengkap</label>
                    <input
                      type="text"
                      readOnly
                      value={data?.username}
                      className="bg-white/10 border border-white/20 w-full px-5 py-3 rounded-2xl text-white text-sm outline-none focus:bg-white/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a3a8a] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter">
                    Selamat anda di terima di <FaArrowDown className="text-[20px] animate-bounce" />
                  </p>
                  <img 
                    src={characterIcon} 
                    alt="character" 
                    className="w-30 h-30 object-contain drop-shadow-lg"
                  />
                </div>
                <input
                  type="text"
                  value={data?.jurusan}
                  readOnly
                  className="bg-white w-full px-5 py-3 rounded-2xl text-[#1a3a8a] font-bold text-sm shadow-inner outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-t-[10px] border-blue-600 relative overflow-hidden">
                
                <p className="font-black text-center mb-6 text-xl tracking-tighter border-b-2 border-dashed border-gray-100 pb-4">
                  BUKTI PEMBAYARAN
                </p>
                
                <div className="space-y-4 text-sm font-bold text-gray-700">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="opacity-50 text-[10px] uppercase">Nama</span>
                    <span>{data?.username}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="opacity-50 text-[10px] uppercase">Jurusan</span>
                    <span>{data?.jurusan}</span>
                  </div>

                  <div className="py-2 space-y-2 opacity-80">
                    <div className="flex justify-between font-medium">
                      <span>Uang Gedung</span>
                      <span>{formatRupiah(data?.uang_gedung)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Harga Seragam</span>
                      <span>{formatRupiah(data?.harga_seragam)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>SPP</span>
                      <span>{formatRupiah(data?.spp)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                    <span className="font-black text-blue-900">TOTAL</span>
                    <span className="font-black text-lg text-blue-900">{formatRupiah(data?.total_harga)}</span>
                  </div>

                  <div className="flex justify-between text-[9px] mt-6 pt-4 border-t border-gray-100 italic">
                    <span>
                      TANGGAL DITERIMA:<br/>
                      <b className="text-[11px] not-italic">{data?.tanggal_diterima ? new Date(data.tanggal_diterima).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</b>
                    </span>
                    <span className="text-right">
                      ALAMAT SEKOLAH:<br />
                      <b className="text-[11px] not-italic uppercase">Jl. Apel No.9 Malang</b>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center w-full max-w-md space-y-4">
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-4">
                  <span className="text-red-500 uppercase">Note:</span> Klik tombol di bawah untuk memproses pembayaran dan mengunduh bukti fisik untuk dibawa ke sekolah.
                </p>

                {data?.status_pembayaran === "proses" ? (
                  <button
                    onClick={handleUnduh}
                    className="w-full bg-green-700 hover:bg-green-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm cursor-pointer"
                  >
                    Unduh Bukti PDF
                  </button>
                ) : (
                  <button
                    onClick={handleBayar}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm cursor-pointer"
                  >
                    Konfirmasi Bayar
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePayment;