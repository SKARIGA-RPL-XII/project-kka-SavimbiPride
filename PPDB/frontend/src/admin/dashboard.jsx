import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import StatCard from "../components/statCard";
import SideBar from "../components/sidebar";
import defaultAvatar from "../assets/default-avatar.png";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS,  CategoryScale,  LinearScale,  BarElement,  Title,  Tooltip,  Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const adminId = localStorage.getItem("adminId");
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({ username: "USER", foto: null });
  const [summary, setSummary] = useState({
    totalJurusan: 0,
    totalUser: 0,
    totalLunas: 0,
    chartLabels: [],
    chartValues: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!adminId || !token) return;
      try {
        const resProfile = await axios.get(`http://localhost:5000/api/admin/profile/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({ username: resProfile.data.username, foto: resProfile.data.foto });

        const resSummary = await axios.get(`http://localhost:5000/api/admin/data-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setSummary({
          totalJurusan: resSummary.data.totalJurusan,
          totalUser: resSummary.data.totalUser,
          totalLunas: resSummary.data.totalLunas,
          chartLabels: resSummary.data.chartData.map(d => d.bulan),
          chartValues: resSummary.data.chartData.map(d => d.total)
        });

      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };
    fetchData();
  }, [adminId, token]);

  const chartData = {
    labels: summary.chartLabels.length > 0 ? summary.chartLabels : ['Belum Ada Data'],
    datasets: [
      {
        label: 'Penghasilan (Rp)',
        data: summary.chartValues,
        backgroundColor: '#1E1E6F',
        borderRadius: 8,
      },
    ],
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const avatarUrl = user.foto 
    ? `http://localhost:5000/avatars/${user.foto}` 
    : defaultAvatar;

  return (
    <div className="flex min-h-screen font-barrio bg-white">
      <SideBar />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-8 py-4">
          <h1 className="text-4xl font-bold tracking-tighter text-black uppercase">DATA SUMMARY</h1>
          
          <div className="relative">
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#1E1E6F] text-white px-4 py-2 rounded-lg flex items-center space-x-3 shadow-md cursor-pointer hover:bg-[#2a2a8a] transition-all select-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50 bg-gray-300">
                <img 
                  src={avatarUrl} 
                  alt="profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = defaultAvatar; }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-widest uppercase">{user.username}</span>
                <FiChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1E1E6F] shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => { navigate("/profileA"); setIsDropdownOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white hover:bg-[#2a2a8a] transition-colors cursor-pointer"
                >
                  <FiUser size={18} />
                  <span className="font-semibold">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-300 hover:bg-[#2a2a8a] transition-colors border-t border-white/10 cursor-pointer"
                >
                  <FiLogOut size={18} />
                  <span className="font-semibold uppercase tracking-widest">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-black tracking-tight uppercase">Ringkasan Data</h2>
          
          <div className="flex space-x-6 mb-10">
            <StatCard title="TOTAL JURUSAN" value={summary.totalJurusan} />
            <StatCard title="TOTAL USER" value={summary.totalUser} />
            <StatCard title="CALON SISWA" value={summary.totalLunas} />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-[#1E1E6F]">GRAFIK PENGHASILAN BULANAN</h3>
            <div className="h-80">
                <Bar 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { display: false } },
                        x: { grid: { display: false } }
                    }
                  }} 
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}