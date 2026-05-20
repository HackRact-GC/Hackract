import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiSearch,
  FiTarget,
  FiTerminal,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../api/axiosConfig";
import WorkspaceView from "../components/WorkspaceView.jsx";

const MyApplications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState(
    searchParams.get("projectId") || null,
  );

  useEffect(() => {
    const loadApps = async () => {
      try {
        const { data } = await api.get("/projects");
        setApplications(data?.data || []);
      } catch (error) {
        toast.error("Failed to synchronize engagement proposals");
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  // Update URL when selection changes for deep linking support
  useEffect(() => {
    if (selectedProjectId) {
      setSearchParams({ projectId: selectedProjectId });
    } else {
      setSearchParams({});
    }
  }, [selectedProjectId, setSearchParams]);

  const filteredApps = applications.filter((app) => {
    if (filter === "ALL") return true;
    const isPending = app.collaborators?.some((c) => c.role === "APPLICANT");
    if (filter === "PENDING") return isPending;
    if (filter === "ACTIVE") return !isPending && !app.isPersonal;
    if (filter === "LABS") return app.isPersonal;
    return true;
  });

  if (selectedProjectId) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans selection:bg-[#00ff88]/30 selection:text-black">
        <WorkspaceView
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-10 font-sans selection:bg-[#00ff88]/30 selection:text-black">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/engagements")}
            className="group flex items-center gap-3 text-white/60 hover:text-[#00ff88] transition-all font-bold text-[10px] uppercase tracking-[0.2em] mb-4"
          >
            <div className="w-6 h-6 rounded-md bg-black border border-white/10 flex items-center justify-center group-hover:border-[#00ff88]/30 transition-all">
              <FiArrowLeft size={12} />
            </div>
            Back to Engagement Board
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Mission Hub
          </h1>
          <p className="text-white/70 text-sm max-w-xl">
            Unified command center for your active project bids, personal labs,
            and authorized security contracts.
          </p>
        </div>

        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10">
          {["ALL", "PENDING", "ACTIVE", "LABS"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === t
                  ? "bg-[#00ff88] text-black shadow-lg shadow-black/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="loading"
              className="py-32 flex flex-col items-center gap-4 text-white/60 font-mono"
            >
              <div className="w-10 h-10 border-2 border-white/10 border-t-[#00ff88] rounded-full animate-spin" />
              <span className="text-[9px] uppercase tracking-[0.3em] animate-pulse">
                Syncing Mission Ledger
              </span>
            </motion.div>
          ) : filteredApps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key="empty"
              className="py-24 text-center border border-white/10 border-dashed rounded-4xl bg-black/50 text-white/60"
            >
              <div className="text-4xl mb-4 opacity-20">📂</div>
              <p className="font-medium">No active missions found</p>
              <p className="text-xs mt-1 text-white/40 font-mono uppercase tracking-widest">
                Awaiting sector initialization
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-5">
              {filteredApps.map((project, idx) => {
                const isPending = project.collaborators?.some(
                  (c) => c.role === "APPLICANT",
                );
                const isLab = project.isPersonal;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-black/70 backdrop-blur-md border p-8 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-8 group transition-all relative overflow-hidden ${
                      isLab
                        ? "border-[#00ff88]/20 hover:border-[#00ff88]/40"
                        : "border-white/10 hover:border-[#00ff88]/30"
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      {isLab ? (
                        <FiTerminal size={80} />
                      ) : (
                        <FiTarget size={80} />
                      )}
                    </div>

                    <div className="flex items-center gap-8 relative z-10 w-full md:w-auto">
                      <div
                        className={`h-14 w-14 rounded-2xl bg-black border flex items-center justify-center transition-all shadow-inner shrink-0 leading-none ${
                          isLab
                            ? "text-[#00ff88] border-[#00ff88]/20 group-hover:text-white"
                            : "text-white/60 group-hover:text-[#00ff88] border-white/10 group-hover:border-[#00ff88]/20"
                        }`}
                      >
                        {isLab ? (
                          <FiTerminal size={24} />
                        ) : (
                          <FiBriefcase size={24} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3
                            className={`text-xl font-bold transition-colors truncate ${
                              isLab
                                ? "text-white group-hover:text-[#00ff88]"
                                : "text-white group-hover:text-[#00ff88]"
                            }`}
                          >
                            {project.name}
                          </h3>
                          <div
                            className={`w-1.5 h-1.5 rounded-full shadow-lg ${
                              isLab
                                ? "bg-[#00ff88] shadow-[#00ff88]/50"
                                : "bg-[#00ff88] shadow-[#00ff88]/50"
                            }`}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                          <span>
                            {isLab
                              ? "Personal Lab"
                              : project.organization?.name}
                          </span>
                          <span className="text-white/30">•</span>
                          <span>
                            ID: {project.id.split("-")[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 relative z-10 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-left md:text-right hidden sm:block">
                        <div className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">
                          Operational Status
                        </div>
                        {isPending ? (
                          <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                            <FiClock /> Verification Pending
                          </div>
                        ) : (
                          <div
                            className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                              isLab
                                ? "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20"
                                : "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20"
                            }`}
                          >
                            <FiCheckCircle />{" "}
                            {isLab
                              ? "Private Workspace"
                              : "Authorized Contract"}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border shadow-lg shadow-black/20 flex items-center gap-3 active:scale-95 ${
                          isLab
                            ? "bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-black border-[#00ff88]/20 hover:border-[#00ff88]"
                            : "bg-white/10 hover:bg-[#00ff88] text-white/70 hover:text-black border-white/10 hover:border-[#00ff88]"
                        }`}
                      >
                        Activate Workspace <FiExternalLink />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        <section className="bg-black/60 border border-white/10 rounded-4xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white/60">
            <FiSearch className="text-[#00ff88] opacity-70" />
            <p className="text-xs font-semibold leading-relaxed">
              Looking for new mission parameters? Visit the Public Engagement
              Board to synchronize with newly published tenders.
            </p>
          </div>
          <button
            onClick={() => navigate("/engagements")}
            className="whitespace-nowrap px-6 py-2.5 bg-transparent border border-white/10 hover:border-[#00ff88] text-white/70 hover:text-[#00ff88] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Browse Board
          </button>
        </section>
      </div>
    </div>
  );
};

export default MyApplications;
