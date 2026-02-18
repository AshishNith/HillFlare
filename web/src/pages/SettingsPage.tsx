import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export default function SettingsPage() {
    const { user, logout } = useAuthStore();

    return (
        <div className="p-6 lg:p-10 max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-8"><span className="text-gradient">Settings</span></h1>

                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6">
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
                                <span className="text-sm">{user?.isVerified ? '✅ Yes' : '❌ No'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h2 className="font-bold text-lg mb-4">Preferences</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-muted">Notifications</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-surface-4 rounded-full peer peer-checked:bg-primary transition-colors" />
                                </label>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-text-muted">Profile Visibility</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-surface-4 rounded-full peer peer-checked:bg-primary transition-colors" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h2 className="font-bold text-lg mb-4">About</h2>
                        <div className="text-text-muted text-sm space-y-2">
                            <p>CampusConnect v1.0.0</p>
                            <a href="#" className="text-primary-light hover:text-primary block">Privacy Policy</a>
                            <a href="#" className="text-primary-light hover:text-primary block">Terms of Service</a>
                        </div>
                    </div>

                    <button onClick={logout} className="w-full py-4 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all font-semibold">
                        🚪 Logout
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
