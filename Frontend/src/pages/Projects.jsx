import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";
<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Folder: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path strokeLinecap="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};
=======
import {
  FiPlus, FiTerminal, FiShield, FiArrowRight, FiClock, FiZap,
  FiCheck, FiX, FiLock, FiUsers, FiFolder,
} from "react-icons/fi";
>>>>>>> 29cf968ad6e921e78b6c17cae03c9ce911d6c293

// ──────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    PLANNING:    "text-amber-400 bg-amber-500/10 border-amber-500/20",
    IN_PROGRESS: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    REPORTING:   "text-violet-400 bg-violet-500/10 border-violet-500/20",
    CLOSED:      "text-slate-400 bg-slate-500/10 border-slate-500/20",
  };
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${map[status] || map.PLANNING}`}>
      {status?.replace("_", " ")}
    </span>
  );
};

const ProjectCard = ({ project, onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="w-full text-left p-6 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-cyan-500/30 hover:bg-slate-900/70 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
      {project.isPersonal ? <FiTerminal size={60} /> : <FiShield size={60} />}
    </div>
    <div className="flex items-center justify-between mb-4">
      <StatusBadge status={project.status} />
      {project.isPersonal && (
        <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
          <FiTerminal size={10} /> Personal
        </span>
      )}
    </div>
    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors truncate">{project.name}</h3>
    <p className="text-sm text-slate-500 mt-1 truncate">{project.description || "No scope defined yet."}</p>
    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800/50 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
      <span className="flex items-center gap-2"><FiUsers size={10} /> {project.collaborators?.length || 0} members</span>
      {project.organization && <span className="flex items-center gap-2"><FiFolder size={10} /> {project.organization.name}</span>}
    </div>
    <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-all text-cyan-400">
      <FiArrowRight />
    </div>
  </motion.button>
);

// ──────────────────────────────────────────────────────────────────────
// Personal Workspace Quick-Create Card
// ──────────────────────────────────────────────────────────────────────
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
    <motion.div
      layout
      className="border border-violet-500/20 bg-violet-500/5 rounded-3xl overflow-hidden backdrop-blur-md"
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
          <FiTerminal size={26} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg">Personal Workspace</h3>
          <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">
            Practice pentesting solo — no organization or NDA required.
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
            expanded
              ? "bg-slate-800 border-slate-700 text-slate-300"
              : "bg-violet-600 border-violet-500 text-white hover:bg-violet-500"
          }`}
        >
          {expanded ? <FiX size={16} /> : <FiPlus size={16} />}
        </button>
      </div>

      {/* Expandable form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-violet-500/20"
          >
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-slate-600"
                  placeholder="e.g. OWASP Lab, Home CTF, API Recon…"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scope / Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-slate-600 resize-none"
                  placeholder="Target URL, authorized scope, objective…"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                  <FiLock size={10} className="text-violet-500" />
                  NDA-free · Instant access · Auto-workflow created
                </div>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiZap size={14} />
                  )}
                  {loading ? "Creating…" : "Launch Workspace"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────
const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizations, setOrganizations]   = useState([]);
  const [selectedOrgId, setSelectedOrgId]   = useState("");
  const [orgMembers, setOrgMembers]         = useState([]);
  const [projects, setProjects]             = useState([]);
  const [personalProjects, setPersonalProjects] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [showOrgForm, setShowOrgForm]       = useState(false);
  const [form, setForm] = useState({ name: "", description: "", projectAdminId: "", hackerIds: [] });

  const isOrgAdmin = useMemo(
    () => user?.roles?.some(r => r.type === "ORG_ADMIN" || r.type === "SUPER_ADMIN"),
    [user]
  );

  const isPentester = useMemo(
    () => user?.roles?.some(r => r.type === "PENTESTER"),
    [user]
  );

  const loadAllProjects = async (orgId) => {
    const { data } = await api.get("/projects", { params: orgId ? { organizationId: orgId } : {} });
    const all = data?.data || [];
    setPersonalProjects(all.filter(p => p.isPersonal || p.leadPentesterId === user?.id));
    setProjects(all.filter(p => !p.isPersonal));
  };

  const loadOrganizations = async () => {
    const { data } = await api.get("/organizations/me");
    const orgList = data?.data || [];
    setOrganizations(orgList);
    if (orgList.length > 0) setSelectedOrgId(prev => prev || orgList[0].id);
    return orgList;
  };

  const loadOrgMembers = async (organizationId) => {
    if (!organizationId) return;
    try {
      const { data } = await api.get(`/organizations/${organizationId}/members`);
      setOrgMembers(data?.data || []);
    } catch { setOrgMembers([]); }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const orgs = await loadOrganizations();
<<<<<<< HEAD
        if (orgs.length) await loadProjects(orgs[0]?.id);
      } catch (error) {
        toast.error("Failed to load strategic data.");
=======
        await loadAllProjects(orgs[0]?.id);
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to load projects");
>>>>>>> 29cf968ad6e921e78b6c17cae03c9ce911d6c293
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;
    loadOrgMembers(selectedOrgId);
    loadAllProjects(selectedOrgId);
  }, [selectedOrgId]);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleHacker = memberUserId => {
    setForm(prev => {
      const exists = prev.hackerIds.includes(memberUserId);
      return { ...prev, hackerIds: exists ? prev.hackerIds.filter(id => id !== memberUserId) : [...prev.hackerIds, memberUserId] };
    });
  };

  const createOrgProject = async e => {
    e.preventDefault();
<<<<<<< HEAD
    if (!selectedOrgId) return toast.error("Select target organization.");
=======
    if (!selectedOrgId) return toast.error("Select an organization first");
>>>>>>> 29cf968ad6e921e78b6c17cae03c9ce911d6c293
    setSubmitting(true);
    try {
      await api.post("/projects", { ...form, organizationId: selectedOrgId });
      toast.success("Directive Materialized.");
      setForm({ name: "", description: "", projectAdminId: "", hackerIds: [] });
<<<<<<< HEAD
      await loadProjects(selectedOrgId);
    } catch (error) {
      toast.error("Directive instantiation failure.");
=======
      setShowOrgForm(false);
      await loadAllProjects(selectedOrgId);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Project creation failed");
>>>>>>> 29cf968ad6e921e78b6c17cae03c9ce911d6c293
    } finally {
      setSubmitting(false);
    }
  };

  const openWorkspaceInHub = (projectId) => {
    navigate(`/my-applications?projectId=${projectId}`);
  };

  const handlePersonalCreated = newProject => {
    setPersonalProjects(prev => [newProject, ...prev]);
    openWorkspaceInHub(newProject.id);
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00ff88]/30 overflow-x-hidden pt-20 pb-32">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#00ff88]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-10">
        <div className="flex items-end justify-between mb-16 px-2">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Strategic Directives</h1>
            <p className="text-[11px] font-mono font-black text-gray-500 uppercase tracking-[0.4em]">Integrated Project Pipeline / v.Prime</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-mono font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:border-[#00ff88]/30 transition-all"
          >
            Terminal Exit
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_2fr] gap-12">
          <AnimatePresence>
            {isOrgAdmin && (
              <motion.form 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={createProject} 
                className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 space-y-8 h-fit relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h2 className="text-[11px] font-mono font-black text-[#00ff88] uppercase tracking-[0.4em] mb-4">Initialize New Directive</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest ml-1">Target Entity</label>
                    <select
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-mono appearance-none cursor-pointer"
                      value={selectedOrgId}
                      onChange={(e) => setSelectedOrgId(e.target.value)}
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest ml-1">Directive Alias</label>
                    <input
                      name="name" value={form.name} onChange={onChange} placeholder="e.g. Operation Nightfall" required
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-mono shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest ml-1">Scope Parameters</label>
                    <textarea
                      name="description" value={form.description} onChange={onChange} placeholder="Define mission objectives…" rows={3}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-mono shadow-inner resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest ml-1">Directive Administrator</label>
                    <select
                      name="projectAdminId" value={form.projectAdminId} onChange={onChange}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-mono appearance-none cursor-pointer"
                    >
                      <option value="">Select project admin</option>
                      {orgMembers.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.user?.fullName || m.user?.email} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Deploy Operatives</div>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {orgMembers.map((m) => (
                        <label key={m.userId} className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer font-mono group
                          ${form.hackerIds.includes(m.userId) ? "bg-[#00ff88]/5 border-[#00ff88]/30 text-[#00ff88]" : "bg-white/[0.01] border-white/5 text-gray-500 hover:border-white/20"}`}>
                          <input
                            type="checkbox" className="hidden"
                            checked={form.hackerIds.includes(m.userId)}
                            onChange={() => toggleHacker(m.userId)}
                          />
                          <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center
                            ${form.hackerIds.includes(m.userId) ? "bg-[#00ff88] border-[#00ff88]" : "bg-transparent border-gray-700 group-hover:border-gray-500"}`}>
                            {form.hackerIds.includes(m.userId) && <Icons.Plus/>}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest leading-none">{m.user?.fullName || m.user?.email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit" disabled={submitting}
                    className="w-full bg-[#00ff88] text-black font-mono font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-[24px] shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {submitting ? "Instantiation In Progress..." : "Execute Deployment"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-10 min-w-0">
            <h2 className="text-[11px] font-mono font-black text-gray-500 uppercase tracking-[0.4em] ml-2">Integrated Pipeline archive</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white/[0.01] border border-white/5 rounded-[48px]">
                <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-[#00ff88] animate-spin shadow-[0_0_15px_rgba(0,255,136,0.1)]"/>
                <p className="text-[10px] font-mono font-black text-[#00ff88] uppercase tracking-[0.3em] animate-pulse">Syncing Directive Matrix...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-white/5 rounded-[48px]">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-gray-700 border border-white/5"><Icons.Folder/></div>
                <p className="text-[11px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">No Directives Synchronized</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((project) => (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full text-left p-10 rounded-[48px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#00ff88]/30 transition-all group relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#00ff88]/10 transition-all" />
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[#00ff88] flex items-center justify-center shadow-inner group-hover:border-[#00ff88]/40 transition-all"><Icons.Folder/></div>
                      <span className="text-[9px] font-mono font-black text-[#00ff88] uppercase tracking-[0.3em] bg-[#00ff88]/10 border border-[#00ff88]/20 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(0,255,136,0.1)]">{project.status}</span>
                    </div>
                    
                    <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-[#00ff88] transition-colors">{project.name}</h3>
                    <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed mb-10 line-clamp-2 h-10">{project.description || "Mission parameters undefined."}</p>
                    
                    <div className="flex items-center justify-between pt-8 border-t border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest"><Icons.Users/>{project.collaborators?.length || 0} Assets</div>
                        <div className="flex items-center gap-2 text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest"><Icons.Shield/>Core.Sync</div>
                      </div>
                      <Icons.ChevronRight/>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
=======
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-10 space-y-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mission Control</h1>
          <p className="text-slate-400 text-sm mt-1">Your personal labs and organization security programs.</p>
        </div>
        <div className="flex items-center gap-3">
          {isOrgAdmin && (
            <button
              onClick={() => setShowOrgForm(v => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                showOrgForm
                  ? "bg-slate-800 border-slate-700 text-slate-300"
                  : "bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500"
              }`}
            >
              {showOrgForm ? <FiX size={14} /> : <FiPlus size={14} />}
              {showOrgForm ? "Cancel" : "New Program"}
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-all"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Org project create form */}
      <AnimatePresence>
        {showOrgForm && isOrgAdmin && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={createOrgProject}
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-5"
          >
            <h2 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-3">
              <FiShield className="text-cyan-400" /> New Security Program
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(e.target.value)}
              >
                <option value="">Select organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Program name"
                required
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors placeholder-slate-600"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Scope and objectives"
                rows={2}
                className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors placeholder-slate-600 resize-none"
              />
              <select
                name="projectAdminId"
                value={form.projectAdminId}
                onChange={onChange}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="">Assign project admin (optional)</option>
                {orgMembers.map(m => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.fullName || m.user?.email} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
            >
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck size={14} />}
              {submitting ? "Creating…" : "Create Program"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Personal Workspace Section */}
      {isPentester && (
        <section className="space-y-5">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
            <FiTerminal className="text-violet-400" /> Personal Labs
          </h2>
          <PersonalWorkspaceCard onCreate={handlePersonalCreated} />
          {personalProjects.length > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {personalProjects.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => openWorkspaceInHub(p.id)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Org Programs Section */}
      <section className="space-y-5">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
          <FiShield className="text-cyan-400" /> Security Programs
        </h2>
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-600">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-mono animate-pulse">Loading programs</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-3xl text-slate-600">
            <FiFolder size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-500">No security programs yet.</p>
            {isOrgAdmin && (
              <p className="text-xs text-slate-600 mt-1">Create one using the <span className="text-cyan-400">New Program</span> button above.</p>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onClick={() => openWorkspaceInHub(p.id)} />
            ))}
          </div>
        )}
      </section>
>>>>>>> 29cf968ad6e921e78b6c17cae03c9ce911d6c293
    </div>
  );
};

export default Projects;
