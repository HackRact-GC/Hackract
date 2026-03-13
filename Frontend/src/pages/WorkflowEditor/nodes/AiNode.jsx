import { Handle, Position } from '@xyflow/react';
import { FiCpu, FiX } from 'react-icons/fi';

const AiNode = ({ data, selected }) => {
  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[280px] font-mono text-sm transition-all ${selected ? 'border-[#00a3ff] shadow-[0_0_20px_rgba(0,163,255,0.6)]' : 'border-[#00a3ff]/50 shadow-[0_0_10px_rgba(0,163,255,0.3)]'}`}>
      <div className="p-2 flex justify-between items-center text-[#00a3ff] border-b border-[#00a3ff]/30">
        <div className="flex items-center gap-2">
          <FiCpu size={16} />
          <span className="font-bold text-xs uppercase tracking-tighter">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            className="bg-transparent border-none text-right focus:outline-none text-gray-500 text-xs placeholder-gray-700 w-[100px]" 
            placeholder="Task name..."
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
        <div className="relative">
          <textarea 
            className="w-full h-20 bg-black border border-gray-800 text-gray-300 p-2 rounded resize-none focus:outline-none focus:border-[#00a3ff]/50"
            placeholder="ask something..."
            defaultValue={data.prompt || ''}
            onChange={data.onChange}
          />
          <button className="absolute bottom-2 right-2 text-[#00a3ff] hover:text-white transition-colors">
            ➤
          </button>
        </div>
        
        <button className="bg-transparent border border-[#00a3ff]/50 text-[#00a3ff] text-xs px-3 py-1 rounded hover:bg-[#00a3ff]/10 w-[120px]">
          Generate Report
        </button>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#00a3ff] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#00a3ff] border-2 border-[#0b0f19]" />
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3 bg-[#00a3ff] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default AiNode;
