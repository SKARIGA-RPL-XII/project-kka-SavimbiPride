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
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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
    <div className="min-h-screen bg-[#000045] py-10 px-4 md:px-10 text-white font-sans">
      
      {notif.open && (
        <Notif
          type={notif.type}
          message={notif.message}
          onConfirm={processPayment}
          onCancel={() => setNotif({ open: false })}
          onClose={() => setNotif({ open: false })}
        />
      )}

      <div className="max-w-6xl mx-auto bg-[#1e3a8a] rounded-[40px] p-6 md:p-10 shadow-2xl relative border border-white/10">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 bg-white text-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
        >
          <FaArrowLeft className="text-[9px]" />
          kembali
        </button>

        {/* INNER CARD */}
        <div className="bg-[#D9D9D9] rounded-[32px] p-6 md:p-10 text-black relative mt-10 shadow-inner">

          <h2 className="text-center font-black tracking-[0.3em] text-[#1a3a8a] text-sm mb-8 uppercase">
            ONLINE PAYMENT
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
          >

            {/* LEFT */}
            <div className="space-y-6">

              {/* DATA DIRI */}
              <div className="bg-[#1a3a8a] p-6 rounded-3xl text-white shadow-xl border border-white/10">
                <h3 className="text-center text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-80">
                  Data Diri
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase ml-3 mb-1 block opacity-60">
                      Nama
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      className="bg-white/10 border border-white/20 w-full px-5 py-3 rounded-2xl text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase ml-3 mb-1 block opacity-60">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      readOnly
                      className="bg-white/10 border border-white/20 w-full px-5 py-3 rounded-2xl text-white text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* JURUSAN */}
              <div className="bg-[#1a3a8a] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter">
                    Selamat anda di terima di
                    <FaArrowDown className="text-[20px] animate-bounce" />
                  </p>
                  <img
                    src={characterIcon}
                    className="w-28 h-28 object-contain drop-shadow-lg"
                  />
                </div>

                <input
                  type="text"
                  value={form.diterimaDi}
                  readOnly
                  className="bg-white w-full px-5 py-3 rounded-2xl text-[#1a3a8a] font-bold text-sm shadow-inner outline-none"
                />
              </div>

            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-center space-y-6">

              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-t-[10px] border-blue-600">

                <p className="font-black text-center mb-6 text-xl tracking-tighter border-b-2 border-dashed border-gray-100 pb-4">
                  DETAIL PEMBAYARAN
                </p>

                <div className="space-y-4 text-sm font-bold text-gray-700">

                  <div className="flex justify-between">
                    <span>Uang Gedung</span>
                    <span>{formatRupiah(form.uangGedung)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Seragam</span>
                    <span>{formatRupiah(form.hargaSeragam)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>SPP</span>
                    <span>{formatRupiah(form.spp)}</span>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl flex justify-between mt-4">
                    <span className="font-black text-blue-900">TOTAL</span>
                    <span className="font-black text-lg text-blue-900">
                      {formatRupiah(total)}
                    </span>
                  </div>

                </div>
              </div>

              {/* BUTTON */}
              <div className="w-full max-w-md">
                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm"
                >
                  Bayar Sekarang
                </button>
              </div>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default OnlinePayment;