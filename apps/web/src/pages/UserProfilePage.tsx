import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { apiService } from '../services/api';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMatch, setIsMatch] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
      checkMatchStatus(userId);
    }
  }, [userId]);

  const loadProfile = async (id: string) => {
    try {
      const data = await apiService.getUserById(id);
      setUser(data.data || data);
    } catch (error) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const checkMatchStatus = async (id: string) => {
    try {
      const data = await apiService.getMatches();
      const matches = data.items || [];
      const matched = matches.some((m: any) => m._id === id || m.email === id);
      setIsMatch(matched);
    } catch {
      // ignore
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user) return;
    try {
      await apiService.swipe(user._id, direction);
      navigate('/app/discover');
    } catch (error) {
      console.error('Swipe failed');
    }
  };

  const handleChat = async () => {
    if (!user?.email) return;
    try {
      const data = await apiService.findOrCreateChat(user.email);
      const chatId = data.data?._id || data._id || data.chatId;
      navigate(`/app/chats/${chatId}`, { state: { otherUser: user } });
    } catch (error) {
      console.error('Failed to start chat');
    }
  };

  const handleCrush = async () => {
    if (!user?._id) return;
    try {
      await apiService.selectCrush(user._id);
      alert('Crush added!');
    } catch {
      console.error('Failed to add crush');
    }
  };

  const handleReport = async () => {
    if (!user?.email) return;
    await apiService.reportUser(user.email, 'inappropriate');
    alert('Report submitted');
  };

  const handleBlock = async () => {
    if (!user?.email) return;
    if (!confirm(`Are you sure you want to block ${user.name || 'this user'}? They won't be able to see or contact you.`)) return;
    try {
      await apiService.blockUser(user.email, 'user_block');
      navigate('/app/discover');
    } catch (error) {
      console.error('Failed to block user');
    }
  };

  const openLightbox = (url: string, index: number) => {
    setLightboxUrl(url);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxUrl(null);

  const navigateLightbox = (dir: 'prev' | 'next') => {
    const urls = user?.galleryUrls || [];
    if (urls.length === 0) return;
    const newIdx = dir === 'next'
      ? (lightboxIndex + 1) % urls.length
      : (lightboxIndex - 1 + urls.length) % urls.length;
    setLightboxIndex(newIdx);
    setLightboxUrl(urls[newIdx]);
  };

  if (loading) {
    return (
      <AppLayout title="Profile">
        <div className="flex h-72 items-center justify-center">
          <p className="text-hf-muted">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="Profile">
        <div className="rounded-3xl border border-hf-border bg-white p-12 text-center">
          <p className="text-hf-muted">User not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={user.name || 'Profile'}>
      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center lightbox-backdrop" onClick={closeLightbox}>
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

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-hf-border bg-white p-8 shadow-soft">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-hf-accent/10">
                {user.avatarUrl && (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                )}
              </div>
              {user.galleryUrls && user.galleryUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {user.galleryUrls.slice(0, 6).map((url: string, idx: number) => (
                    <div
                      key={url}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-hf-bg"
                      onClick={() => openLightbox(url, idx)}
                    >
                      <img src={url} alt="Gallery" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-0 transition group-hover:opacity-100">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-hf-charcoal">{user.name}</h2>
              <p className="mt-2 text-hf-muted">{user.department} · Year {user.year}</p>
              {user.bio && <p className="mt-4 text-hf-charcoal">{user.bio}</p>}

              <div className="mt-6 space-y-4">
                {user.interests?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-hf-charcoal">Interests</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.interests.map((interest: string) => (
                        <span key={interest} className="rounded-full bg-hf-accent/10 px-3 py-1 text-sm font-medium text-hf-accent">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.clubs?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-hf-charcoal">Clubs</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.clubs.map((club: string) => (
                        <span key={club} className="rounded-full bg-hf-charcoal/10 px-3 py-1 text-sm font-medium text-hf-charcoal">
                          {club}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.lookingFor && (
                  <div>
                    <h3 className="text-sm font-semibold text-hf-charcoal">Looking For</h3>
                    <p className="mt-1 text-hf-muted">{user.lookingFor}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => handleSwipe('right')}
                  className="rounded-full bg-hf-accent px-6 py-3 font-semibold text-white shadow-soft"
                >
                  Like ❤️
                </button>
                <button
                  onClick={() => handleSwipe('left')}
                  className="rounded-full border border-hf-border px-6 py-3 font-semibold text-hf-charcoal"
                >
                  Pass
                </button>
                <button
                  onClick={handleCrush}
                  className="rounded-full border border-hf-border px-6 py-3 font-semibold text-hf-charcoal"
                >
                  Add Crush 💕
                </button>
                {isMatch && (
                  <button
                    onClick={handleChat}
                    className="rounded-full border border-hf-accent bg-hf-accent/10 px-6 py-3 font-semibold text-hf-accent"
                  >
                    Message ✉️
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleReport}
                  className="rounded-full border border-hf-border px-4 py-2 text-sm font-semibold text-hf-charcoal"
                >
                  Report
                </button>
                <button
                  onClick={handleBlock}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Block
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserProfilePage;
