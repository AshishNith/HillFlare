import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Dimensions } from 'react-native';
import { io, Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import api, { BASE_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatScreen() {
    const [chats, setChats] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [typingUserId, setTypingUserId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        fetchChats();
        initSocket();
        return () => { socketRef.current?.disconnect(); };
    }, []);

    const initSocket = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        const s = io(BASE_URL, {
            auth: { token },
            transports: ['websocket'],
        });
        socketRef.current = s;

        s.on('connect', () => console.log('Socket connected'));
        s.on('connect_error', (err: any) => console.log('Socket error:', err.message));

        // Online status
        s.on('online_users', (userIds: string[]) => setOnlineUserIds(new Set(userIds)));
        s.on('user_online', ({ userId: uid }: { userId: string }) => {
            setOnlineUserIds((prev) => new Set(prev).add(uid));
        });
        s.on('user_offline', ({ userId: uid }: { userId: string }) => {
            setOnlineUserIds((prev) => { const n = new Set(prev); n.delete(uid); return n; });
        });

        // Messages
        s.on('new_message', (msg: any) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Message status updates (delivered)
        s.on('message_status_update', ({ messageId, status }: { messageId: string; status: string }) => {
            setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, status } : m));
        });

        // Messages read (blue ticks)
        s.on('messages_read', ({ chatId }: { chatId: string }) => {
            setMessages((prev) => prev.map((m) =>
                m.chatId === chatId && (typeof m.sender === 'string' ? m.sender : m.sender?._id) === user?._id
                    ? { ...m, status: 'read' } : m
            ));
        });

        // Typing
        s.on('user_typing', ({ userId: uid, isTyping }: { userId: string; isTyping: boolean }) => {
            setTypingUserId(isTyping ? uid : null);
        });
    };

    const fetchChats = async () => {
        try { const { data } = await api.get('/chats'); setChats(data.data || []); } catch { }
    };

    const openChat = async (chatId: string) => {
        setActiveChat(chatId);
        socketRef.current?.emit('join_chat', chatId);
        try {
            const { data } = await api.get(`/chats/${chatId}/messages`);
            setMessages(data.data || []);
            // Mark as read
            await api.put(`/chats/${chatId}/seen`);
            socketRef.current?.emit('mark_seen', { chatId });
        } catch { }
    };

    const goBack = () => {
        if (activeChat) {
            socketRef.current?.emit('leave_chat', activeChat);
            socketRef.current?.emit('typing', { chatId: activeChat, isTyping: false });
        }
        setActiveChat(null);
        setMessages([]);
        setTypingUserId(null);
        fetchChats();
    };

    const send = () => {
        if (!text.trim() || !activeChat) return;
        socketRef.current?.emit('send_message', { chatId: activeChat, content: text.trim() });
        setText('');
        socketRef.current?.emit('typing', { chatId: activeChat, isTyping: false });
    };

    const handleTextChange = (value: string) => {
        setText(value);
        if (activeChat) {
            socketRef.current?.emit('typing', { chatId: activeChat, isTyping: value.length > 0 });
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('typing', { chatId: activeChat, isTyping: false });
            }, 3000);
        }
    };

    const pickImage = async (fromCamera: boolean) => {
        if (!activeChat) return;

        const permission = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = fromCamera
            ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, allowsEditing: true })
            : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, allowsEditing: true, mediaTypes: ['images'] });

        if (result.canceled || !result.assets?.[0]?.base64) return;

        setUploading(true);
        try {
            const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
            const { data } = await api.post(`/chats/${activeChat}/image`, { image: base64 });
            if (data.data) {
                // The server will emit the message via socket
            }
        } catch (err) {
            console.log('Image upload error:', err);
        }
        setUploading(false);
    };

    const getOther = (chat: any) => chat.participants?.find((p: any) => p._id !== user?._id) || {};
    const getSenderId = (msg: any) => typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;

    const renderTicks = (msg: any) => {
        const status = msg.status || (msg.seen ? 'read' : 'sent');
        if (status === 'read') return <Text style={styles.tickBlue}>✓✓</Text>;
        if (status === 'delivered') return <Text style={styles.tickGray}>✓✓</Text>;
        return <Text style={styles.tickGray}>✓</Text>;
    };

    // ===== Active Chat View =====
    if (activeChat) {
        const otherUser = chats.find((c) => c._id === activeChat)?.participants?.find((p: any) => p._id !== user?._id);
        const isOtherOnline = otherUser ? onlineUserIds.has(otherUser._id) : false;

        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.chatHeader}>
                    <TouchableOpacity onPress={goBack} style={styles.backBtnTouch}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.headerInitial}>{otherUser?.name?.[0] || '?'}</Text>
                        {isOtherOnline && <View style={styles.onlineDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.chatTitle}>{otherUser?.name || 'Chat'}</Text>
                        {typingUserId ? (
                            <Text style={styles.typingText}>typing...</Text>
                        ) : (
                            <Text style={styles.statusText}>{isOtherOnline ? 'Online' : 'Offline'}</Text>
                        )}
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, idx) => item._id || `msg-${idx}`}
                    contentContainerStyle={{ padding: 12, paddingBottom: 4 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    renderItem={({ item }) => {
                        const isMe = getSenderId(item) === user?._id;
                        const isImage = item.type === 'image' && item.imageUrl;
                        return (
                            <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                                <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.theirMsg, isImage && styles.imgBubble]}>
                                    {isImage ? (
                                        <Image source={{ uri: item.imageUrl }} style={styles.chatImage} resizeMode="cover" />
                                    ) : (
                                        <Text style={[styles.msgText, isMe && styles.myMsgText]}>{item.content}</Text>
                                    )}
                                    <View style={styles.msgMeta}>
                                        <Text style={[styles.msgTime, isMe && styles.myMsgTime]}>
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        {isMe && renderTicks(item)}
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />

                {/* Input Row */}
                <View style={styles.inputRow}>
                    <TouchableOpacity style={styles.attachBtn} onPress={() => pickImage(false)}>
                        <Text style={styles.attachText}>🖼️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachBtn} onPress={() => pickImage(true)}>
                        <Text style={styles.attachText}>📷</Text>
                    </TouchableOpacity>
                    <TextInput
                        style={styles.msgInput}
                        value={text}
                        onChangeText={handleTextChange}
                        placeholder="Message..."
                        placeholderTextColor={theme.colors.textMuted}
                        multiline
                    />
                    {uploading ? (
                        <ActivityIndicator color={theme.colors.primary} style={{ marginHorizontal: 12 }} />
                    ) : (
                        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={!text.trim()}>
                            <Text style={styles.sendText}>➤</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        );
    }

    // ===== Chat List View =====
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Messages</Text>
            <FlatList
                data={chats}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingHorizontal: 0 }}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 16 }}>No conversations yet</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 4 }}>Match with someone to start chatting!</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const other = getOther(item);
                    const isOnline = other._id ? onlineUserIds.has(other._id) : false;
                    return (
                        <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item._id)}>
                            <View style={styles.chatAvatarWrap}>
                                <View style={styles.chatAvatar}>
                                    <Text style={styles.chatInitial}>{other.name?.[0] || '?'}</Text>
                                </View>
                                {isOnline && <View style={styles.listOnlineDot} />}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.chatName}>{other.name || 'User'}</Text>
                                <Text style={styles.chatLast} numberOfLines={1}>{item.lastMessage || 'Say hi!'}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, padding: 24, paddingBottom: 8 },

    // Chat list
    chatItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    chatAvatarWrap: { position: 'relative' },
    chatAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(139,92,246,0.2)', justifyContent: 'center', alignItems: 'center' },
    chatInitial: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primaryLight },
    chatName: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    chatLast: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
    listOnlineDot: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: theme.colors.surface },

    // Chat header
    chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backBtnTouch: { padding: 4 },
    backBtn: { fontSize: 24, color: theme.colors.text },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139,92,246,0.2)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    headerInitial: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primaryLight },
    onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: theme.colors.surface },
    chatTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    typingText: { fontSize: 12, color: '#22C55E', fontStyle: 'italic' },
    statusText: { fontSize: 12, color: theme.colors.textMuted },

    // Messages
    msgRow: { flexDirection: 'row', marginBottom: 6 },
    msgRowMe: { justifyContent: 'flex-end' },
    msgBubble: { maxWidth: '78%', padding: 10, paddingBottom: 4, borderRadius: 16 },
    imgBubble: { padding: 4, paddingBottom: 4 },
    myMsg: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
    theirMsg: { backgroundColor: theme.colors.surface2, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
    msgText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
    myMsgText: { color: '#fff' },
    chatImage: { width: SCREEN_WIDTH * 0.55, height: SCREEN_WIDTH * 0.55 * 0.75, borderRadius: 12 },
    msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 },
    msgTime: { fontSize: 10, color: theme.colors.textMuted, opacity: 0.7 },
    myMsgTime: { color: 'rgba(255,255,255,0.6)' },
    tickGray: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
    tickBlue: { fontSize: 10, color: '#60A5FA' },

    // Input
    inputRow: { flexDirection: 'row', padding: 8, gap: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'flex-end' },
    attachBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    attachText: { fontSize: 20 },
    msgInput: { flex: 1, backgroundColor: theme.colors.surface3, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: theme.colors.text, fontSize: 14, maxHeight: 100 },
    sendBtn: { backgroundColor: theme.colors.primary, borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    sendText: { color: '#fff', fontSize: 16 },
});
