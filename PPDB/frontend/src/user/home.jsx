import { Routes, Route } from "react-router-dom";
import Content from "../components/major";

function Landing() {
  return (
    <div className="min-h-screen bg-[#1E1E6F] font-barrio text-white flex flex-col">

      <div className="flex flex-1 w-full items-start">
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Content />} />
            <Route path="/program" element={<div className="h-screen flex items-center justify-center text-3xl">HALAMAN PROGRAM KAMI</div>} />
            <Route path="/tentang" element={<div className="h-screen flex items-center justify-center text-3xl">HALAMAN TENTANG KAMI</div>} />
            <Route path="/login" element={<div className="h-screen flex items-center justify-center text-3xl">HALAMAN LOGIN</div>} />
          </Routes>
          
          {/* Footer diletakkan di dalam main agar ikut scroll di sisi kiri saja */}
          <footer className="bg-[#000045] py-6 text-center text-[10px] opacity-50 tracking-widest">
            &copy; 2024 FOCUS POINT EDUCATION. ALL RIGHTS RESERVED.
          </footer>
        </main>
        
      </div>
    </div>
  );
}

export default Landing;