import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";
import {
  FiTerminal, FiArrowRight, FiZap,
  FiCheck, FiX, FiLock, FiActivity,
  FiTarget, FiClock, FiBell, FiCode, FiCpu,
} from "react-icons/fi";

// ─── MOCK ASSIGNED PROJECTS (org-side) ───────────────────────────────────────
const MOCK_ORG_ASSIGNMENTS = [
  {
    id: "org-1",
    name: "Alpha Bank Core API Pentest",
    orgName: "Alpha Bank Corp",
    orgAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=AlphaBank&baseColor=00c477",
    role: "LEAD",
    status: "IN_PROGRESS",
    inviteStatus: "ACCEPTED",
    assignedAt: "Apr 05, 2026",
    deadline: "Apr 28, 2026",
    findings: 14,
    description: "Full penetration test on core banking REST API endpoints.",
  },
  {
    id: "org-2",
    name: "CloudStack Infrastructure Audit",
    orgName: "NexCloud Systems",
    orgAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=NexCloud&baseColor=00c477",
    role: "CONTRIBUTOR",
    status: "PLANNING",
    inviteStatus: "PENDING",
    assignedAt: "Apr 10, 2026",
    deadline: "May 15, 2026",
    findings: 0,
    description: "AWS IAM and VPC misconfiguration review.",
  },
  {
    id: "org-3",
    name: "Mobile App Security Review",
    orgName: "Veloce Fintech",
    orgAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Veloce&baseColor=00c477",
    role: "CONTRIBUTOR",
    status: "REPORTING",
    inviteStatus: "ACCEPTED",
    assignedAt: "Mar 14, 2026",
    deadline: "Apr 20, 2026",
    findings: 27,
    description: "Android & iOS binary analysis and certificate pinning bypass.",
  },
];

// ─── CONSTANTS (Terminal Theme) ────────────────────────────────────────────────
const STATUS_CONFIG = {
  PLANNING:    { label: "PLANNING",    color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30" },
  IN_PROGRESS: { label: "IN PROGRESS", color: "text-[#00c477]", bg: "bg-[#00c477]/10", border: "border-[#00c477]/30"  },
  REPORTING:   { label: "REPORTING",   color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30"},
  CLOSED:      { label: "CLOSED",      color: "text-gray-500",   bg: "bg-gray-500/10",   border: "border-gray-500/30"  },
};

const TABS = ["ALL_ACCESS", "LOCAL_LABS", "MISSIONS", "INBOUND_REQS"];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black font-mono tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
      <span className={`w-1.5 h-1.5 ${cfg.color.replace('text-', 'bg-')} animate-pulse blur-[1px]`} />
      {cfg.label}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black font-mono tracking-widest border ${
    role === 'LEAD'
      ? 'text-[#00c477] bg-[#00c477]/10 border-[#00c477]/30'
      : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30'
  }`}>
    {role === 'LEAD' ? '> ROOT' : '> USER'}
  </span>
);

// Personal Project Card (Hacker styling)
const PersonalProjectCard = ({ project, onOpen, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="bg-black border border-white/10 hover:border-[#00c477] p-6 group transition-all relative overflow-hidden flex flex-col font-mono shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
  >
    {/* Tech accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00c477] opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00c477] opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="absolute top-4 right-4 text-white/5 group-hover:text-[#00c477]/10 transition-colors pointer-events-none">
      <FiCpu size={64} />
    </div>

    <div className="flex items-center gap-2 mb-4 flex-wrap z-10">
      <StatusBadge status={project.status} />
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black border text-[#00c477] bg-[#00c477]/5 border-[#00c477]/20">
        LOCAL_ENV
      </span>
    </div>

    <h3 className="text-lg font-black text-white group-hover:text-[#00c477] transition-colors mb-2 leading-snug tracking-tight z-10">
      {project.name}
    </h3>
    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-6 z-10 font-sans">
      {project.description || "No specific target scope compiled."}
    </p>

    <div className="mt-auto pt-4 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between z-10 mb-4">
      <span className="flex items-center gap-1.5"><FiCode className="text-[#00c477]" /> {project.collaborators?.length || 0} Operators</span>
      {project.createdAt && (
        <span className="flex items-center gap-1.5"><FiTerminal /> Init: {new Date(project.createdAt).toLocaleDateString()}</span>
      )}
    </div>

    <button
      onClick={() => onOpen(project.id)}
      className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-[#00c477] hover:border-[#00c477] text-[#00c477] hover:text-black text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 z-10"
    >
      EXECUTE_WORKSPACE <FiArrowRight />
    </button>
  </motion.div>
);

// Org Assignment Card (Hacker styling)
const OrgProjectCard = ({ project, onOpen, onAccept, onDecline, index }) => {
  const isPending = project.inviteStatus === 'PENDING';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`bg-black border p-6 group transition-all relative overflow-hidden flex flex-col font-mono shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] ${
        isPending
          ? 'border-amber-500/40 hover:border-amber-400'
          : 'border-white/10 hover:border-[#00c477]'
      }`}
    >
      {/* Target Crosshairs */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 group-hover:border-[#00c477] transition-colors" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20 group-hover:border-[#00c477] transition-colors" />

      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
      )}

      {/* Status + Role row */}
      <div className="flex items-center gap-2 mb-5 flex-wrap z-10">
        <StatusBadge status={project.status} />
        <RoleBadge role={project.role} />
        {isPending && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black border text-amber-400 bg-amber-400/10 border-amber-400/30 animate-pulse">
            <FiBell className="text-[8px]" /> REQ_PENDING
          </span>
        )}
      </div>

      <div className="flex items-start gap-4 mb-4 z-10">
        <div className="p-1 border border-white/10 bg-white/5 shrink-0">
          <img
            src={project.orgAvatar}
            alt={project.orgName}
            className="w-8 h-8 filter grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100 bg-black"
          />
        </div>
        <div>
          <p className="text-[9px] text-[#00c477] uppercase tracking-widest mb-1">Target: {project.orgName}</p>
          <h3 className={`text-base font-black ${isPending ? 'text-white' : 'text-white group-hover:text-[#00c477]'} transition-colors leading-snug tracking-tight`}>
            {project.name}
          </h3>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-6 z-10 font-sans">
        {project.description}
      </p>

      {/* Stats */}
      <div className="mt-auto pt-4 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between z-10 mb-5">
        <span className="flex items-center gap-1.5"><FiTarget className="text-[#00c477]" /> VULNS: {project.findings}</span>
        <span className="flex items-center gap-1.5"><FiClock className={isPending ? "text-amber-400" : ""} /> T-MINUS: {project.deadline}</span>
      </div>

      {/* CTA */}
      <div className="z-10 mt-auto">
        {isPending ? (
          <div className="flex gap-3">
            <button
              onClick={() => onDecline(project.id)}
              className="flex-1 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1"
            >
              [ ABORT ]
            </button>
            <button
              onClick={() => onAccept(project.id)}
              className="flex-1 py-2 bg-[#00c477] hover:bg-white text-black text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(0,196,119,0.3)]"
            >
              [ ACCEPT REQ ]
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpen(project.id)}
            className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-[#00c477] hover:border-[#00c477] text-white hover:text-black text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
          >
            ESTABLISH_UPLINK <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Personal Quick-Create Card
const PersonalWorkspaceCard = ({ onCreate }) => {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("SYS.ERR: Null reference in workspace identifier");
    setLoading(true);
    try {
      const { data } = await api.post("/projects/personal", { name: name.trim(), description: description.trim() });
      toast.success("Uplink Established.");
      setExpanded(false);
      setName(""); setDescription("");
      onCreate(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "SYS.ERR: Boot sequence failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div layout className="border border-white/10 bg-black overflow-hidden relative group font-mono shadow-[0_0_30px_rgba(0,196,119,0.05)]">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIj48L3JlY3Q+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIj48L2NpcmNsZT4KPC9zdmc+')] opacity-50 pointer-events-none" />

      <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-5 relative z-10">
        <div className="w-16 h-16 bg-[#00c477]/10 border border-[#00c477]/40 flex items-center justify-center text-[#00c477] shrink-0 font-black text-xl shadow-[inset_0_0_10px_rgba(0,196,119,0.2)]">
          &gt;_
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white text-lg tracking-tight uppercase flex items-center gap-2">
            Local_Environment <span className="text-[9px] bg-white/10 px-2 py-0.5 text-gray-400">OFFLINE_MODE</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-sans">
            Initialize isolated local sandbox for independent exploitation testing.
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={`w-full md:w-auto px-6 py-3 flex items-center justify-center transition-all border shrink-0 text-xs font-black tracking-widest uppercase gap-2 ${
            expanded
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
              : "bg-[#00c477] border-[#00c477] text-black hover:bg-white shadow-[0_0_15px_rgba(0,196,119,0.3)]"
          }`}
        >
          {expanded ? <><FiX /> CANCEL</> : <><FiTerminal /> INIT_ENV</>}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-black/50 relative z-10"
          >
            <div className="p-6 space-y-5">
              <div>
                 <label className="text-[10px] text-[#00c477] tracking-widest uppercase block mb-2">TARGET_ALIAS</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 w-8 flex items-center justify-center text-gray-500 font-bold border-r border-white/10">$</div>
                   <input
                     value={name}
                     onChange={e => setName(e.target.value)}
                     onKeyDown={e => e.key === "Enter" && handleCreate()}
                     className="w-full bg-black/50 border border-white/10 focus:border-[#00c477] pl-10 pr-4 py-3 text-sm text-[#00c477] outline-none transition-colors placeholder-gray-700 shadow-inner"
                     placeholder="e.g. VulnHub_Box_01"
                   />
                 </div>
              </div>

              <div>
                 <label className="text-[10px] text-[#00c477] tracking-widest uppercase block mb-2">OBJECTIVE_PARAMETERS</label>
                 <textarea
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   rows={2}
                   className="w-full bg-black/50 border border-white/10 focus:border-[#00c477] p-3 text-sm text-[#00c477] outline-none transition-colors placeholder-gray-700 resize-none shadow-inner"
                   placeholder="Define attack vectors..."
                 />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest w-full md:w-auto">
                  <FiLock className="text-[#00c477]" />
                  <span>NDA_EXEMPT</span>
                  <span className="w-1 h-1 bg-gray-700 rounded-full" />
                  <span>ISOLATED_FS</span>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full md:w-auto ml-auto flex items-center justify-center gap-3 px-8 py-3 bg-[#00c477] hover:bg-white text-black text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,196,119,0.3)]"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <FiZap />}
                  {loading ? "COMPILING..." : "COMPILE & RUN"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [personalProjects, setPersonalProjects] = useState([]);
  const [orgAssignments, setOrgAssignments] = useState(MOCK_ORG_ASSIGNMENTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL_ACCESS");

  // Load real personal + org projects from API
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/projects");
        const all = data?.data || [];
        setPersonalProjects(all.filter(p => p.isPersonal || p.leadPentesterId === user?.id));
      } catch {
        // silently fall back to mock data
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const pendingCount = orgAssignments.filter(p => p.inviteStatus === 'PENDING').length;
  const acceptedOrg  = orgAssignments.filter(p => p.inviteStatus === 'ACCEPTED');

  // Tab filtering
  const displayPersonal = activeTab === 'ALL_ACCESS' || activeTab === 'LOCAL_LABS';
  const displayOrg      = activeTab === 'ALL_ACCESS' || activeTab === 'MISSIONS';
  const displayPending  = activeTab === 'ALL_ACCESS' || activeTab === 'INBOUND_REQS';

  const handleAccept  = id => setOrgAssignments(prev => prev.map(p => p.id === id ? { ...p, inviteStatus: 'ACCEPTED' } : p));
  const handleDecline = id => setOrgAssignments(prev => prev.filter(p => p.id !== id));
  const handlePersonalCreated = p => {
    setPersonalProjects(prev => [p, ...prev]);
    navigate(`/projects/${p.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] -m-10 min-h-screen text-gray-300 font-mono relative overflow-hidden">
      {/* Immersive CRT/Terminal Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-50 mix-blend-multiply border-[2px] border-[#00c477]/10" />
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIj48L3JlY3Q+CjxnIG9wYWNpdHk9IjAuMDUiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjQiIGZpbGw9IiMwMGM0NzciPjwvcmVjdD48L2c+Cjwvc3ZnPg==')] opacity-[0.15] z-0" />

      {/* ── Header ── */}
      <div className="px-10 py-10 border-b border-[#00c477]/20 bg-black/80 backdrop-blur-sm relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 bg-[#00c477] animate-ping" />
             <span className="text-[10px] font-black text-[#00c477] tracking-[0.4em] uppercase">Sys.Console :: Connected</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-sans flex items-end gap-3">
             Command Center <span className="text-lg text-gray-600 font-mono tracking-widest pb-1">_V2.0</span>
          </h1>
          <p className="text-[#00c477]/70 text-sm mt-3 uppercase tracking-widest max-w-2xl border-l-2 border-[#00c477] pl-3">
            Access secure sandboxes and intercept inbound organizational engagements.
          </p>
        </div>

        {/* Console Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "LOCAL_LABS",   value: personalProjects.length, icon: FiCode,      color: "text-[#00c477]"  },
            { label: "ACTIVE_OPS",   value: acceptedOrg.length,      icon: FiTerminal,  color: "text-cyan-400"   },
            { label: "PENDING_REQS", value: pendingCount,            icon: FiActivity,  color: "text-amber-400"  },
            { label: "UPTIME_HRS",   value: "1337",                  icon: FiClock,     color: "text-purple-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black border border-white/10 p-4 border-l-2 hover:bg-white/5 transition-colors group"
              style={{ borderLeftColor: stat.label === 'LOCAL_LABS' ? '#00c477' : stat.label === 'ACTIVE_OPS' ? '#22d3ee' : stat.label === 'PENDING_REQS' ? '#fbbf24' : '#c084fc' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`text-sm ${stat.color} group-hover:animate-pulse`} />
              </div>
              <p className="text-2xl font-black text-white font-sans tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="px-10 py-5 border-b border-white/10 bg-black relative z-10 flex items-center gap-3 flex-wrap">
        <span className="text-[#00c477] mr-2">&gt; Filter:</span>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all relative border ${
              activeTab === tab
                ? 'bg-[#00c477] text-black border-[#00c477] shadow-[0_0_15px_rgba(0,196,119,0.3)]'
                : 'bg-black text-gray-500 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            {tab}
            {tab === 'INBOUND_REQS' && pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-black text-[8px] font-black rounded flex items-center justify-center animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-10 relative z-10 space-y-16">

        {/* Pending Banner */}
        <AnimatePresence>
          {pendingCount > 0 && (activeTab === 'ALL_ACCESS' || activeTab === 'INBOUND_REQS') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col md:flex-row md:items-center gap-5 p-6 border border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)] mb-10 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
              <div className="w-12 h-12 bg-black border border-amber-500/30 flex items-center justify-center shrink-0">
                <FiBell className="text-amber-400 text-2xl animate-ping" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                   [ SYS_ALERT ] <span className="text-amber-400">INBOUND_REQUESTS_DETECTED</span>
                </p>
                <p className="text-[11px] text-amber-200/60 mt-1 uppercase tracking-widest font-mono">You have {pendingCount} outstanding mission requests awaiting authorization.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending Invites */}
        {displayPending && orgAssignments.filter(p => p.inviteStatus === 'PENDING').length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-amber-400 px-2 py-0.5 border border-amber-400 text-[10px] font-black tracking-widest">REQ_QUEUE</span>
              <div className="h-px flex-1 bg-amber-500/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orgAssignments.filter(p => p.inviteStatus === 'PENDING').map((p, i) => (
                <OrgProjectCard key={p.id} project={p} index={i} onOpen={id => navigate(`/projects/${id}`)} onAccept={handleAccept} onDecline={handleDecline} />
              ))}
            </div>
          </section>
        )}

        {/* Local Labs */}
        {displayPersonal && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-[#00c477] px-2 py-0.5 border border-[#00c477] text-[10px] font-black tracking-widest">LOCAL_RUNTIME</span>
              <div className="h-[2px] flex-1 bg-[#00c477]/20 border-t border-b border-black" />
            </div>

            <PersonalWorkspaceCard onCreate={handlePersonalCreated} />

            {loading ? (
              <div className="py-16 flex flex-col items-center gap-6 text-[#00c477]/50 font-mono uppercase tracking-widest text-xs">
                <div className="w-12 h-12 border-2 border-white/10 border-r-[#00c477] border-b-[#00c477] rounded-full animate-spin" />
                <span>Decrypting datastore...</span>
              </div>
            ) : personalProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                {personalProjects.map((p, i) => (
                  <PersonalProjectCard key={p.id} project={p} index={i} onOpen={id => navigate(`/projects/${id}`)} />
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center gap-4 border-2 border-dashed border-white/5 bg-white/[0.01] text-gray-500 uppercase tracking-widest text-xs">
                <FiCode size={32} className="opacity-30 mb-2" />
                <p>No local binaries compiled.</p>
              </div>
            )}
          </section>
        )}

        {/* Mission Control (Org Assignments) */}
        {displayOrg && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-cyan-400 px-2 py-0.5 border border-cyan-400 text-[10px] font-black tracking-widest">SECURE_MISSIONS</span>
              <div className="h-px flex-1 bg-cyan-500/20" />
            </div>

            {acceptedOrg.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-4 border-2 border-dashed border-white/5 bg-white/[0.01] text-gray-500 uppercase tracking-widest text-xs">
                <FiTerminal size={32} className="opacity-30 mb-2" />
                <p>No active missions configured.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {acceptedOrg.map((p, i) => (
                  <OrgProjectCard key={p.id} project={p} index={i} onOpen={id => navigate(`/projects/${id}`)} onAccept={handleAccept} onDecline={handleDecline} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Projects;