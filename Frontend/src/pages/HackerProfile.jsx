import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path strokeLinecap="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Camera: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { key: "identity", label: "Identity", Icon: Icons.User },
  { key: "arsenal", label: "Technical Arsenal", Icon: Icons.Code },
  { key: "credentials", label: "Credentials", Icon: Icons.Award },
  { key: "network", label: "Public Network", Icon: Icons.Globe },
];

const HackerProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeNav, setActiveNav] = useState("identity");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);

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
            github: profile.github || "",
            linkedin: profile.linkedin || "",
            twitter: profile.twitter || "",
          });
          if (profile.avatar) setLogoPreview(profile.avatar);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        primarySkills: form.primarySkills.split(",").map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split(",").map(s => s.trim()).filter(Boolean),
        portfolioLinks: form.portfolioLinks.split(",").map(s => s.trim()).filter(Boolean),
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
      };
      await api.put("/hacker-profiles/me", payload);
      setSuccess("Profile synchronized successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (name = "") => name.slice(0, 2).toUpperCase() || "H";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Retrieving operative data...</p>
        </div>
      </div>
    );
  }

  // ── Helper Components ───────────────────────────────────────────────────────
  const Field = ({ label, children, error: fieldError }) => (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">
        {label}
      </label>
      {children}
      {fieldError && <p className="text-[11px] text-rose-500 font-medium ml-0.5">{fieldError}</p>}
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
    />
  );

  const TextArea = (props) => (
    <textarea
      {...props}
      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm resize-none"
    />
  );

  const SectionCard = ({ title, subtitle, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6"
    >
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );

  // ── Page Sections ───────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeNav) {
      case "identity":
        return (
          <div className="space-y-6">
            <SectionCard title="Basic Identity" subtitle="Personal details that define your hacker profile.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Specialization">
                  <Input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Web Application Security" />
                </Field>
                <Field label="Years of Experience">
                  <Input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} placeholder="e.g. 5" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Bio / Mission Directive">
                    <TextArea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Tell us about your background and passion..." />
                  </Field>
                </div>
              </div>
            </SectionCard>
          </div>
        );
      case "arsenal":
        return (
          <SectionCard title="Technical Arsenal" subtitle="List the tools and technologies you have mastered.">
            <div className="space-y-5">
              <Field label="Core Skills (Comma separated)">
                <TextArea name="primarySkills" value={form.primarySkills} onChange={handleChange} rows={3} placeholder="Python, Nmap, Burp Suite, Metasploit..." />
              </Field>
              <div className="flex flex-wrap gap-2 pt-2">
                {form.primarySkills.split(",").map((s, i) => s.trim() && (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        );
      case "credentials":
        return (
          <SectionCard title="Certifications" subtitle="Professional badges of honor and technical certifications.">
            <Field label="Earned Certifications">
              <TextArea name="certifications" value={form.certifications} onChange={handleChange} rows={4} placeholder="OSCP, GWAPT, CISSP, eWPTX..." />
            </Field>
          </SectionCard>
        );
      case "network":
        return (
          <SectionCard title="Public Network" subtitle="Where can organizations find your previous work?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="GitHub Handle">
                <Input name="github" value={form.github} onChange={handleChange} placeholder="e.g. jdoe-root" />
              </Field>
              <Field label="LinkedIn Profile">
                <Input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="e.g. john-doe-pentester" />
              </Field>
              <Field label="Twitter / X">
                <Input name="twitter" value={form.twitter} onChange={handleChange} placeholder="e.g. @root_access" />
              </Field>
              <Field label="Portfolio / Blog">
                <Input name="portfolioLinks" value={form.portfolioLinks} onChange={handleChange} placeholder="https://myblog.com" />
              </Field>
            </div>
          </SectionCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
          <button onClick={() => navigate("/dashboard")} className="hover:text-indigo-600 transition-colors">
            Hacker Dashboard
          </button>
          <Icons.ChevronRight />
          <span className="text-gray-900 border-b-2 border-indigo-500 pb-0.5">Identity Settings</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Icons.Eye />
            Preview Public Profile
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
            {initials(form.bio || "H")}
          </div>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto flex gap-10 px-8 py-10">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="w-72 flex flex-col shrink-0">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-6 shadow-sm flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden shadow-inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-indigo-200">{initials(form.bio || "H")}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-indigo-600 text-white border-4 border-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all group-hover:scale-110"
              >
                <Icons.Camera />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center leading-none mb-1">Operative Node</h3>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Level 1 Operator</p>
            
            <div className="flex items-center gap-4 w-full pt-4 border-t border-gray-50">
               <div className="flex-1 text-center">
                 <p className="text-lg font-black text-gray-800">12</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vulns</p>
               </div>
               <div className="w-px h-8 bg-gray-100" />
               <div className="flex-1 text-center">
                 <p className="text-lg font-black text-gray-800">2.4k</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rep</p>
               </div>
            </div>
          </div>

          <nav className="space-y-1.5 px-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all
                  ${activeNav === item.key 
                    ? "bg-indigo-600 text-white shadow-indigo-200 shadow-xl" 
                    : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100"}`}
              >
                <item.Icon />
                {item.label}
              </button>
            ))}
            
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all mt-10"
            >
              <Icons.LogOut />
              Back to Dashboard
            </button>
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8 pl-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {NAV_ITEMS.find(n => n.key === activeNav)?.label}
                </h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">Update your professional dossier to maintain operational readiness.</p>
              </div>

              <form onSubmit={handleSubmit}>
                {renderContent()}

                <div className="flex items-center gap-4 mt-10 pl-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {saving ? "Synchronizing..." : <><Icons.Save /> Save Configuration</>}
                  </button>
                  
                  {success && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                      <Icons.Check /> {success}
                    </motion.p>
                  )}
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-rose-600 flex items-center gap-2">
                       <Icons.AlertCircle /> {error}
                    </motion.p>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default HackerProfile;
