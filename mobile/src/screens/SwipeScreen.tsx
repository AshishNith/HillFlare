import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Dimensions, StatusBar, ActivityIndicator, Image, ScrollView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Swiper from 'react-native-deck-swiper';
import api from '../services/api';
import { theme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface Profile {
    _id: string; name: string; department: string; year: number;
    interests: string[]; photos: string[]; bio: string; avatar?: string;
}

export default function SwipeScreen() {
    const navigation = useNavigation<any>();
    const swiperRef = React.useRef<any>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allSwiped, setAllSwiped] = useState(false);
    const [isMatch, setIsMatch] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const { data } = await api.get('/swipes/feed'); setProfiles(data.data || []); } catch { }
            setLoading(false);
        })();
    }, []);

    const handleSwipe = async (index: number, type: 'like' | 'pass') => {
        const profile = profiles[index];
        if (!profile) return;
        try {
            const { data } = await api.post('/swipes', { toUser: profile._id, type });
            if (data.data?.isMatch) { setIsMatch(true); setTimeout(() => setIsMatch(false), 2500); }
        } catch (error) {
            console.error('Swipe error:', error);
        }
        setCurrentIndex(index + 1);
    };

    const current = profiles[currentIndex];
    const hue = current ? (current._id.charCodeAt(0) * 47 + current._id.charCodeAt(1) * 13) % 360 : 270;

    if (loading) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={s.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={s.header}>
                <View style={s.headerLeft}>
                    <Ionicons name="flame" size={24} color={theme.colors.primary} />
                    <Text style={s.headerTitle}>Discover</Text>
                </View>
                <View style={s.headerRight}>
                    {profiles.length > 0 && (
                        <View style={s.counter}>
                            <Text style={s.counterText}>{Math.max(0, profiles.length - currentIndex)} left</Text>
                        </View>
                    )}
                    <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Notifications')}>
                        <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Match overlay */}
            {isMatch && (
                <View style={s.matchOverlay}>
                    <View style={s.matchCard}>
                        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(139,92,246,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                            <Ionicons name="heart" size={36} color={theme.colors.primary} />
                        </View>
                        <Text style={s.matchTitle}>It's a Match!</Text>
                        <Text style={s.matchSub}>You both liked each other</Text>
                        <TouchableOpacity style={s.matchBtn} onPress={() => setIsMatch(false)}>
                            <Text style={s.matchBtnText}>Keep Swiping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Card Stack Container */}
            {!allSwiped && profiles.length > 0 ? (
                <View style={s.cardWrap}>
                    <Swiper
                        ref={swiperRef}
                        cards={profiles}
                        cardIndex={currentIndex}
                        renderCard={(current) => {
                            if (!current) return null;
                            const hue = (current._id.charCodeAt(0) * 47 + current._id.charCodeAt(1) * 13) % 360;
                            return (
                                <View style={s.card}>
                                    {/* Photo / Avatar */}
                                    {current.photos?.[0] || current.avatar ? (
                                        <Image
                                            source={{ uri: current.photos?.[0] || current.avatar }}
                                            style={s.photo}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[s.photoPlaceholder, { backgroundColor: `hsla(${hue}, 40%, 15%, 1)` }]}>
                                            <Text style={[s.photoInitials, { color: `hsl(${hue}, 65%, 70%)` }]}>
                                                {current.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Gradient overlay for bottom info readability */}
                                    <View style={s.photoOverlay} pointerEvents="none" />

                                    {/* Info at bottom */}
                                    <View style={s.cardInfo}>
                                        <View style={s.nameRow}>
                                            <Text style={s.name}>{current.name}, {current.year}</Text>
                                        </View>
                                        <Text style={s.dept}>{current.department}</Text>
                                        {current.bio ? (
                                            <Text style={s.bio} numberOfLines={2}>{current.bio}</Text>
                                        ) : null}
                                        <View style={s.tagsScroll}>
                                            <View style={s.tags}>
                                                {current.interests?.slice(0, 3).map((i) => (
                                                    <View key={i} style={s.tag}>
                                                        <Text style={s.tagText}>{i}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                        onSwipedLeft={(index) => handleSwipe(index, 'pass')}
                        onSwipedRight={(index) => handleSwipe(index, 'like')}
                        onSwipedAll={() => setAllSwiped(true)}
                        onTapCard={(index) => navigation.navigate('UserProfile', { userId: profiles[index]._id })}
                        backgroundColor="transparent"
                        cardVerticalMargin={0}
                        cardHorizontalMargin={0}
                        containerStyle={s.swiperContainer}
                        stackSize={3}
                        stackScale={5}
                        stackSeparation={14}
                        disableTopSwipe
                        disableBottomSwipe
                        animateOverlayLabelsOpacity
                        overlayLabels={{
                            left: {
                                title: 'PASS',
                                style: {
                                    label: { borderColor: '#ef4444', color: '#ef4444', borderWidth: 4, fontSize: 32, fontWeight: '900', padding: 10, borderRadius: 10 },
                                    wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 40, marginLeft: -40 }
                                }
                            },
                            right: {
                                title: 'LIKE',
                                style: {
                                    label: { borderColor: '#10B981', color: '#10B981', borderWidth: 4, fontSize: 32, fontWeight: '900', padding: 10, borderRadius: 10 },
                                    wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 40, marginLeft: 40 }
                                }
                            }
                        }}
                    />
                </View>
            ) : null}

            {allSwiped || (profiles.length === 0 && !loading) ? (
                <View style={s.empty}>
                    <Ionicons name="sparkles-outline" size={48} color={theme.colors.accent} style={{ marginBottom: 16 }} />
                    <Text style={s.emptyTitle}>You're all caught up</Text>
                    <Text style={s.emptySub}>Check back later for new profiles</Text>
                    <TouchableOpacity
                        style={{ marginTop: 24, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: theme.colors.background.tertiary, borderRadius: 20 }}
                        onPress={() => { setLoading(true); api.get('/swipes/feed').then(({ data }) => { setProfiles(data.data || []); setLoading(false); }).catch(() => setLoading(false)); }}
                    >
                        <Text style={{ fontWeight: '600', color: theme.colors.primary }}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Action buttons footer */}
            {!allSwiped && profiles.length > 0 && (
                <View style={s.actions}>
                    <TouchableOpacity style={s.passBtn} onPress={() => swiperRef.current?.swipeLeft()} activeOpacity={0.8}>
                        <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.likeBtn} onPress={() => swiperRef.current?.swipeRight()} activeOpacity={0.8}>
                        <Ionicons name="heart" size={30} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.msgBtn} onPress={() => { const p = profiles[currentIndex]; if (p) navigation.navigate('UserProfile', { userId: p._id }); }} activeOpacity={0.8}>
                        <Ionicons name="chatbubble" size={22} color={theme.colors.text.muted} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 10,
        backgroundColor: theme.colors.background.primary,
        zIndex: 10,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.5 },
    iconBtn: { padding: 4 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    counter: {
        backgroundColor: theme.colors.background.tertiary,
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20, borderWidth: 1, borderColor: theme.colors.glass.border,
    },
    counterText: { fontSize: 12, color: theme.colors.text.muted, fontWeight: '500' },

    cardWrap: { flex: 1, paddingHorizontal: 16, marginBottom: 100 },
    swiperContainer: { flex: 1 },

    card: {
        height: height * 0.72, borderRadius: 24, overflow: 'hidden',
        backgroundColor: theme.colors.background.secondary,
        ...theme.shadow.md,
    },
    photo: { ...StyleSheet.absoluteFillObject },
    photoPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center',
    },
    photoInitials: { fontSize: 80, fontWeight: '800' },

    photoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },

    cardInfo: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 24, paddingBottom: 30,
        backgroundColor: 'transparent',
    },

    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    name: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.success },
    dept: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
    bio: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18, marginBottom: 12 },
    tagsScroll: { marginTop: 4 },
    tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: { fontSize: 12, color: '#fff', fontWeight: '600' },

    viewProfileBtn: {
        marginTop: 10, paddingVertical: 8, borderRadius: 8,
        backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center',
    },
    viewProfileText: { fontSize: 12, fontWeight: '600', color: '#A78BFA' },

    actions: {
        position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 24,
        paddingVertical: 10,
    },
    passBtn: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: theme.colors.background.tertiary,
        borderWidth: 1, borderColor: theme.colors.glass.borderStrong,
        justifyContent: 'center', alignItems: 'center',
    },
    passIcon: { fontSize: 20, color: theme.colors.text.muted },
    likeBtn: {
        width: 68, height: 68, borderRadius: 34,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        ...theme.shadow.primary,
    },
    likeIcon: { fontSize: 28, color: '#fff' },
    msgBtn: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: theme.colors.background.tertiary,
        borderWidth: 1, borderColor: theme.colors.glass.borderStrong,
        justifyContent: 'center', alignItems: 'center',
    },
    msgIcon: { fontSize: 20 },

    matchOverlay: {
        ...StyleSheet.absoluteFillObject, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center', alignItems: 'center',
    },
    matchCard: {
        backgroundColor: theme.colors.background.secondary,
        borderRadius: 28, padding: 40, alignItems: 'center',
        marginHorizontal: 32,
        borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
    },
    matchTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
    matchSub: { fontSize: 15, color: theme.colors.text.muted, marginBottom: 28 },
    matchBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32, paddingVertical: 14,
        borderRadius: 999,
    },
    matchBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.text.primary, letterSpacing: -0.3, marginBottom: 8 },
    emptySub: { fontSize: 14, color: theme.colors.text.muted, textAlign: 'center' },
});
