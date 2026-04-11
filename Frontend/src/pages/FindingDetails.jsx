import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiMessageSquare, FiSend, FiCheckCircle, FiAlertCircle, FiClock, FiShield, FiXCircle } from "react-icons/fi";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext.jsx";

const FindingDetails = () => {
  const { findingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [finding, setFinding] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        api.get(`/findings/${findingId}`),
        api.get(`/findings/${findingId}/comments`)
      ]);
      setFinding(fRes.data);
      setComments(cRes.data.data);
    } catch (error) {
      toast.error("Failed to load finding details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [findingId]);

  const canManage = useMemo(() => {
    return user?.roles?.some(r => r.type === "SUPER_ADMIN" || r.type === "ORG_ADMIN");
  }, [user]);

  const handleStatusChange = async (action, body = {}) => {
    try {
      await api.post(`/findings/${findingId}/${action}`, body);
      toast.success("Finding status updated");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Update failed");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/findings/${findingId}/comments`, { content: newComment });
      setNewComment("");
      loadData();
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10 font-mono text-[10px] animate-pulse uppercase tracking-[0.3em] flex items-center justify-center">Initializing finding telemetry...</div>;
  if (!finding) return <div className="min-h-screen bg-black p-10 flex items-center justify-center font-mono uppercase tracking-widest text-xs text-white/40">Sector Data Corrupted: Finding not found.</div>;

  const statusColors = {
    OPEN: "text-[#00c477] border-[#00c477]/30 bg-[#00c477]/5",
    TRIAGED: "text-[#00c477] border-[#00c477]/40 bg-[#00c477]/10",
    FIXED: "text-white/60 border-white/10 bg-white/5",
    PENDING_RETEST: "text-[#00c477] border-[#00c477]/50 bg-[#00c477]/15",
    VALIDATED: "text-[#00c477] border-[#00c477] bg-[#00c477]/20 shadow-[0_0_15px_rgba(0,255,136,0.3)]",
    REOPENED: "text-red-500 border-red-500/30 bg-red-500/10",
    ACCEPTED_RISK: "text-white/20 border-white/5 bg-white/5",
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-10 max-w-6xl mx-auto font-sans selection:bg-[#00c477]/30 selection:text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs uppercase tracking-widest font-mono"
        >
          <FiChevronLeft /> Back
        </button>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${statusColors[finding.status]}`}>
          {finding.status}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{finding.title}</h1>
            <div className="flex items-center gap-4 text-xs font-mono text-gray-500 uppercase">
              <span>Severity: <span className="text-white">{finding.severity}</span></span>
              <span>Project: <span className="text-white">{finding.pentest?.name}</span></span>
            </div>
          </div>

          {/* Details Sections */}
          <div className="grid gap-6">
            <div className="bg-black/60 border border-white/10 rounded-2xl p-8 space-y-4 backdrop-blur-md">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                <FiAlertCircle size={14} className="text-[#00c477]" /> Vulnerability parameters
              </h3>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-medium">{finding.description || "No description provided."}</p>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-2xl p-8 space-y-4 backdrop-blur-md">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                <FiShield size={14} className="text-[#00c477]" /> Proposed Remediation
              </h3>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-medium">{finding.remediation || "No remediation steps provided."}</p>
            </div>

            {finding.proof && (
               <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FiClock size={14} /> Evidence / Proof
                </h3>
                <div className="bg-black/50 p-4 rounded border border-white/5 font-mono text-xs text-[#00c477] overflow-x-auto">
                  {finding.proof}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 tracking-tight">
              <FiMessageSquare size={20} className="text-[#00c477]" /> Intelligence Discussion
            </h3>
            
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-5">
                  <div className="h-10 w-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-xs font-bold text-[#00c477] shadow-inner shrink-0">
                    {comment.user?.fullName?.[0] || "?"}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest truncate">{comment.user?.fullName} <span className="font-mono text-[9px] opacity-30 ml-2">AGENT_REF: {comment.user?.handle}</span></span>
                      <span className="text-[9px] text-white/30 font-mono flex items-center gap-2"><FiClock size={10} /> {new Date(comment.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed font-medium">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="relative mt-10 group">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a security update or remediation note..."
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-[#00c477]/50 h-32 resize-none transition-all placeholder:text-white/20"
              />
              <button 
                type="submit"
                className="absolute bottom-6 right-6 px-6 py-2.5 bg-[#00c477] text-black rounded-xl hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#00c477]/10"
              >
                Send Intelligence <FiSend size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar / Triage Controls */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6 sticky top-10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Triage Controls</h3>
            
            <div className="space-y-3">
              {/* Org Admin Controls */}
              {canManage && (
                <>
                  {finding.status === "OPEN" && (
                    <button 
                      onClick={() => handleStatusChange("triage", { status: "TRIAGED" })}
                      className="w-full py-4 bg-[#00c477] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-[#00c477]/10 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <FiCheckCircle size={16} /> Confirm Intelligence
                    </button>
                  )}
                  
                  {finding.status === "OPEN" && (
                    <button 
                      onClick={() => handleStatusChange("triage", { status: "ACCEPTED_RISK" })}
                      className="w-full py-4 bg-white/5 text-white/40 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-white/20 transition-all"
                    >
                      Accept Risk Exposure
                    </button>
                  )}

                  {finding.status === "FIXED" && (
                    <button 
                      onClick={() => handleStatusChange("request-retest")}
                      className="w-full py-4 bg-[#00c477]/10 text-[#00c477] border border-[#00c477]/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00c477] hover:text-black transition-all"
                    >
                      Request Final Validation
                    </button>
                  )}

                  {finding.status === "PENDING_RETEST" && (
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleStatusChange("validate", { success: true })}
                          className="py-4 bg-[#00c477] text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#00c477]/10 hover:scale-[1.05] transition-all"
                        >
                          Validate
                        </button>
                        <button 
                          onClick={() => handleStatusChange("validate", { success: false })}
                          className="py-4 bg-red-500/20 text-red-500 border border-red-500/30 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                        >
                          Reopen
                        </button>
                     </div>
                  )}
                </>
              )}

              {/* Hacker Controls */}
              {!canManage && finding.status === "TRIAGED" && (
                 <button 
                   onClick={() => api.patch(`/findings/${findingId}`, { status: "FIXED" }).then(() => loadData())}
                   className="w-full py-4 bg-white/10 text-white hover:bg-[#00c477] hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                 >
                   Mark as Resolved
                 </button>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">History</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-1.5 h-1.5 bg-[#00c477] rounded-full" />
                  <div className="flex-1">
                    <p className="text-gray-300">Finding reported</p>
                    <p className="text-[9px] text-gray-500">{new Date(finding.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindingDetails;
