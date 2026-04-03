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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-[#00ff88] animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
          <p className="text-[10px] font-mono font-black text-[#00ff88] uppercase tracking-[0.4em] animate-pulse">Syncing Operative Node...</p>
        </div>
      </div>
    );
  }

  // ── Helper Components ───────────────────────────────────────────────────────
  const Field = ({ label, children, error: fieldError }) => (
    <div className="space-y-2">
      <label className="block text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      {children}
      {fieldError && <p className="text-[10px] font-mono text-rose-500 font-bold ml-1 uppercase tracking-widest">{fieldError}</p>}
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 
        focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-mono shadow-inner"
    />
  );

  const TextArea = (props) => (
    <textarea
      {...props}
      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 
        focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-mono shadow-inner resize-none"
    />
  );

  const SectionCard = ({ title, subtitle, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden mb-8 relative group"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h2 className="text-[11px] font-mono font-black text-white uppercase tracking-[0.3em] group-hover:text-[#00ff88] transition-colors">{title}</h2>
          <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>
      <div className="p-8">{children}</div>
    </motion.div>
  );

  // ── Page Sections ───────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeNav) {
      case "identity":
        return (
          <div className="space-y-6">
            <SectionCard title="Core Identity" subtitle="Primary metrics and descriptors for mission identification.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field label="Tactical Specialization">
                  <Input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Web Security Operative" />
                </Field>
                <Field label="Years of Deployment">
                  <Input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} placeholder="e.g. 5" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Directive Manifest / Bio">
                    <TextArea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Declare your professional intent and operational history..." />
                  </Field>
                </div>
              </div>
            </SectionCard>
          </div>
        );
      case "arsenal":
        return (
          <SectionCard title="Technical Arsenal" subtitle="Integrated technologies and mastered exploitation vectors.">
            <div className="space-y-8">
              <Field label="Mastered Tech (Comma separated)">
                <TextArea name="primarySkills" value={form.primarySkills} onChange={handleChange} rows={3} placeholder="Nmap, Burp, Metasploit, Python, React..." />
              </Field>
              <div className="flex flex-wrap gap-3 pt-2">
                {form.primarySkills.split(",").map((s, i) => s.trim() && (
                  <span key={i} className="px-4 py-1.5 bg-[#00ff88]/10 text-[#00ff88] rounded-xl text-[10px] font-mono font-black border border-[#00ff88]/20 uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.05)]">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        );
      case "credentials":
        return (
          <SectionCard title="Operator Credentials" subtitle="Validated badges of honor and elite technical certifications.">
            <Field label="Earned Certifications">
              <TextArea name="certifications" value={form.certifications} onChange={handleChange} rows={4} placeholder="OSCP, OSCE, CISSP, GWAPT..." />
            </Field>
          </SectionCard>
        );
      case "network":
        return (
          <SectionCard title="Network Presence" subtitle="Digital footprints across the global intelligence grid.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field label="GitHub Directive">
                <Input name="github" value={form.github} onChange={handleChange} placeholder="e.g. jdoe-root" />
              </Field>
              <Field label="LinkedIn ID">
                <Input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="e.g. john-doe-pentester" />
              </Field>
              <Field label="Twitter / X Alias">
                <Input name="twitter" value={form.twitter} onChange={handleChange} placeholder="e.g. @root_access" />
              </Field>
              <Field label="Intel Blog / Portfolio">
                <Input name="portfolioLinks" value={form.portfolioLinks} onChange={handleChange} placeholder="https://intel.core" />
              </Field>
            </div>
          </SectionCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center px-10 sticky top-0 z-[60] gap-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-[10px] font-mono font-black text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-[0.2em]">Hacker Dashboard</button>
          <Icons.ChevronRight />
          <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">Identity Matrix</span>
        </div>

        <div className="ml-auto flex items-center gap-6">
          <button className="flex items-center gap-3 px-6 py-2.5 bg-white/[0.02] border border-white/10 rounded-2xl text-[10px] font-mono font-black text-gray-500 hover:text-white hover:border-[#00ff88]/30 transition-all uppercase tracking-widest shadow-inner">
            <Icons.Eye />
            Preview Node 
          </button>
          <div className="w-10 h-10 rounded-xl bg-black border border-[#00ff88]/30 text-[#00ff88] flex items-center justify-center font-mono font-black text-xs shadow-inner shadow-[#00ff88]/10">
            {initials(form.bio || "H")}
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex gap-10 px-10 py-12">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="w-80 flex flex-col shrink-0 sticky top-32 h-fit">
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 mb-8 shadow-2xl flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#00ff88]/10 transition-all" />
            
            <div className="relative group mb-8">
              <div className="w-28 h-28 rounded-[32px] bg-black border border-[#00ff88]/20 flex items-center justify-center overflow-hidden shadow-inner shadow-[#00ff88]/10 group-hover:border-[#00ff88]/50 transition-all">
                {logoPreview ? (
                  <img src={logoPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black font-mono text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">{initials(form.bio || "H")}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#00ff88] text-black border-4 border-[#050505] shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-10"
              >
                <Icons.Camera />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
            </div>

            <h3 className="text-2xl font-black text-white text-center leading-none mb-2 uppercase tracking-tight">Operator Node</h3>
            <p className="text-[10px] font-mono font-black text-[#00ff88] uppercase tracking-[0.3em] mb-8 animate-pulse shadow-glow">Elite Operative</p>
            
            <div className="flex items-center gap-6 w-full pt-8 border-t border-white/5">
               <div className="flex-1 text-center group/stat">
                 <p className="text-2xl font-black text-white group-hover/stat:text-[#00ff88] transition-colors leading-none mb-1">12</p>
                 <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest">Findings</p>
               </div>
               <div className="w-[1px] h-10 bg-white/5" />
               <div className="flex-1 text-center group/stat">
                 <p className="text-2xl font-black text-white group-hover/stat:text-[#00ff88] transition-colors leading-none mb-1">2.4k</p>
                 <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest">Rank</p>
               </div>
            </div>
          </div>

          <nav className="space-y-2 px-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`w-full flex items-center gap-5 px-8 py-4.5 rounded-[24px] text-[11px] font-mono font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group
                  ${activeNav === item.key 
                    ? "bg-white/[0.04] text-[#00ff88] shadow-2xl border border-[#00ff88]/20 -translate-x-2" 
                    : "text-gray-500 hover:bg-white/[0.02] hover:text-white hover:translate-x-1"}`}
              >
                <span className={activeNav === item.key ? "text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" : "text-gray-600 group-hover:text-gray-400"}><item.Icon /></span>
                {item.label}
                {activeNav === item.key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse"/>}
              </button>
            ))}
            
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-5 px-8 py-4.5 rounded-[24px] text-[10px] font-mono font-black text-gray-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all uppercase tracking-widest mt-12 border border-transparent hover:border-rose-500/10"
            >
              <Icons.LogOut />
              Terminate Link
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
              <div className="mb-12 pl-1">
                <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                  {NAV_ITEMS.find(n => n.key === activeNav)?.label}
                </h1>
                <p className="text-[11px] font-mono text-gray-600 mt-2 uppercase tracking-[0.3em] font-bold">Synchronize operative metadata / Core.v2</p>
              </div>

              <form onSubmit={handleSubmit}>
                {renderContent()}

                <div className="flex items-center gap-6 mt-12 pl-1 bg-white/[0.01] p-10 rounded-[40px] border border-white/5 shadow-inner">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-4 px-10 py-5 bg-[#00ff88] text-black rounded-2xl text-[11px] font-mono font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? "Transmitting..." : <><Icons.Save /> Commit Changes</>}
                  </button>
                  
                  {success && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"/> {success}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-6 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest flex items-center gap-3">
                       <Icons.AlertCircle /> {error}
                    </motion.div>
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
