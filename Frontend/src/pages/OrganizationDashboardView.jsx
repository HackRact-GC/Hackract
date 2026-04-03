import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import {
  FiShield, FiUsers, FiFolder, FiTarget, FiClock, FiActivity, FiTrendingUp, FiAlertTriangle
} from "react-icons/fi";

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-black/70 border border-white/10 p-6 rounded-4xl flex items-center gap-6 group hover:border-[#00ff88]/20 transition-all duration-300 backdrop-blur-md">
    <div className={`w-14 h-14 rounded-2xl bg-black flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[#00ff88] group-hover:text-black transition-all shadow-inner`}>
      <Icon className={color + " group-hover:text-black transition-colors"} size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-3xl font-bold text-white tracking-tighter truncate">{value}</p>
      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">{label}</p>
      {sub && <p className="text-[9px] text-white/40 mt-1 font-mono">{sub}</p>}
    </div>
  </div>
);

const Badge = ({ text, type = "default" }) => {
  const styles = {
    ACTIVE:      "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30",
    IN_PROGRESS: "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30",
    PENDING:     "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30",
    CRITICAL:    "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30",
    default:     "bg-black text-white border-white/10",
  };
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${styles[text] || styles.default}`}>
      {text}
    </span>
  );
};

const OrganizationDashboardView = () => {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/organizations/me");
        const orgs = data?.data || [];
        if (orgs?.length) setOrg(orgs[0]);
      } catch (err) {
        console.error("Organization sync failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-10">
      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Network Assets" value="248" sub="+12 this month" icon={FiTarget} color="text-[#00ff88]" />
        <StatCard label="Active Programs" value="04" sub="2 Managed Services" icon={FiShield} color="text-[#00ff88]" />
        <StatCard label="Risk Findings" value="18" sub="3 Critical Priority" icon={FiAlertTriangle} color="text-[#00ff88]" />
        <StatCard label="Vendor Pulse" value="98%" sub="MTTR: 4.2 Days" icon={FiTrendingUp} color="text-[#00ff88]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        {/* Project Roster */}
        <div className="bg-black/70 rounded-4xl border border-white/10 overflow-hidden flex flex-col backdrop-blur-md shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 className="text-xs font-black text-white/70 uppercase tracking-[0.2em] flex items-center gap-3">
              <FiFolder className="text-[#00ff88]" /> Security Program Portfolio
            </h3>
            <button className="text-[10px] font-bold text-[#00ff88] hover:text-white transition-colors uppercase tracking-widest">New Initiative</button>
          </div>
          <div className="p-8 grid md:grid-cols-2 gap-6">
            {[
              { id: 1, name: "Cloud Hardening 2024", status: "ACTIVE", pentests: 4, drift: "-2%" },
              { id: 2, name: "FinBank API Audit", status: "IN_PROGRESS", pentests: 2, drift: "+5%" },
              { id: 3, name: "Legacy System Scans", status: "PENDING", pentests: 1, drift: "0%" },
              { id: 4, name: "Edge Guard Proxy", status: "ACTIVE", pentests: 7, drift: "-12%" },
            ].map(p => (
              <div key={p.id} className="p-6 rounded-3xl bg-black border border-white/10 hover:border-[#00ff88]/30 group transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#00ff88] border border-white/10 group-hover:bg-[#00ff88] group-hover:text-black transition-all">
                    <FiShield size={18} />
                  </div>
                  <Badge text={p.status}/>
                </div>
                <h4 className="font-bold text-white text-lg mb-1 group-hover:text-[#00ff88] transition-colors">{p.name}</h4>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                        <FiTarget /> {p.pentests} Scope Targets
                    </div>
                    <div className="text-[10px] font-mono font-bold text-[#00ff88]">
                        {p.drift} VS LY
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Activity Telemetry */}
        <div className="bg-black/70 rounded-4xl border border-white/10 overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 className="text-xs font-black text-white/70 uppercase tracking-[0.2em] flex items-center gap-3">
              <FiActivity className="text-[#00ff88]" /> System Telemetry
            </h3>
            <Badge text="Live" />
          </div>
          <div className="p-8 space-y-6">
            {[
              { user: "Alice Rogers", action: "Validated Critical Vuln", target: "Auth Service", time: "2m ago" },
              { user: "System", action: "Automatic Scan Complete", target: "Main Gateway", time: "15m ago" },
              { user: "Mark Vance", action: "Provisioned Env", target: "Dev Node 4", time: "1h ago" },
              { user: "Alice Rogers", action: "Initiated Triage", target: "API Endpoint", time: "3h ago" },
              { user: "System", action: "Weekly Report Generated", target: "Q3 Audit", time: "5h ago" },
            ].map((a, i) => (
              <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/10 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-[#00ff88] shrink-0">
                    {a.user[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-white/70">
                    <span className="font-black text-white">{a.user}</span> {a.action}
                  </p>
                  <p className="text-xs font-bold text-[#00ff88] mt-0.5 truncate">{a.target}</p>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <FiClock size={10} /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboardView;
