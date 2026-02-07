import React, { useState, useEffect } from "react"; // Tambahkan useEffect
import { useNavigate } from "react-router-dom";
import StatCard from "../components/statCard";
import SideBar from "../components/sidebar";
import defaultAvatar from "../assets/default-avatar.png";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import axios from "axios"; // Tambahkan axios
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const adminId = localStorage.getItem("adminId");
  const token = localStorage.getItem("token");

  // State User
  const [user, setUser] = useState({ 
    username: "USER", 
    foto: null 
  });

  // Fetch data user terbaru agar foto sinkron setelah update
  useEffect(() => {
    const fetchUserData = async () => {
      if (!adminId || !token) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({
          username: res.data.username,
          foto: res.data.foto
        });
        // Opsional: Update localStorage agar data login tetap terbaru
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      }
    };
    fetchUserData();
  }, [adminId, token]);

  const handleLogout = () => {
    localStorage.clear(); // Hapus semua data
    navigate("/login");
  };

  // --- LOGIKA URL GAMBAR ---
  // Jika foto ada, arahkan ke folder avatars di backend, jika tidak gunakan default
  const avatarUrl = user.foto 
    ? `http://localhost:5000/avatars/${user.foto}` 
    : defaultAvatar;

  const chartData = {
    labels: ['Figma', 'Sketch', 'XD', 'PS', 'AI', 'CorelDRAW', 'InDesign', 'Canva', 'Webflow', 'Affinity', 'Marker', 'Figma'],
    datasets: [
      { label: '2020', data: [22, 41, 82, 38, 39, 90, 89, 95, 23, 19, 81, 87], backgroundColor: '#a5b4fc' },
      { label: '2021', data: [91, 38, 16, 48, 98, 50, 14, 20, 68, 80, 37, 96], backgroundColor: '#fca5a5' },
      { label: '2022', data: [99, 65, 86, 18, 93, 33, 55, 36, 97, 78, 43, 42], backgroundColor: '#67e8f9' },
    ],
  };

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
                  onError={(e) => { e.target.src = defaultAvatar; }} // Fallback jika gambar error load
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

        {/* Konten sisa Dashboard tetap sama */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-black tracking-tight uppercase">Ringkasan Data</h2>
          <div className="flex space-x-6 mb-10">
            <StatCard title="TOTAL JURUSAN" value="15" />
            <StatCard title="TOTAL USER" value="15" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}