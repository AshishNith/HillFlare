import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [profileVisible, setProfileVisible] = useState(true);
    const [savingPref, setSavingPref] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => {
        if (user?.preferences) {
            setNotifications(user.preferences.notifications ?? true);
            setProfileVisible(user.preferences.profileVisible ?? true);
        }
    }, [user]);

    const handlePrefToggle = async (key: 'notifications' | 'profileVisible', value: boolean) => {
        const prev = key === 'notifications' ? notifications : profileVisible;
        if (key === 'notifications') setNotifications(value);
        else setProfileVisible(value);
        setSavingPref(true);
        try {
            await api.put('/users/preferences', { [key]: value });
        } catch {
            if (key === 'notifications') setNotifications(prev);
            else setProfileVisible(prev);
        } finally {
            setSavingPref(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) return;
        if (!window.confirm('Final confirmation: all your data (matches, messages, photos) will be permanently deleted.')) return;
        setDeletingAccount(true);
        try {
            await api.delete('/users/account');
            logout();
            navigate('/', { replace: true });
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to delete account. Please try again.');
        } finally {
            setDeletingAccount(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-8">Settings</h1>

                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="font-bold text-lg mb-4">Account</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-muted">Email</span>
                                <span className="text-sm">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-muted">Role</span>
                                <span className="text-sm capitalize px-3 py-1 rounded-full bg-primary/10 text-primary-light">{user?.role}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-muted">Verified</span>
                                <span className="text-sm flex items-center gap-1.5">
                                    {user?.isVerified
                                        ? <><CheckCircle size={14} className="text-success" /> Yes</>
                                        : <><XCircle size={14} className="text-danger" /> No</>}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="font-bold text-lg mb-4">
                            Preferences {savingPref && <span className="text-xs text-text-muted ml-2">Saving…</span>}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-muted">Notifications</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={notifications}
                                        onChange={e => handlePrefToggle('notifications', e.target.checked)}
                                        className="sr-only peer" />
                                    <div className="w-11 h-6 bg-surface-4 rounded-full peer peer-checked:bg-primary transition-colors" />
                                </label>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-muted">Profile Visibility</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={profileVisible}
                                        onChange={e => handlePrefToggle('profileVisible', e.target.checked)}
                                        className="sr-only peer" />
                                    <div className="w-11 h-6 bg-surface-4 rounded-full peer peer-checked:bg-primary transition-colors" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="font-bold text-lg mb-4">About</h2>
                        <div className="text-text-muted text-sm space-y-2">
                            <p>CampusConnect v1.0.0</p>
                            <a href="#" className="text-primary-light hover:text-primary block">Privacy Policy</a>
                            <a href="#" className="text-primary-light hover:text-primary block">Terms of Service</a>
                        </div>
                    </div>

                    <button onClick={logout} className="w-full py-4 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all font-semibold flex items-center justify-center gap-2">
                        <LogOut size={16} /> Logout
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="w-full py-4 rounded-xl bg-danger/10 border border-danger/40 text-danger hover:bg-danger/20 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> {deletingAccount ? 'Deleting…' : 'Delete Account'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
