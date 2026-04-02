import React, { useState } from 'react';
import {
  FiSearch, FiBell, FiGrid, FiFolder, FiTool, FiShoppingBag,
  FiFileText, FiSettings, FiPlus, FiUser, FiActivity,
  FiCheckCircle, FiShield, FiChevronRight, FiMenu, FiX
} from 'react-icons/fi';

const DashboardPreview = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-[#00ff88]/30 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-white/5 flex flex-col justify-between transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

          {/* Sidebar Nav */}
          <nav className="px-4 mt-6 space-y-2">
            {["Dashboard","Projects","Tools","Marketplace","Reports","Settings"].map((item,i)=>(
              <div key={i} className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">{item}</div>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <button className="w-full bg-[#00ff88] text-black py-2 rounded-lg font-bold">
              New Scan
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAVBAR */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#111111]">
          <div className="flex items-center gap-2">
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <FiMenu size={24} />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg bg-[#0a0a0a] text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00ff88]"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <FiBell size={20} className="cursor-pointer hover:text-[#00ff88]" />
            <FiUser size={20} className="cursor-pointer hover:text-[#00ff88]" />
          </div>
        </div>

        {/* DASHBOARD CARDS - Day 5 */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#111111] p-4 rounded-lg flex items-center gap-4">
            <FiFolder size={24} className="text-[#00ff88]" />
            <div>
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-white font-bold text-lg">12</p>
            </div>
          </div>
          <div className="bg-[#111111] p-4 rounded-lg flex items-center gap-4">
            <FiTool size={24} className="text-[#00ff88]" />
            <div>
              <p className="text-gray-400 text-sm">Active Scans</p>
              <p className="text-white font-bold text-lg">5</p>
            </div>
          </div>
          <div className="bg-[#111111] p-4 rounded-lg flex items-center gap-4">
            <FiFileText size={24} className="text-[#00ff88]" />
            <div>
              <p className="text-gray-400 text-sm">Reports</p>
              <p className="text-white font-bold text-lg">8</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPreview;