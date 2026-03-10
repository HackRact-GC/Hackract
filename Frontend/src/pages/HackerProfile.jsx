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
        // user might not have a profile yet
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        yearsOfExperience: form.yearsOfExperience
          ? Number(form.yearsOfExperience)
          : null,

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
        "Failed to submit profile.";

      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-[#00ff88] animate-pulse">
            Initializing neural link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200 flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#00ff88] rounded-full blur-[150px] opacity-10"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500 rounded-full blur-[150px] opacity-5"></div>

      <div className="w-full max-w-4xl relative z-10 bg-[#111111] border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl">

        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-[#00ff88] font-mono text-2xl">~/</span>
            Hacker Identity
          </h1>

          <p className="text-sm font-mono text-gray-400">
            Define your skills and establish trust.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 px-4 py-3 rounded text-red-400 font-mono text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-[#00ff88]/10 border border-[#00ff88] px-4 py-3 rounded text-[#00ff88] font-mono text-sm">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>

          <div>
            <label className="text-xs font-mono text-gray-500 uppercase">
              Bio
            </label>

            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
              required
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 focus:border-[#00ff88] outline-none"
              placeholder="Describe your ethical hacking experience..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-xs font-mono text-gray-500 uppercase">
                Country
              </label>

              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 focus:border-[#00ff88] outline-none"
                placeholder="e.g. Ethiopia"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-gray-500 uppercase">
                Years Active
              </label>

              <input
                type="number"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                min={0}
                max={60}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 focus:border-[#00ff88] outline-none"
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-500 uppercase">
              Core Skills
            </label>

            <input
              type="text"
              name="primarySkills"
              value={form.primarySkills}
              onChange={handleChange}
              required
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 focus:border-[#00ff88] outline-none"
              placeholder="web pentesting, mobile, cloud"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-500 uppercase">
              Certifications
            </label>

            <input
              type="text"
              name="certifications"
              value={form.certifications}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 focus:border-[#00ff88] outline-none"
              placeholder="OSCP, CEH, eWPTX"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-500 uppercase">
              Portfolio Links
            </label>

            <input
              type="text"
              name="portfolioLinks"
              value={form.portfolioLinks}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 focus:border-[#00ff88] outline-none"
              placeholder="https://github.com/you"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-800">

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#00ff88] text-black font-bold font-mono rounded-lg hover:bg-[#00e67a]"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSubmitForReview}
              className="px-8 py-3 border border-[#00ff88] text-[#00ff88] font-bold font-mono rounded-lg hover:bg-[#00ff88]/10"
            >
              Submit for Review
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-8 py-3 border border-gray-600 text-gray-300 font-mono rounded-lg hover:border-[#00ff88]"
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