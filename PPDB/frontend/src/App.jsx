import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// ===== PAGES =====
import Home from "./user/home";
import Login from "./auth/login";
import Register from "./auth/register";
import Dashboard from "./admin/dashboard";
import Landing from "./auth/landing";

// ===== COMPONENTS =====
import Navbar from "./components/navbar";
import SideNav from "./components/sideNav";

export default function App() {
  const location = useLocation();

  // halaman TANPA navbar & sidenav
  const hideLayoutPaths = ["/login", "/register", "/dashboard"];

  const hideDynamicRegex = [
    /^\/EditAdmin\/.+$/,
    /^\/EditMentor\/.+$/,
    /^\/EditUser\/.+$/,
    /^\/edit_kelas\/.+$/,
    /^\/detail_kelas\/.+$/,
  ];

  const shouldHide =
    hideLayoutPaths.includes(location.pathname) ||
    hideDynamicRegex.some((regex) => regex.test(location.pathname));

  return (
    <div className="min-h-screen bg-[#1E1E6F] text-white flex flex-col">
      {!shouldHide && <Navbar />}

      <div className="flex flex-1 w-full">
        <main className="flex-1 bg-gray-100 text-black">
          <Routes>
            <Route index element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        {!shouldHide && <SideNav />}
      </div>
    </div>
  );
}
