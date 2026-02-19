import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, X, Check, LogOut, User, BookOpen, Users, Loader2, Camera, Trash2, ImagePlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const INTERESTS = ['Music', 'Movies', 'Gaming', 'Reading', 'Travel', 'Photography', 'Fitness', 'Art', 'Technology', 'Sports', 'Cooking', 'Dance', 'Writing', 'Anime'];
const CLUBS = ['Coding Club', 'Drama Society', 'Music Club', 'Dance Club', 'Debate Society', 'Photography Club', 'Sports Club', 'Robotics Club', 'Literary Club', 'Quiz Club'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Mathematics', 'Physics', 'Chemistry', 'MBA'];

export default function ProfilePage() {
    const { user, updateProfile, logout, fetchUser } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        department: user?.department || '',
        year: user?.year || 1,
        interests: user?.interests || [],
        clubs: user?.clubs || [],
    });

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
    const photos = user?.photos || [];

    const completionItems = [user?.name, user?.department, user?.bio, (user?.interests?.length || 0) > 0, (user?.clubs?.length || 0) > 0];
    const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    const toggle = (field: 'interests' | 'clubs', item: string) => {
        setForm(p => ({ ...p, [field]: p[field].includes(item) ? p[field].filter(i => i !== item) : [...p[field], item] }));
    };

    const startEdit = () => {
        setForm({ name: user?.name || '', bio: user?.bio || '', department: user?.department || '', year: user?.year || 1, interests: user?.interests || [], clubs: user?.clubs || [] });
        setEditing(true);
    };

    const save = async () => {
        setSaving(true);
        await updateProfile(form);
        setSaving(false);
        setEditing(false);
    };

    // Photo upload
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (photos.length >= 6) { alert('Maximum 6 photos allowed'); return; }
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                await api.post('/users/photos/upload', { image: reader.result });
                await fetchUser();
            } catch (err: any) {
                alert(err?.response?.data?.error || 'Upload failed. Check Cloudinary credentials.');
            }
            setUploading(false);
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // reset
    };

    // Photo delete
    const handlePhotoDelete = async (index: number) => {
        setDeletingIdx(index);
        try {
            await api.delete(`/users/photos/${index}`);
            await fetchUser();
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Delete failed');
        }
        setDeletingIdx(null);
    };

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '60px' }}>

            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />

            {/* ── Top hero section ── */}
            <div style={{ backgroundColor: 'var(--color-surface-2)', padding: '40px 40px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                    {/* Avatar with completion ring */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                            <circle cx="40" cy="40" r="37" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="2" />
                            <circle cx="40" cy="40" r="37" fill="none" stroke="#8B5CF6" strokeWidth="2.5"
                                strokeDasharray={`${completion * 2.325} 232.5`} strokeLinecap="round" />
                        </svg>
                        {photos.length > 0 ? (
                            <img src={photos[0]} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                backgroundColor: 'rgba(139,92,246,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-light)',
                            }}>{initials}</div>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                            {user?.name || 'Your Name'}
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
                            {user?.department}{user?.year ? ` · Year ${user.year}` : ''}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>{user?.email}</p>

                        <div style={{ marginTop: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Profile completion</span>
                                <span style={{ fontSize: '11px', color: completion === 100 ? 'var(--color-success)' : 'var(--color-primary-light)', fontWeight: 700 }}>{completion}%</span>
                            </div>
                            <div style={{ height: '3px', backgroundColor: 'var(--color-surface-4)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                                    style={{ height: '100%', backgroundColor: completion === 100 ? 'var(--color-success)' : 'var(--color-primary)', borderRadius: '2px' }} />
                            </div>
                        </div>
                    </div>

                    <button onClick={editing ? () => setEditing(false) : startEdit}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            backgroundColor: editing ? 'var(--color-surface-3)' : 'var(--color-primary)',
                            color: editing ? 'var(--color-text-muted)' : '#fff',
                            fontSize: '13px', fontWeight: 600, flexShrink: 0, transition: 'all 0.15s',
                        }}>
                        {editing ? <><X size={14} /> Cancel</> : <><Edit2 size={14} /> Edit</>}
                    </button>
                </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

            {/* ── Photos section — always visible ── */}
            <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Camera size={14} color="var(--color-text-muted)" />
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase' as const, margin: 0 }}>
                            PHOTOS <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)', letterSpacing: 0 }}>({photos.length}/6)</span>
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {/* Existing photos */}
                    {photos.map((url: string, i: number) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--color-surface-3)' }}>
                            <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            {/* First photo badge */}
                            {i === 0 && (
                                <span style={{
                                    position: 'absolute', top: '6px', left: '6px',
                                    padding: '2px 8px', borderRadius: '4px',
                                    backgroundColor: 'rgba(0,0,0,0.7)', color: 'var(--color-primary-light)',
                                    fontSize: '10px', fontWeight: 700,
                                }}>Profile</span>
                            )}
                            {/* Delete button */}
                            <button onClick={() => handlePhotoDelete(i)}
                                style={{
                                    position: 'absolute', top: '6px', right: '6px',
                                    width: '26px', height: '26px', borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: deletingIdx === i ? 0.5 : 1,
                                }}>
                                {deletingIdx === i
                                    ? <Loader2 size={12} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                                    : <Trash2 size={12} color="var(--color-danger)" />}
                            </button>
                        </div>
                    ))}

                    {/* Add photo button */}
                    {photos.length < 6 && (
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            style={{
                                aspectRatio: '1', borderRadius: '6px', border: '1px dashed var(--color-border-strong)',
                                backgroundColor: 'var(--color-surface-2)', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                                gap: '6px', transition: 'all 0.15s', opacity: uploading ? 0.5 : 1,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; }}
                        >
                            {uploading
                                ? <Loader2 size={20} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                                : <ImagePlus size={20} color="var(--color-text-muted)" />}
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                {uploading ? 'Uploading...' : 'Add Photo'}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

            <AnimatePresence mode="wait">
                {editing ? (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Basic info section */}
                        <div style={{ padding: '28px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <p style={labelStyle}>BASIC INFO</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Full Name" style={inputStyle} />
                                <div style={{ position: 'relative' }}>
                                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value.slice(0, 300) })}
                                        placeholder="Write a short bio about yourself..." maxLength={300}
                                        style={{ ...inputStyle, height: '90px', resize: 'none' as const }} />
                                    <span style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '11px', color: 'var(--color-text-subtle)' }}>{form.bio.length}/300</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <p style={labelStyle}>DEPARTMENT</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {DEPARTMENTS.map(d => (
                                    <button key={d} onClick={() => setForm({ ...form, department: d })}
                                        style={{ ...chipStyle, ...(form.department === d ? chipActiveStyle : {}) }}>{d}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <p style={labelStyle}>YEAR</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(y => (
                                    <button key={y} onClick={() => setForm({ ...form, year: y })}
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                            backgroundColor: form.year === y ? 'rgba(139,92,246,0.18)' : 'var(--color-surface-3)',
                                            color: form.year === y ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                            fontWeight: 700, fontSize: '15px', transition: 'all 0.12s',
                                        }}>{y}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <p style={labelStyle}>INTERESTS <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400, letterSpacing: 0 }}>({form.interests.length} selected)</span></p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {INTERESTS.map(i => (
                                    <button key={i} onClick={() => toggle('interests', i)}
                                        style={{ ...chipStyle, ...(form.interests.includes(i) ? chipActiveStyle : {}) }}>{i}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <p style={labelStyle}>CLUBS <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400, letterSpacing: 0 }}>({form.clubs.length} selected)</span></p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {CLUBS.map(c => (
                                    <button key={c} onClick={() => toggle('clubs', c)}
                                        style={{ ...chipStyle, ...(form.clubs.includes(c) ? chipActiveStyle : {}) }}>{c}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <button onClick={save} disabled={saving}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '8px', border: 'none', cursor: saving ? 'default' : 'pointer',
                                    backgroundColor: 'var(--color-primary)', color: '#fff',
                                    fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s',
                                }}>
                                {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Check size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {user?.bio && (
                            <>
                                <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                                    <p style={labelStyle}>ABOUT</p>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{user.bio}</p>
                                </div>
                                <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
                            </>
                        )}

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <User size={14} color="var(--color-text-muted)" />
                                <p style={{ ...labelStyle, margin: 0 }}>INTERESTS</p>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {user?.interests?.length ? user.interests.map(i => (
                                    <span key={i} style={viewChipStyle}>{i}</span>
                                )) : <span style={{ fontSize: '13px', color: 'var(--color-text-subtle)' }}>No interests added yet</span>}
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <Users size={14} color="var(--color-text-muted)" />
                                <p style={{ ...labelStyle, margin: 0 }}>CLUBS</p>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {user?.clubs?.length ? user.clubs.map(c => (
                                    <span key={c} style={viewChipStyle}>{c}</span>
                                )) : <span style={{ fontSize: '13px', color: 'var(--color-text-subtle)' }}>No clubs added yet</span>}
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <BookOpen size={14} color="var(--color-text-muted)" />
                                <p style={{ ...labelStyle, margin: 0 }}>ACCOUNT</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Email</span>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>{user?.email}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Department</span>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>{user?.department || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Year</span>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>{user?.year ? `Year ${user.year}` : '—'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                        <div style={{ padding: '24px 40px', backgroundColor: 'var(--color-surface)' }}>
                            <button onClick={logout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-danger)', fontSize: '14px', fontWeight: 600, padding: 0,
                                }}>
                                <LogOut size={15} />
                                Sign out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)',
    letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '14px',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    backgroundColor: 'var(--color-surface-2)', border: 'none', outline: 'none',
    color: 'var(--color-text)', fontSize: '14px', fontFamily: 'inherit',
};

const chipStyle: React.CSSProperties = {
    padding: '6px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer',
    backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
    fontSize: '13px', fontWeight: 500, transition: 'all 0.12s',
};

const chipActiveStyle: React.CSSProperties = {
    backgroundColor: 'rgba(139,92,246,0.18)', color: 'var(--color-primary-light)',
};

const viewChipStyle: React.CSSProperties = {
    padding: '5px 12px', borderRadius: '4px',
    backgroundColor: 'rgba(139,92,246,0.1)', color: 'var(--color-primary-light)',
    fontSize: '12px', fontWeight: 500,
};
