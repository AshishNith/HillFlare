import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Flag, Trash2, Ban, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    isBanned?: boolean;
    createdAt: string;
}

interface Report {
    _id: string;
    reporter: { _id: string; name: string };
    reported: { _id: string; name: string };
    reason: string;
    status: string;
    createdAt: string;
}

export default function AdminPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [tab, setTab] = useState<'users' | 'reports'>('users');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'admin') {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user?.role !== 'admin') return;
        if (tab === 'users') fetchUsers();
        else fetchReports();
    }, [tab, user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data || res.data);
        } catch {
            // handled silently
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports');
            setReports(res.data.data || res.data);
        } catch {
            // handled silently
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        setActionId(userId);
        try {
            await api.post(`/admin/users/${userId}/${isBanned ? 'unban' : 'ban'}`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
        } catch {
            // handled silently
        } finally {
            setActionId(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Permanently delete this user and all their data?')) return;
        setActionId(userId);
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch {
            // handled silently
        } finally {
            setActionId(null);
        }
    };

    const handleResolveReport = async (reportId: string) => {
        setActionId(reportId);
        try {
            await api.put(`/admin/reports/${reportId}`, { status: 'resolved' });
            setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r));
        } catch {
            // handled silently
        } finally {
            setActionId(null);
        }
    };

    if (user?.role !== 'admin') return null;

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-6"><span className="text-gradient">Admin Panel</span></h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('users')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${tab === 'users' ? 'bg-primary text-white' : 'glass text-text-muted hover:text-text'}`}
                    >
                        <Users size={16} /> Users
                    </button>
                    <button
                        onClick={() => setTab('reports')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${tab === 'reports' ? 'bg-primary text-white' : 'glass text-text-muted hover:text-text'}`}
                    >
                        <Flag size={16} /> Reports
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : tab === 'users' ? (
                    <div className="glass rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-4 text-text-muted font-medium">Name</th>
                                    <th className="text-left p-4 text-text-muted font-medium">Email</th>
                                    <th className="text-left p-4 text-text-muted font-medium">Role</th>
                                    <th className="text-left p-4 text-text-muted font-medium">Status</th>
                                    <th className="text-right p-4 text-text-muted font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b border-border/50 hover:bg-surface-2 transition-colors">
                                        <td className="p-4 font-medium">{u.name}</td>
                                        <td className="p-4 text-text-muted">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-primary/20 text-primary-light' : 'bg-surface-3 text-text-muted'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {u.isBanned
                                                ? <span className="text-xs text-danger font-semibold">Banned</span>
                                                : <span className="text-xs text-success font-semibold">Active</span>}
                                        </td>
                                        <td className="p-4">
                                            {u.role !== 'admin' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleBanToggle(u._id, !!u.isBanned)}
                                                        disabled={actionId === u._id}
                                                        title={u.isBanned ? 'Unban' : 'Ban'}
                                                        className="p-1.5 rounded-lg hover:bg-surface-3 text-text-muted hover:text-warning transition-colors disabled:opacity-40"
                                                    >
                                                        {u.isBanned ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        disabled={actionId === u._id}
                                                        title="Delete user"
                                                        className="p-1.5 rounded-lg hover:bg-surface-3 text-text-muted hover:text-danger transition-colors disabled:opacity-40"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-text-muted">No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.length === 0 && (
                            <div className="glass rounded-2xl p-8 text-center text-text-muted">No reports found</div>
                        )}
                        {reports.map(r => (
                            <div key={r._id} className="glass rounded-xl p-5 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium mb-1">
                                        <span className="text-primary-light">{r.reporter?.name}</span>
                                        <span className="text-text-muted mx-2">reported</span>
                                        <span className="text-primary-light">{r.reported?.name}</span>
                                    </p>
                                    <p className="text-sm text-text-muted mb-2">{r.reason}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'resolved' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                        {r.status}
                                    </span>
                                </div>
                                {r.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleResolveReport(r._id)}
                                        disabled={actionId === r._id}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-all text-sm font-medium disabled:opacity-40 shrink-0"
                                    >
                                        <CheckCircle size={14} /> Resolve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
