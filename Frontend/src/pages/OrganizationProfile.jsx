import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

// ─── Icon SVGs (inline, no extra dep needed) ─────────────────────────────────
const Icons = {
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V7l6-4v18M9 7H3v14M15 21V11" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
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

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "overview",      label: "Overview",       Icon: Icons.Dashboard },
  { key: "profile",       label: "Organization",   Icon: Icons.Building },
  { key: "members",       label: "Members",        Icon: Icons.Users },
  { key: "security",      label: "Security",       Icon: Icons.Shield },
  { key: "notifications", label: "Notifications",  Icon: Icons.Bell },
  { key: "billing",       label: "Billing",        Icon: Icons.Billing },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
const initials = (name) =>
  name
    ? name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "ORG";

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1">
      {label}
      {required && <span className="text-rose-500 text-xs">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 leading-relaxed">{hint}</p>}
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ icon: IconComp, ...props }) => (
  <div className="relative">
    {IconComp && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <IconComp />
      </span>
    )}
    <input
      {...props}
      className={`w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all
        py-2.5 ${IconComp ? "pl-10 pr-3" : "px-3"}`}
    />
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800
      focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all
      px-3 py-2.5 appearance-none cursor-pointer"
  >
    {children}
  </select>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    {(title || subtitle) && (
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    )}
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
);

// ─── Stat badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ label, value, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    green:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber:  "bg-amber-50 text-amber-700 border-amber-100",
    rose:   "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border px-4 py-3 ${colors[color]}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
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
  });

  // ── Fetch org ──────────────────────────────────────────────────────────────
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
          });
          if (org.logoUrl) setLogoPreview(org.logoUrl);
        }
      } catch {
        // org may not exist yet
      } finally {
        setLoading(false);
      }
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
      };

      if (organizationId) {
        const { data } = await api.patch(`/organizations/${organizationId}`, payload);
        setSuccess(data?.message || "Organization profile updated successfully.");
      } else {
        const { data } = await api.post("/organizations", payload);
        if (data?.data?.id) setOrganizationId(data.data.id);
        setSuccess(data?.message || "Organization created successfully.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to save. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading organization…</p>
        </div>
      </div>
    );
  }

  const displayName = form.name || "Your Organization";

  // ── Content panels ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeNav !== "profile") {
      const labels = {
        overview:      "Overview",
        members:       "Members",
        security:      "Security",
        notifications: "Notifications",
        billing:       "Billing",
      };
      return (
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-400">
            {NAV_ITEMS.find((n) => n.key === activeNav)?.Icon?.()}
          </div>
          <h3 className="text-base font-semibold text-gray-700">{labels[activeNav]}</h3>
          <p className="text-sm text-gray-400 mt-1">This section will be available soon.</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
            <span className="mt-0.5 shrink-0"><Icons.Alert /></span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
            <span className="mt-0.5 shrink-0"><Icons.Check /></span>
            <span>{success}</span>
          </div>
        )}

        {/* Basic Info */}
        <SectionCard title="Basic Information" subtitle="Core details shown publicly on your organization profile.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Organization Name" required>
              <Input
                type="text" name="name" value={form.name} onChange={handleChange}
                required placeholder="e.g. HackRact Security" icon={Icons.Building}
              />
            </Field>
            <Field label="Slug" hint="Used in URLs — lowercase, hyphens only.">
              <Input
                type="text" name="slug" value={form.slug} onChange={handleChange}
                placeholder="e.g. hackract-security"
              />
            </Field>
          </div>
          <Field label="Description" hint="Max 500 characters.">
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Briefly describe your organization's mission and scope…"
              className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all px-3 py-2.5 resize-none"
            />
          </Field>
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contact Information" subtitle="How clients and partners can reach your organization.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Primary Email">
              <Input
                type="email" name="primaryEmail" value={form.primaryEmail} onChange={handleChange}
                placeholder="contact@yourorg.com"
              />
            </Field>
            <Field label="Phone Number">
              <Input
                type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                placeholder="+1 555 123 4567"
              />
            </Field>
            <Field label="Website">
              <Input
                type="url" name="website" value={form.website} onChange={handleChange}
                placeholder="https://yourorg.com" icon={Icons.Globe}
              />
            </Field>
            <Field label="Industry">
              <Select name="industry" value={form.industry} onChange={handleChange}>
                <option value="">Select industry…</option>
                {["FinTech","HealthTech","CyberSecurity","E-Commerce","SaaS",
                  "Government","Defense","Education","Manufacturing","Other"].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Company Size">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["1–10","11–50","51–200","201–500","501–1000","1001–5000","5000+"].map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => setForm((p) => ({ ...p, size: s }))}
                  className={`rounded-lg border text-xs font-medium py-2 px-3 transition-all
                    ${form.size === s
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address" subtitle="Physical location of your organization's headquarters.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Address Line 1">
              <Input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="123 Main Street" />
            </Field>
            <Field label="Address Line 2">
              <Input type="text" name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Suite / Floor" />
            </Field>
            <Field label="City">
              <Input type="text" name="city" value={form.city} onChange={handleChange} placeholder="New York" />
            </Field>
            <Field label="State / Province">
              <Input type="text" name="state" value={form.state} onChange={handleChange} placeholder="NY" />
            </Field>
            <Field label="Postal Code">
              <Input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="10001" />
            </Field>
            <Field label="Country">
              <Input type="text" name="country" value={form.country} onChange={handleChange} placeholder="United States" />
            </Field>
          </div>
        </SectionCard>

        {/* Legal & Finance */}
        <SectionCard title="Legal & Financial" subtitle="Compliance and financial identifiers for your organization.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Registration Number">
              <Input type="text" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="e.g. US-123456789" />
            </Field>
            <Field label="Tax ID / VAT">
              <Input type="text" name="taxId" value={form.taxId} onChange={handleChange} placeholder="e.g. 12-3456789" />
            </Field>
            <Field label="Timezone">
              <Select name="timezone" value={form.timezone} onChange={handleChange}>
                <option value="">Select timezone…</option>
                {["UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
                  "Europe/London","Europe/Paris","Europe/Berlin","Asia/Dubai","Asia/Kolkata",
                  "Asia/Singapore","Asia/Tokyo","Australia/Sydney"].map(tz => (
                  <option key={tz} value={tz}>{tz.replace("_"," ")}</option>
                ))}
              </Select>
            </Field>
            <Field label="Currency">
              <Select name="currency" value={form.currency} onChange={handleChange}>
                <option value="">Select currency…</option>
                {["USD","EUR","GBP","AED","INR","SGD","JPY","AUD","CAD"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Icons.Check />
                {organizationId ? "Save Changes" : "Create Organization"}
              </>
            )}
          </button>
          <button
            type="button" disabled={saving}
            onClick={() => navigate("/organization-dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-400
              text-gray-600 hover:text-gray-800 text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Top Header Bar ───────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => navigate("/organization-dashboard")} className="hover:text-indigo-600 font-medium transition-colors">
            Dashboard
          </button>
          <Icons.ChevronRight />
          <span className="text-gray-800 font-semibold">Organization Settings</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {initials(form.name)}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] flex flex-col sticky top-14 self-start">
          {/* Org identity */}
          <div className="px-5 py-6 border-b border-gray-100">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="org logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-indigo-600 tracking-tight">
                      {initials(form.name)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-indigo-600 border-2 border-white shadow
                    flex items-center justify-center text-white hover:bg-indigo-700 transition-colors opacity-0 group-hover:opacity-100"
                  title="Upload logo"
                >
                  <Icons.Camera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800 truncate max-w-[160px]">{displayName}</p>
                {form.slug && (
                  <p className="text-xs text-indigo-500 mt-0.5">/{form.slug}</p>
                )}
                {organizationId ? (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                    Not created
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-2">
              <StatBadge label="Members" value="—" color="indigo" />
              <StatBadge label="Pentests" value="—" color="green" />
              <StatBadge label="Alerts" value="0" color="amber" />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-3 space-y-0.5">
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeNav === key
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <span className={activeNav === key ? "text-indigo-500" : "text-gray-400"}>
                  <Icon />
                </span>
                {label}
                {activeNav === key && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-4">
            <button
              onClick={() => navigate("/organization-dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500
                hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <span className="text-gray-400"><Icons.LogOut /></span>
              Back to Dashboard
            </button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 px-6 py-8 max-w-3xl">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              {NAV_ITEMS.find((n) => n.key === activeNav)?.label}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeNav === "profile"
                ? "Manage your organization's public profile, contact details, and legal info."
                : "This section is currently under construction."}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default OrganizationProfile;

