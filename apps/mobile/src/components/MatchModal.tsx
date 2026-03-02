import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn, BounceIn } from 'react-native-reanimated';
import { colors, spacing, radii } from '../theme';

const { width } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  matchedUser: {
    _id?: string;
    id?: string;
    name: string;
    avatarUrl?: string;
    image?: string;
    department?: string;
    year?: number;
  } | null;
  currentUserAvatar?: string;
  onClose: () => void;
  onSendMessage: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  matchedUser,
  currentUserAvatar,
  onClose,
  onSendMessage,
}) => {
  if (!matchedUser) return null;

  const userImage = matchedUser.avatarUrl || matchedUser.image || 'https://randomuser.me/api/portraits/women/1.jpg';
  const myImage = currentUserAvatar || 'https://randomuser.me/api/portraits/men/1.jpg';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(240, 122, 131, 0.95)', 'rgba(232, 82, 94, 0.95)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          {/* Match Animation */}
          <Animated.View
            entering={BounceIn.delay(200).duration(600)}
            style={styles.header}
          >
            <Text style={styles.matchText}>It's a Match! 💕</Text>
            <Text style={styles.subText}>
              You and {matchedUser.name} liked each other
            </Text>
          </Animated.View>

          {/* Profile Images */}
          <Animated.View
            entering={ZoomIn.delay(400).duration(500)}
            style={styles.imagesContainer}
          >
            <View style={styles.imageWrapper}>
              <Image source={{ uri: myImage }} style={styles.profileImage} />
              <View style={styles.imageBorder} />
            </View>

            <View style={styles.heartIcon}>
              <Ionicons name="heart" size={40} color="white" />
            </View>

            <View style={styles.imageWrapper}>
              <Image source={{ uri: userImage }} style={styles.profileImage} />
              <View style={styles.imageBorder} />
            </View>
          </Animated.View>

          {/* User Info */}
          <Animated.View
            entering={FadeIn.delay(600).duration(400)}
            style={styles.userInfo}
          >
            <Text style={styles.userName}>{matchedUser.name}</Text>
            {matchedUser.department && matchedUser.year && (
              <Text style={styles.userDetails}>
                {matchedUser.department} • Year {matchedUser.year}
              </Text>
            )}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            entering={FadeIn.delay(800).duration(400)}
            style={styles.buttonsContainer}
          >
            <TouchableOpacity
              style={styles.sendMessageButton}
              onPress={onSendMessage}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="white" />
              <Text style={styles.sendMessageText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.keepSwipingButton} onPress={onClose}>
              <Text style={styles.keepSwipingText}>Keep Swiping</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  matchText: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  imageBorder: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heartIcon: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl * 1.5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: spacing.xs,
  },
  userDetails: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonsContainer: {
    width: width - spacing.xl * 2,
    gap: spacing.md,
  },
  sendMessageButton: {
    backgroundColor: 'white',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendMessageText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  keepSwipingButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
  },
  keepSwipingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
