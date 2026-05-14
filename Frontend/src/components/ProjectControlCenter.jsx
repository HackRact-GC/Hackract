import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import ProjectActivity from "./ProjectActivity.jsx";
import { FiPlus, FiArrowLeft, FiBell, FiTerminal, FiActivity, FiUserPlus, FiX, FiSearch, FiSend } from "react-icons/fi";

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
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a] border border-[#00c477]/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,196,119,0.1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#00c477] tracking-widest uppercase">Deploy Personnel</h3>
              <p className="text-[10px] text-gray-500 font-mono tracking-[0.2em] mt-1 uppercase">SEARCH & AUTHORIZE OPERATORS</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-[#00c477] transition-all">
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
              className="w-full bg-[#15181e] border border-gray-800 rounded-xl px-5 py-4 text-sm text-gray-300 outline-none focus:border-[#00c477]/50 transition-all font-mono"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-3 p-2 bg-[#00c477] text-black rounded-lg hover:scale-105 active:scale-95 transition-all"
            >
              <FiSearch size={16} />
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-transparent border-t-[#00c477] rounded-full animate-spin" /></div>
            ) : results.length > 0 ? (
              results.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-[#1a1d24] rounded-xl border border-gray-800 group hover:border-[#00c477]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black border border-gray-700 flex items-center justify-center font-black text-[#00c477]">
                      {u.fullName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-300 tracking-wider uppercase">{u.fullName}</p>
                      <p className="text-[10px] text-gray-500 font-mono tracking-widest">{u.handle} • {u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={sending === u.id}
                      onClick={() => sendInvite(u.id)}
                      className="p-3 bg-transparent hover:bg-[#00c477]/10 text-gray-500 hover:text-[#00c477] rounded-lg transition-all border border-gray-700 hover:border-[#00c477]/30 disabled:opacity-50"
                      title="Send Invitation"
                    >
                      {sending === u.id ? <div className="w-4 h-4 border-2 border-transparent border-t-[#00c477] rounded-full animate-spin" /> : <FiSend size={14} />}
                    </button>
                    <button
                      disabled={sending === u.id}
                      onClick={() => addDirectly(u.id)}
                      className="p-3 bg-[#00c477]/10 hover:bg-[#00c477] text-[#00c477] hover:text-black rounded-lg transition-all border border-[#00c477]/20 hover:border-[#00c477] disabled:opacity-50"
                      title="Direct Add"
                    >
                      {sending === u.id ? <div className="w-4 h-4 border-2 border-transparent border-t-black rounded-full animate-spin" /> : <FiUserPlus size={14} />}
                    </button>
                  </div>
                </div>
              ))
            ) : search && !loading ? (
              <p className="text-center py-10 text-[10px] text-gray-600 uppercase tracking-widest font-mono">No operators found matching criteria</p>
            ) : (
              <p className="text-center py-10 text-[10px] text-gray-600 uppercase tracking-widest font-mono italic">Enter credentials to begin search</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProjectControlCenter = ({ projectId, onBack }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const loadProject = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data?.data || null);
    } catch (error) {
      toast.error("Unable to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  const hackers = useMemo(() => {
    const realHackers = project?.collaborators?.filter((c) => c.role === "HACKER" || c.role === "PROJECT_ADMIN" || c.role === "PENTESTER") || [];

    // Mix in some mock hackers if we want the dashboard to look populated
    const mockHackers = [
      { id: "mock-1", userId: "u1", role: "HACKER", user: { fullName: "X_RAY_ZERO", email: "xray@darkweb.net" } },
      { id: "mock-2", userId: "u2", role: "HACKER", user: { fullName: "CYBER_PHOENIX", email: "phoenix@sec.org" } },
      { id: "mock-3", userId: "u3", role: "PROJECT_ADMIN", user: { fullName: "NEO_DRE", email: "dre@matrix.io" } }
    ];

    // If real hackers exist, use them, otherwise use mock data for showcase
    return realHackers.length > 0 ? realHackers : mockHackers;
  }, [project]);

  const handleMakeAdmin = async (userId) => {
    try {
      await api.patch(`/projects/${projectId}/admin`, { projectAdminId: userId });
      toast.success("Lead Pentester assigned!");
      loadProject();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to make lead pentester");
    }
  };

  const handleCreateWorkflow = async () => {
    if (project?.workflows?.[0]) {
      window.open(`/workflows/${project.workflows[0].id}`, '_blank');
      return;
    }

    try {
      const res = await api.post('/workflows', {
        pentestId: projectId,
        name: `${project.name} — Operational Workflow`
      });
      if (res.data?.success || res.data?.id) {
        toast.success("Workflow board initialized!");
        loadProject();
        const newWorkflowId = res.data?.id || res.data?.data?.id; // Check response structure
        if(newWorkflowId) window.open(`/workflows/${newWorkflowId}`, '_blank');
      }
    } catch (err) {
      toast.error("Failed to initialize workflow.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1115] text-[#00c477]">
        <div className="w-10 h-10 border-2 border-transparent border-t-[#00c477] rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  // Calculate phases based on status
  const statuses = ["PLANNING", "IN_PROGRESS", "REPORTING", "CLOSED"];
  const currentPhaseIndex = statuses.indexOf(project.status) !== -1 ? statuses.indexOf(project.status) : 1;
  const phasePercentage = ((currentPhaseIndex + 1) / 4) * 100;

  return (
    <div className="bg-[#0f1115] min-h-screen text-gray-300 font-mono p-4 md:p-8 selection:bg-[#00c477]/30 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 truncate">
          <button onClick={onBack} className="hover:text-[#00c477] transition-colors flex items-center gap-1">
            <FiArrowLeft /> BACK
          </button>
          <span>/ PROJECTS / {project.name?.replace(/\s+/g, '_').toUpperCase() || 'NEXUS_CORE'} / <span className="text-[#00c477]">CONTROL</span></span>
        </div>

        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase break-all">PROJECT_CONTROL_CENTER</h1>
            <div className="flex items-center gap-4 mt-2 text-[10px] uppercase tracking-widest flex-wrap">
              <div className="flex items-center gap-2 text-[#00c477]">
                <div className="w-2 h-2 rounded-full bg-[#00c477] animate-pulse shadow-[0_0_8px_#00c477]" />
                SYSTEM ONLINE: LIVE UPLINK
              </div>
              <div className="text-gray-600 hidden sm:block">|</div>
              <div className="text-gray-500">ID: {project.id?.substring(0, 8).toUpperCase()}-ALPHA</div>
            </div>
          </div>

          <button
            onClick={handleCreateWorkflow}
            className="flex items-center justify-center gap-3 bg-[#00c477] hover:bg-[#00c477] text-black px-6 py-3 rounded-md font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,196,119,0.2)] hover:shadow-[0_0_25px_rgba(0,196,119,0.4)] active:scale-95 whitespace-nowrap"
          >
            {project?.workflows?.[0] ? 'OPEN_WORKFLOW' : 'CREATE_WORKFLOW'} <FiPlus size={18} />
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Timeline & Operatives) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Mission Timeline Card */}
            <div className="bg-[#15181e] border border-gray-800 rounded-lg p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[#00c477] text-xs font-black uppercase tracking-widest mb-2">MISSION_TIMELINE</h3>
                  <div className="text-2xl text-gray-300">Phase 0{currentPhaseIndex + 1}/04 - {project.status.replace('_', ' ')}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">OVERALL COMPLETION</div>
                  <div className="text-3xl font-black text-[#00c477]">{phasePercentage}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-10 bg-[#0a0c10] w-full mb-6 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${phasePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#1a3a2d] to-[#00c477] relative"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
                </motion.div>
              </div>

              {/* Phases */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-gray-800 pt-6">
                {statuses.map((status, index) => (
                  <div key={status} className={`border-l-2 pl-3 ${index <= currentPhaseIndex ? 'border-[#00c477]' : 'border-gray-800'}`}>
                    <div className="text-[10px] text-gray-600 mb-1">ST-0{index + 1}</div>
                    <div className={`text-xs font-bold uppercase ${index <= currentPhaseIndex ? 'text-gray-300' : 'text-gray-700'}`}>
                      {status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operative Fleet Card */}
            <div className="bg-[#15181e] border border-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                <h3 className="text-[#00c477] text-xs font-black uppercase tracking-widest">OPERATIVE_FLEET</h3>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">{hackers.length}_ACTIVES_IDENTIFIED</div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 bg-[#1a3a2d] hover:bg-[#00c477] text-[#00c477] hover:text-black border border-[#00c477]/30 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    <FiUserPlus /> ASSIGN HACKER
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {hackers.map((hacker) => {
                  const isLead = hacker.role === "PROJECT_ADMIN";
                  return (
                    <div key={hacker.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1a1d24] border border-gray-800/50 rounded hover:border-[#00c477]/30 transition-colors group gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 bg-black border border-gray-700 flex items-center justify-center overflow-hidden text-[#00c477] font-black text-xl">
                            {hacker.user?.fullName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00c477] border-2 border-[#1a1d24]" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm font-bold text-gray-200 tracking-wider uppercase truncate">{hacker.user?.fullName || hacker.user?.email}</div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-[9px] bg-[#1a3a2d] text-[#00c477] px-1.5 py-0.5 uppercase tracking-widest">ACCEPTED</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest">LATENCY: {Math.floor(Math.random() * 40 + 5)}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-8">
                        {/* Task Capacity Mock */}
                        <div className="hidden md:block">
                          <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">TASK_CAPACITY</div>
                          <div className="flex gap-1">
                            <div className="w-4 h-1.5 bg-[#00c477]" />
                            <div className="w-4 h-1.5 bg-[#00c477]" />
                            <div className="w-4 h-1.5 bg-[#00c477]/20" />
                            <div className="w-4 h-1.5 bg-[#00c477]/20" />
                          </div>
                        </div>

                        {isLead ? (
                          <div className="text-[#00c477] border border-[#00c477]/30 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest bg-[#00c477]/5 whitespace-nowrap">
                            LEAD_ADMIN
                          </div>
                        ) : (
                          <button
                            onClick={() => handleMakeAdmin(hacker.userId)}
                            className="text-gray-400 border border-gray-700 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:text-[#00c477] hover:border-[#00c477] transition-all bg-transparent whitespace-nowrap"
                          >
                            ASSIGN_ADMIN
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {hackers.length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-xs uppercase tracking-widest">
                    No operatives assigned to this sector.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Telemetry & Logs) */}
          <div className="space-y-6">

            {/* Live Logs */}
            <div className="bg-[#15181e] border border-gray-800 rounded-lg p-6 flex flex-col h-[320px]">
              <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4 shrink-0">LIVE_LOGS</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4 relative">
                <div className="absolute inset-0">
                  <ProjectActivity projectId={projectId} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInviteModal && (
          <InviteMemberModal
            projectId={projectId}
            onClose={() => setShowInviteModal(false)}
            onInvited={() => {
              loadProject();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectControlCenter;
