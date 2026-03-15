import { Handle, Position } from '@xyflow/react';
import { FiTerminal, FiX } from 'react-icons/fi';

const TerminalNode = ({ data, selected }) => {
  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[320px] font-mono text-sm transition-all relative ${selected || showPresence ? 'border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.6)]' : 'border-[#ffb000]/50 shadow-[0_0_10px_rgba(255,176,0,0.3)]'}`}>
      {/* Presence Indicators (Figma Style) */}
      {showPresence && (
        <div className="absolute -top-6 right-0 flex -space-x-2">
          {activeUsers.map((u, i) => (
            <div 
              key={i} 
              className="w-5 h-5 rounded-full border-2 border-[#0b0f19] flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-bounce"
              style={{ backgroundColor: u.color || '#ffb000' }}
              title={u.user}
            >
              {u.user?.[0] || 'U'}
            </div>
          ))}
        </div>
      )}
      <div className="p-2 flex justify-between items-center text-[#ffb000] border-b border-[#ffb000]/30 bg-[#161a23] rounded-t-lg">
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

      <div className="p-3">
        <div className="w-full h-24 bg-black border border-[#ffb000]/30 text-[#ffb000] p-2 rounded overflow-y-auto font-mono text-xs">
           <div className="animate-pulse">_</div>
           {/* Mock Terminal Output */}
           {data.output?.map((line, i) => (
             <div key={i}>{line}</div>
           ))}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#ffb000] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#ffb000] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default TerminalNode;
