import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";
import {
  FiPlus, FiTerminal, FiShield, FiArrowRight, FiClock, FiZap,
  FiCheck, FiX, FiLock, FiUsers, FiFolder,
} from "react-icons/fi";

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
    className="w-full text-left p-6 rounded-3xl border border-white/5 bg-[#111111] hover:border-[#00ff88]/30 hover:bg-white/5 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
      {project.isPersonal ? <FiTerminal size={60} /> : <FiShield size={60} />}
    </div>
    <div className="flex items-center justify-between mb-4">
      <StatusBadge status={project.status} />
      {project.isPersonal && (
        <span className="text-[9px] font-black uppercase tracking-widest text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
          <FiTerminal size={10} /> Personal
        </span>
      )}
    </div>
    <h3 className="font-bold text-lg text-white group-hover:text-[#00ff88] transition-colors truncate">{project.name}</h3>
    <p className="text-sm text-gray-500 mt-1 truncate">{project.description || "No scope defined yet."}</p>
    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
      <span className="flex items-center gap-2"><FiUsers size={10} /> {project.collaborators?.length || 0} members</span>
      {project.organization && <span className="flex items-center gap-2"><FiFolder size={10} /> {project.organization.name}</span>}
    </div>
    <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-all text-[#00ff88]">
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
      className="border border-white/5 bg-[#111111] rounded-3xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[#00ff88] shrink-0">
          <FiTerminal size={26} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg">Personal Workspace</h3>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
            Practice pentesting solo — no organization or NDA required.
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
            expanded
              ? "bg-white/10 border-white/10 text-gray-300"
              : "bg-[#00ff88] border-[#00ff88] text-black hover:bg-[#00ff88]/90"
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
            className="border-t border-white/5"
          >
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Workspace Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  className="w-full bg-[#161616] border border-white/10 focus:border-[#00ff88]/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-gray-600"
                  placeholder="e.g. OWASP Lab, Home CTF, API Recon…"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scope / Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#161616] border border-white/10 focus:border-[#00ff88]/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-gray-600 resize-none"
                  placeholder="Target URL, authorized scope, objective…"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <FiLock size={10} className="text-[#00ff88]" />
                  NDA-free · Instant access · Auto-workflow created
                </div>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
        await loadAllProjects(orgs[0]?.id);
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to load projects");
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
    if (!selectedOrgId) return toast.error("Select an organization first");
    setSubmitting(true);
    try {
      await api.post("/projects", { ...form, organizationId: selectedOrgId });
      toast.success("Directive Materialized.");
      setForm({ name: "", description: "", projectAdminId: "", hackerIds: [] });
      setShowOrgForm(false);
      await loadAllProjects(selectedOrgId);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Project creation failed");
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mission Control</h1>
          <p className="text-gray-500 text-sm mt-1">Your personal labs and organization security programs.</p>
        </div>
        <div className="flex items-center gap-3">
          {isOrgAdmin && (
            <button
              onClick={() => setShowOrgForm(v => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                showOrgForm
                  ? "bg-white/10 border-white/10 text-gray-300"
                  : "bg-[#00ff88] border-[#00ff88] text-black hover:bg-[#00ff88]/90"
              }`}
            >
              {showOrgForm ? <FiX size={14} /> : <FiPlus size={14} />}
              {showOrgForm ? "Cancel" : "New Program"}
            </button>
          )}
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
            className="bg-[#111111] border border-white/5 rounded-3xl p-8 space-y-5"
          >
            <h2 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-3">
              <FiShield className="text-[#00ff88]" /> New Security Program
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                className="bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors"
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
                className="bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors placeholder-gray-600"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Scope and objectives"
                rows={2}
                className="md:col-span-2 bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors placeholder-gray-600 resize-none"
              />
              <select
                name="projectAdminId"
                value={form.projectAdminId}
                onChange={onChange}
                className="bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors"
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
              className="flex items-center gap-2 px-6 py-3 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
            >
              {submitting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <FiCheck size={14} />}
              {submitting ? "Creating…" : "Create Program"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Personal Workspace Section */}
      {isPentester && (
        <section className="space-y-5">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-3">
            <FiTerminal className="text-[#00ff88]" /> Personal Labs
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
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-3">
          <FiShield className="text-[#00ff88]" /> Security Programs
        </h2>
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-gray-500">
            <div className="w-8 h-8 border-2 border-white/10 border-t-[#00ff88] rounded-full animate-spin" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-mono animate-pulse">Loading programs</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl text-gray-600">
            <FiFolder size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-500">No security programs yet.</p>
            {isOrgAdmin && (
              <p className="text-xs text-gray-600 mt-1">Create one using the <span className="text-[#00ff88]">New Program</span> button above.</p>
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
    </div>
  );
};

export default Projects;