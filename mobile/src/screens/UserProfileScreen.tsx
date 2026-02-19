import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    ActivityIndicator, TouchableOpacity, Dimensions,
    FlatList, NativeSyntheticEvent, NativeScrollEvent, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

interface UserProfile {
    _id: string;
    name: string;
    department: string;
    year: number;
    interests: string[];
    clubs: string[];
    photos: string[];
    bio: string;
    avatar: string;
    hasSwiped?: boolean;
    swipeType?: 'like' | 'pass';
    isConnected?: boolean;
}

export default function UserProfileScreen({ route, navigation }: any) {
    const { userId } = route.params;
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activePhoto, setActivePhoto] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/users/${userId}`);
            setUser(data.data);
            setError('');
        } catch {
            setError('Profile not found');
        }
        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setActivePhoto(idx);
    };

    const handleUndo = async () => {
        if (!user || actionLoading) return;
        Alert.alert('Undo Action', 'Are you sure you want to undo your swipe?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Undo',
                style: 'destructive',
                onPress: async () => {
                    setActionLoading(true);
                    try {
                        await api.delete(`/swipes/undo/${user._id}`);
                        // Refresh profile data to reset state
                        const { data } = await api.get(`/users/${user._id}`);
                        setUser(data.data);
                    } catch (error) {
                        Alert.alert('Error', 'Failed to undo action');
                    } finally {
                        setActionLoading(false);
                    }
                }
            }
        ]);
    };

    const handleMessage = async () => {
        if (!user) return;
        try {
            await api.post('/chats', { participantId: user._id });
            navigation.navigate('Main', { screen: 'Chat' });
        } catch (err: any) {
            const code = err?.response?.data?.error;
            if (code === 'not_connected') {
                Alert.alert(
                    'Not Connected',
                    `You and ${user.name} haven't matched yet. Like each other first to unlock messaging.`,
                    [{ text: 'Got it' }]
                );
            } else {
                navigation.navigate('Main', { screen: 'Chat' });
            }
        }
    };

    const handleSwipe = async (type: 'like' | 'pass') => {
        if (!user || actionLoading) return;
        setActionLoading(true);
        try {
            await api.post('/swipes', { toUser: user._id, type });

            // Instead of going back, refresh the page to show status
            const { data } = await api.get(`/users/${user._id}`);
            setUser(data.data);

        } catch (error: any) {
            console.error('Action failed', error);
            const errorMessage = error.response?.data?.error || 'Failed to perform action.';

            if (errorMessage.includes('Already swiped')) {
                // If already swiped, just refresh to get true state
                const { data } = await api.get(`/users/${user._id}`);
                setUser(data.data);
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error || !user) {
        return (
            <View style={s.center}>
                <Ionicons name="person-outline" size={48} color={theme.colors.text.subtle} style={{ marginBottom: 12 }} />
                <Text style={s.errorTitle}>Profile not found</Text>
                <Text style={s.errorSub}>This user may not exist or has been removed.</Text>
                <TouchableOpacity style={s.backBtnAlt} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <Text style={s.backBtnAltText}>Go back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    const photos = user.photos || [];
    const hasPhotos = photos.length > 0;

    return (
        <View style={s.container}>
            {/* Back button (floating) */}
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Action Buttons - Top Right */}
            {user && !user.hasSwiped && (
                <View style={s.actionButtonsTop}>
                    <TouchableOpacity style={[s.actionBtnTop, s.likeBtnTop]} onPress={() => handleSwipe('like')} disabled={actionLoading}>
                        <Ionicons name="heart" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtnTop, s.passBtnTop]} onPress={() => handleSwipe('pass')} disabled={actionLoading}>
                        <Ionicons name="close" size={24} color="#EF4444" />
                    </TouchableOpacity>
                    {user.isConnected && (
                        <TouchableOpacity style={[s.actionBtnTop, s.msgBtnTop]} onPress={handleMessage}>
                            <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primaryLight} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Already Swiped State - Top Right */}
            {user && user.hasSwiped && (
                <View style={s.actionButtonsTop}>
                    <View style={[s.statusBadgeTop, user.swipeType === 'like' ? s.statusLikeTop : s.statusPassTop]}>
                        <Ionicons
                            name={user.swipeType === 'like' ? "heart" : "close"}
                            size={18}
                            color={user.swipeType === 'like' ? "#fff" : "#EF4444"}
                        />
                    </View>
                    {user.isConnected && (
                        <TouchableOpacity style={[s.actionBtnTop, s.msgBtnTop]} onPress={handleMessage}>
                            <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primaryLight} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[s.actionBtnTop, s.undoBtnTop]} onPress={handleUndo} disabled={actionLoading}>
                        <Ionicons name="arrow-undo" size={18} color={theme.colors.text.muted} />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Photo carousel */}
                {hasPhotos ? (
                    <View>
                        <FlatList
                            data={photos}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={({ item }) => (
                                <Image source={{ uri: item }} style={{ width, height: width * 1.25 }} resizeMode="cover" />
                            )}
                        />
                        {/* Dot indicators */}
                        {photos.length > 1 && (
                            <View style={s.dots}>
                                {photos.map((_, i) => (
                                    <View key={i} style={[s.dot, activePhoto === i && s.dotActive]} />
                                ))}
                            </View>
                        )}
                        {/* Counter badge */}
                        <View style={s.counterBadge}>
                            <Text style={s.counterText}>{activePhoto + 1}/{photos.length}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={s.avatarPlaceholder}>
                        <View style={s.avatarCircle}>
                            <Text style={s.avatarInitials}>{initials}</Text>
                        </View>
                    </View>
                )}

                {/* Profile content */}
                <View style={s.content}>
                    {/* Name & info */}
                    <Text style={s.name}>{user.name}</Text>
                    <View style={s.metaRow}>
                        <Ionicons name="book-outline" size={13} color={theme.colors.text.muted} />
                        <Text style={s.metaText}>{user.department}</Text>
                        <Text style={s.metaDot}>·</Text>
                        <Text style={s.metaText}>Year {user.year}</Text>
                    </View>

                    <View style={s.divider} />

                    {/* Bio */}
                    {user.bio ? (
                        <>
                            <View style={s.section}>
                                <Text style={s.sectionLabel}>ABOUT</Text>
                                <Text style={s.bioText}>{user.bio}</Text>
                            </View>
                            <View style={s.divider} />
                        </>
                    ) : null}

                    {/* Interests */}
                    {user.interests?.length > 0 && (
                        <>
                            <View style={s.section}>
                                <View style={s.sectionLabelRow}>
                                    <Ionicons name="heart-outline" size={13} color={theme.colors.text.muted} />
                                    <Text style={s.sectionLabel}>INTERESTS</Text>
                                </View>
                                <View style={s.chipGrid}>
                                    {user.interests.map(i => (
                                        <View key={i} style={s.chip}>
                                            <Text style={s.chipText}>{i}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <View style={s.divider} />
                        </>
                    )}

                    {/* Clubs */}
                    {user.clubs?.length > 0 && (
                        <View style={s.section}>
                            <View style={s.sectionLabelRow}>
                                <Ionicons name="people-outline" size={13} color={theme.colors.text.muted} />
                                <Text style={s.sectionLabel}>CLUBS</Text>
                            </View>
                            <View style={s.chipGrid}>
                                {user.clubs.map(c => (
                                    <View key={c} style={s.clubChip}>
                                        <Text style={s.clubChipText}>{c}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary, padding: 20 },

    backBtn: {
        position: 'absolute', top: 50, left: 16, zIndex: 10,
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Action Buttons - Top Right
    actionButtonsTop: {
        position: 'absolute', top: 50, right: 16, zIndex: 10,
        flexDirection: 'column', gap: 10,
    },
    actionBtnTop: {
        width: 46, height: 46, borderRadius: 23,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
    },
    likeBtnTop: { backgroundColor: theme.colors.primary },
    passBtnTop: { backgroundColor: theme.colors.background.primary, borderWidth: 1.5, borderColor: '#EF4444' },
    msgBtnTop: { backgroundColor: theme.colors.background.primary, borderWidth: 1.5, borderColor: theme.colors.glass.border },
    undoBtnTop: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1.5, borderColor: theme.colors.glass.border },
    
    // Status Badge - Top Right
    statusBadgeTop: {
        width: 46, height: 46, borderRadius: 23,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
    },
    statusLikeTop: { backgroundColor: theme.colors.primary },
    statusPassTop: { backgroundColor: theme.colors.background.primary, borderWidth: 1.5, borderColor: '#EF4444' },

    // Photo carousel
    dots: {
        position: 'absolute', bottom: 14, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
    dotActive: { width: 18, backgroundColor: '#fff' },
    counterBadge: {
        position: 'absolute', top: 50, right: 16,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)',
    },
    counterText: { fontSize: 11, fontWeight: '700', color: '#fff' },

    // Avatar placeholder
    avatarPlaceholder: {
        height: width * 0.8, justifyContent: 'center', alignItems: 'center',
        backgroundColor: theme.colors.background.tertiary,
    },
    avatarCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(139,92,246,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarInitials: { fontSize: 36, fontWeight: '800', color: theme.colors.primaryLight },

    // Content
    content: { paddingTop: 24 },
    name: { fontSize: 26, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.3, paddingHorizontal: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginTop: 8 },
    metaText: { fontSize: 13, color: theme.colors.text.muted },
    metaDot: { fontSize: 13, color: theme.colors.text.subtle },

    divider: { height: 1, backgroundColor: theme.colors.glass.border, marginVertical: 20 },

    section: { paddingHorizontal: 20 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.text.muted, letterSpacing: 1.2, marginBottom: 10 },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },

    bioText: { fontSize: 14, color: theme.colors.text.muted, lineHeight: 22 },

    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 4, backgroundColor: 'rgba(139,92,246,0.1)' },
    chipText: { fontSize: 12, fontWeight: '500', color: theme.colors.primaryLight },
    clubChip: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 4, backgroundColor: 'rgba(52,211,153,0.1)' },
    clubChipText: { fontSize: 12, fontWeight: '500', color: theme.colors.success },

    // Error state
    errorTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 6 },
    errorSub: { fontSize: 13, color: theme.colors.text.muted, textAlign: 'center', marginBottom: 24 },
    backBtnAlt: {
        paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8,
        backgroundColor: theme.colors.primary,
    },
    backBtnAltText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
