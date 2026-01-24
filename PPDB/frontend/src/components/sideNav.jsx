export default function SideNav() {
  return (
    <aside className="sticky top-[104px] h-[calc(100vh-104px)] w-[160px] bg-[#000045] flex flex-col pt-20 px-4 z-40 font-barrio shadow-2xl">
      <div className="flex flex-col space-y-12 text-right">
        <button className="text-white hover:text-yellow-400 transition-all duration-300 text-[12px] tracking-[0.2em] uppercase text-right leading-relaxed active:scale-95">
          Informasi
        </button>
        
        <button className="text-white hover:text-yellow-400 transition-all duration-300 text-[12px] tracking-[0.2em] uppercase text-right leading-relaxed active:scale-95">
          Preview Jurusan
        </button>
        
        <button className="text-white hover:text-yellow-400 transition-all duration-300 text-[12px] tracking-[0.2em] uppercase text-right leading-relaxed active:scale-95">
          Cara Daftar
        </button>
      </div>

    </aside>
  );
}