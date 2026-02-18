import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';

const INTERESTS = ['Music', 'Movies', 'Gaming', 'Reading', 'Travel', 'Photography', 'Fitness', 'Art', 'Technology', 'Sports', 'Cooking', 'Dance', 'Writing', 'Anime'];
const CLUBS = ['Coding Club', 'Drama Society', 'Music Club', 'Dance Club', 'Debate Society', 'Photography Club', 'Sports Club', 'Robotics Club', 'Literary Club', 'Quiz Club'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Mathematics', 'Physics', 'Chemistry', 'MBA'];

export default function ProfilePage() {
    const { user, updateProfile } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '', bio: user?.bio || '',
        department: user?.department || '', year: user?.year || 1,
        interests: user?.interests || [], clubs: user?.clubs || [],
    });

    const toggle = (field: 'interests' | 'clubs', item: string) => {
        setForm((p) => ({ ...p, [field]: p[field].includes(item) ? p[field].filter((i) => i !== item) : [...p[field], item] }));
    };

    const save = async () => {
        setSaving(true);
        await updateProfile(form);
        setSaving(false);
        setEditing(false);
    };

    const startEdit = () => {
        setForm({
            name: user?.name || '', bio: user?.bio || '',
            department: user?.department || '', year: user?.year || 1,
            interests: user?.interests || [], clubs: user?.clubs || [],
        });
        setEditing(true);
    };

    const initials = user?.name?.split(' ').map((n) => n[0]).join('') || '?';
    const completionItems = [user?.name, user?.department, user?.bio, (user?.interests?.length || 0) > 0, (user?.clubs?.length || 0) > 0];
    const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    return (
        <div className="p-6 lg:p-10 max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Profile header */}
                <div className="rounded-3xl p-8 mb-6 text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(19,14,34,0.8), rgba(28,21,51,0.6))', border: '1px solid rgba(139,92,246,0.1)' }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)' }} />
                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold relative"
                            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))', color: '#A78BFA' }}>
                            {initials}
                            {/* Completion ring */}
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="2" />
                                <circle cx="50" cy="50" r="47" fill="none" stroke="url(#ring-grad)" strokeWidth="2.5"
                                    strokeDasharray={`${completion * 2.95} 295`} strokeLinecap="round" />
                                <defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" />
                                </linearGradient></defs>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-1">{user?.name || 'Your Name'}</h1>
                        <p className="text-text-muted text-sm">{user?.department}{user?.year ? ` • Year ${user.year}` : ''}</p>
                        <p className="text-text-muted/60 text-xs mt-1">{user?.email}</p>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}>
                            <span style={{ color: completion === 100 ? '#34D399' : '#A78BFA' }}>{completion}%</span>
                            <span className="text-text-muted">profile complete</span>
                        </div>
                    </div>
                </div>

                {/* Edit toggle */}
                <div className="flex justify-end mb-5">
                    <button onClick={editing ? () => setEditing(false) : startEdit}
                        className={editing ? 'btn-secondary px-5 py-2.5 text-sm' : 'btn-primary px-5 py-2.5 text-sm'}>
                        {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                    </button>
                </div>

                {editing ? (
                    <div className="space-y-5 animate-fade-in-up">
                        {/* Basic info */}
                        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(19,14,34,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}>
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Basic Info</h3>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Full Name" className="input-field" />
                            <div className="relative">
                                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 300) })}
                                    placeholder="Write a short bio about yourself..." maxLength={300}
                                    className="input-field h-24 resize-none" />
                                <span className="absolute bottom-3 right-3 text-[11px] text-text-muted/40">{form.bio.length}/300</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    className="input-field">
                                    <option value="" disabled>Department</option>
                                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                                    className="input-field">
                                    {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Interests */}
                        <div className="rounded-2xl p-6" style={{ background: 'rgba(19,14,34,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}>
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
                                Interests <span className="text-text-muted/40 font-normal">({form.interests.length} selected)</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map((i) => (
                                    <button key={i} onClick={() => toggle('interests', i)}
                                        className={`chip chip-primary ${form.interests.includes(i) ? 'active !bg-primary/25 !border-primary/40 !text-primary-light' : ''}`}>
                                        {i}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clubs */}
                        <div className="rounded-2xl p-6" style={{ background: 'rgba(19,14,34,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}>
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
                                Clubs <span className="text-text-muted/40 font-normal">({form.clubs.length} selected)</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {CLUBS.map((c) => (
                                    <button key={c} onClick={() => toggle('clubs', c)}
                                        className={`chip chip-accent ${form.clubs.includes(c) ? 'active !bg-accent/25 !border-accent/40 !text-accent-light' : ''}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={save} disabled={saving}
                            className="btn-primary w-full py-4 text-base">
                            {saving ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {user?.bio && (
                            <div className="rounded-2xl p-6" style={{ background: 'rgba(19,14,34,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}>
                                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">About</h3>
                                <p className="text-text-muted/80 text-sm leading-relaxed">{user.bio}</p>
                            </div>
                        )}
                        <div className="rounded-2xl p-6" style={{ background: 'rgba(19,14,34,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}>
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {user?.interests?.length ? user.interests.map((i) => (
                                    <span key={i} className="chip chip-primary">{i}</span>
                                )) : <p className="text-text-muted/40 text-sm">No interests added yet</p>}
                            </div>
                        </div>
                        <div className="rounded-2xl p-6" style={{ background: 'rgba(19,14,34,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}>
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Clubs</h3>
                            <div className="flex flex-wrap gap-2">
                                {user?.clubs?.length ? user.clubs.map((c) => (
                                    <span key={c} className="chip chip-accent">{c}</span>
                                )) : <p className="text-text-muted/40 text-sm">No clubs added yet</p>}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
