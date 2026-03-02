import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { apiService } from '../services/api';

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await apiService.getMatches();
      setMatches(data.items || []);
    } catch (error) {
      console.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (email: string, match: any) => {
    try {
      const data = await apiService.findOrCreateChat(email);
      navigate(`/app/chats/${data.data._id}`, { state: { otherUser: match } });
    } catch (error) {
      console.error('Failed to start chat');
    }
  };

  const handleUnmatch = async (email: string) => {
    try {
      await apiService.unmatchUser(email);
      loadMatches();
    } catch (error) {
      console.error('Failed to unmatch');
    }
  };

  if (loading) {
    return (
      <AppLayout title="Matches">
        <div className="flex h-96 items-center justify-center">
          <p className="text-hf-muted">Loading matches...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Matches">
      {matches.length === 0 ? (
        <div className="rounded-3xl border border-hf-border bg-white p-12 text-center">
          <div className="mb-4 text-6xl">💫</div>
          <h2 className="mb-2 text-2xl font-bold text-hf-charcoal">No matches yet</h2>
          <p className="mb-6 text-hf-muted">
            Start swiping to find your perfect match!
          </p>
          <a
            href="/app/discover"
            className="inline-block rounded-full bg-hf-accent px-6 py-3 font-semibold text-white"
          >
            Start Discovering
          </a>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <div
              key={match._id || match.id}
              className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft transition hover:shadow-lg"
            >
              <div className="mb-4 h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-hf-accent/20 to-hf-accent/5">
                {match.avatarUrl && (
                  <img
                    src={match.avatarUrl}
                    alt={match.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <h3 className="mb-1 text-xl font-bold text-hf-charcoal">{match.name}</h3>
              <p className="mb-4 text-sm text-hf-muted">
                {match.department} · Year {match.year}
              </p>

              {match.bio && (
                <p className="mb-4 text-sm text-hf-charcoal line-clamp-2">{match.bio}</p>
              )}

              {match.interests && match.interests.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {match.interests.slice(0, 3).map((interest: string) => (
                    <span
                      key={interest}
                      className="rounded-full bg-hf-accent/10 px-3 py-1 text-xs font-medium text-hf-accent"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleMessage(match.email, match)}
                  className="flex-1 rounded-full bg-hf-accent px-4 py-2.5 font-semibold text-white transition hover:shadow-glow"
                >
                  Send Message
                </button>
                <button
                  onClick={() => handleUnmatch(match.email)}
                  className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"
                >
                  Unmatch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default MatchesPage;
