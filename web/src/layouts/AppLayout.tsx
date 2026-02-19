import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Flame, Search, Heart, MessageCircle, User, Settings, Shield, LogOut, Bell, Sparkles } from 'lucide-react';
import api from '../services/api';
import { GlassCard, Avatar } from '../components/ui';

const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/swipe', icon: Flame, label: 'Discover' },
    { path: '/explore', icon: Search, label: 'Explore' },
    { path: '/crush', icon: Heart, label: 'Crush' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/notifications', icon: Bell, label: 'Activity' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
    const { user, fetchUser, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => { if (isAuthenticated) fetchUser(); }, []);

    // Poll unread notification count every 30s
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchUnread = async () => {
            try {
                const { data } = await api.get('/notifications');
                setUnreadCount(data.unreadCount || 0);
            } catch { }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    if (!isAuthenticated) { navigate('/login'); return null; }

    // Mandatory Profile Completion Check
    useEffect(() => {
        if (user && !user.isProfileComplete) {
            const isSetup = location.pathname === '/setup';
            if (!isSetup) {
                navigate('/setup', { replace: true });
            }
        }
    }, [user, location.pathname, navigate]);

    const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/4 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }} />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed left-6 top-6 bottom-6 w-64 z-30">
                <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
                    {/* Logo Section */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">HillFlare</h1>
                                <p className="text-xs text-white/60">College Dating</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white shadow-lg'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="relative">
                                            <item.icon
                                                className={`w-5 h-5 transition-all ${
                                                    isActive ? 'text-purple-300' : 'text-white/60 group-hover:text-white/80'
                                                }`}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            {item.path === '/notifications' && unreadCount > 0 && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute right-2 w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        {/* Settings */}
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                                    isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <Settings className="w-5 h-5" strokeWidth={2} />
                            Settings
                        </NavLink>

                        {/* Admin Link */}
                        {user?.role === 'admin' && (
                            <NavLink
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm text-white/70 hover:bg-white/5 hover:text-white"
                            >
                                <Shield className="w-5 h-5" strokeWidth={2} />
                                Admin
                            </NavLink>
                        )}

                        {/* User Profile */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <Avatar
                                    src={user?.photos?.[0]}
                                    name={user?.name || ''}
                                    size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-white/60 truncate">
                                        {user?.email || 'user@college.edu'}
                                    </p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors group"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4 text-white/60 group-hover:text-red-400" strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-80 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="min-h-screen"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
                <GlassCard className="m-4 p-2">
                    <nav className="flex items-center justify-around">
                        {navItems.slice(0, 5).map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                                        isActive ? 'text-purple-400' : 'text-white/60'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="relative">
                                            <item.icon
                                                className="w-5 h-5"
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            {item.path === '/notifications' && unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-white">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="mobileActiveTab"
                                                className="absolute bottom-0 left-1/2 w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                                                style={{ x: '-50%' }}
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </GlassCard>
            </div>
        </div>
    );
}
