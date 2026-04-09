import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiShield, FiUsers, FiAlertCircle, FiArrowRight, 
  FiExternalLink, FiChevronDown, FiPlus, FiEye, 
  FiBarChart2, FiActivity, FiGlobe, FiClock, FiTarget
} from "react-icons/fi";

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color, trend, progress, avatars }) => (
  <div className="bg-[#080808] border border-white/5 p-8 rounded-[32px] flex flex-col justify-between h-48 relative overflow-hidden group hover:border-[#00ff88]/20 transition-all duration-500 shadow-2xl">
    <div className="flex items-start justify-between relative z-10">
      <div className="space-y-1">
        <p className="text-[10px] font-mono font-black text-gray-600 uppercase tracking-[.2em]">{label}</p>
        <h3 className="text-5xl font-black text-white tracking-tighter">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl bg-white/2 border border-white/5 ${color} group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={24} />
      </div>
    </div>

    <div className="relative z-10 flex items-center justify-between">
      {progress !== undefined && (
        <div className="flex-1 mr-6">
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="h-full bg-linear-to-r from-[#00ff88] to-emerald-400 shadow-[0_0_10px_#00ff88]" 
            />
          </div>
        </div>
      )}
      
      {avatars && (
        <div className="flex -space-x-2 mr-auto">
          {avatars.map((av, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#080808] bg-gray-800 flex items-center justify-center text-[10px] font-black text-white overflow-hidden shadow-lg">
              {av.startsWith('http') ? <img src={av} alt="avatar" /> : av}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-[#080808] bg-[#00ff88]/10 text-[#00ff88] flex items-center justify-center text-[8px] font-black shadow-lg">
            +4
          </div>
        </div>
      )}

      {trend && (
        <span className="text-[10px] font-mono font-black text-[#00ff88] tracking-widest">{trend}</span>
      )}

      {sub && (
        <span className="text-[9px] font-mono font-black text-[#ff3366] uppercase tracking-widest leading-none text-right">{sub}</span>
      )}
    </div>
    
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
  </div>
);

// ─── Project Table Component ──────────────────────────────────────────────────
const RecentProjects = () => {
  const projects = [
    { name: "Project Chimera", id: "#8821-XP", status: "ACTIVE", admin: "S. Caulfield" },
    { name: "Internal Nexus", id: "#9902-QL", status: "PLANNING", admin: "T. Miller" },
    { name: "Firewall Audit V3", id: "#1244-AF", status: "ACTIVE", admin: "E. Chen" },
  ];

  return (
    <div className="bg-[#080808] border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl h-full">
      <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-black text-white tracking-widest uppercase font-mono">Recent Projects</h3>
        <button className="text-[9px] font-black text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-[0.2em]">View All</button>
      </div>
      <div className="p-0 flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest border-b border-white/5">
              <th className="px-10 py-4 font-normal">Name</th>
              <th className="px-10 py-4 font-normal">Status</th>
              <th className="px-10 py-4 font-normal text-center">Admin</th>
              <th className="px-10 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/3">
            {projects.map((p, i) => (
              <tr key={i} className="hover:bg-white/1 transition-all group">
                <td className="px-10 py-6">
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#00ff88] transition-colors">{p.name}</p>
                    <p className="text-[10px] font-mono text-gray-600 mt-1">ID: {p.id}</p>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-md border tracking-widest ${
                    p.status === 'ACTIVE' 
                      ? 'bg-[#00ff88]/5 text-[#00ff88] border-[#00ff88]/20' 
                      : 'bg-blue-500/5 text-blue-400 border-blue-500/20'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-center">
                  <span className="text-xs font-mono font-bold text-gray-400">{p.admin}</span>
                </td>
                <td className="px-10 py-6 text-right">
                  <button className="text-gray-600 hover:text-white transition-colors"><FiEye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Chart Component ──────────────────────────────────────────────────────────
const VulnerabilityTrend = () => {
  const days = ['MON', '', '', '', '', '', 'SUN'];
  const values = [40, 65, 50, 85, 100, 60, 30];

  return (
    <div className="bg-[#080808] border border-white/5 rounded-[32px] p-10 flex flex-col h-full shadow-2xl relative overflow-hidden group">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-[#00ff88]/10 text-[#00ff88] rounded-lg"><FiBarChart2 /></div>
        <h3 className="text-sm font-black text-white tracking-widest uppercase font-mono">Vulnerability Trend</h3>
      </div>

      <div className="flex-1 flex items-end justify-between gap-3 mb-6 min-h-[160px]">
        {values.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
             <div className="w-full relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                  className={`w-full rounded-t-lg transition-all duration-500 shadow-lg ${
                    val === 100 
                      ? 'bg-[#00ff88] shadow-[0_0_20px_#00ff88]' 
                      : 'bg-white/10 group-hover/bar:bg-white/20'
                  }`}
                />
             </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[9px] font-mono font-black text-gray-700 uppercase tracking-widest border-t border-white/5 pt-4">
        <span>MON</span>
        <span>SUN</span>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center py-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Detection Rate</span>
          <span className="text-[13px] font-black text-[#00ff88]">99.4%</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t border-white/[0.03]">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Response Time</span>
          <span className="text-[13px] font-black text-blue-400 flex items-baseline gap-1">2.4<span className="text-[9px] text-gray-600">h</span></span>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/[0.02] rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:bg-[#00ff88]/4 transition-all duration-700" />
    </div>
  );
};

// ─── Main Content ─────────────────────────────────────────────────────────────
const OrganizationDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">


      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="ACTIVE PROJECTS" 
          value="04" 
          icon={FiGlobe} 
          color="text-[#00ff88]" 
          progress={45} 
          trend="+12%"
        />
        <StatCard 
          label="ASSIGNED PENTESTERS" 
          value="07" 
          icon={FiUsers} 
          color="text-blue-400" 
          avatars={['JD', 'SM', 'RJ', 'AK']}
        />
        <StatCard 
          label="OPEN FINDINGS" 
          value="23" 
          icon={FiAlertCircle} 
          color="text-[#ff3366]" 
          sub="CRITICAL ASSETS EXPOSED"
        />
      </div>

      {/* MIDDLE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        <RecentProjects />
        <VulnerabilityTrend />
      </div>

      {/* Secondary Row if needed */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Network nodes', val: '256', icon: FiActivity },
           { label: 'Authorized links', val: '12', icon: FiTarget },
           { label: 'Scans complete', val: '4.2k', icon: FiClock },
           { label: 'Threat score', val: '0.04', icon: FiShield },
         ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.03] transition-all">
               <div className="p-2 border border-white/5 rounded-lg text-gray-600 group-hover:text-[#00ff88] transition-colors"><item.icon size={16} /></div>
               <div>
                  <div className="text-[11px] font-black text-white uppercase tracking-tight">{item.val}</div>
                  <div className="text-[8px] font-mono text-gray-600 uppercase tracking-widest font-bold">{item.label}</div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default OrganizationDashboard;
