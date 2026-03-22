import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/authContext.jsx";

const AGREEMENT_TYPES = [
  { label: "Terms of Service", value: "terms_of_service" },
  { label: "Privacy Policy", value: "privacy_policy" },
  { label: "NDA", value: "nda" },
  { label: "SLA", value: "sla" },
];

const LegalAgreementCreate = () => {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();

  const roleType = user?.roles?.[0]?.type;
  const isSuperAdmin = roleType === "SUPER_ADMIN";

  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("terms_of_service");
  const [version, setVersion] = useState("1.0");
  const [isActive, setIsActive] = useState(true);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const canSubmit = useMemo(() => {
    return Boolean(isSuperAdmin && title.trim() && version.trim() && type && file);
  }, [isSuperAdmin, title, version, type, file]);

  const onPickFile = async (nextFile) => {
    setFile(nextFile || null);
    setPreview("");

    if (!nextFile) return;

    try {
      const text = await nextFile.text();
      setPreview(text);

      if (!title.trim()) {
        const base = nextFile.name?.replace(/\.[^.]+$/, "") || "";
        if (base) setTitle(base);
      }
    } catch (error) {
      console.error("Failed reading file", error);
      toast.error("Could not read file");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("type", type);
      form.append("version", version);
      form.append("isActive", String(isActive));
      form.append("file", file);

      await api.post("/legal-agreements", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Legal agreement created");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create legal agreement";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Forbidden</h1>
          <p className="text-sm text-gray-600 mt-2">
            Only SUPER_ADMIN can create legal agreements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-lg font-semibold text-gray-900">Create Legal Agreement</h1>
            <p className="text-sm text-gray-600 mt-1">Upload a file, review it, then publish.</p>
          </div>

          <form onSubmit={submit} className="px-6 py-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 placeholder-gray-400 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Terms of Service v2.0"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                >
                  {AGREEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Version</label>
                <input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 placeholder-gray-400 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  placeholder="e.g., 2.0"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Set as active
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Agreement File</label>
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
                required
              />
              <p className="text-[11px] text-gray-500">Supported: .txt, .md (stored as text).</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Preview (read first)</label>
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 h-64 overflow-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">{preview || "Choose a file to preview."}</pre>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold px-4 py-2.5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LegalAgreementCreate;
