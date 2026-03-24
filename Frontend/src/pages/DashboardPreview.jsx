import React, { useState } from 'react';
import {
  FiSearch,
  FiBell,
  FiGrid,
  FiFolder,
  FiTool,
  FiShoppingBag,
  FiFileText,
  FiSettings,
  FiPlus,
  FiUser,
  FiActivity,
  FiCheckCircle,
  FiShield,
  FiChevronRight,
  FiMenu,
  FiX
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

      {/* MAIN CONTENT START */}
      <div className="flex-1 flex flex-col h-full w-full lg:w-[calc(100%-16rem)] relative overflow-hidden">
        {/* The rest will come next days */}
      </div>
    </div>
  );
};

export default DashboardPreview;