import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaDownload,
  FaCheck,
  FaTimes,
  FaWindowClose,
} from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png";
import Notif from "../components/notif";

const API_BASE_URL = "http://localhost:5000";

export default function DetailDataUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("data-diri");
  const [preview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notif, setNotif] = useState({
    show: false,
    type: "",
    message: "",
    pendingData: null,
  });
  const [decisionModal, setDecisionModal] = useState({
    open: false,
    status: "",
    jurusanTerima: null,
    keterangan: "",
  });

  const [formData, setFormData] = useState({
    user_id: "",
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
    penhas_ayah: "",
    penhas_ibu: "",
    jurusan1: "",
    jurusan2: "",
    foto_ijazah: "",
    jurusan1_id: "",
    jurusan1_nama: "",
    jurusan2_id: "",
    jurusan2_nama: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const res = await fetch(
          `${API_BASE_URL}/api/list_data_user/DataUser/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          throw new Error("Gagal mengambil data");
        }

        const data = await res.json();

        if (isMounted) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            tanggal_lahir: data.tanggal_lahir
              ? new Date(data.tanggal_lahir).toISOString().split("T")[0]
              : "",
            tahun_lulus: data.tahun_lulus
              ? new Date(data.tahun_lulus).toISOString().split("T")[0]
              : "",
          }));
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    };

    if (id) {
      fetchProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleNext = () => {
    if (activeTab === "data-diri") setActiveTab("keluarga");
    else if (activeTab === "keluarga") setActiveTab("jurusan");
  };

  const handlePrev = () => {
    if (activeTab === "keluarga") setActiveTab("data-diri");
    else if (activeTab === "jurusan") setActiveTab("keluarga");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `${API_BASE_URL}/ijazah/${formData.foto_ijazah}`;
    link.download = formData.foto_ijazah;
    link.click();
  };

  const handleDecision = (status, jurusanId, userId) => {
    console.log("JURUSAN ID DIKLIK:", jurusanId);
    setDecisionModal({
      open: true,
      status: status,
      jurusanTerima: jurusanId,
      userId: userId,
      tentang:
        status === "diterima"
          ? "Selamat! Anda Diterima"
          : "mohon maaf, anda tidak diterima",
      pesan: status === "diterima" ? " " : " ",
    });
  };

  const executeAction = async () => {
    const { status, jurusanTerima } = notif.pendingData;

    setNotif({ ...notif, show: false });

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/list_data_user/DataUser/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, jurusan_diterima_id: jurusanTerima }),
        },
      );

      if (res.ok) {
        setNotif({
          show: true,
          type: "success",
          message: "Mantap! Data berhasil diperbarui.",
        });

        setTimeout(() => navigate("/list-data-user"), 2000);
      } else {
        throw new Error("Gagal memperbarui status.");
      }
    } catch (Error) {
      setNotif({
        show: true,
        type: "failed",
        message: "Waduh, sepertinya ada masalah koneksi.",
      });
    }
  };

  const executeDecisionWithMessage = async () => {
    if (decisionModal.status === "diterima" && !decisionModal.jurusanTerima) {
      setNotif({
        show: true,
        type: "failed",
        message: "Silakan pilih jurusan yang diterima!",
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const updateRes = await fetch(
        `${API_BASE_URL}/api/list_data_user/DataUser/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: decisionModal.status,
            jurusan_id: decisionModal.jurusanTerima
          }),
        },
      );

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.message || "Gagal update status");
      }

      const inboxRes = await fetch(`${API_BASE_URL}/api/inbox/inboxKirim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          users_id: decisionModal.userId,
          tentang: decisionModal.tentang,
          pesan: decisionModal.pesan,
        }),
      });

      const inboxData = await inboxRes.json();
      console.log("INBOX RESPONSE:", inboxData);

      if (!inboxRes.ok) {
        throw new Error(inboxData.message || "Gagal kirim inbox");
      }

      // Close modal
      setDecisionModal((prev) => ({
        ...prev,
        open: false,
      }));

      // Success notif
      setNotif({
        show: true,
        type: "success",
        message: "Status & pesan berhasil dikirim!",
      });

      setTimeout(() => navigate("/list-data-user"), 2000);
    } catch (error) {
      console.error(error);

      setNotif({
        show: true,
        type: "failed",
        message: "Gagal mengirim keputusan.",
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-[#1E1E6F] min-h-screen font-sans">
      {decisionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-[#1E1E6F] uppercase tracking-wide">
                {decisionModal.status === "diterima"
                  ? "Konfirmasi Penerimaan"
                  : "Konfirmasi Penolakan"}
              </h2>
              <button
                onClick={() =>
                  setDecisionModal({ ...decisionModal, open: false })
                }
                className="text-red-500 text-xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Textarea */}
            {/* Tentang */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Tentang
              </label>
              <input
                type="text"
                value={decisionModal.tentang}
                onChange={(e) =>
                  setDecisionModal({
                    ...decisionModal,
                    tentang: e.target.value,
                  })
                }
                placeholder="Judul pesan..."
                className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1E1E6F]"
              />
            </div>

            {/* Pesan */}
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Pesan untuk siswa
              </label>
              <textarea
                value={decisionModal.pesan}
                onChange={(e) =>
                  setDecisionModal({
                    ...decisionModal,
                    pesan: e.target.value,
                  })
                }
                placeholder="Tulis pesan untuk siswa..."
                className="w-full border rounded-xl p-3 text-sm resize-none h-28 outline-none focus:ring-2 focus:ring-[#1E1E6F]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setDecisionModal({ ...decisionModal, open: false })
                }
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-bold"
              >
                Batal
              </button>

              <button
                onClick={executeDecisionWithMessage}
                className={`px-6 py-2 rounded-xl text-sm font-bold text-white ${
                  decisionModal.status === "diterima"
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
      {notif.show && (
        <Notif
          type={notif.type}
          message={notif.message}
          onConfirm={executeAction}
          onCancel={() => setNotif({ ...notif, show: false })}
          onClose={() => setNotif({ ...notif, show: false })}
        />
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative bg-white rounded-2xl max-w-4xl w-full h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">
                Preview Ijazah: {formData.foto_ijazah}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-500 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              {formData.foto_ijazah.endsWith(".pdf") ? (
                <iframe
                  src={`${API_BASE_URL}/ijazah/${formData.foto_ijazah}`}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={`${API_BASE_URL}/ijazah/${formData.foto_ijazah}`}
                    className="max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
        {/* HEADER */}
        <div className="p-6 flex flex-col bg-[#1E1E6F] md:flex-row justify-between items-center gap-4 border-b border-white/10">
          {activeTab === "data-diri" ? (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-xl text-sm transition-all cursor-pointer"
            >
              <FaArrowLeft /> Kembali
            </button>
          ) : (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <FaArrowLeft /> SEBELUMNYA
            </button>
          )}

          <div className="flex bg-black/30 p-1 rounded-2xl">
            <TabBtn
              active={activeTab === "data-diri"}
              onClick={() => setActiveTab("data-diri")}
              label="DATA DIRI"
            />
            <TabBtn
              active={activeTab === "keluarga"}
              onClick={() => setActiveTab("keluarga")}
              label="KELUARGA"
            />
            <TabBtn
              active={activeTab === "jurusan"}
              onClick={() => setActiveTab("jurusan")}
              label="JURUSAN"
            />
          </div>

          {activeTab !== "jurusan" ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              SELANJUTNYA <FaArrowRight />
            </button>
          ) : (
            <div className="bg-white text-[#1E1E6F] px-6 py-2 rounded-xl transition-all font-bold shadow-lg">
              DATA TERAKHIR
            </div>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* FOTO */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1E1E6F] p-8 rounded-3xl flex flex-col items-center text-center border border-white/10 shadow-xl">
              <div className="w-44 h-44 rounded-full border-4 border-white overflow-hidden shadow-2xl">
                <img
                  src={
                    preview ||
                    (formData.foto
                      ? `${API_BASE_URL}/avatars/${formData.foto}`
                      : defaultAvatar)
                  }
                  alt="Profile"
                  className="w-44 h-44 rounded-full"
                />
              </div>
              <h2 className="text-white mt-4 font-bold text-xl uppercase tracking-wider">
                {formData.username || "Calon Siswa"}
              </h2>
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#1E1E6F] rounded-3xl p-6 shadow-xl overflow-y-auto max-h-[75vh] custom-scrollbar border border-white/10">
            {activeTab === "data-diri" && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Informasi
                    siswa
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem
                      label="Nama Lengkap"
                      value={formData.username}
                      disabled
                    />
                    <InputItem
                      label="Tempat Lahir"
                      value={formData.tempat_lahir}
                      disabled
                    />
                    <InputItem
                      label="Tanggal Lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      disabled
                    />
                    <InputItem
                      label="No Telepon"
                      value={formData.no_telp}
                      disabled
                    />
                    <InputItem label="Agama" value={formData.agama} disabled />
                    <InputItem
                      label="Kewarganegaraan"
                      value={formData.kewarganegaraan}
                      disabled
                    />

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
                        Jenis Kelamin
                      </label>
                      <div className="flex gap-4 p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <RadioItem
                          label="Laki-laki"
                          checked={formData.jenis_kelamin === "laki-laki"}
                          disabled
                        />
                        <RadioItem
                          label="Perempuan"
                          checked={formData.jenis_kelamin === "perempuan"}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      value={formData.alamat || ""}
                      disabled
                      className="w-full bg-gray-200 cursor-not-allowed border-none rounded-xl p-3 h-24 text-sm text-black outline-none transition-all resize-none shadow-inner"
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Pendidikan
                    Terakhir
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem
                      label="Nama Sekolah"
                      value={formData.nama_sekolah}
                      disabled
                    />
                    <InputItem
                      label="Tahun Lulus"
                      type="date"
                      value={formData.tahun_lulus}
                      disabled
                    />

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
                        Alamat Sekolah
                      </label>
                      <textarea
                        value={formData.alamat_sekolah || ""}
                        disabled
                        className="w-full mt-1 bg-gray-200 cursor-not-allowed border-none rounded-xl p-3 h-24 text-sm text-black outline-none transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "keluarga" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FamilyCard
                    title="Informasi Ayah"
                    fields={[
                      {
                        label: "Nama Ayah",
                        name: "nama_ayah",
                        value: formData.nama_ayah,
                      },
                      {
                        label: "Pekerjaan",
                        name: "pekerjaan_ayah",
                        value: formData.pekerjaan_ayah,
                      },
                      {
                        label: "Pendidikan",
                        name: "penhir_ayah",
                        value: formData.penhir_ayah,
                      },
                      {
                        label: "No Telp",
                        name: "no_telp_ayah",
                        value: formData.no_telp_ayah,
                      },
                    ]}
                    incomeName="penhas_ayah"
                    incomeValue={formData.penhas_ayah}
                  />

                  <FamilyCard
                    title="Informasi Ibu"
                    fields={[
                      {
                        label: "Nama Ibu",
                        name: "nama_ibu",
                        value: formData.nama_ibu,
                      },
                      {
                        label: "Pekerjaan",
                        name: "pekerjaan_ibu",
                        value: formData.pekerjaan_ibu,
                      },
                      {
                        label: "Pendidikan",
                        name: "penhir_ibu",
                        value: formData.penhir_ibu,
                      },
                      {
                        label: "No Telp",
                        name: "no_telp_ibu",
                        value: formData.no_telp_ibu,
                      },
                    ]}
                    incomeName="penhas_ibu"
                    incomeValue={formData.penhas_ibu}
                  />
                </div>
              </div>
            )}

            {activeTab === "jurusan" && (
              <div className="space-y-8 animate-fadeIn">
                <section>
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Keputusan Admin
                  </h3>

                  <div className="grid gap-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex justify-between items-center gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase">
                          Pilihan Kesatu
                        </label>
                        <div className="text-lg text-white font-bold">
                          {formData.jurusan1_nama || "-"}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDecision("diterima", formData.jurusan1_id, formData.user_id)
                        }
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FaCheck /> TERIMA DI PILIHAN 1
                      </button>
                    </div>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex justify-between items-center gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase">
                          Pilihan Kedua
                        </label>
                        <div className="text-lg text-white font-bold">
                          {formData.jurusan2_nama || "-"}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDecision("diterima", formData.jurusan2_id, formData.user_id)
                        }
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FaCheck /> TERIMA DI PILIHAN 2
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        handleDecision("tidak_diterima", null, formData.user_id)
                      }
                      className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
                    >
                      <FaTimes /> TOLAK PENDAFTARAN
                    </button>
                  </div>
                </section>

                <section className="mt-8">
                  <h3 className="text-white font-black text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-white/30"></span> Dokumen
                    Pendukung
                  </h3>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/20 flex flex-col items-center gap-4">
                    <p className="text-white text-sm">{formData.foto_ijazah}</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold"
                      >
                        <FaEye /> REVIEW
                      </button>
                      <button
                        onClick={handleDownload}
                        className="bg-gray-100 hover:bg-white text-[#1E1E6F] px-6 py-2 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <FaDownload /> DOWNLOAD
                      </button>
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
    <button
      onClick={onClick}
      className={`px-4 md:px-8 py-2 rounded-xl text-[10px] md:text-[11px] font-black tracking-widest transition-all cursor-pointer ${active ? "bg-white text-[#1E1E6F] shadow-lg" : "text-white/50 hover:text-white"}`}
    >
      {label}
    </button>
  );
}

function InputItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
        {label}
      </label>
      <input
        disabled
        value={value || ""}
        className="w-full border-none rounded-xl p-2.5 text-sm bg-gray-200 text-gray-500 cursor-not-allowed shadow-inner"
      />
    </div>
  );
}

function RadioItem({ label, checked }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
          checked ? "border-blue-400" : "border-white/30"
        }`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-blue-400"></div>}
      </div>

      <span
        className={`text-xs font-medium ${
          checked ? "text-white" : "text-white/40"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function FamilyCard({ title, fields, incomeValue, icon }) {
  const ranges = {
    "tidak ada": "Tidak Ada",
    "1000000-3000000": "Rp 1.000.000 - 3.000.000",
    "4000000-6000000": "Rp 4.000.000 - 6.000.000",
    "7000000-10000000": "Rp 7.000.000 - 10.000.000",
  };

  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-sm space-y-4">
      <h3 className="text-white font-bold text-center border-b border-white/10 pb-3 flex items-center justify-center gap-2 uppercase tracking-tighter">
        <span>{icon}</span> {title}
      </h3>

      {fields.map((f, i) => (
        <div key={i} className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
            {f.label}
          </label>
          <div className="w-full bg-gray-200 border-none rounded-xl p-2.5 text-sm text-black shadow-inner">
            {f.value || "-"}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-white/50 uppercase ml-1">
          Penghasilan
        </label>
        <div className="w-full bg-gray-200 border-none rounded-xl p-2.5 text-sm text-black shadow-inner">
          {ranges[incomeValue] || "-"}
        </div>
      </div>
    </div>
  );
}