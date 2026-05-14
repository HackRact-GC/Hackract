import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiStar, FiChevronLeft, FiChevronRight, FiCheck, FiSend, FiX, FiLoader, FiMessageSquare, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  const colors = {
    ELITE:    'text-rose-400 border-rose-400/30 bg-rose-400/10',
    PLATINUM: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    GOLD:     'text-amber-400 border-amber-400/30 bg-amber-400/10',
    SILVER:   'text-gray-300 border-gray-400/30 bg-gray-400/10',
  };
  return (
    <span className={`text-[9px] font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${colors[rank] || colors.SILVER}`}>
      {rank}
    </span>
  );
};

// ─── INVITE MODAL ─────────────────────────────────────────────────────────────
const InviteModal = ({ hacker, onClose }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/pentests');
        // Support both response shapes
        const list = data?.data || data?.pentests || data || [];
        setProjects(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load projects', err);
        setProjects([]);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const handleSend = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }
    setLoading(true);
    try {
      await api.post('/invitations', {
        pentestId: selectedProject,
        hackerId: hacker.userId || hacker.id,
        message: message.trim() || undefined,
      });
      toast.success(`Invitation sent to ${hacker.user?.handle || hacker.handle || hacker.name}!`);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send invitation';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const hackerName   = hacker.user?.fullName || hacker.fullName || hacker.name || 'Unknown';
  const hackerHandle = hacker.user?.handle   || hacker.handle   || hacker.tag  || '';
  const hackerAvatar = hacker.user?.avatar   || hacker.avatar   || `https://api.dicebear.com/7.x/bottts/svg?seed=${hackerHandle}&baseColor=00ff88`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#080808] border border-white/10 rounded-3xl w-full max-w-lg shadow-[0_30px_80px_-10px_rgba(0,196,119,0.2)] relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00c477]/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-white/5 flex items-start gap-4 relative z-10">
          <div className="relative w-14 h-14 shrink-0">
            <img src={hackerAvatar} alt={hackerName} className="w-full h-full rounded-xl bg-black/50 border border-white/10 object-cover" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#00c477] border-2 border-[#080808] shadow-[0_0_5px_#00c477]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-[#00c477] font-mono tracking-widest uppercase mb-1">Send Project Invitation</p>
            <h3 className="text-xl font-black text-white truncate">{hackerName}</h3>
            {hackerHandle && <p className="text-xs text-gray-500 font-mono">{hackerHandle.startsWith('#') ? hackerHandle : `@${hackerHandle}`}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all shrink-0">
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5 relative z-10">
          {/* Project selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Select Project <span className="text-[#00c477]">*</span>
            </label>
            {fetching ? (
              <div className="flex items-center gap-2 py-3 text-gray-500 text-sm">
                <FiLoader className="animate-spin" /> Loading your projects...
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No projects found. Create a project first.</p>
            ) : (
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="w-full bg-[#0c0c0c] border border-white/10 focus:border-[#00c477] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">— Choose a project —</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status || 'PLANNING'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <FiMessageSquare className="text-[#00c477]" /> Personal Message <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Introduce the project and why you'd like this hacker's expertise..."
              className="w-full bg-[#0c0c0c] border border-white/10 focus:border-[#00c477] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all resize-none placeholder-gray-600"
            />
            <p className="text-[10px] text-gray-600 mt-1 text-right">{message.length}/1000</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex gap-3 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:bg-white/5 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !selectedProject || fetching}
            className="flex-1 py-3 rounded-xl bg-[#00c477] text-black text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,196,119,0.3)] hover:bg-[#00a865] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── HACKER CARD ──────────────────────────────────────────────────────────────
const HackerCard = ({ hacker, index, onInvite, onViewProfile }) => {
  const name = hacker.user?.fullName || hacker.name || 'Unknown';
  const handle = hacker.user?.handle || hacker.tag || '';
  const avatar = hacker.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${handle}&baseColor=00ff88`;

  // Parse skills and certs which might be JSON strings
  const parseItems = (items) => {
    if (!items) return [];
    return items.map(item => {
      try {
        const parsed = JSON.parse(item);
        return parsed.title || parsed.name || item;
      } catch {
        return item;
      }
    });
  };

  const skills = parseItems(hacker.primarySkills || hacker.skills);
  const certs = parseItems(hacker.certifications || hacker.certs);
  const rating = hacker.rating || 4.5;
  const rank = hacker.rank || 'SILVER';
  const trustScore = hacker.user?.trustScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-[#050505] border border-white/5 hover:border-[#00c477]/30 rounded-xl p-6 transition-all group flex flex-col h-full shadow-lg"
    >
      {/* Top: avatar + rating */}
      <div className="flex items-start justify-between mb-5">
        <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#00c477]/20 to-emerald-900/40 p-0.5 border border-white/10 group-hover:border-[#00c477]/50 transition-colors">
          <img src={avatar} alt={name} className="w-full h-full rounded-[10px] object-cover bg-black/50" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#00c477] border-2 border-[#050505] shadow-[0_0_5px_#00c477]" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 text-white font-bold">
            <FiStar className="text-[#00c477] fill-[#00c477] text-sm" />
            <span className="text-sm">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          </div>
          <RankBadge rank={rank} />
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white group-hover:text-[#00c477] transition-colors mb-0.5">{name}</h3>
        {handle && <p className="text-xs text-gray-500 font-mono">{handle.startsWith('#') ? handle : `@${handle}`}</p>}
      </div>

      {/* Skills + certs */}
      <div className="flex flex-wrap gap-2 mb-6 mt-auto">
        {skills.slice(0, 3).map(s => (
          <span key={s} className="px-2.5 py-1 rounded border border-white/10 bg-white/5 text-[10px] text-gray-300 font-mono">{s}</span>
        ))}
        {certs.slice(0, 2).map(c => (
          <span key={c} className="px-2.5 py-1 rounded border border-[#00c477]/20 bg-[#00c477]/5 text-[10px] text-[#00c477] font-mono">{c}</span>
        ))}
        {skills.length + certs.length > 5 && (
          <span className="px-2.5 py-1 rounded border border-white/5 bg-white/[0.02] text-[10px] text-gray-600 font-mono">+{skills.length + certs.length - 5} more</span>
        )}
      </div>

      {/* Trust Score */}
      {trustScore != null && (
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00c477] to-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, trustScore)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{trustScore}%</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewProfile(hacker)}
          className="flex-1 py-2.5 rounded-lg border border-white/10 hover:border-[#00c477]/50 text-gray-300 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <FiUser className="text-xs" /> Profile
        </button>
        <button
          onClick={() => onInvite(hacker)}
          className="flex-1 py-2.5 rounded-lg bg-[#00c477] hover:bg-[#009a5e] text-black font-bold text-sm transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2"
        >
          <FiSend className="text-xs" /> Invite
        </button>
      </div>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const OrganizationDiscover = () => {
  const navigate = useNavigate();
  const [hackers, setHackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inviteTarget, setInviteTarget] = useState(null);

  const LIMIT = 12;

  const fetchHackers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', LIMIT);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
      if (selectedCerts.length  > 0) params.set('certs',  selectedCerts.join(','));

      const { data } = await api.get(`/hacker-profiles/discover?${params.toString()}`);
      const list = data?.data?.profiles || data?.profiles || [];
      const tp   = data?.data?.pagination?.totalPages || data?.pagination?.totalPages || 1;
      setHackers(Array.isArray(list) ? list : []);
      setTotalPages(tp);
    } catch (err) {
      console.error('Failed to load hackers', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedSkills, selectedCerts]);

  useEffect(() => {
    const id = setTimeout(fetchHackers, 300);
    return () => clearTimeout(id);
  }, [fetchHackers]);

  const toggleSkill = skill =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

  const toggleCert = cert =>
    setSelectedCerts(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  // Client-side secondary filtering (skills/certs/rating come from local filter when API doesn't support them)
  const filteredHackers = hackers.filter(h => {
    const skills = h.primarySkills || h.skills || [];
    const certs  = h.certifications || h.certs || [];
    const rating = h.rating || 0;

    if (selectedSkills.length > 0 && !selectedSkills.some(s => skills.includes(s))) return false;
    if (selectedCerts.length > 0  && !selectedCerts.some(c => certs.includes(c)))   return false;
    if (minRating > 0 && rating < minRating) return false;
    return true;
  });

  const handleViewProfile = (hacker) => {
    // Navigate using the userId which is the standard for the public profile route
    const id = hacker.userId || hacker.user?.id || hacker.id;
    navigate(`/discover/${id}`);
  };

  return (
    <div className="flex flex-col h-full -m-10">

      {/* ── Header Area ── */}
      <div className="px-10 py-5 border-b border-white/5 bg-[#050505] flex items-center gap-4 sticky top-0 z-10">
        <div className="relative flex-1 max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
          <input
            id="hacker-search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, handle, bio, specialization…"
            className="w-full bg-[#0c0c0c] border border-white/10 focus:border-[#00c477] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all placeholder-gray-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Filters Sidebar ── */}
        <aside className="w-64 border-r border-white/5 bg-[#050505] p-8 overflow-y-auto hidden md:block">
          <h3 className="text-[10px] font-black text-[#00c477] tracking-widest font-mono mb-8 uppercase">Refine Discovery</h3>

          <div className="mb-8">
            <h4 className="text-[9px] font-black text-gray-500 tracking-widest font-mono mb-4 uppercase">Core Skills</h4>
            <div className="space-y-3">
              {['Web Exploitation', 'Network Security', 'Mobile Forensics', 'Binary Analysis', 'Cloud Security', 'IoT Hacking'].map(skill => {
                const isActive = selectedSkills.includes(skill);
                return (
                  <label key={skill} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleSkill(skill)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-[#00c477] border-[#00c477]' : 'border-white/20 bg-black/50 group-hover:border-[#00c477]/50'}`}>
                      {isActive && <FiCheck className="text-black text-[10px] font-bold" />}
                    </div>
                    <span className={`text-xs transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>{skill}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-[9px] font-black text-gray-500 tracking-widest font-mono mb-4 uppercase">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {['OSCP', 'CEH', 'GPEN', 'CISSP', 'OSCE', 'GREM'].map(cert => {
                const isActive = selectedCerts.includes(cert);
                return (
                  <button
                    key={cert}
                    onClick={() => toggleCert(cert)}
                    className={`px-3 py-1.5 rounded-md border text-[10px] font-mono transition-colors uppercase ${isActive ? 'bg-[#00c477]/10 border-[#00c477] text-[#00c477]' : 'border-white/10 bg-transparent text-gray-400 hover:border-[#00c477]/50 hover:text-[#00c477]'}`}
                  >
                    {cert}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-[9px] font-black text-gray-500 tracking-widest font-mono mb-4 uppercase">Min. Rating</h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  onClick={() => setMinRating(star === minRating ? 0 : star)}
                  className={`text-lg cursor-pointer transition-colors ${star <= minRating ? 'text-[#00c477] fill-[#00c477]' : 'text-gray-600 hover:text-[#00c477]/50'}`}
                />
              ))}
              <span className="text-xs text-gray-400 ml-2 font-mono">{minRating > 0 ? `${minRating}.0+` : 'Any'}</span>
            </div>
          </div>

          {(selectedSkills.length > 0 || selectedCerts.length > 0 || minRating > 0) && (
            <button
              onClick={() => { setSelectedSkills([]); setSelectedCerts([]); setMinRating(0); }}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-mono font-bold transition-colors flex items-center gap-1"
            >
              <FiX className="text-xs" /> Clear filters
            </button>
          )}
        </aside>

        {/* ── Hacker Grid ── */}
        <main className="flex-1 p-10 overflow-y-auto bg-[#050505]">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Top Penetration Experts</h1>
              <p className="text-gray-400 text-sm">
                {loading ? 'Loading...' : `Showing ${filteredHackers.length} verified security researchers.`}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00c477]/20 bg-[#00c477]/5">
              <div className="w-2 h-2 rounded-full bg-[#00c477] animate-pulse shadow-[0_0_8px_#00c477]" />
              <span className="text-[10px] font-mono font-bold text-[#00c477] uppercase tracking-widest">Live_Datafeed: Synced</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 animate-pulse h-64">
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-white/5" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded" />
                    <div className="h-3 bg-white/5 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHackers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl">🔍</div>
              <h3 className="text-white font-bold text-xl">No Hackers Found</h3>
              <p className="text-gray-500 text-sm max-w-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredHackers.map((hacker, i) => (
                <HackerCard
                  key={hacker.id}
                  hacker={hacker}
                  index={i}
                  onInvite={setInviteTarget}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center mt-12 gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30"
              >
                <FiChevronLeft className="text-sm" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded border text-sm font-mono flex items-center justify-center transition-colors ${pg === page ? 'bg-[#00c477] border-[#00c477] text-black font-bold' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30"
              >
                <FiChevronRight className="text-sm" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Invite Modal ── */}
      <AnimatePresence>
        {inviteTarget && (
          <InviteModal
            hacker={inviteTarget}
            onClose={() => setInviteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationDiscover;
