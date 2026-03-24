import { Handle, Position } from '@xyflow/react';
import { FiFileText, FiX, FiLink, FiAlertCircle } from 'react-icons/fi';

const NoteNode = ({ data, selected }) => {
  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[260px] font-mono text-sm transition-all relative ${selected || showPresence ? 'border-[#ff7a00] shadow-[0_0_20px_rgba(255,122,0,0.6)]' : 'border-[#ff7a00]/50 shadow-[0_0_10px_rgba(255,122,0,0.3)]'}`}>
      {/* Presence Indicators (Figma Style) */}
      {showPresence && (
        <div className="absolute -top-6 right-0 flex -space-x-2">
          {activeUsers.map((u, i) => (
            <div 
              key={i} 
              className="w-5 h-5 rounded-full border-2 border-[#0b0f19] flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-bounce"
              style={{ backgroundColor: u.color || '#ff7a00' }}
              title={u.user}
            >
              {u.user?.[0] || 'U'}
            </div>
          ))}
        </div>
      )}
      {/* Header */}
      <div className="p-2 flex justify-between items-center text-[#ff7a00] border-b border-[#ff7a00]/30">
        <div className="flex items-center gap-2">
          <FiFileText size={16} />
          <span className="font-bold text-xs uppercase tracking-tighter">Research Note</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            className="bg-transparent border-none text-right focus:outline-none text-gray-500 text-xs placeholder-gray-700 w-[100px]" 
            placeholder="Title..."
            defaultValue={data.label || ''}
            onBlur={(e) => data.onTitleChange && data.onTitleChange(e.target.value)}
          />
          <button 
            className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            onClick={() => data.onDelete && data.onDelete()}
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        <textarea 
          className="w-full h-24 bg-black border border-gray-800 text-gray-300 p-2 rounded resize-none focus:outline-none focus:border-[#ff7a00]/50"
          placeholder="taking note about what i am doing"
          defaultValue={data.text || ''}
          onChange={data.onChange}
        />

        {/* Finding Linkage UI */}
        <div className="pt-2 border-t border-[#ff7a00]/20 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <FiLink size={10} />
              <span>Linked Finding</span>
            </div>
          </div>
          
          <select 
            className="w-full bg-black/50 border border-gray-800 text-[10px] p-1.5 rounded focus:outline-none text-gray-400"
            value={data.findingId || ''}
            onChange={(e) => data.onLinkFinding && data.onLinkFinding(e.target.value)}
          >
            <option value="">None</option>
            {data.findings?.map(f => (
              <option key={f.id} value={f.id}>[{f.severity}] {f.title}</option>
            ))}
          </select>

          {data.findingId && (
            <div className="flex items-center gap-2 p-1.5 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded text-[9px] text-[#00ff88] animate-pulse">
              <FiAlertCircle size={10} />
              <span className="truncate">Active Vulnerability Linked</span>
            </div>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#ff7a00] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#ff7a00] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default NoteNode;
