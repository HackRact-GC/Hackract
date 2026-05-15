import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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
  { key: "overview",     label: "Global Intel",     Icon: Icons.Grid },
  { key: "engagements", label: "Live Missions",     Icon: Icons.Shield },
  { key: "earnings",    label: "Rewards & Bounty",  Icon: Icons.Dollar },
  { key: "marketplace", label: "Mission Board",     Icon: Icons.ShoppingBag },
  { key: "rankings",    label: "Hall of Fame",      Icon: Icons.Trophy },
  { key: "invitations", label: "Invitations",       Icon: Icons.Bell },
];

const StatCard = ({ label, value, trend, icon: Icon, color }) => {
  const bg = { 
    indigo: "bg-[#00c477]/10 text-[#00c477] border-[#00c477]/20", 
    emerald: "bg-[#00c477]/10 text-[#00c477] border-[#00c477]/20", 
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20", 
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20", 
    violet: "bg-purple-500/10 text-purple-500 border-purple-500/20" 
  };
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/5 p-7 flex flex-col gap-5 hover:border-[#00c477]/30 hover:-translate-y-1.5 transition-all duration-500 group shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-5 transition-opacity">
        <Icon />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div className={`w-14 h-14 rounded-2xl ${bg[color]} flex items-center justify-center shrink-0 border shadow-[0_0_15px_rgba(0,0,255,136,0.05)]`}>
          <Icon />
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-[#00c477] bg-[#00c477]/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#00c477]/20">
            <Icons.TrendUp /> {trend}
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-4xl font-black text-white tracking-tighter mb-1">{value}</p>
        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-[0.2em]">{label}</p>
      </div>
    </div>
  );
};

const Badge = ({ text, type = "default" }) => {
  const styles = {
    default: "bg-white/5 text-gray-400 border-white/10",
    success: "bg-[#00c477]/10 text-[#00c477] border-[#00c477]/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  return (
    <span className={`inline-block text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${styles[type] || styles.default}`}>
      {text}
    </span>
  );
};

import NotificationCenter from "../components/NotificationCenter";

const HackerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [realProjects, setRealProjects] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, countRes, projRes] = await Promise.all([
          api.get("/hacker-profiles/me"),
          api.get("/invitations/mine/count"),
          api.get("/projects")
        ]);
        setProfile(profileRes.data?.data?.profile);
        setPendingCount(countRes.data?.data?.pendingCount || 0);
        setRealProjects(projRes.data?.data || []);
      } catch (err) {
        console.error("Dashboard data fetch error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 border-2 border-[#00c477]/10 border-t-[#00c477] rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
          <p className="text-[11px] font-mono font-black text-[#00c477] uppercase tracking-[0.4em] animate-pulse">Initializing Secure Intel Link...</p>
        </div>
      </div>
    );
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <div className="space-y-10">
      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Missions" value={realProjects.filter(p => !p.isPersonal).length} trend={realProjects.length > 0 ? "Live" : "Idle"} icon={Icons.Target} color="rose" />
        <StatCard label="Rewards" value="$0.0k" trend="0%" icon={Icons.Dollar} color="emerald" />
        <StatCard label="Global Rank" value="Unranked" trend="N/A" icon={Icons.Trophy} color="amber" />
        <StatCard label="Local Labs" value={realProjects.filter(p => p.isPersonal).length} trend="Private" icon={Icons.Zap} color="indigo" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
        {/* Active Missions */}
        <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[40px] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00c477]/30 to-transparent" />
          <div className="px-10 py-8 flex items-center justify-between border-b border-white/5">
            <h3 className="text-xs font-mono font-black text-[#00c477] uppercase tracking-[0.3em] flex items-center gap-3">
              <Icons.Shield /> Live Missions
            </h3>
            <button onClick={() => navigate("/projects")} className="text-[10px] font-mono font-bold text-gray-500 hover:text-[#00c477] uppercase tracking-widest transition-colors">Operational View [+]</button>
          </div>
          <div className="p-6 space-y-4">
            {realProjects.filter(p => !p.isPersonal).length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-gray-600 text-[10px] font-mono font-black uppercase tracking-[0.3em]">
                  No active missions found
               </div>
            ) : (
              realProjects.filter(p => !p.isPersonal).slice(0, 3).map(m => (
                <div key={m.id} onClick={() => navigate(`/projects/${m.id}`)} className="p-6 rounded-[28px] bg-white/[0.02] border border-transparent hover:border-[#00c477]/20 hover:bg-white/[0.04] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                       <p className="text-base font-black text-white group-hover:text-[#00c477] transition-colors uppercase tracking-tight mb-1">{m.name}</p>
                       <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{m.organization?.name || "Private Org"}</p>
                     </div>
                     <Badge text={m.status || "PLANNING"} type={m.status === "IN_PROGRESS" ? "success" : "info"} />
                  </div>
                  <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                     <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                       <span className="text-[#00c477]"><Icons.Zap /></span> Scope: {m.isPersonal ? "Local" : "Org"}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest ml-auto">
                       <Icons.Clock /> {m.endDate ? new Date(m.endDate).toLocaleDateString() : "No Deadline"}
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Intel */}
        <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00c477]/30 to-transparent" />
          <div className="px-10 py-8 flex items-center justify-between border-b border-white/5">
            <h3 className="text-xs font-mono font-black text-[#00c477] uppercase tracking-[0.3em] flex items-center gap-3">
              <Icons.Grid /> Intel Log
            </h3>
            <Badge text="Encrypted" type="success" />
          </div>
          <div className="p-10 flex flex-col items-center justify-center text-gray-600 text-[10px] font-mono font-black uppercase tracking-[0.3em] py-32">
             <Icons.Activity className="w-12 h-12 mb-4 opacity-10" />
             No activity logs available
          </div>
        </div>
      </div>
    </div>
  );

  const MarketplaceTab = () => (
     <div className="space-y-8">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
         <div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Mission Board</h2>
           <p className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">Unclaimed technical challenges across the global spectrum.</p>
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="px-8 py-3.5 bg-[#00c477] text-black text-[11px] font-mono font-black uppercase tracking-widest rounded-[18px] shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-105 transition-all">Filter Archive</button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-600 text-[10px] font-mono font-black uppercase tracking-[0.3em] border-2 border-dashed border-white/5 rounded-[48px] bg-black/20">
             <Icons.ShoppingBag className="w-16 h-16 mb-6 opacity-10" />
             Mission Archive Offline — No Public Contracts Available
          </div>
       </div>
     </div>
  );

  // ── Invitations Tab ──────────────────────────────────────────────────────────
  const InvitationsTab = () => {
    const [invitations, setInvitations] = useState([]);
    const [fetchingInvites, setFetchingInvites] = useState(true);
    const [respondingId, setRespondingId] = useState(null);

    useEffect(() => {
      (async () => {
        try {
          const { data } = await api.get("/invitations/mine");
          setInvitations(data?.data || []);
        } catch (err) {
          console.error("Invitations fetch error", err);
        } finally {
          setFetchingInvites(false);
        }
      })();
    }, []);

    const handleRespond = async (id, status) => {
      setRespondingId(id);
      try {
        await api.patch(`/invitations/${id}/respond`, { status });
        setInvitations(prev =>
          prev.map(inv => inv.id === id ? { ...inv, status } : inv)
        );
        if (status === "ACCEPTED") {
          setPendingCount(c => Math.max(0, c - 1));
          toast.success("Invitation accepted! Proceeding to workspace...");
          const pentestId = invitations.find(i => i.id === id)?.pentestId;
          if (pentestId) {
            navigate(`/projects/${pentestId}`);
          }
        } else {
          setPendingCount(c => Math.max(0, c - 1));
          toast("Invitation declined.");
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to respond";
        toast.error(msg);
      } finally {
        setRespondingId(null);
      }
    };

    const STATUS_STYLES = {
      PENDING:  "text-amber-400 bg-amber-400/10 border-amber-400/30",
      ACCEPTED: "text-[#00c477] bg-[#00c477]/10 border-[#00c477]/30",
      REJECTED: "text-gray-500 bg-gray-500/10 border-gray-500/30",
      REVOKED:  "text-rose-400 bg-rose-400/10 border-rose-400/30",
      EXPIRED:  "text-gray-600 bg-gray-600/10 border-gray-600/30",
    };

    if (fetchingInvites) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/[0.02] rounded-[28px] border border-white/5 p-8 animate-pulse h-36" />
          ))}
        </div>
      );
    }

    if (invitations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl">📬</div>
          <div>
            <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tight">No Invitations Yet</h3>
            <p className="text-gray-500 text-sm max-w-sm font-mono">
              When organizations invite you to their security programs, they'll appear here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Invitations</h2>
          <div className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            {invitations.filter(i => i.status === "PENDING").length} Pending
          </div>
        </div>

        {invitations.map((inv, i) => {
          const org       = inv.pentest?.organization;
          const isPending = inv.status === "PENDING";
          const isResponding = respondingId === inv.id;

          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white/[0.02] backdrop-blur-xl rounded-[28px] border p-8 transition-all ${
                isPending ? "border-[#00c477]/20 hover:border-[#00c477]/40" : "border-white/5"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[9px] font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_STYLES[inv.status] || STATUS_STYLES.PENDING}`}>
                      {inv.status}
                    </span>
                    {org && (
                      <span className="text-[10px] text-gray-500 font-mono">{org.name}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight truncate">
                    {inv.pentest?.name || "Unknown Project"}
                  </h3>
                  {inv.pentest?.status && (
                    <p className="text-[10px] text-gray-600 font-mono mt-0.5 uppercase tracking-widest">
                      Phase: {inv.pentest.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              {inv.message && (
                <div className="bg-black/30 border border-white/5 rounded-xl px-4 py-3 mb-5">
                  <p className="text-sm text-gray-400 italic leading-relaxed">"{inv.message}"</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="text-[10px] text-gray-600 font-mono">
                  Received: {new Date(inv.createdAt).toLocaleDateString()}
                  {inv.expiresAt && ` · Expires: ${new Date(inv.expiresAt).toLocaleDateString()}`}
                </span>

                {isPending && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(inv.id, "REJECTED")}
                      disabled={isResponding}
                      className="px-5 py-2 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-400/30 transition-all disabled:opacity-40"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(inv.id, "ACCEPTED")}
                      disabled={isResponding}
                      className="px-5 py-2 rounded-xl bg-[#00c477] text-black text-sm font-extrabold hover:bg-[#009a5e] transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)] disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {isResponding ? "..." : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const TABS = { overview: OverviewTab, engagements: OverviewTab, earnings: OverviewTab, marketplace: MarketplaceTab, rankings: OverviewTab, invitations: InvitationsTab };

  const ActiveContent = TABS[activeTab] || OverviewTab;

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#00c477]/30 selection:text-[#00c477] overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00c477]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* ── Desktop Header ── */}
      <header className="h-24 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center px-12 sticky top-0 z-[60]">
        <div className="flex items-center gap-8">
           <div className="text-2xl font-black tracking-[0.2em] text-white flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
              <span className="w-12 h-12 bg-black border border-[#00c477]/30 text-[#00c477] rounded-xl flex items-center justify-center font-mono shadow-[0_0_15px_rgba(0,255,136,0.15)] group-hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] transition-all">λ</span>
              HACKRACT <span className="text-[10px] font-mono font-black text-[#00c477]/60 uppercase tracking-[0.4em] bg-[#00c477]/5 px-3 py-1.5 rounded-lg border border-[#00c477]/10 ml-2">CORE.v2</span>
           </div>
        </div>

        <div className="ml-auto flex items-center gap-10">
          <div className="flex items-center gap-8 pl-10">
             <NotificationCenter />
             
             <button onClick={() => navigate("/hacker-profile")} className="flex items-center gap-5 bg-white/[0.02] border border-white/5 rounded-2xl pl-5 pr-4 py-2 hover:border-[#00c477]/40 hover:bg-white/[0.04] transition-all group shadow-xl">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-[0.2em] leading-none mb-1.5">Authorized</p>
                   <p className="text-sm font-black text-white group-hover:text-[#00c477] transition-colors uppercase leading-none tracking-tight">Operator.v1</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-black border border-[#00c477]/30 text-[#00c477] flex items-center justify-center font-mono font-black text-xs shadow-inner shadow-[#00c477]/10 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all">λ</div>
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1720px] mx-auto flex gap-16 px-12 py-16 relative z-10">
        {/* ── Sidebar ── */}
        <aside className="w-80 shrink-0 space-y-2.5">
           <div className="text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.5em] mb-6 pl-4">Tactical Matrix</div>
           {NAV.map(item => (
             <button
               key={item.key}
               onClick={() => setActiveTab(item.key)}
               className={`w-full flex items-center gap-5 px-8 py-5 rounded-[24px] text-[11px] font-mono font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group
                 ${activeTab === item.key 
                   ? "bg-white/[0.04] text-[#00c477] shadow-2xl border border-[#00c477]/20 -translate-x-2" 
                   : "text-gray-500 hover:bg-white/[0.02] hover:text-white hover:translate-x-1"}`}
             >
               <span className={activeTab === item.key ? "text-[#00c477] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" : "text-gray-600 group-hover:text-gray-400"}><item.Icon /></span>
               {item.label}
               {item.key === 'invitations' && pendingCount > 0 && activeTab !== 'invitations' && (
                 <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                   {pendingCount > 9 ? '9+' : pendingCount}
                 </span>
               )}
               {activeTab === item.key && (
                 <>
                   <div className="ml-auto flex h-1.5 w-1.5 rounded-full bg-[#00c477] shadow-[0_0_10px_#00c477] animate-pulse" />
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-[#00c477] rounded-full shadow-[0_0_10px_#00c477]" />
                 </>
               )}
             </button>
           ))}

           <div className="mt-20 p-10 rounded-[48px] bg-gradient-to-br from-[#004e2b] to-[#012e1a] border border-[#00c477]/20 text-white relative overflow-hidden shadow-2xl group cursor-pointer hover:border-[#00c477]/40 transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00c477]/10 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-[#00c477]/20 transition-all" />
              <div className="relative z-10">
                 <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[#00c477] mb-3 opacity-80">Encryption Key</p>
                 <h4 className="text-xl font-extrabold leading-tight mb-8 uppercase tracking-tight">Unlock Elite <br />Neural Links</h4>
                 <button className="w-full py-4.5 bg-[#00c477] text-black text-[10px] font-mono font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] border-none">Initialize Upgrade</button>
              </div>
           </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -30 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
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
