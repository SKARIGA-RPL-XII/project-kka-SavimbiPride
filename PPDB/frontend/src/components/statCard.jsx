import React from "react";
import { FiInfo } from "react-icons/fi";

export default function StatCard({ title, value }) {
  return (
    <div className="bg-[#1E1E6F] text-white p-8 rounded-none w-64 shadow-lg flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-4 left-4">
        <FiInfo className="opacity-40" size={20} />
      </div>
      <h3 className="text-lg font-bold tracking-widest mb-2 opacity-90">{title}</h3>
      <span className="text-7xl font-bold">{value}</span>
    </div>
  );
}