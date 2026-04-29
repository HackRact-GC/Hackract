import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, FiDownload, FiCheck, FiX, 
  FiActivity, FiShield, FiLock, FiCpu, FiAlertCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';

const OrganizationLegal = () => {
  const api = useApi();
  const [agreementSigned, setAgreementSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Digital Signature Pad Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;

    const startDrawing = (e) => {
      drawing = true;
      draw(e);
    };

    const stopDrawing = () => {
      drawing = false;
      ctx.beginPath();
    };

    const draw = (e) => {
      if (!drawing) return;
      setHasDrawn(true);
      
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#00ff88';

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });

    // Draw grid pattern on initialization
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let j = 0; j < canvas.height; j += 20) {
      ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
    }
    ctx.stroke();
    ctx.beginPath();

    setIsReady(true);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousemove', draw);
    };
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let j = 0; j < canvas.height; j += 20) {
      ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
    }
    ctx.stroke();
    setHasDrawn(false);
  };

  const handleSignSubmit = async () => {
    if (!agreementSigned || !hasDrawn) {
      toast.error("Please read the agreement and sign first.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Mocking submission for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Master Services Agreement executed successfully.");
    } catch (error) {
      toast.error("Failed to submit agreement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#050505] text-[#e0e0e0] font-mono selection:bg-[#00ff88]/30 selection:text-white">
      
      {/* Top Header Placeholder (to match mockup) */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 opacity-50">
        <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase">
          <FiFileText className="text-[#00ff88]" />
          <span>SERVICE_LEVEL_AGREEMENT_V4.PDF</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-md text-[10px] tracking-widest hover:bg-white/10 transition-all">
          <FiDownload /> DOWNLOAD AGREEMENT
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5 overflow-hidden">
        
        {/* LEFT PANE: Agreement Content */}
        <div className="flex-1 overflow-y-auto p-12 lg:p-16 custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-white">
                HACKRACT MASTER SERVICES AGREEMENT
              </h1>
              <div className="flex items-center gap-4 text-[11px] text-[#00ff88] tracking-widest font-bold">
                <span>EFFECTIVE DATE: OCTOBER 24, 2023</span>
                <span className="w-1 h-1 bg-[#00ff88] rounded-full" />
                <span>VERSION 4.0.2</span>
              </div>
            </div>

            <section className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-3">
                  <span className="text-[#00ff88]">1.</span> SCOPE OF AI SERVICES
                </h2>
                <p className="text-sm leading-relaxed text-gray-400">
                  This Master Services Agreement ("Agreement") governs the utilization of the Hackract Synthetic Sentinel AI Engine. The User acknowledges that the AI Agent functions as an autonomous vulnerability detection system operating under strict ethical hacking protocols defined in the Project Scope.
                </p>
                <p className="text-sm leading-relaxed text-gray-400">
                  The "Synthetic Sentinel" refers to the proprietary neural network architecture utilized for continuous perimeter monitoring and threat neutralization within the User's digital ecosystem.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-3">
                  <span className="text-[#00ff88]">2.</span> DATA SOVEREIGNTY & PRIVACY
                </h2>
                <p className="text-sm leading-relaxed text-gray-400">
                  Hackract maintains a zero-knowledge architecture. All cryptographic keys and system logs generated by the AI Agent are encrypted at rest using AES-256-GCM. Hackract shall not have access to the clear-text content of user data unless explicitly authorized through a secondary "Break-Glass" protocol.
                </p>
                <p className="text-sm leading-relaxed text-gray-400">
                  User retains all rights, title, and interest in and to all data provided to the AI services. Hackract is granted a limited, non-exclusive license to process such data solely for the purpose of identifying security vulnerabilities.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-3">
                  <span className="text-[#00ff88]">3.</span> LIABILITY & INDEMNIFICATION
                </h2>
                <p className="text-sm leading-relaxed text-gray-400">
                  User acknowledges that automated security scanning carries inherent risks of service interruption. Hackract provides services on an "as-is" basis and disclaims all warranties, express or implied, including fitness for a particular purpose.
                </p>
              </div>
            </section>
          </motion.div>
        </div>

        {/* RIGHT PANE: Execution & Signature */}
        <div className="w-full lg:w-[480px] bg-[#080808] p-12 flex flex-col justify-between">
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Execute Agreement</h2>
              <p className="text-[10px] text-gray-500 tracking-[0.2em] font-bold uppercase">Verification Phase: Final Authorization</p>
            </div>

            {/* Signature Pad */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none z-10">
                  <FiActivity className="text-[#00ff88] text-xs animate-pulse" />
                  <span className="text-[9px] text-gray-600 tracking-widest uppercase">AUTH_TOKEN: #8892-SEC</span>
                </div>
                
                <canvas 
                  ref={canvasRef}
                  width={384}
                  height={220}
                  className="w-full bg-[#0c0c0c] border border-white/5 rounded-xl cursor-crosshair hover:border-[#00ff88]/30 transition-colors"
                />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 transition-opacity duration-500 group-hover:opacity-10">
                  <span className="text-2xl font-serif italic text-gray-400">Sign here</span>
                </div>

                <div className="absolute bottom-4 right-4 text-[8px] text-gray-600 tracking-widest font-black uppercase flex items-center gap-2">
                  <FiShield className="text-[#00ff88]" />
                  DIGITAL SIGNATURE VERIFIED
                </div>

                <button 
                  onClick={clearSignature}
                  className="absolute bottom-4 left-4 p-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all text-[9px] font-black tracking-widest uppercase flex items-center gap-2"
                >
                  <FiX /> CLEAR
                </button>
              </div>
            </div>

            {/* Acceptance Checkbox */}
            <div 
              className="flex gap-4 cursor-pointer group p-4 rounded-xl hover:bg-white/[0.02] transition-all"
              onClick={() => setAgreementSigned(!agreementSigned)}
            >
              <div className={`w-5 h-5 rounded border ${agreementSigned ? 'bg-[#00ff88] border-[#00ff88]' : 'border-white/10 group-hover:border-[#00ff88]'} flex-shrink-0 flex items-center justify-center transition-all`}>
                {agreementSigned && <FiCheck className="text-black text-sm stroke-[3]" />}
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500 group-hover:text-gray-300 transition-colors">
                I have read and agree to the terms of the Master Services Agreement. I authorize the activation of the <span className="text-[#00ff88] font-bold">Hackract AI Agent</span> within my environment.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleSignSubmit}
              disabled={!agreementSigned || !hasDrawn || isSubmitting}
              className={`w-full py-5 rounded-xl text-xs font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 ${
                agreementSigned && hasDrawn && !isSubmitting
                  ? 'bg-[#00ff88] text-black shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <FiLock className="animate-spin text-lg" />
              ) : (
                <>SIGN & SUBMIT</>
              )}
            </button>
            <div className="text-center opacity-30 text-[9px] tracking-[0.2em] font-black text-gray-500">
              TRANSACTION ID: 0XB2F8...A109
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 136, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 136, 0.3);
        }
      `}</style>
    </div>
  );
};

export default OrganizationLegal;
