import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield, FiPlus, FiX, FiUsers, FiClock, FiTarget,
  FiActivity, FiArrowRight, FiCheck, FiAlertTriangle,
  FiBriefcase, FiBarChart2, FiPieChart,
  FiMoreVertical, FiEdit2, FiTrash2, FiExternalLink, FiCalendar
} from 'react-icons/fi';

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Alpha Bank Core API Pentest",
    description: "Comprehensive penetration test on core banking REST API endpoints. Scope includes authentication, IDOR, and rate limiting.",
    status: "IN_PROGRESS",
    threatLevel: "CRITICAL",
    assignedHackers: [
      { name: "Null_Pointer_Ex", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=NullPointer&baseColor=00c477" },
      { name: "Cyber_Sentinel", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Sentinel&baseColor=00c477" },
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
      { name: "Ghost_Shell", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Ghost&baseColor=00c477" },
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
      { name: "Packet_Wizard", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Wizard&baseColor=00c477" },
      { name: "Root_Access", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Root&baseColor=00c477" },
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
      { name: "Buffer_Overrun", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Buffer&baseColor=00c477" },
    ],
    findings: 53,
    createdAt: "Jan 05, 2026",
    deadline: "Mar 31, 2026",
  },
];

// ─── CONSTANTS & CONFIG (Executive Black & Green Theme) ───────────────────────
const STATUS_CONFIG = {
  PLANNING:    { label: "Planning",    color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30" },
  IN_PROGRESS: { label: "In Progress", color: "text-[#00c477]", bg: "bg-[#00c477]/10", border: "border-[#00c477]/30"  },
  REPORTING:   { label: "Reporting",   color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30"},
  CLOSED:      { label: "Closed",      color: "text-gray-500",   bg: "bg-gray-500/10",   border: "border-gray-500/30"  },
};

const THREAT_CONFIG = {
  CRITICAL: { color: "text-rose-500",   bg: "bg-rose-500/10",   border: "border-rose-500/30"    },
  HIGH:     { color: "text-amber-500",  bg: "bg-amber-500/10",  border: "border-amber-500/30" },
  MEDIUM:   { color: "text-[#00c477]",  bg: "bg-[#00c477]/10",  border: "border-[#00c477]/30" },
  LOW:      { color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-500/30"   },
};

const FILTERS = ["ALL", "PLANNING", "IN_PROGRESS", "REPORTING", "CLOSED"];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-bold tracking-wide uppercase border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
      {cfg.label}
    </span>
  );
};

const ThreatBadge = ({ level }) => {
  const cfg = THREAT_CONFIG[level] || THREAT_CONFIG.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <FiAlertTriangle className="text-[10px]" />
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
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="bg-[#0a0a0a] border border-white/5 hover:border-[#00c477]/30 hover:bg-white/[0.02] rounded-2xl p-6 group transition-all relative overflow-visible shadow-lg hover:shadow-[#00c477]/5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={project.status} />
          <ThreatBadge level={project.threatLevel} />
        </div>
        <div className="relative z-10">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <FiMoreVertical fontSize={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                className="absolute right-0 top-10 bg-[#111] border border-white/10 rounded-xl p-1.5 min-w-[170px] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.8)] backdrop-blur-xl z-20"
              >
                {[
                  { icon: FiEdit2, label: "Edit Details", action: () => {} },
                  { icon: FiExternalLink, label: "Open Workspace", action: () => onManage(project.id) },
                  { icon: FiTrash2, label: "Archive Program", action: () => {}, destructive: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left ${
                      item.destructive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon fontSize={14} />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Name & description */}
      <h3 className="text-lg font-bold text-white group-hover:text-[#00c477] transition-colors mb-2 tracking-tight">
        {project.name}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-6">
        {project.description}
      </p>

      {/* Assigned hackers */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex -space-x-2">
          {project.assignedHackers.map((h, i) => (
            <img
              key={i}
              src={h.avatar}
              alt={h.name}
              title={h.name}
              className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-black"
            />
          ))}
          {project.assignedHackers.length === 0 && (
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-[#0a0a0a]">
              <FiPlus className="text-gray-400 text-[10px]" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-300 font-medium font-sans">
            Assigned Hackers
          </span>
          <span className="text-[10px] text-gray-500">
            {project.assignedHackers.length === 0 ? 'None assigned' : `${project.assignedHackers.length} Active`}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[12px] font-medium text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00c477]/10 flex items-center justify-center text-[#00c477]">
             <FiTarget size={12} />
          </div>
          <span className="text-gray-200 font-bold">{project.findings} <span className="font-normal text-gray-500">Findings</span></span>
        </div>
        <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md' : ''}`}>
          <FiCalendar size={13} />
          <span>{project.deadline}</span>
        </div>
      </div>

      {/* Manage button */}
      <button
        onClick={() => onManage(project.id)}
        className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#00c477] border border-white/10 hover:border-[#00c477] text-white hover:text-black text-[13px] font-bold transition-all flex items-center justify-center gap-2 group/btn"
      >
        Manage Program
        <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_60px_-10px_rgba(0,196,119,0.1)] relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00c477]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Modal header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
              <FiBriefcase className="text-[#00c477] text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">New Security Program</h2>
              <p className="text-[13px] text-gray-400 mt-1">Configure parameters for the new engagement.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <FiX size={18} />
          </button>
        </div>

        <div className="space-y-5 relative z-10">
          {/* Program name */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Program Name <span className="text-[#00c477]">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Web App Security Audit Q2"
              required
              className="w-full bg-black border border-white/10 focus:border-[#00c477] focus:ring-1 focus:ring-[#00c477] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder-gray-600 shadow-inner"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Objectives & Scope
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe the target systems, authorized scope, and objectives..."
              className="w-full bg-black border border-white/10 focus:border-[#00c477] focus:ring-1 focus:ring-[#00c477] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder-gray-600 resize-none shadow-inner"
            />
          </div>

          {/* Threat Level + Deadline row */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Relative Threat Level
              </label>
              <div className="relative">
                <select
                  value={form.threatLevel}
                  onChange={e => setForm(f => ({ ...f, threatLevel: e.target.value }))}
                  className="w-full bg-black border border-white/10 focus:border-[#00c477] focus:ring-1 focus:ring-[#00c477] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all appearance-none"
                >
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(l => (
                    <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <FiAlertTriangle className="text-gray-500 text-sm" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Target Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-black border border-white/10 focus:border-[#00c477] focus:ring-1 focus:ring-[#00c477] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[#00c477]/20 bg-[#00c477]/10">
            <FiUsers className="text-[#00c477] mt-0.5 shrink-0" size={16} />
            <p className="text-[12px] text-[#00c477]/80 leading-relaxed font-medium">
              After initialization, navigate to the <span className="text-[#00c477] font-bold">Discover</span> tab to delegate assignments to verified professionals.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 py-3 rounded-xl bg-[#00c477] hover:bg-[#009a5e] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,196,119,0.3)] focus:ring-4 focus:ring-[#00c477]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                : <FiCheck size={16} />
              }
              {loading ? 'Initializing…' : 'Create Program'}
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
    <div className="flex flex-col h-full bg-[#050505] -m-10 min-h-screen text-gray-200 font-sans selection:bg-[#00c477]/30">
      
      {/* ── Header Area ── */}
      <div className="relative overflow-hidden px-10 pt-12 pb-8 border-b border-white/5 bg-[#050505] z-10">
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00c477]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#00c477]/10 border border-[#00c477]/20">
              <span className="w-2 h-2 rounded-full bg-[#00c477] shadow-[0_0_8px_#00c477]" />
              <span className="text-[10px] font-black text-[#00c477] uppercase tracking-widest">
                Executive Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-3">
              Security Programs
            </h1>
            <p className="text-gray-400 text-[15px] font-medium max-w-xl">
              Oversee active engagements, manage threat discovery, and coordinate with verified security consultants across your organization.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#00c477] text-black font-extrabold text-sm rounded-xl hover:bg-[#009a5e] shadow-[0_0_20px_rgba(0,196,119,0.3)] transition-all whitespace-nowrap"
          >
            <FiPlus className="text-lg" />
            Initialize Program
          </motion.button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10 max-w-7xl mx-auto">
          {[
            { label: "Total Initiatives",  value: projects.length,  icon: FiBriefcase,    color: "text-[#00c477]", bg: "bg-[#00c477]/10" },
            { label: "Active Audits",      value: activeCount,       icon: FiActivity,     color: "text-cyan-400",  bg: "bg-cyan-500/10"  },
            { label: "Consultants",        value: totalHackers,      icon: FiUsers,        color: "text-purple-400",bg: "bg-purple-500/10" },
            { label: "Critical Findings",  value: totalFindings,     icon: FiAlertTriangle,color: "text-rose-400",   bg: "bg-rose-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex items-center gap-5 hover:border-white/10 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Filter & View Bar ── */}
      <div className="px-10 py-5 border-b border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-[#050505] p-1.5 rounded-xl border border-white/5">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
                  filter === f
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'IN_PROGRESS' ? 'Active' : f.charAt(0) + f.slice(1).toLowerCase()}
                {f === 'ALL' && <span className="ml-1.5 opacity-60">({projects.length})</span>}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[12px] text-gray-400 font-medium flex items-center gap-2">
               <FiBarChart2 className="text-gray-500" /> Sort: Priority
             </div>
          </div>
        </div>
      </div>

      {/* ── Project Grid ── */}
      <div className="flex-1 overflow-y-auto px-10 py-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 gap-6 bg-[#0a0a0a] border border-dashed border-white/10 rounded-3xl"
            >
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                <FiPieChart className="text-gray-600 text-4xl" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-white font-bold text-xl mb-2 tracking-tight">No Programs Found</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {filter === 'ALL'
                    ? "Your organization hasn't initiated any security programs yet."
                    : `No engagements are currently marked as "${filter}".`}
                </p>
                {filter === 'ALL' && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#00c477] text-black font-extrabold text-sm rounded-xl hover:bg-[#009a5e] transition-all shadow-[0_0_20px_rgba(0,196,119,0.2)]"
                  >
                    <FiPlus /> Initialize Program
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
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
              {filter === 'ALL' && (
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: filtered.length * 0.05, duration: 0.4 }}
                  onClick={() => setShowCreate(true)}
                  className="border-2 border-dashed border-white/10 hover:border-[#00c477]/50 bg-[#0a0a0a] hover:bg-[#00c477]/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-[#00c477] transition-all group min-h-[280px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00c477]/20 group-hover:text-[#00c477] transition-all">
                    <FiPlus className="text-2xl" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">Initialize Program</span>
                </motion.button>
              )}
            </div>
          )}
        </div>
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
