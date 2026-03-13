import { Handle, Position } from '@xyflow/react';
import { FiPlay, FiX } from 'react-icons/fi';

const StartingPointNode = ({ data }) => {
  return (
    <div className="bg-[#0b0f19] border border-[#00ff41] rounded-lg shadow-[0_0_15px_rgba(0,255,65,0.4)] w-[300px] font-mono text-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#0b0f19] border-b border-[#00ff41]/30 p-2 flex justify-between items-center text-[#00ff41]">
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
          <label className="block text-[#00ff41] text-xs mb-1">Provide IP/Host address:</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="example.com"
              className="flex-1 bg-[#161a23] border border-gray-600 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-[#00ff41]"
              defaultValue={data.host || ''}
              onChange={(e) => data.onChange && data.onChange(e.target.value)}
            />
            <button className="bg-[#00ff41] text-black px-3 py-1 flex items-center justify-center rounded hover:bg-[#00cc33] transition-colors">
              <FiPlay size={14} />
            </button>
          </div>
          <p className="text-gray-500 text-[10px] mt-1">192.168.1.1 or example.com</p>
        </div>

        {/* Mock Terminal Output */}
        <div className="bg-black border border-[#00ff41]/50 p-2 rounded h-24 overflow-y-auto text-[#00ff41] text-xs">
          <div>[+] Checking target...</div>
          <div>[+] Valid target provided!</div>
          <div>[+] Checking if the target is up...</div>
          <div className="animate-pulse">_</div>
        </div>
      </div>

      {/* Connection Handle (Output only for starting point) */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#00ff41] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default StartingPointNode;
