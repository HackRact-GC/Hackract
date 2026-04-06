import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FiActivity, FiUser, FiClock, FiPlusCircle, FiCheckCircle } from "react-icons/fi";

const ProjectActivity = ({ projectId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}/activity`);
        setLogs(data?.data || []);
      } catch (error) {
        console.error("Failed to fetch project activity");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchActivity();
  }, [projectId]);

  const getActionIcon = (action) => {
    switch (action) {
      case "PROJECT_CREATED": return <FiPlusCircle className="text-sky-400" />;
      case "HACKER_HIRED": return <FiUser className="text-[#00ff88]" />;
      case "FINDING_CREATED": return <FiActivity className="text-amber-500" />;
      case "PROJECT_KICKOFF": return <FiCheckCircle className="text-emerald-500" />;
      default: return <FiActivity className="text-gray-400" />;
    }
  };

  const formatAction = (log) => {
    const { action, user, details } = log;
    const userName = user?.fullName || "System";
    
    switch (action) {
      case "PROJECT_CREATED": return <span>{userName} initialized the project workspace.</span>;
      case "HACKER_HIRED": return <span>{userName} hired a new operator.</span>;
      case "FINDING_CREATED": return <span>{userName} reported a new vulnerability finding.</span>;
      case "PROJECT_KICKOFF": return <span>{userName} completed the kickoff checklist.</span>;
      default: return <span>{userName} performed: {action.toLowerCase().replace(/_/g, " ")}.</span>;
    }
  };

  if (loading) return <div className="text-xs font-mono text-gray-500 animate-pulse">SYNCING ACTIVITY LOG...</div>;

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <div className="text-xs font-mono text-gray-500 italic">No activity recorded for this engagement.</div>
      ) : (
        <div className="relative border-l border-white/10 ml-2 space-y-6 pb-2">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-black border border-white/20" />
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getActionIcon(log.action)}</div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-300">
                    {formatAction(log)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <FiClock /> {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectActivity;
