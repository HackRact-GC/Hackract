import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { FiSearch, FiBriefcase, FiArrowRight, FiClock, FiShield, FiCpu, FiExternalLink } from "react-icons/fi";

const EngagementBoard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadEngagements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects/marketplace");
      setProjects(data?.data || []);
    } catch (error) {
      toast.error("Failed to synchronize with engagement ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngagements();
  }, []);

  const handleApply = async (projectId) => {
    setApplying(projectId);
    try {
      await api.post(`/projects/${projectId}/apply`);
      toast.success("Engagement proposal submitted successfully");
      loadEngagements();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Submission failed");
    } finally {
      setApplying(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.organization?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-8 font-sans selection:bg-[#00ff88]/30 selection:text-black">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded flex items-center justify-center text-[#00ff88]">
                <FiShield size={18} />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-white">Public Engagement Board</h1>
          </div>
          <p className="text-white/70 text-sm max-w-xl">
            Official repository of authorized security engagement opportunities within the Hackract network.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2.5 bg-black border border-white/10 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-[#00ff88] hover:text-black hover:border-[#00ff88] transition-all text-white/70"
            >
                Return to Command Center
            </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-8">
          {/* Search and Filters */}
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00ff88] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, technical stack, or entity name..."
              className="w-full bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 focus:ring-4 focus:ring-[#00ff88]/10 transition-all placeholder:text-white/40 shadow-inner"
            />
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 flex flex-col items-center gap-4 text-white/60 font-mono"
              >
                <div className="w-12 h-12 border-2 border-white/10 border-t-[#00ff88] rounded-full animate-spin shadow-[0_0_15px_rgba(0,255,136,0.15)]" />
                <span className="text-[10px] uppercase tracking-[0.3em] animate-pulse">Synchronizing Engagement Feed</span>
              </motion.div>
            ) : filteredProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center border border-white/10 border-dashed rounded-3xl bg-black/50 text-white/60"
              >
                <div className="text-4xl mb-4 opacity-20">📡</div>
                <p className="font-medium">No engagement matches found</p>
                <p className="text-xs mt-1 text-white/40">Adjust your criteria or check back for new postings.</p>
              </motion.div>
            ) : (
              <div className="grid gap-5">
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-black/70 backdrop-blur-md border border-white/10 p-6 rounded-4xl hover:border-[#00ff88]/30 hover:bg-black transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                        <FiCpu size={80} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest bg-[#00ff88]/10 px-2 py-0.5 rounded">
                                    {project.status === 'PUBLISHED' ? 'OPEN TENDER' : project.status}
                                </span>
                                <span className="text-xs text-white/50 font-mono truncate">ID: {project.id.split('-')[0].toUpperCase()}</span>
                            </div>
                              <h3 className="text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors tracking-tight">
                                {project.name}
                            </h3>
                        </div>
                        
                        <p className="text-white/70 text-sm line-clamp-2 leading-relaxed max-w-2xl">
                          {project.description || "Detailed scope documentation available upon engagement activation."}
                        </p>

                        <div className="flex flex-wrap items-center gap-5 text-[11px] font-semibold text-white/60 uppercase tracking-widest">
                          <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-full border border-white/10 group-hover:border-[#00ff88]/30 transition-colors">
                            <FiBriefcase className="text-[#00ff88]" />
                            <span className="text-white/80">{project.organization?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                            <FiClock className="text-white/40" />
                                <span>Engagement Window: {new Date(project.createdAt).toLocaleDateString()} — TBD</span>
                            </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => handleApply(project.id)}
                          disabled={applying === project.id}
                          className="flex-1 md:w-48 py-3 bg-[#00ff88] hover:bg-white text-black rounded-xl font-bold text-xs uppercase tracking-[0.15em] transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                        >
                          {applying === project.id ? (
                            "Synchronizing..."
                          ) : (
                            <>Register Interest <FiExternalLink /></>
                          )}
                        </button>
                        <button className="px-4 py-3 bg-white/10 hover:bg-[#00ff88] hover:text-black text-white/70 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/10 hover:border-[#00ff88]">
                            Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
            <div className="bg-black border border-white/10 p-8 rounded-4xl shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00ff88]/10 rounded-full blur-[100px] group-hover:bg-[#00ff88]/20 transition-all duration-700" />
              <h4 className="text-[#00ff88] font-bold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" /> Engagement Protocols
                </h4>
                <div className="space-y-6">
                    {[
                        { step: "01", title: "Compliance Review", desc: "Thoroughly review program scope and legal guidelines." },
                        { step: "02", title: "Resource Alignment", desc: "Ensure your technical arsenal matches target architecture." },
                        { step: "03", title: "Proposal Submission", desc: "Formal notice of interest is logged in the immutable ledger." }
                    ].map((item, i) => (
                        <div key={i} className="space-y-2 group/item">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-[#00ff88] opacity-40 group-hover/item:opacity-100 transition-opacity font-mono">{item.step}</span>
                                <span className="text-xs font-bold text-white/90 uppercase tracking-wide">{item.title}</span>
                            </div>
                              <p className="text-[11px] text-white/60 leading-relaxed pl-6">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={() => navigate("/my-applications")}
                className="w-full py-5 bg-black/70 backdrop-blur-md border border-white/10 rounded-3xl font-bold text-xs uppercase tracking-widest text-white/70 hover:text-black hover:bg-[#00ff88] hover:border-[#00ff88] transition-all flex items-center justify-center gap-3 group"
            >
                Pending Proposals 
                <div className="w-5 h-5 bg-white/10 group-hover:bg-black/10 rounded-md flex items-center justify-center transition-colors">
                  <FiArrowRight className="group-hover:text-black" />
                </div>
            </button>

              <div className="p-6 border border-white/10 rounded-3xl text-center space-y-2">
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.2em]">Platform Status</p>
                <div className="flex items-center justify-center gap-2 text-[#00ff88] text-[10px] font-mono">
                  <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse" />
                    OPERATIONAL • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default EngagementBoard;
