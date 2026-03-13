import { Handle, Position } from '@xyflow/react';
import { FiFileText, FiX } from 'react-icons/fi';

const NoteNode = ({ data, selected }) => {
  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[260px] font-mono text-sm transition-all ${selected ? 'border-[#ff7a00] shadow-[0_0_20px_rgba(255,122,0,0.6)]' : 'border-[#ff7a00]/50 shadow-[0_0_10px_rgba(255,122,0,0.3)]'}`}>
      {/* Header */}
      <div className="p-2 flex justify-between items-center text-[#ff7a00] border-b border-[#ff7a00]/30">
        <div className="flex items-center gap-2 flex-1">
          <FiFileText size={16} />
          <input 
            className="bg-transparent border-none font-bold focus:outline-none w-full text-[#ff7a00] placeholder-[#ff7a00]/50" 
            defaultValue={data.label || 'Note'}
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

      {/* Body */}
      <div className="p-3">
        <textarea 
          className="w-full h-24 bg-black border border-gray-800 text-gray-300 p-2 rounded resize-none focus:outline-none focus:border-[#ff7a00]/50"
          placeholder="taking note about what i am doing"
          defaultValue={data.text || ''}
          onChange={data.onChange}
        />
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#ff7a00] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#ff7a00] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default NoteNode;
