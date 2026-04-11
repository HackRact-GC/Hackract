import { Handle, Position } from '@xyflow/react';
import { FiTerminal, FiX, FiLink, FiAlertCircle } from 'react-icons/fi';

const TerminalNode = ({ data, selected }) => {
  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[320px] font-mono text-sm transition-all relative ${selected || showPresence ? 'border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.6)]' : 'border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.3)]'}`}>
      {/* Presence Indicators (Figma Style) */}
      {showPresence && (
        <div className="absolute -top-6 right-0 flex -space-x-2">
          {activeUsers.map((u, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2 border-[#0b0f19] flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-bounce"
              style={{ backgroundColor: u.color || '#00ff88' }}
              title={u.user}
            >
              {u.user?.[0] || 'U'}
            </div>
          ))}
        </div>
      )}
      <div className="p-2 flex justify-between items-center text-[#00ff88] border-b border-[#00ff88]/30 bg-[#161a23] rounded-t-lg">
        <div className="flex items-center gap-2">
          <FiTerminal size={16} />
          <span className="font-bold text-xs uppercase tracking-tighter">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="bg-transparent border-none text-right focus:outline-none text-gray-500 text-xs placeholder-gray-700 w-[120px]"
            placeholder="Process title..."
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

      <div className="p-3 space-y-3">
        <div className="w-full h-24 bg-black border border-[#00ff88]/30 text-[#00ff88] p-2 rounded overflow-y-auto font-mono text-xs">
           <div className="animate-pulse">_</div>
           {/* Mock Terminal Output */}
           {data.output?.map((line, i) => (
             <div key={i}>{line}</div>
           ))}
        </div>

        {/* Finding Linkage UI */}
        <div className="pt-2 border-t border-[#00ff88]/20 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <FiLink size={10} />
              <span>Evidence Link</span>
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
              <span className="truncate">Terminal Output Linked to Finding</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default TerminalNode;
