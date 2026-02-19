import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassViewProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  blurType?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export default function GlassView({
  children,
  intensity = 20,
  style,
  blurType = 'dark',
  borderRadius = 20,
}: GlassViewProps) {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView 
        intensity={intensity} 
        tint={blurType}
        style={[styles.blurContainer, { borderRadius }]}
      >
        <View style={[styles.glassOverlay, { borderRadius }]}>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});