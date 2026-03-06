import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';

interface User {
  _id: string;
  name: string;
  department: string;
  year: number;
  bio: string;
  interests: string[];
  clubs: string[];
  lookingFor: string;
  avatarUrl?: string;
  galleryUrls?: string[];
  verified: boolean;
  lastActive?: string;
  mutualFriends?: number;
  email: string;
}

type RouteParams = {
  userId: string;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const UserProfileScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { userId } = route.params as RouteParams;
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const currentUserId = useAuthStore((state) => state.userId);

  useEffect(() => {
    fetchUserProfile();
    fetchMatches();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getUserById(userId);
      setUser(response.data || response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await apiService.getMatches();
      setMatches(response.items || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const isMatch = () => {
    if (!user) return false;
    return matches.some((matchedUser: any) => matchedUser._id === user._id || matchedUser.email === user.email);
  };

  const handleMessage = async () => {
    if (!isMatch()) return;

    try {
      const response = await apiService.findOrCreateChat(userId);
      navigation.navigate('MainTabs', {
        screen: 'Chat',
        params: {
          screen: 'Chat',
          params: { chatId: response.data._id, userName: user?.name }
        }
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      const result = await apiService.swipe(user._id, 'right');
      setHasLiked(true);

      if (result.matched) {
        Alert.alert('💕 It\'s a Match!', `You and ${user.name} liked each other!`);
        fetchMatches(); // Refresh matches
      } else {
        Alert.alert('❤️ Liked!', `You liked ${user.name}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to like user');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Why are you reporting this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Inappropriate content',
          onPress: () => submitReport('inappropriate_content'),
        },
        {
          text: 'Fake profile',
          onPress: () => submitReport('fake_profile'),
        },
        {
          text: 'Harassment',
          onPress: () => submitReport('harassment'),
        },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    try {
      await apiService.reportUser(userId, reason);
      Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoModalVisible(true);
  };

  const getActivityStatus = () => {
    if (!user?.lastActive) return null;

    return (
      <View style={styles.activityContainer}>
        <View style={styles.activityDot} />
        <Text style={styles.activityText}>Active {user.lastActive}</Text>
      </View>
    );
  };

  const getMutualFriends = () => {
    if (!user?.mutualFriends || user.mutualFriends === 0) return null;

    return (
      <View style={styles.mutualContainer}>
        <Ionicons name="people" size={16} color={colors.primary} />
        <Text style={styles.mutualText}>
          {user.mutualFriends} mutual friend{user.mutualFriends > 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="person-remove" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View entering={FadeIn} style={styles.heroContainer}>
          <Image
            source={{ uri: user.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />

          {/* Navigation Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleReport}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Name and Basic Info Overlay */}
          <Animated.View entering={SlideInDown} style={styles.heroOverlay}>
            <View style={styles.nameContainer}>
              <Text style={styles.heroName}>{user.name}</Text>
              {user.verified && (
                <Ionicons name="checkmark-circle" size={22} color="#4ADE80" />
              )}
            </View>
            <Text style={styles.heroSubtitle}>
              {user.department} • Year {user.year}
            </Text>
            {getActivityStatus()}
            {getMutualFriends()}
          </Animated.View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.galleryUrls?.length || 0}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.interests.length}</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.clubs.length}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
        </Animated.View>

        {/* Match Status Card */}
        {isMatch() && (
          <Animated.View entering={ZoomIn.delay(400)} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.matchText}>You're a Match!</Text>
            </View>
            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <Ionicons name="chatbubble" size={16} color="white" />
              <Text style={styles.messageButtonText}>Send Message</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Action Buttons (if not matched) */}
        {!isMatch() && !hasLiked && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.passButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={28} color="#EF4444" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.likeButton, isLiking && styles.buttonDisabled]}
              onPress={handleLike}
              disabled={isLiking}
            >
              {isLiking ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="heart" size={28} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Bio Section */}
        {user.bio && (
          <Animated.View entering={FadeIn.delay(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>About {user.name}</Text>
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          </Animated.View>
        )}

        {/* Interests Section */}
        {user.interests.length > 0 && (
          <Animated.View entering={FadeIn.delay(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tagsContainer}>
              {user.interests.map((interest, index) => (
                <Animated.View
                  key={index}
                  entering={FadeIn.delay(700 + index * 50)}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{interest}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Clubs Section */}
        {user.clubs.length > 0 && (
          <Animated.View entering={FadeIn.delay(800)} style={styles.section}>
            <Text style={styles.sectionTitle}>Clubs & Activities</Text>
            <View style={styles.tagsContainer}>
              {user.clubs.map((club, index) => (
                <Animated.View
                  key={index}
                  entering={FadeIn.delay(900 + index * 50)}
                  style={[styles.tag, styles.clubTag]}
                >
                  <Ionicons name="star" size={12} color={colors.primary} />
                  <Text style={[styles.tagText, styles.clubTagText]}>{club}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Looking For */}
        <Animated.View entering={FadeIn.delay(1000)} style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <View style={styles.lookingForContainer}>
            <Ionicons name="heart-outline" size={16} color={colors.primary} />
            <Text style={styles.lookingForText}>{user.lookingFor}</Text>
          </View>
        </Animated.View>

        {/* Gallery Section */}
        {user.galleryUrls && user.galleryUrls.length > 0 && (
          <Animated.View entering={FadeIn.delay(1100)} style={styles.section}>
            <Text style={styles.sectionTitle}>More Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.galleryContainer}>
                {user.galleryUrls.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openPhotoModal(index)}
                  >
                    <Animated.View entering={ZoomIn.delay(1200 + index * 100)}>
                      <Image
                        source={{ uri: url }}
                        style={styles.galleryImage}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Photo Modal */}
      <Modal
        visible={photoModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.photoModalContainer}>
          <TouchableOpacity
            style={styles.photoModalOverlay}
            onPress={() => setPhotoModalVisible(false)}
          />
          <SafeAreaView style={styles.photoModalContent}>
            <TouchableOpacity
              style={styles.photoModalClose}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            {user.galleryUrls && (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: selectedPhotoIndex * screenWidth, y: 0 }}
              >
                {user.galleryUrls.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.photoModalImage}
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: screenHeight * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  activityText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  mutualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: -20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  matchCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 8,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  messageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginVertical: 20,
    gap: 40,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  bioContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubTag: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  tagText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  clubTagText: {
    color: colors.primary,
    marginLeft: 4,
  },
  lookingForContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lookingForText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    marginLeft: 8,
  },
  galleryContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  galleryImage: {
    width: 160,
    height: 220,
    borderRadius: 16,
    marginRight: 12,
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  photoModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  photoModalContent: {
    flex: 1,
  },
  photoModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalImage: {
    width: screenWidth,
    height: screenHeight,
  },
});