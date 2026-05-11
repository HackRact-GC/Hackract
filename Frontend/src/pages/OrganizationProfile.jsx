import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import SignaturePad from "../components/SignaturePad";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V7l6-4v18M9 7H3v14M15 21V11" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Camera: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Billing: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { key: "profile",       label: "Organization",   Icon: Icons.Building },
  { key: "overview",      label: "Overview",       Icon: Icons.Dashboard },
  { key: "members",       label: "Members",        Icon: Icons.Users },
  { key: "security",      label: "Security",       Icon: Icons.Shield },
  { key: "notifications", label: "Notifications",  Icon: Icons.Bell },
  { key: "billing",       label: "Billing",        Icon: Icons.Billing },
];

const initials = (name) =>
  name
    ? name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "ORG";

const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
      {label}
      {required && <span className="text-[#00c477]/60 text-xs">*</span>}
    </label>
    {children}
    {hint && <p className="text-[9px] font-mono text-gray-600 leading-relaxed uppercase tracking-widest pl-1">{hint}</p>}
  </div>
);

const Input = ({ icon: IconComp, ...props }) => (
  <div className="relative group">
    {IconComp && (
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00c477] transition-colors pointer-events-none">
        <IconComp />
      </span>
    )}
    <input
      {...props}
      className={`w-full border border-white/10 rounded-[20px] bg-white/[0.02] text-sm text-white placeholder-gray-600
        focus:outline-none focus:border-[#00c477]/50 focus:ring-1 focus:ring-[#00c477]/20 transition-all font-mono
        py-3.5 ${IconComp ? "pl-12 pr-4" : "px-5"}`}
    />
  </div>
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full border border-white/10 rounded-[20px] bg-white/[0.02] text-sm text-white focus:outline-none focus:border-[#00c477]/50 focus:ring-1 focus:ring-[#00c477]/20 transition-all px-5 py-3.5 cursor-pointer font-mono appearance-none"
  >
    {children}
  </select>
);

const SectionCard = ({ title, subtitle, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden mb-10 relative group shadow-2xl"
  >
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00c477]/20 to-transparent" />
    {(title || subtitle) && (
      <div className="px-10 py-6 border-b border-white/5 bg-white/[0.01]">
        <h3 className="text-[11px] font-mono font-black text-white uppercase tracking-[0.3em] group-hover:text-[#00c477] transition-colors">{title}</h3>
        {subtitle && <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-widest">{subtitle}</p>}
      </div>
    )}
    <div className="px-10 py-8 space-y-8">{children}</div>
  </motion.div>
);

const StatBadge = ({ label, value, color = "indigo" }) => {
  const colors = {
    indigo: "bg-[#00c477]/10 text-[#00c477] border-[#00c477]/20",
    green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-[24px] border px-4 py-4 ${colors[color]} hover:scale-105 transition-all cursor-default group/stat`}>
      <span className="text-xl font-black group-hover/stat:scale-110 transition-all font-mono">{value}</span>
      <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em] mt-1 text-gray-600 group-hover/stat:text-white transition-colors">{label}</span>
    </div>
  );
};

const OrganizationProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeNav, setActiveNav]       = useState("profile");
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [organizationId, setOrganizationId] = useState(null);
  const [logoPreview, setLogoPreview]   = useState(null);

  const [form, setForm] = useState({
    name:               "",
    slug:               "",
    website:            "",
    industry:           "",
    size:               "",
    phoneNumber:        "",
    primaryEmail:       "",
    description:        "",
    addressLine1:       "",
    addressLine2:       "",
    city:               "",
    state:              "",
    postalCode:         "",
    country:            "",
    timezone:           "",
    currency:           "",
    registrationNumber: "",
    taxId:              "",
    signatureData:      "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/organizations/me");
        const orgs = data?.data?.data || data?.data || [];
        if (orgs?.length > 0) {
          const org = orgs[0];
          setOrganizationId(org.id);
          setForm({
            name:               org.name               || "",
            slug:               org.slug               || "",
            website:            org.website            || "",
            industry:           org.industry           || "",
            size:               org.size               || "",
            phoneNumber:        org.phoneNumber        || "",
            primaryEmail:       org.primaryEmail       || "",
            description:        org.description        || "",
            addressLine1:       org.addressLine1       || "",
            addressLine2:       org.addressLine2       || "",
            city:               org.city               || "",
            state:              org.state              || "",
            postalCode:         org.postalCode         || "",
            country:            org.country            || "",
            timezone:           org.timezone           || "",
            currency:           org.currency           || "",
            registrationNumber: org.registrationNumber || "",
            taxId:              org.taxId              || "",
            signatureData:      org.signatureData      || "",
          });
          if (org.logoUrl) setLogoPreview(org.logoUrl);
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const trim = (v) => (v?.trim() || undefined);
      const payload = {
        name:               form.name.trim(),
        slug:               trim(form.slug),
        website:            trim(form.website),
        industry:           trim(form.industry),
        size:               trim(form.size),
        phoneNumber:        trim(form.phoneNumber),
        primaryEmail:       trim(form.primaryEmail),
        description:        trim(form.description),
        addressLine1:       trim(form.addressLine1),
        addressLine2:       trim(form.addressLine2),
        city:               trim(form.city),
        state:              trim(form.state),
        postalCode:         trim(form.postalCode),
        country:            trim(form.country),
        timezone:           trim(form.timezone),
        currency:           trim(form.currency),
        registrationNumber: trim(form.registrationNumber),
        taxId:              trim(form.taxId),
        signatureData:      form.signatureData,
      };

      if (organizationId) {
        const { data } = await api.patch(`/organizations/${organizationId}`, payload);
        setSuccess("Organization synchronized.");
      } else {
        const { data } = await api.post("/organizations", payload);
        if (data?.data?.id) setOrganizationId(data.data.id);
        setSuccess("Organization materialized.");
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Transmission failure.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-[#00c477] animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
          <p className="text-[10px] font-mono font-black text-[#00c477] uppercase tracking-[0.4em] animate-pulse">Scanning Entity Data...</p>
        </div>
      </div>
    );
  }

  const displayName = form.name || "Root Organization";

  const renderContent = () => {
    if (activeNav !== "profile") {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center bg-white/[0.01] border border-white/5 rounded-[48px] shadow-inner">
          <div className="w-20 h-20 rounded-3xl bg-[#00c477]/10 flex items-center justify-center mb-6 text-[#00c477] shadow-lg">
            {NAV_ITEMS.find((n) => n.key === activeNav)?.Icon?.()}
          </div>
          <h3 className="text-sm font-black text-white font-mono uppercase tracking-[0.4em]">{activeNav} Zone</h3>
          <p className="text-[10px] font-mono text-gray-600 mt-4 uppercase tracking-[0.2em] max-w-sm px-10 leading-relaxed">This quadrant of the entity matrix is currently being calibrated for strategic operations.</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-10">
        <SectionCard title="Core Directive" subtitle="Primary identifiers that synchronize your entity with the global grid.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Entity Identity" required>
              <Input
                type="text" name="name" value={form.name} onChange={handleChange}
                required placeholder="e.g. Nexus Security Core" icon={Icons.Building}
              />
            </Field>
            <Field label="Slug / URN" hint="Unique Resource Name identifiers.">
              <Input
                type="text" name="slug" value={form.slug} onChange={handleChange}
                placeholder="e.g. nexus-core-prime"
              />
            </Field>
          </div>
          <Field label="Description Matrix" hint="Max 500 characters for mission overview.">
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={4}
              placeholder="Define organization scope and strategic objectives…"
              className="w-full border border-white/10 rounded-[24px] bg-white/[0.02] text-sm text-white placeholder-gray-600
                focus:outline-none focus:border-[#00c477]/50 focus:ring-1 focus:ring-[#00c477]/20 transition-all px-5 py-4 resize-none font-mono"
            />
          </Field>
        </SectionCard>

        <SectionCard title="Interface Protocol" subtitle="Communication vectors for cross-entity synchronization.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Primary Comms Loop">
              <Input
                type="email" name="primaryEmail" value={form.primaryEmail} onChange={handleChange}
                placeholder="ops@nexus.core"
              />
            </Field>
            <Field label="Direct Link (Phone)">
              <Input
                type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                placeholder="+1 555-0199"
              />
            </Field>
            <Field label="Global Grid URL">
              <Input
                type="url" name="website" value={form.website} onChange={handleChange}
                placeholder="https://nexus.core" icon={Icons.Globe}
              />
            </Field>
            <Field label="Sector / Industry">
              <Select name="industry" value={form.industry} onChange={handleChange}>
                <option value="">Select industry…</option>
                {["CyberSecurity","FinTech","Defense","HealthTech","SaaS","GovTech","E-Commerce","Other"].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Personnel Scale (Company Size)">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["1–10","11–50","51–200","201–500","501–1000","5000+"].map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => setForm((p) => ({ ...p, size: s }))}
                  className={`rounded-[18px] border text-[10px] font-mono font-black py-3.5 px-4 transition-all uppercase tracking-widest
                    ${form.size === s
                      ? "bg-[#00c477] border-[#00c477] text-black shadow-[0_0_20px_rgba(0,255,136,0.2)] scale-105"
                      : "bg-white/[0.02] border-white/5 text-gray-600 hover:border-[#00c477]/30 hover:text-white"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        <SectionCard title="Coordinate Points" subtitle="Physical headquarters and geographical mission centers.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Base Vector 1"><Input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Coordinate 12-A" /></Field>
            <Field label="Base Vector 2"><Input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Level / Sub-bay" /></Field>
            <Field label="Zone / City"><Input name="city" value={form.city} onChange={handleChange} placeholder="Neo Tokyo" /></Field>
            <Field label="Prefecture / State"><Input name="state" value={form.state} onChange={handleChange} placeholder="NT-01" /></Field>
            <Field label="Grid Code"><Input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="581-000" /></Field>
            <Field label="Entity Region"><Input name="country" value={form.country} onChange={handleChange} placeholder="Pan-Pacific" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Digital Authorization" subtitle="Official signature of the organization representative for automated legal execution.">
          <div className="w-full h-64 bg-[#111111] border border-white/[0.05] rounded-xl relative overflow-hidden shadow-[0_0_30px_rgba(0,196,119,0.02)]">
            <SignaturePad 
              onSignatureChange={(data) => setForm(p => ({ ...p, signatureData: data }))}
              initialSignature={form.signatureData}
            />
          </div>
          {form.signatureData && (
             <p className="text-[10px] font-mono text-[#00c477] mt-2 tracking-widest uppercase">
               ✔ Signature Matrix Captured & Encrypted
             </p>
          )}
        </SectionCard>

        <div className="flex flex-wrap items-center gap-6 pt-2 bg-white/[0.01] p-10 rounded-[48px] border border-white/5 shadow-inner">
          <button
            type="submit" disabled={saving}
            className="flex items-center gap-4 px-10 py-5 bg-[#00c477] text-black rounded-[24px] text-[11px] font-mono font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:scale-105 transition-all disabled:opacity-60"
          >
            {saving ? "Transmitting…" : <><Icons.Check /> Commit Profile</>}
          </button>
          
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"/>
              {success}
            </motion.div>
          )}
          {error && (
            <div className="flex items-center gap-3 px-6 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest">
              <Icons.Alert />
              {error}
            </div>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#00c477]/30 selection:text-[#00c477] transition-colors">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#00c477]/5 rounded-full blur-[140px] pointer-events-none" />

      <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center px-10 sticky top-0 z-[60] gap-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-[10px] font-mono font-black text-gray-500 hover:text-[#00c477] transition-colors uppercase tracking-[0.2em]">Dashboard</button>
          <Icons.ChevronRight />
          <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em] opacity-80">Entity Strategy Control</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#00c477]/30 text-[#00c477] flex items-center justify-center font-mono font-black text-xs shadow-inner shadow-[#00c477]/10">
            {initials(form.name)}
          </div>
        </div>
      </header>

      <div className="flex px-10 gap-10">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="w-80 mt-12 shrink-0 space-y-2 sticky top-36 h-fit self-start">
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 mb-8 shadow-2xl flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00c477]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#00c477]/10 transition-all" />
            <div className="relative group mb-8">
              <div className="w-28 h-28 rounded-[36px] border border-white/10 bg-black/50 overflow-hidden shadow-inner flex items-center justify-center group-hover:border-[#00c477]/30 transition-all">
                {logoPreview ? (
                  <img src={logoPreview} alt="org logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-[#00c477] font-mono drop-shadow-[0_0_10px_#00c477]">
                    {initials(form.name)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-[14px] bg-[#00c477] text-black border-4 border-[#050505] shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-10"
                title="Update Manifest"
              >
                <Icons.Camera />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
            
            <div className="text-center w-full">
              <p className="text-2xl font-black text-white truncate px-2 leading-none mb-1 uppercase tracking-tight">{displayName}</p>
              {form.slug && (
                <p className="text-[10px] font-mono text-[#00c477] uppercase tracking-[0.2em] mb-8 font-bold opacity-70">URN: /{form.slug}</p>
              )}
              
              <div className="grid grid-cols-3 gap-3 w-full border-t border-white/5 pt-8">
                <StatBadge label="Assets" value="—" color="indigo" />
                <StatBadge label="Tactics" value="—" color="green" />
                <StatBadge label="Threats" value="0" color="rose" />
              </div>
            </div>
          </div>

          <nav className="space-y-2 px-2 pb-10">
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={`w-full flex items-center gap-5 px-8 py-4.5 rounded-[24px] text-[11px] font-mono font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group
                  ${activeNav === key
                    ? "bg-white/[0.04] text-[#00c477] shadow-2xl border border-[#00c477]/20 -translate-x-2"
                    : "text-gray-500 hover:bg-white/[0.02] hover:text-white hover:translate-x-1"
                  }`}
              >
                <span className={activeNav === key ? "text-[#00c477] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" : "text-gray-600 group-hover:text-gray-400"}>
                  <Icon />
                </span>
                {label}
                {activeNav === key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00c477] shadow-[0_0_10px_#00c477] animate-pulse"/>}
              </button>
            ))}
            
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-5 px-8 py-4.5 rounded-[24px] text-[10px] font-mono font-black text-gray-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all uppercase tracking-widest mt-12 border border-transparent hover:border-rose-500/10"
            >
              <Icons.LogOut /> 
              Terminate Link
            </button>
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 py-12 min-w-0 max-w-4xl">
          <div className="mb-14 pl-1">
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">
              {NAV_ITEMS.find((n) => n.key === activeNav)?.label} Matrix
            </h1>
            <p className="text-[11px] font-mono text-gray-600 mt-2 uppercase tracking-[0.3em] font-bold">
              Adjusting entity synchronization parameters / Node_v.Prime
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default OrganizationProfile;

