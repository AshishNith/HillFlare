import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import api from '../services/api';

interface Profile {
    _id: string; name: string; department: string; year: number;
    interests: string[]; clubs: string[]; photos: string[]; bio: string; avatar: string;
}

export default function SwipePage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matchAnimation, setMatchAnimation] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const { data } = await api.get('/swipes/feed'); setProfiles(data.data || []); } catch { }
            setLoading(false);
        })();
    }, []);

    const handleSwipe = async (type: 'like' | 'pass') => {
        const profile = profiles[currentIndex];
        if (!profile) return;
        try {
            const { data } = await api.post('/swipes', { toUser: profile._id, type });
            if (data.data?.isMatch) { setMatchAnimation(true); setTimeout(() => setMatchAnimation(false), 2500); }
        } catch { }
        setCurrentIndex((prev) => prev + 1);
    };

    const currentProfile = profiles[currentIndex];
    const remaining = profiles.length - currentIndex;

    return (
        <div className="p-6 lg:p-10 max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold"><span className="text-gradient">Discover</span></h1>
                    <p className="text-text-muted text-xs mt-1">Swipe right to like, left to pass</p>
                </div>
                {profiles.length > 0 && (
                    <div className="text-right">
                        <p className="text-xl font-bold text-primary-light">{remaining > 0 ? remaining : 0}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">profiles left</p>
                    </div>
                )}
            </div>

            {/* Match overlay */}
            <AnimatePresence>
                {matchAnimation && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,6,18,0.8)', backdropFilter: 'blur(12px)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                            transition={{ type: 'spring', damping: 12 }} className="text-center">
                            <div className="text-8xl mb-4 animate-float">💘</div>
                            <h2 className="text-4xl font-bold text-gradient mb-2">It's a Match!</h2>
                            <p className="text-text-muted">You both liked each other ✨</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card stack */}
            <div className="relative w-full max-w-sm aspect-[3/4]">
                <AnimatePresence>
                    {currentProfile ? (
                        <SwipeCard key={currentProfile._id} profile={currentProfile} onSwipe={handleSwipe} />
                    ) : loading ? (
                        <div className="glass rounded-3xl w-full h-full flex items-center justify-center glow-pulse">
                            <div className="text-center text-text-muted">
                                <div className="text-5xl mb-4 animate-float">💜</div>
                                <p className="font-medium">Loading profiles...</p>
                            </div>
                        </div>
                    ) : (
                        <motion.div className="glass rounded-3xl w-full h-full flex items-center justify-center border-gradient"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="text-center text-text-muted p-8">
                                <div className="text-6xl mb-4">🎉</div>
                                <p className="text-xl font-bold mb-2 text-text">All caught up!</p>
                                <p className="text-sm">Come back later for new profiles</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action buttons */}
            {currentProfile && (
                <div className="flex items-center gap-8 mt-8">
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('pass')}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all"
                        style={{ background: 'rgba(248,113,113,0.1)', border: '2px solid rgba(248,113,113,0.25)', boxShadow: '0 4px 20px rgba(248,113,113,0.1)' }}>
                        ✕
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('like')}
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))', border: '2px solid rgba(139,92,246,0.3)', boxShadow: '0 4px 20px rgba(139,92,246,0.15)' }}>
                        💜
                    </motion.button>
                </div>
            )}
        </div>
    );
}

function SwipeCard({ profile, onSwipe }: { profile: Profile; onSwipe: (type: 'like' | 'pass') => void }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-18, 18]);
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 100) onSwipe('like');
        else if (info.offset.x < -100) onSwipe('pass');
    };

    const initials = profile.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
    const hue = (profile._id.charCodeAt(0) * 37) % 360;

    return (
        <motion.div
            className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ x, rotate, background: 'linear-gradient(180deg, rgba(19,14,34,0.9), rgba(10,6,18,0.95))', border: '1px solid rgba(139,92,246,0.12)', boxShadow: '0 12px 48px rgba(0,0,0,0.4)' }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.9} onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
        >
            {/* Stamps */}
            <motion.div className="absolute top-6 left-6 z-10 px-5 py-2 border-[3px] border-success rounded-lg text-success font-extrabold text-2xl -rotate-12"
                style={{ opacity: likeOpacity, textShadow: '0 0 20px rgba(52,211,153,0.5)' }}>LIKE</motion.div>
            <motion.div className="absolute top-6 right-6 z-10 px-5 py-2 border-[3px] border-danger rounded-lg text-danger font-extrabold text-2xl rotate-12"
                style={{ opacity: nopeOpacity, textShadow: '0 0 20px rgba(248,113,113,0.5)' }}>NOPE</motion.div>

            {/* Avatar area */}
            <div className="h-[60%] flex items-center justify-center relative"
                style={{ background: `linear-gradient(180deg, hsla(${hue},50%,40%,0.15) 0%, transparent 100%)` }}>
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 60%, hsla(${hue},60%,50%,0.1) 0%, transparent 60%)` }} />
                {profile.photos?.[0] ? (
                    <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold relative"
                        style={{ background: `linear-gradient(135deg, hsla(${hue},50%,50%,0.3), hsla(${hue},60%,40%,0.15))`, color: `hsl(${hue},60%,70%)` }}>
                        {initials}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-6 h-[40%] flex flex-col justify-center" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(10,6,18,0.6) 100%)' }}>
                <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
                <p className="text-text-muted text-sm mb-3">{profile.department} • Year {profile.year}</p>
                {profile.bio && <p className="text-text-muted/80 text-sm line-clamp-2 mb-3">{profile.bio}</p>}
                <div className="flex flex-wrap gap-1.5">
                    {profile.interests?.slice(0, 4).map((interest) => (
                        <span key={interest} className="chip chip-primary text-xs">{interest}</span>
                    ))}
                </div>
                <Link to={`/user/${profile._id}`}
                    onClick={e => e.stopPropagation()}
                    className="mt-3 block text-center text-xs font-semibold py-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#A78BFA', textDecoration: 'none' }}>
                    View Full Profile
                </Link>
            </div>
        </motion.div>
    );
}
