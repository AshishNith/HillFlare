import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const departments = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil Engineering',
    'Electrical Engineering', 'Information Technology', 'Chemical Engineering',
    'Biotechnology', 'Architecture', 'Design', 'Fashion Design', 'Media Studies',
    'Psychology', 'Economics', 'Mathematics', 'Physics', 'Business Admin',
    'Aerospace Engineering', 'Other',
];

const TOTAL_STEPS = 5;

const ProfileSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const setProfileComplete = useAuthStore((s) => s.setProfileComplete);
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        department: '',
        year: 1,
        bio: '',
        lookingFor: 'Dating',
        interests: [] as string[],
        gender: '' as string,
        interestedIn: [] as string[],
    });
    const [newInterest, setNewInterest] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canProceed = () => {
        if (step === 1) return form.name.trim().length >= 2 && form.department !== '';
        if (step === 2) return form.gender !== '' && form.interestedIn.length > 0;
        if (step === 3) return form.bio.trim().length >= 10;
        if (step === TOTAL_STEPS) return photos.length >= 1;
        return true;
    };

    const handleAddInterest = () => {
        const value = newInterest.trim();
        if (!value || form.interests.includes(value) || form.interests.length >= 20) return;
        setForm({ ...form, interests: [...form.interests, value] });
        setNewInterest('');
    };

    const handleRemoveInterest = (interest: string) => {
        setForm({ ...form, interests: form.interests.filter((i) => i !== interest) });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (photos.length >= 6) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPhotos((prev) => {
                    if (prev.length >= 6) return prev;
                    return [...prev, result];
                });
            };
            reader.readAsDataURL(file);
        });

        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleInterestedIn = (value: string) => {
        setForm((prev) => ({
            ...prev,
            interestedIn: prev.interestedIn.includes(value)
                ? prev.interestedIn.filter((v) => v !== value)
                : [...prev.interestedIn, value],
        }));
    };

    const handleSelectAll = () => {
        const all = ['male', 'female', 'non-binary'];
        const allSelected = all.every((v) => form.interestedIn.includes(v));
        setForm({ ...form, interestedIn: allSelected ? [] : all });
    };

    const handleFinish = async () => {
        if (photos.length === 0) return;
        setSaving(true);
        setError('');
        try {
            await apiService.updateProfile({
                ...form,
                gender: form.gender,
                interestedIn: form.interestedIn,
                avatarUrl: photos[0],
                galleryUrls: photos,
            });
            setProfileComplete(true);
            navigate('/app');
        } catch (e: any) {
            console.error('Failed to save profile', e);
            const msg = e.response?.data?.error || e.message || 'Failed to save profile. Please try again.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-hf-bg via-white to-hf-accent/5 px-4">
            <div className="w-full max-w-lg">
                {/* Progress */}
                <div className="mb-8 flex items-center justify-center gap-2">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-12 bg-hf-accent' : 'w-8 bg-hf-border'
                                }`}
                        />
                    ))}
                </div>

                <div className="rounded-3xl border border-hf-border bg-white p-8 shadow-soft">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 mb-4">
                            {error}
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-2 flex items-center gap-3">
                        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                            <defs>
                                <linearGradient id="fg" x1="0" y1="0" x2="48" y2="48">
                                    <stop stopColor="#F07A83" />
                                    <stop offset="1" stopColor="#F07A83" stopOpacity=".6" />
                                </linearGradient>
                            </defs>
                            <path d="M24 4C20 4 14 8 14 18c0 6 3 10 5 13 2 3 5 9 5 13 0-4 3-10 5-13 2-3 5-7 5-13C34 8 28 4 24 4z" fill="url(#fg)" />
                        </svg>
                        <span className="text-xl font-bold text-hf-charcoal">HillFlare</span>
                    </div>

                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h1 className="mb-1 text-2xl font-bold text-hf-charcoal">Welcome! Let's set up your profile</h1>
                            <p className="mb-6 text-sm text-hf-muted">Tell us about yourself so others can find you.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-hf-charcoal">Your Name</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Aanya Sharma"
                                        maxLength={100}
                                        className="w-full rounded-xl border border-hf-border bg-hf-bg px-4 py-3 text-hf-charcoal focus:border-hf-accent focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-hf-charcoal">Department</label>
                                    <select
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                        className="w-full rounded-xl border border-hf-border bg-hf-bg px-4 py-3 text-hf-charcoal focus:border-hf-accent focus:outline-none"
                                    >
                                        <option value="">Select your department</option>
                                        {departments.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-hf-charcoal">Year</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((y) => (
                                            <button
                                                key={y}
                                                onClick={() => setForm({ ...form, year: y })}
                                                className={`flex-1 rounded-xl border-2 py-2.5 font-semibold transition ${form.year === y
                                                    ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                                                    : 'border-hf-border text-hf-muted hover:border-hf-accent/50'
                                                    }`}
                                            >
                                                Year {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h1 className="mb-1 text-2xl font-bold text-hf-charcoal">Gender & Preferences</h1>
                            <p className="mb-6 text-sm text-hf-muted">Help us show you the right people.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-hf-charcoal">I am</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'male', label: 'Male' },
                                            { value: 'female', label: 'Female' },
                                            { value: 'non-binary', label: 'Non-binary' },
                                            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setForm({ ...form, gender: opt.value })}
                                                className={`rounded-xl border-2 py-3 font-semibold transition ${form.gender === opt.value
                                                    ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                                                    : 'border-hf-border text-hf-muted hover:border-hf-accent/50'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-hf-charcoal">Interested in</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'male', label: 'Men' },
                                            { value: 'female', label: 'Women' },
                                            { value: 'non-binary', label: 'Non-binary' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => toggleInterestedIn(opt.value)}
                                                className={`rounded-xl border-2 py-3 font-semibold transition ${form.interestedIn.includes(opt.value)
                                                    ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                                                    : 'border-hf-border text-hf-muted hover:border-hf-accent/50'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleSelectAll}
                                            className={`rounded-xl border-2 py-3 font-semibold transition ${form.interestedIn.length === 3
                                                ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                                                : 'border-hf-border text-hf-muted hover:border-hf-accent/50'
                                                }`}
                                        >
                                            Everyone
                                        </button>
                                    </div>
                                    {form.interestedIn.length === 0 && (
                                        <p className="mt-2 text-xs text-red-500">Select at least one preference</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h1 className="mb-1 text-2xl font-bold text-hf-charcoal">Tell us more</h1>
                            <p className="mb-6 text-sm text-hf-muted">A great bio helps you stand out.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-hf-charcoal">Bio</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        placeholder="Design systems, chai, and late-night debates. Always curious."
                                        rows={4}
                                        maxLength={500}
                                        className="w-full rounded-xl border border-hf-border bg-hf-bg px-4 py-3 text-hf-charcoal focus:border-hf-accent focus:outline-none"
                                    />
                                    <p className="mt-1 text-xs text-hf-muted">{form.bio.length}/500 characters</p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-hf-charcoal">Looking For</label>
                                    <div className="flex gap-2">
                                        {['Dating', 'Friends', 'Both'].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setForm({ ...form, lookingFor: opt })}
                                                className={`flex-1 rounded-xl border-2 py-2.5 font-semibold transition ${form.lookingFor === opt
                                                    ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                                                    : 'border-hf-border text-hf-muted hover:border-hf-accent/50'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-fade-in">
                            <h1 className="mb-1 text-2xl font-bold text-hf-charcoal">What are you into?</h1>
                            <p className="mb-6 text-sm text-hf-muted">Add interests to match with like-minded people.</p>

                            <div className="flex gap-2">
                                <input
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                                    placeholder="e.g. Photography, Coding, Music..."
                                    maxLength={50}
                                    className="flex-1 rounded-xl border border-hf-border bg-hf-bg px-4 py-3 text-hf-charcoal focus:border-hf-accent focus:outline-none"
                                />
                                <button
                                    onClick={handleAddInterest}
                                    className="rounded-xl bg-hf-accent px-5 py-3 font-semibold text-white"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {form.interests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="flex items-center gap-1 rounded-full bg-hf-accent/10 px-4 py-2 font-medium text-hf-accent"
                                    >
                                        {interest}
                                        <button onClick={() => handleRemoveInterest(interest)} className="ml-1 text-sm opacity-60 hover:opacity-100">×</button>
                                    </span>
                                ))}
                            </div>
                            {form.interests.length === 0 && (
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-hf-muted">Suggested:</p>
                                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                                        {['Photography', 'Music', 'Coding', 'Travel', 'Fitness', 'Art', 'Reading', 'Gaming'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setForm({ ...form, interests: [...form.interests, s] })}
                                                className="rounded-full border border-hf-border px-3 py-1.5 text-sm text-hf-muted transition hover:border-hf-accent hover:text-hf-accent"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === TOTAL_STEPS && (
                        <div className="animate-fade-in">
                            <h1 className="mb-1 text-2xl font-bold text-hf-charcoal">Add Your Photos</h1>
                            <p className="mb-6 text-sm text-hf-muted">Add at least 1 photo to complete your profile. Your first photo will be your main profile picture.</p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((photo, index) => (
                                    <div key={index} className="group relative">
                                        <img
                                            src={photo}
                                            alt={`Photo ${index + 1}`}
                                            className="h-36 w-full rounded-xl object-cover"
                                        />
                                        <button
                                            onClick={() => removePhoto(index)}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-md transition hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                        {index === 0 && (
                                            <span className="absolute bottom-2 left-2 rounded-md bg-hf-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                                                Main
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {photos.length < 6 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed border-hf-border bg-hf-bg text-hf-muted transition hover:border-hf-accent hover:text-hf-accent"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mb-1 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-xs font-medium">Add Photo</span>
                                    </button>
                                )}
                            </div>

                            <div className="mt-5 flex items-center gap-2 rounded-xl bg-hf-accent/10 p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-hf-accent" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-hf-accent">
                                    Add up to 6 photos. {photos.length}/6 added.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-8 flex gap-3">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="rounded-full border-2 border-hf-border px-6 py-3 font-semibold text-hf-charcoal transition hover:border-hf-accent"
                            >
                                Back
                            </button>
                        )}
                        {step < TOTAL_STEPS ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className="flex-1 rounded-full bg-hf-accent px-6 py-3 font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-50"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={saving || photos.length === 0}
                                className="flex-1 rounded-full bg-hf-accent px-6 py-3 font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Complete Setup ✨'}
                            </button>
                        )}
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-hf-muted">
                    You can always update your profile later
                </p>
            </div>
        </div>
    );
};

export default ProfileSetupPage;
