import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

interface CrushEntry {
    _id: string;
    crushUserId: { _id: string; name: string; department: string; avatar: string; photos: string[] };
}

interface RevealedUser {
    _id: string; name: string; department: string; year: number; avatar: string; photos: string[];
}

interface BrowseUser {
    _id: string; name: string; department: string; year: number; interests: string[];
}

export default function CrushPage() {
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
            <motion.div className="rounded-2xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, rgba(19,14,34,0.7), rgba(28,21,51,0.5))', border: '1px solid rgba(139,92,246,0.1)' }}
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
                                className="rounded-2xl p-4 text-center relative overflow-hidden"
                                style={crush
                                    ? { background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.05))', border: '1px solid rgba(236,72,153,0.15)' }
                                    : { border: '2px dashed rgba(155,143,199,0.12)', background: 'rgba(28,21,51,0.3)' }
                                }
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: slot * 0.08 }}
                                whileHover={crush ? { y: -2 } : {}}
                            >
                                {crush ? (
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold"
                                            style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(139,92,246,0.15))', color: '#F472B6' }}>
                                            {crush.crushUserId?.name?.[0] || '?'}
                                        </div>
                                        <p className="text-sm font-medium truncate mb-1">{crush.crushUserId?.name}</p>
                                        <p className="text-[11px] text-text-muted mb-2">{crush.crushUserId?.department}</p>
                                        <button onClick={() => removeCrush(crush.crushUserId._id)}
                                            className="text-[11px] text-text-muted/50 hover:text-danger transition-colors">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-3 text-text-muted/25">
                                        <span className="text-3xl mb-2 animate-float" style={{ animationDelay: `${slot * 0.5}s` }}>💜</span>
                                        <span className="text-[11px]">Empty slot</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Revealed crushes */}
            {revealed.length > 0 && (
                <motion.div className="rounded-2xl p-6 mb-8"
                    style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.05))', border: '1px solid rgba(236,72,153,0.15)', boxShadow: '0 0 30px rgba(236,72,153,0.08)' }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                        <span className="text-lg">💘</span> Mutual Reveals
                    </h2>
                    <div className="space-y-3">
                        {revealed.map((user) => (
                            <div key={user._id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(236,72,153,0.06)' }}>
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
                                    style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(139,92,246,0.15))', color: '#F472B6' }}>
                                    {user.name?.[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{user.name}</p>
                                    <p className="text-text-muted text-xs">{user.department} • Year {user.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Browse profiles to add crush */}
            {slotsUsed < 3 && (
                <motion.div className="rounded-2xl p-6"
                    style={{ background: 'linear-gradient(135deg, rgba(19,14,34,0.7), rgba(28,21,51,0.5))', border: '1px solid rgba(139,92,246,0.1)' }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8B5CF6, #EC4899)' }} />
                        Add a Crush
                    </h2>

                    {!browsing ? (
                        <button onClick={loadBrowseProfiles} className="btn-accent w-full py-3.5 text-sm">
                            🔍 Browse Profiles
                        </button>
                    ) : (
                        <>
                            <input
                                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or department..."
                                className="input-field mb-4 text-sm"
                            />
                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <motion.div key={user._id}
                                        className="flex items-center justify-between p-3.5 rounded-xl group"
                                        style={{ background: 'rgba(28,21,51,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}
                                        whileHover={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                                style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>
                                                {user.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-text-muted text-xs">{user.department} • Year {user.year}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => addCrush(user._id)}
                                            className="btn-accent px-4 py-2 text-xs !rounded-xl">
                                            🤫 Pick
                                        </button>
                                    </motion.div>
                                )) : (
                                    <p className="text-text-muted text-sm text-center py-6">No profiles found</p>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}
