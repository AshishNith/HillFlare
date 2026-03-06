import React, { useEffect, useState } from 'react';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';
import { Tag } from '../components/Tag';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';

export const ProfileScreen: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const clearUser = useUserStore((state) => state.clearUser);
  const [matches, setMatches] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedBio, setEditedBio] = useState(user?.bio || '');
  const [editedInterests, setEditedInterests] = useState<string[]>(user?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [editedClubs, setEditedClubs] = useState<string[]>(user?.clubs || []);
  const [newClub, setNewClub] = useState('');
  const [editedLookingFor, setEditedLookingFor] = useState(user?.lookingFor || '');
  const [editedGender, setEditedGender] = useState(user?.gender || '');
  const [editedInterestedIn, setEditedInterestedIn] = useState<string[]>(user?.interestedIn || []);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(user?.galleryUrls || []);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadProfile();
    loadMatches();
  }, []);

  useEffect(() => {
    if (user) {
      setEditedBio(user.bio || '');
      setEditedInterests(user.interests || []);
      setEditedClubs(user.clubs || []);
      setEditedLookingFor(user.lookingFor || '');
      setEditedGender(user.gender || '');
      setEditedInterestedIn(user.interestedIn || []);
      setGalleryPhotos(user.galleryUrls || []);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      // Only show full loading spinner if we have no cached user
      if (!user) setLoadingProfile(true);
      const data = await apiService.getMe();
      setUser(data);
    } catch (error) {
      console.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadMatches = async () => {
    try {
      const data = await apiService.getMatches();
      setMatches(data.items || []);
    } catch (error) {
      console.error('Failed to load matches');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          clearUser();
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const updated = await apiService.updateProfile({
        bio: editedBio,
        interests: editedInterests,
        clubs: editedClubs,
        lookingFor: editedLookingFor,
        gender: editedGender,
        interestedIn: editedInterestedIn,
        galleryUrls: galleryPhotos,
        ...(selectedPhoto && { avatarUrl: selectedPhoto }),
      });
      setUser(updated.data || updated);
      setEditMode(false);
      setSelectedPhoto(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const dataUri = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setSelectedPhoto(dataUri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const dataUri = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setSelectedPhoto(dataUri);
    }
  };

  const addGalleryPhoto = async () => {
    if (galleryPhotos.length >= 6) {
      Alert.alert('Limit Reached', 'You can add up to 6 photos.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
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
      setGalleryPhotos((prev) => [...prev, dataUri]);
    }
  };

  const removeGalleryPhoto = (index: number) => {
    setGalleryPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const addInterest = () => {
    if (editedInterests.length >= 20) {
      Alert.alert('Limit Reached', 'You can add up to 20 interests.');
      return;
    }
    if (newInterest.trim() && !editedInterests.includes(newInterest.trim())) {
      setEditedInterests([...editedInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditedInterests(editedInterests.filter(i => i !== interest));
  };

  const addClub = () => {
    if (editedClubs.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 clubs.');
      return;
    }
    if (newClub.trim() && !editedClubs.includes(newClub.trim())) {
      setEditedClubs([...editedClubs, newClub.trim()]);
      setNewClub('');
    }
  };

  const removeClub = (club: string) => {
    setEditedClubs(editedClubs.filter((c) => c !== club));
  };

  const interests = editMode ? editedInterests : (user?.interests || []);
  const clubs = editMode ? editedClubs : (user?.clubs || []);

  if (loadingProfile && !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
      <View style={{ position: 'relative' }}>
        <Image
          source={{
            uri: selectedPhoto || user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
          }}
          style={{ width: '100%', height: 280, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        />
        {editMode && (
          <TouchableOpacity
            onPress={showPhotoOptions}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: colors.primary,
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ padding: spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
              {user?.name || 'User'}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
              {user?.department || 'Department'} · Year {user?.year || 1}
            </Text>
            {user?.email && (
              <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
                {user.email}
              </Text>
            )}
          </View>
          <TouchableOpacity
            disabled={savingProfile}
            onPress={() => {
              if (editMode) {
                handleSaveProfile();
              } else {
                setEditMode(true);
              }
            }}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              opacity: savingProfile ? 0.7 : 1,
            }}
          >
            {savingProfile ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name={editMode ? 'checkmark' : 'pencil'} size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                  {editMode ? 'Save' : 'Edit'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {editMode ? (
          <View style={{ marginTop: spacing.md }}>
            <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Bio ({editedBio.length}/500)</Text>
            <TextInput
              value={editedBio}
              onChangeText={setEditedBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={{
                backgroundColor: colors.card,
                borderRadius: radii.lg,
                padding: spacing.md,
                borderColor: colors.border,
                borderWidth: 1,
                color: colors.textPrimary,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
          </View>
        ) : (
          <Text style={{ color: colors.textPrimary, marginTop: spacing.sm }}>
            {user?.bio || 'No bio yet'}
          </Text>
        )}

        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Interests</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {interests.map((interest) => (
              <View key={interest} style={{ position: 'relative' }}>
                <Tag label={interest} />
                {editMode && (
                  <TouchableOpacity
                    onPress={() => removeInterest(interest)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: colors.accent,
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {editMode && (
            <View style={{ flexDirection: 'row', marginTop: spacing.sm, gap: 8 }}>
              <TextInput
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Add interest"
                placeholderTextColor={colors.textSecondary}
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderRadius: radii.lg,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderColor: colors.border,
                  borderWidth: 1,
                  color: colors.textPrimary,
                }}
                onSubmitEditing={addInterest}
              />
              <TouchableOpacity
                onPress={addInterest}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: radii.lg,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Clubs</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {clubs.map((club) => (
              <View key={club} style={{ position: 'relative' }}>
                <Tag label={club} />
                {editMode && (
                  <TouchableOpacity
                    onPress={() => removeClub(club)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: colors.accent,
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {editMode && (
            <View style={{ flexDirection: 'row', marginTop: spacing.sm, gap: 8 }}>
              <TextInput
                value={newClub}
                onChangeText={setNewClub}
                placeholder="Add club"
                placeholderTextColor={colors.textSecondary}
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderRadius: radii.lg,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderColor: colors.border,
                  borderWidth: 1,
                  color: colors.textPrimary,
                }}
                onSubmitEditing={addClub}
              />
              <TouchableOpacity
                onPress={addClub}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: radii.lg,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Looking For</Text>
          {editMode ? (
            <TextInput
              value={editedLookingFor}
              onChangeText={setEditedLookingFor}
              placeholder="Dating, Friends, Both"
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.card,
                borderRadius: radii.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderColor: colors.border,
                borderWidth: 1,
                color: colors.textPrimary,
              }}
            />
          ) : (
            <Text style={{ color: colors.textPrimary }}>
              {user?.lookingFor || 'Not set'}
            </Text>
          )}
        </View>

        {/* Gender */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Gender</Text>
          {editMode ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'non-binary', label: 'Non-binary' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setEditedGender(opt.value)}
                  style={{
                    backgroundColor: editedGender === opt.value ? colors.accent : colors.card,
                    borderWidth: 1,
                    borderColor: editedGender === opt.value ? colors.accent : colors.border,
                    borderRadius: 20,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: editedGender === opt.value ? 'white' : colors.textPrimary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.textPrimary }}>
              {user?.gender
                ? { male: 'Male', female: 'Female', 'non-binary': 'Non-binary', prefer_not_to_say: 'Prefer not to say' }[user.gender] || user.gender
                : 'Not set'}
            </Text>
          )}
        </View>

        {/* Interested In */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Interested In</Text>
          {editMode ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                { value: 'male', label: 'Men' },
                { value: 'female', label: 'Women' },
                { value: 'non-binary', label: 'Non-binary' },
              ].map((opt) => {
                const selected = editedInterestedIn.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      setEditedInterestedIn((prev) =>
                        selected ? prev.filter((v) => v !== opt.value) : [...prev, opt.value]
                      );
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
            </View>
          ) : (
            <Text style={{ color: colors.textPrimary }}>
              {user?.interestedIn && user.interestedIn.length > 0
                ? user.interestedIn.map((v: string) => ({ male: 'Men', female: 'Women', 'non-binary': 'Non-binary' }[v] || v)).join(', ')
                : 'Not set'}
            </Text>
          )}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Photos</Text>
            {editMode && (
              <TouchableOpacity onPress={addGalleryPhoto}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          {galleryPhotos.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>No photos added yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
              {galleryPhotos.map((photo, index) => (
                <View key={`${photo}-${index}`} style={{ marginRight: spacing.sm }}>
                  <Image
                    source={{ uri: photo }}
                    style={{ width: 110, height: 140, borderRadius: 14 }}
                  />
                  {editMode && (
                    <TouchableOpacity
                      onPress={() => removeGalleryPhoto(index)}
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        backgroundColor: colors.accent,
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radii.lg,
            padding: spacing.md,
            borderColor: colors.border,
            borderWidth: 1,
            marginTop: spacing.lg,
          }}
        >
          <Text style={{ color: colors.textSecondary }}>Matches</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{matches.length}</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: colors.card,
            borderRadius: radii.lg,
            padding: spacing.md,
            borderColor: colors.border,
            borderWidth: 1,
            marginTop: spacing.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.accent, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
