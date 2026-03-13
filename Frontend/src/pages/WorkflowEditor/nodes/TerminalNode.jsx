import { Handle, Position } from '@xyflow/react';
import { FiTerminal, FiX } from 'react-icons/fi';

const TerminalNode = ({ data, selected }) => {
  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[320px] font-mono text-sm transition-all ${selected ? 'border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.6)]' : 'border-[#ffb000]/50 shadow-[0_0_10px_rgba(255,176,0,0.3)]'}`}>
      <div className="p-2 flex justify-between items-center text-[#ffb000] border-b border-[#ffb000]/30 bg-[#161a23] rounded-t-lg">
        <div className="flex items-center gap-2 flex-1">
          <FiTerminal size={16} />
          <input 
            className="bg-transparent border-none font-bold focus:outline-none w-full text-[#ffb000] placeholder-[#ffb000]/50" 
            defaultValue={data.label || 'Terminal'}
            onBlur={(e) => data.onTitleChange && data.onTitleChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
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
