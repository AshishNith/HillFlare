import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface ChatItem {
    _id: string;
    participants: { _id: string; name: string; avatar: string }[];
    lastMessage: string;
    lastMessageAt: string;
}

interface Message {
    _id: string;
    chatId: string;
    sender: { _id: string; name: string; avatar: string } | string;
    content: string;
    type?: 'text' | 'image';
    imageUrl?: string;
    status?: 'sent' | 'delivered' | 'read';
    seen?: boolean;
    timestamp: string;
}

export default function ChatPage() {
    const [chats, setChats] = useState<ChatItem[]>([]);
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
        const s = io(window.location.origin, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });
        socketRef.current = s;

        s.on('connect', () => console.log('Chat socket connected'));
        s.on('connect_error', (err) => console.error('Chat socket error:', err.message));

        // Online status
        s.on('online_users', (userIds: string[]) => setOnlineUserIds(new Set(userIds)));
        s.on('user_online', ({ userId: uid }) => {
            setOnlineUserIds((prev) => new Set(prev).add(uid));
        });
        s.on('user_offline', ({ userId: uid }) => {
            setOnlineUserIds((prev) => { const n = new Set(prev); n.delete(uid); return n; });
        });

        // Messages
        s.on('new_message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        // Message status (delivered)
        s.on('message_status_update', ({ messageId, status }: { messageId: string; status: string }) => {
            setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, status: status as Message['status'] } : m));
        });

        // Messages read (blue ticks)
        s.on('messages_read', ({ chatId }: { chatId: string }) => {
            setMessages((prev) => prev.map((m) => {
                const sid = typeof m.sender === 'string' ? m.sender : m.sender._id;
                return m.chatId === chatId && sid === user?._id ? { ...m, status: 'read' } : m;
            }));
        });

        // Typing
        s.on('user_typing', ({ isTyping }) => setTyping(isTyping));

        fetchChats();
        return () => { s.disconnect(); };
    }, []);

    const fetchChats = async () => {
        try {
            const { data } = await api.get('/chats');
            setChats(data.data || []);
        } catch { }
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
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('typing', { chatId: activeChat, isTyping: false });
        }, 3000);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64 = reader.result as string;
                await api.post(`/chats/${activeChat}/image`, { image: base64 });
                // Server will emit via socket
            } catch (err) {
                console.error('Image upload error:', err);
            }
            setUploading(false);
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // reset input
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const getOtherUser = (chat: ChatItem) => {
        return chat.participants.find((p) => p._id !== user?._id) || chat.participants[0];
    };

    const getSenderId = (msg: Message) => typeof msg.sender === 'string' ? msg.sender : msg.sender._id;

    const renderTicks = (msg: Message) => {
        const status = msg.status || (msg.seen ? 'read' : 'sent');
        if (status === 'read') return <span className="text-[10px] text-blue-400 ml-1">✓✓</span>;
        if (status === 'delivered') return <span className="text-[10px] opacity-50 ml-1">✓✓</span>;
        return <span className="text-[10px] opacity-50 ml-1">✓</span>;
    };

    return (
        <div className="flex h-screen lg:h-[calc(100vh-0px)]">
            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
            />

            {/* Chat list */}
            <div className={`${activeChat ? 'hidden md:block' : ''} w-full md:w-80 lg:w-96 glass-strong border-r border-primary/10 flex flex-col`}>
                <div className="p-6 border-b border-primary/10">
                    <h1 className="text-xl font-bold"><span className="text-gradient">Messages</span></h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.length === 0 ? (
                        <div className="text-center py-20 text-text-muted">
                            <div className="text-4xl mb-3">💬</div>
                            <p>No conversations yet</p>
                            <p className="text-sm">Match with someone to start chatting!</p>
                        </div>
                    ) : (
                        chats.map((chat) => {
                            const other = getOtherUser(chat);
                            const isOnline = other?._id ? onlineUserIds.has(other._id) : false;
                            return (
                                <button key={chat._id} onClick={() => openChat(chat._id)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-surface-3 transition-all text-left ${activeChat === chat._id ? 'bg-primary/10' : ''
                                        }`}>
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary-light">
                                            {other?.name?.[0] || '?'}
                                        </div>
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-surface" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{other?.name || 'User'}</p>
                                        <p className="text-text-muted text-xs truncate">{chat.lastMessage || 'Say hello!'}</p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className={`${activeChat ? '' : 'hidden md:flex'} flex-1 flex flex-col`}>
                {activeChat ? (
                    <>
                        {/* Header */}
                        {(() => {
                            const otherUser = chats.find((c) => c._id === activeChat)?.participants.find((p) => p._id !== user?._id);
                            const isOnline = otherUser?._id ? onlineUserIds.has(otherUser._id) : false;
                            return (
                                <div className="p-4 glass-strong border-b border-primary/10 flex items-center gap-3">
                                    <button onClick={() => { setActiveChat(null); fetchChats(); }} className="md:hidden text-text-muted hover:text-text text-xl">
                                        ←
                                    </button>
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light">
                                            {otherUser?.name?.[0] || '?'}
                                        </div>
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-surface" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{otherUser?.name || 'User'}</p>
                                        {typing ? (
                                            <p className="text-xs text-green-400 italic">typing...</p>
                                        ) : (
                                            <p className="text-xs text-text-muted">{isOnline ? 'Online' : 'Offline'}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {messages.map((msg) => {
                                const isMe = getSenderId(msg) === user?._id;
                                const isImage = msg.type === 'image' && msg.imageUrl;
                                return (
                                    <motion.div key={msg._id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}>
                                        <div className={`max-w-xs lg:max-w-md rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-md' : 'glass rounded-bl-md'
                                            } ${isImage ? 'p-1' : 'px-4 py-2.5'}`}>
                                            {isImage ? (
                                                <img src={msg.imageUrl} alt="Shared image" className="rounded-xl max-w-[280px] max-h-[300px] object-cover" />
                                            ) : (
                                                <p className="text-sm">{msg.content}</p>
                                            )}
                                            <div className={`flex items-center gap-1 ${isImage ? 'px-2 pb-1' : ''} mt-1 justify-end`}>
                                                <span className="text-[10px] opacity-60">
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
                        <div className="p-4 glass-strong border-t border-primary/10">
                            <div className="flex gap-2 items-end">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 rounded-xl hover:bg-surface-3 transition-colors text-text-muted hover:text-text"
                                    title="Send image"
                                >
                                    📷
                                </button>
                                <input type="text" value={newMessage}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-5 py-3 rounded-xl bg-surface-3 border border-primary/10 text-text placeholder-text-muted/50 focus:border-primary/40 focus:outline-none text-sm" />
                                {uploading ? (
                                    <div className="px-5 py-3 text-text-muted animate-spin">⏳</div>
                                ) : (
                                    <button onClick={sendMessage} disabled={!newMessage.trim()}
                                        className="btn-primary px-5 py-3 disabled:opacity-50">
                                        ➤
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-text-muted">
                        <div className="text-center">
                            <div className="text-5xl mb-4">💬</div>
                            <p>Select a conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
