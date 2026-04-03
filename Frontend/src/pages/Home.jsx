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

        <header className="h-20 border-b border-white/10 flex items-center justify-between px-10 bg-black/40 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.65)]" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#00ff88]/80">
                    {isOrgView ? "Enterprise Node" : "Operative Console"}
                </h2>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isOrgView ? "Security Posture Dashboard" : "Operational Command Center"}
              </h1>
            </div>
          </div>

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
                </button>
              </motion.div>
            )}

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
    </div>
  );
};

export default Home;
