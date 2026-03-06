import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { colors, radii, spacing } from '../theme';
import { apiService, API_URL } from '../services/api';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';

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
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadChats();
    setupSocket();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Refresh list when navigating back to this screen (throttled to 30s)
  const lastFetchRef = useRef(0);
  useEffect(() => {
    if (isFocused) {
      const now = Date.now();
      if (now - lastFetchRef.current > 30000) {
        loadChats();
        lastFetchRef.current = now;
      }
    }
  }, [isFocused]);

  const setupSocket = () => {
    if (socketRef.current) return;
    const token = useAuthStore.getState().token;
    const socket = io(API_URL, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    });
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
      const [chatsData, matchesData] = await Promise.all([
        apiService.getChats(),
        apiService.getMatches()
      ]);
      setChats(chatsData.items || []);
      setMatches(matchesData.items || []);
    } catch (error) {
      console.log('Failed to load chats data');
      // Only clear data on first load failure
      if (chats.length === 0) setChats([]);
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
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: spacing.lg }}>
      <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary }}>
        Chats
      </Text>
      <TextInput
        placeholder="Search conversations..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderColor: colors.border,
          borderWidth: 1,
          marginVertical: spacing.md,
          color: colors.textPrimary,
        }}
      />
      <FlatList
        ListHeaderComponent={
          matches.length > 0 ? (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
                New Matches
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={matches}
                keyExtractor={(item) => item._id || item.email}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={async () => {
                      try {
                        let targetChatId;
                        const existingChat = chats.find(c => c.otherUser?.email === item.email);

                        if (existingChat) {
                          targetChatId = existingChat._id;
                        } else {
                          const chatRes = await apiService.findOrCreateChat(item.email);
                          targetChatId = chatRes.data?._id || chatRes._id;
                        }

                        (navigation as any).navigate('Chat', {
                          chatId: targetChatId,
                          userName: item.name || item.email,
                          otherUserId: item.email,
                          otherUser: item,
                        });
                      } catch (err) {
                        console.error('Failed to open match chat', err);
                      }
                    }}
                    style={{ alignItems: 'center', marginRight: spacing.md }}
                  >
                    <View style={{
                      width: 68, height: 68, borderRadius: 34,
                      borderWidth: 2, borderColor: colors.primary,
                      padding: 2, marginBottom: 6
                    }}>
                      <Image
                        source={{ uri: item.avatarUrl || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
                        style={{ width: '100%', height: '100%', borderRadius: 30 }}
                      />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary, maxWidth: 68, textAlign: 'center' }} numberOfLines={1}>
                      {item.name?.split(' ')[0] || 'User'}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          ) : null
        }
        data={chats.filter((c) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (c.otherUser?.name || '').toLowerCase().includes(q) ||
                 (c.otherUser?.email || '').toLowerCase().includes(q);
        })}
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
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>💬</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs }}>
              No conversations yet
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Match with someone to start chatting!
            </Text>
          </View>
        }
      />
    </View>
  );
};
