import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";
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

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [orgMembers, setOrgMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    projectAdminId: "",
    hackerIds: [],
  });

  const isOrgAdmin = useMemo(
    () => user?.roles?.some((r) => r.type === "ORG_ADMIN" || r.type === "SUPER_ADMIN"),
    [user]
  );

  const loadProjects = async (organizationId) => {
    const { data } = await api.get("/projects", { params: organizationId ? { organizationId } : {} });
    setProjects(data?.data || []);
  };

  const loadOrganizations = async () => {
    const { data } = await api.get("/organizations/me");
    const orgList = data?.data || [];
    setOrganizations(orgList);
    if (orgList.length > 0) {
      setSelectedOrgId((prev) => prev || orgList[0].id);
    }
    return orgList;
  };

  const loadOrgMembers = async (organizationId) => {
    if (!organizationId) return;
    try {
      const { data } = await api.get(`/organizations/${organizationId}/members`);
      setOrgMembers(data?.data || []);
    } catch {
      setOrgMembers([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const orgs = await loadOrganizations();
        if (orgs.length) await loadProjects(orgs[0]?.id);
      } catch (error) {
        toast.error("Failed to load strategic data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;
    loadOrgMembers(selectedOrgId);
    loadProjects(selectedOrgId);
  }, [selectedOrgId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleHacker = (memberUserId) => {
    setForm((prev) => {
      const exists = prev.hackerIds.includes(memberUserId);
      return {
        ...prev,
        hackerIds: exists ? prev.hackerIds.filter((id) => id !== memberUserId) : [...prev.hackerIds, memberUserId],
      };
    });
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!selectedOrgId) return toast.error("Select target organization.");
    setSubmitting(true);
    try {
      await api.post("/projects", { ...form, organizationId: selectedOrgId });
      toast.success("Directive Materialized.");
      setForm({ name: "", description: "", projectAdminId: "", hackerIds: [] });
      await loadProjects(selectedOrgId);
    } catch (error) {
      toast.error("Directive instantiation failure.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
    </div>
  );
};

export default Projects;
