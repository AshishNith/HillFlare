import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchModalProps {
  visible: boolean;
  matchedUser: {
    _id?: string;
    id?: string;
    name: string;
    avatarUrl?: string;
    department?: string;
    year?: number;
  } | null;
  currentUserAvatar?: string;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  matchedUser,
  currentUserAvatar,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!visible || !matchedUser) return null;

  const handleSendMessage = async () => {
    const targetId = matchedUser._id || matchedUser.id;
    if (!targetId) return;

    try {
      const { apiService } = await import('../services/api');
      const chatData = await apiService.findOrCreateChat(targetId);
      navigate(`/app/chats/${chatData.data._id}`, {
        state: {
          otherUser: {
            email: matchedUser._id || matchedUser.id,
            name: matchedUser.name,
            avatarUrl: matchedUser.avatarUrl,
          },
        },
      });
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const userImage = matchedUser.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg';
  const myImage = currentUserAvatar || 'https://randomuser.me/api/portraits/men/1.jpg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-8 shadow-glow animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-white">It's a Match! 💕</h2>
          <p className="text-lg text-white/90">
            You and {matchedUser.name} liked each other
          </p>
        </div>

        {/* Profile Images */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <img
              src={myImage}
              alt="You"
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-soft"
            />
            <div className="absolute -inset-1 rounded-full border-2 border-white/30"></div>
          </div>

          <div className="mx-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="relative">
            <img
              src={userImage}
              alt={matchedUser.name}
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-soft"
            />
            <div className="absolute -inset-1 rounded-full border-2 border-white/30"></div>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-8 text-center">
          <h3 className="mb-1 text-2xl font-bold text-white">{matchedUser.name}</h3>
          {matchedUser.department && matchedUser.year && (
            <p className="text-white/80">
              {matchedUser.department} • Year {matchedUser.year}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSendMessage}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-hf-accent shadow-soft transition hover:scale-105"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            Send Message
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-2xl border-2 border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};
