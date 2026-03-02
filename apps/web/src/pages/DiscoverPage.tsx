import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { MatchModal } from '../components/MatchModal';
import { apiService } from '../services/api';

const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadProfiles();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await apiService.getMe();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user');
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await apiService.getDiscoveryProfiles();
      setProfiles(data.items || []);
    } catch (error) {
      console.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];
    try {
      const result = await apiService.swipe(profile._id || profile.id, direction);
      if (result.matched) {
        setMatchedUser(profile);
        setShowMatchModal(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Swipe failed');
    }
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <AppLayout title="Discover">
        <div className="flex h-72 items-center justify-center">
          <p className="text-hf-muted">Loading profiles...</p>
        </div>
      </AppLayout>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <AppLayout title="Discover">
        <div className="rounded-3xl border border-hf-border bg-white p-12 text-center">
          <div className="mb-4 text-6xl">✨</div>
          <h2 className="mb-2 text-2xl font-bold text-hf-charcoal">
            You've seen everyone!
          </h2>
          <p className="text-hf-muted">Check back later for new profiles</p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              loadProfiles();
            }}
            className="mt-6 rounded-full bg-hf-accent px-6 py-3 font-semibold text-white"
          >
            Start Over
          </button>
        </div>
      </AppLayout>
    );
  }

  const profile = profiles[currentIndex];

  return (
    <AppLayout title="Discover">
      <MatchModal
        visible={showMatchModal}
        matchedUser={matchedUser}
        currentUserAvatar={currentUser?.avatarUrl}
        onClose={handleCloseMatchModal}
      />

      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-hf-border bg-white shadow-soft overflow-hidden">
          {/* Profile Image - scaled down */}
          <div className="h-56 overflow-hidden bg-gradient-to-br from-hf-accent/20 to-hf-accent/5">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Profile Info - compact */}
          <div className="p-5">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-hf-charcoal">{profile.name}</h2>
              <p className="text-sm text-hf-muted">
                {profile.department} · Year {profile.year}
              </p>
            </div>
            {profile.bio && (
              <p className="mb-3 text-sm text-hf-charcoal line-clamp-2">{profile.bio}</p>
            )}

            {/* Interests & Clubs in compact row */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {profile.interests?.slice(0, 4).map((interest: string) => (
                <span
                  key={interest}
                  className="rounded-full bg-hf-accent/10 px-3 py-1 text-xs font-medium text-hf-accent"
                >
                  {interest}
                </span>
              ))}
              {profile.clubs?.slice(0, 2).map((club: string) => (
                <span
                  key={club}
                  className="rounded-full bg-hf-charcoal/5 px-3 py-1 text-xs font-medium text-hf-charcoal"
                >
                  {club}
                </span>
              ))}
            </div>

            {/* Action Buttons - compact */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSwipe('left')}
                className="flex-1 rounded-full border-2 border-hf-border bg-white px-4 py-3 text-sm font-semibold text-hf-muted transition hover:border-red-300 hover:text-red-500"
              >
                Pass
              </button>
              <button
                onClick={() => handleSwipe('right')}
                className="flex-1 rounded-full bg-hf-accent px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow"
              >
                Like ❤️
              </button>
              <button
                onClick={() => navigate(`/app/users/${profile._id || profile.id}`)}
                className="flex-1 rounded-full border-2 border-hf-border bg-white px-4 py-3 text-sm font-semibold text-hf-charcoal transition hover:border-hf-accent"
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 text-center text-sm text-hf-muted">
          {currentIndex + 1} / {profiles.length}
        </div>
      </div>
    </AppLayout>
  );
};

export default DiscoverPage;
