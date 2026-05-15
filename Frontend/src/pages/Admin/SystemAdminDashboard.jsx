import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiChevronDown, FiBell, FiSettings, FiCheck, FiMoreVertical, FiClock, FiSend, FiUser, FiFileText } from 'react-icons/fi';

const SystemAdminDashboard = () => {
  const [chatInput, setChatInput] = useState('');
  const [timelinePhases, setTimelinePhases] = useState([
    { id: 'recon', label: 'Recon', status: 'not-started' },
    { id: 'scan', label: 'Scan', status: 'not-started' },
    { id: 'exploit', label: 'Exploit', status: 'not-started' },
    { id: 'report', label: 'Report', status: 'not-started' },
  ]);
  const [openPhaseMenu, setOpenPhaseMenu] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI', text: 'Hello Admin. System is ready. How can I assist you with the Project ?' }
  ]);

  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) { // Constraint between 20% and 80%
        setLeftWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'Admin', text: chatInput }]);
    setChatInput('');
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'AI', text: 'Analyzing request... Please wait.' }]);
    }, 1000);
  };

  const updatePhaseStatus = (phaseId, status) => {
    setTimelinePhases((currentPhases) =>
      currentPhases.map((phase) => (phase.id === phaseId ? { ...phase, status } : phase))
    );
    setOpenPhaseMenu(null);
  };

  const completedCount = timelinePhases.filter((phase) => phase.status === 'completed').length;
  const progressWidth = `${(completedCount / timelinePhases.length) * 100}%`;

  const getPhaseIcon = (status) => {
    if (status === 'completed') return <FiCheck size={16} strokeWidth={3} />;
    if (status === 'start') return <FiClock size={16} strokeWidth={2} className="animate-pulse" />;
    return <div className="w-2 h-2 rounded-full bg-gray-500"></div>;
  };

  const getPhaseColor = (status) => {
    if (status === 'completed') return 'bg-[#4ade80] text-black shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:bg-[#3bca71]';
    if (status === 'start') return 'bg-[#38bdf8] text-black shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:bg-[#2caae0]';
    return 'bg-[#2a3036] text-gray-500 hover:bg-[#343b42]';
  };

  const getPhaseTextColor = (status) => {
    if (status === 'completed') return 'text-[#4ade80]';
    if (status === 'start') return 'text-[#38bdf8]';
    return 'text-gray-500';
  };

  return (
    <div className="h-full text-gray-300 font-sans p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">

        </div>
        <button className="inline-flex items-center gap-3 rounded-xl bg-[#00c477] px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 hover:bg-[#00d581] shadow-[0_0_20px_rgba(0,196,119,0.3)]">
          <FiFileText size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex flex-col lg:flex-row gap-0 items-start select-none relative"
      >
        
        {/* Activity Feed */}
        <div 
          style={{ width: `calc(${leftWidth}% - 12px)` }}
          className="flex flex-col h-[600px] min-w-[300px]"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-lg font-bold uppercase tracking-wider">Activity Feed</h2>
          </div>
          <div className="bg-[#1c1f24] border border-[#2a3036] rounded-xl p-4 font-mono text-sm overflow-y-auto flex-1 shadow-inner">
            <div className="flex items-center space-x-2 text-gray-500 mb-6 pb-4 border-b border-[#2a3036]">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span>terminal@alpha:~/logs$ tail -f project_activity.log</span>
            </div>
            
            <div className="space-y-4">
              <div className="text-gray-400">
                <span className="text-gray-500">[14:32:11]</span> <span className="text-[#38bdf8]">User_01</span> ran <span className="text-[#4ade80]">Nmap -sV</span> against subnet <span className="text-[#38bdf8]">192.168.1.0/24</span>
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">[14:45:02]</span> <span className="text-[#38bdf8]">AI_Agent</span> detected <span className="text-red-400">Vulnerability CVE-2023-1402</span> on host .42
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">[15:10:55]</span> <span className="text-[#38bdf8]">User_03</span> initiated <span className="text-[#4ade80]">Metasploit</span> session handler
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">[15:12:20]</span> <span className="text-[#38bdf8]">User_02</span> uploaded <span className="text-gray-300">recon_results_v4.json</span> to project scope
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">[15:30:11]</span> <span className="text-[#38bdf8]">AI_Agent</span> auto-assigned severity <span className="text-red-500 font-bold">CRITICAL</span> to asset .105
              </div>
            </div>
          </div>
        </div>

        {/* Resizer Divider */}
        <div 
          onMouseDown={startResizing}
          className={`hidden lg:flex w-6 h-[600px] items-center justify-center cursor-col-resize group self-center px-1 transition-colors ${isResizing ? 'bg-[#00c477]/10' : 'hover:bg-white/5'}`}
        >
          <div className={`w-[2px] h-12 rounded-full transition-colors ${isResizing ? 'bg-[#00c477]' : 'bg-[#2a3036] group-hover:bg-gray-500'}`} />
        </div>

        {/* AI Security Assistant */}
        <div 
          style={{ width: `calc(${100 - leftWidth}% - 12px)` }}
          className="flex flex-col h-[600px] min-w-[300px]"
        >
          <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
            <span className="text-[#38bdf8]">✦</span> AI Security Assistant
          </h2>
          <div className="bg-[#1c1f24] border border-[#2a3036] rounded-xl flex flex-col flex-1 overflow-hidden relative shadow-lg">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-[#1c1f24] to-[#16191d]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start max-w-[80%] space-x-2 ${msg.sender === 'Admin' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.sender === 'Admin' ? 'bg-gray-700' : 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30'}`}>
                      {msg.sender === 'Admin' ? <FiUser size={14} /> : 'AI'}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-md ${msg.sender === 'Admin' ? 'bg-[#2a3036] text-white rounded-tr-sm' : 'bg-[#1a2026] border border-white/5 text-gray-300 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="p-3 bg-[#16191d] border-t border-[#2a3036]">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI to analyze logs..."
                  className="w-full bg-[#111316] border border-[#2a3036] rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#38bdf8] transition-colors shadow-inner"
                />
                <button 
                  type="submit" 
                  className="absolute right-2 p-2 rounded-lg bg-[#38bdf8] text-black hover:bg-[#38bdf8]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!chatInput.trim()}
                >
                  <FiSend size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemAdminDashboard;
