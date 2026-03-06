import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { apiService, API_URL } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const HillFlareLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="al-fg" x1="14" y1="4" x2="34" y2="44">
        <stop stopColor="#F07A83" />
        <stop offset="1" stopColor="#E8525E" />
      </linearGradient>
      <linearGradient id="al-fi" x1="20" y1="16" x2="28" y2="40">
        <stop stopColor="#FFB8BD" />
        <stop offset="1" stopColor="#F07A83" />
      </linearGradient>
    </defs>
    <path d="M24 3C19 3 12 9 12 20c0 7 3.5 11.5 6 15 2.5 3.5 6 10 6 10s3.5-6.5 6-10c2.5-3.5 6-8 6-15C36 9 29 3 24 3z" fill="url(#al-fg)" />
    <path d="M24 16c-2.5 0-6 3-6 9 0 3.5 1.5 6 3 7.5S24 38 24 38s1.5-4 3-5.5 3-4 3-7.5c0-6-3.5-9-6-9z" fill="url(#al-fi)" opacity="0.8" />
  </svg>
);

export const AppLayout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const userId = useAuthStore((state) => state.userId);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Fetch initial unread count
    apiService.getNotifications().then((data) => {
      const unread = (data.items || []).filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    }).catch(() => {});

    // Listen for real-time notifications
    if (userId && !socketRef.current) {
      const token = localStorage.getItem('auth_token');
      const socket = io(API_URL, {
        transports: ['websocket'],
        auth: token ? { token } : undefined,
      });
      socketRef.current = socket;
      socket.on('connect', () => {
        socket.emit('user:register', userId);
      });
      socket.on('notification', () => {
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-hf-bg">
      {/* Header */}
      <header className="border-b border-hf-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <HillFlareLogo size={36} />
            <span className="text-xl font-bold text-hf-charcoal">HillFlare</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link to="/app" className="text-hf-muted transition hover:text-hf-charcoal">Dashboard</Link>
            <Link to="/app/discover" className="text-hf-muted transition hover:text-hf-charcoal">Discover</Link>
            <Link to="/app/matches" className="text-hf-muted transition hover:text-hf-charcoal">Matches</Link>
            <Link to="/app/crushes" className="text-hf-muted transition hover:text-hf-charcoal">Crushes</Link>
            <Link to="/app/chats" className="text-hf-muted transition hover:text-hf-charcoal">Chats</Link>
            <Link to="/app/notifications" onClick={() => setUnreadCount(0)} className="relative text-hf-muted transition hover:text-hf-charcoal">
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hf-accent px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/app/profile" className="text-hf-muted transition hover:text-hf-charcoal">Profile</Link>
          </nav>
          <button
            onClick={handleLogout}
            className="rounded-full border border-hf-border bg-white px-4 py-2 text-sm font-medium text-hf-muted transition hover:border-hf-accent hover:text-hf-accent"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-hf-charcoal">{title}</h1>
        {children}
      </main>
    </div>
  );
};
