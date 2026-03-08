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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm font-mono text-gray-600">Loading hacker profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl py-10">
        <h1 className="text-2xl font-mono font-bold mb-2">Hacker profile</h1>
        <p className="text-xs font-mono text-gray-500 mb-6">
          Tell us who you are as an ethical hacker. This helps organizations trust you.
        </p>

        {error && (
          <div className="mb-4 text-xs font-mono text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-xs font-mono text-green-800 bg-green-50 border border-green-200 px-3 py-2 rounded">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-black"
              placeholder="Briefly describe your experience, specialties, and approach to ethical hacking."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-black"
                placeholder="e.g. Germany"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
                Years of experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                min={0}
                max={60}
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-black"
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
              Primary skills (comma-separated)
            </label>
            <input
              type="text"
              name="primarySkills"
              value={form.primarySkills}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-black"
              placeholder="e.g. web app pentesting, mobile, cloud"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
              Certifications (comma-separated)
            </label>
            <input
              type="text"
              name="certifications"
              value={form.certifications}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-black"
              placeholder="e.g. OSCP, CEH, eWPTX"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-widest text-gray-500 mb-1">
              Portfolio links (comma-separated URLs)
            </label>
            <input
              type="text"
              name="portfolioLinks"
              value={form.portfolioLinks}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-black"
              placeholder="e.g. https://github.com/you, https://blog.example.com"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black text-[#00ff88] font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-[#00ff88] hover:text-black transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmitForReview}
              className="px-4 py-2 border border-gray-900 text-gray-900 font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-60"
            >
              Submit for review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HackerProfile;

