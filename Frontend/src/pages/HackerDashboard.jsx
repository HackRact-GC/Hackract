import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Grid: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Zap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Dollar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  ShoppingBag: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  TrendUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Target: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Trophy: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34M12 15a5 5 0 0 0 5-5V4H7v6a5 5 0 0 0 5 5z"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>,
};

const NAV = [
  { key: "overview", label: "Global Intel", Icon: Icons.Grid },
  { key: "engagements", label: "Live Missions", Icon: Icons.Shield },
  { key: "earnings", label: "Rewards & Bounty", Icon: Icons.Dollar },
  { key: "marketplace", label: "Mission Board", Icon: Icons.ShoppingBag },
  { key: "rankings", label: "Hall of Fame", Icon: Icons.Trophy },
];

const StatCard = ({ label, value, trend, icon: Icon, color }) => {
  const bg = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", rose: "bg-rose-50 text-rose-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600" };
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl ${bg[color]} flex items-center justify-center shrink-0 shadow-inner`}>
          <Icon />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">
            <Icons.TrendUp /> {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </div>
  );
};

const Badge = ({ text, type = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-500",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${styles[type] || styles.default}`}>
      {text}
    </span>
  );
};

const HackerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/hacker-profiles/me");
        setProfile(data?.data?.profile);
      } catch (err) {
        console.error("Profile fetch error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-xl" />
          <p className="text-sm font-black text-indigo-900/40 uppercase tracking-widest">Negotiating secure handshake...</p>
        </div>
      </div>
    );
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <div className="space-y-8">
      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Critical Found" value="14" trend="+8%" icon={Icons.Target} color="rose" />
        <StatCard label="Lifetime Rewards" value="$42.5k" trend="+12%" icon={Icons.Dollar} color="emerald" />
        <StatCard label="Global Rank" value="#128" trend="Top 1%" icon={Icons.Trophy} color="amber" />
        <StatCard label="Impact Score" value="982" trend="+45" icon={Icons.Zap} color="indigo" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Active Missions */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Icons.Shield /> Live Missions
            </h3>
            <button onClick={() => setActiveTab("engagements")} className="text-xs font-bold text-indigo-600 hover:underline tracking-tight">View Full Roster</button>
          </div>
          <div className="p-4 space-y-4">
            {[
              { id: 1, name: "Project Nightingale", org: "Nebula Systems", status: "Ongoing", severity: "High", due: "2d left" },
              { id: 2, name: "Core Ledger Audit", org: "FinBank Int", status: "Reporting", severity: "Critical", due: "14h left" },
              { id: 3, name: "Edge Network Scan", org: "Global Logistics", status: "Pending Fix", severity: "Medium", due: "3d left" },
            ].map(m => (
              <div key={m.id} className="p-5 rounded-3xl bg-gray-50/50 border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                   <div>
                     <p className="text-sm font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase">{m.name}</p>
                     <p className="text-xs font-bold text-gray-400 mt-0.5">{m.org}</p>
                   </div>
                   <Badge text={m.status} type={m.status === "Ongoing" ? "info" : "success"} />
                </div>
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                   <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                     <Icons.Zap /> {m.severity} RISK
                   </div>
                   <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-tighter ml-auto">
                     <Icons.Clock /> {m.due}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Intel */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Icons.Grid /> Operative Log
            </h3>
            <Badge text="Synced" type="success" />
          </div>
          <div className="p-8 space-y-8">
            {[
              { id: 1, action: "Vulnerability Verified", target: "SQLi in AuthService", time: "2h ago", icon: Icons.Target, color: "text-rose-500 bg-rose-50" },
              { id: 2, action: "Mission Activated", target: "Project Nightingale", time: "5h ago", icon: Icons.Shield, color: "text-indigo-500 bg-indigo-50" },
              { id: 3, action: "Reward Dispatched", target: "$2,500.00", time: "1d ago", icon: Icons.Dollar, color: "text-emerald-500 bg-emerald-50" },
              { id: 4, action: "Rank Calibrated", target: "Advanced to Gold II", time: "3d ago", icon: Icons.Trophy, color: "text-amber-500 bg-amber-50" },
            ].map(a => (
              <div key={a.id} className="flex gap-5 items-start relative before:absolute before:left-[17px] before:top-10 before:bottom-[-20px] before:w-px before:bg-gray-100 last:before:hidden">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${a.color}`}>
                   <a.icon />
                </div>
                <div className="flex-1">
                   <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{a.action}</p>
                   <p className="text-xs font-bold text-indigo-500 mt-0.5">{a.target}</p>
                   <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1"><Icons.Clock/>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MarketplaceTab = () => (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Mission Board</h2>
           <p className="text-sm text-gray-400 font-bold">New security engagements matching your technical profile.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search /></span>
              <input type="text" placeholder="Search mission IDs..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10" />
            </div>
            <button className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100">Filter Arsenal</button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[
           { id: 1, title: "FinBank iOS Hardening", bounty: "$10,000", org: "FinBank Int", icon: "📱", tags: ["Mobile", "iOS", "API"] },
           { id: 2, title: "Nebula Core P2P Audit", bounty: "$25,000", org: "Nebula Systems", icon: "🪐", tags: ["Crypto", "Network", "Rust"] },
           { id: 3, title: "SafeGuard E-Commerce", bounty: "$5,000", org: "SafeGuard LLC", icon: "🛒", tags: ["Web", "SQLi", "Logic"] },
           { id: 4, title: "CryptoVault HotWallet", bounty: "$50,000", org: "BlockSec", icon: "🔑", tags: ["Solidity", "Smart Contract"] },
           { id: 5, title: "HealthNet PII Protection", bounty: "$12,000", org: "National Health", icon: "🏥", tags: ["AWS", "Privacy", "IAM"] },
         ].map(mission => (
           <div key={mission.id} className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group flex flex-col items-center text-center">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">{mission.icon}</div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-1">{mission.org}</p>
              <h4 className="text-lg font-black text-gray-900 leading-tight mb-4">{mission.title}</h4>
              <div className="text-2xl font-black text-gray-800 mb-6 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">{mission.bounty}</div>
              
              <div className="flex flex-wrap justify-center gap-1.5 mb-8">
                 {mission.tags.map(t => <span key={t} className="px-2.5 py-1 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest rounded-lg border border-gray-100">{t}</span>)}
              </div>
              
              <button className="w-full py-4 bg-gray-900 group-hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all">Accept Mission</button>
           </div>
         ))}
       </div>
     </div>
  );

  const TABS = { overview: OverviewTab, engagements: () => <OverviewTab />, earnings: () => <OverviewTab />, marketplace: MarketplaceTab, rankings: () => <OverviewTab /> };
  const ActiveContent = TABS[activeTab] || OverviewTab;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* ── Desktop Header ── */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
           <div className="text-2xl font-black tracking-tighter text-indigo-600 flex items-center gap-2">
              <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-mono">λ</span>
              HACKRECT <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 ml-2">v.GLOBAL</span>
           </div>
        </div>

        <div className="ml-auto flex items-center gap-8">
          <div className="relative hidden lg:block">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><Icons.Search /></span>
            <input type="text" placeholder="Search operatives, exploits, missions..." className="w-96 pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all placeholder-gray-400" />
          </div>
          
          <div className="flex items-center gap-6">
             <button className="relative p-3 rounded-2xl bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                <Icons.Bell />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-white" />
             </button>
             
             <button onClick={() => navigate("/hacker-profile")} className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl pl-4 pr-3 py-1.5 hover:border-indigo-200 transition-all group">
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
                   <p className="text-sm font-black text-gray-800 group-hover:text-indigo-600 transition-colors uppercase leading-none">Operative v1</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-100">H1</div>
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex gap-10 px-10 py-10">
        {/* ── Sidebar ── */}
        <aside className="w-72 shrink-0 space-y-2">
           {NAV.map(item => (
             <button
               key={item.key}
               onClick={() => setActiveTab(item.key)}
               className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all
                 ${activeTab === item.key 
                   ? "bg-gray-900 text-white shadow-2xl shadow-gray-200 -translate-x-2" 
                   : "text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-sm"}`}
             >
               <span className={activeTab === item.key ? "text-indigo-400" : "text-gray-300"}><item.Icon /></span>
               {item.label}
               {activeTab === item.key && (
                 <span className="ml-auto flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse appearance-none" />
               )}
             </button>
           ))}

           <div className="mt-12 p-8 rounded-[40px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">PRO Membership</p>
                 <h4 className="text-lg font-black leading-tight mb-4 uppercase">Unlock Elite Private Tenders</h4>
                 <button className="w-full py-3 bg-white text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform">Upgrade Neural Link</button>
              </div>
           </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
             >
               <ActiveContent />
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default HackerDashboard;
