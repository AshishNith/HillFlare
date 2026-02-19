import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Flame, Search, Heart, MessageCircle, User, Settings, Shield, LogOut, Bell } from 'lucide-react';
import api from '../services/api';

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
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface)' }}>

            {/* Sidebar - Desktop: flat, no border-radius, no shadow */}
            <aside style={{
                width: '220px', position: 'fixed', height: '100%', zIndex: 30,
                backgroundColor: 'var(--color-surface-2)',
                borderRight: '1px solid var(--color-border)',
                flexDirection: 'column',
            }} className="hidden lg:flex">

                {/* Logo — flat, no card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px 20px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '6px',
                    }}>
                        <Flame size={16} color="#fff" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>CampusConnect</span>
                </div>

                {/* Nav — flat rows, no rounded highlight */}
                <nav style={{ flex: 1, padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
                    {navItems.map((item) => (
                        <NavLink key={item.path} to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '11px 20px',
                                textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                                backgroundColor: isActive ? 'var(--color-surface-3)' : 'transparent',
                                borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                                transition: 'all 0.12s ease',
                                position: 'relative',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <span style={{ position: 'relative', display: 'flex' }}>
                                        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        {item.path === '/notifications' && unreadCount > 0 && (
                                            <span style={{
                                                position: 'absolute', top: '-5px', right: '-7px',
                                                width: '14px', height: '14px', borderRadius: '50%',
                                                backgroundColor: 'var(--color-danger)',
                                                fontSize: '9px', fontWeight: 700, color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                                        )}
                                    </span>
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom — flat */}
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                    <NavLink to="/settings"
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '11px 20px', textDecoration: 'none', fontSize: '14px',
                            color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                            backgroundColor: isActive ? 'var(--color-surface-3)' : 'transparent',
                            borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                        })}>
                        <Settings size={16} strokeWidth={2} /> Settings
                    </NavLink>
                    {user?.role === 'admin' && (
                        <NavLink to="/admin"
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 20px', textDecoration: 'none', fontSize: '14px', color: 'var(--color-text-muted)', borderLeft: '2px solid transparent' }}>
                            <Shield size={16} strokeWidth={2} /> Admin
                        </NavLink>
                    )}
                    {/* User row — flat, no card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            backgroundColor: 'var(--color-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                        </div>
                        <button onClick={logout}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title="Logout">
                            <LogOut size={14} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="lg:hidden" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
                backgroundColor: 'var(--color-surface-2)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex', justifyContent: 'space-around',
                padding: '10px 0 14px',
            }}>
                {navItems.map((item) => (
                    <NavLink key={item.path} to={item.path}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '2px 12px', textDecoration: 'none', position: 'relative' }}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div layoutId="mob-nav"
                                        style={{
                                            position: 'absolute', top: '-10px', left: 0, right: 0,
                                            height: '2px', backgroundColor: 'var(--color-primary)',
                                        }}
                                    />
                                )}
                                <span style={{ position: 'relative', display: 'flex' }}>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8}
                                        color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                                    {item.path === '/notifications' && unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: '-5px', right: '-7px',
                                            width: '14px', height: '14px', borderRadius: '50%',
                                            backgroundColor: 'var(--color-danger)',
                                            fontSize: '9px', fontWeight: 700, color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    )}
                                </span>
                                <span style={{ fontSize: '10px', fontWeight: 500, color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Main content */}
            <main className="lg:ml-[220px]" style={{ flex: 1, paddingBottom: '80px' }}>
                <AnimatePresence mode="wait">
                    <motion.div key={location.pathname}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ minHeight: '100vh' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
