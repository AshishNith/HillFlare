import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const INTERESTED_IN_OPTIONS = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'non-binary', label: 'Non-binary' },
];

const genderLabel = (v: string) => GENDER_OPTIONS.find((o) => o.value === v)?.label ?? v;
const interestedInLabel = (v: string) => INTERESTED_IN_OPTIONS.find((o) => o.value === v)?.label ?? v;

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newInterest, setNewInterest] = useState('');
  const [newClub, setNewClub] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiService.getMe();
      setUser(data);
    } catch (error) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await apiService.updateProfile(user);
      setUser(updated.data || updated);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile');
    }
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    const interests = Array.from(new Set([...(user?.interests || []), newInterest.trim()]));
    setUser({ ...user, interests });
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setUser({ ...user, interests: (user?.interests || []).filter((item: string) => item !== interest) });
  };

  const handleAddClub = () => {
    if (!newClub.trim()) return;
    const clubs = Array.from(new Set([...(user?.clubs || []), newClub.trim()]));
    setUser({ ...user, clubs });
    setNewClub('');
  };

  const handleRemoveClub = (club: string) => {
    setUser({ ...user, clubs: (user?.clubs || []).filter((item: string) => item !== club) });
  };

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUser({ ...user, avatarUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryAdd = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const galleryUrls = [...(user?.galleryUrls || []), reader.result].slice(0, 6);
        setUser({ ...user, galleryUrls });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveGallery = (index: number) => {
    const galleryUrls = (user?.galleryUrls || []).filter((_: string, i: number) => i !== index);
    setUser({ ...user, galleryUrls });
  };

  const openLightbox = (url: string, index: number) => {
    setLightboxUrl(url);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxUrl(null);
  };

  const navigateLightbox = (dir: 'prev' | 'next') => {
    const urls = user?.galleryUrls || [];
    if (urls.length === 0) return;
    const newIndex = dir === 'next'
      ? (lightboxIndex + 1) % urls.length
      : (lightboxIndex - 1 + urls.length) % urls.length;
    setLightboxIndex(newIndex);
    setLightboxUrl(urls[newIndex]);
  };

  if (loading) {
    return (
      <AppLayout title="Profile">
        <div className="flex h-96 items-center justify-center">
          <p className="text-hf-muted">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile">
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center lightbox-backdrop"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute right-6 top-6 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          {(user?.galleryUrls?.length || 0) > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                className="absolute left-4 rounded-full bg-white/20 p-3 text-white transition hover:bg-white/30"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                className="absolute right-4 rounded-full bg-white/20 p-3 text-white transition hover:bg-white/30"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}
          <img
            src={lightboxUrl}
            alt="Gallery"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-hf-border bg-white p-8 shadow-soft">
          {/* Profile Header */}
          <div className="mb-8 flex items-start gap-6">
            <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-hf-accent/20 to-hf-accent/5">
              {user?.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-3xl font-bold text-hf-charcoal">
                {user?.name || 'User'}
              </h2>
              <p className="mb-4 text-lg text-hf-muted">
                {user?.department || 'Department'} · Year {user?.year || 1}
              </p>
              {user?.email && (
                <p className="mb-4 text-sm text-hf-muted">{user.email}</p>
              )}
              <button
                onClick={() => setEditing(!editing)}
                className="rounded-full border-2 border-hf-border bg-white px-6 py-2 font-semibold text-hf-charcoal transition hover:border-hf-accent"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {editing && (
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-hf-border bg-hf-bg px-4 py-6 text-center text-sm text-hf-muted transition hover:border-hf-accent">
                <span>📷 Update avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarChange(file);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-hf-border bg-hf-bg px-4 py-6 text-center text-sm text-hf-muted transition hover:border-hf-accent">
                <span>🖼️ Add gallery photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleGalleryAdd(file);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          )}

          {/* Profile Details */}
          <div className="space-y-6">
            {/* Bio */}
            <div>
              <label className="mb-2 block font-semibold text-hf-charcoal">Bio</label>
              {editing ? (
                <textarea
                  value={user?.bio || ''}
                  onChange={(e) => setUser({ ...user, bio: e.target.value })}
                  className="w-full rounded-2xl border border-hf-border bg-hf-bg p-4 text-hf-charcoal focus:border-hf-accent focus:outline-none"
                  rows={4}
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p className="text-hf-muted">{user?.bio || 'No bio yet'}</p>
              )}
            </div>

            {/* Interests */}
            <div>
              <label className="mb-2 block font-semibold text-hf-charcoal">Interests</label>
              <div className="flex flex-wrap gap-2">
                {user?.interests && user.interests.length > 0 ? (
                  user.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="rounded-full bg-hf-accent/10 px-4 py-2 font-medium text-hf-accent"
                    >
                      {interest}
                      {editing && (
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-2 text-xs text-hf-accent"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-hf-muted">No interests added</p>
                )}
              </div>
              {editing && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                    className="flex-1 rounded-full border border-hf-border px-4 py-2 text-sm"
                    placeholder="Add interest"
                  />
                  <button
                    onClick={handleAddInterest}
                    className="rounded-full bg-hf-accent px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Clubs */}
            <div>
              <label className="mb-2 block font-semibold text-hf-charcoal">Clubs</label>
              <div className="flex flex-wrap gap-2">
                {user?.clubs && user.clubs.length > 0 ? (
                  user.clubs.map((club: string) => (
                    <span
                      key={club}
                      className="rounded-full bg-hf-charcoal/10 px-4 py-2 font-medium text-hf-charcoal"
                    >
                      {club}
                      {editing && (
                        <button
                          onClick={() => handleRemoveClub(club)}
                          className="ml-2 text-xs text-hf-charcoal"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-hf-muted">No clubs added</p>
                )}
              </div>
              {editing && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={newClub}
                    onChange={(e) => setNewClub(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClub()}
                    className="flex-1 rounded-full border border-hf-border px-4 py-2 text-sm"
                    placeholder="Add club"
                  />
                  <button
                    onClick={handleAddClub}
                    className="rounded-full bg-hf-accent px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Looking For */}
            <div>
              <label className="mb-2 block font-semibold text-hf-charcoal">
                Looking For
              </label>
              {editing ? (
                <input
                  value={user?.lookingFor || ''}
                  onChange={(e) => setUser({ ...user, lookingFor: e.target.value })}
                  className="w-full rounded-2xl border border-hf-border bg-hf-bg p-3 text-hf-charcoal"
                  placeholder="Dating, Friends, Both"
                />
              ) : (
                <p className="text-hf-muted">{user?.lookingFor || 'Not specified'}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block font-semibold text-hf-charcoal">Gender</label>
              {editing ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUser({ ...user, gender: opt.value })}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        user?.gender === opt.value
                          ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                          : 'border-hf-border bg-hf-bg text-hf-muted hover:border-hf-accent/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-hf-muted">{user?.gender ? genderLabel(user.gender) : 'Not specified'}</p>
              )}
            </div>

            {/* Interested In */}
            <div>
              <label className="mb-2 block font-semibold text-hf-charcoal">Interested In</label>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {INTERESTED_IN_OPTIONS.map((opt) => {
                    const selected = (user?.interestedIn || []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const current: string[] = user?.interestedIn || [];
                          const next = selected
                            ? current.filter((v: string) => v !== opt.value)
                            : [...current, opt.value];
                          setUser({ ...user, interestedIn: next });
                        }}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          selected
                            ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                            : 'border-hf-border bg-hf-bg text-hf-muted hover:border-hf-accent/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setUser({ ...user, interestedIn: INTERESTED_IN_OPTIONS.map((o) => o.value) })}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      (user?.interestedIn || []).length === INTERESTED_IN_OPTIONS.length
                        ? 'border-hf-accent bg-hf-accent/10 text-hf-accent'
                        : 'border-hf-border bg-hf-bg text-hf-muted hover:border-hf-accent/50'
                    }`}
                  >
                    Everyone
                  </button>
                </div>
              ) : (
                <p className="text-hf-muted">
                  {user?.interestedIn && user.interestedIn.length > 0
                    ? user.interestedIn.map(interestedInLabel).join(', ')
                    : 'Not specified'}
                </p>
              )}
            </div>

            {/* Gallery */}
            <div>
              <label className="mb-2 block font-semibold text-hf-charcoal">Photos</label>
              {user?.galleryUrls && user.galleryUrls.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {user.galleryUrls.map((url: string, index: number) => (
                    <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-2xl">
                      <img
                        src={url}
                        alt="Gallery"
                        className="h-36 w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                        onClick={() => openLightbox(url, index)}
                      />
                      <div
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition group-hover:bg-black/20"
                        onClick={() => openLightbox(url, index)}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          className="opacity-0 transition group-hover:opacity-100"
                        >
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                      </div>
                      {editing && (
                        <button
                          onClick={() => handleRemoveGallery(index)}
                          className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-hf-muted">No photos added</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {editing && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 rounded-full bg-hf-accent px-6 py-3 font-semibold text-white shadow-soft transition hover:shadow-glow"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 font-semibold text-red-900">Danger Zone</h3>
          <p className="mb-4 text-sm text-red-700">
            Once you logout, you'll need to sign in again with OTP.
          </p>
          <button
            onClick={() => logout()}
            className="rounded-full border-2 border-red-300 bg-white px-6 py-2 font-semibold text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
