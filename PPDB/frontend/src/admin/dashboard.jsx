import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/statCard";
import SideBar from "../components/sidebar";
import defaultAvatar from "../assets/default-avatar.png";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
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

  // Ambil data user dari localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : { username: "USER", foto: null };
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Data dummy untuk chart
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
      {/* SIDEBAR */}
      <SideBar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        
        {/* TOPBAR DASHBOARD */}
        <div className="flex justify-between items-center px-8 py-4">
          <h1 className="text-4xl font-bold tracking-tighter text-black">DATA SUMMARY</h1>
          
          {/* USER PROFILE BOX WITH DROPDOWN */}
          <div className="relative">
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#1E1E6F] text-white px-4 py-2 rounded-lg flex items-center space-x-3 shadow-md cursor-pointer hover:bg-[#2a2a8a] transition-all select-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50">
                <img 
                  src={user.foto || defaultAvatar} 
                  alt="profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-widest uppercase">{user.username}</span>
                <FiChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1E1E6F] shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <button
                  onClick={() => { navigate("/profile"); setIsDropdownOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white hover:bg-[#37166d] transition-colors"
                >
                  <FiUser className="text-white" />
                  <span className="font-semibold">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-300 hover:bg-[#37166d] transition-colors border-t border-white/10"
                >
                  <FiLogOut />
                  <span className="font-semibold uppercase">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-black tracking-tight">RINGKASAN DATA</h2>

          {/* STAT CARDS */}
          <div className="flex space-x-6 mb-10">
            <StatCard title="TOTAL JURUSAN" value="15" />
            <StatCard title="TOTAL USER" value="15" />
          </div>

          {/* CHART SECTION */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                plugins: { 
                  legend: { position: 'bottom' } 
                } 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}