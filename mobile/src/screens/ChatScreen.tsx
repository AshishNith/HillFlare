import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    StyleSheet, Dimensions, ScrollView, RefreshControl, Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import api, { BASE_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

export default function ChatScreen() {
    const navigation = useNavigation<any>();
    const [chats, setChats] = useState<any[]>([]);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        fetchChats();
    }, []);

    useFocusEffect(
        useCallback(() => {
            initSocket();
            fetchChats(); // Refresh list when returning to tab
            return () => { socketRef.current?.disconnect(); socketRef.current = null; };
        }, [])
    );

    const initSocket = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        const s = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
        socketRef.current = s;

        s.on('online_users', (ids: string[]) => setOnlineUserIds(new Set(ids)));
        s.on('user_online', ({ userId: uid }: any) => setOnlineUserIds(p => new Set(p).add(uid)));
        s.on('user_offline', ({ userId: uid }: any) => setOnlineUserIds(p => { const n = new Set(p); n.delete(uid); return n; }));
        // Just listen for list updates
        s.on('new_message', () => fetchChats());
    };

    const fetchChats = async () => {
        try {
            const { data } = await api.get('/chats');
            setChats(data.data || []);
        } catch { }
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChats();
    };

    const openChat = (chatId: string) => {
        const chat = chats.find(c => c._id === chatId);
        const other = getOther(chat);
        navigation.navigate('ChatDetail', { chatId, otherUser: other });
    };

    const getOther = (chat: any) => chat.participants?.find((p: any) => p._id !== user?._id) || {};

    // ── Chat List ──
    const matches = chats.slice(0, 8); // show first 8 as "matches"

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.listHeader}>
                <Text style={s.listTitle}>Messages</Text>
            </View>

            <FlatList
                data={chats}
                keyExtractor={(item) => item._id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                ListHeaderComponent={
                    <>
                        {/* Matches row */}
                        {matches.length > 0 && (
                            <View style={s.matchesSection}>
                                <Text style={s.matchesLabel}>MATCHES</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.matchesRow}>
                                    {matches.map((chat) => {
                                        const other = getOther(chat);
                                        const isOnline = other._id ? onlineUserIds.has(other._id) : false;
                                        return (
                                            <TouchableOpacity key={chat._id} style={s.matchItem} onPress={() => openChat(chat._id)}>
                                                <TouchableOpacity style={s.matchAvatarWrap} onPress={() => navigation.navigate('UserProfile', { userId: other._id })}>
                                                    {other.photos?.[0] ? (
                                                        <Image source={{ uri: other.photos[0] }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                                                    ) : (
                                                        <View style={s.matchAvatar}>
                                                            <Text style={s.matchInitial}>{other.name?.[0] || '?'}</Text>
                                                        </View>
                                                    )}
                                                    {isOnline && <View style={s.matchOnlineDot} />}
                                                </TouchableOpacity>
                                                <Text style={s.matchName} numberOfLines={1}>{other.name?.split(' ')[0] || 'User'}</Text>
                                                <Text style={s.matchAge}>{other.year ? `${other.year}` : ''}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                        {/* Search */}
                        <View style={s.searchWrap}>
                            <Text style={s.searchIcon}>🔍</Text>
                            <TextInput
                                style={s.searchInput}
                                placeholder="Search"
                                placeholderTextColor={theme.colors.textMuted}
                            />
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 16 }}>No conversations yet</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 4 }}>Match with someone to start chatting!</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const other = getOther(item);
                    return (
                        <TouchableOpacity style={s.chatItem} onPress={() => openChat(item._id)}>
                            <TouchableOpacity style={s.chatAvatarWrap2} onPress={() => navigation.navigate('UserProfile', { userId: other._id })}>
                                {other.photos?.[0] ? (
                                    <Image source={{ uri: other.photos[0] }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                                ) : (
                                    <View style={s.chatAvatar}>
                                        <Text style={s.chatInitial}>{other.name?.[0] || '?'}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <View style={s.chatItemTop}>
                                    <Text style={s.chatName}>{other.name || 'User'}</Text>
                                    <Text style={s.chatTime}>{item.lastMessageAt ? getTimeAgo(item.lastMessageAt) : ''}</Text>
                                </View>
                                <Text style={s.chatLast} numberOfLines={1}>{item.lastMessage || 'Say hi!'}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

function getTimeAgo(dateStr: string) {
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

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },

    listHeader: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
    listTitle: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },

    matchesSection: { paddingTop: 16, paddingBottom: 8 },
    matchesLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 12 },
    matchesRow: { paddingHorizontal: 16, gap: 12 },
    matchItem: { alignItems: 'center', width: 64 },
    matchAvatarWrap: { position: 'relative', marginBottom: 6 },
    matchAvatar: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: theme.colors.surface3,
        borderWidth: 2, borderColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    matchInitial: { fontSize: 22, fontWeight: '700', color: theme.colors.primaryLight },
    matchOnlineDot: {
        position: 'absolute', bottom: 1, right: 1,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: theme.colors.success,
        borderWidth: 2, borderColor: theme.colors.surface,
    },
    matchName: { fontSize: 12, fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
    matchAge: { fontSize: 11, color: theme.colors.textMuted, textAlign: 'center' },

    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.surface2,
        marginHorizontal: 16, marginVertical: 12,
        borderRadius: 12, paddingHorizontal: 14,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    searchIcon: { fontSize: 14, marginRight: 8, opacity: 0.5 },
    searchInput: { flex: 1, paddingVertical: 12, color: theme.colors.text, fontSize: 15 },

    chatItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14, gap: 14,
    },
    chatAvatarWrap2: { position: 'relative' },
    chatAvatar: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: theme.colors.surface3,
        justifyContent: 'center', alignItems: 'center',
    },
    chatInitial: { fontSize: 20, fontWeight: '700', color: theme.colors.primaryLight },
    chatItemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    chatName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    chatTime: { fontSize: 12, color: theme.colors.textMuted },
    chatLast: { fontSize: 13, color: theme.colors.textMuted },
});
