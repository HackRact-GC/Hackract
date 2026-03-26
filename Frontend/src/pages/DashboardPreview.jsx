import React, { useState } from 'react';
import {
  FiSearch, FiBell, FiUser, FiMenu, FiX
} from 'react-icons/fi';

const DashboardPreview = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-white/5 flex flex-col justify-between transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* TOP */}
        <div>
          {/* Logo */}
          <div className="p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#00ff88]">Hackract</h1>
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <FiX />
            </button>
          </div>

          {/* Admin Card */}
          <div className="mx-4 p-4 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00ff88]/20 flex items-center justify-center rounded-full">
              <FiUser />
            </div>
            <div>
              <p className="text-white text-sm">Admin Node</p>
              <p className="text-xs text-gray-500">Security Level 5</p>
            </div>
          </div>

          {/* NAV */}
          <nav className="px-4 mt-6 space-y-2">
            {["Dashboard","Projects","Tools","Marketplace","Reports","Settings"].map((item,i)=>(
              <div key={i} className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                {item}
              </div>
            ))}
          </nav>
        </div>

        {/* BUTTON */}
        <div className="p-4">
          <button className="w-full bg-[#00ff88] text-black py-2 rounded-lg font-bold hover:opacity-90 transition">
            New Scan
          </button>
        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 DAY 2 → TOP NAVBAR */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <FiMenu size={20} />
            </button>

            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/5 pl-10 pr-4 py-2 rounded-lg outline-none text-sm"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <FiBell className="cursor-pointer" />
            <div className="w-8 h-8 bg-[#00ff88]/20 flex items-center justify-center rounded-full">
              <FiUser />
            </div>
          </div>
        </div>

        {/* 🔹 DAY 3 → DASHBOARD CONTENT */}
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">

          {/* CARD 1 */}
          <div className="bg-white/5 p-5 rounded-xl">
            <p className="text-sm text-gray-400">Total Scans</p>
            <h2 className="text-2xl text-white mt-2">120</h2>
          </div>

          {/* CARD 2 */}
          <div className="bg-white/5 p-5 rounded-xl">
            <p className="text-sm text-gray-400">Threats Found</p>
            <h2 className="text-2xl text-red-400 mt-2">8</h2>
          </div>

          {/* CARD 3 */}
          <div className="bg-white/5 p-5 rounded-xl">
            <p className="text-sm text-gray-400">Active Tools</p>
            <h2 className="text-2xl text-[#00ff88] mt-2">15</h2>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPreview;