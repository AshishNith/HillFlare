import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Check, Heart, MessageCircle, Info, ShieldAlert, Flame } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

interface Notification {
    _id: string;
    type: 'match' | 'crush_reveal' | 'message' | 'report_update' | 'system';
    title: string;
    body: string;
    referenceId?: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) { }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'match': return <Heart size={20} className="text-primary-light" />;
            case 'crush_reveal': return <Flame size={20} className="text-accent" />;
            case 'message': return <MessageCircle size={20} className="text-success" />;
            case 'report_update': return <ShieldAlert size={20} className="text-warning" />;
            default: return <Info size={20} className="text-text-muted" />;
        }
    };

    const navigate = useNavigate();

    const handleNotificationClick = async (n: Notification) => {
        if (!n.read) {
            try {
                await api.put(`/notifications/${n._id}/read`);
                setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
            } catch { }
        }

        switch (n.type) {
            case 'match':
                if (n.referenceId) navigate(`/user/${n.referenceId}`);
                else navigate('/chat');
                break;
            case 'crush_reveal':
                navigate('/crush');
                break;
            case 'message':
                navigate('/chat');
                break;
            case 'report_update':
                // navigate('/support'); // If exists
                break;
            case 'system':
                break;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 pt-10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-light" style={{ background: 'rgba(139,92,246,0.1)' }}>
                        <Bell size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text">Activity</h1>
                        <p className="text-text-muted text-sm">Your recent notifications</p>
                    </div>
                </div>
                {notifications.some(n => !n.read) && (
                    <button onClick={markAllRead} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                        <Check size={16} /> Mark all read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 text-text-muted">
                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No new notifications</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((n, i) => (
                        <motion.div
                            key={n._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 rounded-xl border ${n.read ? 'bg-surface border-border' : 'bg-surface-2 border-primary/20'} flex gap-4 transition-colors cursor-pointer hover:bg-surface-3`}
                        >
                            <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${n.read ? 'bg-surface-2' : 'bg-surface-3'}`}>
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold ${n.read ? 'text-text' : 'text-primary'}`}>{n.title}</h3>
                                <p className="text-sm text-text-muted mt-1">{n.body}</p>
                                <p className="text-xs text-text-muted mt-2 block opacity-60">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
