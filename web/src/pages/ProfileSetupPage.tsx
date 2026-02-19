import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const INTERESTS = [
    'Music', 'Movies', 'Gaming', 'Reading', 'Travel',
    'Photography', 'Cooking', 'Fitness', 'Art', 'Dance',
    'Technology', 'Sports', 'Writing', 'Fashion', 'Anime',
    'Podcasts', 'Volunteering', 'Nature', 'Astronomy', 'Comedy',
];

const CLUBS = [
    'Coding Club', 'Drama Society', 'Music Club', 'Dance Club',
    'Debate Society', 'Photography Club', 'Sports Club', 'Literary Club',
    'Entrepreneurship Cell', 'Robotics Club', 'Film Club', 'Art Society',
    'Quiz Club', 'Cultural Committee', 'Google DSC', 'Microsoft Club',
];

const DEPARTMENTS = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil',
    'Electrical', 'Chemical', 'Biotechnology', 'Information Technology',
    'Mathematics', 'Physics', 'Chemistry', 'Economics',
    'Business Administration', 'Psychology', 'Design', 'Law',
];

export default function ProfileSetupPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        name: '', department: '', year: 1, bio: '',
        interests: [] as string[], clubs: [] as string[],
    });
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const updateProfile = useAuthStore((s) => s.updateProfile);
    const fetchUser = useAuthStore((s) => s.fetchUser);
    const navigate = useNavigate();

    const toggleItem = (field: 'interests' | 'clubs', item: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter((i) => i !== item)
                : prev[field].length < 10 ? [...prev[field], item] : prev[field],
        }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || photos.length >= 6) return;
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const { data } = await api.post('/users/photos/upload', { image: reader.result });
                setPhotos(data.data.photos || []);
            } catch (err: any) {
                alert(err?.response?.data?.error || 'Upload failed');
            }
            setUploading(false);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handlePhotoDelete = async (index: number) => {
        setDeletingIdx(index);
        try {
            const { data } = await api.delete(`/users/photos/${index}`);
            setPhotos(data.data.photos || []);
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Delete failed');
        }
        setDeletingIdx(null);
    };

    const handleSubmit = async () => {
        try {
            await updateProfile(form);
            await fetchUser();
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    const TOTAL_STEPS = 4; // 0=basic, 1=interests, 2=clubs, 3=photos

    const steps = [
        // Step 0: Basic info
        <div key="basic" style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', marginBottom: '4px' }}>Let's get to know you</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '8px' }}>Tell us about yourself</p>
            <input type="text" placeholder="Your Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={setupInputStyle} />
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={setupInputStyle}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' as const }}>YEAR</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5, 6].map(y => (
                        <button key={y} onClick={() => setForm({ ...form, year: y })}
                            style={{
                                width: '42px', height: '42px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                backgroundColor: form.year === y ? 'rgba(139,92,246,0.18)' : 'var(--color-surface-3)',
                                color: form.year === y ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                fontWeight: 700, fontSize: '14px', transition: 'all 0.12s',
                            }}>{y}</button>
                    ))}
                </div>
            </div>
            <textarea placeholder="Short bio (optional)" value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500}
                style={{ ...setupInputStyle, height: '80px', resize: 'none' as const }} />
        </div>,

        // Step 1: Interests
        <div key="interests">
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', marginBottom: '4px' }}>Pick your interests</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '18px' }}>Select up to 10</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {INTERESTS.map((interest) => (
                    <button key={interest} onClick={() => toggleItem('interests', interest)}
                        style={{
                            padding: '7px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 500, transition: 'all 0.12s',
                            backgroundColor: form.interests.includes(interest) ? 'rgba(139,92,246,0.18)' : 'var(--color-surface-3)',
                            color: form.interests.includes(interest) ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                        }}>
                        {interest}
                    </button>
                ))}
            </div>
        </div>,

        // Step 2: Clubs
        <div key="clubs">
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', marginBottom: '4px' }}>Join your clubs</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '18px' }}>Select up to 10</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {CLUBS.map((club) => (
                    <button key={club} onClick={() => toggleItem('clubs', club)}
                        style={{
                            padding: '7px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 500, transition: 'all 0.12s',
                            backgroundColor: form.clubs.includes(club) ? 'rgba(139,92,246,0.18)' : 'var(--color-surface-3)',
                            color: form.clubs.includes(club) ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                        }}>
                        {club}
                    </button>
                ))}
            </div>
        </div>,

        // Step 3: Photos
        <div key="photos">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', marginBottom: '4px' }}>Add your photos</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '18px' }}>Add up to 6 photos. First one becomes your profile pic.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {photos.map((url, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--color-surface-3)' }}>
                        <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {i === 0 && <span style={{ position: 'absolute', top: '5px', left: '5px', padding: '2px 7px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'var(--color-primary-light)', fontSize: '10px', fontWeight: 700 }}>Profile</span>}
                        <button onClick={() => handlePhotoDelete(i)}
                            style={{
                                position: 'absolute', top: '5px', right: '5px',
                                width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.7)',
                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: deletingIdx === i ? 0.5 : 1,
                            }}>
                            {deletingIdx === i ? <Loader2 size={11} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={11} color="var(--color-danger)" />}
                        </button>
                    </div>
                ))}
                {photos.length < 6 && (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        style={{
                            aspectRatio: '1', borderRadius: '6px', border: '1px dashed var(--color-border-strong)',
                            backgroundColor: 'var(--color-surface-2)', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                            gap: '5px', opacity: uploading ? 0.5 : 1, transition: 'all 0.15s',
                        }}>
                        {uploading ? <Loader2 size={18} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={18} color="var(--color-text-muted)" />}
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{uploading ? 'Uploading...' : 'Add'}</span>
                    </button>
                )}
            </div>
        </div>,
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: 'var(--color-surface)' }}>
            <div style={{ width: '100%', maxWidth: '460px', padding: '36px', backgroundColor: 'var(--color-surface-2)', borderRadius: '12px' }}>

                {/* Progress bar */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
                    {Array.from({ length: TOTAL_STEPS }).map((_, s) => (
                        <div key={s} style={{
                            height: '4px', flex: 1, borderRadius: '2px', transition: 'all 0.3s',
                            backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--color-surface-4)',
                        }} />
                    ))}
                </div>

                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    {steps[step]}
                </motion.div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    {step > 0 && (
                        <button onClick={() => setStep(step - 1)}
                            style={{
                                flex: 1, padding: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text-muted)',
                                fontSize: '14px', fontWeight: 600,
                            }}>
                            ← Back
                        </button>
                    )}
                    {step < TOTAL_STEPS - 1 ? (
                        <button onClick={() => setStep(step + 1)}
                            disabled={step === 0 && (!form.name || !form.department)}
                            style={{
                                flex: 1, padding: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                backgroundColor: 'var(--color-primary)', color: '#fff',
                                fontSize: '14px', fontWeight: 700,
                                opacity: (step === 0 && (!form.name || !form.department)) ? 0.5 : 1,
                            }}>
                            Next →
                        </button>
                    ) : (
                        <button onClick={handleSubmit}
                            style={{
                                flex: 1, padding: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                backgroundColor: 'var(--color-primary)', color: '#fff',
                                fontSize: '14px', fontWeight: 700,
                            }}>
                            Complete Setup →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const setupInputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    backgroundColor: 'var(--color-surface-3)', border: 'none', outline: 'none',
    color: 'var(--color-text)', fontSize: '14px', fontFamily: 'inherit',
};
