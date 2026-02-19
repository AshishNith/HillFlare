import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassView from './GlassView';
import NeonTag from './NeonTag';
import Avatar from './Avatar';

const { width } = Dimensions.get('window');

interface ProfileCardProps {
  profile: {
    _id: string;
    name: string;
    department: string;
    year: number;
    interests: string[];
    photos: string[];
    bio?: string;
    age?: number;
  };
  style?: ViewStyle;
  showDetails?: boolean;
}

export default function ProfileCard({
  profile,
  style,
  showDetails = true,
}: ProfileCardProps) {
  const cardWidth = width * 0.9;
  const cardHeight = cardWidth * 1.4;

  return (
    <View style={[styles.container, { width: cardWidth, height: cardHeight }, style]}>
      <GlassView style={styles.card}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          {profile.photos?.[0] ? (
            <Image
              source={{ uri: profile.photos[0] }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImageContainer}>
              <Avatar
                name={profile.name}
                size="2xl"
                glowEffect
              />
            </View>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
            style={styles.gradientOverlay}
          />

          {/* Profile Info Overlay */}
          <View style={styles.infoOverlay}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>
                {profile.name}
                {profile.age && (
                  <Text style={styles.age}>, {profile.age}</Text>
                )}
              </Text>
              <Text style={styles.department}>
                {profile.department} • Year {profile.year}
              </Text>
            </View>

            {showDetails && profile.bio && (
              <Text numberOfLines={2} style={styles.bio}>
                {profile.bio}
              </Text>
            )}

            {/* Interests */}
            {showDetails && profile.interests?.length > 0 && (
              <View style={styles.interestsContainer}>
                {profile.interests.slice(0, 3).map((interest, index) => (
                  <NeonTag
                    key={interest}
                    variant={index % 2 === 0 ? 'purple' : 'pink'}
                    size="xs"
                  >
                    {interest}
                  </NeonTag>
                ))}
                {profile.interests.length > 3 && (
                  <NeonTag variant="purple" size="xs">
                    +{profile.interests.length - 3}
                  </NeonTag>
                )}
              </View>
            )}
          </View>
        </View>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  nameSection: {
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  age: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  department: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bio: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});