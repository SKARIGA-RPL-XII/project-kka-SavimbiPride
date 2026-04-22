import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {FaCamera, FaSave, FaArrowLeft, FaTimes, FaCheck, FaArrowRight} from "react-icons/fa";
import Cropper from "react-easy-crop";
import Notif from "../components/notif";
import defaultAvatar from "../assets/default-avatar.png";

const API_BASE_URL = "http://localhost:5000";

export default function Daftar() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("data-diri");
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });
  const [jurusanList, setJurusanList] = useState([]);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState(null)
  const [isLocked, setIsLocked] = useState(false);
  
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [formData, setFormData] = useState({
    user_id: null,
    username: "",
    email: "",
    foto: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat: "",
    no_telp: "",
    agama: "",
    kewarganegaraan: "",
    nama_sekolah: "",
    alamat_sekolah: "",
    tahun_lulus: "",
    nama_ayah: "",
    nama_ibu: "",
    pekerjaan_ayah: "",
    pekerjaan_ibu: "",
    penhir_ayah: "",
    penhir_ibu: "",
    no_telp_ayah: "",
    no_telp_ibu: "",
    penhas_ayah: "tidak ada",
    penhas_ibu: "tidak ada",
    jurusan1: "tidakAda",
    jurusan2: "tidakAda",
    ijazah: null,
    registrationStatus: "",
    paymentStatus: "",
    accepted_jurusan_id: null
  });

  const fetchJurusan = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/jurusan/all`);
      const data = await res.json();
      setJurusanList(data);
    } catch (err) {
      console.error("Gagal ambil jurusan:", err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        if (data.paymentStatus === "lunas") {
        setIsLocked(true); 
      } 
      else if (data.registrationStatus === 'diterima') {
        return navigate("/payment");
      }

      if (['proses', 'tidak_diterima'].includes(data.registrationStatus)) {
        setIsLocked(true);
      }

        setFormData((prev) => ({
        ...prev,

        paymentStatus: data.paymentStatus ?? prev.paymentStatus,
        registrationStatus: data.registrationStatus ?? prev.registrationStatus,
        accepted_jurusan_id: data.accepted_jurusan_id ?? null,

        user_id: data.user_id ?? prev.user_id,
        username: data.username ?? prev.username,
        email: data.email ?? prev.email,
        foto: data.foto ?? prev.foto,

        jenis_kelamin: data.jenis_kelamin ?? prev.jenis_kelamin,
        tempat_lahir: data.tempat_lahir ?? prev.tempat_lahir,
        tanggal_lahir: data.tanggal_lahir
          ? new Date(data.tanggal_lahir).toISOString().split("T")[0]
          : prev.tanggal_lahir,
        alamat: data.alamat ?? prev.alamat,
        no_telp: data.no_telp ?? prev.no_telp,
        agama: data.agama ?? prev.agama,
        kewarganegaraan: data.kewarganegaraan ?? prev.kewarganegaraan,
        nama_sekolah: data.nama_sekolah ?? prev.nama_sekolah,
        alamat_sekolah: data.alamat_sekolah ?? prev.alamat_sekolah,
        tahun_lulus: data.tahun_lulus
          ? new Date(data.tahun_lulus).toISOString().split("T")[0]
          : prev.tahun_lulus,

        nama_ayah: data.nama_ayah ?? prev.nama_ayah,
        nama_ibu: data.nama_ibu ?? prev.nama_ibu,
        pekerjaan_ayah: data.pekerjaan_ayah ?? prev.pekerjaan_ayah,
        pekerjaan_ibu: data.pekerjaan_ibu ?? prev.pekerjaan_ibu,
        penhir_ayah: data.penhir_ayah ?? prev.penhir_ayah,
        penhir_ibu: data.penhir_ibu ?? prev.penhir_ibu,
        no_telp_ayah: data.no_telp_ayah ?? prev.no_telp_ayah,
        no_telp_ibu: data.no_telp_ibu ?? prev.no_telp_ibu,
        penhas_ayah: data.penhas_ayah ?? prev.penhas_ayah,
        penhas_ibu: data.penhas_ibu ?? prev.penhas_ibu,

        jurusan1: data.jurusan1 ?? "tidakAda",
        jurusan2: data.jurusan2 ?? "tidakAda",

        foto_ijazah: data.foto_ijazah ?? prev.foto_ijazah,
      }));
      }
    } catch (err) {
      console.error("Gagal ambil profile:", err);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchJurusan();
    if (id) fetchProfile();
  }, [id, fetchProfile, fetchJurusan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleFileProcessing = (file) => {
      if (file) {
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";

        if (isImage || isPDF) {
          setFormData((prev) => ({ ...prev, ijazah: file }));
          
          if (isImage) {
            setFilePreview(URL.createObjectURL(file));
          } else {
            setFilePreview("pdf");
          }
        } else {
          setNotif({ show: true, type: "error", message: "Format harus PDF atau Gambar!" });
        }
      }
    };

    const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    if (isImage || isPDF) {
      setFormData((prev) => ({ ...prev, ijazah: file }));

      if (isImage) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview("pdf");
      }
    } else {
      setNotif({
        show: true,
        type: "error",
        message: "Format file harus PDF atau Gambar!"
      });
    }
  };

  const createCroppedImage = async () => {
    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageToCrop;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        setPreview(URL.createObjectURL(file));
        setFormData({ ...formData, foto: file });
        setImageToCrop(null); 
      }, "image/jpeg");
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = () => {
    if (activeTab === "data-diri") setActiveTab("keluarga");
    else if (activeTab === "keluarga") setActiveTab("jurusan");
  };

  const handlePrev = () => {
    if (activeTab === "keluarga") setActiveTab("data-diri");
    else if (activeTab === "jurusan") setActiveTab("keluarga");
  };

  const onCropComplete = useCallback((_area, pixels) => {
      setCroppedAreaPixels(pixels);
    }, []);

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (isLocked) {
        return setNotif({
          show: true,
          type: "failed",
          message: "Data sudah dikirim dan sedang diproses."
        });
      }

      if (!formData.jurusan1 || !formData.jurusan2 || !formData.ijazah) {
        return setNotif({
          show: true,
          type: "failed",
          message: "Lengkapi data jurusan dan ijazah!",
        });
      }

      if (formData.jurusan1 === formData.jurusan2) {
        return setNotif({
          show: true,
          type: "failed",
          message: "Jurusan tidak boleh sama!",
        });
      }

      const dataToSend = new FormData();

      // kirim jurusan
      dataToSend.append("jurusan1", formData.jurusan1);
      dataToSend.append("jurusan2", formData.jurusan2);

      dataToSend.append("foto_ijazah", formData.ijazah);

      const response = await fetch(
        `${API_BASE_URL}/api/user/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: dataToSend,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setNotif({
        show: true,
        type: "success",
        message: "Pendaftaran Berhasil Dikirim!",
      });

      setIsLocked(true);

      setTimeout(() => navigate(0), 2000);

    } catch (err) {
      setNotif({
        show: true,
        type: "failed",
        message: err.message,
      });
    }
  };

  const handleDownloadBukti = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/pdf/bukti`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
          }
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Bukti_Daftar.pdf";
      a.click();
    } catch (error) {
      console.error("Gagal download:", error);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-[#1E1E6F] min-h-screen font-sans">
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={() => setNotif(prev => ({ ...prev, show: false }))}
          onCancel={() => setNotif(prev => ({ ...prev, show: false }))}
          onConfirm={notif.type === "confirm" ? handleSave : undefined}
        />
      )}

      {imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl h-[60vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="mt-6 flex gap-4 w-full max-w-2xl">
            <button onClick={() => setImageToCrop(null)} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all">
              <FaTimes /> BATAL
            </button>
            <button onClick={createCroppedImage} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all">
              <FaCheck /> TERAPKAN
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
        {/* HEADER NAVIGATION */}
        <div className="p-6 flex flex-col bg-[#1E1E6F] md:flex-row justify-between items-center gap-4 border-b border-white/10">
        {activeTab === "data-diri" ? (
            <button onClick={() => navigate("/home")} className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-xl text-sm transition-all cursor-pointer">
            <FaArrowLeft /> Kembali
          </button>
          ) : (
            <button onClick={handlePrev} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 cursor-pointer">
              <FaArrowLeft /> SEBELUMNYA 
            </button>
          )}
          
          <div className="flex bg-black/30 p-1 rounded-2xl">
            <TabBtn active={activeTab === "data-diri"} onClick={() => setActiveTab("data-diri")} label="DATA DIRI" />
            <TabBtn active={activeTab === "keluarga"} onClick={() => setActiveTab("keluarga")} label="KELUARGA" />
            <TabBtn active={activeTab === "jurusan"} onClick={() => setActiveTab("jurusan")} label="JURUSAN" />
          </div>

          {activeTab === "jurusan" ? (
            formData.registrationStatus === "tidak_diterima" ? (
              <div className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                <FaTimes/> TIDAK DITERIMA
              </div>
            ) : formData.paymentStatus === "lunas" ? (
              <div className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                <FaCheck /> DITERIMA
              </div>
            ) : formData.registrationStatus === "proses" ? (
              <div className="bg-yellow-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                <FaCheck /> SEDANG DIPROSES
              </div>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <FaSave /> DAFTAR SEKARANG
              </button>
            )
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              SELANJUTNYA <FaArrowRight />
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIDEBAR: FOTO */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1E1E6F] p-8 rounded-3xl flex flex-col items-center text-center border border-white/10 shadow-xl">
              <div className="relative group">
                <div className="w-44 h-44 rounded-full border-4 border-white overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                  <img
                    src={preview || (formData.foto && formData.foto !== "default-avatar.png" ? `http://localhost:5000/avatars/${formData.foto}` : defaultAvatar)}
                    alt="Profile"
                    className="w-44 h-44 rounded-full"
                  />
                </div>
                <label className="absolute bottom-2 right-2 bg-white p-3 rounded-full text-[#1E1E6F] cursor-pointer hover:bg-blue-50 shadow-xl transition-all">
                  <FaCamera size={20} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={isLocked}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setImageToCrop(reader.result); 
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <h2 className="text-white mt-4 font-bold text-xl uppercase tracking-wider">{formData.username || "Calon Siswa"}</h2>
            </div>
            
            <div className="bg-[#1E1E6F] p-6 rounded-3xl shadow-md border border-white/10">
              <h3 className="text-white font-bold text-sm mb-3 border-b border-white/20 pb-2 uppercase">Ketentuan Foto</h3>
              <div className="text-[11px] text-white/70 space-y-2 leading-relaxed">
                <p>• Background Merah/Biru polos dan Berpakaian rapi/Seragam sekolah.</p>
                <p>• Wajah menghadap kamera, tidak menggunakan kacamata hitam.</p>
                <p>• Bagi Laki-laki, rambutnya di rapikan.</p>
                <p>• Bagi perempuan berhijab, gunakan hijab yang rapi. jika non-islam, rambutnya di rapikan.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#1E1E6F] rounded-3xl p-6 shadow-xl overflow-y-auto max-h-[75vh] custom-scrollbar border border-white/10">
            {activeTab === "data-diri" && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                    <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Informasi Akun
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem label="Nama Lengkap" name="username" value={formData.username} onChange={handleChange} disabled={isLocked} />
                    <InputItem label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} disabled={isLocked} />
                    <InputItem label="Tanggal Lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={handleChange} disabled={isLocked} />
                    <InputItem label="No Telepon" name="no_telp" value={formData.no_telp} onChange={handleChange} disabled={isLocked} />
                    <InputItem label="Agama" name="agama" value={formData.agama} onChange={handleChange} disabled={isLocked} />
                    <InputItem label="Kewarganegaraan" name="kewarganegaraan" value={formData.kewarganegaraan} onChange={handleChange} disabled={isLocked} />
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Jenis Kelamin</label>
                        <div className="flex gap-4 p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <RadioItem label="Laki-laki" name="jenis_kelamin" value="laki-laki" checked={formData.jenis_kelamin === "laki-laki"} onChange={handleChange} disabled={isLocked} />
                        <RadioItem label="Perempuan" name="jenis_kelamin" value="perempuan" checked={formData.jenis_kelamin === "perempuan"} onChange={handleChange} disabled={isLocked} />
                        </div>
                    </div>
                    </div>
                    <div className="mt-4">
                    <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Alamat Lengkap</label>
                    <textarea name="alamat" value={formData.alamat || ""} onChange={handleChange} disabled={isLocked} className={isLocked ? "w-full bg-gray-200 cursor-not-allowed border-none rounded-xl p-3 h-24 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none shadow-inner" : "w-full bg-white border-none rounded-xl p-3 h-24 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none shadow-inner"} />
                  </div>
                </section>

                <section>
                    <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Pendidikan Terakhir
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem label="Nama Sekolah" name="nama_sekolah" value={formData.nama_sekolah} onChange={handleChange} disabled={isLocked} />
                    <InputItem label="Tahun Lulus" name="tahun_lulus" type="date" value={formData.tahun_lulus} onChange={handleChange} />
                    
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Alamat Sekolah</label>
                        <textarea 
                        name="alamat_sekolah" 
                        value={formData.alamat_sekolah || ""} 
                        onChange={handleChange} 
                        disabled={isLocked}
                        placeholder="Tuliskan alamat lengkap sekolah asal..."
                        className={isLocked ? "w-full mt-1 bg-gray-200 cursor-not-allowed border-none rounded-xl p-3 h-24 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none shadow-inner" : "w-full mt-1 bg-white border-none rounded-xl p-3 h-24 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none shadow-inner"} 
                        />
                    </div>
                    </div>
                </section>
                </div>
            )}

            {/* TAB 2: KELUARGA */}
            {activeTab === "keluarga" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FamilyCard 
                    title="Informasi Ayah" 
                    fields={[
                        { label: "Nama Ayah", name: "nama_ayah", value: formData.nama_ayah },
                        { label: "Pekerjaan", name: "pekerjaan_ayah", value: formData.pekerjaan_ayah },
                        { label: "Pendidikan", name: "penhir_ayah", value: formData.penhir_ayah },
                        { label: "No Telp", name: "no_telp_ayah", value: formData.no_telp_ayah },
                    ]}
                    incomeName="penhas_ayah"
                    incomeValue={formData.penhas_ayah}
                    onChange={handleChange}
                    disabled={isLocked}
                  />
                  <FamilyCard 
                    title="Informasi Ibu" 
                    fields={[
                        { label: "Nama Ibu", name: "nama_ibu", value: formData.nama_ibu },
                        { label: "Pekerjaan", name: "pekerjaan_ibu", value: formData.pekerjaan_ibu },
                        { label: "Pendidikan", name: "penhir_ibu", value: formData.penhir_ibu },
                        { label: "No Telp", name: "no_telp_ibu", value: formData.no_telp_ibu },
                    ]}
                    incomeName="penhas_ibu"
                    incomeValue={formData.penhas_ibu}
                    onChange={handleChange}
                    disabled={isLocked}
                  />
                </div>
              </div>
            )}

            {activeTab === "jurusan" && (
              <div className="space-y-8 animate-fadeIn">
                <section>
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Pemilihan Program Studi
                  </h3>
                  
                  <div className="grid gap-6">
                    {formData.paymentStatus === "lunas" ? (
                      <div className="space-y-4 animate-fadeIn">

                        <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20">
                          <label className="text-[10px] font-bold text-green-400 uppercase ml-1 tracking-widest">
                            Selamat 🎉 Anda Diterima di Program Studi
                          </label>

                          <div className="w-full mt-3 bg-white rounded-xl p-5 text-sm text-black font-extrabold flex justify-between items-center shadow-lg">
                            <span className="uppercase text-base">
                              {jurusanList.length > 0 
                                ? (jurusanList.find(j => 
                                    String(j.id) === String(formData.accepted_jurusan_id)
                                  )?.nama || "Menunggu Penetapan Admin")
                                : "Memuat data..."}
                            </span>

                            <span className="bg-green-500 text-white text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider">
                              LULUS
                            </span>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={handleDownloadBukti}
                              className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold shadow-md transition-all active:scale-95"
                            >
                              Download Bukti Daftar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                          <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
                            Pilihan Jurusan Kesatu
                          </label>
                          <select
                            name="jurusan1"
                            value={formData.jurusan1}
                            onChange={handleChange}
                            disabled={isLocked}
                            className={
                              isLocked
                                ? "bg-gray-200 cursor-not-allowed w-full mt-2 rounded-xl p-3 text-sm text-black outline-none"
                                : "w-full mt-2 bg-white border-none rounded-xl p-3 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400"
                            }
                          >
                            <option value="">-- Pilih Jurusan --</option>
                            {jurusanList.map((j) => (
                              <option key={j.id} value={j.id}>
                                {j.nama}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                          <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
                            Pilihan Jurusan Kedua
                          </label>
                          <select
                            name="jurusan2"
                            value={formData.jurusan2}
                            onChange={handleChange}
                            disabled={isLocked}
                            className={
                              isLocked
                                ? "bg-gray-200 cursor-not-allowed w-full mt-2 rounded-xl p-3 text-sm text-black outline-none"
                                : "w-full mt-2 bg-white border-none rounded-xl p-3 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400"
                            }
                          >
                            <option value="">-- Pilih Jurusan --</option>
                            {jurusanList.map((j) => (
                              <option
                                key={j.id}
                                value={j.id}
                                disabled={String(j.id) === String(formData.jurusan1)}
                              >
                                {j.nama}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <section className="mt-8">
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Dokumen Pendukung
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
                        Upload Ijazah Terakhir / SKL (PDF/JPG)
                      </label>
                      
                      <div className="relative group">
                        <label
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 
                            ${isDragging 
                              ? "border-blue-400 bg-blue-500/20 scale-[1.01]" 
                              : "border-white/20 bg-white/5 hover:border-blue-400 hover:bg-blue-500/5"
                            } ${isLocked ? "cursor-not-allowed opacity-80" : ""}`}
                        >
                          <div className="flex flex-col items-center justify-center p-4 w-full">
                            {formData.ijazah || formData.foto_ijazah ? (
                              <div className="flex flex-col items-center animate-fadeIn">
                                {(filePreview === "pdf" || 
                                  (formData.foto_ijazah && formData.foto_ijazah.endsWith(".pdf"))) ? (
                                  <div className="bg-red-500/20 p-4 rounded-2xl mb-2">
                                    <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="relative w-32 h-32 mb-2 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                                    <img
                                      src={filePreview || `${API_BASE_URL}/ijazah/${formData.foto_ijazah}`}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}

                                <p className="text-[11px] font-bold text-green-400 uppercase tracking-tight">
                                  Dokumen Tersimpan:
                                </p>
                                <p className="text-[10px] text-white/60 truncate max-w-[200px]">
                                  {formData.ijazah?.name || formData.foto_ijazah}
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className={`p-4 rounded-full mb-3 ${isDragging ? "bg-blue-500 text-white" : "bg-white/5 text-white/40"}`}>
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                  </svg>
                                </div>
                                <p className="text-sm text-white/60">
                                  <span className="font-bold text-blue-400">Klik untuk upload</span> atau drag & drop
                                </p>
                                <p className="text-[10px] text-white/40 mt-1 uppercase">
                                  PDF, JPG atau PNG (Maks. 2MB)
                                </p>
                              </>
                            )}
                          </div>

                          <input
                            type="file"
                            name="ijazah"
                            className="hidden"
                            accept=".pdf,image/*"
                            disabled={isLocked}
                            onChange={(e) => handleFileProcessing(e.target.files[0])}
                          />
                        </label>

                        {formData.ijazah && !isLocked && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, ijazah: null }));
                              setFilePreview(null);
                            }}
                            className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition-all shadow-xl z-20"
                          >
                            <FaTimes size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function TabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-4 md:px-8 py-2 rounded-xl text-[10px] md:text-[11px] font-black tracking-widest transition-all cursor-pointer ${active ? "bg-white text-[#1E1E6F] shadow-lg" : "text-white/50 hover:text-white"}`}>
      {label}
    </button>
  );
}

function InputItem({ label, name, value, onChange, type = "text", disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">{label}</label>
      <input 
        disabled={disabled}
        type={type} 
        name={name} 
        value={value || ""} 
        onChange={onChange}
        className={`w-full border-none rounded-xl p-2.5 text-sm outline-none transition-all shadow-inner 
          ${disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black focus:ring-2 focus:ring-blue-400"}`} 
      />
    </div>
  );
}

function RadioItem({ label, name, value, checked, onChange, disabled }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="w-4 h-4 accent-blue-400"/>
      <span className={`text-xs font-medium ${checked ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>{label}</span>
    </label>
  );
}

function FamilyCard({ title, fields, incomeName, incomeValue, onChange, icon, disabled }) {
  const ranges = [
    { v: "tidak ada", l: "Tidak Ada" }, 
    { v: "1000000-3000000", l: "Rp 1.000.000 - 3.000.000" }, 
    { v: "4000000-6000000", l: "Rp 4.000.000 - 6.000.000" }, 
    { v: "7000000-10000000", l: "Rp 7.000.000 - 10.000.000" }
  ];
  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-sm space-y-4">
      <h3 className="text-white font-bold text-center border-b border-white/10 pb-3 flex items-center justify-center gap-2 uppercase tracking-tighter">
        <span>{icon}</span> {title}
      </h3>
      {fields.map((f, i) => (
        <InputItem key={i} label={f.label} name={f.name} value={f.value} onChange={onChange} disabled={disabled}/>
      ))}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Penghasilan</label>
        <select name={incomeName} value={incomeValue || ""} onChange={onChange} disabled={disabled} className="w-full bg-white border-none rounded-xl p-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-inner">
          <option value="">Pilih Range</option>
          {ranges.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
        </select>
      </div>
    </div>
  );
}