import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";

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
    const run = async () => {
      setLoading(true);
      try {
        const orgs = await loadOrganizations();
        await loadProjects(orgs[0]?.id);
      } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    run();
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
    if (!selectedOrgId) return toast.error("Select organization first");
    setSubmitting(true);
    try {
      await api.post("/projects", { ...form, organizationId: selectedOrgId });
      toast.success("Project created");
      setForm({ name: "", description: "", projectAdminId: "", hackerIds: [] });
      await loadProjects(selectedOrgId);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Project creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-400 text-sm">Create projects, assign project admins, and hire hackers.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-xs uppercase tracking-widest"
        >
          Back to dashboard
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_2fr] gap-6">
        {isOrgAdmin && (
          <form onSubmit={createProject} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-lg">Create project</h2>
            <select
              className="w-full bg-black/40 border border-white/20 rounded-md px-3 py-2 text-sm"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              <option value="">Select organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Project name"
              required
              className="w-full bg-black/40 border border-white/20 rounded-md px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Scope and objective"
              rows={3}
              className="w-full bg-black/40 border border-white/20 rounded-md px-3 py-2 text-sm"
            />
            <select
              name="projectAdminId"
              value={form.projectAdminId}
              onChange={onChange}
              className="w-full bg-black/40 border border-white/20 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select project admin</option>
              {orgMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.fullName || m.user?.email} ({m.role})
                </option>
              ))}
            </select>
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-gray-400">Assign hackers</div>
              <div className="max-h-40 overflow-auto space-y-2">
                {orgMembers.map((m) => (
                  <label key={m.userId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.hackerIds.includes(m.userId)}
                      onChange={() => toggleHacker(m.userId)}
                    />
                    {m.user?.fullName || m.user?.email}
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00ff88] text-black font-semibold py-2 rounded-md disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create project"}
            </button>
          </form>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-4">Project pipeline</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-400 text-sm">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full text-left p-4 rounded-xl border border-white/10 bg-black/40 hover:border-[#00ff88]/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{project.name}</div>
                    <span className="text-xs text-[#00ff88] uppercase">{project.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{project.description || "No description provided."}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {project.organization?.name} • {project.collaborators?.length || 0} collaborators
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
