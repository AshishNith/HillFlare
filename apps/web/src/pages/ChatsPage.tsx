import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { apiService, API_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { ChatSidebar } from '../components/ChatSidebar';

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

const ChatsPage: React.FC = () => {
  const authUserId = useAuthStore((state) => state.userId);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadChats();
    setupSocket();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const setupSocket = () => {
    if (socketRef.current) return;
    const socket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (authUserId) socket.emit('user:register', authUserId);
    });
    socket.on('user:onlineList', (payload: { userIds: string[] }) => {
      setOnlineUsers(new Set(payload.userIds));
    });
    socket.on('user:online', (payload: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(payload.userId));
    });
    socket.on('user:offline', (payload: { userId: string }) => {
      setOnlineUsers((prev) => { const n = new Set(prev); n.delete(payload.userId); return n; });
    });
    socket.on('chats:update', () => loadChats());
  };

  const loadChats = async () => {
    try {
      const data = await apiService.getChats();
      setChats(data.items || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-hf-bg">
      {/* Compact top nav */}
      <header className="flex-shrink-0 border-b border-hf-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-3">
          <Link to="/app" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="c-fg" x1="14" y1="4" x2="34" y2="44"><stop stopColor="#F07A83" /><stop offset="1" stopColor="#E8525E" /></linearGradient>
              </defs>
              <path d="M24 3C19 3 12 9 12 20c0 7 3.5 11.5 6 15 2.5 3.5 6 10 6 10s3.5-6.5 6-10c2.5-3.5 6-8 6-15C36 9 29 3 24 3z" fill="url(#c-fg)" />
            </svg>
            <span className="text-lg font-bold text-hf-charcoal">HillFlare</span>
          </Link>
          <nav className="hidden gap-5 md:flex">
            <Link to="/app" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Dashboard</Link>
            <Link to="/app/discover" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Discover</Link>
            <Link to="/app/matches" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Matches</Link>
            <Link to="/app/crushes" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Crushes</Link>
            <Link to="/app/chats" className="text-sm font-semibold text-hf-accent">Chats</Link>
            <Link to="/app/notifications" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Notifications</Link>
            <Link to="/app/profile" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Profile</Link>
          </nav>
        </div>
      </header>

      {/* Main split area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[380px] flex-shrink-0">
          <ChatSidebar
            chats={chats}
            loading={loading}
            onlineUsers={onlineUsers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Right: empty state */}
        <div className="flex flex-1 flex-col items-center justify-center bg-hf-bg/60">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-hf-accent/10">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-hf-charcoal">Select a conversation</h2>
            <p className="text-hf-muted">Choose a chat from the sidebar to start messaging</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
