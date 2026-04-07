import { Handle, Position } from '@xyflow/react';
import { FiPlay, FiX } from 'react-icons/fi';

const StartingPointNode = ({ data, selected }) => {
  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  return (
    <div className={`bg-[#0b0f19] border ${showPresence ? 'border-[#00ff88]' : 'border-[#00ff88]/50'} rounded-lg shadow-[0_0_15px_rgba(0,255,136,0.4)] w-[300px] font-mono text-sm overflow-hidden transition-all ${selected ? 'ring-2 ring-[#00ff88]' : ''}`}>
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
      {/* Header */}
      <div className="bg-[#0b0f19] border-b border-[#00ff88]/30 p-2 flex justify-between items-center text-[#00ff88]">
        <div className="flex items-center gap-2">
          <FiPlay size={16} />
          <span className="font-bold">Starting Point</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            className="bg-transparent border-none text-right focus:outline-none text-gray-400 text-xs placeholder-gray-600 w-[120px]" 
            placeholder="Scan Title..."
            defaultValue={data.label || ''}
            onBlur={(e) => data.onTitleChange && data.onTitleChange(e.target.value)}
          />
          <button 
            className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            onClick={() => data.onDelete && data.onDelete()}
            title="Delete Node"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[#00ff88] text-xs mb-1">Provide IP/Host address:</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="example.com"
              className="flex-1 bg-[#161a23] border border-gray-600 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-[#00ff88]"
              defaultValue={data.host || ''}
              onChange={(e) => data.onChange && data.onChange(e.target.value)}
            />
            <button className="bg-[#00ff88] text-black px-3 py-1 flex items-center justify-center rounded hover:bg-[#00cc33] transition-colors">
              <FiPlay size={14} />
            </button>
          </div>
          <p className="text-gray-500 text-[10px] mt-1">192.168.1.1 or example.com</p>
        </div>

        {/* Mock Terminal Output */}
        <div className="bg-black border border-[#00ff88]/50 p-2 rounded h-24 overflow-y-auto text-[#00ff88] text-xs">
          <div>[+] Checking target...</div>
          <div>[+] Valid target provided!</div>
          <div>[+] Checking if the target is up...</div>
          <div className="animate-pulse">_</div>
        </div>
      </div>

      {/* Connection Handle (Output only for starting point) */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default StartingPointNode;
