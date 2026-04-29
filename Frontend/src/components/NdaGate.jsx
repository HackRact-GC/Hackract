import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiCheckCircle, FiFileText, FiLock, FiAlertTriangle, FiClock } from "react-icons/fi";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";

/**
 * NdaGate
 * Wraps children and renders a full-screen NDA signing screen if the
 * current hacker has not yet signed the active platform NDA.
 *
 * Props:
 *   projectId   – the project being accessed
 *   children    – the workspace content rendered after signing
 */
const NdaGate = ({ projectId, children }) => {
  const [status, setStatus] = useState(null);   // null = loading
  const [signing, setSigning]   = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/nda-status`);
      setStatus(data.data);
    } catch {
      // On error allow access — don't block users due to infra issues
      setStatus({ required: false, signed: true });
    }
  };

  useEffect(() => {
    if (projectId) fetchStatus();
  }, [projectId]);

  const handleSign = async () => {
    if (!acknowledged) {
      toast.error("Please read and acknowledge the agreement first.");
      return;
    }
    setSigning(true);
    try {
      await api.post(`/projects/${projectId}/sign-nda`, {
        agreementId: status.agreement.id,
      });
      toast.success("NDA signed — workspace access granted.");
      setStatus(prev => ({ ...prev, signed: true }));
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to sign the NDA.");
    } finally {
      setSigning(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────
  if (!status) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[#00c477] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono animate-pulse">Verifying Authorization</p>
        </div>
      </div>
    );
  }

  // ─── Access granted (NDA not required OR already signed) ─────────────
  if (!status.required || status.signed) {
    return <>{children}</>;
  }

  // ─── NDA Gate ─────────────────────────────────────────────────────────
  const { agreement } = status;

  return (
    <div className="min-h-screen bg-black text-white/80 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00c477]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-[#00c477] shadow-inner font-black">
            <FiShield size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white italic">Legal Authorization Required</h1>
            <p className="text-sm text-white/40 mt-1 uppercase tracking-widest font-mono text-[10px]">
              Secure Sector Protocol initialization in progress.
            </p>
          </div>
        </div>

        {/* Agreement card */}
        <div className="bg-black/60 border border-white/10 rounded-4xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Agreement header */}
          <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <FiFileText className="text-[#00c477]" size={18} />
              <div>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">{agreement.title}</p>
                <p className="text-[9px] text-white/30 font-mono mt-0.5 tracking-widest">MD-VERSION {agreement.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#00c477]/10 border border-[#00c477]/20 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 bg-[#00c477] rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-[#00c477] uppercase tracking-widest">Awaiting Signature</span>
            </div>
          </div>

          {/* Agreement content — scrollable */}
          <div
            className="p-8 max-h-80 overflow-y-auto text-sm text-white/60 leading-relaxed space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar"
            onScroll={(e) => {
              const el = e.target;
              if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
                setScrolled(true);
              }
            }}
          >
            {agreement.content.split("\n").map((line, i) =>
              line.trim() ? <p key={i}>{line}</p> : <br key={i} />
            )}

            {!scrolled && (
              <div className="sticky bottom-0 left-0 right-0 h-12 bg-linear-to-t from-black to-transparent flex items-end justify-center pb-1 pointer-events-none">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 animate-bounce">
                  <FiClock size={10} /> Scroll to read full dossier
                </span>
              </div>
            )}
          </div>

          {/* Acknowledgment checkbox */}
          <div className="px-8 py-5 border-t border-white/10 bg-white/5">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div
                onClick={() => setAcknowledged(v => !v)}
                className={`mt-0.5 w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                  acknowledged
                    ? "bg-[#00c477] border-[#00c477] shadow-[0_0_16px_rgba(0,255,136,0.3)]"
                    : "border-white/10 group-hover:border-white/30"
                }`}
              >
                <AnimatePresence>
                  {acknowledged && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <FiCheckCircle size={14} className="text-black" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed group-hover:text-white/80 transition-colors select-none font-medium">
                I have read and fully understand the terms of this Non-Disclosure Agreement. I agree to be legally bound by its provisions, including confidentiality obligations regarding all information shared within this engagement.
              </p>
            </label>
          </div>
        </div>

        {/* Action row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/20 text-[9px] font-mono uppercase tracking-widest">
            <FiLock size={12} className="text-[#00c477]/40" />
            <span>Cryptographic timestamp logged via Secure Ledger</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSign}
            disabled={signing || !acknowledged}
            className={`group flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${
              acknowledged && !signing
                ? "bg-[#00c477] text-black hover:scale-105 shadow-[#00c477]/20 cursor-pointer"
                : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
            }`}
          >
            {signing ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Execute Agreement <FiZap className="ml-1" />
              </>
            )}
          </motion.button>
        </div>

        {/* Meta */}
        <p className="text-center text-[9px] font-mono text-white/10 mt-10 uppercase tracking-[0.15em]">
          Electronic signature authorized under sector mandate 4-0-C
        </p>
      </motion.div>
    </div>
  );
};

export default NdaGate;
