import React from "react";
import logoFpe from "../assets/logo_fpe.png";
import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();

  const menus = [
    { name: "DASHBOARD", path: "/dashboard" },
    { name: "LIST JURUSAN", path: "/list-jurusan" },
    { name: "DATA USER", path: "/data-user" },
    { name: "LIST USER", path: "/list-user" },
    { name: "PEMBAYARAN", path: "/pembayaran" },
  ];

  return (
    <div className="w-64 bg-[#1E1E6F] text-white flex flex-col py-6">
      {/* LOGO AREA */}
      <div className="flex items-center space-x-2 px-6 mb-12">
        <img src={logoFpe} alt="Logo" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
        <div className="leading-none">
          <h2 className="text-[10px] font-bold tracking-tighter">FOCUS POINT</h2>
          <p className="text-[7px] tracking-widest opacity-80 uppercase">EDUCATION</p>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex flex-col">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            to={menu.path}
            className={`px-6 py-4 text-sm font-bold tracking-widest hover:bg-white/10 transition-colors ${
              location.pathname === menu.path ? "bg-white/10" : ""
            }`}
          >
            {menu.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}