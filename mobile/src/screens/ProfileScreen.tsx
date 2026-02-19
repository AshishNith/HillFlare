import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator, Image, RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { theme } from '../utils/theme';

const INTERESTS = ['Music', 'Movies', 'Gaming', 'Reading', 'Travel', 'Photography', 'Fitness', 'Art', 'Technology', 'Sports', 'Cooking', 'Dance', 'Writing', 'Anime'];
const CLUBS = ['Coding Club', 'Drama Society', 'Music Club', 'Dance Club', 'Debate Society', 'Photography Club', 'Sports Club', 'Robotics Club', 'Literary Club', 'Quiz Club'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Mathematics', 'Physics', 'Chemistry', 'MBA'];

export default function ProfileScreen({ route }: any) {
    const { user, updateProfile, logout, fetchUser } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
    const [form, setForm] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        department: user?.department || '',
        year: user?.year || 1,
        interests: user?.interests || [],
        clubs: user?.clubs || [],
    });

    const [refreshing, setRefreshing] = useState(false);

    // Handle force edit from App.tsx
    React.useEffect(() => {
        if (route?.params?.forceEdit) {
            setEditing(true);
            setForm({
                name: user?.name || '',
                bio: user?.bio || '',
                department: user?.department || '',
                year: user?.year || 1,
                interests: user?.interests || [],
                clubs: user?.clubs || [],
            });
        }
    }, [route?.params?.forceEdit, user]);

    // Check completion on load
    React.useEffect(() => {
        if (user && !user.isProfileComplete && !editing && !route?.params?.forceEdit) {
            Alert.alert(
                'Profile Incomplete',
                'Your profile is not complete. Would you like to complete it now to get better matches?',
                [
                    { text: 'Later', style: 'cancel' },
                    { text: 'Complete Now', onPress: () => startEdit() }
                ]
            );
        }
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUser();
        setRefreshing(false);
    };

    const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
    const photos = user?.photos || [];

    const completionItems = [user?.name, user?.department, user?.bio, (user?.interests?.length || 0) > 0, (user?.clubs?.length || 0) > 0];
    const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    const toggleItem = (field: 'interests' | 'clubs', item: string) => {
        setForm(p => ({
            ...p,
            [field]: p[field].includes(item) ? p[field].filter((i: string) => i !== item) : [...p[field], item],
        }));
    };

    const startEdit = () => {
        setForm({ name: user?.name || '', bio: user?.bio || '', department: user?.department || '', year: user?.year || 1, interests: user?.interests || [], clubs: user?.clubs || [] });
        setEditing(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
        setSaving(true);
        try {
            await updateProfile(form);
            setEditing(false);
        } catch {
            Alert.alert('Error', 'Failed to save profile');
        }
        setSaving(false);
    };

    // Photo upload via expo-image-picker
    const pickAndUploadPhoto = async () => {
        if (photos.length >= 6) { Alert.alert('Limit', 'Maximum 6 photos allowed'); return; }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission denied', 'We need camera roll access to upload photos.'); return; }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            base64: true,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (result.canceled || !result.assets?.[0]?.base64) return;
        const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;

        setUploading(true);
        try {
            await api.post('/users/photos/upload', { image: base64 });
            await fetchUser();
        } catch (err: any) {
            Alert.alert('Upload failed', err?.response?.data?.error || 'Check your Cloudinary credentials.');
        }
        setUploading(false);
    };

    // Photo delete
    const handleDeletePhoto = (index: number) => {
        Alert.alert('Delete Photo', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    setDeletingIdx(index);
                    try {
                        await api.delete(`/users/photos/${index}`);
                        await fetchUser();
                    } catch (err: any) {
                        Alert.alert('Error', err?.response?.data?.error || 'Delete failed');
                    }
                    setDeletingIdx(null);
                }
            },
        ]);
    };

    const handleLogout = () => {
        Alert.alert('Sign out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <ScrollView
            style={s.container}
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        >

            {/* ── Hero section ── */}
            <View style={s.hero}>
                <View style={s.avatarWrap}>
                    <View style={[s.avatarRing, { borderColor: completion === 100 ? theme.colors.success : theme.colors.primary }]}>
                        {photos.length > 0 ? (
                            <Image source={{ uri: photos[0] }} style={s.avatarImage} />
                        ) : (
                            <View style={s.avatar}>
                                <Text style={s.initials}>{initials}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={s.heroInfo}>
                    <Text style={s.heroName}>{user?.name || 'Your Name'}</Text>
                    <Text style={s.heroDept}>
                        {user?.department}{user?.year ? ` · Year ${user.year}` : ''}
                    </Text>
                    <Text style={s.heroEmail}>{user?.email}</Text>

                    <View style={s.progressWrap}>
                        <View style={s.progressRow}>
                            <Text style={s.progressLabel}>Profile completion</Text>
                            <Text style={[s.progressPct, { color: completion === 100 ? theme.colors.success : theme.colors.primaryLight }]}>{completion}%</Text>
                        </View>
                        <View style={s.progressTrack}>
                            <View style={[s.progressFill, {
                                width: `${completion}%` as any,
                                backgroundColor: completion === 100 ? theme.colors.success : theme.colors.primary,
                            }]} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Edit button */}
            <View style={s.divider} />
            <View style={s.editBtnRow}>
                <TouchableOpacity
                    style={[s.editBtn, editing && s.editBtnCancel]}
                    onPress={editing ? () => setEditing(false) : startEdit}
                    activeOpacity={0.8}>
                    <Ionicons name={editing ? 'close' : 'create-outline'} size={16} color={editing ? theme.colors.textMuted : '#fff'} />
                    <Text style={[s.editBtnText, editing && s.editBtnCancelText]}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
                </TouchableOpacity>
            </View>

            <View style={s.divider} />

            {/* ── Photo Grid — always visible ── */}
            <View style={s.section}>
                <View style={s.sectionLabelRow}>
                    <Ionicons name="camera-outline" size={13} color={theme.colors.textMuted} />
                    <Text style={s.sectionLabel}>PHOTOS</Text>
                    <Text style={s.sectionCount}>({photos.length}/6)</Text>
                </View>

                <View style={s.photoGrid}>
                    {photos.map((url: string, i: number) => (
                        <View key={i} style={s.photoCell}>
                            <Image source={{ uri: url }} style={s.photoImage} />
                            {i === 0 && (
                                <View style={s.profileBadge}>
                                    <Text style={s.profileBadgeText}>Profile</Text>
                                </View>
                            )}
                            <TouchableOpacity style={[s.photoDeleteBtn, deletingIdx === i && { opacity: 0.5 }]}
                                onPress={() => handleDeletePhoto(i)} activeOpacity={0.7}>
                                {deletingIdx === i
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Ionicons name="trash-outline" size={13} color={theme.colors.danger} />}
                            </TouchableOpacity>
                        </View>
                    ))}

                    {photos.length < 6 && (
                        <TouchableOpacity style={s.addPhotoBtn} onPress={pickAndUploadPhoto} disabled={uploading} activeOpacity={0.7}>
                            {uploading
                                ? <ActivityIndicator color={theme.colors.primary} />
                                : <Ionicons name="add-circle-outline" size={24} color={theme.colors.textMuted} />}
                            <Text style={s.addPhotoText}>{uploading ? 'Uploading...' : 'Add Photo'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={s.divider} />

            {editing ? (
                /* ── Edit mode ── */
                <View>
                    <View style={s.section}>
                        <Text style={s.sectionLabel}>BASIC INFO</Text>
                        <TextInput style={s.input} value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                            placeholder="Full Name" placeholderTextColor={theme.colors.textSubtle} />
                        <View style={{ position: 'relative' }}>
                            <TextInput style={[s.input, { height: 88, textAlignVertical: 'top', paddingBottom: 28 }]}
                                value={form.bio} onChangeText={t => setForm({ ...form, bio: t.slice(0, 300) })}
                                placeholder="Write a short bio..." placeholderTextColor={theme.colors.textSubtle}
                                multiline maxLength={300} />
                            <Text style={s.charCount}>{form.bio.length}/300</Text>
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <Text style={s.sectionLabel}>DEPARTMENT</Text>
                        <View style={s.chipGrid}>
                            {DEPARTMENTS.map(d => (
                                <TouchableOpacity key={d} style={[s.chip, form.department === d && s.chipActive]}
                                    onPress={() => setForm({ ...form, department: d })} activeOpacity={0.7}>
                                    <Text style={[s.chipText, form.department === d && s.chipTextActive]}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <Text style={s.sectionLabel}>YEAR</Text>
                        <View style={s.yearRow}>
                            {[1, 2, 3, 4, 5].map(y => (
                                <TouchableOpacity key={y} style={[s.yearBtn, form.year === y && s.yearBtnActive]}
                                    onPress={() => setForm({ ...form, year: y })} activeOpacity={0.7}>
                                    <Text style={[s.yearBtnText, form.year === y && s.yearBtnTextActive]}>{y}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <Text style={s.sectionLabel}>INTERESTS <Text style={s.sectionCount}>({form.interests.length} selected)</Text></Text>
                        <View style={s.chipGrid}>
                            {INTERESTS.map(i => (
                                <TouchableOpacity key={i} style={[s.chip, form.interests.includes(i) && s.chipActive]}
                                    onPress={() => toggleItem('interests', i)} activeOpacity={0.7}>
                                    <Text style={[s.chipText, form.interests.includes(i) && s.chipTextActive]}>{i}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <Text style={s.sectionLabel}>CLUBS <Text style={s.sectionCount}>({form.clubs.length} selected)</Text></Text>
                        <View style={s.chipGrid}>
                            {CLUBS.map(c => (
                                <TouchableOpacity key={c} style={[s.chip, form.clubs.includes(c) && s.chipActive]}
                                    onPress={() => toggleItem('clubs', c)} activeOpacity={0.7}>
                                    <Text style={[s.chipText, form.clubs.includes(c) && s.chipTextActive]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark" size={18} color="#fff" />
                                    <Text style={s.saveBtnText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                /* ── View mode ── */
                <View>
                    {user?.bio ? (
                        <>
                            <View style={s.section}>
                                <Text style={s.sectionLabel}>ABOUT</Text>
                                <Text style={s.bioText}>{user.bio}</Text>
                            </View>
                            <View style={s.divider} />
                        </>
                    ) : null}

                    <View style={s.section}>
                        <View style={s.sectionLabelRow}>
                            <Ionicons name="heart-outline" size={13} color={theme.colors.textMuted} />
                            <Text style={s.sectionLabel}>INTERESTS</Text>
                        </View>
                        <View style={s.chipGrid}>
                            {user?.interests?.length ? user.interests.map((i: string) => (
                                <View key={i} style={s.viewChip}><Text style={s.viewChipText}>{i}</Text></View>
                            )) : <Text style={s.emptyText}>No interests added yet</Text>}
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <View style={s.sectionLabelRow}>
                            <Ionicons name="people-outline" size={13} color={theme.colors.textMuted} />
                            <Text style={s.sectionLabel}>CLUBS</Text>
                        </View>
                        <View style={s.chipGrid}>
                            {user?.clubs?.length ? user.clubs.map((c: string) => (
                                <View key={c} style={s.viewChip}><Text style={s.viewChipText}>{c}</Text></View>
                            )) : <Text style={s.emptyText}>No clubs added yet</Text>}
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <View style={s.sectionLabelRow}>
                            <Ionicons name="information-circle-outline" size={13} color={theme.colors.textMuted} />
                            <Text style={s.sectionLabel}>ACCOUNT</Text>
                        </View>
                        <View style={s.infoRows}>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Email</Text>
                                <Text style={s.infoVal}>{user?.email}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Department</Text>
                                <Text style={s.infoVal}>{user?.department || '—'}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Year</Text>
                                <Text style={s.infoVal}>{user?.year ? `Year ${user.year}` : '—'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={s.divider} />

                    <View style={s.section}>
                        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
                            <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
                            <Text style={s.logoutText}>Sign out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },

    hero: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 16,
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24,
        backgroundColor: theme.colors.surface2,
    },
    avatarWrap: { flexShrink: 0 },
    avatarRing: {
        width: 72, height: 72, borderRadius: 36,
        borderWidth: 2, padding: 3,
        justifyContent: 'center', alignItems: 'center',
    },
    avatar: {
        width: 62, height: 62, borderRadius: 31,
        backgroundColor: 'rgba(123,47,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarImage: {
        width: 62, height: 62, borderRadius: 31,
    },
    initials: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryLight },
    heroInfo: { flex: 1, minWidth: 0 },
    heroName: { fontSize: 20, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.3, marginBottom: 3 },
    heroDept: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 2 },
    heroEmail: { fontSize: 11, color: theme.colors.textSubtle },

    progressWrap: { marginTop: 12 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    progressLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
    progressPct: { fontSize: 11, fontWeight: '700' },
    progressTrack: { height: 3, backgroundColor: theme.colors.surface4, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 3, borderRadius: 2 },

    editBtnRow: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: theme.colors.surface },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 9,
        borderRadius: 6, backgroundColor: theme.colors.primary,
    },
    editBtnCancel: { backgroundColor: theme.colors.surface3 },
    editBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    editBtnCancelText: { color: theme.colors.textMuted },

    divider: { height: 1, backgroundColor: theme.colors.border },

    section: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: theme.colors.surface },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.2, marginBottom: 12 },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    sectionCount: { fontSize: 11, fontWeight: '400', color: theme.colors.textSubtle, letterSpacing: 0 },

    // Photo grid
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    photoCell: {
        width: '31.5%' as any, aspectRatio: 1, borderRadius: 6, overflow: 'hidden',
        backgroundColor: theme.colors.surface3,
    },
    photoImage: { width: '100%', height: '100%', borderRadius: 6 },
    profileBadge: {
        position: 'absolute', top: 5, left: 5,
        paddingHorizontal: 7, paddingVertical: 2,
        borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.7)',
    },
    profileBadgeText: { fontSize: 10, fontWeight: '700', color: theme.colors.primaryLight },
    photoDeleteBtn: {
        position: 'absolute', top: 5, right: 5,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center', alignItems: 'center',
    },
    addPhotoBtn: {
        width: '31.5%' as any, aspectRatio: 1, borderRadius: 6,
        borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.borderStrong,
        backgroundColor: theme.colors.surface2,
        justifyContent: 'center', alignItems: 'center', gap: 4,
    },
    addPhotoText: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '500' },

    // View mode
    bioText: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 22 },
    emptyText: { fontSize: 13, color: theme.colors.textSubtle },

    viewChip: { backgroundColor: 'rgba(123,47,255,0.1)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
    viewChipText: { fontSize: 12, fontWeight: '500', color: theme.colors.primaryLight },

    infoRows: { gap: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoKey: { fontSize: 13, color: theme.colors.textMuted },
    infoVal: { fontSize: 13, color: theme.colors.text, fontWeight: '500' },

    // Edit mode
    input: {
        backgroundColor: theme.colors.surface2, borderRadius: 8, padding: 12,
        color: theme.colors.text, fontSize: 14, marginBottom: 10,
    },
    charCount: { fontSize: 11, color: theme.colors.textSubtle, textAlign: 'right', marginTop: -6, marginBottom: 10 },

    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 4, backgroundColor: theme.colors.surface2 },
    chipActive: { backgroundColor: 'rgba(123,47,255,0.18)' },
    chipText: { fontSize: 13, fontWeight: '500', color: theme.colors.textMuted },
    chipTextActive: { color: theme.colors.primaryLight, fontWeight: '600' },

    yearRow: { flexDirection: 'row', gap: 10 },
    yearBtn: { width: 44, height: 44, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface2 },
    yearBtnActive: { backgroundColor: 'rgba(123,47,255,0.18)' },
    yearBtnText: { fontSize: 15, fontWeight: '700', color: theme.colors.textMuted },
    yearBtnTextActive: { color: theme.colors.primaryLight },

    saveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 8, backgroundColor: theme.colors.primary,
    },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
    logoutText: { fontSize: 14, fontWeight: '600', color: theme.colors.danger },
});
