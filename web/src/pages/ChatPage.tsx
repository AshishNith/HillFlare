import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { Search, MessageCircle, ArrowLeft, Camera, Smile, Send, Loader2, CheckCheck, Check } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface ChatItem {
    _id: string;
    participants: { _id: string; name: string; avatar: string; photos?: string[] }[];
    lastMessage: string;
    lastMessageAt: string;
}

interface Message {
    _id: string;
    chatId: string;
    sender: { _id: string; name: string } | string;
    content: string;
    type?: 'text' | 'image';
    imageUrl?: string;
    status?: 'sent' | 'delivered' | 'read';
    seen?: boolean;
    timestamp: string;
}

function timeAgo(dateStr: string) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days`;
    return 'Last week';
}

export default function ChatPage() {
    const navigate = useNavigate();
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<any>(null);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const s = io(window.location.origin, { auth: { token }, transports: ['websocket', 'polling'] });
        socketRef.current = s;
        s.on('connect', () => console.log('Chat socket connected'));
        s.on('online_users', (ids: string[]) => setOnlineUserIds(new Set(ids)));
        s.on('user_online', ({ userId: uid }) => setOnlineUserIds(p => new Set(p).add(uid)));
        s.on('user_offline', ({ userId: uid }) => setOnlineUserIds(p => { const n = new Set(p); n.delete(uid); return n; }));
        s.on('new_message', (msg: Message) => { setMessages(p => [...p, msg]); scrollToBottom(); });
        s.on('message_status_update', ({ messageId, status }) =>
            setMessages(p => p.map(m => m._id === messageId ? { ...m, status: status as Message['status'] } : m)));
        s.on('messages_read', ({ chatId }) =>
            setMessages(p => p.map(m => {
                const sid = typeof m.sender === 'string' ? m.sender : m.sender._id;
                return m.chatId === chatId && sid === user?._id ? { ...m, status: 'read' } : m;
            })));
        s.on('user_typing', ({ isTyping }) => setTyping(isTyping));
        fetchChats();
        return () => { s.disconnect(); };
    }, []);

    const fetchChats = async () => {
        try { const { data } = await api.get('/chats'); setChats(data.data || []); } catch { }
    };

    const openChat = async (chatId: string) => {
        setActiveChat(chatId);
        socketRef.current?.emit('join_chat', chatId);
        try {
            const { data } = await api.get(`/chats/${chatId}/messages`);
            setMessages(data.data || []);
            await api.put(`/chats/${chatId}/seen`);
            socketRef.current?.emit('mark_seen', { chatId });
            scrollToBottom();
        } catch { }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !activeChat) return;
        socketRef.current?.emit('send_message', { chatId: activeChat, content: newMessage.trim() });
        setNewMessage('');
        socketRef.current?.emit('typing', { chatId: activeChat, isTyping: false });
    };

    const handleTyping = (value: string) => {
        setNewMessage(value);
        socketRef.current?.emit('typing', { chatId: activeChat, isTyping: value.length > 0 });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() =>
            socketRef.current?.emit('typing', { chatId: activeChat, isTyping: false }), 3000);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try { await api.post(`/chats/${activeChat}/image`, { image: reader.result }); } catch { }
            setUploading(false);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    const getOtherUser = (chat: ChatItem) => chat.participants.find(p => p._id !== user?._id) || chat.participants[0];
    const getSenderId = (msg: Message) => typeof msg.sender === 'string' ? msg.sender : msg.sender._id;

    const renderTicks = (msg: Message) => {
        const st = msg.status || (msg.seen ? 'read' : 'sent');
        if (st === 'read') return <CheckCheck size={12} color="#60A5FA" style={{ marginLeft: '3px' }} />;
        if (st === 'delivered') return <CheckCheck size={12} color="rgba(255,255,255,0.4)" style={{ marginLeft: '3px' }} />;
        return <Check size={12} color="rgba(255,255,255,0.4)" style={{ marginLeft: '3px' }} />;
    };

    const otherUser = activeChat ? chats.find(c => c._id === activeChat)?.participants.find(p => p._id !== user?._id) : null;
    const isOtherOnline = otherUser?._id ? onlineUserIds.has(otherUser._id) : false;
    const matches = chats.slice(0, 10);

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-surface)' }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

            {/* Left panel: matches + chat list */}
            <div style={{
                width: activeChat ? '0' : '100%',
                maxWidth: '420px',
                display: activeChat ? 'none' : 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                overflow: 'hidden',
            }} className="md:flex md:flex-col md:w-96 md:max-w-none">
                {/* Header */}
                <div style={{ padding: '24px 20px 16px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>Messages</h1>
                </div>

                {/* Matches row */}
                {matches.length > 0 && (
                    <div style={{ paddingBottom: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '1.5px', padding: '0 20px 12px' }}>MATCHES</p>
                        <div style={{ display: 'flex', gap: '16px', paddingLeft: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {matches.map(chat => {
                                const other = getOtherUser(chat);
                                const isOnline = other?._id ? onlineUserIds.has(other._id) : false;
                                return (
                                    <button key={chat._id} onClick={() => openChat(chat._id)}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', minWidth: '60px' }}>
                                        <div style={{ position: 'relative' }}>
                                            {other?.photos?.[0] ? (
                                                <img src={other.photos[0]} alt={other.name}
                                                    onClick={e => { e.stopPropagation(); navigate(`/user/${other._id}`); }}
                                                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)', cursor: 'pointer' }} />
                                            ) : (
                                                <div onClick={e => { e.stopPropagation(); navigate(`/user/${other!._id}`); }}
                                                    style={{
                                                        width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer',
                                                        backgroundColor: 'var(--color-surface-3)',
                                                        border: '2px solid var(--color-primary)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '20px', fontWeight: 700, color: 'var(--color-primary-light)',
                                                    }}>{other?.name?.[0] || '?'}</div>
                                            )}
                                            {isOnline && (
                                                <div style={{
                                                    position: 'absolute', bottom: '1px', right: '1px',
                                                    width: '12px', height: '12px', borderRadius: '50%',
                                                    backgroundColor: 'var(--color-success)',
                                                    border: '2px solid var(--color-surface)',
                                                }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{other?.name?.split(' ')[0] || 'User'}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div style={{ padding: '0 16px 12px', position: 'relative' }}>
                    <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input placeholder="Search" className="search-field" style={{ paddingLeft: '36px' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>

                {/* Chat list */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {(() => {
                        const filteredChats = searchQuery.trim()
                            ? chats.filter(chat => {
                                const other = getOtherUser(chat);
                                return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                            })
                            : chats;
                        if (filteredChats.length === 0) return (
                            <div style={{ textAlign: 'center', paddingTop: '60px', color: 'var(--color-text-muted)' }}>
                                <MessageCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                                <p>{searchQuery ? 'No results' : 'No conversations yet'}</p>
                            </div>
                        );
                        return filteredChats.map(chat => {
                        const other = getOtherUser(chat);
                        const isOnline = other?._id ? onlineUserIds.has(other._id) : false;
                        return (
                            <button key={chat._id} onClick={() => openChat(chat._id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                    textAlign: 'left', transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                                    onClick={e => { e.stopPropagation(); navigate(`/user/${other!._id}`); }}>
                                    {other?.photos?.[0] ? (
                                        <img src={other.photos[0]} alt={other?.name}
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            backgroundColor: 'var(--color-surface-3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-light)',
                                        }}>{other?.name?.[0] || '?'}</div>
                                    )}
                                    {isOnline && (
                                        <div style={{
                                            position: 'absolute', bottom: '1px', right: '1px',
                                            width: '11px', height: '11px', borderRadius: '50%',
                                            backgroundColor: 'var(--color-success)',
                                            border: '2px solid var(--color-surface)',
                                        }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>{other?.name || 'User'}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{timeAgo(chat.lastMessageAt)}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.lastMessage || 'Say hello!'}</p>
                                </div>
                            </button>
                        );
                    });
                    })()}
                </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)' }}>
                {activeChat ? (
                    <>
                        {/* Chat header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface-2)',
                        }}>
                            <button onClick={() => { setActiveChat(null); fetchChats(); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                <ArrowLeft size={20} strokeWidth={2} />
                            </button>
                            <div style={{ position: 'relative', cursor: 'pointer' }}
                                onClick={() => navigate(`/user/${otherUser!._id}`)}>
                                {otherUser?.photos?.[0] ? (
                                    <img src={otherUser.photos[0]} alt={otherUser?.name}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: 'var(--color-surface-3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-light)',
                                    }}>{otherUser?.name?.[0] || '?'}</div>
                                )}
                                {isOtherOnline && (
                                    <div style={{
                                        position: 'absolute', bottom: 0, right: 0,
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        backgroundColor: 'var(--color-success)',
                                        border: '2px solid var(--color-surface-2)',
                                    }} />
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>{otherUser?.name || 'Chat'}</p>
                                {typing ? (
                                    <p style={{ fontSize: '12px', color: 'var(--color-success)', fontStyle: 'italic' }}>typing...</p>
                                ) : (
                                    <p style={{ fontSize: '12px', color: isOtherOnline ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                        {isOtherOnline ? '● Online' : 'Offline'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {messages.map(msg => {
                                const isMe = getSenderId(msg) === user?._id;
                                const isImg = msg.type === 'image' && msg.imageUrl;
                                return (
                                    <motion.div key={msg._id}
                                        style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                        <div style={{
                                            maxWidth: '70%',
                                            backgroundColor: isImg ? 'transparent' : (isMe ? 'var(--color-primary)' : 'var(--color-surface-3)'),
                                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            padding: isImg ? '0' : '10px 14px',
                                            overflow: isImg ? 'hidden' : undefined,
                                        }}>
                                            {isImg ? (
                                                <img src={msg.imageUrl} alt="img" style={{ borderRadius: '16px', maxWidth: '280px', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
                                            ) : (
                                                <p style={{ fontSize: '14px', color: isMe ? '#fff' : 'var(--color-text)', lineHeight: 1.4 }}>{msg.content}</p>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px', gap: '2px' }}>
                                                <span style={{ fontSize: '10px', color: isMe ? 'rgba(255,255,255,0.5)' : 'var(--color-text-muted)' }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && renderTicks(msg)}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-end', gap: '8px',
                            padding: '12px 16px', borderTop: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface-2)',
                        }}>
                            <button onClick={() => fileInputRef.current?.click()}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                                <Camera size={20} strokeWidth={1.8} />
                            </button>
                            <input value={newMessage} onChange={e => handleTyping(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                placeholder="Message"
                                style={{
                                    flex: 1, padding: '10px 16px', borderRadius: '999px',
                                    backgroundColor: 'var(--color-surface-3)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text)', fontSize: '14px', outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                                <Smile size={20} strokeWidth={1.8} />
                            </button>
                            {uploading ? (
                                <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : (
                                <button onClick={sendMessage} disabled={!newMessage.trim()}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        backgroundColor: newMessage.trim() ? 'var(--color-primary)' : 'var(--color-surface-4)',
                                        border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background 0.2s',
                                    }}>
                                    <Send size={16} color="#fff" strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <MessageCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <p style={{ fontSize: '16px' }}>Select a conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
