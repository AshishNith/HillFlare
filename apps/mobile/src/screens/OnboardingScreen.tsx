import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { apiService } from '../services/api';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const interests = [
  'Music',
  'Sports',
  'Art',
  'Photography',
  'Gaming',
  'Coding',
  'Reading',
  'Travel',
  'Fitness',
  'Cooking',
  'Dance',
  'Theatre',
];

const clubs = [
  'Drama Club',
  'Music Society',
  'Coding Club',
  'Sports Club',
  'Design Club',
  'Photography Club',
  'Debate Society',
  'Entrepreneurship Cell',
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const INTERESTED_IN_OPTIONS = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'non-binary', label: 'Non-binary' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const authUserId = useAuthStore((state) => state.userId);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    bio: '',
    interests: [] as string[],
    clubs: [] as string[],
    lookingFor: 'Dating',
    gender: '',
    interestedIn: [] as string[],
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest].slice(0, 5),
    }));
  };

  const toggleClub = (club: string) => {
    setFormData((prev) => ({
      ...prev,
      clubs: prev.clubs.includes(club)
        ? prev.clubs.filter((c) => c !== club)
        : [...prev.clubs, club].slice(0, 3),
    }));
  };

  const pickPhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can add up to 6 photos.');
      return;
    }

    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permission Required', 'Please allow camera access.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
            base64: true,
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const dataUri = asset.base64
              ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
              : asset.uri;
            setPhotos((prev) => [...prev, dataUri]);
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permission Required', 'Please allow photo library access.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
            base64: true,
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const dataUri = asset.base64
              ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
              : asset.uri;
            setPhotos((prev) => [...prev, dataUri]);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.department || !formData.year) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.gender || formData.interestedIn.length === 0) {
        Alert.alert('Error', 'Please select your gender and who you\'re interested in');
        return;
      }
    }
    if (step === 3 && formData.interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (photos.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one photo to complete your profile.');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        ...formData,
        year: parseInt(formData.year),
        avatarUrl: photos[0],
        galleryUrls: photos,
      };
      const updated = await apiService.updateProfile(profileData);
      setUser(updated.data || updated);
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <View style={{ flex: 1 }}>
        {/* Progress */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            padding: spacing.xl,
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 4,
                backgroundColor: s <= step ? colors.accent : colors.border,
                borderRadius: 2,
              }}
            />
          ))}
        </View>

        <ScrollView style={{ flex: 1, padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.charcoal,
                  marginBottom: spacing.sm,
                }}
              >
                Basic Info
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  marginBottom: spacing.xl,
                }}
              >
                Tell us about yourself
              </Text>

              <View style={{ gap: spacing.lg }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                    Full Name *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 16,
                      padding: spacing.md,
                      fontSize: 16,
                    }}
                    placeholder="Your name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    maxLength={100}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                    Department *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 16,
                      padding: spacing.md,
                      fontSize: 16,
                    }}
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChangeText={(text) => setFormData({ ...formData, department: text })}
                    maxLength={100}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                    Year *
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    {['1', '2', '3', '4'].map((year) => (
                      <TouchableOpacity
                        key={year}
                        onPress={() => setFormData({ ...formData, year })}
                        style={{
                          flex: 1,
                          backgroundColor:
                            formData.year === year ? colors.accent : colors.card,
                          borderWidth: 1,
                          borderColor:
                            formData.year === year ? colors.accent : colors.border,
                          borderRadius: 16,
                          padding: spacing.md,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: formData.year === year ? 'white' : colors.textPrimary,
                          }}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.charcoal,
                  marginBottom: spacing.sm,
                }}
              >
                Gender & Preferences
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  marginBottom: spacing.xl,
                }}
              >
                Help us find the right people for you
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.md }}>
                  I am
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {GENDER_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setFormData({ ...formData, gender: opt.value })}
                      style={{
                        backgroundColor:
                          formData.gender === opt.value ? colors.accent : colors.card,
                        borderWidth: 1,
                        borderColor:
                          formData.gender === opt.value ? colors.accent : colors.border,
                        borderRadius: 20,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color:
                            formData.gender === opt.value ? 'white' : colors.textPrimary,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                  Interested in
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md }}>
                  Select all that apply
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {INTERESTED_IN_OPTIONS.map((opt) => {
                    const selected = formData.interestedIn.includes(opt.value);
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => {
                          setFormData((prev) => ({
                            ...prev,
                            interestedIn: selected
                              ? prev.interestedIn.filter((v) => v !== opt.value)
                              : [...prev.interestedIn, opt.value],
                          }));
                        }}
                        style={{
                          backgroundColor: selected ? colors.accent : colors.card,
                          borderWidth: 1,
                          borderColor: selected ? colors.accent : colors.border,
                          borderRadius: 20,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: selected ? 'white' : colors.textPrimary,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    onPress={() => {
                      setFormData((prev) => ({
                        ...prev,
                        interestedIn: prev.interestedIn.length === INTERESTED_IN_OPTIONS.length
                          ? []
                          : INTERESTED_IN_OPTIONS.map((o) => o.value),
                      }));
                    }}
                    style={{
                      backgroundColor:
                        formData.interestedIn.length === INTERESTED_IN_OPTIONS.length
                          ? colors.accent
                          : colors.card,
                      borderWidth: 1,
                      borderColor:
                        formData.interestedIn.length === INTERESTED_IN_OPTIONS.length
                          ? colors.accent
                          : colors.border,
                      borderRadius: 20,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color:
                          formData.interestedIn.length === INTERESTED_IN_OPTIONS.length
                            ? 'white'
                            : colors.textPrimary,
                      }}
                    >
                      Everyone
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.charcoal,
                  marginBottom: spacing.sm,
                }}
              >
                Interests & Clubs
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  marginBottom: spacing.xl,
                }}
              >
                Select up to 5 interests and 3 clubs
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.md }}>
                  Interests ({formData.interests.length}/5)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {interests.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      onPress={() => toggleInterest(interest)}
                      style={{
                        backgroundColor: formData.interests.includes(interest)
                          ? colors.accent
                          : colors.card,
                        borderWidth: 1,
                        borderColor: formData.interests.includes(interest)
                          ? colors.accent
                          : colors.border,
                        borderRadius: 20,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: formData.interests.includes(interest)
                            ? 'white'
                            : colors.textPrimary,
                        }}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.md }}>
                  Clubs ({formData.clubs.length}/3)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {clubs.map((club) => (
                    <TouchableOpacity
                      key={club}
                      onPress={() => toggleClub(club)}
                      style={{
                        backgroundColor: formData.clubs.includes(club)
                          ? colors.accent
                          : colors.card,
                        borderWidth: 1,
                        borderColor: formData.clubs.includes(club)
                          ? colors.accent
                          : colors.border,
                        borderRadius: 20,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: formData.clubs.includes(club) ? 'white' : colors.textPrimary,
                        }}
                      >
                        {club}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.charcoal,
                  marginBottom: spacing.sm,
                }}
              >
                About You
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  marginBottom: spacing.xl,
                }}
              >
                Write a short bio
              </Text>

              <View style={{ gap: spacing.lg }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                    Bio
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 16,
                      padding: spacing.md,
                      fontSize: 16,
                      height: 120,
                      textAlignVertical: 'top',
                    }}
                    placeholder="Tell others about yourself..."
                    value={formData.bio}
                    onChangeText={(text) => setFormData({ ...formData, bio: text })}
                    multiline
                    maxLength={500}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                      textAlign: 'right',
                    }}
                  >
                    {formData.bio.length}/500
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                    Looking For
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    {['Dating', 'Friends', 'Both'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setFormData({ ...formData, lookingFor: option })}
                        style={{
                          flex: 1,
                          backgroundColor:
                            formData.lookingFor === option ? colors.accent : colors.card,
                          borderWidth: 1,
                          borderColor:
                            formData.lookingFor === option ? colors.accent : colors.border,
                          borderRadius: 16,
                          padding: spacing.md,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color:
                              formData.lookingFor === option ? 'white' : colors.textPrimary,
                          }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </>
          )}
          {step === 5 && (
            <>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.charcoal,
                  marginBottom: spacing.sm,
                }}
              >
                Add Your Photos
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  marginBottom: spacing.xl,
                }}
              >
                Add at least 1 photo to complete your profile
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                {photos.map((photo, index) => (
                  <View key={index} style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: photo }}
                      style={{
                        width: 100,
                        height: 125,
                        borderRadius: 16,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: '#EF4444',
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 6,
                          left: 6,
                          backgroundColor: colors.accent,
                          borderRadius: 8,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                          Main
                        </Text>
                      </View>
                    )}
                  </View>
                ))}

                {photos.length < 6 && (
                  <TouchableOpacity
                    onPress={pickPhoto}
                    style={{
                      width: 100,
                      height: 125,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: colors.border,
                      borderStyle: 'dashed',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.card,
                    }}
                  >
                    <Ionicons name="camera-outline" size={28} color={colors.textSecondary} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Add Photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={{
                  backgroundColor: colors.accent + '15',
                  borderRadius: 12,
                  padding: spacing.md,
                  marginTop: spacing.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="information-circle" size={20} color={colors.accent} />
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 13,
                    marginLeft: spacing.sm,
                    flex: 1,
                  }}
                >
                  Your first photo will be your main profile picture. Add up to 6 photos.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        <View style={{ padding: spacing.xl }}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={loading || (step === 5 && photos.length === 0)}
            style={{
              backgroundColor: (step === 5 && photos.length === 0) ? colors.border : colors.accent,
              borderRadius: 16,
              padding: spacing.lg,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                {step === 5 ? 'Complete Setup ✨' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
