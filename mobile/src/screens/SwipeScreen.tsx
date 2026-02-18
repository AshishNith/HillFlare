import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import api from '../services/api';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

interface Profile {
    _id: string; name: string; department: string; year: number;
    interests: string[]; photos: string[]; bio: string;
}

export default function SwipeScreen() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMatch, setIsMatch] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const { data } = await api.get('/swipes/feed'); setProfiles(data.data || []); } catch { }
            setLoading(false);
        })();
    }, []);

    const handleSwipe = async (type: 'like' | 'pass') => {
        const profile = profiles[currentIndex];
        if (!profile) return;
        try {
            const { data } = await api.post('/swipes', { toUser: profile._id, type });
            if (data.data?.isMatch) { setIsMatch(true); setTimeout(() => setIsMatch(false), 2500); }
        } catch { }
        setCurrentIndex((p) => p + 1);
    };

    const current = profiles[currentIndex];
    const remaining = profiles.length - currentIndex;
    const initials = current?.name?.split(' ').map((n) => n[0]).join('') || '?';
    const hue = current ? (current._id.charCodeAt(0) * 37) % 360 : 270;

    return (
        <View style={s.container}>
            {/* Match overlay */}
            {isMatch && (
                <View style={s.matchOverlay}>
                    <Text style={{ fontSize: 64 }}>💘</Text>
                    <Text style={s.matchTitle}>It's a Match!</Text>
                    <Text style={s.matchSub}>You both liked each other ✨</Text>
                </View>
            )}

            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.headerTitle}>Discover</Text>
                    <Text style={s.headerSub}>Swipe to connect</Text>
                </View>
                {profiles.length > 0 && (
                    <View style={s.counter}>
                        <Text style={s.counterNum}>{remaining > 0 ? remaining : 0}</Text>
                        <Text style={s.counterLabel}>LEFT</Text>
                    </View>
                )}
            </View>

            {/* Card */}
            {current ? (
                <View style={s.card}>
                    {/* Avatar area with dynamic color */}
                    <View style={[s.avatarSection, { backgroundColor: `hsla(${hue},40%,30%,0.12)` }]}>
                        <View style={s.avatarGlow} />
                        {current.photos?.[0] ? (
                            <View style={s.avatar}><Text style={[s.initials, { color: `hsl(${hue},60%,70%)` }]}>{initials}</Text></View>
                        ) : (
                            <View style={[s.avatar, { backgroundColor: `hsla(${hue},50%,50%,0.2)`, borderColor: `hsla(${hue},50%,50%,0.15)` }]}>
                                <Text style={[s.initials, { color: `hsl(${hue},60%,70%)` }]}>{initials}</Text>
                            </View>
                        )}
                    </View>

                    {/* Info */}
                    <View style={s.info}>
                        <Text style={s.name}>{current.name}</Text>
                        <Text style={s.dept}>{current.department} • Year {current.year}</Text>
                        {current.bio ? <Text style={s.bio} numberOfLines={2}>{current.bio}</Text> : null}
                        <View style={s.tags}>
                            {current.interests?.slice(0, 4).map((i) => (
                                <View key={i} style={s.tag}><Text style={s.tagText}>{i}</Text></View>
                            ))}
                        </View>
                    </View>

                    {/* Swipe buttons */}
                    <View style={s.actions}>
                        <TouchableOpacity style={s.passBtn} onPress={() => handleSwipe('pass')} activeOpacity={0.7}>
                            <Text style={s.passIcon}>✕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.likeBtn} onPress={() => handleSwipe('like')} activeOpacity={0.7}>
                            <Text style={s.likeIcon}>💜</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={s.empty}>
                    <Text style={{ fontSize: 56, marginBottom: 16 }}>🎉</Text>
                    <Text style={s.emptyTitle}>All caught up!</Text>
                    <Text style={s.emptySub}>Come back later for new profiles</Text>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface, padding: 20 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
    headerSub: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
    counter: { alignItems: 'center', backgroundColor: theme.colors.surface2, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border },
    counterNum: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primaryLight },
    counterLabel: { fontSize: 9, color: theme.colors.textMuted, letterSpacing: 2, fontWeight: '600' },

    // Card
    card: { flex: 1, backgroundColor: theme.colors.surface2, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
    avatarSection: { height: '50%', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    avatarGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(139,92,246,0.06)' },
    avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(139,92,246,0.2)', borderWidth: 2, borderColor: 'rgba(139,92,246,0.15)' },
    initials: { fontSize: 40, fontWeight: 'bold', color: theme.colors.primaryLight },
    info: { paddingHorizontal: 24, paddingTop: 20, flex: 1 },
    name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    dept: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 12 },
    bio: { fontSize: 13, color: theme.colors.textMuted + 'CC', lineHeight: 19, marginBottom: 12 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: { backgroundColor: 'rgba(139,92,246,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(139,92,246,0.12)' },
    tagText: { fontSize: 11, color: theme.colors.primaryLight },

    // Actions
    actions: { flexDirection: 'row', justifyContent: 'center', gap: 30, paddingBottom: 24, paddingTop: 12 },
    passBtn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(248,113,113,0.25)', backgroundColor: 'rgba(248,113,113,0.06)' },
    passIcon: { fontSize: 26, color: theme.colors.danger },
    likeBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(139,92,246,0.3)', backgroundColor: 'rgba(139,92,246,0.12)' },
    likeIcon: { fontSize: 30 },

    // Match
    matchOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, backgroundColor: 'rgba(10,6,18,0.85)', justifyContent: 'center', alignItems: 'center' },
    matchTitle: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, marginTop: 16 },
    matchSub: { fontSize: 15, color: theme.colors.textMuted, marginTop: 6 },

    // Empty
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
    emptySub: { fontSize: 14, color: theme.colors.textMuted, marginTop: 6 },
});
