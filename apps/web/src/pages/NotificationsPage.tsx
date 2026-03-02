import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { apiService } from '../services/api';

const timeAgo = (dateStr: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  match: { icon: '💕', color: 'bg-pink-100', label: 'New Match' },
  crush_match: { icon: '🔥', color: 'bg-orange-100', label: 'Mutual Crush' },
  message: { icon: '💬', color: 'bg-blue-100', label: 'New Message' },
  like: { icon: '❤️', color: 'bg-red-100', label: 'New Like' },
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiService.markNotificationRead(id);
      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
    } catch (error) {
      console.error('Failed to mark notification read');
    }
  };

  const markAllRead = async () => {
    const unread = items.filter((i) => !i.read);
    for (const item of unread) {
      try {
        await apiService.markNotificationRead(item._id);
      } catch { }
    }
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  const handleClick = (notification: any) => {
    if (!notification.read) markRead(notification._id);
    if (notification.type === 'match' || notification.type === 'crush_match') {
      navigate('/app/matches');
    } else if (notification.type === 'message' && notification.payload?.chatId) {
      navigate(`/app/chats/${notification.payload.chatId}`);
    }
  };

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <AppLayout title="Notifications">
      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <p className="text-hf-muted">Loading notifications...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-hf-border bg-white p-12 text-center">
          <div className="mb-4 text-6xl">🔔</div>
          <h2 className="mb-2 text-2xl font-bold text-hf-charcoal">No notifications</h2>
          <p className="text-hf-muted">You are all caught up.</p>
        </div>
      ) : (
        <div>
          {/* Header */}
          {unreadCount > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-hf-muted">{unreadCount} unread</p>
              <button
                onClick={markAllRead}
                className="rounded-full border border-hf-border px-4 py-1.5 text-sm font-semibold text-hf-accent transition hover:bg-hf-accent/5"
              >
                Mark all as read
              </button>
            </div>
          )}

          <div className="space-y-3">
            {items.map((notification) => {
              const config = typeConfig[notification.type] || { icon: '🔔', color: 'bg-gray-100', label: 'Notification' };
              return (
                <div
                  key={notification._id}
                  onClick={() => handleClick(notification)}
                  className={`cursor-pointer rounded-2xl border border-hf-border bg-white p-4 shadow-soft transition hover:shadow-lg ${notification.read ? 'opacity-60' : ''
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${config.color}`}>
                      <span className="text-xl">{config.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-hf-charcoal">{config.label}</p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-hf-accent" />
                        )}
                      </div>
                      <p className="text-sm text-hf-muted truncate">
                        {notification.payload?.message || 'You have a new update.'}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-hf-muted">
                      {notification.createdAt ? timeAgo(notification.createdAt) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default NotificationsPage;
