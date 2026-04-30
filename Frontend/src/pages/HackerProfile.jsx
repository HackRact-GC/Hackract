import { useEffect, useRef, useState } from "react";
import { FiUser, FiCode, FiAward, FiFileText, FiCamera, FiUploadCloud, FiCpu, FiShield, FiGithub, FiLinkedin, FiTwitter, FiGlobe } from "react-icons/fi";
import api from "../api/axiosConfig";
import { useAuth } from "../context/authContext.jsx";
import toast from "react-hot-toast";

// ── Components ─────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 flex items-center justify-center text-[#00c477]">
      <Icon size={18} />
    </div>
    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/90 font-mono">{title}</h2>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-[10px] text-white/40 uppercase tracking-[0.14em] font-mono font-bold">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00c477]/30 focus:bg-[#0c0c0c] transition-all duration-300 shadow-inner"
  />
);

const TextArea = (props) => (
  <textarea
    {...props}
    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00c477]/30 focus:bg-[#0c0c0c] transition-all duration-300 shadow-inner resize-none min-h-[120px]"
  />
);

const StatusBadge = ({ status }) => {
  const styles = {
    DRAFT: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    SUBMITTED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    UNDER_REVIEW: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    APPROVED: "text-[#00c477] bg-[#00c477]/10 border-[#00c477]/20",
    REJECTED: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  const label = status?.replace("_", " ") || "Awaiting Verification";
  
  return (
    <div className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-8 border ${styles[status] || styles.DRAFT}`}>
      {label}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────

const HackerProfile = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [profileStatus, setProfileStatus] = useState("DRAFT");
  const [hasProfile, setHasProfile] = useState(false);

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
    fullName: user?.fullName || "",
    email: user?.email || "",
    idDocumentNumber: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/hacker-profiles/me");
        const profile = data?.data?.profile;

        if (profile) {
          setHasProfile(true);
          setProfileStatus(profile.status);
          setForm((prev) => ({
            ...prev,
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
            idDocumentNumber: profile.idDocumentNumber || "",
          }));

          if (profile.avatar) {
            setLogoPreview(profile.avatar);
          }
        }
      } catch (fetchErr) {
        console.error("Failed to fetch profile", fetchErr);
        // If 404, it means no profile yet, which is fine
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (!form.bio || form.bio.length < 10) {
        toast.error("Bio must be at least 10 characters long.");
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
        idDocumentNumber: form.idDocumentNumber,
        fullName: form.fullName,
        primarySkills: form.primarySkills.split(",").map((s) => s.trim()).filter(Boolean),
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
        portfolioLinks: form.portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean),
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
        // Mark as submitted if this is the initial creation
        status: hasProfile ? undefined : "SUBMITTED"
      };

      await api.put("/hacker-profiles/me", payload);
      toast.success(hasProfile ? "Profile dossier updated." : "Profile created and submitted.");
      if (refreshUser) await refreshUser();
      setHasProfile(true);
    } catch (submitErr) {
      toast.error(submitErr?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[#00c477]/20 border-t-[#00c477] rounded-full animate-spin" />
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00c477] animate-pulse">
          Decrypting Operative Records...
        </div>
      </div>
    );
  }

  const displayName = user?.fullName || user?.handle || "Digital Ghost";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-8 selection:bg-[#00c477]/30">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        
        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="space-y-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#00c477]/5 blur-[60px] pointer-events-none" />
            
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-4 ring-[#00c477]/10">
                {logoPreview ? (
                  <img src={logoPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <FiUser size={40} className="text-white/10 mb-1" />
                    <span className="text-2xl font-black text-[#00c477] tracking-tighter">{initials}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#00c477] text-black border-4 border-[#0c0c0c] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <FiCamera size={16} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
            </div>

            <h3 className="text-2xl font-black tracking-tight mb-1">{displayName}</h3>
            <StatusBadge status={profileStatus} />

            <div className="w-full bg-[#111] border border-[#00c477]/20 rounded-2xl p-4 text-left relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#00c477]/50" />
               <div className="text-[10px] font-mono font-bold text-[#00c477] uppercase tracking-widest mb-1">System_Notice</div>
               <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                 {hasProfile 
                   ? "Profile synchronization active. Keep your dossier updated for mission readiness."
                   : "Identity encryption active. Complete the profile to access the private bounty lab."}
               </p>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-6 space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                 <FiCpu size={16} />
               </div>
               <div className="text-[11px] font-mono uppercase tracking-widest text-white/40">Dossier Integrity</div>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-full shadow-[0_0_10px_rgba(59,130,246,0.5)] opacity-50" />
             </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <main className="bg-[#0c0c0c] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Section: Personal Info */}
            <section>
              <SectionHeader icon={FiShield} title="Personal Info" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Identity">
                  <Input 
                    name="fullName" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    placeholder="Enter your legal identity..." 
                    readOnly={hasProfile}
                  />
                </Field>
                <Field label="Comms Address">
                  <Input 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="operative@hackract.io" 
                    readOnly 
                  />
                </Field>
                <Field label="ID / Passport Number">
                  <Input 
                    name="idDocumentNumber" 
                    value={form.idDocumentNumber} 
                    onChange={handleChange} 
                    placeholder="e.g. A12345678" 
                  />
                </Field>
                <Field label="Country">
                  <Input 
                    name="country" 
                    value={form.country} 
                    onChange={handleChange} 
                    placeholder="e.g. Estonia" 
                  />
                </Field>
                <Field label="Specialization">
                  <Input 
                    name="specialization" 
                    value={form.specialization} 
                    onChange={handleChange} 
                    placeholder="e.g. Web App Security" 
                  />
                </Field>
                <Field label="Experience (Years)">
                  <Input 
                    name="yearsOfExperience" 
                    type="number"
                    value={form.yearsOfExperience} 
                    onChange={handleChange} 
                    placeholder="e.g. 5" 
                  />
                </Field>
              </div>
            </section>

            {/* Section: Arsenal & Skills */}
            <section>
              <SectionHeader icon={FiCode} title="Arsenal & Skills" />
              <div className="space-y-4">
                <Input 
                  name="primarySkills" 
                  value={form.primarySkills} 
                  onChange={handleChange} 
                  placeholder="e.g. Nmap, Metasploit, Burp Suite, Python (comma separated)" 
                />
                <div className="flex flex-wrap gap-2">
                  {form.primarySkills.split(",").map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-4 py-1.5 bg-[#1a1a1a] border border-white/5 text-white/60 rounded-full text-[11px] font-mono hover:border-[#00c477]/30 hover:text-[#00c477] transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Section: Certifications */}
            <section>
              <SectionHeader icon={FiAward} title="Certifications" />
              <div className="space-y-4">
                <Input 
                  name="certifications" 
                  value={form.certifications} 
                  onChange={handleChange} 
                  placeholder="e.g. OSCP, CISSP (comma separated)" 
                />
                <div 
                  className="w-full aspect-[5/1] bg-[#0a0a0a] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-[#00c477]/30 transition-all cursor-pointer group"
                  onClick={() => toast.info("Document upload coming soon in Phase 2.")}
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={20} className="text-white/20 group-hover:text-[#00c477]" />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Drag & Drop Documents</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Public Network */}
            <section>
              <SectionHeader icon={FiGlobe} title="Public Network" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="GitHub">
                  <div className="relative">
                    <FiGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      name="github" 
                      value={form.github} 
                      onChange={handleChange} 
                      className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00c477]/30 transition-all"
                      placeholder="github.com/username" 
                    />
                  </div>
                </Field>
                <Field label="LinkedIn">
                  <div className="relative">
                    <FiLinkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      name="linkedin" 
                      value={form.linkedin} 
                      onChange={handleChange} 
                      className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00c477]/30 transition-all"
                      placeholder="linkedin.com/in/username" 
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Section: Operational Bio */}
            <section>
              <SectionHeader icon={FiFileText} title="Operational Bio" />
              <Field label="Background Narrative">
                <TextArea 
                  name="bio" 
                  value={form.bio} 
                  onChange={handleChange} 
                  placeholder="Briefly describe your white-hat history and preferred targets..." 
                />
              </Field>
            </section>

            {/* Footer Actions */}
            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00c477] animate-pulse shadow-[0_0_8px_#00c477]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/30">Dossier Synced</span>
               </div>
               
               <button
                 type="submit"
                 disabled={saving}
                 className="w-full sm:w-auto px-10 py-4 bg-[#00c477] text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#00ff9d] transition-all hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {saving ? "Processing..." : (hasProfile ? "Update Profile" : "Create Profile")}
               </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default HackerProfile;
