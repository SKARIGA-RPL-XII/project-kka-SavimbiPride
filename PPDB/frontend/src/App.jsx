import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// page
import Login from "./auth/login";
import Register from "./auth/register";
import Landing from "./auth/landing";

// admin
import Dashboard from "./admin/dashboard";
import ListJurusan from "./admin/list_jurusan";
import TambahJurusan from "./admin/tambah_jurusan";
import EditJurusan from "./admin/edit_jurusan";
import ProfileAdmin from "./admin/profileA";

// user 
import Home from "./user/home";

export default function App() {
  
  return (
    <div className="min-h-screen bg-[#1E1E6F] text-white flex flex-col">


      <div className="flex flex-1 w-full overflow-hidden">
        <main className="flex-1 bg-gray-100 text-black overflow-hidden">
          <Routes>
            <Route index element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* admin */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/list-jurusan" element={<ListJurusan />} />
            <Route path="/tambah-jurusan" element={<TambahJurusan />} />
            <Route path="/edit-jurusan/:id" element={<EditJurusan />} />
            <Route path="/profileA" element={<ProfileAdmin />} />
            
            {/* User */}
            <Route path="/home" element={<Home />} />
          </Routes>
        </main>

      </div>
    </div>
  );
}