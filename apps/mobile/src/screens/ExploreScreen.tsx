import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';
import { apiService } from '../services/api';

interface User {
  _id: string;
  name: string;
  department: string;
  year: number;
  bio?: string;
  interests: string[];
  clubs: string[];
  lookingFor: string;
  avatarUrl?: string;
  verified: boolean;
}

interface ExploreScreenProps {
  navigation: any;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string | null>(null);

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil Engineering', 'Biotechnology', 'Architecture', 'Design', 'Physics', 'Mathematics', 'Psychology'];
  const years = [1, 2, 3, 4];
  const lookingForOptions = ['Dating', 'Friends', 'Both'];

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchText, selectedDepartment, selectedYear, selectedLookingFor, profiles]);

  const loadProfiles = async () => {
    try {
      const data = await apiService.getExploreProfiles();
      if (data.items && data.items.length > 0) {
        setProfiles(data.items);
      }
    } catch (error) {
      console.log('Error loading profiles, using empty state');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(profile =>
        profile.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        (profile.interests || []).some(interest =>
          interest?.toLowerCase().includes(searchText.toLowerCase())
        ) ||
        (profile.clubs || []).some(club =>
          club?.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(profile => profile.department === selectedDepartment);
    }

    // Year filter
    if (selectedYear) {
      filtered = filtered.filter(profile => profile.year === selectedYear);
    }

    // Looking for filter
    if (selectedLookingFor) {
      filtered = filtered.filter(profile => profile.lookingFor === selectedLookingFor);
    }

    setFilteredProfiles(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(null);
    setSelectedYear(null);
    setSelectedLookingFor(null);
  };

  const navigateToProfile = (userId: string) => {
    (navigation as any).navigate('UserProfile', { userId });
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary }}>
          Explore
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Discover by interests and clubs
        </Text>

        {/* Search Bar */}
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="Search by name, interest, club"
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            style={{
              backgroundColor: colors.card,
              borderRadius: radii.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              paddingRight: 50,
              borderColor: colors.border,
              borderWidth: 1,
              marginBottom: spacing.md,
              color: colors.text,
            }}
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={{
                position: 'absolute',
                right: 15,
                top: '50%',
                transform: [{ translateY: -10 }],
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.sm }}>
            {/* Department Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  onPress={() => setSelectedDepartment(selectedDepartment === dept ? null : dept)}
                  style={{
                    backgroundColor: selectedDepartment === dept ? colors.primary : colors.card,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: selectedDepartment === dept ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{
                    color: selectedDepartment === dept ? 'white' : colors.text,
                    fontSize: 12,
                    fontWeight: '500',
                  }}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Year and Looking For Filters */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              onPress={() => setSelectedYear(selectedYear === year ? null : year)}
              style={{
                backgroundColor: selectedYear === year ? colors.primary : colors.card,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 8,
                borderWidth: 1,
                borderColor: selectedYear === year ? colors.primary : colors.border,
              }}
            >
              <Text style={{
                color: selectedYear === year ? 'white' : colors.text,
                fontSize: 12,
                fontWeight: '500',
              }}>
                Year {year}
              </Text>
            </TouchableOpacity>
          ))}

          {lookingForOptions.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setSelectedLookingFor(selectedLookingFor === option ? null : option)}
              style={{
                backgroundColor: selectedLookingFor === option ? colors.primary : colors.card,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 8,
                borderWidth: 1,
                borderColor: selectedLookingFor === option ? colors.primary : colors.border,
              }}
            >
              <Text style={{
                color: selectedLookingFor === option ? 'white' : colors.text,
                fontSize: 12,
                fontWeight: '500',
              }}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Clear Filters Button */}
          {(selectedDepartment || selectedYear || selectedLookingFor || searchText) && (
            <TouchableOpacity
              onPress={clearFilters}
              style={{
                backgroundColor: colors.background,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginLeft: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigateToProfile(item._id)}
            style={{
              backgroundColor: colors.card,
              borderRadius: radii.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{
                  uri: item.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg'
                }}
                style={{
                  height: 64,
                  width: 64,
                  borderRadius: 18,
                  marginRight: spacing.md
                }}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                    {item.name}
                  </Text>
                  {item.verified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4ADE80"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  {item.department} · Year {item.year}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                  Looking for {item.lookingFor}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>

            {/* Interests Preview */}
            {item.interests.length > 0 && (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: spacing.sm,
                gap: 6
              }}>
                {item.interests.slice(0, 3).map((interest, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.primary + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{
                      color: colors.primary,
                      fontSize: 11,
                      fontWeight: '500',
                    }}>
                      {interest}
                    </Text>
                  </View>
                ))}
                {item.interests.length > 3 && (
                  <View style={{
                    backgroundColor: colors.background,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      color: colors.textSecondary,
                      fontSize: 11,
                    }}>
                      +{item.interests.length - 3} more
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
              No profiles found
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}>
              Try adjusting your filters
            </Text>
          </View>
        }
      />
    </View>
  );
};
