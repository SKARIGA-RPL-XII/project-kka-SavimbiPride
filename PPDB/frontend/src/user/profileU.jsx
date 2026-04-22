import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash, FaSave, FaArrowLeft, FaTimes, FaCheck } from "react-icons/fa";
import Cropper from "react-easy-crop"; 
import axios from "axios";
import defaultAvatar from "../assets/default-avatar.png";
import Notif from "../components/notif";

const API_BASE_URL = "http://localhost:5000";

export default function ProfileUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("data-diri");
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [formData, setFormData] = useState({
    username: "", email: "", password: "", foto: null,
    jenis_kelamin: "", tempat_lahir: "", tanggal_lahir: "", alamat: "", no_telp: "",
    agama: "", kewarganegaraan: "", nama_sekolah: "", alamat_sekolah: "", tahun_lulus: "",
    nama_ayah: "", nama_ibu: "", pekerjaan_ayah: "", pekerjaan_ibu: "",
    penhir_ayah: "", penhir_ibu: "", penhas_ayah: "", penhas_ibu: "",
    no_telp_ayah: "", no_telp_ibu: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/user/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        if (data.tanggal_lahir) data.tanggal_lahir = data.tanggal_lahir.split("T")[0];
        if (data.tahun_lulus) data.tahun_lulus = data.tahun_lulus.split("T")[0];

        setFormData((prev) => ({ ...prev, ...data, password: "" }));
      } catch (error) {
        console.error("Gagal mengambil data profil", error);
      }
    };
    fetchProfile();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        setImageToCrop(reader.result); 
      };
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

  const handleSave = async () => {
    if (formData.password && formData.password !== confirmPassword) {
      return setNotif({ show: true, type: "failed", message: "Konfirmasi password tidak cocok!" });
    }

    try {
      const token = sessionStorage.getItem("token");
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      const res = await axios.put(`${API_BASE_URL}/api/user/profile/update/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      
      const updatedUser = { 
        ...storedUser, 
        foto: res.data.foto, 
        username: formData.username 
      };

      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      setNotif({ 
        show: true, 
        type: "success", 
        message: res.data.message 
      });
      
      setConfirmPassword("");

      setTimeout(() => {
        if (formData.password) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          navigate("/login");
        } else {
          navigate("/home");
        }
      }, 1500);

    } catch (error) {
      setNotif({
        show: true,
        type: "failed",
        message: error.response?.data?.message || "Gagal memperbarui profil",
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-[#1E1E6F] min-h-screen font-sans">
      {notif.show && (
        <Notif 
          type={notif.type} 
          message={notif.message} 
          onClose={() => setNotif({ ...notif, show: false })} 
          onConfirm={() => setNotif({ ...notif, show: false })} 
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
            <button 
              onClick={() => setImageToCrop(null)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all"
            >
              <FaTimes /> BATAL
            </button>
            <button 
              onClick={createCroppedImage}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all"
            >
              <FaCheck /> TERAPKAN
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
        <div className="p-6 flex flex-col bg-[#1E1E6F] md:flex-row justify-between items-center gap-4 border-b border-white/10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white hover:bg-gray-100/20 text-black px-4 py-2 rounded-xl text-sm transition-all cursor-pointer">
            <FaArrowLeft /> Kembali
          </button>
          <div className="flex bg-black/30 p-1 rounded-2xl">
            <TabBtn active={activeTab === "data-diri"} onClick={() => setActiveTab("data-diri")} label="DATA DIRI" />
            <TabBtn active={activeTab === "keluarga"} onClick={() => setActiveTab("keluarga")} label="KELUARGA" />
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 cursor-pointer">
            <FaSave /> SIMPAN PERUBAHAN
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1E1E6F] p-8 rounded-3xl flex flex-col items-center text-center border border-white/10 shadow-xl">
              <div className="relative group">
                <div className="w-44 h-44 rounded-full border-4 border-white overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                  <img
                    src={preview || (formData.foto && formData.foto !== "default-avatar.png" ? `${API_BASE_URL}/avatars/${formData.foto}` : defaultAvatar)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = defaultAvatar; }}
                  />
                </div>
                <label className="absolute bottom-2 right-2 bg-white p-3 rounded-full text-[#1E1E6F] cursor-pointer hover:bg-blue-50 shadow-xl transition-all">
                  <FaCamera size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <h2 className="text-white mt-4 font-bold text-xl uppercase tracking-wider">{formData.username || "User Name"}</h2>
              <p className="text-white/60 text-sm">{formData.email}</p>
            </div>
            
            <div className="bg-[#1E1E6F] p-6 rounded-3xl shadow-md border border-white/10">
              <h3 className="text-white font-bold text-sm mb-3 border-b border-white/20 pb-2">KETENTUAN FOTO</h3>
              <div className="text-[11px] text-white/70 space-y-2 leading-relaxed">
                <p>• Background Merah/Biru polos dan Berpakaian rapi/Seragam sekolah.</p>
                <p>• Wajah menghadap kamera, tidak menggunakan kacamata hitam.</p>
                <p>• Bagi Laki-laki, rambutnya di rapikan.</p>
                <p>• Bagi perempuan berhijab, gunakan hijab yang rapi. jika non-islam, rambutnya di rapikan.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#1E1E6F] rounded-3xl p-6 shadow-xl overflow-y-auto max-h-[70vh] custom-scrollbar border border-white/10">
            {activeTab === "data-diri" ? (
              <div className="space-y-8">
                <section>
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Informasi Akun
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem label="Nama Lengkap" name="username" value={formData.username} onChange={handleChange} />
                    <InputItem label="Email" name="email" value={formData.email} onChange={handleChange} />
                    <div className="relative">
                      <InputItem label="Password Baru" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <InputItem label="Konfirmasi Password" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </section>

                <section className="pt-4">
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Detail Pribadi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} />
                    <InputItem label="Tanggal Lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={handleChange} />
                    <InputItem label="No Telepon" name="no_telp" value={formData.no_telp} onChange={handleChange} />
                    <InputItem label="Agama" name="agama" value={formData.agama} onChange={handleChange} />
                    <InputItem label="Kewarganegaraan" name="kewarganegaraan" value={formData.kewarganegaraan} onChange={handleChange} />
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Jenis Kelamin</label>
                      <div className="flex gap-4 p-2 bg-white/5 rounded-xl border border-white/10">
                        <RadioItem label="Laki-laki" name="jenis_kelamin" value="laki-laki" checked={formData.jenis_kelamin === "laki-laki"} onChange={handleChange} />
                        <RadioItem label="Perempuan" name="jenis_kelamin" value="perempuan" checked={formData.jenis_kelamin === "perempuan"} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Alamat Lengkap</label>
                    <textarea name="alamat" value={formData.alamat || ""} onChange={handleChange} className="w-full bg-white border-none rounded-xl p-3 h-24 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none shadow-inner" />
                  </div>
                </section>

                <section className="pt-4">
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Pendidikan Terakhir
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem label="Nama Sekolah" name="nama_sekolah" value={formData.nama_sekolah} onChange={handleChange} />
                    <InputItem label="Tahun Lulus" name="tahun_lulus" type="date" value={formData.tahun_lulus} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Alamat Sekolah</label>
                      <textarea name="alamat_sekolah" value={formData.alamat_sekolah || ""} onChange={handleChange} className="w-full bg-white border-none rounded-xl p-3 h-20 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none shadow-inner" />
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FamilyCard 
                    title="Informasi Ayah" 
                    icon="👨‍💼"
                    fields={[
                        { label: "Nama Ayah", name: "nama_ayah", value: formData.nama_ayah },
                        { label: "Pekerjaan", name: "pekerjaan_ayah", value: formData.pekerjaan_ayah },
                        { label: "Pendidikan", name: "penhir_ayah", value: formData.penhir_ayah },
                        { label: "No Telp", name: "no_telp_ayah", value: formData.no_telp_ayah },
                    ]}
                    incomeName="penhas_ayah"
                    incomeValue={formData.penhas_ayah}
                    onChange={handleChange}
                />
                <FamilyCard 
                    title="Informasi Ibu" 
                    icon="👩‍💼"
                    fields={[
                        { label: "Nama Ibu", name: "nama_ibu", value: formData.nama_ibu },
                        { label: "Pekerjaan", name: "pekerjaan_ibu", value: formData.pekerjaan_ibu },
                        { label: "Pendidikan", name: "penhir_ibu", value: formData.penhir_ibu },
                        { label: "No Telp", name: "no_telp_ibu", value: formData.no_telp_ibu },
                    ]}
                    incomeName="penhas_ibu"
                    incomeValue={formData.penhas_ibu}
                    onChange={handleChange}
                />
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
    <button onClick={onClick} className={`px-8 py-2 rounded-xl text-[11px] font-black tracking-widest transition-all cursor-pointer ${active ? "bg-white text-[#1E1E6F] shadow-lg" : "text-white/50 hover:text-white"}`}>
      {label}
    </button>
  );
}

function InputItem({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">{label}</label>
      <input type={type} name={name} value={value || ""} onChange={onChange} className="w-full bg-white border-none rounded-xl p-2.5 text-sm text-black focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-inner" />
    </div>
  );
}

function RadioItem({ label, name, value, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="w-4 h-4 accent-blue-400" />
      <span className={`text-xs font-medium ${checked ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>{label}</span>
    </label>
  );
}

function FamilyCard({ title, fields, incomeName, incomeValue, onChange, icon }) {
  const ranges = [{ v: "tidak ada", l: "Tidak Ada" }, { v: "1000000-3000000", l: "Rp1jt - Rp3jt" }, { v: "4000000-6000000", l: "Rp4jt - Rp6jt" }, { v: "7000000-10000000", l: "Rp7jt - Rp10jt" }];
  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-sm space-y-4">
      <h3 className="text-white font-bold text-center border-b border-white/10 pb-3 flex items-center justify-center gap-2 uppercase tracking-tighter">
        <span>{icon}</span> {title}
      </h3>
      {fields.map((f, i) => (
        <InputItem key={i} label={f.label} name={f.name} value={f.value} onChange={onChange} />
      ))}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-white/50 uppercase ml-1">Rentang Penghasilan</label>
        <select name={incomeName} value={incomeValue || ""} onChange={onChange} className="w-full bg-white border-none rounded-xl p-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-inner">
          <option value="">Pilih Range</option>
          {ranges.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
        </select>
      </div>
    </div>
  );
}