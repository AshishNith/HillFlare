import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Users, Heart, ChevronLeft, ChevronRight, X, MessageCircle, Lock } from 'lucide-react';
import api from '../services/api';

interface UserProfile {
    _id: string;
    name: string;
    department: string;
    year: number;
    interests: string[];
    clubs: string[];
    photos: string[];
    bio: string;
    avatar: string;
    hasSwiped?: boolean;
    swipeType?: 'like' | 'pass';
}

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activePhoto, setActivePhoto] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);
    const [messageError, setMessageError] = useState('');

    const handleMessage = async () => {
        try {
            await api.post('/chats', { participantId: user!._id });
            navigate('/chat');
        } catch (err: any) {
            const code = err?.response?.data?.error;
            if (code === 'not_connected') {
                setMessageError(`You're not connected with ${user!.name} yet — like each other first to unlock messaging.`);
                setTimeout(() => setMessageError(''), 4000);
            } else {
                navigate('/chat');
            }
        }
    };

    const handleUndo = async () => {
        if (!user || actionLoading) return;
        if (!confirm('Are you sure you want to undo your swipe?')) return;

        setActionLoading(true);
        try {
            await api.delete(`/swipes/undo/${user._id}`);
            // Refresh
            const { data } = await api.get(`/users/${id}`);
            setUser(data.data);
        } catch (error) {
            console.error('Undo failed', error);
            alert('Failed to undo action');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSwipe = async (type: 'like' | 'pass') => {
        if (!user || actionLoading) return;
        setActionLoading(true);
        try {
            await api.post('/swipes', { toUser: user._id, type });
            // Refresh logic instead of navigate back
            const { data } = await api.get(`/users/${id}`);
            setUser(data.data);

        } catch (error: any) {
            console.error('Action failed', error);
            const errorMessage = error.response?.data?.error || 'Failed to perform action.';
            if (errorMessage.includes('Already swiped')) {
                const { data } = await api.get(`/users/${id}`);
                setUser(data.data);
            } else {
                alert(errorMessage);
            }
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/users/${id}`);
                setUser(data.data);
            } catch {
                setError('Profile not found');
            }
            setLoading(false);
        })();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div style={{ textAlign: 'center', paddingTop: '120px', color: 'var(--color-text-muted)' }}>
                <p style={{ fontSize: '56px', marginBottom: '16px' }}>😕</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>Profile not found</p>
                <p style={{ fontSize: '13px', marginBottom: '24px' }}>This user may not exist or has been removed.</p>
                <button onClick={() => navigate(-1)}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '13px', fontWeight: 700 }}>
                    Go back
                </button>
            </div>
        );
    }

    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    const photos = user.photos || [];
    const hasPhotos = photos.length > 0;

    return (
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0' }}>

            {/* Not-connected toast */}
            {messageError && (
                <div style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 20px', borderRadius: '10px',
                    backgroundColor: 'var(--color-surface2)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    maxWidth: '340px', width: 'calc(100vw - 48px)',
                    animation: 'fadeIn 0.2s ease',
                }}>
                    <Lock size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                        {messageError}
                    </span>
                </div>
            )}

            {/* Back button */}
            <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => navigate(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600,
                        padding: '6px 0',
                    }}>
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            {/* Photo carousel */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', aspectRatio: hasPhotos ? '4/5' : '4/3', backgroundColor: 'var(--color-surface-3)', overflow: 'hidden' }}>

                {hasPhotos ? (
                    <>
                        <img
                            src={photos[activePhoto]}
                            alt={`${user.name} photo ${activePhoto + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
                        />

                        {/* Nav arrows */}
                        {photos.length > 1 && (
                            <>
                                {activePhoto > 0 && (
                                    <button onClick={() => setActivePhoto(p => p - 1)}
                                        style={{
                                            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                        <ChevronLeft size={18} color="#fff" />
                                    </button>
                                )}
                                {activePhoto < photos.length - 1 && (
                                    <button onClick={() => setActivePhoto(p => p + 1)}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                        <ChevronRight size={18} color="#fff" />
                                    </button>
                                )}

                                {/* Dot indicators */}
                                <div style={{
                                    position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
                                    display: 'flex', gap: '6px',
                                }}>
                                    {photos.map((_, i) => (
                                        <button key={i} onClick={() => setActivePhoto(i)}
                                            style={{
                                                width: activePhoto === i ? '18px' : '7px', height: '7px',
                                                borderRadius: '4px', border: 'none', cursor: 'pointer',
                                                backgroundColor: activePhoto === i ? '#fff' : 'rgba(255,255,255,0.45)',
                                                transition: 'all 0.25s',
                                            }} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Photo counter */}
                        <div style={{
                            position: 'absolute', top: '14px', right: '14px',
                            padding: '4px 10px', borderRadius: '20px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            fontSize: '11px', fontWeight: 700, color: '#fff',
                        }}>
                            {activePhoto + 1} / {photos.length}
                        </div>
                    </>
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%',
                            backgroundColor: 'rgba(139,92,246,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '38px', fontWeight: 800, color: 'var(--color-primary-light)',
                        }}>
                            {initials}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Profile content */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ padding: '0' }}>

                {/* Name & basic info */}
                <div style={{ padding: '24px 24px 0' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.3px' }}>
                        {user.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            <BookOpen size={13} /> {user.department}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            Year {user.year}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '20px 0' }} />

                {/* Bio */}
                {user.bio && (
                    <>
                        <div style={{ padding: '0 24px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1.2px', marginBottom: '8px', textTransform: 'uppercase' }}>ABOUT</p>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.65' }}>{user.bio}</p>
                        </div>
                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '20px 0' }} />
                    </>
                )}

                {/* Interests */}
                {user.interests?.length > 0 && (
                    <>
                        <div style={{ padding: '0 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                <Heart size={13} color="var(--color-text-muted)" />
                                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0 }}>INTERESTS</p>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {user.interests.map(interest => (
                                    <span key={interest}
                                        style={{
                                            padding: '5px 14px', borderRadius: '4px',
                                            backgroundColor: 'rgba(139,92,246,0.1)',
                                            color: 'var(--color-primary-light)',
                                            fontSize: '12px', fontWeight: 500,
                                        }}>
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '20px 0' }} />
                    </>
                )}

                {/* Clubs */}
                {user.clubs?.length > 0 && (
                    <div style={{ padding: '0 24px', paddingBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <Users size={13} color="var(--color-text-muted)" />
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0 }}>CLUBS</p>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {user.clubs.map(club => (
                                <span key={club}
                                    style={{
                                        padding: '5px 14px', borderRadius: '4px',
                                        backgroundColor: 'rgba(52,211,153,0.1)',
                                        color: 'var(--color-success)',
                                        fontSize: '12px', fontWeight: 500,
                                    }}>
                                    {club}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom padding when no clubs */}
                {!user.clubs?.length && <div style={{ height: '40px' }} />}

                {/* Like/Pass Actions - Hide if already swiped */}
                {!user.hasSwiped && (
                    <div style={{
                        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '16px', zIndex: 100, alignItems: 'center',
                    }}>
                        <button onClick={() => handleSwipe('pass')} disabled={actionLoading}
                            style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-danger)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                color: 'var(--color-danger)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <X size={28} />
                        </button>

                        <button onClick={handleMessage}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '14px 22px', borderRadius: '30px',
                                backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                cursor: 'pointer', color: 'var(--color-text)',
                                fontWeight: 600, fontSize: '14px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <MessageCircle size={20} color="var(--color-primary-light)" />
                            Message
                        </button>

                        <button onClick={() => handleSwipe('like')} disabled={actionLoading}
                            style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)', border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                color: '#fff', boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Heart size={28} fill="currentColor" />
                        </button>
                    </div>
                )}

                {/* Already Swiped State with Undo */}
                {user.hasSwiped && (
                    <div style={{
                        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 100,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {user.swipeType === 'like' && (
                                <button onClick={handleMessage}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '12px 24px', borderRadius: '30px',
                                        backgroundColor: 'var(--color-primary)', border: 'none',
                                        cursor: 'pointer', color: '#fff',
                                        fontWeight: 700, fontSize: '14px',
                                        boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <MessageCircle size={18} />
                                    Message
                                </button>
                            )}

                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '30px',
                                backgroundColor: user.swipeType === 'like' ? 'rgba(139,92,246,0.15)' : 'var(--color-surface)',
                                border: user.swipeType === 'pass' ? '1px solid var(--color-danger)' : '1px solid rgba(139,92,246,0.3)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}>
                                {user.swipeType === 'like' ? <Heart size={16} fill="var(--color-primary-light)" color="var(--color-primary-light)" /> : <X size={16} color="var(--color-danger)" />}
                                <span style={{
                                    fontWeight: 700, fontSize: '13px', letterSpacing: '1px',
                                    color: user.swipeType === 'like' ? 'var(--color-primary-light)' : 'var(--color-danger)'
                                }}>
                                    {user.swipeType === 'like' ? 'LIKED' : 'PASSED'}
                                </span>
                            </div>
                        </div>

                        <button onClick={handleUndo} disabled={actionLoading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                padding: '6px 14px', borderRadius: '20px',
                                fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)',
                            }}>
                            <ArrowLeft size={13} /> Undo
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
