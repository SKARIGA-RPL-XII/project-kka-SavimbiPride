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
import ListUser from "./admin/list_user";
import TambahJurusan from "./admin/tambah_jurusan";
import EditJurusan from "./admin/edit_jurusan";
import ProfileAdmin from "./admin/profileA";
import Pembayaran from "./admin/pembayaran";
import ListDataUser from "./admin/list_data_user";
import DetailDataUser from "./admin/detail_data_user";
import Calon from "./admin/calon";

// user 
import Home from "./user/home";
import ProfileUser from "./user/profileU";
import Daftar from "./user/daftar";
import Inbox from "./user/inbox";
import Payment from "./user/payment";
import OnlinePayment from "./user/online";
import OfflinePayment from "./user/offline";

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
            <Route path="/list-user" element={<ListUser />} />
            <Route path="/tambah-jurusan" element={<TambahJurusan />} />
            <Route path="/edit-jurusan/:id" element={<EditJurusan />} />
            <Route path="/profileA" element={<ProfileAdmin />} />
            <Route path="/pembayaran" element={<Pembayaran />} />
            <Route path="/list-data-user" element={<ListDataUser />} />
            <Route path="/detail-data-user/:id" element={<DetailDataUser />} />
            <Route path="/calon" element={<Calon/>} />
            
            {/* User */}
            <Route path="/home/*" element={<Home />} />
            <Route path="/profileU/:id" element={<ProfileUser />} />
            <Route path="/daftar/:id" element={<Daftar />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/online" element={<OnlinePayment />} />
            <Route path="/payment/offline" element={<OfflinePayment />} />
          </Routes>
        </main>

      </div>
    </div>
  );
}