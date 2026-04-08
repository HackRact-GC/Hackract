import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import api from "../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  FiBriefcase, 
  FiFileText, 
  FiTarget, 
  FiCpu, 
  FiShield, 
  FiClock, 
  FiPlusCircle,
  FiArrowRight,
  FiZap,
  FiActivity
} from "react-icons/fi";

const OrganizationJobPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organizationId: "",
    category: "Web Application",
    bounty: "",
    skills: "",
    duration: "2-4 Weeks"
  });

  // Automatically select the first organization if the user has one
  useEffect(() => {
    if (user?.organizations?.length > 0 && !formData.organizationId) {
      setFormData(prev => ({ ...prev, organizationId: user.organizations[0].organizationId || user.organizations[0].id }));
    }
  }, [user, formData.organizationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.organizationId) {
      return toast.error("Please complete all required fields (Project Name, Description, and Entity Selection).");
    }

    setLoading(true);
    try {
      // Compose a rich description from extra fields
      const richDescription = `
Category: ${formData.category}
Bounty: ${formData.bounty || "Not Specified"}
Required Skills: ${formData.skills || "Standard Security Audit"}
Estimated Duration: ${formData.duration}

${formData.description}
      `.trim();

      const payload = {
        name: formData.name,
        description: richDescription,
        organizationId: formData.organizationId,
      };

      await api.post("/projects", payload);
      toast.success("Engagement Directive Successfully Transmitted to Marketplace");
      navigate("/projects");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to transmit directive loop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12 font-sans selection:bg-[#00ff88]/30 selection:text-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00ff88]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl flex items-center justify-center text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                <FiPlusCircle size={22} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-white uppercase">Initialize Job Post</h1>
          </div>
          <p className="text-white/50 text-xs font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse" />
            Strategic Engagement Definition Module.v4
          </p>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate("/dashboard")}
             className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/70"
           >
             Cancel Mission
           </button>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.8fr_1fr] gap-10 relative z-10">
        {/* Main Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 lg:p-10 shadow-2xl relative"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Identity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-mono font-black text-[#00ff88] uppercase tracking-[0.3em] pl-1">Target Entity (Organization)</label>
                <div className="relative group">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00ff88] transition-colors" />
                  <select 
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-[#00ff88]/50 focus:ring-4 focus:ring-[#00ff88]/5 transition-all text-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">Select Organization...</option>
                    {user?.organizations?.map(org => (
                      <option key={org.organizationId || org.id} value={org.organizationId || org.id} className="bg-[#0a0a0a]">
                        {org.organization?.name || org.name || "My Organization"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-mono font-black text-[#00ff88] uppercase tracking-[0.3em] pl-1">Engagement Descriptor (Title)</label>
                <div className="relative group">
                  <FiTarget className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00ff88] transition-colors" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Infrastructure Penetration Audit"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-[#00ff88]/50 focus:ring-4 focus:ring-[#00ff88]/5 transition-all text-white placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Classification & Budget */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Sector (Category)</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-4 text-xs font-mono font-black uppercase focus:outline-none focus:border-[#00ff88]/40 transition-all text-gray-300 appearance-none cursor-pointer"
                >
                  <option className="bg-[#0a0a0a]">Web Application</option>
                  <option className="bg-[#0a0a0a]">Network / Infrastructure</option>
                  <option className="bg-[#0a0a0a]">Cloud Architecture</option>
                  <option className="bg-[#0a0a0a]">Mobile (iOS/Android)</option>
                  <option className="bg-[#0a0a0a]">Smart Contract Audit</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Bounty Reserve (Budget)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-[#00ff88] opacity-50">$</span>
                  <input 
                    type="text" 
                    name="bounty"
                    value={formData.bounty}
                    onChange={handleChange}
                    placeholder="5,000 - 10,000"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-xs font-mono font-bold focus:outline-none focus:border-[#00ff88]/40 transition-all text-white placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Window (Duration)</label>
                <select 
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-4 text-xs font-mono font-black uppercase focus:outline-none focus:border-[#00ff88]/40 transition-all text-gray-300 appearance-none cursor-pointer"
                >
                  <option className="bg-[#0a0a0a]">Express (1 Week)</option>
                  <option className="bg-[#0a0a0a]">Standard (2-4 Weeks)</option>
                  <option className="bg-[#0a0a0a]">Deep Audit (1-2 Months)</option>
                  <option className="bg-[#0a0a0a]">Retainer (Ongoing)</option>
                </select>
              </div>
            </div>

            {/* Technical Stack */}
            <div className="space-y-4">
              <label className="block text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Required Technical Arsenal (Skills)</label>
              <div className="relative group">
                <FiCpu className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff88] transition-colors" />
                <input 
                  type="text" 
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, AWS, Kubernetes, OWASP Top 10"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-[#00ff88]/50 focus:ring-4 focus:ring-[#00ff88]/5 transition-all text-white placeholder:text-gray-700 font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="block text-[10px] font-mono font-black text-[#00ff88] uppercase tracking-[0.3em] pl-1">Mission Script (Detailed Description)</label>
              <div className="relative group">
                <FiFileText className="absolute left-4 top-6 text-white/20 group-focus-within:text-[#00ff88] transition-colors" />
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Define technical scope, assessment goals, and known infrastructure constraints…"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-3xl pl-12 pr-6 py-6 text-sm leading-relaxed focus:outline-none focus:border-[#00ff88]/50 focus:ring-4 focus:ring-[#00ff88]/5 transition-all text-white placeholder:text-gray-700 resize-none font-sans"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-6">
              <div className="hidden md:flex items-center gap-3 text-[9px] font-mono font-black text-white/30 uppercase tracking-widest">
                <FiShield /> Security Directive Authorized
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-5 bg-[#00ff88] hover:bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-[0_0_30px_rgba(0,255,136,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    Initialize Engagement Board Posting
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Sidebar Info Section */}
        <aside className="space-y-8">
           {/* Protocol Card */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-black/50 border border-white/5 rounded-[32px] p-8 shadow-xl relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><FiShield size={80} /></div>
              <h3 className="text-sm font-mono font-black text-[#00ff88] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
                Posting Protocols
              </h3>
              
              <div className="space-y-6">
                {[
                  { icon: FiClock, title: "Triage Window", desc: "Expect operator applications within 24-48 hours of transmission." },
                  { icon: FiZap, title: "NDA Enforcement", desc: "The platform NDA automatically gates access to this directive." },
                  { icon: FiActivity, title: "Immutable Audit", desc: "Every engagement interaction is logged in the permanent ledger." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-[#00ff88] group-hover:border-[#00ff88]/30 transition-all shrink-0">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{item.title}</h4>
                      <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono tracking-tighter">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
           </motion.div>

           {/* Preview Card */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="p-8 rounded-[32px] bg-gradient-to-br from-[#00ff88]/10 to-emerald-900/20 border border-[#00ff88]/20 shadow-2xl relative group overflow-hidden"
           >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00ff88]/10 rounded-full blur-3xl opacity-50" />
              <div className="relative z-10">
                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[#00ff88] mb-2 opacity-80">Marketplace Insight</p>
                <h4 className="text-lg font-black text-white leading-tight mb-4 uppercase tracking-tight">Expand Your <br />Operator Network</h4>
                <p className="text-[10px] text-white/40 mb-6 leading-relaxed uppercase font-mono font-bold">
                  Posting this job will notify verified pentesters matching your technical stack requirements.
                </p>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-black border border-white/20 flex items-center justify-center text-[8px] font-mono text-[#00ff88] font-black shadow-lg">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-[#00ff88] flex items-center justify-center text-[8px] font-black text-black shadow-lg shadow-[#00ff88]/20">
                    +15
                  </div>
                </div>
              </div>
           </motion.div>
        </aside>
      </div>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00ff88;
        }
      `}</style>
    </div>
  );
};

export default OrganizationJobPost;
