import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBell,
  FiDownload,
  FiFileText,
  FiLoader,
  FiShield,
  FiUser,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../api/axiosConfig";

const Reports = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("projectId");
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(!!projectId);
  const [generating, setGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf"); // 'pdf' | 'json'
  const [project, setProject] = useState(null);
  const [findings, setFindings] = useState([]);
  const [modules, setModules] = useState({
    execSummary: true,
    vulnTable: true,
    methodology: false,
    rawLogs: false,
  });

  const loadData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [pRes, fRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/findings?pentestId=${projectId}&limit=100`),
      ]);
      // Handle both { data: { data: project } } and { data: project } shapes
      setProject(pRes.data?.data ?? pRes.data);
      setFindings(fRes.data?.data ?? fRes.data ?? []);
    } catch (e) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const severityCounts = findings.reduce(
    (acc, f) => {
      const s = f.severity?.toUpperCase() || "INFO";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
  );

  const toggleModule = (mod) => {
    setModules((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  // ── Client-side jsPDF fallback ──────────────────────────────────────────────
  const generateClientPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const green = [0, 196, 119];
    const dark = [10, 10, 10];

    // Cover
    doc.setFillColor(...dark);
    doc.rect(0, 0, 595, 200, "F");
    doc.setFillColor(...green);
    doc.rect(0, 200, 595, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(project?.name || "Security Report", 40, 100);

    doc.setFontSize(11);
    doc.setTextColor(156, 163, 175);
    doc.text(project?.organization?.name || "Hackract Assessment", 40, 125);

    doc.setFontSize(9);
    doc.text(new Date().toLocaleDateString(), 40, 145);

    // Summary
    doc.setTextColor(...dark);
    doc.setFontSize(14);
    doc.text("Executive Summary", 40, 240);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(
      `Total findings: ${findings.length}  |  Critical: ${severityCounts.CRITICAL}  |  High: ${severityCounts.HIGH}  |  Medium: ${severityCounts.MEDIUM}  |  Low: ${severityCounts.LOW}`,
      40,
      265,
    );

    // Findings table
    if (findings.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...dark);
      doc.text("Detected Vulnerabilities", 40, 310);

      let y = 335;
      doc.setFillColor(17, 24, 39);
      doc.rect(40, y - 14, 515, 18, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("SEVERITY", 45, y - 3);
      doc.text("TITLE", 120, y - 3);
      doc.text("CVSS", 490, y - 3);

      y += 10;
      doc.setFont("helvetica", "normal");
      findings.slice(0, 30).forEach((f, i) => {
        if (y > 770) {
          doc.addPage();
          y = 60;
        }
        if (i % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(40, y - 12, 515, 18, "F");
        }
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(8);
        doc.text(f.severity || "—", 45, y);
        const title = f.title?.substring(0, 55) || "—";
        doc.text(title, 120, y);
        doc.text(
          f.cvssScore != null ? Number(f.cvssScore).toFixed(1) : "—",
          490,
          y,
        );
        y += 18;
      });
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("HACKRACT SENTINEL PROTOCOL  ·  CONFIDENTIAL", 40, 820);

    const name = (project?.name || "Report")
      .replace(/\s+/g, "-")
      .substring(0, 40);
    doc.save(`Hackract-Report-${name}.pdf`);
  };

  // ── JSON export (client-side) ───────────────────────────────────────────────
  const handleJsonExport = () => {
    if (!projectId && findings.length === 0) {
      return toast.error("No project data loaded to export.");
    }
    const payload = {
      generatedAt: new Date().toISOString(),
      project: project || { name: "Demo Report" },
      findings,
      severityCounts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Hackract-Report-${(project?.name || "export").replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON report downloaded!");
  };

  // ── Main generate handler ───────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (exportFormat === "json") {
      return handleJsonExport();
    }

    if (!projectId) {
      // No project loaded — use client-side fallback
      generateClientPdf();
      toast.success("Client-side PDF generated (no project selected)");
      return;
    }

    setGenerating(true);
    const toastId = toast.loading("Building PDF report…");

    try {
      const response = await api.post(
        "/reports/generate",
        { projectId, modules },
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const name = (project?.name || "Report")
        .replace(/\s+/g, "-")
        .substring(0, 40);
      a.href = url;
      a.download = `Hackract-Report-${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Report downloaded!", { id: toastId });
    } catch (err) {
      console.warn(
        "Server PDF failed, falling back to client-side:",
        err.message,
      );
      toast.loading("Server error — generating client-side PDF…", {
        id: toastId,
      });
      try {
        generateClientPdf();
        toast.success("Client-side PDF generated!", { id: toastId });
      } catch (fallbackErr) {
        toast.error("PDF generation failed.", { id: toastId });
      }
    } finally {
      setGenerating(false);
    }
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full w-full bg-[#0a0a0b] text-gray-300 font-sans overflow-hidden border border-white/5 rounded-[32px] box-border shadow-2xl relative">
      {/* Left Sidebar (Configuration) */}
      <div className="w-80 bg-[#111215] border-r border-[#1e1e24] flex-col pt-6 pb-6 shadow-2xl relative z-10 hidden xl:flex">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
            >
              <FiArrowLeft size={16} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
              Return
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
            Report Generator
          </h2>
          <p className="text-xs text-gray-500 font-mono tracking-wide">
            Mission parameter export
          </p>
          {!projectId && (
            <p className="text-[10px] text-amber-400 mt-2 font-mono">
              ⚠ No project selected — demo mode
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide">
          {/* Export Formats */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("pdf")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  exportFormat === "pdf"
                    ? "border-[#00ff41] bg-[#00ff41]/5 text-[#00ff41]"
                    : "border-white/5 hover:border-white/20 bg-black/20 text-gray-400 hover:text-white"
                }`}
              >
                <FiFileText size={20} className="mb-2" />
                <span className="text-xs font-bold">PDF</span>
              </button>
              <button
                onClick={() => setExportFormat("json")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  exportFormat === "json"
                    ? "border-[#00ff41] bg-[#00ff41]/5 text-[#00ff41]"
                    : "border-white/5 hover:border-white/20 bg-black/20 text-gray-400 hover:text-white"
                }`}
              >
                <FiFileText size={20} className="mb-2" />
                <span className="text-xs font-bold">JSON</span>
              </button>
            </div>
          </div>

          {/* Report Modules — only relevant for PDF */}
          {exportFormat === "pdf" && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Report Modules
              </h3>
              <div className="space-y-2">
                {[
                  { key: "execSummary", label: "Executive Summary" },
                  { key: "vulnTable", label: "Vulnerability Findings" },
                  { key: "methodology", label: "Methodology" },
                  { key: "rawLogs", label: "Raw Payload Logs" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="text-sm font-medium text-white">
                      {label}
                    </span>
                    <button
                      onClick={() => toggleModule(key)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${modules[key] ? "bg-[#00ff41]" : "bg-gray-600"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${modules[key] ? "left-[18px]" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 mt-6">
          <button
            onClick={handleGenerate}
            disabled={generating || loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#00ff41] hover:bg-[#00cc33] disabled:opacity-60 disabled:cursor-not-allowed text-black rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all"
          >
            {generating ? (
              <>
                <FiLoader size={16} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <FiDownload size={18} />{" "}
                {exportFormat === "json" ? "Export JSON" : "Generate Report"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content (Preview Area) */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#070708] z-0">
        {/* Top Navbar */}
        <div className="h-16 bg-[#111215]/80 backdrop-blur-md border-b border-[#1e1e24] flex items-center justify-between px-6 z-20 absolute top-0 w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiShield className="text-[#00ff41] w-5 h-5" />
              <span className="font-black text-white tracking-widest uppercase text-sm">
                Hackract Engine
              </span>
            </div>
            <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-mono text-gray-400">
              v4.2.0-rc
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Mobile generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || loading}
              className="xl:hidden flex items-center gap-2 px-4 py-2 bg-[#00ff41] hover:bg-[#00cc33] disabled:opacity-60 text-black rounded-lg font-bold text-xs transition-all"
            >
              {generating ? (
                <FiLoader size={14} className="animate-spin" />
              ) : (
                <FiDownload size={14} />
              )}
              {generating
                ? "Generating…"
                : exportFormat === "json"
                  ? "Export JSON"
                  : "Generate PDF"}
            </button>

            <div className="flex items-center p-1 bg-black/40 rounded-lg border border-white/5">
              <button
                onClick={() => setZoom((z) => Math.max(z - 10, 50))}
                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
              >
                <FiZoomOut size={16} />
              </button>
              <span className="px-3 text-xs font-mono font-bold text-gray-300 w-12 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(z + 10, 200))}
                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
              >
                <FiZoomIn size={16} />
              </button>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff41] rounded-full border border-[#111215]" />
            </button>
            <button className="w-8 h-8 rounded-full bg-linear-to-tr from-[#00ff41] to-teal-500 flex items-center justify-center text-black font-bold text-xs ring-2 ring-white/10">
              <FiUser size={14} />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-12 mt-16 bg-[#0a0a0b] flex justify-center items-start">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-500">
              <div className="w-10 h-10 border-2 border-white/10 border-t-[#00ff41] rounded-full animate-spin" />
              <span className="text-xs font-mono uppercase tracking-widest animate-pulse">
                Loading report data…
              </span>
            </div>
          ) : (
            /* PDF Live Preview Document */
            <div
              className="bg-white text-gray-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm transition-transform duration-200 origin-top flex flex-col ring-1 ring-gray-200"
              style={{
                width: "850px",
                minHeight: "1100px",
                transform: `scale(${zoom / 100})`,
                marginBottom: "100px",
              }}
            >
              {/* PDF Header */}
              <div className="px-12 py-10 border-b-4 border-gray-900 flex justify-between items-end relative overflow-hidden bg-gray-50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200/50 rounded-full mix-blend-multiply blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h1 className="text-4xl font-black text-gray-950 uppercase tracking-tighter mb-2 font-sans">
                    {project?.data?.name ||
                      project?.name ||
                      "Confidential Audit Document"}
                  </h1>
                  <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">
                    Security Assessment Findings:{" "}
                    {project?.data?.organization?.name ||
                      project?.organization?.name ||
                      "Enterprise Infrastructure"}
                  </p>
                </div>
                <div className="text-right relative z-10">
                  <div className="flex items-center justify-end gap-2 text-gray-900 mb-2">
                    <FiShield size={24} className="text-[#00c477]" />
                    <span className="font-black text-xl tracking-widest">
                      HACKRACT
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-600 font-mono">
                    {todayDate}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">
                    Ref:{" "}
                    {projectId?.split("-")[0].toUpperCase() || "SEC-AUD-2491A"}
                  </p>
                </div>
              </div>

              <div className="p-12 flex-1 flex flex-col gap-10">
                {modules.execSummary && (
                  <section className="animate-in fade-in duration-300">
                    <h2 className="text-xl font-black uppercase text-gray-900 border-b-2 border-gray-100 pb-2 mb-4 tracking-wide">
                      Executive Summary
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify mb-5 font-serif">
                      The security assessment for{" "}
                      {project?.data?.name ||
                        project?.name ||
                        "this organization"}{" "}
                      identified a total of {findings.length} unique
                      vulnerabilities. This report provides a technical
                      breakdown of the risks discovered and guidance on
                      prioritizing remediation efforts to protect organizational
                      assets.
                    </p>
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      {[
                        {
                          sev: "CRITICAL",
                          color: "text-red-600",
                          count: severityCounts.CRITICAL,
                        },
                        {
                          sev: "HIGH",
                          color: "text-orange-500",
                          count: severityCounts.HIGH,
                        },
                        {
                          sev: "MEDIUM",
                          color: "text-yellow-500",
                          count: severityCounts.MEDIUM,
                        },
                        {
                          sev: "LOW",
                          color: "text-blue-500",
                          count: severityCounts.LOW,
                        },
                      ].map(({ sev, color, count }) => (
                        <div
                          key={sev}
                          className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm"
                        >
                          <p
                            className={`text-3xl font-black drop-shadow-sm ${color}`}
                          >
                            {count}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                            {sev}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {modules.vulnTable && (
                  <section className="animate-in fade-in duration-300">
                    <h2 className="text-xl font-black uppercase text-gray-900 border-b-2 border-gray-100 pb-2 mb-6 tracking-wide">
                      Detected Vulnerabilities
                    </h2>
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest w-1/6">
                              Severity
                            </th>
                            <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest">
                              Vulnerability Title
                            </th>
                            <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest w-[28%]">
                              Affected Asset
                            </th>
                            <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest w-[12%]">
                              CVSS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {findings.length === 0 ? (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-5 py-20 text-center text-gray-400 font-medium italic"
                              >
                                No vulnerabilities identified in this assessment
                                sector.
                              </td>
                            </tr>
                          ) : (
                            findings.map((f) => (
                              <tr
                                key={f.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                                      f.severity === "CRITICAL"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : f.severity === "HIGH"
                                          ? "bg-orange-50 text-orange-700 border-orange-200"
                                          : f.severity === "MEDIUM"
                                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                  >
                                    <FiAlertTriangle size={10} /> {f.severity}
                                  </span>
                                </td>
                                <td className="px-5 py-4 font-bold text-gray-800">
                                  {f.title}
                                </td>
                                <td className="px-5 py-4 text-xs font-mono text-gray-500 break-all">
                                  {f.affectedAsset || "—"}
                                </td>
                                <td className="px-5 py-4 font-black text-gray-900">
                                  {f.cvssScore?.toFixed(1) || "—"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {!modules.execSummary &&
                  !modules.vulnTable &&
                  !modules.methodology &&
                  !modules.rawLogs && (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <FiFileText
                        size={48}
                        className="mb-4 opacity-30 text-gray-400"
                      />
                      <p className="font-bold text-sm tracking-wide text-gray-500">
                        Configuration Empty
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Select modules from the sidebar to populate the report.
                      </p>
                    </div>
                  )}
              </div>

              {/* PDF Footer */}
              <div className="px-12 py-8 border-t-2 border-gray-100 text-[10px] font-bold text-gray-400 flex justify-between tracking-widest uppercase items-center bg-gray-50">
                <span className="flex items-center gap-2">
                  <FiShield size={12} /> HACKRACT SENTINEL PROTOCOL ©{" "}
                  {new Date().getFullYear()}
                </span>
                <span>CONFIDENTIAL</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
