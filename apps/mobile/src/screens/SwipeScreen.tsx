import React, { useState, useEffect } from 'react';
import { Dimensions, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate,
  withSequence,
  withTiming,
  Extrapolation
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { mockProfiles } from '../data/mock';
import { ProfileCard } from '../components/ProfileCard';
import { MatchModal } from '../components/MatchModal';
import { apiService } from '../services/api';
import { useUserStore } from '../store/userStore';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;
const SWIPE_THRESHOLD = 100;
const ROTATION_ANGLE = 30;

type SwipeProfile = {
  _id?: string;
  id?: string;
  name: string;
  department: string;
  year: number;
  bio: string;
  interests: string[];
  clubs?: string[];
  lookingFor?: string;
  image: string;
  avatarUrl?: string;
};

export const SwipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentUser = useUserStore((state) => state.user);
  const [profileIndex, setProfileIndex] = useState(0);
  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSwiped, setAllSwiped] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<SwipeProfile | null>(null);

  // Animated values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(0);
  const rejectScale = useSharedValue(0);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await apiService.getDiscoveryProfiles();
      const items = data.items || [];
      const mapped = items.map((item: any) => ({
        ...item,
        id: item._id || item.id,
        image: item.avatarUrl || item.image,
      }));
      setProfiles(mapped);
      setProfileIndex(0);
      setAllSwiped(mapped.length === 0);
    } catch (error) {
      console.log('Failed to load profiles');
      setProfiles([]);
      setAllSwiped(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const profile = profiles[profileIndex];
    
    // Skip if no profile
    if (!profile) {
      setAllSwiped(true);
      return;
    }
    
    try {
      const targetId = profile._id || profile.id;
      if (targetId) {
        const result = await apiService.swipe(targetId, direction);
        
        // Check if it's a match
        if (result.matched && direction === 'right') {
          setMatchedUser(profile);
          setShowMatchModal(true);
          // Don't advance profile yet - wait for modal to close
          return;
        }
      }
      if (direction === 'right') {
        heartScale.value = withSequence(
          withSpring(1.2),
          withSpring(0)
        );
      } else {
        rejectScale.value = withSequence(
          withSpring(1.2),
          withSpring(0)
        );
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
    
    // Move to next profile (no wrapping)
    const nextIndex = profileIndex + 1;
    if (nextIndex >= profiles.length) {
      setAllSwiped(true);
    } else {
      setProfileIndex(nextIndex);
    }
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
    
    // Now advance to next profile
    const nextIndex = profileIndex + 1;
    if (nextIndex >= profiles.length) {
      setAllSwiped(true);
    } else {
      setProfileIndex(nextIndex);
    }
  };

  const resetCard = () => {
    'worklet';
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
  };

  const animateSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? CARD_WIDTH * 1.5 : -CARD_WIDTH * 1.5;
    
    translateX.value = withTiming(targetX, { duration: 300 }, () => {
      'worklet';
      runOnJS(handleSwipe)(direction);
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
    });
    
    scale.value = withTiming(0.75, { duration: 300 });
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      scale.value = withSpring(1.02, { damping: 15 });
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5; // Reduce vertical movement
      
      // Show overlay animations based on swipe direction
      if (event.translationX > 50) {
        heartScale.value = Math.min(event.translationX / 150, 1);
        rejectScale.value = 0;
      } else if (event.translationX < -50) {
        rejectScale.value = Math.min(Math.abs(event.translationX) / 150, 1);
        heartScale.value = 0;
      } else {
        heartScale.value = 0;
        rejectScale.value = 0;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(animateSwipe)('right');
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(animateSwipe)('left');
      } else {
        resetCard();
        heartScale.value = withSpring(0, { damping: 15 });
        rejectScale.value = withSpring(0, { damping: 15 });
      }
    });

  // Animated styles
  const cardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-CARD_WIDTH, 0, CARD_WIDTH],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
    };
  });

  const heartOverlayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const rejectOverlayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rejectScale.value }],
    opacity: rejectScale.value,
  }));

  const handleLike = () => {
    animateSwipe('right');
  };

  const handlePass = () => {
    animateSwipe('left');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Check if no profiles available or all swiped
  if (!profiles || profiles.length === 0 || allSwiped) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Ionicons name="people-outline" size={64} color={colors.textSecondary} style={{ marginBottom: spacing.lg }} />
        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' }}>
          {profiles.length === 0 ? 'No Profiles Available' : 'You\'re All Caught Up!'}
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }}>
          {profiles.length === 0 ? 'Check back later for new matches!' : 'You\'ve seen everyone for now. Check back later!'}
        </Text>
        <TouchableOpacity
          onPress={() => { setAllSwiped(false); loadProfiles(); }}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profile = profiles[profileIndex];
  
  // Additional safety check
  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        paddingTop: 60, 
        paddingHorizontal: spacing.lg, 
        paddingBottom: spacing.sm,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>
            Discover
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Swipe through curated matches
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Notifications')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Card Stack Container */}
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        marginBottom: 120 
      }}>
        {/* Background Cards (for stack effect) */}
        {profileIndex + 1 < profiles.length && (
          <View style={{
            position: 'absolute',
            width: CARD_WIDTH,
            transform: [{ scale: 0.95 }, { translateY: 10 }],
            opacity: 0.8,
          }}>
            <ProfileCard {...profiles[profileIndex + 1]} />
          </View>
        )}

        {profileIndex + 2 < profiles.length && (
          <View style={{
            position: 'absolute',
            width: CARD_WIDTH,
            transform: [{ scale: 0.9 }, { translateY: 20 }],
            opacity: 0.6,
          }}>
            <ProfileCard {...profiles[profileIndex + 2]} />
          </View>
        )}

        {/* Main Animated Card */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[{ width: CARD_WIDTH }, cardStyle]}>
            <ProfileCard {...profile} />
            
            {/* Heart Overlay */}
            <Animated.View style={[
              {
                position: 'absolute',
                top: '40%',
                left: '35%',
                backgroundColor: '#4ADE8080',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderRadius: 16,
                borderWidth: 4,
                borderColor: '#4ADE80',
              },
              heartOverlayStyle
            ]}>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '800', 
                color: '#fff', 
                textAlign: 'center' 
              }}>
                LIKE
              </Text>
            </Animated.View>

            {/* Reject Overlay */}
            <Animated.View style={[
              {
                position: 'absolute',
                top: '40%',
                right: '35%',
                backgroundColor: '#EF444480',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderRadius: 16,
                borderWidth: 4,
                borderColor: '#EF4444',
              },
              rejectOverlayStyle
            ]}>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '800', 
                color: '#fff', 
                textAlign: 'center' 
              }}>
                PASS
              </Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Action Buttons */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        zIndex: 20,
      }}>
        {/* Pass Button */}
        <TouchableOpacity
          onPress={handlePass}
          style={{
            height: 64,
            width: 64,
            borderRadius: 32,
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="close" size={28} color="#EF4444" />
        </TouchableOpacity>

        {/* Super Like Button */}
        <TouchableOpacity
          style={{
            height: 48,
            width: 48,
            borderRadius: 24,
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: '#3B82F6',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="star" size={20} color="#3B82F6" />
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          onPress={handleLike}
          style={{
            height: 64,
            width: 64,
            borderRadius: 32,
            backgroundColor: colors.primary,
            borderWidth: 2,
            borderColor: '#4ADE80',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="heart" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        matchedUser={matchedUser}
        currentUserAvatar={currentUser?.avatarUrl}
        onClose={handleCloseMatchModal}
        onSendMessage={async () => {
          if (!matchedUser) return;
          try {
            const targetId = matchedUser._id || matchedUser.id;
            if (!targetId) return;
            
            const chatData = await apiService.findOrCreateChat(targetId);
            setShowMatchModal(false);
            setMatchedUser(null);
            
            // Advance to next profile
            const nextIndex = profileIndex + 1;
            if (nextIndex >= profiles.length) {
              setAllSwiped(true);
            } else {
              setProfileIndex(nextIndex);
            }
            
            (navigation as any).navigate('Chat', {
              screen: 'Chat',
              params: {
                chatId: chatData.data._id,
                userName: matchedUser.name,
                otherUserId: targetId,
                otherUser: matchedUser,
              },
            });
          } catch (error) {
            console.error('Failed to create chat:', error);
            handleCloseMatchModal();
          }
        }}
      />
    </View>
  );
};
