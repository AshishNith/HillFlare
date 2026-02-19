import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { 
  Search, 
  MessageCircle, 
  ArrowLeft, 
  Camera, 
  Smile, 
  Send, 
  Loader2, 
  CheckCheck, 
  Check,
  Sparkles,
  Heart,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { GlassCard, Avatar, GlassInput, GradientButton } from '../components/ui';

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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/4 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }} />
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <div className="flex h-screen relative z-10">
                {/* Left Panel - Matches + Chat List */}
                <div className={`${
                    activeChat ? 'w-0 opacity-0 pointer-events-none' : 'w-full md:w-96'
                } transition-all duration-300 flex flex-col relative z-20`}>
                    <GlassCard className="flex-1 m-6 mr-3 p-0 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 pb-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Messages</h1>
                            </div>
                        </div>

                        {/* Matches Section */}
                        <AnimatePresence>
                            {matches.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="px-6 pb-6"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <Heart className="w-4 h-4 text-pink-400" />
                                        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                            New Matches
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {matches.map(chat => {
                                            const other = getOtherUser(chat);
                                            const isOnline = other?._id ? onlineUserIds.has(other._id) : false;
                                            
                                            return (
                                                <motion.button
                                                    key={chat._id}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => openChat(chat._id)}
                                                    className="flex flex-col items-center gap-2 min-w-[60px] group"
                                                >
                                                    <div className="relative">
                                                        <Avatar
                                                            src={other?.photos?.[0]}
                                                            name={other?.name || 'User'}
                                                            size="lg"
                                                            className="border-2 border-pink-400/30 group-hover:border-pink-400 transition-colors"
                                                            onClick={(e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                navigate(`/user/${other!._id}`);
                                                            }}
                                                        />
                                                        
                                                        {isOnline && (
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black/20" />
                                                        )}
                                                        
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                                                            <Sparkles className="w-3 h-3 text-white" />
                                                        </div>
                                                    </div>
                                                    
                                                    <span className="text-xs font-medium text-white/90 truncate max-w-[60px]">
                                                        {other?.name?.split(' ')[0] || 'User'}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Search */}
                        <div className="px-6 pb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto">
                            {(() => {
                                const filteredChats = searchQuery.trim()
                                    ? chats.filter(chat => {
                                        const other = getOtherUser(chat);
                                        return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                                    })
                                    : chats;

                                if (filteredChats.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center h-64 text-white/60">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                                <MessageCircle className="w-8 h-8 text-white/40" />
                                            </div>
                                            <p className="font-medium">
                                                {searchQuery ? 'No matches found' : 'No conversations yet'}
                                            </p>
                                            <p className="text-sm text-white/40 mt-1">
                                                {!searchQuery && 'Start swiping to find matches!'}
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-1 px-3 pb-6">
                                        {filteredChats.map((chat, index) => {
                                            const other = getOtherUser(chat);
                                            const isOnline = other?._id ? onlineUserIds.has(other._id) : false;
                                            
                                            return (
                                                <motion.button
                                                    key={chat._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => openChat(chat._id)}
                                                    className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all text-left group"
                                                >
                                                    <div className="relative">
                                                        <Avatar
                                                            src={other?.photos?.[0]}
                                                            name={other?.name || 'User'}
                                                            size="md"
                                                            onClick={(e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                navigate(`/user/${other!._id}`);
                                                            }}
                                                        />
                                                        
                                                        {isOnline && (
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black/20" />
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="font-semibold text-white truncate">
                                                                {other?.name || 'User'}
                                                            </h3>
                                                            <span className="text-xs text-white/50 ml-2 flex-shrink-0">
                                                                {timeAgo(chat.lastMessageAt)}
                                                            </span>
                                                        </div>
                                                        
                                                        <p className="text-sm text-white/60 truncate">
                                                            {chat.lastMessage || 'Say hello! 👋'}
                                                        </p>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </GlassCard>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col relative">
                    {activeChat ? (
                        <GlassCard className="flex-1 m-6 ml-3 p-0 overflow-hidden flex flex-col">
                            {/* Chat Header */}
                            <div className="flex items-center gap-4 p-6 border-b border-white/10">
                                <button
                                    onClick={() => { setActiveChat(null); fetchUser(); }}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-white" />
                                </button>
                                
                                <div
                                    className="flex items-center gap-3 cursor-pointer group"
                                    onClick={() => navigate(`/user/${otherUser!._id}`)}
                                >
                                    <div className="relative">
                                        <Avatar
                                            src={otherUser?.photos?.[0]}
                                            name={otherUser?.name || 'User'}
                                            size="md"
                                        />
                                        
                                        {isOtherOnline && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black/20" />
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h2 className="font-bold text-white group-hover:gradient-text transition-all">
                                            {otherUser?.name || 'Chat'}
                                        </h2>
                                        
                                        {typing ? (
                                            <div className="flex items-center gap-2 text-xs text-green-400">
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" />
                                                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                                typing...
                                            </div>
                                        ) : (
                                            <p className={`text-xs ${isOtherOnline ? 'text-green-400' : 'text-white/50'}`}>
                                                {isOtherOnline ? '● Online' : 'Offline'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="ml-auto">
                                    <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                        <Zap className="w-5 h-5 text-purple-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <AnimatePresence initial={false}>
                                    {messages.map(msg => {
                                        const isMe = getSenderId(msg) === user?._id;
                                        const isImg = msg.type === 'image' && msg.imageUrl;
                                        
                                        return (
                                            <motion.div
                                                key={msg._id}
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] ${isMe ? 'ml-12' : 'mr-12'}`}>
                                                    <div className={`
                                                        ${isImg ? 'p-0' : 'px-4 py-3'}
                                                        ${isMe 
                                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl rounded-br-md' 
                                                            : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl rounded-bl-md'
                                                        }
                                                        shadow-xl
                                                    `}>
                                                        {isImg ? (
                                                            <img
                                                                src={msg.imageUrl}
                                                                alt="Shared image"
                                                                className="rounded-2xl max-w-[280px] max-h-[300px] object-cover"
                                                            />
                                                        ) : (
                                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-xs text-white/50">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {isMe && renderTicks(msg)}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-6 border-t border-white/10">
                                <div className="flex items-end gap-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                    >
                                        <Camera className="w-5 h-5 text-white/60" />
                                    </button>
                                    
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => handleTyping(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                            placeholder="Type a message..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 backdrop-blur-sm"
                                        />
                                    </div>
                                    
                                    <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                        <Smile className="w-5 h-5 text-white/60" />
                                    </button>
                                    
                                    {uploading ? (
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim()}
                                            className={`
                                                w-10 h-10 rounded-xl flex items-center justify-center transition-all
                                                ${newMessage.trim() 
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg' 
                                                    : 'bg-white/5 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            <Send className={`w-4 h-4 ${newMessage.trim() ? 'text-white' : 'text-white/40'}`} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                                    <MessageCircle className="w-12 h-12 text-white/40" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                                <p className="text-white/60">Choose from your matches to start chatting</p>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
