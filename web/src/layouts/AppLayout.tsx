import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/swipe', icon: '💘', label: 'Swipe' },
    { path: '/explore', icon: '🔍', label: 'Explore' },
    { path: '/crush', icon: '🤫', label: 'Crush' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function AppLayout() {
    const { user, fetchUser, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated) fetchUser();
    }, []);

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const initials = user?.name?.split(' ').map((n) => n[0]).join('') || '?';

    return (
        <div className="min-h-screen bg-gradient-mesh flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-72 glass-strong fixed h-full z-30"
                style={{ borderRight: '1px solid rgba(139,92,246,0.08)' }}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-7 pt-8 pb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>💜</div>
                    <span className="text-xl font-bold text-gradient">CampusConnect</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 mt-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all text-sm font-medium relative ${isActive
                                    ? 'text-white'
                                    : 'text-text-muted hover:text-text hover:bg-white/[0.03]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-0 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
                                                border: '1px solid rgba(139,92,246,0.2)',
                                                boxShadow: '0 0 20px rgba(139,92,246,0.1)',
                                            }}
                                            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                    <span className="text-lg relative z-10">{item.icon}</span>
                                    <span className="relative z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="px-4 pb-6 space-y-1">
                    <div className="border-t border-white/[0.05] mb-3" />
                    <NavLink to="/settings" className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-text-muted hover:text-text hover:bg-white/[0.03] transition-all text-sm font-medium">
                        <span className="text-lg">⚙️</span> Settings
                    </NavLink>
                    {user?.role === 'admin' && (
                        <NavLink to="/admin" className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-text-muted hover:text-text hover:bg-white/[0.03] transition-all text-sm font-medium">
                            <span className="text-lg">🛡️</span> Admin
                        </NavLink>
                    )}

                    {/* User card */}
                    <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02]">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))' }}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                        </div>
                        <button onClick={logout} className="text-text-muted hover:text-danger transition-colors text-sm" title="Logout">
                            🚪
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-strong z-30"
                style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}>
                <div className="flex justify-around px-2 py-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl transition-all relative ${isActive ? 'text-primary-light' : 'text-text-muted'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="mob-nav"
                                            className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                                            style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }}
                                        />
                                    )}
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 lg:ml-72 pb-20 lg:pb-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="min-h-screen"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
