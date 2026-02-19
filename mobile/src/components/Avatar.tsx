import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  style?: ViewStyle;
  textStyle?: TextStyle;
  glowEffect?: boolean;
}

export default function Avatar({
  src,
  name,
  size = 'md',
  style,
  textStyle,
  glowEffect = false,
}: AvatarProps) {
  const getSizeValues = () => {
    switch (size) {
      case 'xs':
        return { dimension: 24, fontSize: 10, borderWidth: 1 };
      case 'sm':
        return { dimension: 32, fontSize: 12, borderWidth: 1 };
      case 'md':
        return { dimension: 48, fontSize: 16, borderWidth: 2 };
      case 'lg':
        return { dimension: 64, fontSize: 20, borderWidth: 2 };
      case 'xl':
        return { dimension: 80, fontSize: 24, borderWidth: 3 };
      case '2xl':
        return { dimension: 96, fontSize: 28, borderWidth: 3 };
      default:
        return { dimension: 48, fontSize: 16, borderWidth: 2 };
    }
  };

  const { dimension, fontSize, borderWidth } = getSizeValues();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  if (src) {
    return (
      <View
        style={[
          containerStyle,
          glowEffect && styles.glowContainer,
          style,
        ]}
      >
        {glowEffect && (
          <LinearGradient
            colors={['#8B5CF6', '#EC4899', '#F97316']}
            style={[containerStyle, { position: 'absolute' }]}
          />
        )}
        <Image
          source={{ uri: src }}
          style={[
            containerStyle,
            {
              borderWidth: glowEffect ? borderWidth : 0,
              borderColor: '#FFFFFF',
            },
            glowEffect && { margin: borderWidth },
          ]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        containerStyle,
        styles.initialsContainer,
        glowEffect && styles.glowContainer,
        style,
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          { fontSize },
          textStyle,
        ]}
      >
        {initials}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  glowContainer: {
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});