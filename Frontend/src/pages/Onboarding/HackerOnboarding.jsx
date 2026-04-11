import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiChevronRight, FiChevronLeft, FiAlertTriangle, FiUser, FiCode, FiFileText } from 'react-icons/fi';

const HackerOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [missingAgreements, setMissingAgreements] = useState([]);
  const [signing, setSigning] = useState(false);
  
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    idDocumentNumber: '',
    bio: '',
    country: '',
    yearsOfExperience: '',
    primarySkills: '',
    certifications: '',
    githubUsername: '',
    linkedinProfile: ''
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
          linkedinProfile: data.data.profile.linkedinProfile || ''
        }));
      }
    } catch (error) {
      toast.error('Failed to load profile status');
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

  const handleSign = async (title) => {
    setSigning(true);
    try {
      await api.post('/hacker-profiles/me/sign-agreement', { agreementTitle: title });
      toast.success(`Successfully signed: ${title}`);
      fetchStatus();
    } catch (error) {
      toast.error('Failed to sign agreement');
    } finally {
      setSigning(false);
    }
  };

  const handleSubmit = async () => {
    // NDA is no longer required at onboarding — only when joining an org project
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        primarySkills: formData.primarySkills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
        status: 'SUBMITTED'
      };

      await api.put('/hacker-profiles/me', payload);
      toast.success('Profile completed successfully!');
      setTimeout(() => {
        // Full page reload will reconstruct auth context and push them to dashboard automatically
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error) {
      toast.error('Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.country || !formData.idDocumentNumber || !formData.bio) {
        toast.error('Please complete all required fields in this step.');
        return;
      }
    } else if (step === 2) {
      if (!formData.yearsOfExperience) {
        toast.error('Please input your years of experience.');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center font-mono text-[#00c477] animate-pulse">
        [SYSTEM]: Fetching profile records...
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <h1 className="text-3xl font-mono font-bold mb-2">Operator Registration</h1>
        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
            <span className={step >= 1 ? "text-[#00c477]" : ""}>1. Identity</span>
            <FiChevronRight />
            <span className={step >= 2 ? "text-[#00c477]" : ""}>2. Experience</span>
            <FiChevronRight />
            <span className={step >= 3 ? "text-[#00c477]" : ""}>3. Compliance</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-[#00c477] transition-all duration-500 ease-out" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-gray-200">
              <FiUser className="text-[#00c477]" /> Primary Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-mono tracking-tighter">ID / Passport Number *</label>
                    <input 
                        name="idDocumentNumber"
                        value={formData.idDocumentNumber}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00c477] transition-colors"
                        placeholder="e.g. A12345678"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-mono tracking-tighter">Country of Residence *</label>
                    <input 
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00c477] transition-colors"
                        placeholder="e.g. Estonia"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-mono tracking-tighter">Mission Profile (Bio) *</label>
                <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00c477] transition-colors resize-none"
                    placeholder="Describe your technical expertise and background..."
                />
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-gray-200">
              <FiCode className="text-[#00c477]" /> Technical Background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-mono tracking-tighter">Years of Experience *</label>
                    <input 
                        name="yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00c477] transition-colors"
                        placeholder="e.g. 3"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-mono tracking-tighter">GitHub Username</label>
                    <input 
                        name="githubUsername"
                        value={formData.githubUsername}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00c477] transition-colors"
                        placeholder="e.g. defsec0"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-mono tracking-tighter">Primary Skills (Comma Separated)</label>
                <input 
                    name="primarySkills"
                    value={formData.primarySkills}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00c477] transition-colors"
                    placeholder="Web App Sec, Reverse Engineering, Exploit Dev..."
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-mono tracking-tighter">Certifications (Comma Separated)</label>
                <input 
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00c477] transition-colors"
                    placeholder="OSCP, CEH, CISSP..."
                />
            </div>
          </div>
        )}

        {/* STEP 3: COMPLIANCE */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-gray-200">
              <FiFileText className="text-[#00c477]" /> Legal Compliance
            </h2>
            
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-sky-400 text-sm font-bold mb-2">
                  <FiFileText /> Legal Compliance Info
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Signing agreements is <span className="text-white font-bold">optional</span> for personal labs and practice. However, when you apply to an organization-hosted security program, the platform will require you to sign the NDA before your application is submitted.
                </p>
            </div>

            <div className="space-y-3">
              {['Mutual Non-Disclosure Agreement (MNDA)', 'Ethical Hacking Code of Conduct'].map(title => {
                const isSigned = !missingAgreements.includes(title);
                return (
                  <div key={title} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${isSigned ? 'bg-[#00c477]/5 border-[#00c477]/20' : 'bg-white/5 border-white/10'}`}>
                    <div>
                        <div className="text-sm font-bold leading-tight mb-1">{title}</div>
                        <span className={`text-[10px] font-mono tracking-tighter uppercase px-2 py-0.5 rounded ${isSigned ? 'bg-[#00c477]/20 text-[#00c477]' : 'bg-gray-800 text-gray-400'}`}>
                          {isSigned ? 'COMPLETED' : 'SIGNATURE REQUIRED'}
                        </span>
                    </div>
                    <div>
                        {isSigned ? (
                            <FiCheckCircle className="text-[#00c477] text-2xl" />
                        ) : (
                            <button 
                                onClick={() => handleSign(title)}
                                disabled={signing}
                                className="px-4 py-2 bg-[#00c477] hover:bg-[#00cc6e] text-black rounded-md text-[10px] font-mono font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                            >
                                {signing ? 'SIGNING...' : 'REVIEW & SIGN'}
                            </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <button 
            onClick={prevStep}
            disabled={step === 1 || submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors disabled:opacity-30"
        >
            <FiChevronLeft /> Back
        </button>
        
        {step < totalSteps ? (
            <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg text-sm font-mono font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/10"
            >
                Continue <FiChevronRight />
            </button>
        ) : (
            <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00c477] text-black rounded-lg text-sm font-mono font-bold uppercase tracking-widest hover:bg-[#00cc6e] transition-all active:scale-95 shadow-lg shadow-[#00c477]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? 'PROCESSING...' : 'COMPLETE ONBOARDING'} <FiCheckCircle />
            </button>
        )}
      </div>

    </div>
  );
};

export default HackerOnboarding;
