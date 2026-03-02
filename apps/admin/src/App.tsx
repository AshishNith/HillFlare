import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

interface Stats {
  totalUsers: number;
  totalMatches: number;
  totalReports: number;
  activeChats: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalMatches: 0,
    totalReports: 0,
    activeChats: 0,
  });
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [collegesRes] = await Promise.all([
        axios.get(`${API_URL}/colleges`),
      ]);
      
      setColleges(collegesRes.data.items || []);
      
      // Mock stats for now
      setStats({
        totalUsers: 2184,
        totalMatches: 856,
        totalReports: 12,
        activeChats: 431,
      });
    } catch (error) {
      console.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
          { label: 'Total Matches', value: stats.totalMatches, icon: '💫', color: 'green' },
          { label: 'Active Chats', value: stats.activeChats, icon: '💬', color: 'purple' },
          { label: 'Pending Reports', value: stats.totalReports, icon: '⚠️', color: 'red' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-medium text-${stat.color}-600`}>+4.2%</span>
            </div>
            <p className="text-sm text-hf-muted">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-hf-text">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-hf-bg rounded-2xl">
            <p className="text-hf-muted">Chart placeholder - User growth over time</p>
          </div>
        </div>

        {/* Match Rate */}
        <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Match Rate</h3>
          <div className="h-64 flex items-center justify-center bg-hf-bg rounded-2xl">
            <p className="text-hf-muted">Chart placeholder - Match success rate</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { user: 'Aanya Sharma', action: 'Created account', time: '2 minutes ago' },
            { user: 'Rohan Mehta', action: 'Matched with Meera K.', time: '15 minutes ago' },
            { user: 'Admin', action: 'Resolved report #312', time: '1 hour ago' },
            { user: 'Zara Khan', action: 'Joined Drama Club', time: '2 hours ago' },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-2xl border border-hf-border bg-hf-bg px-4 py-3"
            >
              <div>
                <p className="font-medium text-hf-text">{activity.user}</p>
                <p className="text-sm text-hf-muted">{activity.action}</p>
              </div>
              <span className="text-xs text-hf-muted">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Reports Management</h2>
          <p className="text-sm text-hf-muted">Review and moderate user reports</p>
        </div>
        <select className="rounded-full border border-hf-border px-4 py-2 text-sm">
          <option>All Reports</option>
          <option>Pending</option>
          <option>Resolved</option>
        </select>
      </div>
      
      <div className="space-y-3">
        {[
          { id: 312, reason: 'Harassment', reporter: 'Anonymous', status: 'pending', severity: 'high' },
          { id: 311, reason: 'Fake profile', reporter: 'Anonymous', status: 'pending', severity: 'medium' },
          { id: 310, reason: 'Spam', reporter: 'Anonymous', status: 'resolved', severity: 'low' },
          { id: 309, reason: 'Inappropriate content', reporter: 'Anonymous', status: 'pending', severity: 'high' },
        ].map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between rounded-2xl border border-hf-border bg-hf-bg px-4 py-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-semibold text-hf-text">Report #{report.id}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  report.severity === 'high' ? 'bg-red-100 text-red-700' :
                  report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {report.severity}
                </span>
              </div>
              <p className="text-sm text-hf-muted">Reason: {report.reason}</p>
              <p className="text-xs text-hf-muted mt-1">Reporter: {report.reporter}</p>
            </div>
            <div className="flex gap-2">
              {report.status === 'pending' ? (
                <>
                  <button className="rounded-full bg-hf-accent/10 px-4 py-2 text-sm font-medium text-hf-accent hover:bg-hf-accent/20">
                    Review
                  </button>
                  <button className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                    Ban User
                  </button>
                </>
              ) : (
                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-hf-muted">View and manage all users</p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search users..."
            className="rounded-full border border-hf-border px-4 py-2 text-sm"
          />
          <button className="rounded-full bg-hf-accent px-4 py-2 text-sm font-medium text-white">
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hf-border text-left text-sm text-hf-muted">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">College</th>
              <th className="pb-3 font-medium">Year</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { name: 'Aanya Sharma', email: 'aanya@nith.ac.in', college: 'NIT Hamirpur', year: 3, status: 'active' },
              { name: 'Rohan Mehta', email: 'rohan@nith.ac.in', college: 'NIT Hamirpur', year: 2, status: 'active' },
              { name: 'Meera Kapoor', email: 'meera@nith.ac.in', college: 'NIT Hamirpur', year: 4, status: 'active' },
            ].map((user, idx) => (
              <tr key={idx} className="border-b border-hf-border/50">
                <td className="py-4 font-medium text-hf-text">{user.name}</td>
                <td className="py-4 text-hf-muted">{user.email}</td>
                <td className="py-4 text-hf-muted">{user.college}</td>
                <td className="py-4 text-hf-muted">{user.year}</td>
                <td className="py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {user.status}
                  </span>
                </td>
                <td className="py-4">
                  <button className="text-sm text-hf-accent hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderColleges = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Colleges</h2>
            <p className="text-sm text-hf-muted">Manage registered colleges</p>
          </div>
          <button className="rounded-full bg-hf-accent px-4 py-2 text-sm font-medium text-white">
            Add College
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-hf-bg p-8 text-center">
              <p className="text-hf-muted">No colleges registered yet</p>
            </div>
          ) : (
            colleges.map((college) => (
              <div
                key={college._id}
                className="rounded-2xl border border-hf-border bg-hf-bg p-4"
              >
                <h3 className="font-semibold text-hf-text">{college.name}</h3>
                <p className="mt-1 text-sm text-hf-muted">{college.location || 'Location N/A'}</p>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs text-hf-accent hover:underline">Edit</button>
                  <button className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
        <h2 className="mb-6 text-xl font-semibold">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-hf-text">
              Platform Name
            </label>
            <input
              type="text"
              defaultValue="HillFlare"
              className="w-full rounded-2xl border border-hf-border px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-hf-text">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="support@hillflare.com"
              className="w-full rounded-2xl border border-hf-border px-4 py-2"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-hf-border bg-hf-bg p-4">
            <div>
              <p className="font-medium text-hf-text">Email Verification Required</p>
              <p className="text-sm text-hf-muted">Users must verify college email</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-hf-border bg-hf-bg p-4">
            <div>
              <p className="font-medium text-hf-text">Auto-Moderation</p>
              <p className="text-sm text-hf-muted">Automatically flag suspicious content</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>

          <button className="rounded-full bg-hf-accent px-6 py-3 font-semibold text-white">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hf-bg">
        <p className="text-hf-muted">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hf-bg text-hf-text">
      <header className="border-b border-hf-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-hf-accent/10 ring-1 ring-hf-border" />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-hf-muted">HillFlare</p>
              <h1 className="text-xl font-semibold">Admin Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full border border-hf-border bg-white px-4 py-2 text-sm hover:bg-hf-bg">
              Notifications
            </button>
            <button className="rounded-full bg-hf-charcoal px-4 py-2 text-sm text-white">
              Admin Profile
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-hf-border bg-white p-4 shadow-soft lg:sticky lg:top-8 lg:h-fit">
          <nav className="space-y-2 text-sm">
            {[
              { id: 'overview', label: 'Overview', count: null },
              { id: 'reports', label: 'Reports', count: 12 },
              { id: 'users', label: 'Users', count: 2184 },
              { id: 'colleges', label: 'Colleges', count: colleges.length },
              { id: 'settings', label: 'Settings', count: null },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  activeTab === item.id
                    ? 'bg-hf-accent/10 text-hf-accent font-semibold'
                    : 'text-hf-text hover:bg-hf-bg'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== null && (
                  <span className="text-xs text-hf-muted">{item.count}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <section>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'colleges' && renderColleges()}
          {activeTab === 'settings' && renderSettings()}
        </section>
      </main>
    </div>
  );
};

export default App;
