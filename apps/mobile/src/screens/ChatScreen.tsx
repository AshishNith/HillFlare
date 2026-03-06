import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import { colors, radii, spacing } from '../theme';
import { apiService, API_URL } from '../services/api';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';

interface Message {
  _id: string;
  senderId: string;
  body?: string;
  type?: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  seenBy?: string[];
  createdAt: string;
}

export const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { chatId, userName, otherUserId, otherUser } = (route.params as any) || {};
  const currentUser = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      setupSocket();
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [chatId]);

  const setupSocket = () => {
    if (socketRef.current) return;
    const token = useAuthStore.getState().token;
    const socket = io(API_URL, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Register this user for online tracking + personal room
      if (currentUser?.email) {
        socket.emit('user:register', currentUser.email);
      }
      socket.emit('chat:join', chatId);
    });

    socket.on('user:onlineList', (payload: { userIds: string[] }) => {
      if (otherUserId && payload.userIds.includes(otherUserId)) {
        setIsOnline(true);
      }
    });

    socket.on('user:online', (payload: { userId: string }) => {
      if (payload.userId === otherUserId) setIsOnline(true);
    });

    socket.on('user:offline', (payload: { userId: string }) => {
      if (payload.userId === otherUserId) setIsOnline(false);
    });

    socket.on('chat:message', (payload: { chatId: string; message: Message }) => {
      if (payload.chatId !== chatId) return;

      // Ignore broadcast if we sent it, optimistic UI handles self-sent messages
      if (payload.message.senderId === currentUser?.email) return;

      setMessages((prev) => {
        // Prevent duplicate IDs just in case
        if (prev.some((msg) => msg._id === payload.message._id)) return prev;
        return [payload.message, ...prev];
      });

      apiService.markChatRead(chatId);
    });

    socket.on('chat:typing', (payload: { chatId: string; userId: string }) => {
      if (payload.chatId !== chatId || payload.userId === currentUser?.email) return;
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
    });

    socket.on('chat:seen', (payload: { chatId: string; userId: string }) => {
      if (payload.chatId !== chatId) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === currentUser?.email
            ? { ...msg, seenBy: Array.from(new Set([...(msg.seenBy || []), payload.userId])) }
            : msg
        )
      );
    });
  };

  const loadMessages = async (cursor?: string | null) => {
    try {
      const data = await apiService.getMessages(chatId, {
        cursor: cursor || undefined,
        limit: 30,
      });
      const page = data.items || [];
      const desc = [...page].reverse();

      if (!cursor) {
        setMessages(desc);
        if (desc.some((msg) => msg.senderId !== currentUser?.email)) {
          apiService.markChatRead(chatId);
        }
      } else {
        setMessages((prev) => [...prev, ...desc]);
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
    if (!newMessage.trim() || !chatId) return;

    const tempMessage: Message = {
      _id: Date.now().toString(),
      senderId: currentUser?.email || '',
      body: newMessage.trim(),
      type: 'text',
      seenBy: [currentUser?.email || ''],
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [tempMessage, ...prev]);
    setNewMessage('');

    try {
      const sent = await apiService.sendMessage(chatId, newMessage.trim(), 'text');
      setMessages(prev =>
        prev.map(msg => msg._id === tempMessage._id ? sent.data : msg)
      );
    } catch (error) {
      console.error('Failed to send message');
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const sendImage = async () => {
    if (!chatId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    const asset = result.assets[0];
    const dataUri = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;

    const tempMessage: Message = {
      _id: Date.now().toString(),
      senderId: currentUser?.email || '',
      type: 'image',
      mediaUrl: dataUri,
      seenBy: [currentUser?.email || ''],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [tempMessage, ...prev]);

    try {
      const sent = await apiService.sendMessage(chatId, '', 'image', dataUri);
      setMessages((prev) => prev.map((msg) => (msg._id === tempMessage._id ? sent.data : msg)));
    } catch (error) {
      console.error('Failed to send image');
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    if (!chatId || !currentUser?.email) return;
    socketRef.current?.emit('chat:typing', { chatId, userId: currentUser.email });
  };

  const handleChatActions = () => {
    setShowMenu(true);
  };

  const reportUser = () => {
    if (!otherUserId) return;
    Alert.alert('Report User', 'Why are you reporting this user?', [
      { text: 'Spam', onPress: () => apiService.reportUser(otherUserId, 'spam') },
      { text: 'Harassment', onPress: () => apiService.reportUser(otherUserId, 'harassment') },
      { text: 'Inappropriate', onPress: () => apiService.reportUser(otherUserId, 'inappropriate') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const blockUser = async () => {
    if (!otherUserId) return;
    await apiService.blockUser(otherUserId, 'user_block');
    Alert.alert('Blocked', 'You will no longer receive messages from this user.');
    navigation.goBack();
  };

  const unmatchUser = async () => {
    if (!otherUserId) return;
    await apiService.unmatchUser(otherUserId);
    Alert.alert('Unmatched', 'The chat has been removed.');
    navigation.goBack();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUser?.email;
    const messageDate = new Date(item.createdAt);
    const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const showSeen =
      isMyMessage &&
      item.seenBy?.includes(otherUserId) &&
      messages[0]?._id === item._id;

    return (
      <View style={{
        alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        marginVertical: 4,
        maxWidth: '75%'
      }}>
        <View
          style={{
            backgroundColor: isMyMessage ? colors.primary : colors.card,
            borderRadius: 18,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderWidth: isMyMessage ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          {item.type === 'image' && item.mediaUrl ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setImagePreview(item.mediaUrl || null)}
            >
              <Image
                source={{ uri: item.mediaUrl }}
                style={{ width: 200, height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <Text style={{ color: isMyMessage ? 'white' : colors.textPrimary }}>
              {item.body}
            </Text>
          )}
        </View>
        <Text style={{
          color: colors.textSecondary,
          fontSize: 11,
          marginTop: 2,
          marginLeft: isMyMessage ? 0 : 12,
          marginRight: isMyMessage ? 12 : 0,
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start'
        }}>
          {timeString}
        </Text>
        {showSeen && (
          <Text style={{ color: colors.textSecondary, fontSize: 11, alignSelf: 'flex-end' }}>
            Seen
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      {/* Header */}
      <View style={{
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
            {userName || 'Chat'}
          </Text>
          {isOnline && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#22C55E',
                marginRight: 4,
              }} />
              <Text style={{ fontSize: 12, color: '#22C55E' }}>Online</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleChatActions}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      {isTyping && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <Text style={{ color: colors.textSecondary }}>{userName || 'User'} is typing...</Text>
        </View>
      )}

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: spacing.lg }}
          inverted
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
                No messages yet. Say hi! 👋
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: spacing.sm }}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            ) : null
          }
        />
      )}

      {/* Input */}
      <View style={{
        padding: spacing.lg,
        paddingBottom: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={sendImage}
            style={{ marginRight: spacing.sm }}
          >
            <Ionicons name="image" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            value={newMessage}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: radii.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderColor: colors.border,
              borderWidth: 1,
              color: colors.textPrimary,
              maxHeight: 100,
            }}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            style={{
              marginLeft: spacing.sm,
              backgroundColor: newMessage.trim() ? colors.primary : colors.muted,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Options Bottom Sheet */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setShowMenu(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.card || '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: spacing.lg,
              paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
              paddingHorizontal: spacing.lg,
            }}
            onPress={() => { }} // prevent close on content tap
          >
            <View style={{
              width: 36,
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: spacing.lg,
            }} />
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}>Chat Options</Text>

            <TouchableOpacity
              onPress={() => { setShowMenu(false); reportUser(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Ionicons name="flag-outline" size={20} color={colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: colors.textPrimary }}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setShowMenu(false); blockUser(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Ionicons name="ban-outline" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#EF4444' }}>Block</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setShowMenu(false); unmatchUser(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Ionicons name="heart-dislike-outline" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#EF4444' }}>Unmatch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowMenu(false)}
              style={{
                alignItems: 'center',
                paddingVertical: 14,
                marginTop: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Full-screen Image Preview */}
      <Modal
        visible={!!imagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreview(null)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.95)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={() => setImagePreview(null)}
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          {imagePreview && (
            <Image
              source={{ uri: imagePreview }}
              style={{
                width: Dimensions.get('window').width - 32,
                height: Dimensions.get('window').height * 0.7,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
