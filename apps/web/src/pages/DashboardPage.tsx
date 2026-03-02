import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { apiService } from '../services/api';

const DashboardPage: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [matchesData, notificationsData, chatsData] = await Promise.all([
        apiService.getMatches(),
        apiService.getNotifications(),
        apiService.getChats(),
      ]);
      setMatches(matchesData.items || []);
      setNotifications(notificationsData.items || []);
      setChats(chatsData.items || []);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats Cards */}
        <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
          <p className="text-sm text-hf-muted">Total Matches</p>
          <p className="mt-2 text-3xl font-bold text-hf-accent">{matches.length}</p>
        </div>

        <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
          <p className="text-sm text-hf-muted">Active Chats</p>
          <p className="mt-2 text-3xl font-bold text-hf-charcoal">{chats.length}</p>
        </div>

        <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
          <p className="text-sm text-hf-muted">Profile Views</p>
          <p className="mt-2 text-3xl font-bold text-hf-charcoal">-</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/app/discover"
          className="rounded-3xl border border-hf-border bg-gradient-to-br from-hf-accent/10 to-hf-accent/5 p-6 text-center transition hover:shadow-soft"
        >
          <div className="mb-3 text-4xl">✨</div>
          <h3 className="font-semibold text-hf-charcoal">Discover</h3>
          <p className="mt-1 text-sm text-hf-muted">Find new people</p>
        </Link>

        <Link
          to="/app/matches"
          className="rounded-3xl border border-hf-border bg-white p-6 text-center transition hover:shadow-soft"
        >
          <div className="mb-3 text-4xl">💫</div>
          <h3 className="font-semibold text-hf-charcoal">Matches</h3>
          <p className="mt-1 text-sm text-hf-muted">View all matches</p>
        </Link>

        <Link
          to="/app/crushes"
          className="rounded-3xl border border-hf-border bg-white p-6 text-center transition hover:shadow-soft"
        >
          <div className="mb-3 text-4xl">💕</div>
          <h3 className="font-semibold text-hf-charcoal">Crushes</h3>
          <p className="mt-1 text-sm text-hf-muted">Secret crushes</p>
        </Link>

        <Link
          to="/app/chats"
          className="rounded-3xl border border-hf-border bg-white p-6 text-center transition hover:shadow-soft"
        >
          <div className="mb-3 text-4xl">💬</div>
          <h3 className="font-semibold text-hf-charcoal">Chats</h3>
          <p className="mt-1 text-sm text-hf-muted">Message matches</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-hf-charcoal">Recent Activity</h2>
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-hf-border bg-white p-8 text-center">
              <p className="text-hf-muted">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-hf-border bg-white p-8 text-center">
              <p className="text-hf-muted">No recent activity</p>
            </div>
          ) : (
            notifications.map((notification: any, idx: number) => (
              <div
                key={idx}
                className="rounded-3xl border border-hf-border bg-white p-4 hover:shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-hf-accent/10" />
                  <div className="flex-1">
                    <p className="font-medium text-hf-charcoal">
                      {notification.type || 'Notification'}
                    </p>
                    <p className="text-sm text-hf-muted">
                      {notification.payload?.message || 'You have a new update.'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
