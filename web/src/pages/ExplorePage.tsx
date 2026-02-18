import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

interface ExploreProfile {
    _id: string;
    name: string;
    department: string;
    year: number;
    interests: string[];
    clubs: string[];
    bio: string;
    avatar: string;
    photos: string[];
    compatibilityScore: number;
}

const INTERESTS = ['Music', 'Movies', 'Gaming', 'Reading', 'Travel', 'Photography', 'Cooking', 'Fitness', 'Art', 'Technology', 'Sports', 'Anime'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology', 'Mathematics', 'Physics'];

export default function ExplorePage() {
    const [profiles, setProfiles] = useState<ExploreProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ department: '', interests: '' });

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.department) params.set('department', filters.department);
            if (filters.interests) params.set('interests', filters.interests);
            const { data } = await api.get(`/explore?${params.toString()}`);
            setProfiles(data.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchProfiles(); }, []);

    const getScoreColor = (score: number) => {
        if (score >= 30) return '#34D399';
        if (score >= 15) return '#FBBF24';
        return '#9B8FC7';
    };

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-2">
                    <span className="text-gradient">Explore</span> Compatibility
                </h1>
                <p className="text-text-muted mb-8">Find people who match your vibe</p>
            </motion.div>

            {/* Filters */}
            <div className="glass rounded-2xl p-6 mb-8 flex flex-wrap gap-4">
                <select value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="px-4 py-2.5 rounded-xl bg-surface-3 border border-primary/10 text-text text-sm focus:outline-none focus:border-primary/40">
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="flex flex-wrap gap-2">
                    {INTERESTS.slice(0, 8).map((interest) => (
                        <button key={interest}
                            onClick={() => setFilters({ ...filters, interests: filters.interests === interest ? '' : interest })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.interests === interest
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-3 text-text-muted hover:bg-surface-4 border border-primary/10'
                                }`}>
                            {interest}
                        </button>
                    ))}
                </div>
                <button onClick={fetchProfiles} className="btn-primary px-6 py-2.5 text-sm ml-auto">
                    🔍 Search
                </button>
            </div>

            {/* Results */}
            {loading ? (
                <div className="text-center py-20 text-text-muted">
                    <div className="text-4xl mb-4 animate-pulse">🔍</div>
                    <p>Finding compatible profiles...</p>
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-20 text-text-muted">
                    <div className="text-5xl mb-4">🤷</div>
                    <p>No profiles found. Try different filters!</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map((profile, i) => {
                        const initials = profile.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
                        return (
                            <motion.div
                                key={profile._id}
                                className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="h-40 flex items-center justify-center relative"
                                    style={{ background: `linear-gradient(135deg, ${getScoreColor(profile.compatibilityScore)}15, transparent)` }}>
                                    {profile.photos?.[0] ? (
                                        <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold bg-primary/20 text-primary-light">
                                            {initials}
                                        </div>
                                    )}
                                    {/* Compatibility badge */}
                                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold glass"
                                        style={{ color: getScoreColor(profile.compatibilityScore) }}>
                                        {profile.compatibilityScore}% match
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg mb-1">{profile.name}</h3>
                                    <p className="text-text-muted text-sm mb-3">{profile.department} • Year {profile.year}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.interests?.slice(0, 3).map((i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary-light">{i}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
