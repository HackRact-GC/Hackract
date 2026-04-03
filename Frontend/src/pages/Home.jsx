import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import api from "../api/axiosConfig";
import { motion } from "framer-motion";
import { FiSearch, FiBell, FiLock } from "react-icons/fi";

import HackerDashboardView from "./HackerDashboardView.jsx";
import OrganizationDashboardView from "./OrganizationDashboardView.jsx";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.roles?.some(r => r.type === 'PENTESTER')) {
          const { data } = await api.get('/hacker-profiles/me/status');
          setProfileStatus(data.data.profile?.status);
        }
      } catch (err) {
        console.error('Handshake synchronization failed', err);
      }
    };
    fetchData();
  }, [user]);

  const primaryRoleType = user?.roles?.[0]?.type;
  const isSuperAdmin = user?.roles?.some((r) => r.type === "SUPER_ADMIN");
  const isOrgView = user?.roles?.some((r) => r.type === "ORG_ADMIN") && !isSuperAdmin;

    return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans selection:bg-[#00ff88]/30 selection:text-black">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ff88]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

<<<<<<< HEAD
  if (isOrgView) {
      navItems = [
          { label: "Org Overview", active: true, route: '/dashboard' },
          { label: "Teams", route: '/teams' },
          { label: "Projects", route: '/projects' },
          { label: "Compliance", route: '/compliance' },
          { label: "Settings", route: '/settings' },
      ];
  }

  if (isSuperAdmin) {
      navItems.push({ label: "Approvals Pipeline", route: '/admin/approvals', adminOnly: true });
  }

  const quickActions = isOrgView
    ? [
      { title: "Create Program", description: "Define a new security program" },
      { title: "Invite Pentester", description: "Bring in an external operator" },
      { title: "Review Findings", description: "Prioritize open issues" },
    ]
    : [
      { title: "New Pentest", description: "Kick off a scoped engagement" },
      { title: "Upload Evidence", description: "Attach screenshots or logs" },
      { title: "Invite Teammate", description: "Collaborate on findings" },
    ];

  const highlights = isOrgView
    ? [
      { title: "Active Programs", value: "4", tone: "bg-emerald-50 text-emerald-800" },
      { title: "Vulns Awaiting Triage", value: "18", tone: "bg-amber-50 text-amber-800" },
      { title: "Vendors Engaged", value: "6", tone: "bg-sky-50 text-sky-800" },
    ]
    : [
      { title: "Open Findings", value: "12", tone: "bg-amber-50 text-amber-800" },
      { title: "In Progress", value: "3", tone: "bg-blue-50 text-blue-800" },
      { title: "Reports Due", value: "2", tone: "bg-rose-50 text-rose-800" },
    ];

  const activity = isOrgView
    ? [
      { title: "New vendor added to program", time: "1h ago" },
      { title: "Policy exception approved", time: "5h ago" },
      { title: "Quarterly report exported", time: "Yesterday" },
    ]
    : [
      { title: "SQLi discovered on login", time: "2h ago" },
      { title: "Report draft exported", time: "6h ago" },
      { title: "New collaborator added", time: "Yesterday" },
    ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
      {/* Subtle Background Orbs to match Landing Page */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />

      {/* Left sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-black/40 backdrop-blur-2xl relative z-20">
        <div className="px-8 py-8 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-black/50 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] font-bold shadow-[0_0_15px_rgba(0,255,136,0.1)]">
            λ
          </div>
          <span className="text-xl font-mono font-bold tracking-[0.2em] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] uppercase">
            HACKRACT
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`w-full text-left px-5 py-3 rounded-xl font-mono text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                  item.active
                  ? "bg-[#00ff88] text-black font-black shadow-[0_0_25px_rgba(0,255,136,0.3)] scale-[1.02]"
                  : item.adminOnly 
                    ? "text-[#00ff88] hover:bg-[#00ff88]/10 border border-[#00ff88]/20 mt-8"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="relative z-10">{item.label}</span>
              {item.adminOnly && (
                <span className="relative z-10 text-[8px] bg-[#00ff88]/20 px-2 py-0.5 rounded tracking-widest border border-[#00ff88]/20">
                  Admin
                </span>
              )}
              {item.active && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              )}
            </button>
          ))}
        </nav>

        <div className="px-6 py-8">
           <div className="p-4 rounded-2xl bg-[#00ff88]/5 border border-[#00ff88]/10 group cursor-pointer hover:border-[#00ff88]/30 transition-all duration-500">
             <div className="text-[10px] font-mono text-[#00ff88] uppercase tracking-tighter mb-1 opacity-70">Security Pulse</div>
             <div className="text-[10px] text-gray-500 font-mono italic">"Secure • Offensive • Precise"</div>
           </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto">
        {/* Top nav */}
        <header className="sticky top-0 h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <div className="text-[10px] font-mono tracking-widest text-[#00ff88] uppercase mb-0.5">
                {isOrgView ? "Entity Authorization" : "Operator Session"}
              </div>
              <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {isOrgView ? "Security Console" : "Command Center"}
=======
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-10 bg-black/40 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.65)]" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#00ff88]/80">
                    {isOrgView ? "Enterprise Node" : "Operative Console"}
                </h2>
>>>>>>> origin/main
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isOrgView ? "Security Posture Dashboard" : "Operational Command Center"}
              </h1>
            </div>
          </div>

<<<<<<< HEAD
          <div className="flex items-center gap-5">
            <div className="relative group hidden md:block">
              <input
                type="text"
                placeholder="Search resources..."
                className="bg-black/40 border border-white/10 rounded-xl px-5 py-2.5 text-xs font-mono w-72 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all duration-300 placeholder-gray-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-600 group-hover:text-[#00ff88]/50">/</div>
            </div>

            <div className="flex items-center gap-4 border-l border-white/10 pl-5">
              <button
                onClick={handleLogout}
                className="group relative px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest hover:border-rose-500/50 hover:text-rose-500 transition-all duration-300"
              >
                Terminate Session
              </button>
              
              <div 
                onClick={() => navigate(isOrgView ? "/organization-profile" : "/hacker-profile")}
                className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-emerald-500/10 border border-[#00ff88]/30 flex items-center justify-center font-mono font-bold text-[#00ff88] cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,136,0.1)]"
              >
                {user?.fullName?.[0]?.toUpperCase() || user?.handle?.[0]?.toUpperCase() || "λ"}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 p-8">
          {/* Center content */}
          <div className="space-y-8 h-fit">
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-black/40 border border-white/5 rounded-[32px] p-8 shadow-2xl group transition-all duration-500 hover:border-[#00ff88]/20">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="text-[120px] font-mono font-black select-none">Σ</div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/5 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span>
                    <span className="text-[10px] font-mono tracking-widest text-[#00ff88] uppercase">System Latency: 4ms</span>
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight">Active Engagements</h2>
                </div>
                <button
                  onClick={() => navigate("/projects")}
                  className="group relative px-6 py-3 rounded-xl bg-[#00ff88] text-black font-mono font-bold text-[11px] uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                >
                  New Project [+]
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {highlights.map((card) => (
                  <div key={card.title} className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group/card">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3 group-hover/card:text-[#00ff88] transition-colors">{card.title}</div>
                    <div className="text-4xl font-black tracking-tight">{card.value}</div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all">
                      <svg className="w-3 h-3 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BANNER */}
            {(primaryRoleType === 'PENTESTER' || primaryRoleType === 'PROJECT_ADMIN') && profileStatus !== 'APPROVED' && (
              <div className="relative overflow-hidden bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="absolute -left-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-2xl shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    ☢
                  </div>
                  <div>
                    <h3 className="font-extrabold text-amber-500 font-mono uppercase tracking-widest text-sm mb-2">Restricted Access: Identity Pending</h3>
                    <p className="text-xs text-gray-400 max-w-lg leading-relaxed font-light">
                      Operator <span className="text-amber-500 font-mono font-bold">[{user?.handle || 'GHOST'}]</span> requires verification to engage in organization missions. 
                      Status: <span className="text-amber-500 font-mono font-bold">[{profileStatus || 'UNINITIALIZED'}]</span>.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/hacker-verification')}
                  className="relative z-10 bg-amber-500 hover:bg-amber-600 text-black px-8 py-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-amber-500/20"
                >
                  Start Verification Loop →
=======
          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00ff88] transition-colors" />
              <input
                type="text"
                placeholder="Search assets, findings, history..."
                className="bg-black/50 border border-white/10 rounded-xl px-12 py-2.5 text-sm w-80 focus:outline-none focus:border-[#00ff88]/50 transition-all placeholder:text-white/40 text-white"
              />
            </div>
            <button className="relative p-3 rounded-xl bg-black border border-white/10 text-white/60 hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all">
                <FiBell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#00ff88] rounded-full border-2 border-black" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">

            {/* Critical Status Banner */}
            {primaryRoleType === 'PENTESTER' && profileStatus !== 'APPROVED' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-[#00ff88]/20 rounded-4xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur shadow-2xl shadow-black/20"
              >
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] border border-[#00ff88]/20">
                    <FiLock size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#00ff88] uppercase tracking-widest">Identity Verification Pending</h3>
                    <p className="text-sm text-white/70 max-w-xl">
                      Access to open security tenders is restricted until your identification documents are validated. Current status: <span className="font-mono text-white">[{profileStatus || 'AWAITING_DATA'}]</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/hacker-verification')}
                  className="w-full md:w-auto px-8 py-3 bg-[#00ff88] hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-black/20 active:scale-95"
                >
                  Initiate Verification
>>>>>>> origin/main
                </button>
              </motion.div>
            )}

<<<<<<< HEAD
            {/* QUICK ACTIONS */}
            <div className="bg-black/40 border border-white/5 rounded-[32px] p-8">
              <h3 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#00ff88] rounded-full" />
                Strategic Directives
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    className="group relative border border-white/5 bg-white/[0.02] rounded-2xl p-6 text-left hover:border-[#00ff88]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <div className="text-xs font-bold font-mono tracking-widest text-[#00ff88] mb-2 uppercase opacity-80">{action.title}</div>
                      <p className="text-[11px] text-gray-500 group-hover:text-gray-400 leading-normal">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RECOMENDED SCRIPTS */}
            <div className="bg-[#00ff88]/[0.02] border border-[#00ff88]/10 rounded-[32px] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse shadow-[0_0_12px_#00ff88]" />
                  <h3 className="text-sm font-mono font-black uppercase tracking-[0.3em] text-[#00ff88]">
                    Mission Essentials
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                  Ready for deployment
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(isOrgView 
                  ? [
                      { name: "OpenVAS", cat: "Scanner", stat: "PENDING" },
                      { name: "Splunk", cat: "SIEM", stat: "SYNCED" },
                      { name: "CrowdStrike", cat: "EDR", stat: "PENDING" },
                      { name: "Nessus", cat: "Audit", stat: "PENDING" }
                    ]
                  : [
                      { name: "Burp Suite", cat: "Web Proxy", stat: "SYNCED" },
                      { name: "Metasploit", cat: "Exploit", stat: "PENDING" },
                      { name: "Ghidra", cat: "RE", stat: "PENDING" },
                      { name: "Nmap", cat: "Scanner", stat: "SYNCED" }
                    ]
                ).map((tool) => (
                  <div key={tool.name} className="relative group p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#00ff88]/30 transition-all cursor-pointer">
                    <div className="text-[9px] font-mono text-[#00ff88] mb-1 opacity-60 uppercase">{tool.cat}</div>
                    <div className="font-bold text-sm tracking-tight mb-3 text-gray-200">{tool.name}</div>
                    <div className={`text-[8px] font-mono px-2 py-0.5 rounded inline-block ${
                      tool.stat === 'SYNCED' 
                        ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' 
                        : 'bg-white/5 text-gray-600 border border-white/5'
                    }`}>
                      {tool.stat}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-8 h-fit">
            {/* PROFILE CARD */}
            <div className="bg-black/40 border border-white/5 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 transition-all group-hover:bg-[#00ff88]/10" />
              
              <div className="flex items-center gap-4 relative z-10 mb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00ff88]/20 to-emerald-500/10 border border-[#00ff88]/40 flex items-center justify-center text-2xl font-black text-[#00ff88] shadow-inner shadow-[#00ff88]/10">
                  {user?.fullName?.[0]?.toUpperCase() || "O"}
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Authenticated</div>
                  <div className="text-xl font-bold tracking-tight">{user?.fullName || user?.handle || "Operator"}</div>
                </div>
              </div>

              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[8px] font-mono text-gray-600 uppercase mb-1">Status</div>
                      <div className="text-[10px] font-mono text-[#00ff88] font-bold">Operational</div>
                   </div>
                   <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[8px] font-mono text-gray-600 uppercase mb-1">MFA</div>
                      <div className="text-[10px] font-mono text-emerald-500 font-bold">Active</div>
                   </div>
                </div>
                
                <button
                  onClick={() => navigate(isOrgView ? "/organization-profile" : "/hacker-profile")}
                  className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-gray-300 hover:text-white hover:border-[#00ff88]/50 hover:bg-[#00ff88]/5 transition-all duration-300"
                >
                  Configure Identity
                </button>
              </div>
            </div>

            {/* INTEL LOG */}
            <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 shadow-2xl relative">
              <h4 className="text-[10px] font-mono font-black text-[#00ff88] tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                <span className="w-1 h-3 bg-[#00ff88] rounded-full animate-pulse" />
                Live Intel Feed
              </h4>
              <div className="space-y-8 relative overflow-hidden">
                {activity.map((item, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-pointer relative z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#00ff88] transition-colors" />
                      <div className="w-0.5 grow bg-white/5 group-hover:bg-[#00ff88]/20 transition-colors" />
                    </div>
                    <div className="pb-2">
                      <div className="text-[11px] text-gray-300 group-hover:text-white leading-tight mb-1 transition-colors">{item.title}</div>
                      <div className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">{item.time}</div>
                    </div>
                  </div>
                ))}
                {/* Visual fading effect at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* AD BANNER OR STATUS INFOGRAPHIC */}
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#00ff88]/20 to-emerald-900/40 border border-[#00ff88]/20 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#00ff88]/10 rounded-full -mr-24 -mt-24 blur-[60px] opacity-50" />
               <div className="relative z-10">
                  <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[#00ff88] mb-2 opacity-80">Encryption Module</p>
                  <h4 className="text-lg font-extrabold leading-tight mb-6 uppercase tracking-tight">Upgrade Your <br />Neural Link</h4>
                  <p className="text-[10px] text-gray-400 mb-6 leading-relaxed font-light">Access advanced telemetry and priority support for organization-wide security orchestration.</p>
                  <button className="w-full py-3.5 bg-[#00ff88] text-black text-[10px] font-mono font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]">Elevate Access</button>
               </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
=======
            {/* Core Dashboard View */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {isOrgView ? <OrganizationDashboardView /> : <HackerDashboardView />}
            </motion.section>

            {/* Platform Insights / Tooling Section (Universal) */}
            <section className="bg-linear-to-r from-black via-white/5 to-black border border-white/10 rounded-4xl p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[600px] h-full bg-[#00ff88]/5 blur-[80px] -mr-40 pointer-events-none" />
                <div className="relative z-10 grid md:grid-cols-[1fr_auto] items-center gap-12">
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Technical Resource Arsenal</h3>
                  <p className="text-white/70 max-w-lg leading-relaxed">
                            Access recommended tools and specialized environments for your current security focus.
                            These resources are provisioned via our local container engine.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {["Burp Suite", "Metasploit", "Nmap", "Wireshark"].map(tool => (
                    <div key={tool} className="px-5 py-2.5 bg-black rounded-xl border border-white/10 text-[11px] font-bold text-white font-mono flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
                                {tool.toUpperCase()}
                            </div>
                        ))}
                      </div>
                   </div>
                   <div className="p-8 bg-black rounded-4xl border border-white/10 text-center space-y-4 shadow-3xl">
                  <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Platform Sync</div>
                  <div className="text-4xl font-black text-[#00ff88] tracking-tighter">99.9%</div>
                  <p className="text-xs text-white/50 font-mono">ENCRYPTED TELEMETRY</p>
                  <button className="px-6 py-2 bg-white/10 hover:bg-[#00ff88] hover:text-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10 hover:border-[#00ff88]">
                            Refresh Feed
                        </button>
                   </div>
                </div>
            </section>

          </div>
        </main>
>>>>>>> origin/main
    </div>
  );
};

export default Home;
