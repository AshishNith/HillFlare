import React from 'react';
import { Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

type TagProps = {
  label: string;
};

export const Tag: React.FC<TagProps> = ({ label }) => {
  return (
    <View
      style={{
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: radii.md,
        backgroundColor: colors.muted,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
    </View>
  );
};
