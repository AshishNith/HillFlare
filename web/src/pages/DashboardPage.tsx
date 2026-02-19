import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Search, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
};

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const [stats, setStats] = useState({ matches: 0, crushes: 0, chats: 0 });

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
        { label: 'Matches', value: stats.matches, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
        { label: 'Crushes', value: stats.crushes, color: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)' },
        { label: 'Chats', value: stats.chats, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    ];

    const actions = [
        { icon: Flame, title: 'Discover People', desc: 'Swipe through profiles near you', path: '/swipe', color: '#8B5CF6' },
        { icon: Search, title: 'Explore by Interest', desc: 'Find compatible matches', path: '/explore', color: '#3B82F6' },
        { icon: Heart, title: 'Secret Crush', desc: 'Pick your top 3 anonymously', path: '/crush', color: '#F97316' },
        { icon: MessageCircle, title: 'Messages', desc: 'Chat with your matches', path: '/chat', color: '#10B981' },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <p className="text-sm text-text-muted font-medium mb-1">{getGreeting()}</p>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                    {user?.name || 'there'}
                </h1>
                <p className="text-text-muted mt-2 text-sm">Here's what's happening on your campus.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        className="rounded-2xl p-6"
                        style={{ background: card.bg, border: `1px solid ${card.border}` }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">{card.label}</p>
                        <p className="text-4xl font-bold" style={{ color: card.color }}>{card.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="text-base font-semibold mb-4 text-text-muted uppercase tracking-wider text-xs">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    {actions.map((action, i) => (
                        <motion.div key={action.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                            <Link to={action.path}
                                className="card-interactive flex items-center gap-4 p-4 group">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${action.color}15` }}>
                                    <action.icon size={18} color={action.color} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm group-hover:text-primary-light transition-colors">{action.title}</p>
                                    <p className="text-text-muted text-xs mt-0.5">{action.desc}</p>
                                </div>
                                <ArrowRight size={16} className="text-text-subtle group-hover:text-text-muted group-hover:translate-x-1 transition-all" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
