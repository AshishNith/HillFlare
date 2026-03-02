import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { colors, radii, spacing } from '../theme';
import { apiService, API_URL } from '../services/api';
import { useUserStore } from '../store/userStore';

interface ChatItem {
  _id: string;
  otherUser: {
    _id?: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };
  lastMessage?: string;
  lastMessageType?: 'text' | 'image' | 'voice';
  lastMessageAt?: string;
  unreadCount?: number;
}

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const currentUser = useUserStore((state) => state.user);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadChats();
    setupSocket();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Refresh list when navigating back to this screen
  useEffect(() => {
    if (isFocused) loadChats();
  }, [isFocused]);

  const setupSocket = () => {
    if (socketRef.current) return;
    const socket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (currentUser?.email) {
        socket.emit('user:register', currentUser.email);
      }
    });

    socket.on('user:onlineList', (payload: { userIds: string[] }) => {
      setOnlineUsers(new Set(payload.userIds));
    });

    socket.on('user:online', (payload: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(payload.userId));
    });

    socket.on('user:offline', (payload: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(payload.userId);
        return next;
      });
    });

    // Real-time: refetch chat list when any chat gets a new message
    socket.on('chats:update', () => {
      loadChats();
    });
  };

  const loadChats = async () => {
    try {
      const data = await apiService.getChats();
      setChats(data.items || []);
    } catch (error) {
      console.log('Failed to load chats');
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary }}>
        Chats
      </Text>
      <TextInput
        placeholder="Search"
        placeholderTextColor={colors.textSecondary}
        style={{
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderColor: colors.border,
          borderWidth: 1,
          marginVertical: spacing.md,
        }}
      />
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => (navigation as any).navigate('Chat', { 
              chatId: item._id,
              userName: item.otherUser?.name || item.otherUser?.email,
              otherUserId: item.otherUser?.email,
              otherUser: item.otherUser,
            })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: radii.lg,
              padding: spacing.md,
              borderColor: colors.border,
              borderWidth: 1,
              marginBottom: spacing.sm,
            }}
          >
            <Image
              source={{ uri: item.otherUser?.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg' }}
              style={{ width: 56, height: 56, borderRadius: 18, marginRight: spacing.md }}
            />
            {onlineUsers.has(item.otherUser?.email) && (
              <View style={{
                position: 'absolute',
                left: 44,
                top: 40,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#22C55E',
                borderWidth: 2,
                borderColor: colors.card,
              }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: colors.textPrimary }}>
                {item.otherUser?.name || item.otherUser?.email}
              </Text>
              <Text style={{ color: colors.textSecondary }} numberOfLines={1}>
                {item.lastMessageType === 'image' ? '📷 Photo' : item.lastMessage || 'Start chatting'}
              </Text>
            </View>
            {item.unreadCount && item.unreadCount > 0 ? (
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  {item.unreadCount}
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {item.lastMessageAt
                  ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </Text>
            )}
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
