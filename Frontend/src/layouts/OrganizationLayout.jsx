import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import {
  FiGrid, FiBriefcase, FiGlobe, FiShield, FiSettings,
  FiFileText, FiBell, FiChevronDown, FiPlus, FiCpu,
  FiActivity, FiTarget, FiZap, FiLogOut, FiMessageSquare
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OrganizationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const orgName = user?.organization?.name || "Cyberdyne Systems";
  const userInitial = user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "O";

  const navItems = [
    { icon: FiGrid,           label: 'DASHBOARD', route: '/dashboard' },
    { icon: FiBriefcase,      label: 'PROJECTS',  route: '/org-projects' },
    { icon: FiGlobe,          label: 'DISCOVER',  route: '/discover' },
    { icon: FiMessageSquare,  label: 'MESSAGES',  route: '/org-messages' },
    { icon: FiShield,         label: 'LEGAL',     route: '/legal' },
    { icon: FiSettings,       label: 'SETTINGS',  route: '/organization-profile' },
    { icon: FiFileText,       label: 'REPORTS',   route: '/reports' },
  ];

  const isActive = (route) => location.pathname === route;

  return (
    <div className="flex h-screen bg-[#050505] text-gray-400 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#050505] border-r border-white/5 flex flex-col z-50">
        <div className="p-8 pb-12">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-black text-white tracking-[0.2em] font-mono">HACKRACT AI</h1>
            <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">Vulnerability Labs</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center gap-4 px-8 py-4 transition-all relative group ${
                isActive(item.route) 
                  ? 'text-[#00c477]' 
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {isActive(item.route) && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-[3px] h-full bg-[#00c477] shadow-[0_0_15px_#00c477]"
                />
              )}
              <item.icon className={`text-lg transition-colors ${isActive(item.route) ? 'text-[#00c477]' : 'group-hover:text-white'}`} />
              <span className="text-[11px] font-black tracking-[0.2em] font-mono">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-8 mt-auto">
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#ff3366]/10 text-[#ff3366] hover:bg-[#ff3366] hover:text-white rounded-lg transition-all font-mono font-black text-[11px] tracking-widest uppercase border border-[#ff3366]/30"
          >
            <FiLogOut className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-10 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl z-40 sticky top-0">
          <div className="flex items-center gap-2 cursor-pointer group">
            <h2 className="text-sm font-black text-white tracking-widest uppercase font-mono group-hover:text-[#00c477] transition-colors">{orgName}</h2>
            <FiChevronDown className="text-gray-500 group-hover:text-white transition-colors" />
          </div>

          <div className="flex items-center gap-6">
            <button 
              className="relative p-2 rounded-lg bg-white/[0.02] border border-white/5 text-gray-400 hover:text-[#00c477] transition-all"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <FiBell />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff3366] text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-[#050505]">3</span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00c477]/20 to-emerald-500/10 border border-[#00c477]/30 flex items-center justify-center font-black text-[#00c477] shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#050505]">
          <Outlet />
        </main>

        {/* AI AGENT STATUS BAR */}
        <footer className="h-10 bg-[#050505] border-t border-white/5 px-10 flex items-center justify-between text-[9px] font-black font-mono uppercase tracking-[0.2em] text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#00c477]">
              <FiActivity className="animate-pulse" />
              <span>AI Agent: System Ready</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2"><FiZap className="text-amber-500" /> Latency: 14ms</span>
            <span className="flex items-center gap-2"><FiTarget className="text-blue-500" /> Core_Temp: 32°C</span>
            <span className="flex items-center gap-2"><span className="text-gray-700">Session:</span> 0x4F...2E</span>
          </div>
        </footer>

        {/* Floating Action Button */}
        <button className="fixed bottom-16 right-10 w-14 h-14 bg-[#00c477] text-black rounded-full shadow-[0_0_25px_rgba(0,255,136,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
          <FiPlus size={24} />
        </button>
      </div>
    </div>
  );
};

export default OrganizationLayout;
