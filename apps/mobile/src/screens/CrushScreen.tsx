import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { apiService } from '../services/api';

interface Crush {
  _id: string;
  userId: string;
  targetUserId: any;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  department: string;
  year: number;
  avatarUrl?: string;
  verified: boolean;
}

interface CrushScreenProps {
  navigation: any;
}

export const CrushScreen: React.FC<CrushScreenProps> = ({ navigation }) => {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [editingCrushId, setEditingCrushId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // IDs of users already selected as crushes
  const crushedUserIds = crushes.map((c) => {
    const target = c.targetUserId;
    if (target && typeof target === 'object') return target._id;
    return target;
  }).filter(Boolean);

  // Filter out already-crushed users and apply search
  const filteredUsers = availableUsers
    .filter(user => !crushedUserIds.includes(user._id))
    .filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.year?.toString().includes(searchQuery)
    );

  useEffect(() => {
    loadCrushes();
    loadAvailableUsers();
  }, []);

  const loadCrushes = async () => {
    try {
      const data = await apiService.getCrushes();
      setCrushes(data.items || []);
    } catch (error) {
      console.log('Failed to load crushes');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const data = await apiService.getExploreProfiles();
      setAvailableUsers(data.items || []);
    } catch (error) {
      console.log('Failed to load users');
      setAvailableUsers([]);
    }
  };

  const handleSelectCrush = async (userId: string) => {
    if (editingCrushId) {
      // Update existing crush
      try {
        const result = await apiService.updateCrush(editingCrushId, userId);
        loadCrushes();
        setEditingCrushId(null);
        setShowSelector(false);
        if (result.matched && result.matchedUser) {
          Alert.alert(
            '\uD83D\uDC95 It\'s a Mutual Crush!',
            `You and ${result.matchedUser.name} both selected each other!`,
            [
              { text: 'Send Message', onPress: () => handleMatchChat(result.matchedUser) },
              { text: 'Close', style: 'cancel' },
            ]
          );
        } else {
          Alert.alert('Success', 'Crush updated successfully!');
        }
      } catch (error: any) {
        const msg = error?.response?.data?.error || 'Failed to update crush';
        Alert.alert('Error', msg);
      }
    } else {
      // Add new crush
      if (crushes.length >= 3) {
        Alert.alert('Limit Reached', 'You can only select up to 3 crushes');
        return;
      }

      try {
        const result = await apiService.selectCrush(userId);
        loadCrushes();
        setShowSelector(false);

        if (result.matched && result.matchedUser) {
          Alert.alert(
            '\uD83D\uDC95 It\'s a Mutual Crush!',
            `You and ${result.matchedUser.name} both selected each other!`,
            [
              { text: 'Send Message', onPress: () => handleMatchChat(result.matchedUser) },
              { text: 'Close', style: 'cancel' },
            ]
          );
        } else {
          Alert.alert('Success', 'Crush added! They\'ll only know if it\'s mutual.');
        }
      } catch (error: any) {
        const msg = error?.response?.data?.error || 'Failed to select crush';
        Alert.alert('Error', msg);
      }
    }
  };

  const handleEditCrush = (crushId: string) => {
    setEditingCrushId(crushId);
    setShowSelector(true);
  };

  const handleRemoveCrush = (crushId: string) => {
    Alert.alert(
      'Remove Crush',
      'Are you sure you want to remove this crush?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCrush(crushId);
              loadCrushes();
              Alert.alert('Success', 'Crush removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove crush');
            }
          }
        }
      ]
    );
  };

  const navigateToProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleMatchChat = async (matchedUser: any) => {
    try {
      const chat = await apiService.findOrCreateChat(matchedUser.email || matchedUser._id);
      navigation.navigate('Chat', { chatId: chat._id || chat.chatId, otherUser: matchedUser });
    } catch (error) {
      console.log('Failed to navigate to chat');
    }
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary }}>
          Anonymous Crush
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
          Pick up to 3 people. Reveal when it's mutual.
        </Text>
      </View>

      {/* Crushes List */}
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <View style={{
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.lg,
          borderColor: colors.border,
          borderWidth: 1,
          marginBottom: spacing.lg,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <Ionicons name="heart" size={20} color={colors.primary} />
            <Text style={{
              color: colors.textPrimary,
              fontWeight: '700',
              fontSize: 18,
              marginLeft: 8
            }}>
              Your Crushes ({crushes.length}/3)
            </Text>
          </View>

          {crushes.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <Ionicons name="heart-outline" size={48} color={colors.textSecondary} />
              <Text style={{
                color: colors.textSecondary,
                marginTop: spacing.sm,
                textAlign: 'center'
              }}>
                No crushes selected yet.{'\n'}Start by adding someone you like!
              </Text>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              {crushes.map((crush, index) => {
                const user = crush.targetUserId;
                // Skip if user data is not populated
                if (!user || typeof user !== 'object') {
                  return null;
                }
                return (
                  <View
                    key={crush._id}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: radii.md,
                      padding: spacing.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => navigateToProfile(user._id)}
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    >
                      <Image
                        source={{
                          uri: user.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg'
                        }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          marginRight: spacing.md
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{
                            fontWeight: '600',
                            color: colors.textPrimary
                          }}>
                            {user.name}
                          </Text>
                          {user.verified && (
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color="#4ADE80"
                              style={{ marginLeft: 4 }}
                            />
                          )}
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                          {user.department} • Year {user.year}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleEditCrush(crush._id)}
                        style={{
                          backgroundColor: colors.primary + '20',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{
                          color: colors.primary,
                          fontSize: 12,
                          fontWeight: '600'
                        }}>
                          Change
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleRemoveCrush(crush._id)}
                        style={{
                          backgroundColor: '#EF444420',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{
                          color: '#EF4444',
                          fontSize: 12,
                          fontWeight: '600'
                        }}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Add Crush Button */}
        {crushes.length < 3 && (
          <PrimaryButton
            label={`Add ${crushes.length === 0 ? 'Your First' : 'Another'} Crush`}
            onPress={() => {
              setEditingCrushId(null);
              setShowSelector(true);
            }}
          />
        )}
      </View>

      {/* User Selection Modal */}
      <Modal
        visible={showSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <TouchableOpacity
              onPress={() => {
                setShowSelector(false);
                setEditingCrushId(null);
                setSearchQuery('');
              }}
              style={{ marginRight: spacing.md }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.textPrimary,
              flex: 1
            }}>
              {editingCrushId ? 'Change Crush' : 'Select a Crush'}
            </Text>
          </View>

          <View style={{ padding: spacing.lg }}>
            <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
              {editingCrushId
                ? 'Choose someone new for this crush slot.'
                : 'Choose someone you like. They\'ll only know if it\'s mutual.'
              }
            </Text>

            {/* Search Input */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: radii.md,
              borderColor: colors.border,
              borderWidth: 1,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.lg,
            }}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                placeholder="Search by name, department, or year..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  fontSize: 14,
                  color: colors.textPrimary,
                }}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            ListEmptyComponent={
              <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                <Ionicons name="search" size={48} color={colors.textSecondary} />
                <Text style={{
                  color: colors.textSecondary,
                  marginTop: spacing.md,
                  textAlign: 'center'
                }}>
                  {searchQuery ? 'No users found' : 'No users available'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectCrush(item._id)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  borderColor: colors.border,
                  borderWidth: 1,
                  marginBottom: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={{
                    uri: item.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg'
                  }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    marginRight: spacing.md
                  }}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '600', color: colors.textPrimary }}>
                      {item.name}
                    </Text>
                    {item.verified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#4ADE80"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                  <Text style={{ color: colors.textSecondary }}>
                    {item.department} • Year {item.year}
                  </Text>
                </View>
                <Ionicons name="heart-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};
