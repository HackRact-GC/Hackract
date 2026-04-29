import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiUser, FiCode, FiAward, FiFileText, FiCamera, FiUploadCloud, FiCpu, FiShield, FiCheckCircle } from 'react-icons/fi';

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

const HackerOnboarding = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [missingAgreements, setMissingAgreements] = useState([]);
  
  const [formData, setFormData] = useState({
    idDocumentNumber: '',
    bio: '',
    country: '',
    yearsOfExperience: '',
    primarySkills: '',
    certifications: '',
    githubUsername: '',
    linkedinProfile: '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    specialization: '',
  });

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/hacker-profiles/me/status');
      setMissingAgreements(data.data.missingAgreements || []);
      if (data.data.profile) {
        setFormData(prev => ({
          ...prev,
          idDocumentNumber: data.data.profile.idDocumentNumber || '',
          bio: data.data.profile.bio || '',
          country: data.data.profile.country || '',
          yearsOfExperience: data.data.profile.yearsOfExperience || '',
          primarySkills: data.data.profile.primarySkills?.join(', ') || '',
          certifications: data.data.profile.certifications?.join(', ') || '',
          githubUsername: data.data.profile.githubUsername || '',
          linkedinProfile: data.data.profile.linkedinProfile || '',
          specialization: data.data.profile.specialization || ''
        }));
      }
    } catch (error) {
      // It's okay if profile doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bio || formData.bio.length < 10) {
        toast.error("Please provide a background narrative (min 10 chars).");
        return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        primarySkills: formData.primarySkills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : null,
        status: 'SUBMITTED'
      };

      await api.put('/hacker-profiles/me', payload);
      toast.success('Profile created successfully!');
      
      if (refreshUser) await refreshUser();
      
      setTimeout(() => {
        window.location.href = '/hacker-dashboard';
      }, 1500);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[#00c477]/20 border-t-[#00c477] rounded-full animate-spin" />
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00c477] animate-pulse">
          Initializing Operator Onboarding...
        </div>
      </div>
    );
  }

  const displayName = formData.fullName || user?.handle || "Digital Ghost";
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
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00c477] bg-[#00c477]/10 px-3 py-1 rounded-full mb-8 border border-[#00c477]/20">
              Awaiting Verification
            </div>

            <div className="w-full bg-[#111] border border-[#00c477]/20 rounded-2xl p-4 text-left relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#00c477]/50" />
               <div className="text-[10px] font-mono font-bold text-[#00c477] uppercase tracking-widest mb-1">System_Notice</div>
               <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                 Identity encryption active. Complete the profile to access the private bounty lab.
               </p>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-6 space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                 <FiCpu size={16} />
               </div>
               <div className="text-[11px] font-mono uppercase tracking-widest text-white/40">Onboarding Progress</div>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/4 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
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
                    value={formData.fullName} 
                    onChange={handleChange} 
                    placeholder="John 'Zero' Doe" 
                  />
                </Field>
                <Field label="Comms Address">
                  <Input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="zero@hackract.io" 
                    readOnly 
                  />
                </Field>
                <Field label="ID / Passport Number">
                  <Input 
                    name="idDocumentNumber" 
                    value={formData.idDocumentNumber} 
                    onChange={handleChange} 
                    placeholder="e.g. A12345678" 
                  />
                </Field>
                <Field label="Country">
                  <Input 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange} 
                    placeholder="e.g. Estonia" 
                  />
                </Field>
                <Field label="Specialization">
                  <Input 
                    name="specialization" 
                    value={formData.specialization} 
                    onChange={handleChange} 
                    placeholder="e.g. Web App Security" 
                  />
                </Field>
                <Field label="Experience (Years)">
                  <Input 
                    name="yearsOfExperience" 
                    type="number"
                    value={formData.yearsOfExperience} 
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
                  value={formData.primarySkills} 
                  onChange={handleChange} 
                  placeholder="e.g. Nmap, Metasploit, Burp Suite, Wireshark (comma separated)" 
                />
                <div className="flex flex-wrap gap-2">
                  {formData.primarySkills.split(",").map(s => s.trim()).filter(Boolean).map((skill, idx) => (
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
              <div 
                className="w-full aspect-[4/1] bg-[#0a0a0a] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-[#00c477]/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiUploadCloud size={24} className="text-white/20 group-hover:text-[#00c477]" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Drag & Drop Documents</div>
                  <div className="text-[10px] text-white/20 font-medium">Only .PDF formats supported (Max 10MB)</div>
                </div>
                <button 
                  type="button" 
                  className="mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-white transition-all"
                >
                  Upload PDF
                </button>
              </div>
            </section>

            {/* Section: Operational Bio */}
            <section>
              <SectionHeader icon={FiFileText} title="Operational Bio" />
              <Field label="Background Narrative">
                <TextArea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  placeholder="Briefly describe your white-hat history and preferred targets..." 
                />
              </Field>
            </section>

            {/* Footer Actions */}
            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00c477] animate-pulse shadow-[0_0_8px_#00c477]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/30">System Ready</span>
               </div>
               
               <button
                 type="submit"
                 disabled={submitting}
                 className="w-full sm:w-auto px-10 py-4 bg-[#00c477] text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#00ff9d] transition-all hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {submitting ? "Processing..." : "Create Profile"}
               </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default HackerOnboarding;
