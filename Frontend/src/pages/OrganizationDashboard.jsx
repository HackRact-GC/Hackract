import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

// ─── Tiny inline SVG icons ────────────────────────────────────────────────────
const Ic = {
  Grid: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Folder: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  ChevR: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>,
  Trend: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Target: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path strokeLinecap="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path strokeLinecap="round" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path strokeLinecap="round" d="M10 11v6M14 11v6"/><path strokeLinecap="round" d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path strokeLinecap="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Activity: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
};

const NAV = [
  { key: "overview",  label: "Overview",   Icon: Ic.Grid },
  { key: "members",   label: "Members",    Icon: Ic.Users },
  { key: "pentests",  label: "Pentests",   Icon: Ic.Shield },
  { key: "projects",  label: "Projects",   Icon: Ic.Folder },
  { key: "activity",  label: "Activity",   Icon: Ic.Activity },
  { key: "settings",  label: "Settings",   Icon: Ic.Settings },
];

const avatar = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const ROLE_COLORS = {
  OWNER:  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  ADMIN:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  MEMBER: "bg-white/5 text-gray-400 border-white/5",
  GUEST:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const STATUS_COLORS = {
  ACTIVE:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  IN_PROGRESS:"bg-blue-500/10 text-blue-400 border-blue-500/20",
  PENDING:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED:  "bg-white/5 text-gray-500 border-white/5",
  CRITICAL:   "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color }) => {
  const bg = { 
    indigo: "bg-[#00ff88]/10 text-[#00ff88]", 
    emerald: "bg-[#00ff88]/10 text-[#00ff88]", 
    amber: "bg-amber-500/10 text-amber-500", 
    rose: "bg-rose-500/10 text-rose-500", 
    violet: "bg-purple-500/10 text-purple-500" 
  };
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[24px] border border-white/5 p-6 flex items-center gap-5 hover:border-[#00ff88]/30 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl ${bg[color]} flex items-center justify-center shrink-0 border border-current/10 shadow-[0_0_15px_rgba(0,255,136,0.05)]`}>
        <Icon />
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-[0.2em]">{label}</p>
        {sub && <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-widest">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ text, map = STATUS_COLORS }) => (
  <span className={`inline-block text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${map[text] || "bg-white/5 text-gray-500 border-white/5"}`}>
    {text}
  </span>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-[#0a0a0a] rounded-[32px] shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-gradient-to-r from-[#00ff88]/5 to-transparent">
          <h3 className="font-black text-white uppercase font-mono tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 transition-colors"><Ic.X/></button>
        </div>
        <div className="px-8 py-8">{children}</div>
      </div>
    </div>
  );
};

// ─── Input / Select helpers ───────────────────────────────────────────────────
const FInput = (props) => (
  <input {...props} className="w-full border border-white/10 rounded-xl bg-white/[0.02] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all px-4 py-3 font-mono"/>
);
const FSelect = ({ children, ...props }) => (
  <select {...props} className="w-full border border-white/10 rounded-xl bg-white/[0.02] text-sm text-white focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all px-4 py-3 cursor-pointer font-mono appearance-none">
    {children}
  </select>
);
const FLabel = ({ children }) => (
  <label className="block text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-1">{children}</label>
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_MEMBERS = [
  { id: "1", name: "Alice Johnson",  email: "alice@example.com",  role: "OWNER",  joinedAt: "2024-01-10", status: "ACTIVE" },
  { id: "2", name: "Bob Martinez",   email: "bob@example.com",    role: "ADMIN",  joinedAt: "2024-02-15", status: "ACTIVE" },
  { id: "3", name: "Carol Smith",    email: "carol@example.com",  role: "MEMBER", joinedAt: "2024-03-20", status: "ACTIVE" },
  { id: "4", name: "David Kim",      email: "david@example.com",  role: "GUEST",  joinedAt: "2024-04-01", status: "PENDING" },
];

const MOCK_PENTESTS = [
  { id: "1", name: "API Security Assessment",    target: "api.acme.com",     status: "IN_PROGRESS", severity: "HIGH",     date: "2024-03-01", assignee: "Alice Johnson" },
  { id: "2", name: "Web App Penetration Test",   target: "app.acme.com",     status: "COMPLETED",   severity: "CRITICAL", date: "2024-02-10", assignee: "Bob Martinez" },
  { id: "3", name: "Mobile App Security Review", target: "ACME iOS/Android", status: "PENDING",     severity: "MEDIUM",   date: "2024-03-15", assignee: "Carol Smith" },
  { id: "4", name: "Infrastructure Audit",       target: "10.0.0.0/8",       status: "ACTIVE",      severity: "LOW",      date: "2024-03-20", assignee: "David Kim" },
];

const MOCK_PROJECTS = [
  { id: "1", name: "ACME Corp Security Suite",   description: "Full security review of ACME Corp infrastructure", status: "ACTIVE",      pentests: 4, members: 3, due: "2024-06-30" },
  { id: "2", name: "FinBank Compliance Audit",   description: "PCI-DSS compliance assessment and remediation",     status: "IN_PROGRESS", pentests: 2, members: 2, due: "2024-05-15" },
  { id: "3", name: "HealthPlus Web Security",    description: "HIPAA-focused web application security testing",    status: "PENDING",     pentests: 1, members: 1, due: "2024-07-01" },
];

const MOCK_ACTIVITY = [
  { id: "1", user: "Alice Johnson",  action: "started pentest",    target: "API Security Assessment",    time: "2 hours ago",  type: "pentest" },
  { id: "2", user: "Bob Martinez",   action: "added member",       target: "Carol Smith",                time: "5 hours ago",  type: "member" },
  { id: "3", user: "Carol Smith",    action: "completed project",  target: "Web App Penetration Test",   time: "1 day ago",    type: "project" },
  { id: "4", user: "David Kim",      action: "created project",    target: "HealthPlus Web Security",    time: "2 days ago",   type: "project" },
  { id: "5", user: "Alice Johnson",  action: "updated settings",   target: "Organization profile",       time: "3 days ago",   type: "settings" },
  { id: "6", user: "Bob Martinez",   action: "submitted report",   target: "FinBank Compliance Audit",   time: "4 days ago",   type: "pentest" },
];

const TYPE_COLORS = { pentest:"bg-rose-500/10 text-rose-400", member:"bg-[#00ff88]/10 text-[#00ff88]", project:"bg-violet-500/10 text-violet-400", settings:"bg-white/5 text-gray-500" };

// ─── Main Component ───────────────────────────────────────────────────────────
const OrganizationDashboard = () => {
  const navigate  = useNavigate();
  const [tab, setTab]         = useState("overview");
  const [org, setOrg]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [pentests]            = useState(MOCK_PENTESTS);
  const [projects]            = useState(MOCK_PROJECTS);

  const [addMemberOpen, setAddMemberOpen]     = useState(false);
  const [addProjectOpen, setAddProjectOpen]   = useState(false);
  const [addPentestOpen, setAddPentestOpen]   = useState(false);
  const [newMember, setNewMember]             = useState({ email: "", role: "MEMBER" });
  const [newProject, setNewProject]           = useState({ name: "", description: "", due: "" });
  const [newPentest, setNewPentest]           = useState({ name: "", target: "", assignee: "", severity: "MEDIUM" });
  const [toast, setToast]                     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/organizations/me");
        const orgs = data?.data?.data || data?.data || [];
        if (orgs?.length) setOrg(orgs[0]);
      } catch { /* no org yet */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleAddMember = () => {
    if (!newMember.email) return;
    setMembers(prev => [...prev, {
      id: Date.now().toString(), name: newMember.email.split("@")[0],
      email: newMember.email, role: newMember.role, joinedAt: new Date().toISOString().slice(0,10), status: "PENDING"
    }]);
    setNewMember({ email: "", role: "MEMBER" });
    setAddMemberOpen(false);
    showToast("Identity Invitation Transmitted.");
  };

  const handleRemoveMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast("Operator Access Reconsidered.", "info");
  };

  const orgName = org?.name || "Root Organization";
  const orgSlug = org?.slug ? `/${org.slug}` : "/entity-alpha";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-[#00ff88] animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]"/>
        <p className="text-[10px] font-mono font-black text-[#00ff88] uppercase tracking-[0.4em] animate-pulse">Syncing Entity Matrix...</p>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Operators"   value={members.length}  sub="Authenticated Assets" icon={Ic.Users}  color="indigo"/>
        <StatCard label="Engagements" value={pentests.length} sub="Active Operations"   icon={Ic.Shield} color="rose"/>
        <StatCard label="Directives"  value={projects.length} sub="Strategic Units"     icon={Ic.Folder} color="violet"/>
        <StatCard label="Vulnerabilities" value="24"         sub="Pending Remediation"  icon={Ic.Target} color="amber"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/[0.02] rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-black text-white text-[11px] font-mono uppercase tracking-[0.3em]">Recent Engagements</h3>
            <button onClick={() => setTab("pentests")} className="text-[9px] font-mono font-black text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-widest">View Archive [+]</button>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {pentests.slice(0,3).map(p => (
              <div key={p.id} className="px-8 py-5 flex items-center justify-between gap-4 group cursor-pointer hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/20 flex items-center justify-center text-[#00ff88] shrink-0 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all"><Ic.Shield/></div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate group-hover:text-[#00ff88] transition-colors uppercase">{p.name}</p>
                    <p className="text-[10px] font-mono text-gray-600 flex items-center gap-2 mt-1 uppercase tracking-widest"><Ic.Globe/>{p.target}</p>
                  </div>
                </div>
                <Badge text={p.status}/>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-black text-white text-[11px] font-mono uppercase tracking-[0.3em]">Operational Intel</h3>
            <button onClick={() => setTab("activity")} className="text-[9px] font-mono font-black text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-widest">Full Log [+]</button>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {MOCK_ACTIVITY.slice(0,4).map(a => (
              <div key={a.id} className="px-8 py-5 flex items-start gap-5 hover:bg-white/[0.02] transition-all cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-[#00ff88] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 group-hover:border-[#00ff88]/30 transition-all">{avatar(a.user)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-400 group-hover:text-white transition-colors leading-relaxed uppercase font-mono tracking-tighter"><span className="font-black text-white">{a.user}</span> {a.action} <span className="text-[#00ff88] font-black">"{a.target}"</span></p>
                  <p className="text-[9px] font-mono text-gray-700 flex items-center gap-2 mt-2 uppercase tracking-widest"><Ic.Clock/>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white text-[11px] font-mono uppercase tracking-[0.3em]">Active Directives</h3>
          <button onClick={() => setTab("projects")} className="text-[9px] font-mono font-black text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-widest">Archive [+]</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
          {projects.map(p => (
            <div key={p.id} className="rounded-3xl border border-white/5 bg-white/[0.01] p-6 hover:border-[#00ff88]/30 hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-10 transition-opacity"><Ic.Folder/></div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all font-mono shadow-inner"><p className="text-[10px] font-black">0{p.id}</p></div>
                <Badge text={p.status}/>
              </div>
              <p className="font-black text-white text-base group-hover:text-[#00ff88] transition-colors uppercase tracking-tight mb-2">{p.name}</p>
              <p className="text-[10px] font-mono text-gray-600 line-clamp-2 uppercase tracking-wide leading-relaxed mb-6">{p.description}</p>
              <div className="flex items-center gap-5 text-[9px] font-mono font-black text-gray-700 uppercase tracking-[0.2em] pt-4 border-t border-white/5">
                <span className="flex items-center gap-2 group-hover:text-gray-500 transition-colors"><Ic.Shield/>{p.pentests} OPS</span>
                <span className="flex items-center gap-2 group-hover:text-gray-500 transition-colors"><Ic.Users/>{p.members} ASSETS</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MembersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">{members.length} Identities Authenticated</p>
        <button onClick={() => setAddMemberOpen(true)} className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#00ff88] hover:scale-105 text-black text-[11px] font-mono font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
          <Ic.Plus/> Authorize Member
        </button>
      </div>
      <div className="bg-white/[0.02] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">Operator Identity</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">Strategic Role</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">Deployment</th>
              <th className="px-8 py-5"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {members.map(m => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#00ff88] flex items-center justify-center font-mono font-black text-xs group-hover:border-[#00ff88]/40 transition-all">{avatar(m.name)}</div>
                    <div>
                      <p className="font-black text-white text-sm uppercase tracking-tight group-hover:text-[#00ff88] transition-colors">{m.name}</p>
                      <p className="text-[10px] font-mono text-gray-600 mt-0.5 uppercase tracking-widest">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5"><Badge text={m.role} map={ROLE_COLORS}/></td>
                <td className="px-8 py-5"><Badge text={m.status}/></td>
                <td className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-widest">{m.joinedAt}</td>
                <td className="px-8 py-5">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.role !== "OWNER" && (
                      <button onClick={() => handleRemoveMember(m.id)} className="p-3 rounded-xl hover:bg-rose-500/10 text-gray-700 hover:text-rose-500 transition-all"><Ic.Trash/></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SEV_COLORS = { CRITICAL: "bg-rose-500/10 text-rose-500 border-rose-500/20", HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20", MEDIUM: "bg-amber-500/10 text-amber-500 border-amber-500/20", LOW: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  
  const PentestsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">{pentests.length} Operations in Continuum</p>
        <button onClick={() => setAddPentestOpen(true)} className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#00ff88] hover:scale-105 text-black text-[11px] font-mono font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
          <Ic.Plus/> Initialize Operation
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {pentests.map(p => (
          <div key={p.id} className="bg-white/[0.02] rounded-[40px] border border-white/5 p-10 hover:border-[#00ff88]/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent" />
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-inner group-hover:shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all"><Ic.Shield/></div>
              <div className="flex items-center gap-3">
                <Badge text={p.severity} map={SEV_COLORS}/>
                <Badge text={p.status}/>
              </div>
            </div>
            <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-[#00ff88] transition-colors">{p.name}</h4>
            <p className="text-[11px] font-mono font-bold text-gray-600 flex items-center gap-2 mb-10 uppercase tracking-widest"><Ic.Globe/>{p.target}</p>
            <div className="flex items-center justify-between text-[9px] font-mono font-black uppercase tracking-[0.2em] border-t border-white/5 pt-8">
              <div className="flex items-center gap-3 text-gray-500"><div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[#00ff88] flex items-center justify-center font-black text-[8px]">{avatar(p.assignee)}</div>{p.assignee}</div>
              <div className="flex items-center gap-2 text-gray-700 group-hover:text-gray-500 shadow-none"><Ic.Clock/>{p.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProjectsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-mono font-black text-gray-600 uppercase tracking-[0.3em]">{projects.length} Strategic Directives Synchronized</p>
        <button onClick={() => setAddProjectOpen(true)} className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#00ff88] hover:scale-105 text-black text-[11px] font-mono font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
          <Ic.Plus/> New Directive
        </button>
      </div>
      <div className="space-y-6">
        {projects.map(p => (
          <div key={p.id} className="bg-white/[0.02] rounded-[40px] border border-white/5 p-8 flex items-center gap-8 hover:border-[#00ff88]/30 hover:bg-white/[0.04] transition-all cursor-pointer group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent" />
            <div className="w-16 h-16 rounded-[24px] bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all"><Ic.Folder/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-5 mb-2">
                <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#00ff88] transition-colors">{p.name}</h4>
                <Badge text={p.status}/>
              </div>
              <p className="text-[11px] font-mono text-gray-500 truncate uppercase tracking-widest mb-4 leading-none">{p.description}</p>
              <div className="flex items-center gap-8 text-[9px] font-mono font-black text-gray-700 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 group-hover:text-gray-500 transition-colors"><Ic.Shield/>{p.pentests} OPERATIONS</span>
                <span className="flex items-center gap-2 group-hover:text-gray-500 transition-colors"><Ic.Users/>{p.members} ASSETS</span>
                <span className="flex items-center gap-2 group-hover:text-[#00ff88] transition-colors"><Ic.Clock/>DEADLINE: {p.due}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
              <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#00ff88]/40 text-gray-600 hover:text-[#00ff88] transition-all"><Ic.Edit/></button>
              <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/40 text-gray-600 hover:text-rose-500 transition-all"><Ic.Trash/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ActivityTab = () => (
    <div className="bg-white/[0.02] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
      <div className="px-10 py-8 border-b border-white/5 bg-white/[0.01]">
        <h3 className="font-black text-white text-xs font-mono uppercase tracking-[0.4em]">Integrated Intel Stream</h3>
      </div>
      <div className="divide-y divide-white/[0.02]">
        {MOCK_ACTIVITY.map(a => (
          <div key={a.id} className="px-10 py-6 flex items-start gap-6 hover:bg-white/[0.03] transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 border border-current/10 shadow-inner ${TYPE_COLORS[a.type]}`}>{avatar(a.user)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 group-hover:text-white transition-colors leading-relaxed uppercase tracking-widest font-mono"><span className="font-black text-white">{a.user}</span> <span className="opacity-60">{a.action}</span> <span className="font-black text-[#00ff88]">"{a.target}"</span></p>
              <p className="text-[9px] font-mono text-gray-700 flex items-center gap-2 mt-2 uppercase tracking-widest group-hover:text-gray-600 transition-colors"><Ic.Clock/>{a.time}</p>
            </div>
            <span className={`text-[9px] font-mono font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-current/10 mt-1 shrink-0 ${TYPE_COLORS[a.type]}`}>{a.type}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-8">
      <div className="bg-white/[0.02] rounded-[40px] border border-white/5 p-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />
        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-[#00ff88] transition-colors">Entity Configuration</h3>
        <p className="text-[11px] font-mono text-gray-500 mb-10 uppercase tracking-widest leading-relaxed max-w-xl">Synchronize entity metadata, identifiers, and organizational structure for mission clearance.</p>
        <button onClick={() => navigate("/organization-profile")} className="inline-flex items-center gap-4 px-8 py-4 bg-[#00ff88] hover:scale-105 text-black text-[11px] font-mono font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
          <Ic.Edit/> Sync Profile
        </button>
      </div>
      <div className="bg-rose-500/[0.02] rounded-[40px] border border-rose-500/10 p-12 shadow-2xl relative overflow-hidden group">
        <h3 className="text-xl font-black text-rose-500 mb-2 uppercase tracking-tight">Annihilation Sequence</h3>
        <p className="text-[11px] font-mono text-rose-500/40 mb-10 uppercase tracking-widest leading-relaxed max-w-xl">Execute a permanent data purge. This tactical action dissolves all entity associations and cannot be reverted.</p>
        <button className="inline-flex items-center gap-4 px-8 py-4 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-500 text-[11px] font-mono font-black uppercase tracking-widest rounded-2xl transition-all">
          <Ic.Trash/> Initialize Deletion
        </button>
      </div>
    </div>
  );

  const TABS = { overview: OverviewTab, members: MembersTab, pentests: PentestsTab, projects: ProjectsTab, activity: ActivityTab, settings: SettingsTab };
  const ActiveTab = TABS[tab] || OverviewTab;

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#00ff88]/30 selection:text-[#00ff88] overflow-x-hidden">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />

      {toast && (
        <div className={`fixed top-8 right-8 z-[1000] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl text-[11px] font-mono font-black uppercase tracking-widest border backdrop-blur-2xl animate-in slide-in-from-right-10
          ${toast.type === "success" ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30"}`}>
          {toast.type === "success" ? <Ic.Check/> : <Ic.Alert/>}
          {toast.msg}
        </div>
      )}

      <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center px-10 sticky top-0 z-[60] gap-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-[10px] font-mono font-black text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-[0.2em]">Dashboard</button>
          <Ic.ChevR/>
          <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">{orgName}</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <button className="relative p-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 hover:text-[#00ff88] transition-all">
            <Ic.Bell/>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]"/>
          </button>
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl pl-5 pr-3 py-2">
             <div className="text-right">
                <p className="text-[8px] font-mono font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Authorized</p>
                <p className="text-xs font-black text-white uppercase leading-none tracking-tight">{orgName}</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-black border border-[#00ff88]/30 text-[#00ff88] flex items-center justify-center font-mono font-black text-xs shadow-inner shadow-[#00ff88]/10">{avatar(orgName)}</div>
          </div>
        </div>
      </header>

      <div className="flex px-10 gap-10">
        <aside className="w-72 mt-10 shrink-0 space-y-2 sticky top-32 self-start flex flex-col">
          <div className="p-8 bg-white/[0.02] rounded-[32px] border border-white/5 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#00ff88]/10 transition-all" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00ff88]/20 to-emerald-600/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] font-black text-sm shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                {avatar(orgName)}
              </div>
              <div className="min-w-0">
                <p className="font-black text-white text-xs truncate uppercase tracking-tight">{orgName}</p>
                <p className="text-[10px] font-mono text-gray-600 truncate uppercase mt-0.5 tracking-widest">{orgSlug}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/10 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]"/>
              <span className="text-[9px] text-[#00ff88] font-black uppercase tracking-widest">Core Synchronized</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {NAV.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-5 px-8 py-4.5 rounded-[24px] text-[11px] font-mono font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group
                  ${tab === key ? "bg-white/[0.04] text-[#00ff88] shadow-2xl border border-[#00ff88]/20 -translate-x-2" : "text-gray-500 hover:bg-white/[0.02] hover:text-white hover:translate-x-1"}`}>
                <span className={tab === key ? "text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" : "text-gray-600 group-hover:text-gray-400"}><Icon/></span>
                {label}
                {tab === key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse"/>}
              </button>
            ))}
          </nav>

          <div className="pt-10 space-y-1.5">
            <button onClick={() => navigate("/organization-profile")} className="w-full flex items-center gap-5 px-8 py-4 rounded-[20px] text-[10px] font-mono font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
              <span className="text-gray-600"><Ic.Settings/></span> Profile Config
            </button>
            <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-5 px-8 py-4 rounded-[20px] text-[10px] font-mono font-black text-gray-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all uppercase tracking-widest border border-transparent hover:border-rose-500/20">
              <span className="text-gray-600 group-hover:text-rose-500"><Ic.Logout/></span> Terminate Link
            </button>
          </div>
        </aside>

        <main className="flex-1 py-10 min-w-0">
          <div className="mb-12">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">{NAV.find(n => n.key === tab)?.label}</h1>
            <p className="text-[11px] font-mono text-gray-600 mt-2 uppercase tracking-[0.3em] font-bold">{orgName} • Strategic Console.v2</p>
          </div>
          <ActiveTab/>
        </main>
      </div>

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Identity Authorization">
        <div className="space-y-6">
          <div><FLabel>Entity Communication Loop (Email)</FLabel><FInput type="email" placeholder="operator@nexus.core" value={newMember.email} onChange={e => setNewMember(p => ({...p, email: e.target.value}))}/></div>
          <div><FLabel>Strategic Designation (Role)</FLabel>
            <FSelect value={newMember.role} onChange={e => setNewMember(p => ({...p, role: e.target.value}))}>
              <option value="MEMBER">Member Operative</option>
              <option value="ADMIN">Tactical Admin</option>
              <option value="GUEST">External Asset</option>
            </FSelect>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={handleAddMember} className="flex-1 py-4 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">Transmit Invitation</button>
            <button onClick={() => setAddMemberOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={addProjectOpen} onClose={() => setAddProjectOpen(false)} title="New Strategic Directive">
        <div className="space-y-6">
          <div><FLabel>Directive Descriptor (Name)</FLabel><FInput type="text" placeholder="e.g. Operation Nightfall" value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))}/></div>
          <div><FLabel>Scope Manifest (Description)</FLabel><textarea className="w-full border border-white/10 rounded-2xl bg-white/[0.02] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 px-4 py-4 resize-none font-mono" rows={3} placeholder="Define mission parameters…" value={newProject.description} onChange={e => setNewProject(p => ({...p, description: e.target.value}))}/></div>
          <div><FLabel>Remediation Deadline</FLabel><FInput type="date" value={newProject.due} onChange={e => setNewProject(p => ({...p, due: e.target.value}))}/></div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => { showToast("Directive Synchronized!"); setAddProjectOpen(false); setNewProject({name:"",description:"",due:""}); }} className="flex-1 py-4 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">Create Directive</button>
            <button onClick={() => setAddProjectOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={addPentestOpen} onClose={() => setAddPentestOpen(false)} title="Initialize Sub-Operation">
        <div className="space-y-6">
          <div><FLabel>Operation Identifier</FLabel><FInput type="text" placeholder="e.g. Intel-Stream Audit" value={newPentest.name} onChange={e => setNewPentest(p => ({...p, name: e.target.value}))}/></div>
          <div><FLabel>Target Vector (Endpoint)</FLabel><FInput type="text" placeholder="e.g. alpha.nexus.core" value={newPentest.target} onChange={e => setNewPentest(p => ({...p, target: e.target.value}))}/></div>
          <div><FLabel>Assigned Asset</FLabel><FSelect value={newPentest.assignee} onChange={e => setNewPentest(p => ({...p, assignee: e.target.value}))}>
            <option value="">Select Operator…</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </FSelect></div>
          <div><FLabel>Tactical Severity</FLabel><FSelect value={newPentest.severity} onChange={e => setNewPentest(p => ({...p, severity: e.target.value}))}>
            <option value="LOW">Informational</option><option value="MEDIUM">Standard</option><option value="HIGH">Elevated</option><option value="CRITICAL">Maximum Threat</option>
          </FSelect></div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => { showToast("Operation Activated!"); setAddPentestOpen(false); setNewPentest({name:"",target:"",assignee:"",severity:"MEDIUM"}); }} className="flex-1 py-4 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">Initialize</button>
            <button onClick={() => setAddPentestOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizationDashboard;
