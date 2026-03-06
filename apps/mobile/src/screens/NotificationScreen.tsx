import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';
import { apiService } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';

interface Notification {
  _id: string;
  type: 'match' | 'message' | 'crush' | 'crush_match' | 'like';
  message?: string;
  payload?: { message?: string; targetUserId?: string; chatId?: string; senderId?: string };
  read: boolean;
  createdAt: string;
  relatedUserId?: string;
}

export const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const resetBadge = useNotificationStore((state) => state.reset);

  useEffect(() => {
    loadNotifications();
    // Reset unread badge when screen is opened
    resetBadge();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data.items || []);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    resetBadge();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return 'heart';
      case 'message':
        return 'chatbubble';
      case 'crush':
        return 'star';
      case 'like':
        return 'thumbs-up';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'match':
        return '#EF4444';
      case 'message':
        return '#3B82F6';
      case 'crush':
        return '#F59E0B';
      case 'like':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const timeAgo = getTimeAgo(new Date(item.createdAt));

    return (
      <TouchableOpacity
        onPress={() => !item.read && markAsRead(item._id)}
        style={{
          flexDirection: 'row',
          backgroundColor: item.read ? colors.card : colors.primary + '15',
          borderRadius: radii.lg,
          padding: spacing.md,
          borderColor: item.read ? colors.border : colors.primary + '40',
          borderWidth: 1,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: getIconColor(item.type) + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <Ionicons name={getIcon(item.type)} size={24} color={getIconColor(item.type)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: item.read ? '500' : '700',
              marginBottom: 4,
            }}
          >
            {item.payload?.message || item.message || 'New notification'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{timeAgo}</Text>
        </View>
        {!item.read && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              alignSelf: 'center',
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 60 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary }}>
          Notifications
        </Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 16 }}>
              No notifications yet
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
              You'll be notified about matches and messages
            </Text>
          </View>
        }
      />
    </View>
  );
};
