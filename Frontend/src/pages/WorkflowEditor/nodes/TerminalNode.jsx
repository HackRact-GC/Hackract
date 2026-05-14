import React, { useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FiTerminal, FiX, FiLink, FiAlertCircle } from 'react-icons/fi';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Unicode11Addon } from '@xterm/addon-unicode11';
import { SerializeAddon } from '@xterm/addon-serialize';
import '@xterm/xterm/css/xterm.css';
import { useTerminalSocket } from '../../../hooks/useTerminalSocket';

const TerminalNode = ({ data, selected }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  const { sendInput, sendResize, setOnOutput, isConnected } = useTerminalSocket(data.workflowId);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 11,
      fontFamily: '"Fira Code", monospace',
      theme: {
        background: '#000000',
        foreground: '#00ff88',
        cursor: '#00ff88',
        selectionBackground: 'rgba(0, 255, 136, 0.3)',
      },
      allowProposedApi: true,
      scrollback: 1000,
    });

    // Load Addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const unicode11Addon = new Unicode11Addon();
    const serializeAddon = new SerializeAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(unicode11Addon);
    term.loadAddon(serializeAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle user input
    term.onData((data) => {
      sendInput(data);
    });

    // Handle backend output
    setOnOutput((data) => {
      term.write(data);
    });

    // Handle resizing
    const handleResize = () => {
      if (fitAddonRef.current && terminalRef.current) {
        fitAddonRef.current.fit();
        sendResize({ cols: term.cols, rows: term.rows });
      }
    };

    // Observer to handle container resizing
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Initial sync
    setTimeout(handleResize, 200);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [sendInput, sendResize, setOnOutput, data.workflowId]);

  // Handle Auto-Execution of commands
  useEffect(() => {
    if (isConnected && data.initialCommand && xtermRef.current) {
      console.log(`🤖 Auto-executing command: ${data.initialCommand}`);
      // Send the command followed by Enter (\r)
      sendInput(`${data.initialCommand}\r`);

      // Clear the initialCommand in the local state so it doesn't run again on re-connects
      // We use data.onDataChange if available to update the node's permanent state
      if (data.onDataChange) {
        data.onDataChange({ initialCommand: null });
      }
    }
  }, [isConnected, data.initialCommand, sendInput, data]);

  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[320px] font-mono text-sm transition-all relative select-none ${selected || showPresence ? 'border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.6)]' : 'border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.3)]'}`}>
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
          <div className="flex items-center gap-1.5 ml-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00ff88] shadow-[0_0_5px_#00ff88]' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[9px] font-black tracking-widest opacity-60">
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="bg-transparent border-none text-right focus:outline-none text-gray-500 text-xs placeholder-gray-700 w-[120px] select-text"
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
        {/* Real Terminal Area */}
        <div
          className="w-full h-48 bg-black border border-[#00ff88]/30 rounded overflow-hidden shadow-inner select-text"
          ref={terminalRef}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />

      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default TerminalNode;
