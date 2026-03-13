import React, { useEffect, useState } from 'react';
import { FiX, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import workflowService from '../../../services/workflow.service';

const HistorySidebar = ({ workflowId, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && workflowId) {
      loadHistory();
    }
  }, [isOpen, workflowId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await workflowService.getWorkflowHistory(workflowId);
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-[#0b0f19] border-l border-gray-800 flex flex-col h-full z-30 fixed right-0 top-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#161a23]">
        <div className="flex items-center gap-2 text-[#00a3ff]">
          <FiClock size={18} />
          <h2 className="font-bold font-mono text-sm uppercase tracking-wider">Version History</h2>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-500 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-t-[#00a3ff] border-gray-800 rounded-full animate-spin"></div>
            <span>Scanning archives...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-500 font-mono text-xs py-10 italic">
            No modifications recorded yet.
          </div>
        ) : (
          history.map((record, index) => (
            <div 
              key={record.id} 
              className="group bg-[#161a23] border border-gray-800 rounded-lg p-3 hover:border-[#00ff41]/50 transition-all cursor-pointer relative"
            >
              {/* Timeline Connector */}
              {index !== history.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-[-20px] w-px bg-gray-800 group-hover:bg-[#00ff41]/30"></div>
              )}

              <div className="flex gap-3 relative">
                <div className="mt-1">
                  <div className="w-4 h-4 rounded-full bg-[#00ff41]/20 border border-[#00ff41]/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41]"></div>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="text-[#00ff41] font-mono text-xs font-bold">
                    {record.action.replace(/_/g, ' ')}
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                    <FiUser size={10} />
                    <span>{record.user?.fullName || 'Agent X'}</span>
                  </div>

                  {record.details && record.details.nodesCount !== undefined && (
                    <div className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                      <FiActivity size={10} />
                      {record.details.nodesCount} nodes, {record.details.edgesCount} edges
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Snapshot Action */}
      <div className="p-4 border-t border-gray-800 bg-[#07090e]">
        <button className="w-full py-2 bg-[#161a23] border border-[#00ff41]/30 text-[#00ff41] font-mono text-[11px] font-bold rounded hover:bg-[#00ff41]/10 transition-all flex items-center justify-center gap-2">
          <span>💾</span>
          CREATE CHECKPOINT
        </button>
      </div>
    </div>
  );
};

export default HistorySidebar;
