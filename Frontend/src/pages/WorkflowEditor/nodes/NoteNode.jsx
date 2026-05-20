import * as ReactFlow from "@xyflow/react";
import { FiAlertCircle, FiFileText, FiLink, FiX } from "react-icons/fi";

const { Handle, Position } = ReactFlow;

const NoteNode = ({ data, selected }) => {
  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  return (
    <div
      className={`bg-[#0b0f19] border rounded-lg w-[260px] font-mono text-sm transition-all relative ${selected || showPresence ? "border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.6)]" : "border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.3)]"}`}
    >
      {/* Presence Indicators (Figma Style) */}
      {showPresence && (
        <div className="absolute -top-6 right-0 flex -space-x-2">
          {activeUsers.map((u, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2 border-[#0b0f19] flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-bounce"
              style={{ backgroundColor: u.color || "#00ff88" }}
              title={u.user}
            >
              {u.user?.[0] || "U"}
            </div>
          ))}
        </div>
      )}
      {/* Header */}
      <div className="p-2 flex justify-between items-center text-[#00ff88] border-b border-[#00ff88]/30">
        <div className="flex items-center gap-2">
          <FiFileText size={16} />
          <span className="font-bold text-xs uppercase tracking-tighter">
            Research Note
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="bg-transparent border-none text-right focus:outline-none text-gray-500 text-xs placeholder-gray-700 w-[100px]"
            placeholder="Title..."
            defaultValue={data.label || ""}
            onBlur={(e) =>
              data.onTitleChange && data.onTitleChange(e.target.value)
            }
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
          className="w-full h-24 bg-black border border-gray-800 text-gray-300 p-2 rounded resize-none focus:outline-none focus:border-[#00ff88]/50"
          placeholder="taking note about what i am doing"
          defaultValue={data.text || ""}
          onChange={(e) =>
            data.onDataChange && data.onDataChange({ text: e.target.value })
          }
        />
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]"
      />
    </div>
  );
};

export default NoteNode;
