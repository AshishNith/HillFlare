import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '☀️' };
    if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (h < 21) return { text: 'Good evening', emoji: '🌙' };
    return { text: 'Night owl mode', emoji: '🦉' };
};

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const [stats, setStats] = useState({ matches: 0, crushes: 0, chats: 0 });
    const greeting = getGreeting();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [matchRes, crushRes, chatRes] = await Promise.all([
                    api.get('/matches'), api.get('/crushes'), api.get('/chats'),
                ]);
                setStats({
                    matches: matchRes.data.data?.length || 0,
                    crushes: crushRes.data.data?.length || 0,
                    chats: chatRes.data.data?.length || 0,
                });
            } catch { }
        };
        fetchStats();
    }, []);

    const cards = [
        { icon: '💘', label: 'Matches', value: stats.matches, gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: 'rgba(139,92,246,0.2)', color: '#A78BFA' },
        { icon: '🤫', label: 'Active Crushes', value: stats.crushes, gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))', border: 'rgba(236,72,153,0.2)', color: '#F472B6' },
        { icon: '💬', label: 'Conversations', value: stats.chats, gradient: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))', border: 'rgba(52,211,153,0.2)', color: '#34D399' },
    ];

    const actions = [
        { icon: '💘', title: 'Start Swiping', desc: 'Discover new people nearby', path: '/swipe', gradient: 'from-purple-500/10 to-pink-500/5' },
        { icon: '🎯', title: 'Explore by Interest', desc: 'Find compatible matches', path: '/explore', gradient: 'from-blue-500/10 to-purple-500/5' },
        { icon: '🤫', title: 'Secret Crush', desc: 'Pick your top 3 anonymously', path: '/crush', gradient: 'from-pink-500/10 to-rose-500/5' },
        { icon: '💬', title: 'Messages', desc: 'Chat with your matches', path: '/chat', gradient: 'from-emerald-500/10 to-teal-500/5' },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl animate-float">{greeting.emoji}</span>
                    <div>
                        <p className="text-sm text-text-muted font-medium">{greeting.text}</p>
                        <h1 className="text-3xl lg:text-4xl font-bold">
                            <span className="text-gradient">{user?.name || 'there'}</span>
                        </h1>
                    </div>
                </div>
                <p className="text-text-muted mt-3 text-sm pl-1">Here's what's happening on your campus today.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-5 mb-10">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        className="rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
                        style={{ background: card.gradient, border: `1px solid ${card.border}` }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                    >
                        {/* Subtle glow on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ boxShadow: `inset 0 0 40px ${card.border}` }} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl">{card.icon}</span>
                                <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{card.label}</span>
                            </div>
                            <p className="text-5xl font-bold" style={{ color: card.color }}>{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #8B5CF6, #EC4899)' }} />
                    Quick Actions
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {actions.map((action, i) => (
                        <motion.div key={action.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                            <Link to={action.path}
                                className="glass-card rounded-2xl p-5 flex items-center gap-4 group block">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300"
                                    style={{ background: 'rgba(139,92,246,0.1)' }}>
                                    {action.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm group-hover:text-primary-light transition-colors">{action.title}</p>
                                    <p className="text-text-muted text-xs mt-0.5">{action.desc}</p>
                                </div>
                                <span className="ml-auto text-text-muted/30 group-hover:text-text-muted group-hover:translate-x-1 transition-all text-lg">→</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
