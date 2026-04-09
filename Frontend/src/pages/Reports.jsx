import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiFileText, FiDownload, FiSearch, FiFilter, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking reports wait since backend might not have a dedicated endpoint yet
    const mockReports = [
      { id: 'REP-001', name: 'Mission Alpha Summary', date: '2024-03-28', type: 'PDF', size: '2.4MB' },
      { id: 'REP-002', name: 'Q1 Vulnerability Audit', date: '2024-03-15', type: 'JSON', size: '1.1MB' },
      { id: 'REP-003', name: 'Firewall Audit V3 - Final', date: '2024-02-20', type: 'PDF', size: '4.8MB' },
      { id: 'REP-004', name: 'Compliance Checklist: ISO27001', date: '2024-01-10', type: 'PDF', size: '3.2MB' },
    ];
    
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">MISSION REPORTS</h1>
        <p className="text-[11px] font-mono text-gray-600 uppercase tracking-[0.3em] font-bold">Strategic intelligence and vulnerability analytics</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff88] transition-colors" />
          <input 
            type="text" 
            placeholder="Search report ID, name or metadata..." 
            className="w-full bg-white/2 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 transition-all font-mono placeholder-gray-700"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-white/20 transition-all">
            <FiFilter /> Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#00ff88] text-black border border-[#00ff88] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all">
            Generate New Report
          </button>
        </div>
      </div>

      <div className="bg-[#080808] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-widest">Identifier</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-widest">Report Name</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-widest">Extraction Date</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-widest">Format</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-widest">Size</th>
              <th className="px-8 py-5 text-[10px] font-mono font-black text-gray-600 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/2">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-full" /></td>
                </tr>
              ))
            ) : reports.map((report) => (
              <tr key={report.id} className="hover:bg-white/2 transition-colors group">
                <td className="px-8 py-6 text-xs font-bold font-mono text-gray-400">{report.id}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <FiFileText />
                    </div>
                    <span className="text-sm font-black text-white group-hover:text-[#00ff88] transition-colors uppercase tracking-tight">{report.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-[11px] font-mono font-bold text-gray-500 uppercase flex items-center gap-2">
                  <FiCalendar /> {report.date}
                </td>
                <td className="px-8 py-6 text-[9px] font-black font-mono text-[#00ff88]">
                  <span className="bg-[#00ff88]/10 px-2 py-1 rounded border border-[#00ff88]/20">{report.type}</span>
                </td>
                <td className="px-8 py-6 text-[10px] font-mono text-gray-600">{report.size}</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#00ff88] hover:bg-[#00ff88]/10 hover:border-[#00ff88]/40 transition-all">
                    <FiDownload />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
