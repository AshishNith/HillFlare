import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { apiService } from '../services/api';

const CrushesPage: React.FC = () => {
  const navigate = useNavigate();
  const [crushes, setCrushes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCrushId, setEditingCrushId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  useEffect(() => {
    loadCrushes();
    loadProfiles();
    loadMatches();
  }, []);

  const loadCrushes = async () => {
    try {
      const data = await apiService.getCrushes();
      setCrushes(data.items || []);
    } catch (error) {
      console.error('Failed to load crushes');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const data = await apiService.getExploreProfiles();
      setProfiles(data.items || []);
    } catch (error) {
      console.error('Failed to load profiles');
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadMatches = async () => {
    try {
      const data = await apiService.getMatches();
      setMatches(data.items || []);
    } catch (error) {
      console.error('Failed to load matches');
    }
  };

  // IDs of users already selected as crushes
  const crushedUserIds = crushes.map((c: any) => {
    const target = typeof c.targetUserId === 'object' ? c.targetUserId : null;
    return target?._id || c.targetUserId;
  });

  const handleAddCrush = async (userId: string) => {
    try {
      const result = await apiService.selectCrush(userId);
      await loadCrushes();
      if (result.matched && result.matchedUser) {
        setMatchedUser(result.matchedUser);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to add crush';
      alert(msg);
    }
  };

  const handleChangeCrush = async (crushId: string, newTargetUserId: string) => {
    try {
      const result = await apiService.updateCrush(crushId, newTargetUserId);
      setEditingCrushId(null);
      await loadCrushes();
      if (result.matched && result.matchedUser) {
        setMatchedUser(result.matchedUser);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to change crush';
      alert(msg);
    }
  };

  const handleRemoveCrush = async (crushId: string) => {
    try {
      await apiService.deleteCrush(crushId);
      await loadCrushes();
    } catch (error) {
      console.error('Failed to remove crush');
    }
  };

  const handleMatchChat = async () => {
    if (!matchedUser) return;
    try {
      const chat = await apiService.findOrCreateChat(matchedUser.email || matchedUser._id);
      setMatchedUser(null);
      navigate(`/app/chats/${chat._id || chat.chatId}`, {
        state: {
          otherUser: {
            email: matchedUser.email || matchedUser._id,
            name: matchedUser.name,
            avatarUrl: matchedUser.avatarUrl,
          },
        },
      });
    } catch {
      setMatchedUser(null);
    }
  };

  // Filter out users already selected as crushes + self
  const availableProfiles = profiles.filter(
    (p: any) => !crushedUserIds.includes(p._id)
  );

  const filteredProfiles = availableProfiles.filter(profile =>
    profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.year?.toString().includes(searchQuery)
  );

  return (
    <AppLayout title="Anonymous Crushes">
      {/* Match Modal */}
      {matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-center text-white shadow-2xl">
            <div className="mb-4 text-5xl">💕</div>
            <h2 className="mb-2 text-2xl font-bold">It's a Mutual Crush!</h2>
            <p className="mb-6 text-white/90">
              You and <span className="font-semibold">{matchedUser.name}</span> both selected each other!
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleMatchChat}
                className="rounded-full bg-white px-6 py-2.5 font-semibold text-pink-600 shadow-lg transition-transform hover:scale-105"
              >
                Send Message
              </button>
              <button
                onClick={() => setMatchedUser(null)}
                className="rounded-full border border-white/50 px-6 py-2.5 font-semibold text-white transition-transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-8 rounded-3xl border border-hf-accent/30 bg-gradient-to-br from-hf-accent/5 to-hf-accent/10 p-8">
        <h2 className="mb-2 text-2xl font-bold text-hf-charcoal">How it works</h2>
        <p className="text-hf-muted">
          Select up to 3 secret crushes. They'll only be revealed if they also select you.
          It's anonymous until there's a mutual match!
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Selected Crushes */}
        <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-xl font-semibold text-hf-charcoal">
            Your Crushes ({crushes.length}/3)
          </h3>
          {loading ? (
            <p className="text-hf-muted">Loading...</p>
          ) : crushes.length === 0 ? (
            <p className="text-hf-muted">No crushes selected yet</p>
          ) : (
            <div className="space-y-3">
              {crushes.map((crush: any, idx) => {
                const target = typeof crush.targetUserId === 'object' ? crush.targetUserId : { email: crush.targetUserId };
                const isEditing = editingCrushId === crush._id;
                return (
                  <div
                    key={crush._id || idx}
                    className="rounded-2xl bg-hf-bg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-hf-accent/20">
                        {target?.avatarUrl && (
                          <img
                            src={target.avatarUrl}
                            alt={target.name || 'Crush'}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-hf-charcoal">
                          {target?.name || target?.email || `Crush #${idx + 1}`}
                        </p>
                        <p className="text-sm text-hf-muted">
                          {crush.revealed ? '💕 Mutual crush!' : 'Waiting for mutual selection'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCrushId(isEditing ? null : crush._id)}
                          className="rounded-full border border-hf-accent/30 px-3 py-1 text-xs font-semibold text-hf-accent"
                        >
                          {isEditing ? 'Cancel' : 'Change'}
                        </button>
                        <button
                          onClick={() => handleRemoveCrush(crush._id)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {/* Inline change selector */}
                    {isEditing && (
                      <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-hf-border bg-white p-2">
                        {availableProfiles.length === 0 ? (
                          <p className="p-2 text-sm text-hf-muted">No other profiles available</p>
                        ) : (
                          availableProfiles.map((p: any) => (
                            <button
                              key={p._id}
                              onClick={() => handleChangeCrush(crush._id, p._id)}
                              className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-hf-bg"
                            >
                              <div className="h-8 w-8 overflow-hidden rounded-full bg-hf-accent/10">
                                {p.avatarUrl && <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />}
                              </div>
                              <span className="text-sm font-medium text-hf-charcoal">{p.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Crush */}
        <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-xl font-semibold text-hf-charcoal">Add a Crush</h3>
          {crushes.length >= 3 ? (
            <div className="rounded-2xl bg-hf-bg p-6 text-center">
              <p className="text-hf-muted">
                You've reached the maximum of 3 crushes. Remove one to add another.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, department, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-hf-border bg-hf-bg px-4 py-3 pl-10 text-sm placeholder-hf-muted focus:border-hf-accent focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-hf-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {loadingProfiles ? (
                <p className="text-hf-muted">Loading profiles...</p>
              ) : filteredProfiles.length === 0 ? (
                <p className="text-center text-hf-muted py-6">
                  {searchQuery ? 'No profiles found' : 'No profiles available'}
                </p>
              ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {filteredProfiles.map((profile: any) => (
                    <div
                      key={profile._id}
                      className="flex items-center justify-between rounded-2xl border border-hf-border bg-hf-bg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-hf-accent/10">
                          {profile.avatarUrl && (
                            <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-hf-charcoal">{profile.name}</p>
                          <p className="text-xs text-hf-muted">{profile.department} · Year {profile.year}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCrush(profile._id)}
                        className="rounded-full bg-hf-accent px-4 py-2 text-xs font-semibold text-white"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mutual Crushes */}
      <div className="mt-8 rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-xl font-semibold text-hf-charcoal">Mutual Crushes</h3>
        {matches.length === 0 ? (
          <p className="text-hf-muted">
            When you have a mutual crush, they'll appear here and you can start chatting!
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.slice(0, 4).map((match) => (
              <div
                key={match._id}
                className="flex items-center gap-4 rounded-2xl border border-hf-border bg-hf-bg p-4"
              >
                <div className="h-12 w-12 overflow-hidden rounded-full bg-hf-accent/10">
                  {match.avatarUrl && (
                    <img src={match.avatarUrl} alt={match.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-hf-charcoal">{match.name}</p>
                  <p className="text-sm text-hf-muted">{match.department} · Year {match.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CrushesPage;
