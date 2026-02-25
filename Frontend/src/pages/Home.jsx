const navItems = [
  { label: "Dashboard", active: true },
  { label: "Pentests" },
  { label: "Reports" },
  { label: "Findings" },
  { label: "Settings" },
];

const quickActions = [
  { title: "New Pentest", description: "Kick off a scoped engagement" },
  { title: "Upload Evidence", description: "Attach screenshots or logs" },
  { title: "Invite Teammate", description: "Collaborate on findings" },
];

const highlights = [
  { title: "Open Findings", value: "12", tone: "bg-amber-50 text-amber-800" },
  { title: "In Progress", value: "3", tone: "bg-blue-50 text-blue-800" },
  { title: "Reports Due", value: "2", tone: "bg-rose-50 text-rose-800" },
];

const activity = [
  { title: "SQLi discovered on login", time: "2h ago" },
  { title: "Report draft exported", time: "6h ago" },
  { title: "New collaborator added", time: "Yesterday" },
];

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
              className={`w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-all duration-200 ${
                item.active
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
              <div className="text-sm font-mono text-gray-300">Welcome back</div>
              <div className="text-lg font-semibold">Your command center</div>
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
              <button className="mt-4 w-full py-2 bg-white/10 border border-white/20 rounded-md text-xs font-mono uppercase tracking-widest hover:border-[#00ff88] transition-colors">
                View profile
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