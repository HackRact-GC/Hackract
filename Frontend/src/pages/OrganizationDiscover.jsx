import React, { useState } from 'react';
import { FiSearch, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MOCK_HACKERS = [
  {
    id: 1,
    name: "Null_Pointer_Ex",
    tag: "#ETHICAL_HACKER_102",
    rating: 4.9,
    rank: "GOLD",
    skills: ["Web Exploitation", "Kernel Research"],
    certs: ["OSCP"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NullPointer&baseColor=00ff88"
  },
  {
    id: 2,
    name: "Cyber_Sentinel",
    tag: "#SEC_ARCHITECT_04",
    rating: 4.8,
    rank: "PLATINUM",
    skills: ["Cloud Security", "Pentesting"],
    certs: ["CEH"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sentinel&baseColor=00ff88"
  },
  {
    id: 3,
    name: "Root_Access",
    tag: "#RF_REACH_99",
    rating: 4.5,
    rank: "SILVER",
    skills: ["IoT Hacking", "SDR"],
    certs: ["GPEN"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Root&baseColor=00ff88"
  },
  {
    id: 4,
    name: "Ghost_Shell",
    tag: "#SH_DEEP_33",
    rating: 4.7,
    rank: "GOLD",
    skills: ["Binary Analysis"],
    certs: ["OSCE"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ghost&baseColor=00ff88"
  },
  {
    id: 5,
    name: "Buffer_Overrun",
    tag: "#B0_X64_11",
    rating: 4.6,
    rank: "SILVER",
    skills: ["Fuzzing", "Malware"],
    certs: [],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Buffer&baseColor=00ff88"
  },
  {
    id: 6,
    name: "Packet_Wizard",
    tag: "#PW_TCP_8080",
    rating: 4.9,
    rank: "ELITE",
    skills: ["Network Forensics"],
    certs: ["GREM"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Wizard&baseColor=00ff88"
  }
];

const OrganizationDiscover = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-full -m-10"> {/* Offset OrganizationLayout padding */}
      
      {/* Top Search Bar Area */}
      <div className="px-10 py-5 border-b border-white/5 bg-[#050505] flex items-center justify-between sticky top-0 z-10">
        <div className="relative w-full max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input 
            type="text" 
            placeholder="Search hacker aliases, skills, or certifications..." 
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 focus:shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-[#080808] p-8 overflow-y-auto hidden md:block">
          <h3 className="text-[10px] font-black text-[#00ff88] tracking-widest font-mono mb-8 uppercase">Refine Discovery</h3>
          
          <div className="mb-8">
            <h4 className="text-[9px] font-black text-gray-500 tracking-widest font-mono mb-4 uppercase">Core Skills</h4>
            <div className="space-y-3">
              {['Web Exploitation', 'Network Security', 'Mobile Forensics'].map(skill => (
                <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-white/20 bg-black/50 flex items-center justify-center group-hover:border-[#00ff88]/50 transition-colors">
                    {/* Add check icon if checked */}
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-[9px] font-black text-gray-500 tracking-widest font-mono mb-4 uppercase">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {['OSCP', 'CEH', 'GPEN', 'CISSP'].map(cert => (
                <button key={cert} className="px-3 py-1.5 rounded-md border border-white/10 bg-transparent text-[10px] font-mono text-gray-400 hover:border-[#00ff88]/50 hover:text-[#00ff88] transition-colors uppercase">
                  {cert}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-[9px] font-black text-gray-500 tracking-widest font-mono mb-4 uppercase">Minimal Rating</h4>
            <div className="flex items-center gap-2 text-gray-500">
              {[1, 2, 3, 4].map(star => (
                <FiStar key={star} className="text-[#00ff88] fill-[#00ff88] text-sm" />
              ))}
              <FiStar className="text-gray-600 text-sm" />
              <span className="text-xs text-gray-400 ml-2 font-mono">4.0+</span>
            </div>
          </div>
        </aside>

        {/* Main Content: Hacker Grid */}
        <main className="flex-1 p-10 overflow-y-auto bg-[#050505]">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Top Penetration Experts</h1>
              <p className="text-gray-400 text-sm">Showing 158 verified security researchers in your scope.</p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/5">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
              <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest">Live_Datafeed: Synced</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {MOCK_HACKERS.map((hacker, i) => (
              <motion.div 
                key={hacker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0a0a0a] border border-white/5 hover:border-[#00ff88]/30 rounded-xl p-6 transition-all group flex flex-col h-full"
              >
               <div className="flex items-start justify-between mb-6">
                 <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#00ff88]/20 to-emerald-900/40 p-0.5 border border-white/10 group-hover:border-[#00ff88]/50 transition-colors relative">
                    <img src={hacker.avatar} alt={hacker.name} className="w-full h-full rounded-lg object-cover bg-black/50" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#00ff88] border-2 border-[#0a0a0a] shadow-[0_0_5px_#00ff88]" />
                 </div>
                 
                 <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 text-white font-bold mb-1">
                     <FiStar className="text-[#00ff88] fill-[#00ff88] text-sm" />
                     <span>{hacker.rating}</span>
                   </div>
                   <div className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">
                     Rank: {hacker.rank}
                   </div>
                 </div>
               </div>

               <div>
                 <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00ff88] transition-colors">{hacker.name}</h3>
                 <p className="text-xs text-gray-500 font-mono mb-6">{hacker.tag}</p>
               </div>

               <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                 {hacker.skills.map(skill => (
                   <span key={skill} className="px-2.5 py-1 rounded border border-white/10 bg-white/5 text-[10px] text-gray-300 font-mono">
                     {skill}
                   </span>
                 ))}
                 {hacker.certs.map(cert => (
                   <span key={cert} className="px-2.5 py-1 rounded border border-[#00ff88]/20 bg-[#00ff88]/5 text-[10px] text-[#00ff88] font-mono">
                     {cert}
                   </span>
                 ))}
               </div>

               <button className="w-full py-3 rounded-lg bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold text-sm transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] mt-auto active:scale-[0.98]">
                 View Profile
               </button>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-12 gap-2">
            <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors">
              <FiChevronLeft className="text-sm" />
            </button>
            <button className="w-8 h-8 rounded bg-[#00ff88] text-black font-bold text-sm flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors text-sm font-mono">2</button>
            <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors text-sm font-mono">3</button>
            <span className="text-gray-600 px-1">...</span>
            <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors text-sm font-mono">24</button>
            <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors">
              <FiChevronRight className="text-sm" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDiscover;
