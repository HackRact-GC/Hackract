import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiStar, FiMapPin, FiShield, FiTool,
  FiAward, FiBriefcase, FiMessageSquare, FiCheckCircle,
  FiActivity, FiZap, FiCpu, FiTarget, FiUsers, FiLock,
  FiTrendingUp, FiCalendar, FiGlobe, FiAlertTriangle,
} from 'react-icons/fi';

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_HACKERS = {
  1: {
    id: 1,
    name: "Null_Pointer_Ex",
    alias: "Jane Doe",
    tag: "#ETHICAL_HACKER_102",
    status: "ACTIVE SENTINEL",
    rating: 4.9,
    rank: "GOLD",
    location: "Remote",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NullPointer&baseColor=00ff88",
    bio: "Senior Security Researcher specializing in advanced persistent threat (APT) simulation and blockchain infrastructure auditing. With over a decade of experience in offensive security, pioneering several zero-day discovery protocols currently utilized by top-tier FinTech institutions.",
    arsenal: ["Kubernetes Hacking", "Smart Contract Auditing", "Rust Security", "Zero-Knowledge Proofs", "Fuzzing", "Burp Suite Professional"],
    skills: ["Web Exploitation", "Kernel Research", "Binary Analysis", "Reverse Engineering", "Network Forensics"],
    certifications: [
      { name: "OSCP Certification", body: "Offensive Security", verified: true },
      { name: "AWS Certified Security", body: "Cloud Specialist", verified: true },
    ],
    telemetry: { vulnsFound: 1204, uptimeIntegrity: "99.2%" },
    projects: [
      { org: "FinTech Corp", year: 2024, title: "Infrastructure Hardening & Red Team Simulation", status: "COMPLETED" },
      { org: "Global Bank X", year: 2023, title: "Core Banking API Penetration Testing", status: "COMPLETED" },
      { org: "[Confidential Entity]", year: 2023, title: "Zero-Knowledge Infrastructure Audit", status: "COMPLETED" },
    ],
    reviews: [
      { from: "Acme Corp", rating: 5, text: "Exceptional work. Identified vulnerabilities our internal team missed for 2 years.", date: "Mar 2024" },
      { from: "SecureNet Ltd", rating: 5, text: "Delivered a complete red-team report ahead of schedule. Highly professional.", date: "Jan 2024" },
    ],
  },
  2: {
    id: 2,
    name: "Cyber_Sentinel",
    alias: "Marcus Webb",
    tag: "#SEC_ARCHITECT_04",
    status: "ACTIVE SENTINEL",
    rating: 4.8,
    rank: "PLATINUM",
    location: "Remote",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sentinel&baseColor=00ff88",
    bio: "Cloud security architect with deep expertise in AWS/GCP hardening and red team engagements. Certified ethical hacker with a focus on financial infrastructure.",
    arsenal: ["Cloud Security", "IAM Exploitation", "Terraform Audit", "GCP Hardening", "Docker Escape"],
    skills: ["Cloud Security", "Pentesting", "Infrastructure Review"],
    certifications: [
      { name: "CEH Certification", body: "EC-Council", verified: true },
    ],
    telemetry: { vulnsFound: 893, uptimeIntegrity: "98.7%" },
    projects: [
      { org: "CloudBase Inc", year: 2024, title: "AWS IAM Misconfiguration Audit", status: "COMPLETED" },
    ],
    reviews: [
      { from: "Nexus Finance", rating: 5, text: "Top-tier cloud security researcher. Found critical IAM issues immediately.", date: "Feb 2024" },
    ],
  },
  3: { id: 3, name: "Root_Access", alias: "Alex Mercer", tag: "#RF_REACH_99", status: "ACTIVE SENTINEL", rating: 4.5, rank: "SILVER", location: "Remote", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Root&baseColor=00ff88", bio: "IoT and radio-frequency security specialist.", arsenal: ["IoT Hacking", "SDR", "JTAG", "Firmware Analysis"], skills: ["IoT Hacking", "SDR"], certifications: [{ name: "GPEN", body: "GIAC", verified: true }], telemetry: { vulnsFound: 441, uptimeIntegrity: "97.1%" }, projects: [], reviews: [] },
  4: { id: 4, name: "Ghost_Shell", alias: "Kai Zero", tag: "#SH_DEEP_33", status: "ACTIVE SENTINEL", rating: 4.7, rank: "GOLD", location: "Remote", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ghost&baseColor=00ff88", bio: "Binary analyst and exploit developer with OSCE certification.", arsenal: ["Binary Analysis", "Heap Spray", "ROP Chains"], skills: ["Binary Analysis"], certifications: [{ name: "OSCE", body: "Offensive Security", verified: true }], telemetry: { vulnsFound: 682, uptimeIntegrity: "98.3%" }, projects: [], reviews: [] },
  5: { id: 5, name: "Buffer_Overrun", alias: "Dana Cross", tag: "#B0_X64_11", status: "ACTIVE SENTINEL", rating: 4.6, rank: "SILVER", location: "Remote", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Buffer&baseColor=00ff88", bio: "Fuzzing and malware analysis specialist.", arsenal: ["Fuzzing", "Malware RE", "AFL++"], skills: ["Fuzzing", "Malware"], certifications: [], telemetry: { vulnsFound: 334, uptimeIntegrity: "96.8%" }, projects: [], reviews: [] },
  6: { id: 6, name: "Packet_Wizard", alias: "Eliot Forge", tag: "#PW_TCP_8080", status: "ACTIVE SENTINEL", rating: 4.9, rank: "ELITE", location: "Remote", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Wizard&baseColor=00ff88", bio: "Network forensics expert and GREM-certified malware reverse engineer.", arsenal: ["Network Forensics", "Wireshark", "Zeek", "Suricata", "YARA"], skills: ["Network Forensics"], certifications: [{ name: "GREM", body: "GIAC", verified: true }], telemetry: { vulnsFound: 1567, uptimeIntegrity: "99.8%" }, projects: [], reviews: [] },
};

const TAB_ICONS = {
  ABOUT: FiActivity,
  "SKILLS & TOOLS": FiTool,
  CERTIFICATIONS: FiAward,
  "PAST PROJECTS": FiBriefcase,
  REVIEWS: FiMessageSquare,
};

const TABS = ["ABOUT", "SKILLS & TOOLS", "CERTIFICATIONS", "PAST PROJECTS", "REVIEWS"];

const RANK_COLORS = {
  ELITE:    { text: "text-purple-400",  border: "border-purple-400/30",  bg: "bg-purple-400/10"  },
  PLATINUM: { text: "text-blue-300",    border: "border-blue-300/30",    bg: "bg-blue-300/10"    },
  GOLD:     { text: "text-yellow-400",  border: "border-yellow-400/30",  bg: "bg-yellow-400/10"  },
  SILVER:   { text: "text-gray-300",    border: "border-gray-400/30",    bg: "bg-gray-400/10"    },
};

// ─── SECTION COMPONENTS ───────────────────────────────────────────────────────

const AboutSection = ({ hacker }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    {/* Bio */}
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
          <FiActivity className="text-[#00c477] text-sm" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">About Sentinel</h2>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{hacker.bio}</p>

      {/* Active Arsenal */}
      <div className="mt-8">
        <p className="text-[9px] font-black text-gray-500 tracking-[0.3em] uppercase mb-4">Active Arsenal</p>
        <div className="flex flex-wrap gap-2">
          {hacker.arsenal.map(t => (
            <span key={t} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] text-gray-300 font-mono">{t}</span>
          ))}
        </div>
      </div>
    </div>

    {/* Validated Credentials Preview */}
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
          <FiShield className="text-[#00c477] text-sm" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Validated Credentials</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hacker.certifications.map(cert => (
          <div key={cert.name} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#00c477]/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center flex-shrink-0">
              <FiShield className="text-[#00c477]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{cert.name}</p>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest truncate">{cert.body}</p>
            </div>
            {cert.verified && <FiCheckCircle className="text-[#00c477] text-lg flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>

    {/* Engagement Log Preview */}
    {hacker.projects.length > 0 && (
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
            <FiBriefcase className="text-[#00c477] text-sm" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Engagement Log</h2>
        </div>
        <div className="space-y-4">
          {hacker.projects.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{p.org} — {p.year}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{p.title}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[9px] font-black font-mono tracking-widest uppercase text-[#00c477] bg-[#00c477]/10 border border-[#00c477]/20 flex-shrink-0">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const SkillsSection = ({ hacker }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
          <FiTool className="text-[#00c477] text-sm" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Core Skill Set</h2>
      </div>
      <div className="space-y-4">
        {hacker.skills.map((skill, i) => (
          <div key={skill}>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-300 font-mono">{skill}</span>
              <span className="text-xs text-[#00c477] font-mono">{95 - i * 5}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00c477] to-emerald-400 rounded-full shadow-[0_0_8px_rgba(0,196,119,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${95 - i * 5}%` }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
          <FiCpu className="text-[#00c477] text-sm" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Active Toolchain</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {hacker.arsenal.map((tool) => (
          <div key={tool} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#00c477]/20 hover:bg-[#00c477]/5 transition-all group">
            <div className="w-2 h-2 rounded-full bg-[#00c477] shadow-[0_0_6px_#00c477] flex-shrink-0" />
            <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors font-mono truncate">{tool}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const CertificationsSection = ({ hacker }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
          <FiAward className="text-[#00c477] text-sm" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Certifications & Credentials</h2>
      </div>
      {hacker.certifications.length === 0 ? (
        <p className="text-gray-600 text-sm font-mono">No certifications on record.</p>
      ) : (
        <div className="space-y-4">
          {hacker.certifications.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#00c477]/20 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center flex-shrink-0">
                <FiShield className="text-[#00c477] text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-white">{cert.name}</p>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">{cert.body}</p>
              </div>
              {cert.verified && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00c477]/20 bg-[#00c477]/10">
                  <FiCheckCircle className="text-[#00c477] text-sm" />
                  <span className="text-[9px] font-black text-[#00c477] font-mono tracking-widest uppercase">Verified</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const ProjectsSection = ({ hacker }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
          <FiBriefcase className="text-[#00c477] text-sm" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Past Engagements</h2>
      </div>
      {hacker.projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <FiLock className="text-gray-600 text-2xl" />
          </div>
          <p className="text-gray-600 text-sm font-mono">Engagement history is classified.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hacker.projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{p.org}</span>
                  <span className="text-[10px] text-gray-600 font-mono">— {p.year}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{p.title}</p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-[9px] font-black font-mono tracking-widest uppercase text-[#00c477] bg-[#00c477]/10 border border-[#00c477]/20 flex-shrink-0">
                {p.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const ReviewsSection = ({ hacker }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
          <FiMessageSquare className="text-[#00c477] text-sm" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Client Reviews</h2>
      </div>
      {hacker.reviews.length === 0 ? (
        <p className="text-gray-600 text-sm font-mono">No reviews available yet.</p>
      ) : (
        <div className="space-y-4">
          {hacker.reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-bold text-white">{r.from}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, j) => (
                      <FiStar key={j} className={`text-sm ${j < r.rating ? 'text-[#00c477] fill-[#00c477]' : 'text-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 font-mono">{r.date}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">"{r.text}"</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const HackerPublicProfile = () => {
  const { hackerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ABOUT");
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const hacker = MOCK_HACKERS[parseInt(hackerId, 10)] || MOCK_HACKERS[1];
  const rankStyle = RANK_COLORS[hacker.rank] || RANK_COLORS.SILVER;

  const renderSection = () => {
    switch (activeTab) {
      case "ABOUT":             return <AboutSection hacker={hacker} />;
      case "SKILLS & TOOLS":   return <SkillsSection hacker={hacker} />;
      case "CERTIFICATIONS":   return <CertificationsSection hacker={hacker} />;
      case "PAST PROJECTS":    return <ProjectsSection hacker={hacker} />;
      case "REVIEWS":          return <ReviewsSection hacker={hacker} />;
      default:                 return <AboutSection hacker={hacker} />;
    }
  };

  return (
    <div className="flex flex-col h-full -m-10">

      {/* ── Hero Header ── */}
      <div className="relative px-10 py-8 border-b border-white/5 bg-[#050505] overflow-hidden">
        {/* subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00c477]/5 rounded-full blur-3xl" />
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#00c477] transition-colors mb-6 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-mono uppercase tracking-widest">Back to Discover</span>
        </button>

        <div className="flex items-start justify-between flex-wrap gap-6">
          {/* Avatar + Identity */}
          <div className="flex items-center gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00c477]/20 to-emerald-900/40 p-0.5 border border-[#00c477]/30 shadow-[0_0_30px_rgba(0,196,119,0.15)]">
                <img
                  src={hacker.avatar}
                  alt={hacker.name}
                  className="w-full h-full rounded-xl object-cover bg-black/50"
                />
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#00c477] border-2 border-[#050505] shadow-[0_0_10px_#00c477] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
            </div>

            {/* Identity info */}
            <div>
              {/* Status badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00c477] shadow-[0_0_6px_#00c477] animate-pulse" />
                <span className="text-[9px] font-black text-[#00c477] tracking-[0.3em] uppercase font-mono border border-[#00c477]/20 bg-[#00c477]/5 px-2 py-0.5 rounded-full">
                  {hacker.status}
                </span>
              </div>

              <h1 className="text-4xl font-black text-white tracking-tight mb-1">{hacker.name}</h1>
              <p className="text-sm text-gray-500 font-mono mb-3">{hacker.alias} · {hacker.tag}</p>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <FiStar className="text-[#00c477] fill-[#00c477] text-sm" />
                  <span className="text-white font-bold text-sm">{hacker.rating}</span>
                  <span className="text-gray-500 text-xs font-mono">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gray-500 text-sm" />
                  <span className="text-gray-400 text-xs font-mono">{hacker.location}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black font-mono uppercase tracking-widest ${rankStyle.text} ${rankStyle.border} ${rankStyle.bg}`}>
                  <FiShield className="text-xs" />
                  {hacker.rank}
                </div>
              </div>
            </div>
          </div>

          {/* Assign to Project button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center gap-3 px-7 py-4 bg-[#00c477] hover:bg-[#009a5e] text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(0,196,119,0.25)] hover:shadow-[0_0_35px_rgba(0,196,119,0.4)] transition-all self-start"
          >
            <FiBriefcase className="text-lg" />
            Assign to Project
          </motion.button>
        </div>

        {/* Separator line */}
        <div className="mt-8 border-t border-white/5" />
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar: Tabs + System Telemetry */}
        <aside className="w-72 border-r border-white/5 bg-[#050505] flex flex-col overflow-y-auto">

          {/* Tab nav */}
          <nav className="p-4 space-y-1 flex-1">
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all group relative ${
                    isActive
                      ? 'bg-[#00c477]/10 border border-[#00c477]/20 text-[#00c477]'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`text-base ${isActive ? 'text-[#00c477]' : 'group-hover:text-gray-300'}`} />
                    <span className="text-[11px] font-black tracking-[0.15em] uppercase font-mono">{tab}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00c477] shadow-[0_0_6px_#00c477]" />}
                </button>
              );
            })}
          </nav>

          {/* System Telemetry */}
          <div className="m-4 p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl">
            <p className="text-[9px] font-black text-gray-500 tracking-[0.3em] uppercase mb-5">System Telemetry</p>
            <div className="space-y-4">
              {/* Vulns Found */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[10px] text-gray-500 font-mono">Vulnerabilities Found</span>
                  <span className="text-sm font-black text-white">{hacker.telemetry.vulnsFound.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00c477] to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((hacker.telemetry.vulnsFound / 2000) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              {/* Uptime */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[10px] text-gray-500 font-mono">Uptime Integrity</span>
                  <span className="text-sm font-black text-white">{hacker.telemetry.uptimeIntegrity}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00c477] to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: parseFloat(hacker.telemetry.uptimeIntegrity) + '%' }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#050505]">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {renderSection()}
            </div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Assign to Project Modal ── */}
      <AnimatePresence>
        {assignModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setAssignModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00c477]/10 border border-[#00c477]/20 flex items-center justify-center">
                  <FiBriefcase className="text-[#00c477] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Assign to Project</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Invite {hacker.name} to collaborate</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {["Project Alpha — Web App Audit", "Project Beta — Cloud Security Review", "Project Gamma — IoT Firmware"].map((project) => (
                  <label key={project} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#00c477]/20 cursor-pointer transition-all group">
                    <div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-[#00c477]/50 transition-colors" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{project}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#00c477] hover:bg-[#009a5e] text-black font-black text-sm shadow-[0_0_20px_rgba(0,196,119,0.2)] hover:shadow-[0_0_30px_rgba(0,196,119,0.35)] transition-all"
                >
                  Send Invitation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HackerPublicProfile;
