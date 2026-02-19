import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput, StatusBar,
    ActivityIndicator, TouchableOpacity, Animated, Modal,
    ScrollView, Pressable, Platform, Image, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../utils/theme';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology', 'Mathematics', 'Physics'];
const INTERESTS = ['Music', 'Movies', 'Gaming', 'Reading', 'Travel', 'Photography', 'Cooking', 'Fitness', 'Art', 'Technology', 'Sports', 'Anime'];
const YEARS = ['1', '2', '3', '4'];

export default function ExploreScreen() {
    const navigation = useNavigation<any>();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [focused, setFocused] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const underlineAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(400)).current;

    // Pending filter state (inside modal, not yet applied)
    const [pendingDept, setPendingDept] = useState('');
    const [pendingInterest, setPendingInterest] = useState('');
    const [pendingYear, setPendingYear] = useState('');

    // Applied filter state
    const [appliedDept, setAppliedDept] = useState('');
    const [appliedInterest, setAppliedInterest] = useState('');
    const [appliedYear, setAppliedYear] = useState('');

    const activeFilterCount = [appliedDept, appliedInterest, appliedYear].filter(Boolean).length;

    // Debounce search
    useEffect(() => {
        if (search.trim()) {
            setLoading(true);
        }
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch when search or filters change
    useEffect(() => {
        if (debouncedSearch.trim() || appliedDept || appliedInterest || appliedYear) {
            fetchProfiles();
        } else {
            setProfiles([]);
            setLoading(false);
        }
    }, [debouncedSearch, appliedDept, appliedInterest, appliedYear]);

    const fetchProfiles = async () => {
        try {
            const params: Record<string, string> = {};
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
            if (appliedDept) params.department = appliedDept;
            if (appliedInterest) params.interest = appliedInterest;
            if (appliedYear) params.year = appliedYear;
            const { data } = await api.get('/explore', { params });
            setProfiles(data.data || []);
        } catch { }
        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfiles();
    };

    const onFocus = () => {
        setFocused(true);
        Animated.timing(underlineAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };
    const onBlur = () => {
        setFocused(false);
        Animated.timing(underlineAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    };
    const underlineWidth = underlineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    const openFilter = () => {
        // Sync pending state with applied state when opening
        setPendingDept(appliedDept);
        setPendingInterest(appliedInterest);
        setPendingYear(appliedYear);
        setFilterVisible(true);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    };

    const closeFilter = () => {
        Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }).start(() => setFilterVisible(false));
    };

    const applyFilters = () => {
        setAppliedDept(pendingDept);
        setAppliedInterest(pendingInterest);
        setAppliedYear(pendingYear);
        closeFilter();
    };

    const clearFilters = () => {
        setPendingDept('');
        setPendingInterest('');
        setPendingYear('');
    };

    const clearApplied = () => {
        setAppliedDept('');
        setAppliedInterest('');
        setAppliedYear('');
    };

    const getHue = (id: string) => (id.charCodeAt(0) * 47 + (id.charCodeAt(1) || 0) * 13) % 360;
    const hasSearchOrFilters = debouncedSearch.trim() || activeFilterCount > 0;

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.primary} />

            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Explore</Text>
                    <Text style={s.subtitle}>{profiles.length} people found</Text>
                </View>
            </View>

            {/* Search + Filter row */}
            <View style={s.searchRow}>
                {/* Search bar */}
                <View style={s.searchBarWrap}>
                    <View style={s.searchBar}>
                        <Ionicons
                            name="search-outline"
                            size={17}
                            color={focused ? theme.colors.primary : theme.colors.text.muted}
                        />
                        <TextInput
                            ref={inputRef}
                            style={s.searchInput}
                            value={search}
                            onChangeText={setSearch}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            placeholder="Search name, department..."
                            placeholderTextColor={theme.colors.text.subtle}
                            returnKeyType="search"
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearch(''); inputRef.current?.focus(); }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close-circle" size={17} color={theme.colors.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={s.underlineTrack}>
                        <Animated.View style={[s.underlineFill, { width: underlineWidth }]} />
                    </View>
                </View>

                {/* Filter button */}
                <TouchableOpacity style={s.filterBtn} onPress={openFilter} activeOpacity={0.7}>
                    <Ionicons
                        name="options-outline"
                        size={20}
                        color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.text.muted}
                    />
                    {activeFilterCount > 0 && (
                        <View style={s.filterBadge}>
                            <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
                <View style={s.activeTags}>
                    {appliedDept ? (
                        <TouchableOpacity style={s.tag} onPress={() => setAppliedDept('')}>
                            <Text style={s.tagText}>{appliedDept}</Text>
                            <Ionicons name="close" size={11} color={theme.colors.primaryLight} />
                        </TouchableOpacity>
                    ) : null}
                    {appliedInterest ? (
                        <TouchableOpacity style={s.tag} onPress={() => setAppliedInterest('')}>
                            <Text style={s.tagText}>{appliedInterest}</Text>
                            <Ionicons name="close" size={11} color={theme.colors.primaryLight} />
                        </TouchableOpacity>
                    ) : null}
                    {appliedYear ? (
                        <TouchableOpacity style={s.tag} onPress={() => setAppliedYear('')}>
                            <Text style={s.tagText}>Year {appliedYear}</Text>
                            <Ionicons name="close" size={11} color={theme.colors.primaryLight} />
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={clearApplied}>
                        <Text style={s.clearAll}>Clear all</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={s.divider} />

            {/* Grid */}
            {loading && hasSearchOrFilters ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={profiles}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 1 }}
                    contentContainerStyle={{ gap: 1, paddingBottom: 24 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
                            {!hasSearchOrFilters ? (
                                <>
                                    <Ionicons name="search-outline" size={36} color={theme.colors.text.subtle} />
                                    <Text style={{ color: theme.colors.text.muted, fontSize: 15, fontWeight: '600' }}>Ready to explore?</Text>
                                    <Text style={{ color: theme.colors.text.subtle, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 }}>
                                        Search by name or apply filters to discover people
                                    </Text>
                                    <TouchableOpacity
                                        style={{
                                            marginTop: 12,
                                            paddingHorizontal: 20,
                                            paddingVertical: 10,
                                            backgroundColor: theme.colors.primary,
                                            borderRadius: 20,
                                        }}
                                        onPress={openFilter}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Apply Filters</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="search-outline" size={36} color={theme.colors.text.subtle} />
                                    <Text style={{ color: theme.colors.text.muted, fontSize: 15, fontWeight: '600' }}>No profiles found</Text>
                                    <Text style={{ color: theme.colors.text.subtle, fontSize: 13 }}>Try adjusting your filters</Text>
                                </>
                            )}
                        </View>
                    }
                    renderItem={({ item }) => {
                        const hue = getHue(item._id);
                        return (
                            <TouchableOpacity
                                style={s.cell}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
                            >
                                {item.photos?.[0] ? (
                                    <Image source={{ uri: item.photos[0] }} style={s.avatarImg} />
                                ) : (
                                    <View style={[s.avatar, { backgroundColor: `hsla(${hue}, 35%, 15%, 1)` }]}>
                                        <Text style={[s.initials, { color: `hsl(${hue}, 65%, 70%)` }]}>{item.name?.[0]}</Text>
                                    </View>
                                )}
                                <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                                <Text style={s.dept} numberOfLines={1}>{item.department}</Text>
                                <View style={s.scoreBadge}>
                                    <Text style={s.scoreText}>{item.compatibilityScore}% match</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            {/* ── Filter Modal (bottom sheet) ── */}
            <Modal visible={filterVisible} transparent animationType="none" onRequestClose={closeFilter}>
                {/* Backdrop */}
                <Pressable style={s.backdrop} onPress={closeFilter} />

                {/* Sheet */}
                <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Handle */}
                    <View style={s.handle} />

                    {/* Header */}
                    <View style={s.sheetHeader}>
                        <Text style={s.sheetTitle}>Filters</Text>
                        <TouchableOpacity onPress={closeFilter}>
                            <Ionicons name="close" size={22} color={theme.colors.text.muted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                        {/* Department */}
                        <View style={s.filterSection}>
                            <Text style={s.filterLabel}>DEPARTMENT</Text>
                            <View style={s.chipGrid}>
                                {DEPARTMENTS.map(d => (
                                    <TouchableOpacity
                                        key={d}
                                        style={[s.chip, pendingDept === d && s.chipActive]}
                                        onPress={() => setPendingDept(pendingDept === d ? '' : d)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[s.chipText, pendingDept === d && s.chipTextActive]}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Year */}
                        <View style={s.filterSection}>
                            <Text style={s.filterLabel}>YEAR</Text>
                            <View style={s.chipGrid}>
                                {YEARS.map(y => (
                                    <TouchableOpacity
                                        key={y}
                                        style={[s.chip, pendingYear === y && s.chipActive]}
                                        onPress={() => setPendingYear(pendingYear === y ? '' : y)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[s.chipText, pendingYear === y && s.chipTextActive]}>Year {y}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Interests */}
                        <View style={s.filterSection}>
                            <Text style={s.filterLabel}>INTEREST</Text>
                            <View style={s.chipGrid}>
                                {INTERESTS.map(i => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[s.chip, pendingInterest === i && s.chipActive]}
                                        onPress={() => setPendingInterest(pendingInterest === i ? '' : i)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[s.chipText, pendingInterest === i && s.chipTextActive]}>{i}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action buttons */}
                    <View style={s.sheetActions}>
                        <TouchableOpacity style={s.clearBtn} onPress={clearFilters} activeOpacity={0.7}>
                            <Text style={s.clearBtnText}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.applyBtn} onPress={applyFilters} activeOpacity={0.85}>
                            <Text style={s.applyBtnText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
    title: { fontSize: 26, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: theme.colors.text.muted, marginTop: 2 },

    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
    searchBarWrap: { flex: 1 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    },
    searchInput: { flex: 1, color: theme.colors.text.primary, fontSize: 14, paddingVertical: 0 },
    underlineTrack: { height: 2, backgroundColor: 'transparent', marginTop: 2, overflow: 'hidden' },
    underlineFill: { height: 2, backgroundColor: theme.colors.primary, borderRadius: 1 },

    filterBtn: {
        width: 42, height: 42,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
    },
    filterBadge: {
        position: 'absolute', top: 6, right: 6,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    filterBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },

    activeTags: {
        flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 8, gap: 6,
    },
    tag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(139,92,246,0.12)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4,
    },
    tagText: { fontSize: 12, fontWeight: '600', color: theme.colors.primaryLight },
    clearAll: { fontSize: 12, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 },

    divider: { height: 1, backgroundColor: theme.colors.glass.border },

    cell: { flex: 1, backgroundColor: theme.colors.background.secondary, padding: 16, alignItems: 'center' },
    avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarImg: { width: 56, height: 56, borderRadius: 28, marginBottom: 10 },
    initials: { fontSize: 22, fontWeight: '700' },
    name: { fontSize: 14, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 2, textAlign: 'center' },
    dept: { fontSize: 11, color: theme.colors.text.muted, marginBottom: 8, textAlign: 'center' },
    scoreBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
    scoreText: { fontSize: 11, fontWeight: '600', color: theme.colors.success },

    // Modal / bottom sheet
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.colors.background.secondary,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    handle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: theme.colors.background.tertiary,
        alignSelf: 'center', marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text.primary },

    filterSection: { marginBottom: 24 },
    filterLabel: {
        fontSize: 11, fontWeight: '700', color: theme.colors.text.muted,
        letterSpacing: 1.2, marginBottom: 10,
    },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 4, backgroundColor: theme.colors.background.tertiary,
        borderWidth: 1, borderColor: theme.colors.glass.border,
    },
    chipActive: { backgroundColor: 'rgba(139,92,246,0.18)', borderColor: theme.colors.primary },
    chipText: { fontSize: 13, fontWeight: '500', color: theme.colors.text.muted },
    chipTextActive: { color: theme.colors.primaryLight, fontWeight: '600' },

    sheetActions: { flexDirection: 'row', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.glass.border },
    clearBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 8,
        backgroundColor: theme.colors.background.tertiary, alignItems: 'center',
    },
    clearBtnText: { fontSize: 15, fontWeight: '600', color: theme.colors.text.muted },
    applyBtn: {
        flex: 2, paddingVertical: 14, borderRadius: 8,
        backgroundColor: theme.colors.primary, alignItems: 'center',
    },
    applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
