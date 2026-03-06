import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { apiService, API_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { ChatSidebar } from '../components/ChatSidebar';

interface Message {
  _id: string;
  senderId: string;
  body?: string;
  type?: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  seenBy?: string[];
  createdAt: string;
}

interface OtherUser {
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface ChatItem {
  _id: string;
  otherUser: { email: string; name?: string; avatarUrl?: string };
  lastMessage?: string;
  lastMessageType?: 'text' | 'image' | 'voice';
  lastMessageAt?: string;
  unreadCount?: number;
}

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const shouldShowDateSeparator = (current: Message, previous?: Message) => {
  if (!previous) return true;
  const curDate = new Date(current.createdAt).toDateString();
  const prevDate = new Date(previous.createdAt).toDateString();
  return curDate !== prevDate;
};

const ChatThreadPage: React.FC = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const authUserId = useAuthStore((state) => state.userId);
  const routeOtherUser = (location.state as { otherUser?: OtherUser } | undefined)?.otherUser;
  const [otherUser, setOtherUser] = useState<OtherUser | undefined>(routeOtherUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [showActions, setShowActions] = useState(false);
  // Sidebar state
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [sidebarSearch, setSidebarSearch] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  const displayName = otherUser?.name || otherUser?.email || 'Chat';

  const sortedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    if (!chatId) return;

    // Reset thread state for new chat
    setMessages([]);
    setLoading(true);
    setNextCursor(null);
    setIsTyping(false);
    setShowActions(false);
    setIsOnline(false);

    // Update otherUser from route state or resolve from API
    const stateOtherUser = (location.state as { otherUser?: OtherUser } | undefined)?.otherUser;
    if (stateOtherUser) {
      setOtherUser(stateOtherUser);
    } else {
      resolveOtherUser();
    }

    loadMessages();
    setupSocket();
    loadChats();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [chatId]);

  // Close actions dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [sortedMessages.length]);

  const loadChats = async () => {
    try {
      const data = await apiService.getChats();
      setChats(data.items || []);
    } catch { /* ignore */ } finally {
      setChatsLoading(false);
    }
  };

  const setupSocket = () => {
    if (!chatId || socketRef.current) return;
    const token = localStorage.getItem('auth_token');
    const socket = io(API_URL, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (authUserId) {
        socket.emit('user:register', authUserId);
      }
      socket.emit('chat:join', chatId);
    });

    // Online tracking for sidebar + thread header
    socket.on('user:onlineList', (payload: { userIds: string[] }) => {
      setOnlineUsers(new Set(payload.userIds));
      if (otherUser?.email && payload.userIds.includes(otherUser.email)) {
        setIsOnline(true);
      }
    });

    socket.on('user:online', (payload: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(payload.userId));
      if (payload.userId === otherUser?.email) setIsOnline(true);
    });

    socket.on('user:offline', (payload: { userId: string }) => {
      setOnlineUsers((prev) => { const n = new Set(prev); n.delete(payload.userId); return n; });
      if (payload.userId === otherUser?.email) setIsOnline(false);
    });

    // Sidebar refresh on new messages
    socket.on('chats:update', () => loadChats());

    socket.on('chat:message', (payload: { chatId: string; message: Message }) => {
      if (payload.chatId !== chatId) return;
      if (payload.message.senderId === authUserId) return;
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === payload.message._id)) return prev;
        return [...prev, payload.message];
      });
      if (payload.message.senderId !== authUserId) {
        apiService.markChatRead(chatId);
      }
    });

    socket.on('chat:typing', (payload: { chatId: string; userId: string }) => {
      if (payload.chatId !== chatId || payload.userId === authUserId) return;
      setIsTyping(true);
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = window.setTimeout(() => setIsTyping(false), 1500);
    });

    socket.on('chat:seen', (payload: { chatId: string; userId: string }) => {
      if (payload.chatId !== chatId) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === authUserId
            ? { ...msg, seenBy: Array.from(new Set([...(msg.seenBy || []), payload.userId])) }
            : msg
        )
      );
    });
  };

  const resolveOtherUser = async () => {
    if (!chatId) return;
    try {
      const data = await apiService.getChats();
      const chat = (data.items || []).find((item: any) => item._id === chatId);
      if (chat?.otherUser) {
        setOtherUser(chat.otherUser);
      }
    } catch (error) {
      console.error('Failed to resolve chat participant');
    }
  };

  const loadMessages = async (cursor?: string | null) => {
    if (!chatId) return;
    try {
      const data = await apiService.getMessages(chatId, {
        cursor: cursor || undefined,
        limit: 30,
      });
      const page: Message[] = data.items || [];
      if (!cursor) {
        setMessages(page);
        if (page.some((msg) => msg.senderId !== authUserId)) {
          apiService.markChatRead(chatId);
        }
      } else {
        setMessages((prev) => [...page, ...prev]);
      }
      setNextCursor(data.nextCursor || null);
    } catch (error) {
      console.error('Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    loadMessages(nextCursor);
  };

  const sendMessage = async () => {
    if (!chatId || !newMessage.trim()) return;
    const temp: Message = {
      _id: `temp-${Date.now()}`,
      senderId: authUserId || '',
      body: newMessage.trim(),
      type: 'text',
      seenBy: [authUserId || ''],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    setNewMessage('');

    try {
      const sent = await apiService.sendMessage(chatId, temp.body || '', 'text');
      setMessages((prev) => prev.map((msg) => (msg._id === temp._id ? sent.data : msg)));
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg._id !== temp._id));
    }
  };

  const sendImage = async (file: File) => {
    if (!chatId) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;

      const temp: Message = {
        _id: `temp-${Date.now()}`,
        senderId: authUserId || '',
        type: 'image',
        mediaUrl: dataUrl,
        seenBy: [authUserId || ''],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, temp]);

      try {
        const sent = await apiService.sendMessage(chatId, '', 'image', dataUrl);
        setMessages((prev) => prev.map((msg) => (msg._id === temp._id ? sent.data : msg)));
      } catch (error) {
        setMessages((prev) => prev.filter((msg) => msg._id !== temp._id));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!chatId || !authUserId) return;
    socketRef.current?.emit('chat:typing', { chatId, userId: authUserId });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChatAction = async (action: 'report' | 'block' | 'unmatch') => {
    if (!otherUser?.email) return;
    if (action === 'report') {
      await apiService.reportUser(otherUser.email, 'inappropriate');
      alert('Report submitted');
      return;
    }
    if (action === 'block') {
      await apiService.blockUser(otherUser.email, 'user_block');
      navigate('/app/chats');
      return;
    }
    await apiService.unmatchUser(otherUser.email);
    navigate('/app/chats');
  };

  const getDeliveryStatus = (msg: Message) => {
    if (msg._id.startsWith('temp-')) return '⏳';
    if (msg.seenBy && msg.seenBy.includes(otherUser?.email || '')) return '✓✓';
    return '✓';
  };

  return (
    <div className="flex h-screen flex-col bg-hf-bg">
      {/* Image preview lightbox */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setImagePreview(null)}
        >
          <button
            onClick={() => setImagePreview(null)}
            className="absolute right-6 top-6 rounded-full bg-white/20 p-2 text-white"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Compact top nav */}
      <header className="flex-shrink-0 border-b border-hf-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-3">
          <Link to="/app" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="c-fg" x1="14" y1="4" x2="34" y2="44"><stop stopColor="#F07A83" /><stop offset="1" stopColor="#E8525E" /></linearGradient>
              </defs>
              <path d="M24 3C19 3 12 9 12 20c0 7 3.5 11.5 6 15 2.5 3.5 6 10 6 10s3.5-6.5 6-10c2.5-3.5 6-8 6-15C36 9 29 3 24 3z" fill="url(#c-fg)" />
            </svg>
            <span className="text-lg font-bold text-hf-charcoal">HillFlare</span>
          </Link>
          <nav className="hidden gap-5 md:flex">
            <Link to="/app" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Dashboard</Link>
            <Link to="/app/discover" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Discover</Link>
            <Link to="/app/matches" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Matches</Link>
            <Link to="/app/crushes" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Crushes</Link>
            <Link to="/app/chats" className="text-sm font-semibold text-hf-accent">Chats</Link>
            <Link to="/app/notifications" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Notifications</Link>
            <Link to="/app/profile" className="text-sm text-hf-muted transition hover:text-hf-charcoal">Profile</Link>
          </nav>
        </div>
      </header>

      {/* Main split area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[380px] flex-shrink-0">
          <ChatSidebar
            chats={chats}
            loading={chatsLoading}
            activeChatId={chatId}
            onlineUsers={onlineUsers}
            searchQuery={sidebarSearch}
            onSearchChange={setSidebarSearch}
          />
        </div>

        {/* Right: thread panel */}
        <div className="flex flex-1 flex-col bg-white">
          {/* Thread header */}
          <div className="flex items-center justify-between border-b border-hf-border px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-hf-accent/10">
                {otherUser?.avatarUrl ? (
                  <img src={otherUser.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-hf-accent">
                    {(otherUser?.name || otherUser?.email || '?')[0].toUpperCase()}
                  </div>
                )}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-hf-charcoal">{displayName}</p>
                {isTyping ? (
                  <p className="text-xs text-hf-accent animate-pulse">typing...</p>
                ) : isOnline ? (
                  <p className="text-xs text-green-500">online</p>
                ) : (
                  <p className="text-xs text-hf-muted">offline</p>
                )}
              </div>
            </div>

            {/* Actions dropdown */}
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setShowActions((p) => !p)}
                className="rounded-full p-2 text-hf-muted transition hover:bg-hf-bg hover:text-hf-charcoal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
              </button>
              {showActions && (
                <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-xl border border-hf-border bg-white py-1 shadow-lg">
                  <button
                    onClick={() => { setShowActions(false); handleChatAction('report'); }}
                    className="w-full px-4 py-2 text-left text-sm text-hf-charcoal hover:bg-hf-bg"
                  >
                    Report
                  </button>
                  <button
                    onClick={() => { setShowActions(false); handleChatAction('block'); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Block
                  </button>
                  <button
                    onClick={() => { setShowActions(false); handleChatAction('unmatch'); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Unmatch
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="relative flex flex-1 flex-col overflow-hidden">
            {nextCursor && (
              <div className="border-b border-hf-border bg-white px-6 py-2 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs font-semibold text-hf-accent disabled:text-hf-muted"
                >
                  {loadingMore ? 'Loading...' : '↑ Load older messages'}
                </button>
              </div>
            )}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-hf-muted">Loading messages...</p>
                </div>
              ) : sortedMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-hf-muted">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-hf-accent/10">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  </div>
                  <p className="font-semibold text-hf-charcoal">No messages yet</p>
                  <p className="mt-1 text-sm">Say hi to start the conversation!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {sortedMessages.map((msg, idx) => {
                    const isMine = msg.senderId === authUserId;
                    const showDate = shouldShowDateSeparator(msg, sortedMessages[idx - 1]);
                    return (
                      <React.Fragment key={msg._id}>
                        {showDate && (
                          <div className="my-3 flex items-center gap-3">
                            <div className="flex-1 border-t border-hf-border" />
                            <span className="rounded-full bg-hf-bg px-3 py-1 text-xs font-medium text-hf-muted">{formatDate(msg.createdAt)}</span>
                            <div className="flex-1 border-t border-hf-border" />
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[60%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? 'bg-hf-accent text-white rounded-br-md'
                                : 'bg-hf-bg text-hf-charcoal rounded-bl-md'
                            }`}
                          >
                            {msg.type === 'image' && msg.mediaUrl ? (
                              <img
                                src={msg.mediaUrl}
                                alt="Shared"
                                className="max-h-56 cursor-pointer rounded-xl"
                                onClick={() => setImagePreview(msg.mediaUrl || null)}
                              />
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                            )}
                            <div className={`mt-1 flex items-center gap-1 text-[11px] ${isMine ? 'justify-end text-white/60' : 'text-hf-muted'}`}>
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMine && <span className="ml-0.5">{getDeliveryStatus(msg)}</span>}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-hf-border bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center justify-center rounded-full p-2 text-hf-muted transition hover:bg-hf-bg hover:text-hf-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) sendImage(file);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
              <input
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-hf-border bg-hf-bg px-4 py-2.5 text-sm text-hf-charcoal placeholder:text-hf-muted focus:border-hf-accent focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="flex items-center justify-center rounded-full bg-hf-accent p-2.5 text-white transition hover:bg-hf-accent/90 disabled:opacity-40"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatThreadPage;
