import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiBell,
  FiGrid,
  FiFolder,
  FiTool,
  FiShoppingBag,
  FiFileText,
  FiSettings,
  FiPlus,
  FiUser,
  FiActivity,
  FiCheckCircle,
  FiShield,
  FiChevronRight,
  FiMenu,
  FiX
} from 'react-icons/fi';

const DashboardPreview = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-[#00ff88]/30 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-white/5 flex flex-col justify-between transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo & Mobile Close */}
          <div className="p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider text-[#00ff88]">Hackract</h1>
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <FiX size={24} />
            </button>
          </div>
          
          {/* Admin Node Card */}
          <div className="mx-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88]">
              <FiUser />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Admin Node</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Security Level 5</div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 px-3">
            {[
              { icon: FiGrid, label: 'Dashboard', active: true },
              { icon: FiFolder, label: 'Projects' },
              { icon: FiTool, label: 'Tools' },
              { icon: FiShoppingBag, label: 'Marketplace' },
              { icon: FiFileText, label: 'Reports' },
              { icon: FiSettings, label: 'Settings' },
            ].map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-[#00ff88]/10 text-[#00ff88] border-l-2 border-[#00ff88]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={item.active ? 'text-[#00ff88]' : ''} />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Action Button - Always visible at bottom of sidebar on mobile */}
        <div className="p-4 mt-auto">
          <button className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-xl hover:bg-[#00ff88]/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            New Scan
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full w-full lg:w-[calc(100%-16rem)] relative overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="flex justify-between items-center p-4 lg:p-6 border-b border-white/5 bg-[#0a0a0a] z-30 flex-shrink-0">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden text-gray-400 hover:text-white mr-4 p-2 rounded-xl border border-white/10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <FiMenu size={20} />
            </button>
            <div className="relative w-full max-w-md hidden md:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search resources, nodes, vulnerabilities..." 
                className="w-full bg-[#161616] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
            
            {/* Mobile Search Icon Only */}
            <button className="md:hidden text-gray-400 hover:text-[#00ff88]">
              <FiSearch size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff88] rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3 border-l border-white/10 pl-4 lg:pl-6">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">Axel Thorne</div>
                <div className="text-xs text-gray-500">Security Lead</div>
              </div>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Axel"
                alt="Profile"
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gray-800 border border-white/10"
              />
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto block w-full space-y-6 lg:space-y-8">
            
            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { label: 'TOTAL PROJECTS', value: '142', icon: FiActivity, color: 'text-gray-400' },
              { label: 'ACTIVE PROJECTS', value: '28', icon: FiGrid, color: 'text-[#00ff88]', isPrimary: true },
              { label: 'COMPLETED', value: '114', icon: FiCheckCircle, color: 'text-gray-400' },
              { label: 'VULNERABILITIES', value: '12', icon: FiShield, color: 'text-red-500', alert: true },
            ].map((stat, i) => (
              <div key={i} className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                {stat.isPrimary && <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-bl-full filter blur-xl"></div>}
                <div className="text-xs font-semibold text-gray-500 tracking-wider mb-2">{stat.label}</div>
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold text-white flex items-center gap-2">
                    {stat.value}
                    {stat.alert && <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-md tracking-widest font-mono">CRITICAL</span>}
                  </div>
                  <stat.icon size={28} className={stat.color} />
                </div>
              </div>
            ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* LEFT COLUMN - ACTIVE OPERATIVES & PROJECTS */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Active Operatives</h2>
                    <p className="text-sm text-gray-500">Managing ongoing penetration tests and security audits</p>
                  </div>
                  <button className="text-sm px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition-colors w-full sm:w-auto">
                    Recent Updated
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 flex-wrap">
                {/* Create New */}
                <div 
                  onClick={() => navigate('/projects')}
                  className="bg-[#111111] border border-dashed border-white/20 hover:border-[#00ff88]/50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center h-48 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-[#00ff88]/10 flex items-center justify-center mb-4 transition-colors">
                    <FiPlus className="text-xl text-gray-400 group-hover:text-[#00ff88] transition-colors" />
                  </div>
                  <h3 className="font-bold text-white">Create New Project</h3>
                  <p className="text-xs text-gray-500 mt-1">Initiate a new security node</p>
                </div>

                {/* Project Aegis */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 h-48 flex flex-col justify-between relative hover:border-white/10 transition-colors cursor-pointer">
                  <div className="absolute top-6 right-6 text-xs font-mono font-bold text-black bg-[#00ff88] px-2 py-0.5 rounded">ACTIVE</div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Project Aegis</h3>
                    <p className="text-xs font-mono text-gray-500 mt-1">192.168.1.104 • internal-dev.io</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Vulnerabilities</span>
                      <span className="text-red-400 font-bold">7 Found</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                      <div className="w-1/3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                      <div className="w-1/4 bg-orange-400"></div>
                      <div className="w-1/4 bg-yellow-400"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Last scanned 2h ago</span>
                    <span className="text-[#00ff88] font-semibold flex items-center hover:underline">
                      Open Project <FiChevronRight className="ml-1" />
                    </span>
                  </div>
                </div>

                {/* Shadow Net */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 h-48 flex flex-col justify-between relative hover:border-white/10 transition-colors cursor-pointer">
                  <div className="absolute top-6 right-6 text-xs font-mono font-bold text-[#b490ff] bg-[#b490ff]/10 border border-[#b490ff]/30 px-2 py-0.5 rounded">PENDING</div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Shadow Net</h3>
                    <p className="text-xs font-mono text-gray-500 mt-1">vps-992.cloud-core.net</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Vulnerabilities</span>
                      <span className="text-gray-500">0 Found</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Scheduled for 04:00 AM</span>
                    <span className="text-[#00ff88] font-semibold flex items-center hover:underline">
                      Open Project <FiChevronRight className="ml-1" />
                    </span>
                  </div>
                </div>

                {/* Retail Secure v4 */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 h-48 flex flex-col justify-between relative hover:border-white/10 transition-colors cursor-pointer opacity-80 hover:opacity-100">
                  <div className="absolute top-6 right-6 text-xs font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">COMPLETED</div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Retail Secure v4</h3>
                    <p className="text-xs font-mono text-gray-500 mt-1">payment.gateway-pro.com</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Vulnerabilities</span>
                      <span className="text-[#00ff88] font-bold">2 Patched</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-full bg-[#00ff88]"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Completed 3 days ago</span>
                    <span className="text-gray-300 font-semibold flex items-center hover:text-white transition-colors">
                      View Report <FiFileText className="ml-1" />
                    </span>
                  </div>
                </div>

              </div>
            </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6 mt-8 lg:mt-0">
              
              {/* Profile Card */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Axel"
                      className="w-16 h-16 rounded-xl bg-gray-800 border-2 border-[#111111] shadow-[0_0_0_2px_#00ff88]"
                      alt="Profile"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00ff88] border-2 border-[#111111] rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Axel Thorne</h2>
                    <div className="text-xs text-[#00ff88] font-semibold flex items-center gap-1">
                      Expert Operative
                    </div>
                    <div className="text-yellow-500 text-xs mt-1 tracking-widest">★★★★★ <span className="text-gray-500">4.8 Rating</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#161616] rounded-xl p-3 text-center border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Reputation</div>
                    <div className="font-bold text-white text-lg">4.2k</div>
                  </div>
                  <div className="bg-[#161616] rounded-xl p-3 text-center border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                    <div className="font-bold text-white text-lg">98.4%</div>
                  </div>
                </div>

                <button className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2 text-sm">
                  <FiSettings size={14} /> Edit Profile
                </button>
              </div>

              {/* Sentinel Feed */}
              <div className="bg-transparent">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white">Sentinel Feed</h3>
                  <button className="text-xs text-[#00ff88] hover:underline">Mark as read</button>
                </div>
                
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {[
                    { type: 'scan', color: 'bg-[#41D1FF]', title: 'AI Agent completed full-spectrum scan on <strong>Project Aegis</strong>.', time: '2 minutes ago' },
                    { type: 'alert', color: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]', title: 'New <span class="text-red-400 font-bold">CRITICAL</span> vulnerability detected in Payment Gateway Node.', time: '45 minutes ago' },
                    { type: 'assign', color: 'bg-gray-500', title: 'Assigned to <strong>Shadow Net</strong> mission by Admin Node.', time: '2 hours ago' },
                    { type: 'report', color: 'bg-[#b490ff]', title: 'Operational Report for <strong>Retail Secure</strong> generated successfully.', time: '5 hours ago' },
                  ].map((item, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-[#0a0a0a] ${item.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10`}></div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        <p className="text-sm text-gray-300" dangerouslySetInnerHTML={{__html: item.title}}></p>
                        <time className="block text-xs font-mono text-gray-500 mt-1">{item.time}</time>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Comms */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-400 text-xs tracking-widest uppercase">Priority Comms</h3>
                  <span className="text-[10px] bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded font-bold">3 NEW</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <FiFolder size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">New Job: Fortune 500 Audit</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">Immediate response required...</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#00ff88]/5 rounded-xl border-l-2 border-[#00ff88] cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#00ff88]/10 rounded-bl-full mix-blend-screen pointer-events-none"></div>
                    <div className="w-8 h-8 rounded bg-gray-800 text-gray-300 flex items-center justify-center shrink-0">
                      <FiFileText size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Message from Lead Architect</div>
                      <div className="text-xs text-[#00ff88] mt-0.5">Re: Security patch validation results</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <FiShield size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">System Alert: Database Access</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">Unauthorized attempt blocked from IP...</div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full text-center text-xs text-gray-400 hover:text-white mt-4 font-bold tracking-widest">
                  VIEW ALL ALERTS
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default DashboardPreview;