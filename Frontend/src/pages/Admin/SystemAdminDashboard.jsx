import React, { useState } from 'react';
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
    { sender: 'AI', text: 'Hello Admin. System is ready. How can I assist you with Project Alpha?' }
  ]);

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
          <div className="bg-[#1a1f24] border border-[#2a3036] rounded-md px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-[#20262b] transition-colors">
            <span className="text-[#4ade80] font-semibold tracking-wide">Project Alpha</span>
            <FiChevronDown className="text-[#4ade80]" />
          </div>
          <div className="bg-[#102a1c] border border-[#1a3d28] rounded-full px-3 py-1 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div>
            <span className="text-[#4ade80] text-xs font-bold tracking-widest uppercase">Active</span>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[#2a3036] bg-[#1c1f24] px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 transition-colors hover:border-[#38bdf8] hover:text-[#38bdf8]">
          <FiFileText size={14} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Project Progress Timeline */}
        <div className="bg-[#1c1f24] border border-[#2a3036] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase">Project Progress Timeline</h2>
          </div>
          
          <div className="relative flex items-center justify-between px-4 mt-8">
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#2a3036] -z-10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-8 h-0.5 bg-[#4ade80] -z-10 -translate-y-1/2 transition-all duration-1000" style={{ width: progressWidth }}></div>
            
            {timelinePhases.map((phase) => (
              <div key={phase.id} className="relative flex flex-col items-center group">
                <button
                  type="button"
                  onClick={() => setOpenPhaseMenu(openPhaseMenu === phase.id ? null : phase.id)}
                  className="flex flex-col items-center transition-transform hover:scale-110 focus:outline-none"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${getPhaseColor(phase.status)}`}>
                  {getPhaseIcon(phase.status)}
                  </div>
                  <span className={`text-xs font-bold tracking-widest uppercase ${getPhaseTextColor(phase.status)}`}>
                    {phase.label}
                  </span>
                </button>

                {openPhaseMenu === phase.id && (
                  <div className="absolute top-full mt-3 z-20 w-36 rounded-xl border border-[#2a3036] bg-[#111418] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                    <button
                      type="button"
                      onClick={() => updatePhaseStatus(phase.id, 'not-started')}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-400 hover:bg-gray-500/10 transition-colors"
                    >
                      Not Started
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePhaseStatus(phase.id, 'start')}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#38bdf8] hover:bg-[#38bdf8]/10 transition-colors"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePhaseStatus(phase.id, 'completed')}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#4ade80] hover:bg-[#4ade80]/10 transition-colors"
                    >
                      Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Activity Feed & Project Team */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Activity Feed */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-bold">Activity Feed</h2>
            </div>
            <div className="bg-[#1c1f24] border border-[#2a3036] rounded-xl p-4 font-mono text-sm h-[320px] overflow-y-auto flex-1">
              <div className="flex items-center space-x-2 text-gray-500 mb-6 pb-4 border-b border-[#2a3036]">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
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

          {/* Project Team */}
          <div className="lg:col-span-1 flex flex-col">
            <h2 className="text-white text-lg font-bold mb-4">Project Team</h2>
            <div className="bg-[#1c1f24] border border-[#2a3036] rounded-xl p-4 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {/* Team Member 1 */}
                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-md bg-gray-700 overflow-hidden border border-gray-600 flex items-center justify-center">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Alex Rivers" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#4ade80] border-2 border-[#1c1f24] rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Alex Rivers</div>
                      <div className="text-xs text-gray-500 tracking-wider">LEAD PENTESTER</div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-white"><FiMoreVertical /></button>
                </div>

                {/* Team Member 2 */}
                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-md bg-gray-700 overflow-hidden border border-gray-600 flex items-center justify-center">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah Chen" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#4ade80] border-2 border-[#1c1f24] rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Sarah Chen</div>
                      <div className="text-xs text-gray-500 tracking-wider">EXPLOIT DEV</div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-white"><FiMoreVertical /></button>
                </div>

                {/* Team Member 3 */}
                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-md bg-gray-700 overflow-hidden border border-gray-600 flex items-center justify-center">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" alt="Marcus Vane" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#4ade80] border-2 border-[#1c1f24] rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Marcus Vane</div>
                      <div className="text-xs text-gray-500 tracking-wider">SECURITY ARCHITECT</div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-white"><FiMoreVertical /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: AI Chat Bot & Findings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Chat Bot */}
          <div className="lg:col-span-2 flex flex-col h-[400px]">
            <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
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
                    placeholder="Ask AI to analyze logs, suggest exploits, or summarize findings..."
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

          {/* Findings */}
          <div className="lg:col-span-1 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-bold">Active Findings</h2>
            </div>
            <div className="bg-[#1c1f24] border border-[#2a3036] rounded-xl p-4 flex-1 flex flex-col overflow-y-auto space-y-3 shadow-lg">
              {/* Finding 1 */}
              <div className="p-3 border border-red-500/30 bg-red-500/5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-red-400 font-bold text-sm truncate group-hover:text-red-300 transition-colors">SQL Injection (Blind)</h3>
                  <span className="bg-red-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Critical</span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2">Detected parameter 'id' on /api/v1/users is vulnerable to boolean-based blind SQLi.</p>
                <div className="mt-2 text-[10px] text-gray-500 font-mono">Found: 2 hrs ago</div>
              </div>

              {/* Finding 2 */}
              <div className="p-3 border border-orange-500/30 bg-orange-500/5 rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-orange-400 font-bold text-sm truncate group-hover:text-orange-300 transition-colors">Stored XSS</h3>
                  <span className="bg-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">High</span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2">Comment section allows persistent script injection via the 'body' parameter.</p>
                <div className="mt-2 text-[10px] text-gray-500 font-mono">Found: 4 hrs ago</div>
              </div>

              {/* Finding 3 */}
              <div className="p-3 border border-yellow-500/30 bg-yellow-500/5 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-yellow-400 font-bold text-sm truncate group-hover:text-yellow-300 transition-colors">Insecure Direct Object Ref</h3>
                  <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Medium</span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2">Able to access other users' invoices by incrementing invoice_id.</p>
                <div className="mt-2 text-[10px] text-gray-500 font-mono">Found: 1 day ago</div>
              </div>
              
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SystemAdminDashboard;
