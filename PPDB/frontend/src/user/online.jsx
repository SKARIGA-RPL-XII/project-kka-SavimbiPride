import React, { useState, useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowDown, FaArrowLeft } from "react-icons/fa";
import Notif from "../components/notif";
import characterIcon from "../assets/horey.png"; 

const OnlinePayment = () => {
  const navigate = useNavigate();
  const [notif, setNotif] = useState({
    open: false,
    type: "",
    message: "",
  });
  const [form, setForm] = useState({
    nama: "",
    email: "",
    diterimaDi: "",
    uangGedung: "",
    hargaSeragam: "",
    spp: "",
    total: "",
    userId: ""
  });

  const total =
    Number(form.uangGedung) +
    Number(form.hargaSeragam) +
    Number(form.spp);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/payment/data-pembayaran", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = res.data;

        setForm({
          nama: data.username,
          email: data.email,
          diterimaDi: data.jurusan_diterima,
          uangGedung: data.uang_gedung,
          hargaSeragam: data.harga_seragam,
          spp: data.spp,
          userId: data.id
        });

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setNotif({
      open: true,
      type: "confirm",
      message: "Apakah kamu yakin ingin melanjutkan pembayaran?",
    });
  };

  const processPayment = async () => {
    try {
      setNotif({ open: false });
      const res = await axios.post(
        "http://localhost:5000/api/payment/submit",
        { total },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const snapToken = res.data.token || res.data.snapToken;

      if (!snapToken) {
        setNotif({
          open: true,
          type: "failed",
          message: "Token pembayaran tidak ditemukan dari server.",
        });
        return;
      }

      if (!window.snap) {
        setNotif({
          open: true,
          type: "failed",
          message: "Snap.js belum termuat.",
        });
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: function () {
          setNotif({
            open: true,
            type: "success",
            message: "Pembayaran berhasil!",
          });

          setTimeout(() => {
            navigate(`/daftar/${form.userId}`);
          }, 1500);
        },

        onPending: function () {
          setNotif({
            open: true,
            type: "confirm",
            message: "Menunggu pembayaran kamu...",
          });
        },

        onError: function (result) {
          console.log(result);
          setNotif({
            open: true,
            type: "failed",
            message: "Pembayaran gagal!",
          });
        },

        onClose: function () {
          setNotif({
            open: true,
            type: "failed",
            message:
              "Kamu menutup popup tanpa menyelesaikan pembayaran.",
          });
        },
      });
    } catch (error) {
      console.error(error);
      setNotif({
        open: true,
        type: "failed",
        message: "Terjadi kesalahan saat memproses pembayaran.",
      });
    }
  };

  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="min-h-screen bg-[#000045] flex flex-col items-center justify-center p-4">
      {notif.open && (
        <Notif
          type={notif.type}
          message={notif.message}
          onConfirm={processPayment}
          onCancel={() => setNotif({ open: false })}
          onClose={() => setNotif({ open: false })}
        />
      )}

      <div className="w-full max-w-4xl flex flex-col">
        <div className="bg-[#1a3a8a] p-4 rounded-2xl shadow-2xl w-full flex flex-col">        
          <header className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-6 left-6 z-10 bg-white text-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
            >
              <FaArrowLeft className="inline mr-1" /> KEMBALI
            </button>
          </header>

          <div className="bg-gray-200 rounded-2xl p-6">
            <h2 className="text-center font-bold tracking-[0.3em] text-[#1a3a8a] text-sm mb-6">
              ONLINE
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 justify-center items-start">
              <div className="flex flex-col gap-4 w-full md:w-80">               
                <div className="bg-[#1a3a8a] p-5 rounded-2xl text-white shadow-lg">
                  <h3 className="text-center text-20 font-semibold mb-4 tracking-widest">Data Diri</h3>
                  
                  <div className="mb-3">
                    <label className="text-[20px] ml-2 mb-1 block">Nama</label>
                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      className="bg-white w-full px-4 py-1.5 rounded-full text-black text-sm outline-none"
                    />
                  </div>

                  <div className="mb-1">
                    <label className="text-[20px] ml-2 mb-1 block">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      readOnly
                      className="bg-white w-full px-4 py-1.5 rounded-full text-black text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#1a3a8a] p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <p className="flex items-center gap-1 text-[15px] leading-tight">
                      Selamat anda di terima di
                      <FaArrowDown className="text-[20px] animate-bounce" />
                    </p>
                    <img 
                      src={characterIcon} 
                      alt="character" 
                      className="w-30 h-30 object-contain"
                    />
                  </div>
                  <input
                    type="text"
                    name="diterimaDi"
                    value={form.diterimaDi}
                    readOnly
                    className="bg-white w-full px-4 py-1.5 rounded-full text-black text-sm outline-none"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Detail Bayar */}
              <div className="bg-[#1a3a8a] p-6 rounded-2xl w-full md:w-96 text-white shadow-lg flex flex-col">
                <h3 className="text-center text-xs font-semibold mb-6 tracking-widest">detail bayar</h3>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-[15px] ml-2 mb-1 block uppercase">uang gedung</label>
                    <input
                      type="text"
                      name="uangGedung"
                      value={formatRupiah(form.uangGedung)}
                      readOnly
                      className="bg-white w-full px-4 py-1.5 rounded-full text-black text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[15px] ml-2 mb-1 block uppercase">harga seragam</label>
                    <input
                      type="text"
                      name="hargaSeragam"
                      value={formatRupiah(form.hargaSeragam)}
                      readOnly
                      className="bg-white w-full px-4 py-1.5 rounded-full text-black text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[15px] ml-2 mb-1 block uppercase">spp</label>
                    <input
                      type="text"
                      name="spp"
                      value={formatRupiah(form.spp)}
                      readOnly
                      className="bg-white w-full px-4 py-1.5 rounded-full text-black text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-white/30 pt-4 mb-4">
                  <label className="text-[15px] ml-2 mb-1 block uppercase font-bold">total</label>
                  <input
                    type="text"
                    name="total"
                    value={formatRupiah(total)}
                    readOnly
                    className="bg-white w-full px-4 py-1.5 rounded-full text-black text-sm outline-none font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={notif.open}
                  className="w-full cursor-pointer bg-[#1e5c2e] hover:bg-green-700 py-2 rounded-lg font-bold text-xs tracking-widest transition-colors mt-auto"
                >
                  Bayar
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlinePayment;