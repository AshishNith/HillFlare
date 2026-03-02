import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors, radii, spacing, shadows } from '../theme';
import { Tag } from './Tag';

type ProfileCardProps = {
  name: string;
  department: string;
  year: number;
  bio: string;
  interests: string[];
  image: string;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  department,
  year,
  bio,
  interests,
  image,
}) => {
  return (
    <View
      style={{
        borderRadius: radii.xl,
        backgroundColor: colors.card,
        overflow: 'hidden',
        ...shadows.soft,
      }}
    >
      <Image source={{ uri: image }} style={{ width: '100%', height: 420 }} />
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary }}>
          {name}
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
          {department} · Year {year}
        </Text>
        <Text style={{ color: colors.textPrimary, marginTop: spacing.sm }}>{bio}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {interests.map((interest) => (
            <Tag key={interest} label={interest} />
          ))}
        </View>
      </View>
    </View>
  );
};
