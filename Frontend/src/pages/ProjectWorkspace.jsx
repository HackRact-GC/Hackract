import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";

const ProjectWorkspace = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [projectId]);

  const projectAdmin = useMemo(
    () => project?.collaborators?.find((c) => c.role === "PROJECT_ADMIN"),
    [project]
  );
  const hackers = useMemo(
    () => project?.collaborators?.filter((c) => c.role === "HACKER") || [],
    [project]
  );

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white p-8">Loading workspace...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white p-8">Project not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-400">
            {project.organization?.name} • Status: {project.status}
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
        {["overview", "workflow", "findings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-xs uppercase tracking-widest ${
              activeTab === tab ? "bg-[#00ff88] text-black" : "bg-white/10 border border-white/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-3">Project details</h3>
            <p className="text-sm text-gray-300">{project.description || "No description yet."}</p>
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <div>Project Admin: {projectAdmin?.user?.fullName || "Not assigned"}</div>
              <div>Hackers hired: {hackers.length}</div>
              <div>Total findings: {project.findings?.length || 0}</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-3">Hired team</h3>
            <div className="space-y-2">
              {hackers.length === 0 ? (
                <p className="text-sm text-gray-400">No hackers assigned yet.</p>
              ) : (
                hackers.map((h) => (
                  <div key={h.id} className="text-sm border border-white/10 rounded-md p-2 bg-black/30">
                    {h.user?.fullName || h.user?.email}
                  </div>
                ))
              )}
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
            className="px-4 py-2 bg-[#00ff88] text-black rounded-md text-xs uppercase tracking-widest"
          >
            Open workflow board
          </button>
        </div>
      )}

      {activeTab === "findings" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-3">Findings</h3>
          {!project.findings?.length ? (
            <p className="text-sm text-gray-400">No findings yet.</p>
          ) : (
            <div className="space-y-2">
              {project.findings.map((f) => (
                <div key={f.id} className="border border-white/10 rounded-md p-3 bg-black/30">
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-xs text-gray-400 uppercase">
                    {f.severity} • {f.status}
                  </div>
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
