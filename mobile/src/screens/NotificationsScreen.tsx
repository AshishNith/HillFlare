import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../utils/theme';
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

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<any>();

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'match': return 'heart';
            case 'crush_reveal': return 'flame';
            case 'message': return 'chatbubble';
            case 'report_update': return 'shield-checkmark';
            default: return 'notifications'; // system
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'match': return '#EC4899'; // pink
            case 'crush_reveal': return '#A855F7'; // purple
            case 'message': return '#3B82F6'; // blue
            case 'report_update': return '#EAB308'; // yellow
            default: return '#6B7280'; // gray
        }
    };

    const handlePress = async (n: Notification) => {
        if (!n.read) {
            try {
                await api.put(`/notifications/${n._id}/read`);
                setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
            } catch { }
        }

        switch (n.type) {
            case 'message':
                // For messages, we generally want to go to the chat list or the specific chat
                // If we have referenceId as chatId, we could go to ChatDetail
                // But usually notifications just say "New Message".
                // If we know the chat, we should go there. Assuming referenceId is chatId for message type.
                if (n.referenceId) {
                    // We need to fetch the chat or at least pass the ID. 
                    // IMPORTANT: ChatDetail needs 'otherUser' param. Notification might not have it.
                    // Safer to go to Chat List if we don't have full params.
                    // But user wants "navigation not working".
                    // If I go to Chat List, the user sees the list.
                    // If I want to go to specific chat, I need 'otherUser'.
                    // Let's stick to Chat List for now as it's safer, OR fetch chat data.
                    navigation.navigate('Main', { screen: 'Chat' });
                } else {
                    navigation.navigate('Main', { screen: 'Chat' });
                }
                break;
            case 'match':
                // For match, referenceId is matchId. Chat screen might need to find it.
                navigation.navigate('Main', { screen: 'Chat' });
                break;
            case 'crush_reveal':
                navigation.navigate('Main', { screen: 'Crush' });
                break;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity style={[styles.card, !item.read && styles.unreadCard]} onPress={() => handlePress(item)} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: item.read ? theme.colors.surface3 : theme.colors.surface2 }]}>
                <Ionicons name={getIcon(item.type) as any} size={20} color={getColor(item.type)} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity</Text>
                {notifications.some(n => !n.read) && (
                    <TouchableOpacity onPress={markAllRead}>
                        <Ionicons name="checkmark-done" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textMuted} />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface2,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    list: { padding: 16, paddingBottom: 32 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 },

    card: {
        flexDirection: 'row', alignItems: 'flex-start',
        padding: 16, marginBottom: 12, borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    unreadCard: {
        backgroundColor: 'rgba(123,47,255,0.03)',
        borderColor: 'rgba(123,47,255,0.2)',
    },
    iconCircle: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    content: { flex: 1 },
    title: { fontSize: 15, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    unreadText: { color: theme.colors.primaryLight },
    body: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 18 },
    time: { fontSize: 11, color: theme.colors.textSubtle, marginTop: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginTop: 6 },
    emptyText: { marginTop: 12, color: theme.colors.textMuted },
});
