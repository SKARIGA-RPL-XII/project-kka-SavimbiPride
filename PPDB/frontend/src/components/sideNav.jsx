export default function SideNav() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <aside className="sticky top-0 h-screen w-[160px] bg-[#000045] flex flex-col pt-32 px-4 z-40 font-barrio shadow-2xl self-start border-l border-white/10">
      <div className="flex flex-col space-y-12 text-right">
        
        <button
          onClick={() => scrollTo("informasi")}
          className="text-white hover:text-yellow-400 transition-all duration-300 text-[12px] tracking-[0.2em] uppercase leading-relaxed active:scale-95 cursor-pointer"
        >
          Informasi
        </button>

        <button
          onClick={() => scrollTo("preview-jurusan")}
          className="text-white hover:text-yellow-400 transition-all duration-300 text-[12px] tracking-[0.2em] uppercase leading-relaxed active:scale-95 cursor-pointer"
        >
          Preview Jurusan
        </button>

        <button
          onClick={() => scrollTo("cara-daftar")}
          className="text-white hover:text-yellow-400 transition-all duration-300 text-[12px] tracking-[0.2em] uppercase leading-relaxed active:scale-95 cursor-pointer"
        >
          Cara Daftar
        </button>

      </div>
    </aside>
  );
}