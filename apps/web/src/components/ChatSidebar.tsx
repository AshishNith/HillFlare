import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ChatItem {
  _id: string;
  otherUser: {
    email: string;
    name?: string;
    avatarUrl?: string;
  };
  lastMessage?: string;
  lastMessageType?: 'text' | 'image' | 'voice';
  lastMessageAt?: string;
  unreadCount?: number;
}

const timeAgo = (dateStr: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface ChatSidebarProps {
  chats: ChatItem[];
  loading: boolean;
  activeChatId?: string;
  onlineUsers: Set<string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  loading,
  activeChatId,
  onlineUsers,
  searchQuery,
  onSearchChange,
}) => {
  const navigate = useNavigate();

  const filtered = chats.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser?.name?.toLowerCase().includes(q) ||
      c.otherUser?.email?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="flex h-full flex-col border-r border-hf-border bg-white">
      {/* Sidebar Header */}
      <div className="flex-shrink-0 border-b border-hf-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-hf-charcoal">Chats</h2>
          {totalUnread > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-hf-accent px-2 text-xs font-bold text-white">
              {totalUnread}
            </span>
          )}
        </div>
        {/* Search */}
        <div className="relative mt-3">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hf-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-hf-border bg-hf-bg py-2 pl-10 pr-4 text-sm text-hf-charcoal placeholder-hf-muted focus:border-hf-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-hf-muted">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <p className="text-sm text-hf-muted">
              {searchQuery ? 'No chats found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filtered.map((chat) => {
            const isActive = chat._id === activeChatId;
            const isOnline = onlineUsers.has(chat.otherUser?.email);
            const hasUnread = !!chat.unreadCount && chat.unreadCount > 0;

            return (
              <div
                key={chat._id}
                onClick={() =>
                  navigate(`/app/chats/${chat._id}`, {
                    state: { otherUser: chat.otherUser },
                  })
                }
                className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors ${
                  isActive
                    ? 'bg-hf-accent/10 border-r-2 border-hf-accent'
                    : 'hover:bg-hf-bg'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-hf-accent/20 to-hf-accent/5">
                    {chat.otherUser?.avatarUrl ? (
                      <img
                        src={chat.otherUser.avatarUrl}
                        alt={chat.otherUser.name || ''}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-hf-accent">
                        {(chat.otherUser?.name || chat.otherUser?.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`truncate text-sm ${
                        hasUnread ? 'font-bold text-hf-charcoal' : 'font-medium text-hf-charcoal/80'
                      }`}
                    >
                      {chat.otherUser?.name || chat.otherUser?.email || 'User'}
                    </h3>
                    <span className={`ml-2 flex-shrink-0 text-[11px] ${hasUnread ? 'font-semibold text-hf-accent' : 'text-hf-muted'}`}>
                      {chat.lastMessageAt ? timeAgo(chat.lastMessageAt) : ''}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <p
                      className={`truncate text-[13px] ${
                        hasUnread ? 'font-medium text-hf-charcoal/70' : 'text-hf-muted'
                      }`}
                    >
                      {chat.lastMessageType === 'image'
                        ? '📷 Photo'
                        : chat.lastMessage || 'No messages yet'}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-hf-accent px-1.5 text-[10px] font-bold text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
