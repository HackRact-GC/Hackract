import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import api from "../api/axiosConfig";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/hacker-profiles/me/status');
        setProfileStatus(data.data.profile?.status);
      } catch (err) {
        console.error('Failed to fetch profile status');
      }
    };
    if (user?.roles?.[0]?.type === 'PENTESTER' || user?.roles?.[0]?.type === 'PROJECT_ADMIN') {
      fetchStatus();
    }
    
    const fetchOrgs = async () => {
      try {
        const { data } = await api.get('/organizations/me');
        setOrgs(data.data || []);
      } catch (err) {
        console.error('Failed to fetch organizations');
      }
    };
    if (user?.roles?.[0]?.type === 'ORG_ADMIN') {
      fetchOrgs();
      navigate('/organization-dashboard');
    } else if (user?.roles?.[0]?.type === 'PENTESTER' || user?.roles?.[0]?.type === 'PROJECT_ADMIN') {
      navigate('/hacker-dashboard');
    } else if (user) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  const primaryRoleType = user?.roles?.[0]?.type;
  const isOrgView = primaryRoleType === "ORG_ADMIN";

  const navItems = isOrgView
    ? [
      { label: "Org Overview", active: true },
      { label: "Teams" },
      { label: "Engagements" },
      { label: "Compliance" },
      { label: "Settings" },
    ]
    : [
      { label: "Dashboard", active: true },
      { label: "Pentests" },
      { label: "Reports" },
      { label: "Findings" },
      { label: "Settings" },
    ];

  const quickActions = isOrgView
    ? [
      { title: "Create Program", description: "Define a new security program" },
      { title: "Invite Pentester", description: "Bring in an external operator" },
      { title: "Review Findings", description: "Prioritize open issues" },
    ]
    : [
      { title: "New Pentest", description: "Kick off a scoped engagement" },
      { title: "Upload Evidence", description: "Attach screenshots or logs" },
      { title: "Invite Teammate", description: "Collaborate on findings" },
    ];

  const highlights = isOrgView
    ? [
      { title: "Active Programs", value: "4", tone: "bg-emerald-50 text-emerald-800" },
      { title: "Vulns Awaiting Triage", value: "18", tone: "bg-amber-50 text-amber-800" },
      { title: "Vendors Engaged", value: "6", tone: "bg-sky-50 text-sky-800" },
    ]
    : [
      { title: "Open Findings", value: "12", tone: "bg-amber-50 text-amber-800" },
      { title: "In Progress", value: "3", tone: "bg-blue-50 text-blue-800" },
      { title: "Reports Due", value: "2", tone: "bg-rose-50 text-rose-800" },
    ];

  const activity = isOrgView
    ? [
      { title: "New vendor added to program", time: "1h ago" },
      { title: "Policy exception approved", time: "5h ago" },
      { title: "Quarterly report exported", time: "Yesterday" },
    ]
    : [
      { title: "SQLi discovered on login", time: "2h ago" },
      { title: "Report draft exported", time: "6h ago" },
      { title: "New collaborator added", time: "Yesterday" },
    ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Left sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur">
        <div className="px-6 py-6 text-xl font-mono font-bold tracking-[0.2em]">HACKRACT</div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-all duration-200 ${item.active
                  ? "bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/30"
                  : "text-gray-300 hover:bg-white/5"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-6 text-xs text-gray-500 font-mono">Secure • Offensive • Precise</div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top nav */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/30 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88] font-bold">
              λ
            </div>
            <div>
              <div className="text-sm font-mono text-gray-300">
                {isOrgView ? "Organization view" : "Operator console"}
              </div>
              <div className="text-lg font-semibold">
                {isOrgView ? "Security program overview" : "Your command center"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search assets, findings..."
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:border-[#00ff88]"
            />
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-semibold">
              {user?.fullName?.[0]?.toUpperCase() || user?.handle?.[0]?.toUpperCase() || "U"}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-xs font-mono uppercase tracking-widest hover:border-[#00ff88] transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 p-6">
          {/* Center content */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-400 font-mono">Pipeline</div>
                  <h2 className="text-2xl font-bold">Active engagements</h2>
                </div>
                <button className="px-4 py-2 bg-[#00ff88] text-black rounded-md font-mono text-xs tracking-widest uppercase shadow-lg shadow-[#00ff88]/30">
                  New project
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {highlights.map((card) => (
                  <div key={card.title} className={`rounded-xl px-4 py-5 border border-white/10 ${card.tone}`}>
                    <div className="text-xs font-mono uppercase tracking-wide opacity-80">{card.title}</div>
                    <div className="text-3xl font-bold mt-2">{card.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {(primaryRoleType === 'PENTESTER' || primaryRoleType === 'PROJECT_ADMIN') && profileStatus !== 'APPROVED' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-6 group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-xl">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-500 uppercase tracking-tighter text-sm">Action Required: Operator Identity Pending</h3>
                    <p className="text-xs text-gray-400 max-w-lg">
                      To participate in organization engagements, you must provide legal proof of identity and sign our MNDA. 
                      Your status is currently <span className="text-amber-500 font-mono font-bold">[{profileStatus || 'UNVERIFIED'}]</span>.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/hacker-verification')}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap"
                >
                  Verify Now →
                </button>
              </div>
            )}

            {isOrgView && orgs.some(o => o.verificationStatus !== 'APPROVED') && (
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-6 group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-500 text-xl">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-bold text-sky-400 uppercase tracking-tighter text-sm">Business Entity Verification Required</h3>
                    <p className="text-xs text-gray-400 max-w-lg">
                      Your organization **{orgs.find(o => o.verificationStatus !== 'APPROVED')?.name}** must be verified before you can launch security programs or invite testers.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/organization-verification/${orgs.find(o => o.verificationStatus !== 'APPROVED')?.id}`)}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap"
                >
                  Complete Profile →
                </button>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
              <h3 className="text-xl font-semibold mb-4">Quick actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    className="group border border-white/10 bg-black/40 rounded-xl p-4 text-left hover:border-[#00ff88]/60 hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="text-sm font-semibold mb-1 flex items-center gap-2">
                      {action.title}
                      <span className="text-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Software Panel */}
            <div className="bg-[#00ff41]/5 border border-[#00ff41]/20 rounded-2xl p-6 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse shadow-[0_0_8px_#00ff41]" />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#00ff41]">
                    [SYSTEM_INIT] - Recommended Software
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#00ff41]/60 uppercase tracking-tighter">
                  v{new Date().toISOString().split('T')[0].replace(/-/g, '.')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(isOrgView 
                  ? [
                      { name: "OpenVAS", category: "Scanner", status: "PENDING" },
                      { name: "Splunk", category: "SIEM", status: "CONFIGURED" },
                      { name: "CrowdStrike", category: "EDR", status: "PENDING" },
                      { name: "Nessus", category: "Audit", status: "PENDING" }
                    ]
                  : [
                      { name: "Burp Suite", category: "Web Proxy", status: "CONFIGURED" },
                      { name: "Metasploit", category: "Exploit", status: "PENDING" },
                      { name: "Ghidra", category: "RE", status: "PENDING" },
                      { name: "Nmap", category: "Scanner", status: "CONFIGURED" }
                    ]
                ).map((tool) => (
                  <div key={tool.name} className="bg-black/40 border border-white/5 p-4 rounded-xl hover:border-[#00ff41]/40 transition-colors group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-40 transition-opacity">
                      <div className="text-[30px] font-mono font-bold leading-none select-none">
                        {tool.name[0]}
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className="text-[10px] font-mono text-[#00ff41] mb-1 opacity-70">{tool.category}</div>
                      <div className="font-bold text-sm tracking-tight mb-3">{tool.name}</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-[9px] font-mono px-2 py-0.5 rounded-sm ${
                          tool.status === 'CONFIGURED' 
                            ? 'bg-[#00ff41]/20 text-[#00ff41]' 
                            : 'bg-white/5 text-gray-500'
                        }`}>
                          {tool.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/50 flex items-center justify-center text-lg font-bold text-[#00ff88]">
                  U
                </div>
                <div>
                  <div className="text-sm font-semibold">Your profile</div>
                  <div className="text-xs text-gray-400">Keep credentials fresh</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-300 font-mono space-y-1">
                <div>Status: <span className="text-[#00ff88]">Operational</span></div>
                <div>MFA: Enabled</div>
                <div>Last login: Today</div>
              </div>
              <button
                onClick={() => navigate(isOrgView ? "/organization-profile" : "/hacker-profile")}
                className="mt-4 w-full py-2 bg-white/10 border border-white/20 rounded-md text-xs font-mono uppercase tracking-widest hover:border-[#00ff88] transition-colors">
                {isOrgView ? "Org profile" : "Hacker profile"}
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/40">
              <h4 className="text-sm font-semibold mb-3">Recent activity</h4>
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.title} className="flex justify-between text-xs text-gray-300">
                    <span>{item.title}</span>
                    <span className="text-gray-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;