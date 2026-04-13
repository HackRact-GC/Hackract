import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";
import {
  FiPlus, FiTerminal, FiShield, FiArrowRight, FiZap,
  FiCheck, FiX, FiLock, FiUsers, FiFolder, FiActivity,
  FiTarget, FiClock, FiCalendar, FiBell, FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

// ─── MOCK ASSIGNED PROJECTS (org-side) ───────────────────────────────────────
const MOCK_ORG_ASSIGNMENTS = [
  {
    id: "org-1",
    name: "Alpha Bank — Core API Pentest",
    orgName: "Alpha Bank Corp",
    orgAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=AlphaBank",
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
    orgAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=NexCloud",
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
    orgAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Veloce",
    role: "CONTRIBUTOR",
    status: "REPORTING",
    inviteStatus: "ACCEPTED",
    assignedAt: "Mar 14, 2026",
    deadline: "Apr 20, 2026",
    findings: 27,
    description: "Android & iOS binary analysis and certificate pinning bypass.",
  },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PLANNING:    { label: "Planning",    color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20"  },
  REPORTING:   { label: "Reporting",   color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20"},
  CLOSED:      { label: "Closed",      color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20"  },
};

const TABS = ["ALL", "PERSONAL", "ORG ASSIGNED", "PENDING"];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black font-mono tracking-widest uppercase border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
      {cfg.label}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black font-mono tracking-widest uppercase border ${
    role === 'LEAD'
      ? 'text-[#00c477] bg-[#00c477]/10 border-[#00c477]/20'
      : 'text-blue-400 bg-blue-400/10 border-blue-400/20'
  }`}>
    {role === 'LEAD' ? '★' : '◆'} {role}
  </span>
);

// Personal Project Card
const PersonalProjectCard = ({ project, onOpen, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07 }}
    className="bg-[#0a0a0a] border border-white/5 hover:border-[#00c477]/20 rounded-2xl p-6 group transition-all relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
      <FiTerminal size={56} />
    </div>

    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <StatusBadge status={project.status} />
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black font-mono border text-[#00c477] bg-[#00c477]/10 border-[#00c477]/20">
        <FiTerminal className="text-[8px]" /> Personal
      </span>
    </div>

    <h3 className="text-base font-black text-white group-hover:text-[#00c477] transition-colors mb-1.5 leading-snug">
      {project.name}
    </h3>
    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-5">
      {project.description || "No scope defined yet."}
    </p>

    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-mono text-gray-500">
      <div className="flex items-center gap-1.5">
        <FiUsers className="text-[#00c477]" />
        <span>{project.collaborators?.length || 0} members</span>
      </div>
      {project.createdAt && (
        <div className="flex items-center gap-1.5">
          <FiCalendar />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      )}
    </div>

    <button
      onClick={() => onOpen(project.id)}
      className="mt-4 w-full py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00c477]/10 hover:border-[#00c477]/30 text-xs font-black text-gray-400 hover:text-[#00c477] transition-all flex items-center justify-center gap-2 group/btn"
    >
      Open Workspace
      <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
    </button>
  </motion.div>
);

// Org Assignment Card
const OrgProjectCard = ({ project, onOpen, onAccept, onDecline, index }) => {
  const isPending = project.inviteStatus === 'PENDING';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`bg-[#0a0a0a] border rounded-2xl p-6 group transition-all relative overflow-hidden ${
        isPending
          ? 'border-amber-500/20 hover:border-amber-500/40'
          : 'border-white/5 hover:border-[#00c477]/20'
      }`}
    >
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-400/60 to-amber-500/0" />
      )}

      {/* Status + Role row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <StatusBadge status={project.status} />
        <RoleBadge role={project.role} />
        {isPending && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black font-mono border text-amber-400 bg-amber-400/10 border-amber-400/20">
            <FiBell className="text-[8px]" /> Pending Invite
          </span>
        )}
      </div>

      {/* Org identity */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={project.orgAvatar}
          alt={project.orgName}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest truncate">{project.orgName}</p>
        </div>
      </div>

      <h3 className={`text-base font-black ${isPending ? 'text-white' : 'text-white group-hover:text-[#00c477]'} transition-colors mb-1.5 leading-snug`}>
        {project.name}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-5">
        {project.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-mono text-gray-500 mb-4">
        <div className="flex items-center gap-1.5">
          <FiTarget className="text-[#00c477]" />
          <span className="text-white font-black">{project.findings}</span>
          <span>findings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiCalendar />
          <span>Due {project.deadline}</span>
        </div>
      </div>

      {/* CTA */}
      {isPending ? (
        <div className="flex gap-2">
          <button
            onClick={() => onDecline(project.id)}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-black text-gray-400 hover:text-red-400 hover:border-red-400/20 transition-all flex items-center justify-center gap-1"
          >
            <FiX /> Decline
          </button>
          <button
            onClick={() => onAccept(project.id)}
            className="flex-1 py-2.5 rounded-xl bg-[#00c477] hover:bg-[#009a5e] text-black text-xs font-black transition-all flex items-center justify-center gap-1"
          >
            <FiCheck /> Accept
          </button>
        </div>
      ) : (
        <button
          onClick={() => onOpen(project.id)}
          className="w-full py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00c477]/10 hover:border-[#00c477]/30 text-xs font-black text-gray-400 hover:text-[#00c477] transition-all flex items-center justify-center gap-2 group/btn"
        >
          Open Workspace
          <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      )}
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
    if (!name.trim()) return toast.error("Give your workspace a name");
    setLoading(true);
    try {
      const { data } = await api.post("/projects/personal", { name: name.trim(), description: description.trim() });
      toast.success("Personal workspace ready!");
      setExpanded(false);
      setName(""); setDescription("");
      onCreate(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div layout className="border border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
      <div className="p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center text-[#00c477] shrink-0">
          <FiTerminal size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white text-base">Personal Workspace</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Practice pentesting solo — no organization or NDA required.
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0 ${
            expanded
              ? "bg-white/5 border-white/10 text-gray-300"
              : "bg-[#00c477] border-[#00c477] text-black hover:bg-[#009a5e]"
          }`}
        >
          {expanded ? <FiX size={16} /> : <FiPlus size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-6 space-y-4">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="w-full bg-[#050505] border border-white/10 focus:border-[#00c477]/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-gray-600 font-mono"
                placeholder="Workspace name — e.g. OWASP Lab, Home CTF…"
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#050505] border border-white/10 focus:border-[#00c477]/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-gray-600 resize-none"
                placeholder="Target scope, objective…"
              />
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <FiLock size={10} className="text-[#00c477]" />
                  NDA-free · Auto-workflow created
                </div>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-[#00c477] hover:bg-[#009a5e] text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <FiZap size={13} />}
                  {loading ? "Creating…" : "Launch"}
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
  const [activeTab, setActiveTab] = useState("ALL");

  // Load real personal + org projects from API
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/projects");
        const all = data?.data || [];
        setPersonalProjects(all.filter(p => p.isPersonal || p.leadPentesterId === user?.id));
        // Real org assignments would be fetched here too
      } catch {
        // silently fall back to mock data
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingCount = orgAssignments.filter(p => p.inviteStatus === 'PENDING').length;
  const acceptedOrg  = orgAssignments.filter(p => p.inviteStatus === 'ACCEPTED');

  // Tab filtering
  const displayPersonal = activeTab === 'ALL' || activeTab === 'PERSONAL';
  const displayOrg      = activeTab === 'ALL' || activeTab === 'ORG ASSIGNED';
  const displayPending  = activeTab === 'ALL' || activeTab === 'PENDING';

  const handleAccept  = id => setOrgAssignments(prev => prev.map(p => p.id === id ? { ...p, inviteStatus: 'ACCEPTED' } : p));
  const handleDecline = id => setOrgAssignments(prev => prev.filter(p => p.id !== id));
  const handlePersonalCreated = p => {
    setPersonalProjects(prev => [p, ...prev]);
    navigate(`/projects/${p.id}`);
  };

  return (
    <div className="flex flex-col h-full -m-10">

      {/* ── Header ── */}
      <div className="px-10 py-8 border-b border-white/5 bg-[#050505]">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00c477] animate-pulse shadow-[0_0_6px_#00c477]" />
            <span className="text-[9px] font-black text-[#00c477] font-mono tracking-[0.3em] uppercase">Mission Control</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Projects</h1>
          <p className="text-gray-500 text-sm mt-2">Personal labs and organization-assigned security programs.</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Personal Labs",     value: personalProjects.length, icon: FiTerminal,      color: "text-[#00c477]"  },
            { label: "Org Assignments",   value: acceptedOrg.length,      icon: FiShield,        color: "text-cyan-400"   },
            { label: "Pending Invites",   value: pendingCount,            icon: FiBell,          color: "text-amber-400"  },
            { label: "Active Programs",   value: acceptedOrg.filter(p => p.status === 'IN_PROGRESS').length, icon: FiActivity, color: "text-violet-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`text-sm ${stat.color}`} />
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="px-10 py-4 border-b border-white/5 bg-[#050505] flex items-center gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black font-mono tracking-widest uppercase transition-all relative ${
              activeTab === tab
                ? 'bg-[#00c477]/15 border border-[#00c477]/30 text-[#00c477]'
                : 'border border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'
            }`}
          >
            {tab}
            {tab === 'PENDING' && pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-black text-[8px] font-black rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-10 bg-[#050505] space-y-12">

        {/* Pending invites banner */}
        <AnimatePresence>
          {pendingCount > 0 && (activeTab === 'ALL' || activeTab === 'PENDING') && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-4 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 -mt-2"
            >
              <FiBell className="text-amber-400 text-xl shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  You have <span className="text-amber-400">{pendingCount}</span> pending project invitation{pendingCount > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Review and accept or decline below.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending invites section */}
        {displayPending && orgAssignments.filter(p => p.inviteStatus === 'PENDING').length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <FiBell className="text-amber-400" />
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Pending Invitations</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {orgAssignments.filter(p => p.inviteStatus === 'PENDING').map((p, i) => (
                <OrgProjectCard key={p.id} project={p} index={i} onOpen={id => navigate(`/projects/${id}`)} onAccept={handleAccept} onDecline={handleDecline} />
              ))}
            </div>
          </section>
        )}

        {/* Personal Labs */}
        {displayPersonal && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <FiTerminal className="text-[#00c477]" />
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Personal Labs</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <PersonalWorkspaceCard onCreate={handlePersonalCreated} />

            {loading ? (
              <div className="py-12 flex flex-col items-center gap-4 text-gray-600">
                <div className="w-7 h-7 border-2 border-white/10 border-t-[#00c477] rounded-full animate-spin" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-mono animate-pulse">Loading labs</span>
              </div>
            ) : personalProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {personalProjects.map((p, i) => (
                  <PersonalProjectCard key={p.id} project={p} index={i} onOpen={id => navigate(`/projects/${id}`)} />
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center gap-3 border border-dashed border-white/10 rounded-2xl text-gray-600">
                <FiTerminal size={28} className="opacity-40" />
                <p className="text-sm">No personal labs yet — create one above.</p>
              </div>
            )}
          </section>
        )}

        {/* Org Assignments */}
        {displayOrg && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <FiShield className="text-cyan-400" />
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Organization Assignments</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {acceptedOrg.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 border border-dashed border-white/10 rounded-2xl text-gray-600">
                <FiShield size={28} className="opacity-40" />
                <p className="text-sm">No org assignments yet. Organizations assign you via Discover.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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