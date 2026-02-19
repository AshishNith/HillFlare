import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, Image,
    ActivityIndicator, Dimensions, FlatList, BackHandler
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import api, { BASE_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { chatId, otherUser } = route.params; // Expecting these params

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [isOnline, setIsOnline] = useState(false); // Simplified tracking for specific user
    const [typingUserId, setTypingUserId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        initSocket();
        loadMessages();
        return () => {
            socketRef.current?.emit('leave_chat', chatId);
            socketRef.current?.emit('typing', { chatId, isTyping: false });
            socketRef.current?.disconnect();
        };
    }, [chatId]);

    const initSocket = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        const s = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
        socketRef.current = s;

        s.on('connect', () => {
            console.log('Socket connected (Detail)');
            s.emit('join_chat', chatId);
        });

        // Listen for specific user status
        s.on('user_online', ({ userId }: any) => {
            if (userId === otherUser._id) setIsOnline(true);
        });
        s.on('user_offline', ({ userId }: any) => {
            if (userId === otherUser._id) setIsOnline(false);
        });

        // Initial online check? (Might need a way to check if user is already online)
        // For now, we rely on updates or parent passing status. 
        // Or we can emit an event to check status.

        s.on('new_message', (msg: any) => {
            if (msg.chatId === chatId) {
                setMessages(p => [...p, msg]);
                if ((typeof msg.sender === 'string' ? msg.sender : msg.sender?._id) !== user?._id) {
                    s.emit('mark_seen', { chatId });
                    api.put(`/chats/${chatId}/seen`).catch(() => { });
                }
            }
        });

        s.on('message_status_update', ({ messageId, status }: any) =>
            setMessages(p => p.map(m => m._id === messageId ? { ...m, status } : m)));

        s.on('messages_read', ({ chatId: updatedChatId }: any) => {
            if (updatedChatId === chatId) {
                setMessages(p => p.map(m =>
                    (typeof m.sender === 'string' ? m.sender : m.sender?._id) === user?._id
                        ? { ...m, status: 'read' } : m));
            }
        });

        s.on('user_typing', ({ userId: uid, isTyping }: any) => {
            if (uid === otherUser._id) setTypingUserId(isTyping ? uid : null);
        });
    };

    const loadMessages = async () => {
        try {
            const { data } = await api.get(`/chats/${chatId}/messages`);
            setMessages(data.data || []);
            // Mark as seen
            await api.put(`/chats/${chatId}/seen`);
            socketRef.current?.emit('mark_seen', { chatId });
        } catch { }
    };

    const send = () => {
        if (!text.trim()) return;
        socketRef.current?.emit('send_message', { chatId, content: text.trim() });
        setText('');
        socketRef.current?.emit('typing', { chatId, isTyping: false });
    };

    const handleTextChange = (value: string) => {
        setText(value);
        socketRef.current?.emit('typing', { chatId, isTyping: value.length > 0 });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() =>
            socketRef.current?.emit('typing', { chatId, isTyping: false }), 3000);
    };

    const pickImage = async (fromCamera: boolean) => {
        const perm = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        const result = fromCamera
            ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
            : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ['images'] });
        if (result.canceled || !result.assets?.[0]?.base64) return;

        setUploading(true);
        try {
            await api.post(`/chats/${chatId}/image`, { image: `data:image/jpeg;base64,${result.assets[0].base64}` });
        } catch { }
        setUploading(false);
    };

    const getSenderId = (msg: any) => typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;

    const renderTicks = (msg: any) => {
        const st = msg.status || (msg.seen ? 'read' : 'sent');
        if (st === 'read') return <Ionicons name="checkmark-done" size={12} color="#60A5FA" />;
        if (st === 'delivered') return <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.4)" />;
        return <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.4)" />;
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
            {/* Header */}
            <View style={s.chatHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backTouch}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={s.chatHeaderCenter}>
                    <View style={s.chatAvatarWrap}>
                        <TouchableOpacity style={s.chatHeaderAvatar} onPress={() => navigation.navigate('UserProfile', { userId: otherUser._id })}>
                            {otherUser?.photos?.[0] ? (
                                <Image source={{ uri: otherUser.photos[0] }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                            ) : (
                                <Text style={s.chatHeaderInitial}>{otherUser?.name?.[0] || '?'}</Text>
                            )}
                        </TouchableOpacity>
                        {/* We rely on passed 'isOnline' usually, but here we can try to track it if socket sends initial state */}
                    </View>
                    <View>
                        <Text style={s.chatHeaderName}>{otherUser?.name || 'Chat'}</Text>
                        {typingUserId ? (
                            <Text style={s.typingText}>typing...</Text>
                        ) : (
                            // Simplified online check. real-time sync across screens is tricky without global store/socket
                            // We'll just hide it or assume offline initially if we don't have accurate data
                            <Text style={s.onlineText}>{isOnline ? '● Online' : ''}</Text>
                        )}
                    </View>
                </View>
                {/* Placeholder for balance */}
                <View style={{ width: 36 }} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, idx) => item._id || `${idx}`}
                contentContainerStyle={{ padding: 16, gap: 6 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                renderItem={({ item }) => {
                    const isMe = getSenderId(item) === user?._id;
                    const isImg = item.type === 'image' && item.imageUrl;
                    return (
                        <View style={[s.msgRow, isMe && s.msgRowMe]}>
                            <View style={[
                                isImg ? s.imgBubble : (isMe ? s.sentBubble : s.recvBubble)
                            ]}>
                                {isImg ? (
                                    <Image source={{ uri: item.imageUrl }} style={s.chatImage} resizeMode="cover" />
                                ) : (
                                    <Text style={[s.msgText, isMe && s.msgTextMe]}>{item.content}</Text>
                                )}
                                <View style={s.msgMeta}>
                                    <Text style={[s.msgTime, isMe && s.msgTimeMe]}>
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    {isMe && renderTicks(item)}
                                </View>
                            </View>
                        </View>
                    );
                }}
            />

            {/* Input */}
            <View style={s.inputRow}>
                <TouchableOpacity style={s.attachBtn} onPress={() => pickImage(false)}>
                    <Ionicons name="image-outline" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={s.attachBtn} onPress={() => pickImage(true)}>
                    <Ionicons name="camera-outline" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <TextInput
                    style={s.msgInput}
                    value={text}
                    onChangeText={handleTextChange}
                    placeholder="Message..."
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                />
                {uploading ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginHorizontal: 10 }} />
                ) : (
                    <TouchableOpacity style={s.sendBtn} onPress={send} disabled={!text.trim()}>
                        <Ionicons name="send" size={18} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    chatHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        gap: 12, backgroundColor: theme.colors.surface2
    },
    backTouch: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    chatHeaderCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    chatAvatarWrap: { position: 'relative' },
    chatHeaderAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: theme.colors.surface3,
        justifyContent: 'center', alignItems: 'center',
    },
    chatHeaderInitial: { fontSize: 16, fontWeight: '700', color: theme.colors.primaryLight },
    onlineDotSmall: {
        position: 'absolute', bottom: 0, right: 0,
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: theme.colors.success,
        borderWidth: 2, borderColor: theme.colors.surface,
    },
    chatHeaderName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    typingText: { fontSize: 12, color: theme.colors.success, fontStyle: 'italic' },
    onlineText: { fontSize: 12, color: theme.colors.textMuted },

    msgRow: { flexDirection: 'row' },
    msgRowMe: { justifyContent: 'flex-end' },
    sentBubble: {
        backgroundColor: theme.colors.primary,
        borderRadius: 20, borderBottomRightRadius: 4,
        padding: 12, maxWidth: '75%',
    },
    recvBubble: {
        backgroundColor: theme.colors.surface3,
        borderRadius: 20, borderBottomLeftRadius: 4,
        padding: 12, maxWidth: '75%',
    },
    imgBubble: { borderRadius: 16, overflow: 'hidden', maxWidth: '75%' },
    msgText: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 20 },
    msgTextMe: { color: '#fff' },
    chatImage: { width: SCREEN_WIDTH * 0.55, height: SCREEN_WIDTH * 0.55 * 0.75 },
    msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 4 },
    msgTime: { fontSize: 10, color: theme.colors.textMuted, opacity: 0.7 },
    msgTimeMe: { color: 'rgba(255,255,255,0.5)' },

    inputRow: {
        flexDirection: 'row', alignItems: 'flex-end',
        padding: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 10, gap: 6,
        borderTopWidth: 1, borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface
    },
    attachBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    msgInput: {
        flex: 1, backgroundColor: theme.colors.surface2,
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
        color: theme.colors.text, fontSize: 14, maxHeight: 100,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
});
