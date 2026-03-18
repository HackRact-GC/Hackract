import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

const HackerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    bio: "",
    country: "",
    yearsOfExperience: "",
    primarySkills: "",
    certifications: "",
    portfolioLinks: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/hacker-profiles/me");
        const profile = data?.data?.profile;
        if (profile) {
          setForm({
            bio: profile.bio || "",
            country: profile.country || "",
            yearsOfExperience: profile.yearsOfExperience ?? "",
            primarySkills: (profile.primarySkills || []).join(", "),
            certifications: (profile.certifications || []).join(", "),
            portfolioLinks: (profile.portfolioLinks || []).join(", "),
          });
        }
      } catch {
        // ignore; user might not have a profile yet
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
        bio: form.bio,
        country: form.country || null,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
        primarySkills: form.primarySkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: form.certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolioLinks: form.portfolioLinks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status: "DRAFT",
      };
      const { data } = await api.put("/hacker-profiles/me", payload);
      setSuccess(data?.message || "Profile saved.");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to save profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const { data } = await api.post("/hacker-profiles/me/submit");
      setSuccess(data?.message || "Profile submitted for review.");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to submit profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-[#00ff88] animate-pulse">Initializing neural link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#00ff88] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[150px] opacity-5 pointer-events-none"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwdjQwTTIwIDB2NDBNMzAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsPSJub25lIiAvPgo8L3N2Zz4=')] opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 bg-[#111111] border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">

        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
            <span className="text-[#00ff88] font-mono text-2xl md:text-3xl">~/</span>
            Hacker Identity
          </h1>
          <p className="text-sm font-mono text-gray-400">
            Define your arsenal. Establish trust. Prepare for deployment.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/50 px-4 py-3 rounded-lg text-red-400 font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-start gap-3 bg-[#00ff88]/10 border border-[#00ff88]/50 px-4 py-3 rounded-lg text-[#00ff88] font-mono text-sm shadow-[0_0_15px_rgba(0,255,136,0.1)]">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{success}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>

          <div className="space-y-2 group">
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Bio / Directive
            </label>
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
              required
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] focus:bg-[#0a0a0a] transition-all placeholder-gray-600 resize-none"
              placeholder="Briefly describe your experience, specialties, and approach to ethical hacking..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Location / Node
              </label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] focus:bg-[#0a0a0a] transition-all placeholder-gray-600"
                placeholder="e.g. Germany"
              />
            </div>
            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Years Active
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                min={0}
                max={60}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] focus:bg-[#0a0a0a] transition-all placeholder-gray-600"
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              Core Capabilities (Skills)
            </label>
            <input
              type="text"
              name="primarySkills"
              value={form.primarySkills}
              onChange={handleChange}
              required
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] focus:bg-[#0a0a0a] transition-all placeholder-gray-600"
              placeholder="e.g. web app pentesting, mobile, cloud"
            />
            <p className="text-[10px] text-gray-600 font-mono ml-1 mt-1">Separate entries with commas</p>
          </div>

          <div className="space-y-2 group">
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              Certifications
            </label>
            <input
              type="text"
              name="certifications"
              value={form.certifications}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] focus:bg-[#0a0a0a] transition-all placeholder-gray-600"
              placeholder="e.g. OSCP, CEH, eWPTX"
            />
          </div>

          <div className="space-y-2 group">
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Portfolio / Vectors
            </label>
            <input
              type="text"
              name="portfolioLinks"
              value={form.portfolioLinks}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] focus:bg-[#0a0a0a] transition-all placeholder-gray-600"
              placeholder="e.g. https://github.com/you, https://blog.example.com"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 mt-8 border-t border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-[#00ff88] text-black font-bold font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-[#00e67a] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Save Draft
                </>
              )}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmitForReview}
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-[#00ff88]/50 text-[#00ff88] font-bold font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-[#00ff88]/10 hover:border-[#00ff88] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Submit for Review
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-gray-600 text-gray-300 font-bold font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#00ff88] hover:text-[#00ff88] transition-all flex items-center justify-center gap-2"
            >
              Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HackerProfile;
