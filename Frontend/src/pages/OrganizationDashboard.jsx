import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

// ─── Tiny inline SVG icons ────────────────────────────────────────────────────
const Ic = {
  Grid: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Folder: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
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
  OWNER:  "bg-violet-100 text-violet-700",
  ADMIN:  "bg-blue-100 text-blue-700",
  MEMBER: "bg-gray-100 text-gray-600",
  GUEST:  "bg-amber-100 text-amber-700",
};

const STATUS_COLORS = {
  ACTIVE:     "bg-emerald-100 text-emerald-700",
  IN_PROGRESS:"bg-blue-100 text-blue-700",
  PENDING:    "bg-amber-100 text-amber-700",
  COMPLETED:  "bg-gray-100 text-gray-600",
  CRITICAL:   "bg-rose-100 text-rose-700",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color }) => {
  const bg = { indigo:"bg-indigo-50 text-indigo-600", emerald:"bg-emerald-50 text-emerald-600", amber:"bg-amber-50 text-amber-600", rose:"bg-rose-50 text-rose-600", violet:"bg-violet-50 text-violet-600" };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${bg[color]} flex items-center justify-center shrink-0`}>
        <Icon />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ text, map = STATUS_COLORS }) => (
  <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${map[text] || "bg-gray-100 text-gray-500"}`}>
    {text}
  </span>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><Ic.X/></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Input / Select helpers ───────────────────────────────────────────────────
const FInput = (props) => (
  <input {...props} className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-500 transition-all px-3 py-2.5"/>
);
const FSelect = ({ children, ...props }) => (
  <select {...props} className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-500 transition-all px-3 py-2.5 cursor-pointer">
    {children}
  </select>
);
const FLabel = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{children}</label>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const Empty = ({ Icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-300"><Icon/></div>
    <p className="font-semibold text-gray-500">{title}</p>
    {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
  </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────
const OrganizationDashboard = () => {
  const navigate  = useNavigate();
  const [tab, setTab]         = useState("overview");
  const [org, setOrg]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [pentests]            = useState(MOCK_PENTESTS);
  const [projects]            = useState(MOCK_PROJECTS);

  // ── Modals ──────────────────────────────────────────────────────────────────
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
    showToast("Invitation sent successfully!");
  };

  const handleRemoveMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast("Member removed.", "info");
  };

  const orgName = org?.name || "Your Organization";
  const orgSlug = org?.slug ? `/${org.slug}` : "";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"/>
        <p className="text-sm text-gray-500 font-medium">Loading dashboard…</p>
      </div>
    </div>
  );

  // ── OVERVIEW ────────────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Members"   value={members.length}  sub="Active users"       icon={Ic.Users}  color="indigo"/>
        <StatCard label="Pentests"  value={pentests.length} sub="This quarter"       icon={Ic.Shield} color="rose"/>
        <StatCard label="Projects"  value={projects.length} sub="Total projects"     icon={Ic.Folder} color="violet"/>
        <StatCard label="Findings"  value="24"              sub="Open vulnerabilities" icon={Ic.Target} color="amber"/>
      </div>

      {/* Two-column area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pentests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Pentests</h3>
            <button onClick={() => setTab("pentests")} className="text-xs text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {pentests.slice(0,3).map(p => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0"><Ic.Shield/></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Ic.Globe/>{p.target}</p>
                  </div>
                </div>
                <Badge text={p.status}/>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Activity Feed</h3>
            <button onClick={() => setTab("activity")} className="text-xs text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_ACTIVITY.slice(0,4).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{avatar(a.user)}</div>
                <div>
                  <p className="text-sm text-gray-700"><span className="font-semibold">{a.user}</span> {a.action} <span className="text-indigo-600">"{a.target}"</span></p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Ic.Clock/>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Active Projects</h3>
          <button onClick={() => setTab("projects")} className="text-xs text-indigo-600 hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {projects.map(p => (
            <div key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><Ic.Folder/></div>
                <Badge text={p.status}/>
              </div>
              <p className="font-semibold text-gray-800 text-sm mt-2">{p.name}</p>
              <p className="text-xs text-gray-400 mt-1 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Ic.Shield/>{p.pentests} pentests</span>
                <span className="flex items-center gap-1"><Ic.Users/>{p.members} members</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── MEMBERS ─────────────────────────────────────────────────────────────────
  const MembersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? "s" : ""} in this organization</p>
        <button onClick={() => setAddMemberOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          <Ic.Plus/> Invite Member
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{avatar(m.name)}</div>
                    <div>
                      <p className="font-medium text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5"><Badge text={m.role} map={ROLE_COLORS}/></td>
                <td className="px-5 py-3.5"><Badge text={m.status}/></td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{m.joinedAt}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.role !== "OWNER" && (
                      <button onClick={() => handleRemoveMember(m.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors"><Ic.Trash/></button>
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

  // ── PENTESTS ─────────────────────────────────────────────────────────────────
  const SEV_COLORS = { CRITICAL:"bg-rose-100 text-rose-700", HIGH:"bg-orange-100 text-orange-700", MEDIUM:"bg-amber-100 text-amber-700", LOW:"bg-blue-100 text-blue-700" };
  const PentestsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{pentests.length} pentest{pentests.length !== 1 ? "s" : ""} total</p>
        <button onClick={() => setAddPentestOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          <Ic.Plus/> New Pentest
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pentests.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><Ic.Shield/></div>
              <div className="flex items-center gap-2">
                <Badge text={p.severity} map={SEV_COLORS}/>
                <Badge text={p.status}/>
              </div>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">{p.name}</h4>
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3"><Ic.Globe/>{p.target}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1"><div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[9px]">{avatar(p.assignee)}</div>{p.assignee}</div>
              <div className="flex items-center gap-1"><Ic.Clock/>{p.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── PROJECTS ──────────────────────────────────────────────────────────────────
  const ProjectsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        <button onClick={() => setAddProjectOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          <Ic.Plus/> New Project
        </button>
      </div>
      <div className="space-y-3">
        {projects.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Ic.Folder/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-gray-800">{p.name}</h4>
                <Badge text={p.status}/>
              </div>
              <p className="text-sm text-gray-400 truncate">{p.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Ic.Shield/>{p.pentests} pentests</span>
                <span className="flex items-center gap-1"><Ic.Users/>{p.members} members</span>
                <span className="flex items-center gap-1"><Ic.Clock/>Due {p.due}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"><Ic.Edit/></button>
              <button className="p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors"><Ic.Trash/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ACTIVITY ─────────────────────────────────────────────────────────────────
  const TYPE_COLORS = { pentest:"bg-rose-100 text-rose-600", member:"bg-indigo-100 text-indigo-600", project:"bg-violet-100 text-violet-600", settings:"bg-gray-100 text-gray-500" };
  const ActivityTab = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm">All Activity</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {MOCK_ACTIVITY.map(a => (
          <div key={a.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${TYPE_COLORS[a.type]}`}>{avatar(a.user)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">{a.user}</span> <span className="text-gray-500">{a.action}</span> <span className="font-medium text-indigo-600">"{a.target}"</span></p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Ic.Clock/>{a.time}</p>
            </div>
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 shrink-0 ${TYPE_COLORS[a.type]}`}>{a.type}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── SETTINGS ──────────────────────────────────────────────────────────────────
  const SettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Organization Profile</h3>
        <p className="text-sm text-gray-400 mb-4">Update your organization's name, logo, contact and legal details.</p>
        <button onClick={() => navigate("/organization-profile")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          <Ic.Edit/> Edit Profile
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Danger Zone</h3>
        <p className="text-sm text-gray-400 mb-4">Permanently delete this organization and all of its data. This action cannot be undone.</p>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-sm font-semibold rounded-xl transition-all">
          <Ic.Trash/> Delete Organization
        </button>
      </div>
    </div>
  );

  const TABS = { overview: OverviewTab, members: MembersTab, pentests: PentestsTab, projects: ProjectsTab, activity: ActivityTab, settings: SettingsTab };
  const ActiveTab = TABS[tab] || OverviewTab;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border
          ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
          {toast.type === "success" ? <Ic.Check/> : <Ic.Alert/>}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-30 gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <button onClick={() => navigate("/dashboard")} className="hover:text-indigo-600 font-medium transition-colors text-gray-500">Dashboard</button>
          <Ic.ChevR/>
          <span className="font-semibold text-gray-800">{orgName}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Ic.Bell/>
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"/>
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{avatar(orgName)}</div>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="w-60 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] sticky top-14 self-start flex flex-col">
          {/* Org card */}
          <div className="px-4 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                {avatar(orgName)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{orgName}</p>
                <p className="text-xs text-gray-400 truncate">{orgSlug || "organization"}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"/>
              <span className="text-[11px] text-emerald-600 font-semibold">Active Organization</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-3 space-y-0.5">
            {NAV.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${tab === key ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                <span className={tab === key ? "text-indigo-500" : "text-gray-400"}><Icon/></span>
                {label}
                {tab === key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"/>}
              </button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
            <button onClick={() => navigate("/organization-profile")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all">
              <span className="text-gray-400"><Ic.Settings/></span> Profile Settings
            </button>
            <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
              <span className="text-gray-400"><Ic.Logout/></span> Back to Dashboard
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 p-6 min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{NAV.find(n => n.key === tab)?.label}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{orgName} · Admin Dashboard</p>
            </div>
          </div>
          <ActiveTab/>
        </main>
      </div>

      {/* ── Add Member Modal ── */}
      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div><FLabel>Email Address</FLabel><FInput type="email" placeholder="colleague@company.com" value={newMember.email} onChange={e => setNewMember(p => ({...p, email: e.target.value}))}/></div>
          <div><FLabel>Role</FLabel>
            <FSelect value={newMember.role} onChange={e => setNewMember(p => ({...p, role: e.target.value}))}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="GUEST">Guest</option>
            </FSelect>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddMember} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all">Send Invitation</button>
            <button onClick={() => setAddMemberOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Add Project Modal ── */}
      <Modal open={addProjectOpen} onClose={() => setAddProjectOpen(false)} title="Create New Project">
        <div className="space-y-4">
          <div><FLabel>Project Name</FLabel><FInput type="text" placeholder="e.g. ACME Security Suite" value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))}/></div>
          <div><FLabel>Description</FLabel><textarea className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-500 px-3 py-2.5 resize-none" rows={3} placeholder="Brief project scope…" value={newProject.description} onChange={e => setNewProject(p => ({...p, description: e.target.value}))}/></div>
          <div><FLabel>Due Date</FLabel><FInput type="date" value={newProject.due} onChange={e => setNewProject(p => ({...p, due: e.target.value}))}/></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { showToast("Project created!"); setAddProjectOpen(false); setNewProject({name:"",description:"",due:""}); }} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all">Create Project</button>
            <button onClick={() => setAddProjectOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Add Pentest Modal ── */}
      <Modal open={addPentestOpen} onClose={() => setAddPentestOpen(false)} title="Create New Pentest">
        <div className="space-y-4">
          <div><FLabel>Pentest Name</FLabel><FInput type="text" placeholder="e.g. API Security Assessment" value={newPentest.name} onChange={e => setNewPentest(p => ({...p, name: e.target.value}))}/></div>
          <div><FLabel>Target</FLabel><FInput type="text" placeholder="e.g. api.yourcompany.com" value={newPentest.target} onChange={e => setNewPentest(p => ({...p, target: e.target.value}))}/></div>
          <div><FLabel>Assign To</FLabel><FSelect value={newPentest.assignee} onChange={e => setNewPentest(p => ({...p, assignee: e.target.value}))}>
            <option value="">Select member…</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </FSelect></div>
          <div><FLabel>Severity</FLabel><FSelect value={newPentest.severity} onChange={e => setNewPentest(p => ({...p, severity: e.target.value}))}>
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
          </FSelect></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { showToast("Pentest created!"); setAddPentestOpen(false); setNewPentest({name:"",target:"",assignee:"",severity:"MEDIUM"}); }} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all">Create Pentest</button>
            <button onClick={() => setAddPentestOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizationDashboard;
