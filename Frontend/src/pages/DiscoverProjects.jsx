import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { FiSearch, FiBriefcase, FiArrowRight, FiClock, FiCheckCircle } from "react-icons/fi";

const DiscoverProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects/marketplace");
      setProjects(data?.data || []);
    } catch (error) {
      toast.error("Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, []);

  const handleApply = async (projectId) => {
    setApplying(projectId);
    try {
      await api.post(`/projects/${projectId}/apply`);
      toast.success("Application submitted!");
      loadMarketplace(); // Refresh to remove applied project
    } catch (error) {
      toast.error(error?.response?.data?.error || "Application failed");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-[#00ff88]">Project Marketplace</h1>
          <p className="text-gray-400 text-sm mt-1">Discover and apply for open security engagements.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
        >
          Back to dashboard
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by keywords, skills, or organization..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-gray-500 animate-pulse">
              SCANNING OPEN ENGAGEMENTS...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center border border-white/5 rounded-2xl bg-white/5 font-mono text-gray-500">
              NO OPEN PROJECTS FOUND AT THIS TIME
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-[#00ff88]/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold group-hover:text-[#00ff88] transition-colors">
                          {project.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-[#00ff88]/10 text-[#00ff88] text-[10px] font-mono uppercase tracking-widest rounded border border-[#00ff88]/20">
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 max-w-2xl">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApply(project.id)}
                      disabled={applying === project.id}
                      className="px-6 py-2.5 bg-[#00ff88] text-black rounded-lg font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#00ff88]/80 transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
                    >
                      {applying === project.id ? "APPLYING..." : "Apply Now"}
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-6 text-xs font-mono text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiBriefcase className="text-[#00ff88]" />
                      <span className="text-gray-300">{project.organization?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <FiClock className="text-sky-400" />
                       <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
            <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 p-6 rounded-2xl">
                <h4 className="text-[#00ff88] font-mono font-bold text-xs uppercase tracking-widest mb-4">Operator Handbook</h4>
                <ul className="space-y-4 text-xs text-gray-400 font-mono">
                    <li className="flex gap-2">
                        <span className="text-[#00ff88]">01.</span>
                        Review program scope thoroughly before applying.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-[#00ff88]">02.</span>
                        Ensure your skills match the required tech stack.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-[#00ff88]">03.</span>
                        Multiple pending applications are allowed.
                    </li>
                </ul>
            </div>
            
            <button 
                onClick={() => navigate("/my-applications")}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
                View My Applications <FiArrowRight />
            </button>
        </aside>
      </div>
    </div>
  );
};

export default DiscoverProjects;
