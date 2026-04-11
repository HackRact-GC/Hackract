import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import {
  FiActivity,
  FiGrid,
  FiCheckCircle,
  FiShield,
  FiPlus,
  FiSettings,
  FiFolder,
  FiFileText,
  FiChevronRight,
} from 'react-icons/fi';

const DashboardPreview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.fullName || user?.handle || 'Operative';
  const userInitial = displayName[0]?.toUpperCase() || 'H';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'TOTAL PROJECTS',     value: '142', icon: FiActivity,    color: 'text-gray-400' },
          { label: 'ACTIVE PROJECTS',    value: '28',  icon: FiGrid,        color: 'text-[#00c477]', isPrimary: true },
          { label: 'COMPLETED',          value: '114', icon: FiCheckCircle, color: 'text-gray-400' },
          { label: 'VULNERABILITIES',    value: '12',  icon: FiShield,      color: 'text-red-500', alert: true },
        ].map((stat, i) => (
          <div key={i} className="bg-[#050505] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            {stat.isPrimary && <div className="absolute top-0 right-0 w-24 h-24 bg-[#00c477]/5 rounded-bl-full filter blur-xl" />}
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

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Active Operatives</h2>
              <p className="text-sm text-gray-500">Managing ongoing penetration tests and security audits</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Create New */}
            <div
              onClick={() => navigate('/projects')}
              className="bg-[#050505] border border-dashed border-white/20 hover:border-[#00c477]/50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center h-48 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-[#00c477]/10 flex items-center justify-center mb-4 transition-colors">
                <FiPlus className="text-xl text-gray-400 group-hover:text-[#00c477] transition-colors" />
              </div>
              <h3 className="font-bold text-white">Create New Project</h3>
              <p className="text-xs text-gray-500 mt-1">Initiate a new security node</p>
            </div>

            {/* Project Aegis */}
            <div
              onClick={() => navigate('/projects')}
              className="bg-[#050505] border border-white/5 rounded-2xl p-6 h-48 flex flex-col justify-between relative hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="absolute top-6 right-6 text-xs font-mono font-bold text-black bg-[#00c477] px-2 py-0.5 rounded">ACTIVE</div>
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
                  <div className="w-1/3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <div className="w-1/4 bg-orange-400" />
                  <div className="w-1/4 bg-yellow-400" />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Last scanned 2h ago</span>
                <span className="text-[#00c477] font-semibold flex items-center">
                  Open Project <FiChevronRight className="ml-1" />
                </span>
              </div>
            </div>

            {/* Shadow Net */}
            <div
              onClick={() => navigate('/projects')}
              className="bg-[#050505] border border-white/5 rounded-2xl p-6 h-48 flex flex-col justify-between relative hover:border-white/10 transition-colors cursor-pointer"
            >
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
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden" />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Scheduled for 04:00 AM</span>
                <span className="text-[#00c477] font-semibold flex items-center">
                  Open Project <FiChevronRight className="ml-1" />
                </span>
              </div>
            </div>

            {/* Retail Secure v4 */}
            <div
              onClick={() => navigate('/projects')}
              className="bg-[#050505] border border-white/5 rounded-2xl p-6 h-48 flex flex-col justify-between relative hover:border-white/10 transition-colors cursor-pointer opacity-80 hover:opacity-100"
            >
              <div className="absolute top-6 right-6 text-xs font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">COMPLETED</div>
              <div>
                <h3 className="font-bold text-white text-lg">Retail Secure v4</h3>
                <p className="text-xs font-mono text-gray-500 mt-1">payment.gateway-pro.com</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Vulnerabilities</span>
                  <span className="text-[#00c477] font-bold">2 Patched</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="w-full bg-[#00c477]" />
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
        <div className="space-y-6">

          {/* Profile Card */}
          <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-[#00c477]/20 border-2 border-[#00c477]/40 flex items-center justify-center text-[#00c477] font-bold text-2xl">
                  {userInitial}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00c477] border-2 border-[#050505] rounded-full" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                <div className="text-xs text-[#00c477] font-semibold">Operative</div>
                <div className="text-yellow-500 text-xs mt-1 tracking-widest">★★★★★ <span className="text-gray-500">Active</span></div>
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

            <button
              onClick={() => navigate('/hacker-profile')}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2 text-sm"
            >
              <FiSettings size={14} /> Edit Profile
            </button>
          </div>

          {/* Sentinel Feed */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">Sentinel Feed</h3>
              <button className="text-xs text-[#00c477] hover:underline">Mark as read</button>
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {[
                { color: 'bg-[#41D1FF]',   title: 'AI Agent completed scan on <strong>Project Aegis</strong>.', time: '2 min ago' },
                { color: 'bg-red-500',     title: 'New <span class="text-red-400 font-bold">CRITICAL</span> vuln in Payment Gateway.', time: '45 min ago' },
                { color: 'bg-gray-500',    title: 'Assigned to <strong>Shadow Net</strong> by Admin Node.', time: '2h ago' },
                { color: 'bg-[#b490ff]',   title: 'Report for <strong>Retail Secure</strong> generated.', time: '5h ago' },
              ].map((item, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full ${item.color} shrink-0 mt-0.5 z-10 border-2 border-[#050505]`} />
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex-1">
                    <p className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: item.title }} />
                    <time className="block text-xs font-mono text-gray-500 mt-1">{item.time}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Comms */}
          <div className="bg-[#050505] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-400 text-xs tracking-widest uppercase">Priority Comms</h3>
              <span className="text-[10px] bg-[#00c477]/20 text-[#00c477] px-2 py-0.5 rounded font-bold">3 NEW</span>
            </div>
            <div className="space-y-3">
              <div
                onClick={() => navigate('/engagements')}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <FiFolder size={14} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">New Job: Fortune 500 Audit</div>
                  <div className="text-xs text-gray-500 mt-0.5">Immediate response required...</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#00c477]/5 rounded-xl border-l-2 border-[#00c477] cursor-pointer relative overflow-hidden">
                <div className="w-8 h-8 rounded bg-gray-800 text-gray-300 flex items-center justify-center shrink-0">
                  <FiFileText size={14} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Message from Lead Architect</div>
                  <div className="text-xs text-[#00c477] mt-0.5">Re: Security patch validation results</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <FiShield size={14} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">System Alert: Database Access</div>
                  <div className="text-xs text-gray-500 mt-0.5">Unauthorized attempt blocked from IP...</div>
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
  );
};

export default DashboardPreview;