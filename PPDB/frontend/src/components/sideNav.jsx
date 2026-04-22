import React, { useState, useEffect } from "react";

export default function SideNav() {
  const [activeSection, setActiveSection] = useState("informasi"); // Default ke informasi

  const menuItems = [
    { id: "informasi", label: "Informasi" },
    { id: "preview-jurusan", label: "Preview Jurusan" },
    { id: "cara-daftar", label: "Cara Daftar" },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // 1. Logika Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Margin disesuaikan agar lebih responsif
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    menuItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    // 2. Logika Tambahan: Paksa "informasi" aktif saat scroll di paling atas
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("informasi");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <aside className="fixed top-0 right-0 h-screen w-[200px] bg-[#080841] flex flex-col items-center pt-40 px-0 z-40 shadow-2xl border-l border-white/10">
      <div className="flex flex-col w-full">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`relative py-6 transition-all duration-300 uppercase tracking-[0.2em] text-sm font-bold cursor-pointer group
                ${isActive ? "text-yellow-400" : "text-white/40 hover:text-white"}
              `}
            >
              {/* Indikator Garis Aktif */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-yellow-400 rounded-r-full shadow-[0_0_15px_#facc15]" />
              )}
              
              <span className={`transition-transform duration-300 inline-block ${isActive ? "translate-x-2" : "group-hover:translate-x-1"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}