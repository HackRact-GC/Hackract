import { useEffect, useRef, useState } from "react";
import { FiUser, FiCode, FiAward, FiGlobe, FiChevronRight, FiCamera, FiSave } from "react-icons/fi";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";

const NAV_ITEMS = [
  { key: "identity", label: "Identity", icon: FiUser },
  { key: "arsenal", label: "Technical Arsenal", icon: FiCode },
  { key: "credentials", label: "Credentials", icon: FiAward },
  { key: "network", label: "Public Network", icon: FiGlobe },
];

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-[11px] text-white/60 uppercase tracking-[0.14em] font-mono">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ff88]/50 transition-colors"
  />
);

const TextArea = (props) => (
  <textarea
    {...props}
    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
  />
);

const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-black/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">{title}</h2>
      <p className="text-xs text-white/40 mt-1">{subtitle}</p>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const HackerProfile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [activeNav, setActiveNav] = useState("identity");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  const [form, setForm] = useState({
    bio: "",
    country: "",
    yearsOfExperience: "",
    primarySkills: "",
    certifications: "",
    portfolioLinks: "",
    specialization: "",
    github: "",
    linkedin: "",
    twitter: "",
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
            specialization: profile.specialization || "",
            github: profile.githubUsername || "",
            linkedin: profile.linkedinProfile || "",
            twitter: profile.twitter || "",
          });

          if (profile.avatar) {
            setLogoPreview(profile.avatar);
          }
        }
      } catch (fetchErr) {
        console.error("Failed to fetch profile", fetchErr);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (form.bio.length < 10) {
        setError("Bio must be at least 10 characters long.");
        setSaving(false);
        return;
      }

      const payload = {
        bio: form.bio,
        country: form.country,
        specialization: form.specialization,
        githubUsername: form.github,
        linkedinProfile: form.linkedin,
        twitter: form.twitter,
        primarySkills: form.primarySkills.split(",").map((s) => s.trim()).filter(Boolean),
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
        portfolioLinks: form.portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean),
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
      };

      await api.put("/hacker-profiles/me", payload);
      setSuccess("Profile synchronized successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (submitErr) {
      setError(submitErr?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (value = "") => value.slice(0, 2).toUpperCase() || "H";
  const displayName = user?.fullName?.trim() || user?.handle?.trim() || user?.email?.split("@")?.[0] || "Operative Node";
  const navIndex = NAV_ITEMS.findIndex((item) => item.key === activeNav);

  const renderContent = () => {
    switch (activeNav) {
      case "identity":
        return (
          <SectionCard title="Primary Identity" subtitle="Core profile details used across mission workflows.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Specialization">
                <Input
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Web Application Security"
                />
              </Field>
              <Field label="Country">
                <Input name="country" value={form.country} onChange={handleChange} placeholder="e.g. Estonia" />
              </Field>
              <Field label="Years of Experience">
                <Input
                  type="number"
                  name="yearsOfExperience"
                  value={form.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Mission Profile (Bio)">
                  <TextArea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your background, approach, and areas of expertise..."
                  />
                </Field>
              </div>
            </div>
          </SectionCard>
        );
      case "arsenal":
        return (
          <SectionCard title="Technical Arsenal" subtitle="Your stack, tools, and capabilities.">
            <div className="space-y-5">
              <Field label="Primary Skills (Comma separated)">
                <TextArea
                  name="primarySkills"
                  value={form.primarySkills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Python, Nmap, Burp Suite, Metasploit..."
                />
              </Field>
              <div className="flex flex-wrap gap-2 pt-1">
                {form.primarySkills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
                  .map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] rounded-full text-[11px] font-mono uppercase tracking-wide"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          </SectionCard>
        );
      case "credentials":
        return (
          <SectionCard title="Credentials" subtitle="Certifications and technical validations.">
            <Field label="Certifications (Comma separated)">
              <TextArea
                name="certifications"
                value={form.certifications}
                onChange={handleChange}
                rows={4}
                placeholder="OSCP, GWAPT, eWPTX, PNPT..."
              />
            </Field>
          </SectionCard>
        );
      case "network":
        return (
          <SectionCard title="Public Network" subtitle="External links that represent your work.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="GitHub">
                <Input name="github" value={form.github} onChange={handleChange} placeholder="e.g. defsec0" />
              </Field>
              <Field label="LinkedIn">
                <Input
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="e.g. john-doe-pentester"
                />
              </Field>
              <Field label="Twitter / X">
                <Input name="twitter" value={form.twitter} onChange={handleChange} placeholder="e.g. @root_access" />
              </Field>
              <Field label="Portfolio / Blog">
                <Input
                  name="portfolioLinks"
                  value={form.portfolioLinks}
                  onChange={handleChange}
                  placeholder="https://myblog.com"
                />
              </Field>
            </div>
          </SectionCard>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center font-mono text-[#00ff88] animate-pulse">
        [SYSTEM]: Retrieving operative data...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 sm:px-8 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-[#00ff88]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="mx-auto w-full max-w-7xl bg-black/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Operative Settings</h1>
          <p className="mt-2 text-sm text-white/40">Maintain your profile dossier and keep mission metadata current.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.16em] text-white/30">
            {NAV_ITEMS.map((item, index) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className={index <= navIndex ? "text-[#00ff88]" : "text-white/30"}>
                  {index + 1}. {item.label}
                </span>
                {index < NAV_ITEMS.length - 1 && <FiChevronRight className="text-white/20" />}
              </div>
            ))}
          </div>

          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-5">
            <div
              className="h-full bg-[#00ff88] transition-all duration-500 ease-out"
              style={{ width: `${((navIndex + 1) / NAV_ITEMS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
              <div className="relative w-max mx-auto">
                <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-[#00ff88]">{initials(displayName)}</span>
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#00ff88] text-black border-2 border-black flex items-center justify-center hover:bg-white transition-colors"
                >
                  <FiCamera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </div>

              <h3 className="text-center mt-4 text-lg font-bold">{displayName}</h3>
              <div className="mt-1 flex items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.8)]" : "bg-white/20"}`} />
                <span className={isOnline ? "text-[#00ff88]" : "text-white/30"}>{isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>

            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveNav(item.key)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-center gap-3 text-sm font-semibold ${
                      activeNav === item.key
                        ? "bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]"
                        : "bg-black/40 border-white/5 text-white/40 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <Icon />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0">
              <div key={activeNav}>
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold">{NAV_ITEMS.find((item) => item.key === activeNav)?.label}</h2>
                  <p className="text-sm text-white/40 mt-1">
                    Update your configuration to keep your operator profile deploy-ready.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderContent()}

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-7 py-3 bg-[#00ff88] text-black rounded-lg text-xs font-mono font-bold uppercase tracking-[0.16em] hover:bg-white transition-colors disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {saving ? "SAVING..." : "SAVE CONFIGURATION"}
                    </button>

                    {success && (
                      <p className="text-xs font-mono uppercase tracking-[0.12em] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 rounded">
                        {success}
                      </p>
                    )}

                    {error && (
                      <p className="text-xs font-mono uppercase tracking-[0.12em] text-rose-300 border border-rose-500/20 bg-rose-500/10 px-3 py-2 rounded">
                        {error}
                      </p>
                    )}
                  </div>
                </form>
              </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HackerProfile;
