import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

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
    const updateProfile = useAuthStore((s) => s.updateProfile);
    const navigate = useNavigate();

    const toggleItem = (field: 'interests' | 'clubs', item: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter((i) => i !== item)
                : prev[field].length < 10 ? [...prev[field], item] : prev[field],
        }));
    };

    const handleSubmit = async () => {
        try {
            await updateProfile(form);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    const steps = [
        // Step 0: Basic info
        <div key="basic" className="space-y-5">
            <h2 className="text-2xl font-bold text-center mb-2">Let's get to know you</h2>
            <p className="text-text-muted text-center text-sm mb-6">Tell us about yourself</p>
            <input type="text" placeholder="Your Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl bg-surface-3 border border-primary/10 text-text placeholder-text-muted/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            <select value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl bg-surface-3 border border-primary/10 text-text focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full px-5 py-3.5 rounded-xl bg-surface-3 border border-primary/10 text-text focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
            </select>
            <textarea placeholder="Short bio (optional)" value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500}
                className="w-full px-5 py-3.5 rounded-xl bg-surface-3 border border-primary/10 text-text placeholder-text-muted/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none" />
        </div>,

        // Step 1: Interests
        <div key="interests">
            <h2 className="text-2xl font-bold text-center mb-2">Pick your interests</h2>
            <p className="text-text-muted text-center text-sm mb-6">Select up to 10</p>
            <div className="flex flex-wrap gap-2 justify-center">
                {INTERESTS.map((interest) => (
                    <button key={interest} onClick={() => toggleItem('interests', interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${form.interests.includes(interest)
                                ? 'bg-primary text-white glow'
                                : 'bg-surface-3 text-text-muted hover:bg-surface-4 border border-primary/10'
                            }`}>
                        {interest}
                    </button>
                ))}
            </div>
        </div>,

        // Step 2: Clubs
        <div key="clubs">
            <h2 className="text-2xl font-bold text-center mb-2">Join your clubs</h2>
            <p className="text-text-muted text-center text-sm mb-6">Select up to 10</p>
            <div className="flex flex-wrap gap-2 justify-center">
                {CLUBS.map((club) => (
                    <button key={club} onClick={() => toggleItem('clubs', club)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${form.clubs.includes(club)
                                ? 'bg-accent text-white glow-accent'
                                : 'bg-surface-3 text-text-muted hover:bg-surface-4 border border-primary/10'
                            }`}>
                        {club}
                    </button>
                ))}
            </div>
        </div>,
    ];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
            <motion.div
                className="glass-strong rounded-3xl p-8 md:p-12 w-full max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {[0, 1, 2].map((s) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-surface-4'}`} />
                    ))}
                </div>

                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    {steps[step]}
                </motion.div>

                <div className="flex gap-4 mt-8">
                    {step > 0 && (
                        <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1 py-3">
                            ← Back
                        </button>
                    )}
                    {step < 2 ? (
                        <button onClick={() => setStep(step + 1)} disabled={step === 0 && (!form.name || !form.department)}
                            className="btn-primary flex-1 py-3 disabled:opacity-50">
                            Next →
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="btn-primary flex-1 py-3">
                            🚀 Complete Setup
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
