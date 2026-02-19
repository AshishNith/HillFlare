import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, Users } from 'lucide-react';
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

    // Re-fetch when params change
    useEffect(() => {
        fetchProfiles();
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
        if (score >= 30) return '#34D399';
        if (score >= 15) return '#FBBF24';
        return '#9B8FC7';
    };

    return (
        <div style={{ padding: '32px 40px', maxWidth: '960px', margin: '0 auto' }}>

            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
                    Explore
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    {loading ? 'Finding people...' : `${profiles.length} people match your search`}
                </p>
            </motion.div>

            {/* ── Search + Filter row ── */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'stretch' }}>

                {/* Search bar */}
                <div style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    backgroundColor: 'var(--color-surface-2)',
                    borderRadius: '8px',
                    padding: '0 14px',
                    border: `1px solid ${focused ? 'var(--color-primary)' : 'transparent'}`,
                    transition: 'border-color 0.15s ease',
                }}>
                    <Search size={16} color={focused ? 'var(--color-primary)' : 'var(--color-text-muted)'}
                        style={{ flexShrink: 0, transition: 'color 0.15s' }} />
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Search by name, department, or interest..."
                        style={{
                            flex: 1, padding: '13px 0',
                            background: 'none', border: 'none', outline: 'none',
                            color: 'var(--color-text)', fontSize: '14px',
                            fontFamily: 'inherit',
                        }}
                    />
                    <AnimatePresence>
                        {search && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                                onClick={() => { setSearch(''); inputRef.current?.focus(); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                            >
                                <X size={15} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Filter button — with popup */}
                <div ref={filterRef} style={{ position: 'relative' }}>
                    <button
                        onClick={openFilter}
                        style={{
                            height: '100%', minHeight: '46px',
                            padding: '0 16px',
                            display: 'flex', alignItems: 'center', gap: '7px',
                            backgroundColor: filterOpen || activeFilterCount > 0 ? 'rgba(139,92,246,0.12)' : 'var(--color-surface-2)',
                            border: `1px solid ${filterOpen || activeFilterCount > 0 ? 'rgba(139,92,246,0.3)' : 'transparent'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: filterOpen || activeFilterCount > 0 ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                            fontSize: '14px', fontWeight: 500,
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <SlidersHorizontal size={15} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span style={{
                                width: '18px', height: '18px', borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                color: '#fff', fontSize: '11px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{activeFilterCount}</span>
                        )}
                    </button>

                    {/* ── Filter popup ── */}
                    <AnimatePresence>
                        {filterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                    width: '380px',
                                    backgroundColor: 'var(--color-surface-2)',
                                    borderRadius: '10px',
                                    border: '1px solid var(--color-border-strong)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Popup header */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '16px 18px',
                                    borderBottom: '1px solid var(--color-border)',
                                }}>
                                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>Filters</span>
                                    <button onClick={() => setFilterOpen(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: '2px' }}>
                                        <X size={16} />
                                    </button>
                                </div>

                                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '420px', overflowY: 'auto' }}>

                                    {/* Department */}
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Department</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {DEPARTMENTS.map(d => (
                                                <button key={d}
                                                    onClick={() => setPendingDept(pendingDept === d ? '' : d)}
                                                    style={{
                                                        padding: '5px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                                        fontSize: '12px', fontWeight: 500, transition: 'all 0.12s',
                                                        backgroundColor: pendingDept === d ? 'rgba(139,92,246,0.18)' : 'var(--color-surface-3)',
                                                        color: pendingDept === d ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                                    }}>
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Year */}
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Year</p>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {YEARS.map(y => (
                                                <button key={y}
                                                    onClick={() => setPendingYear(pendingYear === y ? '' : y)}
                                                    style={{
                                                        padding: '5px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                                        fontSize: '12px', fontWeight: 500, transition: 'all 0.12s',
                                                        backgroundColor: pendingYear === y ? 'rgba(139,92,246,0.18)' : 'var(--color-surface-3)',
                                                        color: pendingYear === y ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                                    }}>
                                                    Year {y}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interests */}
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Interest</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {INTERESTS.map(i => (
                                                <button key={i}
                                                    onClick={() => setPendingInterest(pendingInterest === i ? '' : i)}
                                                    style={{
                                                        padding: '5px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                                        fontSize: '12px', fontWeight: 500, transition: 'all 0.12s',
                                                        backgroundColor: pendingInterest === i ? 'rgba(139,92,246,0.18)' : 'var(--color-surface-3)',
                                                        color: pendingInterest === i ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                                    }}>
                                                    {i}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Popup footer — Clear + Apply */}
                                <div style={{
                                    display: 'flex', gap: '8px', padding: '14px 18px',
                                    borderTop: '1px solid var(--color-border)',
                                }}>
                                    <button onClick={clearPending}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                            backgroundColor: 'var(--color-surface-3)',
                                            color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600,
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-4)')}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-3)')}
                                    >
                                        Clear
                                    </button>
                                    <button onClick={applyFilters}
                                        style={{
                                            flex: 2, padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                            backgroundColor: 'var(--color-primary)',
                                            color: '#fff', fontSize: '13px', fontWeight: 700,
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)')}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Active filter tags */}
            <AnimatePresence>
                {activeFilterCount > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {appliedDept && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'rgba(139,92,246,0.12)', color: 'var(--color-primary-light)', fontSize: '12px', fontWeight: 500 }}>
                                {appliedDept}
                                <button onClick={() => setAppliedDept('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}><X size={11} /></button>
                            </span>
                        )}
                        {appliedYear && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'rgba(139,92,246,0.12)', color: 'var(--color-primary-light)', fontSize: '12px', fontWeight: 500 }}>
                                Year {appliedYear}
                                <button onClick={() => setAppliedYear('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}><X size={11} /></button>
                            </span>
                        )}
                        {appliedInterest && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'rgba(139,92,246,0.12)', color: 'var(--color-primary-light)', fontSize: '12px', fontWeight: 500 }}>
                                {appliedInterest}
                                <button onClick={() => setAppliedInterest('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}><X size={11} /></button>
                            </span>
                        )}
                        <button onClick={clearApplied}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 500 }}>
                            Clear all
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {loading ? (
                <div style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--color-text-muted)' }}>
                    <div style={{ width: '32px', height: '32px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <p>Finding compatible profiles...</p>
                </div>
            ) : profiles.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--color-text-muted)' }}>
                    <Users size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No profiles found</p>
                    <p style={{ fontSize: '13px', opacity: 0.6 }}>Try adjusting your search or filters</p>
                    {(search || activeFilterCount > 0) && (
                        <button onClick={() => { setSearch(''); clearApplied(); }}
                            style={{ marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600 }}>
                            Clear all
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', backgroundColor: 'var(--color-border)' }}>
                    {profiles.map((profile, i) => {
                        const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                        return (
                            <motion.div key={profile._id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                style={{ backgroundColor: 'var(--color-surface-2)', cursor: 'pointer', overflow: 'hidden' }}
                                onClick={() => navigate(`/user/${profile._id}`)}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-3)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
                            >
                                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-3)', position: 'relative' }}>
                                    {profile.photos?.[0] ? (
                                        <img src={profile.photos[0]} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                                            {initials}
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.6)', fontSize: '11px', fontWeight: 700, color: getScoreColor(profile.compatibilityScore) }}>
                                        {profile.compatibilityScore}%
                                    </div>
                                </div>
                                <div style={{ padding: '14px 16px' }}>
                                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '3px' }}>{profile.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>{profile.department} · Year {profile.year}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {profile.interests?.slice(0, 3).map(interest => (
                                            <span key={interest} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(139,92,246,0.1)', color: 'var(--color-primary-light)', fontSize: '11px', fontWeight: 500 }}>{interest}</span>
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

