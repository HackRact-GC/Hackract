import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import ProjectActivity from "../components/ProjectActivity.jsx";
import KickoffChecklist from "../components/KickoffChecklist.jsx";
import { useAuth } from "../context/authContext.jsx";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";

const ProjectWorkspace = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

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
      user?.roles?.some((r) => r.type === "SUPER_ADMIN" || r.type === "ORG_ADMIN") ||
      project?.collaborators?.some((c) => c.userId === user?.id && c.role === "PROJECT_ADMIN")
    );
  }, [user, project]);

  const handleHire = async (userId) => {
    try {
      await api.post(`/projects/${projectId}/hire`, { userId });
      toast.success("Hacker hired!");
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data?.data || null);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Hiring failed");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] text-white p-8">Loading workspace...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-[#050505] text-white p-8">Project not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-400">
            {project.organization?.name} ΓÇó Status: {project.status}
          </p>
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-xs uppercase tracking-widest"
        >
          Back to projects
        </button>
      </div>

      <div className="flex gap-2">
        {["overview", "workflow", "findings", ...(canManage ? ["hiring"] : [])].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-xs uppercase tracking-widest ${
              activeTab === tab ? "bg-[#00c477] text-black" : "bg-white/10 border border-white/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {project.status === "PLANNING" && canManage && (
            <div className="max-w-3xl mx-auto">
              <KickoffChecklist projectId={projectId} onComplete={loadProject} />
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Project details</h3>
              <p className="text-sm text-gray-300">{project.description || "No description yet."}</p>
              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <div>Project Admin: {projectAdmin?.user?.fullName || "Not assigned"}</div>
                <div>Hackers hired: {hackers.length}</div>
                <div>Total findings: {project.findings?.length || 0}</div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="font-semibold mb-3">Hired team</h3>
              <div className="space-y-2">
                {hackers.length === 0 ? (
                  <p className="text-sm text-gray-400 font-mono text-[10px] uppercase tracking-widest">No operators assigned yet.</p>
                ) : (
                  hackers.map((h) => (
                    <div key={h.id} className="text-sm border border-white/10 rounded-md p-2 bg-black/30 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00c477] rounded-full" />
                      {h.user?.fullName || h.user?.email}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 lg:col-span-2">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
              Activity Feed
            </h3>
            <ProjectActivity projectId={projectId} />
          </div>
          </div>
        </div>
      )}

      {activeTab === "workflow" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold">Workflow collaboration</h3>
          <p className="text-sm text-gray-400">
            This project workspace is connected to your collaborative workflow board.
          </p>
          <button
            onClick={() => {
              const workflowId = project.workflows?.[0]?.id;
              if (!workflowId) {
                toast.error("No workflow found for this project");
                return;
              }
              navigate(`/workflows/${workflowId}`);
            }}
            className="px-4 py-2 bg-[#00c477] text-black rounded-md text-xs uppercase tracking-widest"
          >
            Open workflow board
          </button>
        </div>
      )}

      {activeTab === "findings" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FiFileText className="text-[#00c477]" />
              Project Discoveries
            </h3>
            {canManage && (
              <button 
                onClick={async () => {
                  try {
                    const { data } = await api.get(`/findings/project/${projectId}/report`);
                    const blob = new Blob([data.data], { type: 'text/markdown' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Security_Report_${project.name.replace(/\s+/g, '_')}.md`;
                    a.click();
                    toast.success("Report generated successfully!");
                  } catch (e) {
                    toast.error("Failed to generate report");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#00c477] text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                <FiDownload /> Export Security Report
              </button>
            )}
          </div>

          {!project.findings?.length ? (
            <div className="py-12 text-center border border-white/5 bg-black/20 rounded-xl">
               <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">No vulnerabilities reported yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {project.findings.map((f) => (
                <div 
                  key={f.id} 
                  onClick={() => navigate(`/findings/${f.id}`)}
                  className="group relative border border-white/10 rounded-xl p-4 bg-black/30 hover:border-[#00c477]/50 hover:bg-black/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-bold group-hover:text-[#00c477] transition-colors">{f.title}</div>
                      <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-tighter">
                        <span className={`px-2 py-0.5 rounded border ${
                          f.severity === 'CRITICAL' ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                          f.severity === 'HIGH' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' :
                          'text-gray-400 border-white/10'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-gray-500">ΓÇó</span>
                        <span className="text-gray-400">{f.status}</span>
                      </div>
                    </div>
                    <FiExternalLink className="text-gray-600 group-hover:text-[#00c477] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "hiring" && canManage && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Hiring Pipeline</h3>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              {applicants.length} Pending Applications
            </span>
          </div>

          {applicants.length === 0 ? (
            <div className="py-10 text-center border border-white/5 rounded-xl bg-black/20 font-mono text-xs text-gray-500 uppercase tracking-widest">
              No new applications received yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {applicants.map((app) => (
                <div key={app.id} className="bg-black/40 border border-white/10 p-5 rounded-xl flex items-center justify-between group hover:border-[#00c477]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#00c477] border border-white/10">
                      {app.user?.fullName?.[0] || "?"}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{app.user?.fullName || "Anonymous Hacker"}</div>
                      <div className="text-xs text-gray-500 font-mono">@{app.user?.handle || "operator"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleHire(app.user?.id)}
                    className="px-6 py-2 bg-[#00c477] text-black rounded-lg font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-[#00c477]/80 transition-all active:scale-95"
                  >
                    Hire Operator
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;
