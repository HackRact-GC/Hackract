import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import {
  FiGrid,
  FiShield,
  FiBriefcase,
  FiFileText,
  FiTarget,
  FiSettings,
  FiActivity,
  FiCheckCircle,
  FiLogOut,
  FiSearch,
} from "react-icons/fi";

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const primaryOrganizationId = user?.organizations?.[0]?.id;

  const isSuperAdmin = user?.roles?.some((role) => role.type === "SUPER_ADMIN");
  const isOrgView = user?.roles?.some((role) => role.type === "ORG_ADMIN") && !isSuperAdmin;

  const navItems = useMemo(() => {
    if (isOrgView) {
      return [
        { label: "Executive Overview", route: "/dashboard", icon: FiGrid },
        { label: "Security Programs", route: "/projects", icon: FiShield },
        { label: "Organization Profile", route: "/organization-profile", icon: FiBriefcase },
        { label: "Organization Verification", route: primaryOrganizationId ? `/organization-verification/${primaryOrganizationId}` : "/organization-profile", icon: FiCheckCircle },
        { label: "System Config", route: "/organization-profile", icon: FiSettings },
      ];
    }

    return [
      { label: "Operational Center", route: "/dashboard", icon: FiGrid },
      { label: "Public Engagements", route: "/engagements", icon: FiTarget },
      { label: "My Proposals", route: "/my-applications", icon: FiFileText },
      { label: "Active Missions", route: "/projects", icon: FiShield },
      { label: "Risk Reports", route: "/projects", icon: FiActivity },
      { label: "Operative Settings", route: "/hacker-profile", icon: FiSettings },
    ];
  }, [isOrgView, primaryOrganizationId]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (route) => {
    if (route === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(route);
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-[#00ff88]/30 selection:text-black">
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-black shadow-2xl relative z-20">
        <div className="px-8 py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00ff88] rounded-xl flex items-center justify-center text-black font-black shadow-[0_0_18px_rgba(0,255,136,0.25)]">
              λ
            </div>
            <div className="text-xl font-bold tracking-tighter text-white">
              HACKRACT<span className="text-[#00ff88] text-[10px] ml-1 opacity-70">PRO</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`w-full group px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center gap-4 ${
                isActive(item.route)
                  ? "bg-white/10 text-white shadow-xl shadow-black/20 border border-white/15"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`text-lg ${isActive(item.route) ? "text-[#00ff88]" : "text-white/40 group-hover:text-[#00ff88]"} transition-colors`} />
              {item.label}
            </button>
          ))}

          {isSuperAdmin && (
            <div className="pt-8 px-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">Admin Overrides</p>
              <button
                onClick={() => navigate("/admin/approvals")}
                className="w-full px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 hover:bg-[#00ff88]/15 transition-all flex items-center gap-3"
              >
                <FiCheckCircle size={16} /> Approvals Pipeline
              </button>
            </div>
          )}
        </nav>

        <div className="p-8 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white border border-white/10">
              {user?.fullName?.[0] || user?.handle?.[0] || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || user?.handle}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-tighter">Verified Agent</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-white/40 hover:text-[#00ff88] transition-colors">
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
