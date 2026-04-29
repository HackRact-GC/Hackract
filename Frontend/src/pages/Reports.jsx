import React, { useState } from 'react';
import { 
  FiDownload, FiSettings, FiZoomIn, FiZoomOut, FiBell, FiUser, 
  FiFileText, FiCheckCircle, FiShield, FiAlertTriangle 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Reports = () => {
  const [zoom, setZoom] = useState(100);
  const [modules, setModules] = useState({
    execSummary: true,
    vulnTable: true,
    methodology: false,
    rawLogs: false
  });

  const toggleModule = (mod) => {
    setModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="flex h-full w-full bg-[#0a0a0b] text-gray-300 font-sans overflow-hidden border border-white/5 rounded-[32px] box-border shadow-2xl relative">
      
      {/* Left Sidebar (Configuration) */}
      <div className="w-80 bg-[#111215] border-r border-[#1e1e24] flex flex-col pt-6 pb-6 shadow-2xl relative z-10 hidden xl:flex">
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Report Generator</h2>
          <p className="text-xs text-gray-500 font-mono tracking-wide">Mission parameter export</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide">
          {/* Export Formats */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#00ff41] bg-[#00ff41]/5 text-[#00ff41] transition-all">
                <FiFileText size={20} className="mb-2" />
                <span className="text-xs font-bold">PDF</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 hover:border-white/20 bg-black/20 text-gray-400 hover:text-white transition-all">
                <FiFileText size={20} className="mb-2" />
                <span className="text-xs font-bold">JSON</span>
              </button>
            </div>
          </div>

          {/* Report Modules */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Report Modules</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm font-medium text-white">Executive Summary</span>
                <button onClick={() => toggleModule('execSummary')} className={`w-9 h-5 rounded-full relative transition-colors ${modules.execSummary ? 'bg-[#00ff41]' : 'bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${modules.execSummary ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm font-medium text-white">Vulnerability Findings</span>
                <button onClick={() => toggleModule('vulnTable')} className={`w-9 h-5 rounded-full relative transition-colors ${modules.vulnTable ? 'bg-[#00ff41]' : 'bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${modules.vulnTable ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm font-medium text-white">Methodology</span>
                <button onClick={() => toggleModule('methodology')} className={`w-9 h-5 rounded-full relative transition-colors ${modules.methodology ? 'bg-[#00ff41]' : 'bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${modules.methodology ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm font-medium text-white">Raw Payload Logs</span>
                <button onClick={() => toggleModule('rawLogs')} className={`w-9 h-5 rounded-full relative transition-colors ${modules.rawLogs ? 'bg-[#00ff41]' : 'bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${modules.rawLogs ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <button className="w-full flex items-center justify-center gap-2 py-4 bg-[#00ff41] hover:bg-[#00cc33] text-black rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all">
            <FiDownload size={18} /> Generate Report
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
               <span className="font-black text-white tracking-widest uppercase text-sm">Hackract Engine</span>
            </div>
            <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-mono text-gray-400">
              v4.2.0-rc
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center p-1 bg-black/40 rounded-lg border border-white/5">
              <button onClick={() => setZoom(z => Math.max(z - 10, 50))} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><FiZoomOut size={16} /></button>
              <span className="px-3 text-xs font-mono font-bold text-gray-300 w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 10, 200))} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><FiZoomIn size={16} /></button>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff41] rounded-full border border-[#111215]"></span>
            </button>
            <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00ff41] to-teal-500 flex items-center justify-center text-black font-bold text-xs ring-2 ring-white/10">
              <FiUser size={14} />
            </button>
          </div>
        </div>

        {/* Canvas Background / Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-12 mt-16 bg-[#0a0a0b] flex justify-center items-start">
          
          {/* PDF Live Preview Document */}
          <div 
            className="bg-white text-gray-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm transition-transform duration-200 origin-top flex flex-col ring-1 ring-gray-200"
            style={{ width: '850px', minHeight: '1100px', transform: `scale(${zoom / 100})`, marginBottom: '100px' }}
          >
            {/* PDF Header */}
            <div className="px-12 py-10 border-b-4 border-gray-900 flex justify-between items-end relative overflow-hidden bg-gray-50">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200/50 rounded-full mix-blend-multiply blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                  <h1 className="text-4xl font-black text-gray-950 uppercase tracking-tighter mb-2 font-sans">Confidential Audit Document</h1>
                  <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Comprehensive Penetration Test Results</p>
               </div>
               <div className="text-right relative z-10">
                  <div className="flex items-center justify-end gap-2 text-gray-900 mb-2">
                    <FiShield size={24} className="text-[#00c477]" />
                    <span className="font-black text-xl tracking-widest">HACKRACT</span>
                  </div>
                  <p className="text-xs font-bold text-gray-600 font-mono">{todayDate}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">Ref: SEC-AUD-2491A</p>
               </div>
            </div>

            <div className="p-12 flex-1 flex flex-col gap-10">
              
              {modules.execSummary && (
                <section className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-black uppercase text-gray-900 border-b-2 border-gray-100 pb-2 mb-4 tracking-wide">Executive Summary</h2>
                  <p className="text-sm text-gray-700 leading-relaxed text-justify mb-5 font-serif">
                    Between March 10th and {todayDate}, a comprehensive security assessment was conducted on the organization's perimeter networks and cloud infrastructure interfaces. The primary objective was to identify, exploit, and aggregate vulnerabilities that could present significant risk to the enterprise's digital assets. 
                  </p>
                  <div className="grid grid-cols-4 gap-4 mt-6">
                     <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-black text-red-600 drop-shadow-sm">3</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Critical</p>
                     </div>
                     <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-black text-orange-500 drop-shadow-sm">8</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">High</p>
                     </div>
                     <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-black text-yellow-500 drop-shadow-sm">14</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Medium</p>
                     </div>
                     <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-black text-blue-500 drop-shadow-sm">22</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Low</p>
                     </div>
                  </div>
                </section>
              )}

              {modules.vulnTable && (
                <section className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-black uppercase text-gray-900 border-b-2 border-gray-100 pb-2 mb-6 tracking-wide">Detected Vulnerabilities</h2>
                  
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest w-1/6">Severity</th>
                          <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest">Vulnerability Title</th>
                          <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest w-[28%]">Affected Asset</th>
                          <th className="px-5 py-4 font-black text-gray-700 uppercase text-[10px] tracking-widest w-[12%]">CVSS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest border border-red-200">
                               <FiAlertTriangle size={10} /> Critical
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-800">Remote Code Execution via Log4j</td>
                          <td className="px-5 py-4 text-xs font-mono text-gray-500">api.enterprise.com</td>
                          <td className="px-5 py-4 font-black text-red-600">9.8</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-widest border border-orange-200">
                                High
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-800">SQL Injection in User Authentication</td>
                          <td className="px-5 py-4 text-xs font-mono text-gray-500">login.enterprise.com</td>
                          <td className="px-5 py-4 font-black text-orange-500">8.4</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-widest border border-orange-200">
                                High
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-800">Insecure Direct Object Reference (IDOR)</td>
                          <td className="px-5 py-4 text-xs font-mono text-gray-500">api/v2/documents</td>
                          <td className="px-5 py-4 font-black text-orange-500">7.2</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-widest border border-yellow-200">
                                Medium
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-800">Cross-Site Scripting (Reflected)</td>
                          <td className="px-5 py-4 text-xs font-mono text-gray-500">search.enterprise.com</td>
                          <td className="px-5 py-4 font-black text-yellow-600">5.4</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-200">
                                Low
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-800">Lack of Content Security Policy</td>
                          <td className="px-5 py-4 text-xs font-mono text-gray-500">Multiple domains</td>
                          <td className="px-5 py-4 font-black text-blue-600">3.1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              
              {!modules.execSummary && !modules.vulnTable && !modules.methodology && !modules.rawLogs && (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FiFileText size={48} className="mb-4 opacity-30 text-gray-400" />
                    <p className="font-bold text-sm tracking-wide text-gray-500">Configuration Empty</p>
                    <p className="text-xs text-gray-400 mt-1">Select modules from the sidebar to populate the report.</p>
                 </div>
              )}

            </div>
            
            {/* PDF Footer */}
            <div className="px-12 py-8 border-t-2 border-gray-100 text-[10px] font-bold text-gray-400 flex justify-between tracking-widest uppercase items-center bg-gray-50">
              <span className="flex items-center gap-2"><FiShield size={12}/> HACKRACT SENTINEL PROTOCOL © {new Date().getFullYear()}</span>
              <span>PAGE 1 OF 14</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
