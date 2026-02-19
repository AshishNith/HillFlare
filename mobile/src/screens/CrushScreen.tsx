import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

export default function CrushScreen() {
    const navigation = useNavigation<any>();
    const [crushes, setCrushes] = useState<any[]>([]);
    const [revealed, setRevealed] = useState<any[]>([]);
    const [browseUsers, setBrowseUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [browsing, setBrowsing] = useState(false);
    const [browseLoading, setBrowseLoading] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [c, r] = await Promise.all([
                api.get('/crushes'),
                api.get('/crushes/revealed'),
            ]);
            setCrushes(c.data.data || []);
            setRevealed(r.data.data || []);
        } catch (err) {
            console.log('Crush fetch error:', err);
        }
        setLoading(false);
    };

    const loadBrowseProfiles = async () => {
        setBrowseLoading(true);
        setBrowsing(true);
        try {
            const { data } = await api.get('/explore?limit=30');
            setBrowseUsers(data.data || []);
        } catch (err) {
            console.log('Browse error:', err);
        }
        setBrowseLoading(false);
    };

    const addCrush = async (userId: string, name: string) => {
        try {
            const { data } = await api.post('/crushes', { crushUserId: userId });
            if (data.data?.isMutual) {
                Alert.alert('💘 Crush Revealed!', `${name} picked you too! It's a match!`);
            } else {
                Alert.alert('🤫 Crush Added', `${name} has been added as your secret crush.`);
            }
            setBrowseUsers((prev) => prev.filter((u) => u._id !== userId));
            fetchData();
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Failed to add crush';
            Alert.alert('Error', msg);
        }
    };

    const removeCrush = async (crushUserId: string, name: string) => {
        Alert.alert('Remove Crush', `Remove ${name} from your crushes?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/crushes/${crushUserId}`);
                        fetchData();
                    } catch {
                        Alert.alert('Error', 'Failed to remove crush');
                    }
                },
            },
        ]);
    };

    const filteredUsers = browseUsers.filter((u) =>
        !crushes.some((c) => c.crushUserId?._id === u._id) &&
        u._id !== user?._id &&
        (search ? u.name?.toLowerCase().includes(search.toLowerCase()) || u.department?.toLowerCase().includes(search.toLowerCase()) : true)
    );

    const slotsUsed = crushes.length;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <Text style={styles.title}>Secret Crush 🤫</Text>
            <Text style={styles.subtitle}>Pick up to 3 anonymous crushes per month. Mutual picks reveal both identities!</Text>

            {/* Crush Slots */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Crushes</Text>
                    <View style={styles.dotsRow}>
                        {[0, 1, 2].map((i) => (
                            <View key={i} style={[styles.dot, i < slotsUsed && styles.dotFilled]} />
                        ))}
                        <Text style={styles.slotCount}>{slotsUsed}/3</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[0, 1, 2].map((slot) => {
                        const crush = crushes[slot];
                        return (
                            <View key={slot} style={[styles.slotContainer]}>
                                {crush ? (
                                    <LinearGradient
                                        colors={['rgba(236,72,153,0.1)', 'rgba(139,92,246,0.05)']}
                                        style={styles.slotGradient}
                                    >
                                        <TouchableOpacity
                                            style={styles.slotContent}
                                            onPress={() => navigation.navigate('UserProfile', { userId: crush.crushUserId?._id })}
                                            onLongPress={() => removeCrush(crush.crushUserId?._id, crush.crushUserId?.name)}
                                        >
                                            {crush.crushUserId?.photos?.[0] || crush.crushUserId?.avatar ? (
                                                <Image source={{ uri: crush.crushUserId?.photos?.[0] || crush.crushUserId?.avatar }} style={styles.slotImage} />
                                            ) : (
                                                <View style={styles.slotAvatar}>
                                                    <Text style={styles.slotInitial}>{crush.crushUserId?.name?.[0] || '?'}</Text>
                                                </View>
                                            )}
                                            <Text style={styles.slotName} numberOfLines={1}>{crush.crushUserId?.name}</Text>
                                            <Text style={styles.slotDept} numberOfLines={1}>{crush.crushUserId?.department}</Text>
                                            <Text style={styles.removeTip}>Hold to remove</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.slot, styles.slotEmpty]}>
                                        <Text style={styles.slotEmptyIcon}>💜</Text>
                                        <Text style={styles.slotEmptyLabel}>Empty</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Revealed Crushes */}
            {revealed.length > 0 && (
                <View style={styles.sectionCard}>
                    <Text style={styles.revealTitle}>💘 Mutual Reveals</Text>
                    {revealed.map((u: any) => (
                        <LinearGradient
                            key={u._id}
                            colors={['rgba(236,72,153,0.1)', 'rgba(139,92,246,0.05)']}
                            style={styles.revealGradient}
                        >
                            <TouchableOpacity style={styles.revealItem} onPress={() => navigation.navigate('UserProfile', { userId: u._id })}>
                                <LinearGradient
                                    colors={['#EC4899', '#8B5CF6']}
                                    style={styles.avatarBorder}
                                >
                                    {u.photos?.[0] || u.avatar ? (
                                        <Image source={{ uri: u.photos?.[0] || u.avatar }} style={styles.revealImage} />
                                    ) : (
                                        <View style={styles.revealAvatarPlaceholder}>
                                            <Text style={styles.revealInitial}>{u.name?.[0]}</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.revealName}>{u.name}</Text>
                                    <Text style={styles.revealDept}>{u.department} • Year {u.year}</Text>
                                </View>
                            </TouchableOpacity>
                        </LinearGradient>
                    ))}
                </View>
            )}

            {/* Add Crush */}
            {slotsUsed < 3 && (
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Add a Crush</Text>

                    {!browsing ? (
                        <TouchableOpacity style={styles.browseBtn} onPress={loadBrowseProfiles}>
                            <Text style={styles.browseBtnText}>🔍 Browse Profiles</Text>
                        </TouchableOpacity>
                    ) : browseLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                    ) : (
                        <View>
                            <TextInput
                                style={styles.searchInput}
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Search by name or department..."
                                placeholderTextColor={theme.colors.textMuted}
                            />
                            {filteredUsers.length > 0 ? (
                                filteredUsers.slice(0, 15).map((u) => (
                                    <View key={u._id} style={styles.browseItem}>
                                        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: u._id })}>
                                            {u.photos?.[0] || u.avatar ? (
                                                <Image source={{ uri: u.photos?.[0] || u.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                            ) : (
                                                <View style={styles.browseAvatar}>
                                                    <Text style={styles.browseInitial}>{u.name?.[0]}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.browseName}>{u.name}</Text>
                                            <Text style={styles.browseDept}>{u.department} • Year {u.year}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.pickBtn}
                                            onPress={() => addCrush(u._id, u.name)}
                                        >
                                            <Text style={styles.pickBtnText}>🤫 Pick</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No profiles found</Text>
                            )}
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface, padding: 20, marginTop: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    subtitle: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 24, lineHeight: 18 },

    sectionCard: {
        backgroundColor: theme.colors.surface2,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(155,143,199,0.2)' },
    dotFilled: { backgroundColor: '#EC4899' },
    slotCount: { fontSize: 12, color: theme.colors.textMuted, marginLeft: 6 },

    slotContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 130,
    },
    slot: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(139,92,246,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(28,21,51,0.3)',
    },
    slotGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.15)',
        borderRadius: 16,
    },
    slotEmpty: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    slotContent: { alignItems: 'center', padding: 8, width: '100%' },
    slotImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    slotAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(236,72,153,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    slotInitial: { fontSize: 20, fontWeight: 'bold', color: '#F472B6' },
    slotName: { fontSize: 12, fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
    slotDept: { fontSize: 10, color: theme.colors.textMuted, textAlign: 'center', marginTop: 2 },
    removeTip: { fontSize: 9, color: theme.colors.textMuted, marginTop: 6, opacity: 0.5 },
    slotEmptyIcon: { fontSize: 24, opacity: 0.3, marginBottom: 4 },
    slotEmptyLabel: { fontSize: 11, color: theme.colors.textMuted, opacity: 0.4 },

    revealTitle: { fontSize: 16, fontWeight: 'bold', color: '#F472B6', marginBottom: 12 },
    revealGradient: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.15)',
        marginBottom: 8,
        overflow: 'hidden',
    },
    revealItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    avatarBorder: {
        padding: 2,
        borderRadius: 22,
    },
    revealImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#130E22',
        backgroundColor: '#130E22',
    },
    revealAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    revealInitial: { fontSize: 16, fontWeight: 'bold', color: '#F472B6' },
    revealName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    revealDept: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },

    browseBtn: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    browseBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

    searchInput: {
        backgroundColor: theme.colors.surface3,
        borderRadius: 12,
        padding: 12,
        color: theme.colors.text,
        fontSize: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    browseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    browseAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(139,92,246,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    browseInitial: { fontSize: 16, fontWeight: 'bold', color: '#A78BFA' },
    browseName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    browseDept: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
    pickBtn: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    pickBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    emptyText: { color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 24, fontSize: 14 },
});
