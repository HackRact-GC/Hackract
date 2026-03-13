import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

const OrganizationProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [organizationId, setOrganizationId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/organizations/me");
                const orgs = data?.data?.data || data?.data || [];
                if (orgs && orgs.length > 0) {
                    const org = orgs[0];
                    setOrganizationId(org.id);
                    setForm({
                        name: org.name || "",
                        slug: org.slug || "",
                        description: org.description || "",
                    });
                }
            } catch (err) {
                // user might not have an org yet, or error
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim() || undefined,
                description: form.description.trim() || undefined,
            };

            if (organizationId) {
                // Update existing organization
                const { data } = await api.patch(`/organizations/${organizationId}`, payload);
                setSuccess(data?.message || "Organization profile updated.");
            } else {
                // Create new organization
                const { data } = await api.post("/organizations", payload);
                const newOrg = data?.data;
                if (newOrg && newOrg.id) {
                    setOrganizationId(newOrg.id);
                }
                setSuccess(data?.message || "Organization created successfully.");
            }
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "Failed to save organization profile. Please try again.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
                <p className="text-sm font-mono text-gray-400">Loading organization profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
            <div className="w-full max-w-2xl py-10">
                <h1 className="text-2xl font-mono font-bold mb-2">Organization profile</h1>
                <p className="text-xs font-mono text-gray-500 mb-6">
                    Set up your organization to start creating and managing pentests.
                </p>

                {error && (
                    <div className="mb-4 text-xs font-mono text-red-400 bg-red-950/30 border border-red-500/30 px-3 py-2 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 text-xs font-mono text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/30 px-3 py-2 rounded">
                        {success}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
                                Organization Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                placeholder="e.g. HackRact Security"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
                                Slug (Optional)
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                placeholder="e.g. hackract-security"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                            placeholder="Briefly describe your organization's mission and scope."
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-[#00ff88] text-black font-mono text-xs uppercase tracking-widest rounded-md hover:bg-[#00ff88]/90 transition-colors disabled:opacity-60 font-bold"
                        >
                            {saving ? "Saving..." : (organizationId ? "Update Organization" : "Create Organization")}
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => navigate("/")}
                            className="px-4 py-2 bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-widest rounded-md hover:border-[#00ff88] hover:text-[#00ff88] transition-colors disabled:opacity-60"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizationProfile;
