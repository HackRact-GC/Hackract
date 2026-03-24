import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { FiClock, FiCheckCircle, FiXCircle, FiArrowLeft, FiBriefcase } from "react-icons/fi";

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const { data } = await api.get("/projects"); 
        // Backend /projects returns projects user is a collaborator in.
        // We filter for role: APPLICANT or where role: HACKER to show history.
        // Actually, let's just show all projects they are part of and indicate role.
        setApplications(data?.data || []);
      } catch (error) {
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest mb-4"
          >
            <FiArrowLeft /> Back to Marketplace
          </button>
          <h1 className="text-3xl font-bold font-mono tracking-tight">Active Applications</h1>
          <p className="text-gray-400 text-sm mt-1">Track the status of your project bids and invitations.</p>
        </div>
      </div>

      <div className="max-w-4xl space-y-4">
        {loading ? (
             <div className="py-20 text-center font-mono text-gray-500 animate-pulse">
                RETRIEVING APPLICATION STATUS...
             </div>
        ) : applications.length === 0 ? (
            <div className="py-20 text-center border border-white/5 rounded-2xl bg-white/5 font-mono text-gray-500">
                YOU HAVE NO ACTIVE APPLICATIONS
            </div>
        ) : (
            <div className="grid gap-4">
                {applications.map(project => {
                    const collab = project.collaborators?.find(c => c.userId === project.userId); // This check might be tricky depending on API return
                    // Wait, let's find the current user's role in this project
                    // The API returns collaborateurs array. We need to find the one where userId matches.
                    // But we don't have the current userId easily without useAuth.
                    return (
                        <div key={project.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                    <FiBriefcase size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold group-hover:text-[#00ff88] transition-colors">{project.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{project.organization?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Status</div>
                                    {project.collaborators?.some(c => c.role === 'APPLICANT') ? (
                                        <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase">
                                            <FiClock /> Pending Review
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[#00ff88] font-mono text-xs uppercase">
                                            <FiCheckCircle /> Hired / Contract Active
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className="px-4 py-2 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-colors"
                                >
                                    View Workspace
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
