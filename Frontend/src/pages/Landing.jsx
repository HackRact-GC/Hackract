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

                {/* Feature Highlights - Glassmorphism Cards */}
                <div id="features" className={`mt-24 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    {[
                        {
                            title: "Continuous Assessment",
                            desc: "Real-time threat modeling and automated scoping for dynamic attack surfaces.",
                            icon: "⚡"
                        },
                        {
                            title: "Verified Operators",
                            desc: "Exclusive network of thoroughly vetted offensive security experts.",
                            icon: "🛡️"
                        },
                        {
                            title: "Actionable Reporting",
                            desc: "Crystal-clear remediation guidelines delivered directly to your engineering team.",
                            icon: "📊"
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="group p-6 rounded-2xl border border-white/10 bg-[#111]/60 backdrop-blur-xl hover:border-[#00ff88]/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:opacity-30 transition-opacity duration-500 filter grayscale">
                                {feature.icon}
                            </div>
                            <div className="text-3xl mb-4 text-[#00ff88]">{feature.icon}</div>
                            <h3 className="text-lg font-bold mb-2 text-white/90">{feature.title}</h3>
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

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
