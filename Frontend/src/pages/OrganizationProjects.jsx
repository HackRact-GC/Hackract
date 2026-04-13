import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield, FiPlus, FiX, FiUsers, FiClock, FiTarget,
  FiActivity, FiArrowRight, FiCheck, FiAlertTriangle,
  FiGlobe, FiLock, FiTrendingUp, FiCalendar, FiZap,
  FiMoreVertical, FiEdit2, FiTrash2, FiExternalLink,
} from 'react-icons/fi';

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Alpha Bank — Core API Pentest",
    description: "Full penetration test on core banking REST API endpoints. Scope: authentication, IDOR, rate limiting.",
    status: "IN_PROGRESS",
    threatLevel: "CRITICAL",
    assignedHackers: [
      { name: "Null_Pointer_Ex", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NullPointer&baseColor=00ff88" },
      { name: "Cyber_Sentinel", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sentinel&baseColor=00ff88" },
    ],
    findings: 14,
    createdAt: "Apr 01, 2026",
    deadline: "Apr 28, 2026",
  },
  {
    id: 2,
    name: "CloudStack Infrastructure Audit",
    description: "AWS S3, IAM, and VPC misconfiguration review. Focus on privilege escalation paths.",
    status: "PLANNING",
    threatLevel: "HIGH",
    assignedHackers: [
      { name: "Ghost_Shell", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ghost&baseColor=00ff88" },
    ],
    findings: 0,
    createdAt: "Apr 09, 2026",
    deadline: "May 15, 2026",
  },
  {
    id: 3,
    name: "Mobile App Security Review",
    description: "Android & iOS binary analysis, certificate pinning bypass, local storage inspection.",
    status: "REPORTING",
    threatLevel: "MEDIUM",
    assignedHackers: [
      { name: "Packet_Wizard", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Wizard&baseColor=00ff88" },
      { name: "Root_Access", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Root&baseColor=00ff88" },
    ],
    findings: 27,
    createdAt: "Mar 12, 2026",
    deadline: "Apr 20, 2026",
  },
  {
    id: 4,
    name: "Zero-Day Research Program",
    description: "Open-scope research engagement. All subdomains and APIs in scope.",
    status: "CLOSED",
    threatLevel: "CRITICAL",
    assignedHackers: [
      { name: "Buffer_Overrun", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Buffer&baseColor=00ff88" },
    ],
    findings: 53,
    createdAt: "Jan 05, 2026",
    deadline: "Mar 31, 2026",
  },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PLANNING:    { label: "Planning",    color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20"  },
  REPORTING:   { label: "Reporting",   color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20"},
  CLOSED:      { label: "Closed",      color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20"  },
};

const THREAT_CONFIG = {
  CRITICAL: { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
  HIGH:     { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  MEDIUM:   { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  LOW:      { color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20"   },
};

const FILTERS = ["ALL", "PLANNING", "IN_PROGRESS", "REPORTING", "CLOSED"];

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

const ThreatBadge = ({ level }) => {
  const cfg = THREAT_CONFIG[level] || THREAT_CONFIG.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black font-mono tracking-widest uppercase border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <FiAlertTriangle className="text-[8px]" />
      {level}
    </span>
  );
};

const ProjectCard = ({ project, onManage, index }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const deadline = new Date(project.deadline);
  const isOverdue = deadline < new Date() && project.status !== 'CLOSED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-[#0a0a0a] border border-white/5 hover:border-[#00c477]/20 rounded-2xl p-6 group transition-all relative overflow-hidden"
    >
      {/* Ambient glow on hover */}
      <div className="absolute inset-0 bg-[#00c477]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

      {/* Header row */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={project.status} />
          <ThreatBadge level={project.threatLevel} />
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <FiMoreVertical />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="absolute right-0 top-8 bg-[#111] border border-white/10 rounded-xl p-1.5 min-w-[160px] z-20 shadow-2xl"
              >
                {[
                  { icon: FiEdit2, label: "Edit Program", action: () => {} },
                  { icon: FiExternalLink, label: "Open Workspace", action: () => onManage(project.id) },
                  { icon: FiTrash2, label: "Archive", action: () => {}, destructive: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      item.destructive ? 'text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="text-sm" />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Name & description */}
      <h3 className="text-base font-black text-white group-hover:text-[#00c477] transition-colors mb-2 leading-snug">
        {project.name}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-5">
        {project.description}
      </p>

      {/* Assigned hackers */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex -space-x-2">
          {project.assignedHackers.map((h, i) => (
            <img
              key={i}
              src={h.avatar}
              alt={h.name}
              title={h.name}
              className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-black/50"
            />
          ))}
          {project.assignedHackers.length === 0 && (
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
              <FiPlus className="text-gray-600 text-[10px]" />
            </div>
          )}
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          {project.assignedHackers.length === 0
            ? 'No hackers assigned'
            : `${project.assignedHackers.length} hacker${project.assignedHackers.length > 1 ? 's' : ''} assigned`}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-1.5">
          <FiTarget className="text-[#00c477]" />
          <span className="text-white font-black">{project.findings}</span>
          <span>findings</span>
        </div>
        <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : ''}`}>
          <FiCalendar />
          <span>{project.deadline}</span>
        </div>
      </div>

      {/* Manage button */}
      <button
        onClick={() => onManage(project.id)}
        className="mt-4 w-full py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00c477]/10 hover:border-[#00c477]/30 text-xs font-black text-gray-400 hover:text-[#00c477] transition-all flex items-center justify-center gap-2 group/btn"
      >
        Manage Program
        <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

// ─── CREATE PROJECT MODAL ─────────────────────────────────────────────────────
const CreateProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    name: '', description: '', scope: '', threatLevel: 'MEDIUM', deadline: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    onCreate({ ...form, id: Date.now(), status: 'PLANNING', assignedHackers: [], findings: 0, createdAt: 'Today' });
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
              <FiShield className="text-[#00c477] text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">New Security Program</h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Create a managed engagement</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <FiX />
          </button>
        </div>

        <div className="space-y-4">
          {/* Program name */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
              Program Name *
            </label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Web App Security Audit Q2"
              required
              className="w-full bg-[#050505] border border-white/10 focus:border-[#00c477]/40 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-gray-600 font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
              Objectives & Scope
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe the target systems, authorized scope, and objectives..."
              className="w-full bg-[#050505] border border-white/10 focus:border-[#00c477]/40 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-gray-600 resize-none font-mono"
            />
          </div>

          {/* Threat Level + Deadline row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                Threat Level
              </label>
              <select
                value={form.threatLevel}
                onChange={e => setForm(f => ({ ...f, threatLevel: e.target.value }))}
                className="w-full bg-[#050505] border border-white/10 focus:border-[#00c477]/40 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
              >
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-[#050505] border border-white/10 focus:border-[#00c477]/40 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 p-3 rounded-xl border border-[#00c477]/10 bg-[#00c477]/5">
            <FiZap className="text-[#00c477] mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              After creating this program, go to <span className="text-[#00c477] font-bold">Discover</span> to assign hackers. They'll receive an automatic notification.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 py-3 rounded-xl bg-[#00c477] hover:bg-[#009a5e] text-black font-black text-sm shadow-[0_0_20px_rgba(0,196,119,0.2)] hover:shadow-[0_0_30px_rgba(0,196,119,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <FiCheck />
              }
              {loading ? 'Creating…' : 'Create Program'}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const OrganizationProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = filter === 'ALL' ? projects : projects.filter(p => p.status === filter);
  const totalHackers = projects.reduce((acc, p) => acc + p.assignedHackers.length, 0);
  const totalFindings = projects.reduce((acc, p) => acc + p.findings, 0);
  const activeCount = projects.filter(p => p.status === 'IN_PROGRESS').length;

  return (
    <div className="flex flex-col h-full -m-10">

      {/* ── Header ── */}
      <div className="px-10 py-8 border-b border-white/5 bg-[#050505]">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00c477] animate-pulse shadow-[0_0_6px_#00c477]" />
              <span className="text-[9px] font-black text-[#00c477] font-mono tracking-[0.3em] uppercase">
                Security Operations
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Security Programs</h1>
            <p className="text-gray-500 text-sm mt-2">Create and manage your organization's security engagements.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-3 px-6 py-3.5 bg-[#00c477] text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(0,196,119,0.2)] hover:shadow-[0_0_35px_rgba(0,196,119,0.35)] hover:bg-[#009a5e] transition-all"
          >
            <FiPlus className="text-lg" />
            New Program
          </motion.button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Total Programs",     value: projects.length,  icon: FiShield,       color: "text-[#00c477]" },
            { label: "Active Engagements", value: activeCount,       icon: FiActivity,     color: "text-cyan-400"  },
            { label: "Hackers Assigned",   value: totalHackers,      icon: FiUsers,        color: "text-violet-400"},
            { label: "Findings Logged",    value: totalFindings,     icon: FiTarget,       color: "text-orange-400"},
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

      {/* ── Filter Bar ── */}
      <div className="px-10 py-4 border-b border-white/5 bg-[#050505] flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black font-mono tracking-widest uppercase transition-all ${
              filter === f
                ? 'bg-[#00c477]/15 border border-[#00c477]/30 text-[#00c477]'
                : 'border border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'
            }`}
          >
            {f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
            {f === 'ALL' && <span className="ml-1.5 opacity-60">({projects.length})</span>}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 text-[10px] text-gray-600 font-mono">
          <FiGlobe className="text-[#00c477]" />
          <span>{filtered.length} program{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Project Grid ── */}
      <div className="flex-1 overflow-y-auto p-10 bg-[#050505]">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <div className="w-20 h-20 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
              <FiShield className="text-gray-600 text-3xl" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg mb-2">No programs found</p>
              <p className="text-gray-500 text-sm">
                {filter === 'ALL'
                  ? 'Create your first security program to get started.'
                  : `No programs with status "${filter.replace('_', ' ')}".`}
              </p>
            </div>
            {filter === 'ALL' && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#00c477] text-black font-black text-sm rounded-xl hover:bg-[#009a5e] transition-all"
              >
                <FiPlus /> Create Program
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onManage={id => navigate(`/projects/${id}`)}
                />
              ))}

              {/* Quick Add Card */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filtered.length * 0.07 }}
                onClick={() => setShowCreate(true)}
                className="border border-dashed border-white/10 hover:border-[#00c477]/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-gray-600 hover:text-[#00c477] transition-all group min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-xl border border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiPlus className="text-xl" />
                </div>
                <span className="text-xs font-black font-mono uppercase tracking-widest">New Program</span>
              </motion.button>
            </div>

            {/* Discover CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 p-6 rounded-2xl border border-[#00c477]/10 bg-[#00c477]/5 flex items-center gap-5 flex-wrap"
            >
              <div className="w-12 h-12 rounded-xl bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center shrink-0">
                <FiUsers className="text-[#00c477] text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Looking for security researchers?</p>
                <p className="text-gray-400 text-xs mt-0.5">Browse verified hackers on the Discover page and assign them directly to your programs.</p>
              </div>
              <button
                onClick={() => navigate('/discover')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00c477] text-black font-black text-xs rounded-xl hover:bg-[#009a5e] transition-all shrink-0"
              >
                Discover Hackers
                <FiArrowRight />
              </button>
            </motion.div>
          </>
        )}
      </div>

      {/* ── Create Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreate={newProject => setProjects(prev => [newProject, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationProjects;
