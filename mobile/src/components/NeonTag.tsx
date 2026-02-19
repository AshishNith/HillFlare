import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';

interface NeonTagProps {
  children: React.ReactNode;
  variant?: 'purple' | 'pink' | 'blue' | 'green' | 'yellow';
  size?: 'xs' | 'sm' | 'md';
  interactive?: boolean;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function NeonTag({
  children,
  variant = 'purple',
  size = 'sm',
  interactive = false,
  selected = false,
  onPress,
  style,
  textStyle,
}: NeonTagProps) {
  const getVariantColors = () => {
    switch (variant) {
      case 'purple':
        return {
          bg: selected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
          border: selected ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.3)',
          text: selected ? '#C4B5FD' : '#A78BFA',
          glow: '#8B5CF6',
        };
      case 'pink':
        return {
          bg: selected ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.15)',
          border: selected ? 'rgba(236, 72, 153, 0.6)' : 'rgba(236, 72, 153, 0.3)',
          text: selected ? '#FBBF24' : '#F472B6',
          glow: '#EC4899',
        };
      case 'blue':
        return {
          bg: selected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
          border: selected ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.3)',
          text: selected ? '#93C5FD' : '#60A5FA',
          glow: '#3B82F6',
        };
      case 'green':
        return {
          bg: selected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.15)',
          border: selected ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.3)',
          text: selected ? '#86EFAC' : '#4ADE80',
          glow: '#22C55E',
        };
      case 'yellow':
        return {
          bg: selected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.15)',
          border: selected ? 'rgba(251, 191, 36, 0.6)' : 'rgba(251, 191, 36, 0.3)',
          text: selected ? '#FCD34D' : '#FBBF24',
          glow: '#FBBF24',
        };
      default:
        return {
          bg: selected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
          border: selected ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.3)',
          text: selected ? '#C4B5FD' : '#A78BFA',
          glow: '#8B5CF6',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { paddingVertical: 2, paddingHorizontal: 6, fontSize: 10, borderRadius: 8 };
      case 'sm':
        return { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, borderRadius: 10 };
      case 'md':
        return { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14, borderRadius: 12 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, borderRadius: 10 };
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  const tagStyle = {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: sizeStyles.borderRadius,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
  };

  const textStyleFinal = {
    color: colors.text,
    fontSize: sizeStyles.fontSize,
    fontWeight: '600' as const,
  };

  const glowStyle = selected
    ? {
        shadowColor: colors.glow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
      }
    : {};

  if (interactive && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[tagStyle, glowStyle, style]}
        activeOpacity={0.8}
      >
        <Text style={[textStyleFinal, textStyle]}>{children}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Text style={[tagStyle, glowStyle, textStyleFinal, style, textStyle]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  // No additional styles needed as everything is computed
});