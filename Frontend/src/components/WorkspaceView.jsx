import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import ProjectActivity from "./ProjectActivity.jsx";
import KickoffChecklist from "./KickoffChecklist.jsx";
import { useAuth } from "../context/authContext.jsx";
import { FiDownload, FiExternalLink, FiFileText, FiArrowLeft, FiCode, FiPrinter, FiGlobe, FiServer, FiFileMinus, FiCalendar, FiPlus, FiUserPlus, FiTrash2, FiSearch, FiX, FiSend, FiEdit2, FiStar, FiSettings } from "react-icons/fi";
import SystemAdminDashboard from "../pages/Admin/SystemAdminDashboard.jsx";

const InviteMemberModal = ({ projectId, onClose, onInvited }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/users?search=${search}`);
      setResults(data.data || []);
    } catch (e) {
      toast.error("Failed to find users");
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (hackerId) => {
    setSending(hackerId);
    try {
      await api.post(`/invitations`, {
        pentestId: projectId,
        hackerId,
        message: "You have been invited to collaborate on this security program.",
      });
      toast.success("Invitation sent!");
      onInvited();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to send invitation");
    } finally {
      setSending(null);
    }
  };

  const addDirectly = async (hackerId) => {
    setSending(hackerId);
    try {
      await api.post(`/projects/${projectId}/hackers`, {
        hackerIds: [hackerId]
      });
      toast.success("Hacker added directly!");
      onInvited();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to add hacker");
    } finally {
      setSending(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-4xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Deploy Personnel</h3>
              <p className="text-[10px] text-white/20 font-mono tracking-[0.2em] mt-1">SEARCH & AUTHORIZE OPERATORS</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all">
              <FiX size={20} />
            </button>
          </div>

          <div className="relative">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by handle or email..."
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-all font-medium"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-3 p-2 bg-[#00ff88] text-black rounded-xl hover:scale-105 active:scale-95 transition-all"
            >
              <FiSearch size={16} />
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {loading ? (
              <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-white/10 border-t-[#00ff88] rounded-full animate-spin" /></div>
            ) : results.length > 0 ? (
              results.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center font-bold text-[#00ff88]">
                      {u.fullName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{u.fullName}</p>
                      <p className="text-[10px] text-white/40 font-mono tracking-tighter">{u.handle} • {u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={sending === u.id}
                      onClick={() => sendInvite(u.id)}
                      className="p-3 bg-white/5 hover:bg-[#00ff88]/20 text-white/40 hover:text-[#00ff88] rounded-xl transition-all border border-white/5 hover:border-[#00ff88]/30 disabled:opacity-50"
                      title="Send Invitation"
                    >
                      {sending === u.id ? <div className="w-4 h-4 border-2 border-white/10 border-t-[#00ff88] rounded-full animate-spin" /> : <FiSend size={14} />}
                    </button>
                    <button
                      disabled={sending === u.id}
                      onClick={() => addDirectly(u.id)}
                      className="p-3 bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-black rounded-xl transition-all border border-[#00ff88]/20 hover:border-[#00ff88] disabled:opacity-50"
                      title="Direct Add"
                    >
                      {sending === u.id ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <FiUserPlus size={14} />}
                    </button>
                  </div>
                </div>
              ))
            ) : search && !loading ? (
              <p className="text-center py-10 text-[10px] text-white/20 uppercase tracking-widest font-mono">No operators found matching criteria</p>
            ) : (
              <p className="text-center py-10 text-[10px] text-white/20 uppercase tracking-widest font-mono italic">Enter credentials to begin search</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const WorkspaceView = ({ projectId, onBack }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "workflow");
  const [showInvite, setShowInvite] = useState(false);
  const workspaceName = project?.name || "Project Workspace";

  const isProjectAdmin = useMemo(() => {
    return project?.collaborators?.some(
      (c) => c.userId === user?.id && c.role === "PROJECT_ADMIN"
    );
  }, [user, project]);

  const tabs = useMemo(() => {
    if (!project) return [];
    if (project.isPersonal) {
      // Local Lab: Only Workflow and Findings. Deletion moved to header.
      return ["workflow", "findings"];
    }
    // Org Project (Hacker Side): Overview, Workflow, Findings, [Admin Dashboard], Team.
    const baseTabs = ["overview", "workflow", "findings"];
    if (isProjectAdmin) {
      baseTabs.push("admin-dashboard");
    }
    baseTabs.push("team");
    return baseTabs;
  }, [project, isProjectAdmin]);

  const [activeTab, setActiveTab] = useState(() => {
    const queryTab = searchParams.get("tab");
    if (queryTab && tabs.includes(queryTab)) return queryTab;
    return project?.isPersonal ? "workflow" : "overview";
  });

  useEffect(() => {
    if (project) {
      const currentTabs = project.isPersonal ? ["workflow", "findings"] : ["overview", "workflow", "findings", "team"];
      if (!currentTabs.includes(activeTab)) {
        setActiveTab(project.isPersonal ? "workflow" : "overview");
      }
    }
  }, [project]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data?.data || null);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  const projectAdmin = useMemo(
    () => project?.collaborators?.find((c) => c.role === "PROJECT_ADMIN"),
    [project]
  );

  const hackers = useMemo(
    () => project?.collaborators?.filter((c) => c.role === "HACKER") || [],
    [project]
  );

  const applicants = useMemo(
    () => project?.collaborators?.filter((c) => c.role === "APPLICANT") || [],
    [project]
  );

  const canManage = useMemo(() => {
    return (
      user?.roles?.some((r) => r.type === "ORG_ADMIN" || r.type === "ORG_ADMIN") ||
      project?.collaborators?.some((c) => c.userId === user?.id && c.role === "PROJECT_ADMIN")
    );
  }, [user, project]);

  const handleHire = async (userId) => {
    try {
      await api.post(`/projects/${projectId}/hire`, { userId });
      toast.success("Hacker hired!");
      loadProject();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Hiring failed");
    }
  };
  const handleMakeAdmin = async (userId) => {
    try {
      await api.patch(`/projects/${projectId}/admin`, { projectAdminId: userId });
      toast.success("Lead Pentester assigned!");
      loadProject();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to make lead pentester");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the project?")) return;
    try {
      await api.delete(`/projects/${projectId}/collaborators/${userId}`);
      toast.success("Member removed from project");
      setProject(prev => ({
        ...prev,
        collaborators: prev.collaborators.filter(c => c.userId !== userId)
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to delete this project? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted successfully");
      navigate('/org-projects');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-2 border-white/10 border-t-[#00ff88] rounded-full animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Syncing Ops Workspace</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 border border-dashed border-white/10 rounded-4xl bg-black/50">
        <p className="text-white/60">Project parameters not found.</p>
        <button onClick={onBack} className="mt-4 text-[#00ff88] text-xs font-bold uppercase tracking-widest hover:underline">
          Return to Mission Hub
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <button
              onClick={onBack}
              className="group flex items-center gap-3 text-white/60 hover:text-[#00ff88] transition-all font-bold text-[10px] uppercase tracking-[0.2em] mb-4"
            >
              <div className="w-6 h-6 rounded-md bg-black border border-white/10 flex items-center justify-center group-hover:border-[#00ff88]/30 transition-all">
                <FiArrowLeft size={12} />
              </div>
              Back to Mission Hub
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-white">{workspaceName}</h1>
            <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-widest">
              <span>{project.organization?.name || "Independent"}</span>
              <span className="text-white/20">•</span>
              <span className="text-[#00ff88]">Status: {project.status}</span>
            </div>
          </div>

          {project.isPersonal && (
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <FiTrash2 size={14} /> Deconstruct Lab
            </button>
          )}
        </div>

        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 w-fit overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? "bg-[#00ff88] text-black shadow-lg shadow-black/30" : "text-white/60 hover:text-white"
                }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === "workflow" && (
            <div className="bg-black/70 backdrop-blur-md border border-white/10 p-12 rounded-4xl text-center space-y-6">
              <div className="w-20 h-20 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-3xl flex items-center justify-center text-[#00ff88] mx-auto shadow-inner">
                <FiExternalLink size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold">Collaborative Workflow Engine</h3>
                <p className="text-sm text-white/60">
                  This workspace is synchronized with a real-time graph editor. Launch the board to manage nodes, assets, and collaborative logic.
                </p>
              </div>
              {project.workflows?.[0] ? (
                <button
                  onClick={() => {
                    const workflowId = project.workflows[0].id;
                    window.open(`/workflows/${workflowId}`, '_blank');
                  }}
                  className="px-8 py-4 bg-[#00ff88] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#00ff88]/20 active:scale-95 transition-all"
                >
                  Open Workflow Board <FiExternalLink className="inline ml-2" />
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const res = await api.post('/workflows', {
                        pentestId: projectId,
                        name: `${project.name} — Operational Workflow`
                      });
                      if (res.data?.success || res.data?.id) {
                        toast.success("Workflow board initialized!");
                        loadProject(); // Refresh to get the new workflow ID
                      }
                    } catch (err) {
                      toast.error("Failed to initialize board.");
                    }
                  }}
                  className="px-8 py-4 bg-[#00ff88] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#00ff88]/20 active:scale-95 transition-all"
                >
                  Initialize Board <FiExternalLink className="inline ml-2" />
                </button>
              )}
            </div>
          )}

          {activeTab === "findings" && (
            <div className="space-y-6">
              <div className="bg-black/70 backdrop-blur-md border border-white/10 p-8 rounded-4xl space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
                    <FiFileText className="text-[#00ff88]" /> Operative Discoveries
                  </h3>
                  {canManage && project.findings?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await api.get(`/findings/project/${projectId}/report`);
                            const blob = new Blob([data.data], { type: 'text/markdown' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `Report_${project.id.split('-')[0]}.md`; a.click();
                            toast.success("MD report exported.");
                          } catch (e) { toast.error("Export failed."); }
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-[#00ff88] text-white/60 hover:text-black border border-white/10 hover:border-[#00ff88] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <FiDownload /> MD
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await api.get(`/findings/project/${projectId}/report?format=json`);
                            const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `Report_${project.id.split('-')[0]}.json`; a.click();
                            toast.success("JSON report exported.");
                          } catch (e) { toast.error("Export failed."); }
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-[#00ff88] text-white/60 hover:text-black border border-white/10 hover:border-[#00ff88] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <FiCode /> JSON
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await api.get(`/findings/project/${projectId}/report`);
                            const newWindow = window.open('', '_blank');
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>Security Assessment Report</title>
                                  <style>
                                    body { font-family: sans-serif; line-height: 1.6; color: #333; padding: 2rem; max-width: 800px; margin: 0 auto; }
                                    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; white-space: pre-wrap; font-family: monospace; }
                                    h1, h2, h3 { color: #111; }
                                    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
                                    th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                                    th { background: #f4f4f4; }
                                  </style>
                                </head>
                                <body>
                                  <pre>${data.data}</pre>
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                            newWindow.focus();
                            setTimeout(() => {
                              newWindow.print();
                              newWindow.close();
                            }, 500);
                          } catch (e) { toast.error("Export failed."); }
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-[#00ff88] text-white/60 hover:text-black border border-white/10 hover:border-[#00ff88] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <FiPrinter /> PDF
                      </button>
                    </div>
                  )}
                </div>

                {!project.findings?.length ? (
                  <div className="py-20 text-center border border-dashed border-white/5 bg-black/30 rounded-3xl">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">No vulnerabilities logged in this sector.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {project.findings.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => navigate(`/findings/${f.id}`)}
                        className="group bg-black border border-white/5 p-6 rounded-3xl hover:border-[#00ff88]/30 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="space-y-2">
                          <div className="text-sm font-bold group-hover:text-[#00ff88] transition-colors">{f.title}</div>
                          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                            <span className={`px-2 py-1 rounded-md border ${f.severity === 'CRITICAL' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                              f.severity === 'HIGH' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                                'text-white/40 border-white/10'
                              }`}>
                              {f.severity}
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="text-white/40">{f.status}</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#00ff88] group-hover:bg-[#00ff88]/10 transition-all border border-white/5 group-hover:border-[#00ff88]/20">
                          <FiExternalLink size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "admin-dashboard" && isProjectAdmin && (
            <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-4xl overflow-hidden h-[800px]">
              <SystemAdminDashboard />
            </div>
          )}

          {activeTab === "team" && (
            <div className="bg-black/70 backdrop-blur-md border border-white/10 p-8 rounded-4xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-1">Personnel Management</h3>
                  <p className="text-[10px] text-white/20 font-mono tracking-widest">AUTHORIZED PROJECT STAFF</p>
                </div>
              </div>

              <div className="grid gap-4">
                {project.collaborators?.filter(c => c.role !== 'APPLICANT').map((member) => (
                  <div key={member.id} className="bg-black border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-[#00ff88]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-[#00ff88] shadow-inner text-xl">
                        {member.user?.fullName?.[0] || "?"}
                      </div>
                      <div>
                        <div className="font-bold text-sm tracking-tight text-white">{member.user?.fullName || "Anonymous"}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${member.role === 'PROJECT_ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#00ff88]/20 text-[#00ff88]'
                            }`}>
                            {member.role}
                          </span>
                          <span className="text-[10px] text-white/20 font-mono tracking-tighter">
                            {member.user?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {canManage && member.userId !== user?.id && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {member.role !== 'PROJECT_ADMIN' && (
                          <button
                            onClick={() => handleMakeAdmin(member.userId)}
                            title="Make Lead Pentester"
                            className="p-2.5 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 text-purple-400/40 hover:text-purple-400 transition-all border border-white/5"
                          >
                            <FiStar size={14} />
                          </button>
                        )}
                        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5">
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/40 hover:text-rose-500 transition-all border border-white/5"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && canManage && (
            <div className="max-w-4xl">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88]">
                    <FiSettings size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Project Management</h2>
                    <p className="text-sm text-white/40 font-mono uppercase tracking-widest">Global Configuration & Controls</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Project Identity</label>
                      <input
                        type="text"
                        defaultValue={project.name}
                        onBlur={(e) => api.patch(`/projects/${projectId}`, { name: e.target.value }).then(() => toast.success("Name updated"))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00ff88]/50 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Operational Status</label>
                      <select
                        defaultValue={project.status}
                        onChange={(e) => api.patch(`/projects/${projectId}`, { status: e.target.value }).then(() => toast.success("Status updated"))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00ff88]/50 transition-all outline-none appearance-none"
                      >
                        <option value="PLANNING">Planning</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REPORTING">Reporting</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Primary Scope</label>
                      <textarea
                        defaultValue={project.targetDomains?.join('\n')}
                        placeholder="one domain per line"
                        onBlur={(e) => api.patch(`/projects/${projectId}`, { targetDomains: e.target.value.split('\n').filter(Boolean) }).then(() => toast.success("Scope updated"))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-32 focus:border-[#00ff88]/50 transition-all outline-none resize-none font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                  <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-rose-500 font-bold mb-1">Danger Zone</h4>
                      <p className="text-[11px] text-white/40">Permanently delete this project and all associated data.</p>
                    </div>
                    <button
                      onClick={handleDeleteProject}
                      className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hiring" && canManage && (
            <div className="bg-black/70 backdrop-blur-md border border-white/10 p-8 rounded-4xl space-y-8">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Application Pipeline</h3>
              {applicants.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl bg-black/30">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">No pending applications for this engagement.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {applicants.map((app) => (
                    <div key={app.id} className="bg-black border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-[#00ff88]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-[#00ff88] shadow-inner">
                          {app.user?.fullName?.[0] || "?"}
                        </div>
                        <div>
                          <div className="font-bold text-sm tracking-tight">{app.user?.fullName || "Anonymous Hacker"}</div>
                          <div className="text-[9px] text-white/40 font-mono uppercase tracking-widest">RANK: MASTER OPERATOR</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleHire(app.user?.id)}
                        className="px-6 py-2.5 bg-[#00ff88] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#00ff88]/10"
                      >
                        Authorize & Deploy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showInvite && (
          <InviteMemberModal
            projectId={projectId}
            onClose={() => setShowInvite(false)}
            onInvited={() => {
              // Optionally refresh invitations or team list
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkspaceView;
