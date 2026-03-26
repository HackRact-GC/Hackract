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
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col"></div>
    </div>
  );
};

export default DashboardPreview;