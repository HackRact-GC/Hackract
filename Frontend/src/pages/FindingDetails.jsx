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

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white p-10 font-mono text-xs animate-pulse">Initializing finding view...</div>;
  if (!finding) return <div className="min-h-screen bg-[#0a0a0a] text-white p-10">Finding not found.</div>;

  const statusColors = {
    OPEN: "text-sky-400 border-sky-400/30 bg-sky-400/10",
    TRIAGED: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    FIXED: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    PENDING_RETEST: "text-pink-400 border-pink-400/30 bg-pink-400/10",
    VALIDATED: "text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10",
    REOPENED: "text-red-400 border-red-400/30 bg-red-400/10",
    ACCEPTED_RISK: "text-gray-400 border-gray-400/30 bg-gray-400/10",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
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
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <FiAlertCircle size={14} /> Description
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{finding.description || "No description provided."}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <FiShield size={14} /> Remediation
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{finding.remediation || "No remediation steps provided."}</p>
            </div>

            {finding.proof && (
               <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FiClock size={14} /> Evidence / Proof
                </h3>
                <div className="bg-black/50 p-4 rounded border border-white/5 font-mono text-xs text-[#00ff88] overflow-x-auto">
                  {finding.proof}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FiMessageSquare size={20} /> Discussion Threads
            </h3>
            
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#00ff88]">
                    {comment.user?.fullName?.[0] || "?"}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">{comment.user?.fullName} <span className="font-normal opacity-50">@{comment.user?.handle}</span></span>
                      <span className="text-[10px] text-gray-600 font-mono">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="relative mt-6">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a security update or remediation note..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#00ff88]/50 h-24 resize-none"
              />
              <button 
                type="submit"
                className="absolute bottom-4 right-4 p-2 bg-[#00ff88] text-black rounded-lg hover:scale-105 transition-all"
              >
                <FiSend size={18} />
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
                      className="w-full py-3 bg-purple-500 text-black rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Confirm Vulnerability
                    </button>
                  )}
                  
                  {finding.status === "OPEN" && (
                    <button 
                      onClick={() => handleStatusChange("triage", { status: "ACCEPTED_RISK" })}
                      className="w-full py-3 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg font-bold text-xs uppercase tracking-widest"
                    >
                      Accept Risk
                    </button>
                  )}

                  {finding.status === "FIXED" && (
                    <button 
                      onClick={() => handleStatusChange("request-retest")}
                      className="w-full py-3 bg-pink-500 text-black rounded-lg font-bold text-xs uppercase tracking-widest"
                    >
                      Request Formal Retest
                    </button>
                  )}

                  {finding.status === "PENDING_RETEST" && (
                     <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleStatusChange("validate", { success: true })}
                          className="py-3 bg-[#00ff88] text-black rounded-lg font-bold text-[10px] uppercase tracking-widest"
                        >
                          Validate
                        </button>
                        <button 
                          onClick={() => handleStatusChange("validate", { success: false })}
                          className="py-3 bg-red-500 text-black rounded-lg font-bold text-[10px] uppercase tracking-widest"
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
                   className="w-full py-3 bg-amber-400 text-black rounded-lg font-bold text-xs uppercase tracking-widest"
                 >
                   Mark as Fixed
                 </button>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">History</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
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
