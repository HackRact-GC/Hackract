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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-[0.3em] font-mono animate-pulse">Verifying Authorization</p>
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
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <FiShield size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Legal Authorization Required</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              You must sign the NDA before accessing this secure workspace.
            </p>
          </div>
        </div>

        {/* Agreement card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Agreement header */}
          <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-3">
              <FiFileText className="text-cyan-400" size={18} />
              <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">{agreement.title}</p>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">Version {agreement.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <FiAlertTriangle size={12} className="text-amber-400" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Signature Required</span>
            </div>
          </div>

          {/* Agreement content — scrollable */}
          <div
            className="p-8 max-h-80 overflow-y-auto text-sm text-slate-400 leading-relaxed space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent custom-scrollbar"
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
              <div className="sticky bottom-0 left-0 right-0 h-12 bg-linear-to-t from-slate-900 to-transparent flex items-end justify-center pb-1 pointer-events-none">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2 animate-bounce">
                  <FiClock size={10} /> Scroll to read
                </span>
              </div>
            )}
          </div>

          {/* Acknowledgment checkbox */}
          <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/50">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div
                onClick={() => setAcknowledged(v => !v)}
                className={`mt-0.5 w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                  acknowledged
                    ? "bg-cyan-600 border-cyan-600 shadow-[0_0_16px_rgba(6,182,212,0.4)]"
                    : "border-slate-700 group-hover:border-slate-500"
                }`}
              >
                <AnimatePresence>
                  {acknowledged && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <FiCheckCircle size={14} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors select-none">
                I have read and fully understand the terms of this Non-Disclosure Agreement. I agree to be legally bound by its provisions, including confidentiality obligations regarding all information shared within this engagement.
              </p>
            </label>
          </div>
        </div>

        {/* Action row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-mono">
            <FiLock size={12} />
            <span>Your signature is cryptographically logged with IP and timestamp.</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSign}
            disabled={signing || !acknowledged}
            className={`group flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
              acknowledged && !signing
                ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-900/40 cursor-pointer"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            {signing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Submitting Signature…
              </>
            ) : (
              <>
                <FiCheckCircle size={16} />
                I Agree &amp; Sign NDA
              </>
            )}
          </motion.button>
        </div>

        {/* Meta */}
        <p className="text-center text-[10px] font-mono text-slate-700 mt-6">
          This digital signature is legally equivalent to a handwritten signature under applicable e-signature laws.
        </p>
      </motion.div>
    </div>
  );
};

export default NdaGate;
