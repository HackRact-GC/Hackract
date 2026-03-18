import { Handle, Position } from '@xyflow/react';
import { FiX, FiActivity } from 'react-icons/fi';
import { RiRobotLine } from 'react-icons/ri';

const AiAgentNode = ({ data, selected }) => {
  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[300px] font-mono text-sm transition-all relative ${selected || showPresence ? 'border-[#d000ff] shadow-[0_0_20px_rgba(208,0,255,0.6)]' : 'border-[#d000ff]/50 shadow-[0_0_10px_rgba(208,0,255,0.3)]'}`}>
      {/* Presence Indicators */}
      {showPresence && (
        <div className="absolute -top-6 right-0 flex -space-x-2">
          {activeUsers.map((u, i) => (
            <div 
              key={i} 
              className="w-5 h-5 rounded-full border-2 border-[#0b0f19] flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-bounce"
              style={{ backgroundColor: u.color || '#d000ff' }}
              title={u.user}
            >
              {u.user?.[0] || 'U'}
            </div>
          ))}
        </div>
      )}
      
      <div className="p-2 flex justify-between items-center text-[#d000ff] border-b border-[#d000ff]/30 bg-[#1a1123] rounded-t-lg">
        <div className="flex items-center gap-2">
          <RiRobotLine size={16} />
          <span className="font-bold text-xs uppercase tracking-tighter">AI Agent</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            className="bg-transparent border-none text-right focus:outline-none text-gray-500 text-xs placeholder-gray-700 w-[120px]" 
            placeholder="Agent objective..."
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
        <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest">
           <div className="flex items-center gap-1">
              <FiActivity size={10} className="text-[#d000ff]" />
              <span>Status: {data.status || 'Idle'}</span>
           </div>
           <span>v1.0.4-agent</span>
        </div>

        <div className="w-full h-20 bg-black/50 border border-[#d000ff]/20 rounded p-2 text-[11px] text-[#d000ff]/80 font-mono overflow-y-auto">
           {data.logs?.map((log, i) => (
             <div key={i} className="flex gap-2">
               <span className="opacity-40">[{log.time}]</span>
               <span>{log.message}</span>
             </div>
           )) || (
             <div className="italic opacity-40">Awaiting objectives...</div>
           )}
        </div>

        <div className="flex gap-2">
           <button className="flex-1 bg-[#d000ff] hover:bg-[#b000db] text-black text-[10px] font-bold py-1.5 rounded transition-all active:scale-95 shadow-[0_0_10px_rgba(208,0,255,0.4)]">
              INITIALIZE
           </button>
           <button className="flex-1 border border-[#d000ff]/50 text-[#d000ff] text-[10px] font-bold py-1.5 rounded hover:bg-[#d000ff]/10 transition-all">
              CONFIGURE
           </button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#d000ff] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#d000ff] border-2 border-[#0b0f19]" />
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3 bg-[#d000ff] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3 bg-[#d000ff] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default AiAgentNode;
