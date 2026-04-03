import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MatrixRain from "../components/MatrixRain";

const Landing = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0 opacity-20">
                <MatrixRain />
            </div>

            {/* Floating Orbs for Premium Atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-black/50 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] font-bold shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                        λ
                    </div>
                    <span className="text-2xl font-mono font-bold tracking-[0.2em] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                        HACKRACT
                    </span>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="px-5 py-2.5 rounded-lg font-mono text-sm border border-white/10 hover:border-[#00ff88]/50 bg-black/30 backdrop-blur-md text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:-translate-y-0.5"
                    >
                        Authenticate
                    </button>
                </div>
            </nav>

            {/* Main Hero Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                        <span className="text-xs font-mono tracking-widest text-[#00ff88] uppercase">System Online V2.4</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-lg">
                        Hackract <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-emerald-400 drop-shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                            operator Console
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 font-light leading-relaxed">
                        Hackract trasforms security testing with real-time collaboration,AI-powered workflows,
                        and professional reporting. Built for hackers,designed for teams.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <button
                            onClick={() => navigate("/register")}
                            className="group relative px-8 py-4 w-full sm:w-auto overflow-hidden rounded-xl bg-[#00ff88] text-black font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Initialize Access
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </button>

                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 w-full sm:w-auto rounded-xl border border-white/20 bg-black/40 backdrop-blur-lg font-mono tracking-wider text-gray-300 hover:text-white hover:border-white/40 transition-all duration-300 relative overflow-hidden group"
                        >
                            <span className="relative z-10">Explore Matrix</span>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* Trusted By Section */}
                <div className={`mt-32 w-full max-w-7xl mx-auto px-8 transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <p className="text-center text-[10px] font-mono tracking-[0.4em] text-gray-500 uppercase mb-12">
                        Trusted by innovators & research institutions
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
                                <span className="text-sm font-bold">A</span>
                            </div>
                            <span className="font-mono text-sm tracking-widest group-hover:text-white transition-colors">ASTU <span className="text-[10px] text-gray-600">Ethiopia</span></span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
                                <span className="text-sm font-bold">C</span>
                            </div>
                            <span className="font-mono text-sm tracking-widest group-hover:text-white transition-colors">CYBER-X</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
                                <span className="text-sm font-bold">N</span>
                            </div>
                            <span className="font-mono text-sm tracking-widest group-hover:text-white transition-colors">NEXUS LABS</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
                                <span className="text-sm font-bold">D</span>
                            </div>
                            <span className="font-mono text-sm tracking-widest group-hover:text-white transition-colors">DEFENSE HQ</span>
                        </div>
                    </div>
                </div>

                {/* Advanced Security Orchestration Header */}
                <div className={`mt-48 max-w-4xl mx-auto px-8 text-left w-full transition-all duration-1000 delay-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Advanced Security <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-emerald-400">Orchestration</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl font-light text-lg">
                        Empowering teams with cutting-edge AI and visual tools for comprehensive penetration testing.
                    </p>
                </div>

                {/* Feature Highlights - Grid Section */}
                <div id="features" className={`mt-16 grid md:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-8 transition-all duration-1000 delay-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    {[
                        
                        {
                            title: "Visual Workflow Builder",
                            desc: "Drag-and-drop mind-map interface for complex attack path mapping and asset relationship visualization.",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                </svg>
                            ),
                            color: "bg-blue-500/20"
                        },
                        {
                            title: "AI Assistant",
                            desc: "Real-time guidance and command explanations for every step, reducing the learning curve for security professionals.",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                            ),
                            color: "bg-emerald-500/20"
                        },
                        {
                            title: "Autonomous AI Agent",
                            desc: "Automated reconnaissance and vulnerability scanning powered by intelligent agents that think like hackers.",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            ),
                            color: "bg-cyan-500/20"
                        },
                        {
                            title: "Collaborative Workspace",
                            desc: "Real-time team testing and shared workspaces for seamless red-team collaboration and report generation.",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ),
                            color: "bg-purple-500/20"
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="group p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl hover:border-[#00ff88]/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col h-full shadow-2xl">
                            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-8 border border-white/10 group-hover:border-[#00ff88]/30 transition-all`}>
                                <div className="text-[#00ff88]">{feature.icon}</div>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-[#00ff88] transition-colors">{feature.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors flex-grow">{feature.desc}</p>

                            {/* Decorative line */}
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer Section */}
            <footer className="w-full mt-48 py-16 border-t border-white/5 bg-[#030303]">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-black/50 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] font-bold text-xs">
                                λ
                            </div>
                            <span className="text-xl font-mono font-bold tracking-widest text-white">
                                HACKRACT
                            </span>
                        </div>
                        <p className="text-[10px] font-mono text-gray-600 mt-2">
                            © 2024 Hackract Platforms. All rights reserved.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 text-[11px] font-mono tracking-widest text-gray-400">
                        <a href="#" className="hover:text-[#00ff88] transition-colors">Twitter</a>
                        <a href="#" className="hover:text-[#00ff88] transition-colors">GitHub</a>
                        <a href="#" className="hover:text-[#00ff88] transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-[#00ff88] transition-colors">Discord</a>
                    </div>

                    <div className="flex items-center gap-8 text-[11px] font-mono tracking-widest text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </div>
    );
};

export default Landing;
