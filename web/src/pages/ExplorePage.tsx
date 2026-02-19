import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Users, 
  Sparkles, 
  Filter,
  Star,
  MapPin,
  GraduationCap,
  Heart,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { GlassCard, Avatar, NeonTag, GradientButton, GlassInput, BlurModal } from '../components/ui';

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
const YEARS = ['1', '2', '3', '4'];

export default function ExplorePage() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<ExploreProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [focused, setFocused] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Pending (inside popup, not yet applied)
    const [pendingDept, setPendingDept] = useState('');
    const [pendingInterest, setPendingInterest] = useState('');
    const [pendingYear, setPendingYear] = useState('');

    // Applied (used for actual filtering)
    const [appliedDept, setAppliedDept] = useState('');
    const [appliedInterest, setAppliedInterest] = useState('');
    const [appliedYear, setAppliedYear] = useState('');

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const activeFilterCount = [appliedDept, appliedInterest, appliedYear].filter(Boolean).length;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (appliedDept) params.department = appliedDept;
            if (appliedYear) params.year = appliedYear;
            if (appliedInterest) params.interests = appliedInterest;

            const { data } = await api.get('/explore', { params });
            setProfiles(data.data || []);
        } catch { }
        setLoading(false);
    };

    // Only fetch when filters are applied or search has text
    useEffect(() => {
        if (debouncedSearch.trim() || appliedDept || appliedYear || appliedInterest) {
            fetchProfiles();
        } else {
            setProfiles([]);
            setLoading(false);
        }
    }, [debouncedSearch, appliedDept, appliedYear, appliedInterest]);

    // Close popup on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false);
            }
        };
        if (filterOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [filterOpen]);

    const openFilter = () => {
        // Sync pending with applied when opening
        setPendingDept(appliedDept);
        setPendingInterest(appliedInterest);
        setPendingYear(appliedYear);
        setFilterOpen(v => !v);
    };

    const applyFilters = () => {
        setAppliedDept(pendingDept);
        setAppliedInterest(pendingInterest);
        setAppliedYear(pendingYear);
        setFilterOpen(false);
    };

    const clearPending = () => {
        setPendingDept('');
        setPendingInterest('');
        setPendingYear('');
    };

    const clearApplied = () => {
        setAppliedDept('');
        setAppliedInterest('');
        setAppliedYear('');
    };

    const getScoreColor = (score: number) => {
        if (score >= 30) return 'text-green-400';
        if (score >= 15) return 'text-yellow-400';
        return 'text-purple-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 30) return 'bg-green-400/20 border-green-400/30';
        if (score >= 15) return 'bg-yellow-400/20 border-yellow-400/30';
        return 'bg-purple-400/20 border-purple-400/30';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-600/4 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }} />
            </div>

            <div className="max-w-7xl mx-auto p-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Explore</h1>
                            <p className="text-white/60">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                                        Finding compatible people...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        {profiles.length === 0 ? 'No matches found' : `${profiles.length} ${profiles.length === 1 ? 'person matches' : 'people match'} your search`}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Search & Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <GlassCard className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                                    focused ? 'text-purple-400' : 'text-white/50'
                                }`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    placeholder="Search by name, department, or interests..."
                                    className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none backdrop-blur-sm transition-all ${
                                        focused ? 'border-purple-400/50 bg-white/15' : 'border-white/20'
                                    }`}
                                />
                                <AnimatePresence>
                                    {search && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => { setSearch(''); inputRef.current?.focus(); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white/70" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Filter Button */}
                            <div ref={filterRef} className="relative">
                                <button
                                    onClick={openFilter}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all ${
                                        filterOpen || activeFilterCount > 0
                                            ? 'bg-purple-500/20 border border-purple-400/40 text-purple-300'
                                            : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/15'
                                    }`}
                                >
                                    <Filter className="w-5 h-5" />
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">{activeFilterCount}</span>
                                        </div>
                                    )}
                                </button>

                                {/* Filter Modal/Popup */}
                                <AnimatePresence>
                                    {filterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute top-full mt-4 right-0 w-96 z-50"
                                        >
                                            <GlassCard className="p-6">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                                                            <SlidersHorizontal className="w-4 h-4 text-white" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white">Filters</h3>
                                                    </div>
                                                    <button
                                                        onClick={() => setFilterOpen(false)}
                                                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white/60" />
                                                    </button>
                                                </div>

                                                <div className="space-y-6 max-h-96 overflow-y-auto">
                                                    {/* Department */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <GraduationCap className="w-4 h-4 text-purple-400" />
                                                            <label className="text-sm font-bold text-white/90 uppercase tracking-widest">
                                                                Department
                                                            </label>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {DEPARTMENTS.map(dept => (
                                                                <NeonTag
                                                                    key={dept}
                                                                    variant="purple"
                                                                    size="sm"
                                                                    interactive
                                                                    selected={pendingDept === dept}
                                                                    onClick={() => setPendingDept(pendingDept === dept ? '' : dept)}
                                                                >
                                                                    {dept}
                                                                </NeonTag>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Year */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Star className="w-4 h-4 text-yellow-400" />
                                                            <label className="text-sm font-bold text-white/90 uppercase tracking-widest">
                                                                Year
                                                            </label>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {YEARS.map(year => (
                                                                <button
                                                                    key={year}
                                                                    onClick={() => setPendingYear(pendingYear === year ? '' : year)}
                                                                    className={`w-16 h-16 rounded-2xl font-bold text-lg transition-all ${
                                                                        pendingYear === year
                                                                            ? 'bg-yellow-500/20 border-2 border-yellow-400/40 text-yellow-300'
                                                                            : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                                                                    }`}
                                                                >
                                                                    {year}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Interests */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Heart className="w-4 h-4 text-pink-400" />
                                                            <label className="text-sm font-bold text-white/90 uppercase tracking-widest">
                                                                Interest
                                                            </label>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {INTERESTS.map(interest => (
                                                                <NeonTag
                                                                    key={interest}
                                                                    variant="pink"
                                                                    size="sm"
                                                                    interactive
                                                                    selected={pendingInterest === interest}
                                                                    onClick={() => setPendingInterest(pendingInterest === interest ? '' : interest)}
                                                                >
                                                                    {interest}
                                                                </NeonTag>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                                                    <button
                                                        onClick={clearPending}
                                                        className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                    <GradientButton
                                                        onClick={applyFilters}
                                                        size="lg"
                                                        className="flex-2 flex items-center gap-2"
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        Apply Filters
                                                    </GradientButton>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Active Filters */}
                <AnimatePresence>
                    {activeFilterCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <GlassCard className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-sm font-medium text-white/60">Active filters:</span>
                                        {appliedDept && (
                                            <NeonTag variant="purple" size="sm" interactive>
                                                {appliedDept}
                                                <button
                                                    onClick={() => setAppliedDept('')}
                                                    className="ml-2 hover:bg-white/10 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </NeonTag>
                                        )}
                                        {appliedYear && (
                                            <NeonTag variant="purple" size="sm" interactive>
                                                Year {appliedYear}
                                                <button
                                                    onClick={() => setAppliedYear('')}
                                                    className="ml-2 hover:bg-white/10 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </NeonTag>
                                        )}
                                        {appliedInterest && (
                                            <NeonTag variant="pink" size="sm" interactive>
                                                {appliedInterest}
                                                <button
                                                    onClick={() => setAppliedInterest('')}
                                                    className="ml-2 hover:bg-white/10 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </NeonTag>
                                        )}
                                    </div>
                                    <button
                                        onClick={clearApplied}
                                        className="text-sm text-white/60 hover:text-white font-medium transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                {loading && (activeFilterCount > 0 || debouncedSearch.trim()) ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-white/70 font-medium">Finding compatible profiles...</p>
                        <p className="text-white/50 text-sm mt-1">This might take a moment</p>
                    </motion.div>
                ) : profiles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <GlassCard className="p-12 text-center max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                                {!debouncedSearch.trim() && activeFilterCount === 0 ? (
                                    <Filter className="w-10 h-10 text-white/40" />
                                ) : (
                                    <Users className="w-10 h-10 text-white/40" />
                                )}
                            </div>
                            {!debouncedSearch.trim() && activeFilterCount === 0 ? (
                                <>
                                    <h3 className="text-2xl font-bold text-white mb-3">Ready to explore?</h3>
                                    <p className="text-white/60 mb-6">
                                        Use the search bar or apply filters to discover compatible people on campus.
                                    </p>
                                    <GradientButton
                                        onClick={openFilter}
                                        size="lg"
                                        className="flex items-center gap-2 mx-auto"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        Apply Filters
                                    </GradientButton>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-white mb-3">No matches found</h3>
                                    <p className="text-white/60 mb-6">
                                        Try adjusting your search terms or filters to find more compatible people.
                                    </p>
                                    <GradientButton
                                        onClick={() => { setSearch(''); clearApplied(); }}
                                        size="lg"
                                        className="flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Clear all filters
                                    </GradientButton>
                                </>
                            )}
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {profiles.map((profile, index) => (
                            <motion.div
                                key={profile._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <GlassCard 
                                    className="p-0 overflow-hidden cursor-pointer group"
                                    onClick={() => navigate(`/user/${profile._id}`)}
                                >
                                    {/* Profile Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                        {profile.photos?.[0] ? (
                                            <img
                                                src={profile.photos[0]}
                                                alt={profile.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Avatar
                                                    name={profile.name}
                                                    size="2xl"
                                                    className="border-4 border-white/20"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Compatibility Score */}
                                        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl border backdrop-blur-sm ${getScoreBg(profile.compatibilityScore)}`}>
                                            <div className="flex items-center gap-1">
                                                <Zap className={`w-3 h-3 ${getScoreColor(profile.compatibilityScore)}`} />
                                                <span className={`text-xs font-bold ${getScoreColor(profile.compatibilityScore)}`}>
                                                    {profile.compatibilityScore}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:gradient-text transition-all">
                                                {profile.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-white/60 text-sm">
                                                <GraduationCap className="w-4 h-4" />
                                                <span>{profile.department}</span>
                                                <span>•</span>
                                                <span>Year {profile.year}</span>
                                            </div>
                                        </div>

                                        {/* Bio Preview */}
                                        {profile.bio && (
                                            <p className="text-white/70 text-sm mb-4 line-clamp-2">
                                                {profile.bio}
                                            </p>
                                        )}

                                        {/* Interests */}
                                        <div className="flex flex-wrap gap-2">
                                            {profile.interests?.slice(0, 3).map(interest => (
                                                <NeonTag key={interest} variant="purple" size="xs">
                                                    {interest}
                                                </NeonTag>
                                            ))}
                                            {(profile.interests?.length || 0) > 3 && (
                                                <NeonTag variant="purple" size="xs">
                                                    +{profile.interests!.length - 3}
                                                </NeonTag>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

