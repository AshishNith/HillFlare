import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import api from '../services/api';

interface CrushEntry {
    _id: string;
    crushUserId: { _id: string; name: string; department: string; avatar: string; photos: string[] };
}

interface RevealedUser {
    _id: string; name: string; department: string; year: number; avatar: string; photos: string[];
}

interface BrowseUser {
    _id: string; name: string; department: string; year: number; interests: string[]; photos: string[]; avatar: string;
}

import { useNavigate } from 'react-router-dom';

export default function CrushPage() {
    const navigate = useNavigate();
    const [crushes, setCrushes] = useState<CrushEntry[]>([]);
    const [revealed, setRevealed] = useState<RevealedUser[]>([]);
    const [browseUsers, setBrowseUsers] = useState<BrowseUser[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [browsing, setBrowsing] = useState(false);
    const [showReveal, setShowReveal] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [crushRes, revealRes] = await Promise.all([
                api.get('/crushes'), api.get('/crushes/revealed'),
            ]);
            setCrushes(crushRes.data.data || []);
            setRevealed(revealRes.data.data || []);
        } catch { }
        setLoading(false);
    };

    const loadBrowseProfiles = async () => {
        setBrowsing(true);
        try {
            const { data } = await api.get('/explore?limit=20');
            setBrowseUsers(data.data || []);
        } catch { }
    };

    const addCrush = async (userId: string) => {
        try {
            const { data } = await api.post('/crushes', { crushUserId: userId });
            if (data.data?.isMutual) {
                setShowReveal(true);
                setTimeout(() => setShowReveal(false), 3500);
            }
            fetchData();
            setBrowseUsers((prev) => prev.filter((u) => u._id !== userId));
        } catch { }
    };

    const removeCrush = async (userId: string) => {
        try { await api.delete(`/crushes/${userId}`); fetchData(); } catch { }
    };

    const filteredUsers = browseUsers.filter((u) =>
        !crushes.some((c) => c.crushUserId?._id === u._id) &&
        (search ? u.name.toLowerCase().includes(search.toLowerCase()) || u.department.toLowerCase().includes(search.toLowerCase()) : true)
    );

    const slotsUsed = crushes.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-3xl mx-auto">
            {/* Mutual reveal overlay */}
            <AnimatePresence>
                {showReveal && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ background: 'rgba(10,6,18,0.85)', backdropFilter: 'blur(16px)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                            transition={{ type: 'spring', damping: 12 }} className="text-center">
                            <div className="text-8xl mb-4 animate-float">💘</div>
                            <h2 className="text-4xl font-bold text-gradient mb-3">Crush Revealed!</h2>
                            <p className="text-text-muted text-lg">They picked you too! ✨</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    <span className="text-gradient">Secret Crush</span> <span className="animate-float inline-block">🤫</span>
                </h1>
                <p className="text-text-muted text-sm">Pick up to 3 anonymous crushes per month. Mutual picks reveal both identities!</p>
            </motion.div>

            {/* Crush slots */}
            <motion.div className="glass-card rounded-2xl p-6 mb-8"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8B5CF6, #EC4899)' }} />
                        Your Crushes
                    </h2>
                    <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                                style={{ background: i < slotsUsed ? '#EC4899' : 'rgba(155,143,199,0.2)' }} />
                        ))}
                        <span className="text-text-muted text-xs ml-1.5">{slotsUsed}/3</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((slot) => {
                        const crush = crushes[slot];
                        return (
                            <motion.div key={slot}
                                className={`rounded-2xl p-4 text-center relative overflow-hidden group cursor-pointer transition-all duration-300 ${crush ? 'bg-surface-3/50' : 'bg-surface-2/30 border-2 border-dashed border-white/5'}`}
                                style={crush ? { border: '1px solid rgba(236,72,153,0.15)' } : {}}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: slot * 0.08 }}
                                whileHover={crush ? { y: -2, boxShadow: '0 8px 20px -6px rgba(236,72,153,0.15)' } : {}}
                                onClick={() => crush && navigate(`/user/${crush.crushUserId._id}`)}
                            >
                                {crush ? (
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-full mx-auto mb-3 p-0.5 relative group-hover:scale-105 transition-transform duration-300"
                                            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}>
                                            {crush.crushUserId.photos?.[0] || crush.crushUserId.avatar ? (
                                                <img src={crush.crushUserId.photos?.[0] || crush.crushUserId.avatar} alt={crush.crushUserId.name}
                                                    className="w-full h-full rounded-full object-cover border-2 border-[#130E22]" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-surface-3 flex items-center justify-center text-xl font-bold text-white">
                                                    {crush.crushUserId.name?.[0]}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-[#130E22] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-sm font-medium truncate mb-1">{crush.crushUserId?.name}</p>
                                        <p className="text-[11px] text-text-muted mb-3">{crush.crushUserId?.department}</p>
                                        <button onClick={(e) => { e.stopPropagation(); removeCrush(crush.crushUserId._id); }}
                                            className="text-[10px] font-medium text-text-muted hover:text-danger transition-colors bg-surface-2 px-2 py-1 rounded-full border border-white/5 hover:border-danger/20">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-text-muted/20 group-hover:text-text-muted/40 transition-colors">
                                        <span className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:scale-110 transform">💜</span>
                                        <span className="text-[11px] font-medium">Empty Slot</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Revealed crushes */}
            {revealed.length > 0 && (
                <motion.div className="glass-card rounded-2xl p-6 mb-8 border-pink-500/20 bg-pink-500/5"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                        <span className="text-lg">💘</span> Mutual Reveals
                    </h2>
                    <div className="space-y-3">
                        {revealed.map((user) => (
                            <div key={user._id} className="glass-card flex items-center gap-4 p-3 rounded-xl hover:bg-surface-3/50 transition-colors cursor-pointer group"
                                onClick={() => navigate(`/user/${user._id}`)}>
                                <div className="w-12 h-12 rounded-full p-0.5"
                                    style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}>
                                    {user.photos?.[0] || user.avatar ? (
                                        <img src={user.photos?.[0] || user.avatar} alt={user.name}
                                            className="w-full h-full rounded-full object-cover border-2 border-[#130E22]" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-surface-3 flex items-center justify-center text-white font-bold">
                                            {user.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm group-hover:text-primary-light transition-colors">{user.name}</p>
                                    <p className="text-text-muted text-xs">{user.department} • Year {user.year}</p>
                                </div>
                                <span className="text-2xl opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">👉</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Browse profiles to add crush */}
            {slotsUsed < 3 && (
                <motion.div className="glass-card rounded-2xl p-6"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-base font-bold mb-5 flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8B5CF6, #EC4899)' }} />
                        Add a Crush
                    </h2>

                    {!browsing ? (
                        <button onClick={loadBrowseProfiles} className="btn-primary w-full py-3.5 text-sm justify-center">
                            🔍 Browse Profiles
                        </button>
                    ) : (
                        <>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <input
                                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or department..."
                                    className="search-field"
                                    autoFocus
                                />
                                <button onClick={() => setBrowsing(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 customize-scrollbar">
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <motion.div key={user._id}
                                        className="list-row rounded-xl group"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        onClick={() => navigate(`/user/${user._id}`)}>

                                        <div className="w-10 h-10 rounded-full cursor-pointer relative overflow-hidden" style={{ background: 'var(--color-surface-4)' }}>
                                            {user.photos?.[0] || user.avatar ? (
                                                <img src={user.photos?.[0] || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary-light">
                                                    {user.name?.[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.name}</p>
                                            <p className="text-text-muted text-xs truncate">{user.department} • Year {user.year}</p>
                                        </div>

                                        <button onClick={(e) => { e.stopPropagation(); addCrush(user._id); }}
                                            className="btn-primary py-1.5 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            Pick
                                        </button>
                                    </motion.div>
                                )) : (
                                    <div className="text-center py-8">
                                        <p className="text-text-muted text-sm">No profiles found matching "{search}"</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}
