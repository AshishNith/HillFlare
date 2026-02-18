import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

const INTERESTS = ['Music', 'Movies', 'Gaming', 'Reading', 'Travel', 'Photography', 'Fitness', 'Art', 'Technology', 'Sports', 'Cooking', 'Dance'];
const CLUBS = ['Coding Club', 'Drama Society', 'Music Club', 'Dance Club', 'Debate Society', 'Photography Club', 'Sports Club', 'Robotics Club'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Mathematics', 'Physics'];

export default function ProfileScreen() {
    const { user, updateProfile, logout } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '', bio: user?.bio || '',
        department: user?.department || '', year: user?.year || 1,
        interests: user?.interests || [], clubs: user?.clubs || [],
    });

    const initials = user?.name?.split(' ').map((n: string) => n[0]).join('') || '?';

    const toggleItem = (field: 'interests' | 'clubs', item: string) => {
        setForm((p) => ({
            ...p,
            [field]: p[field].includes(item) ? p[field].filter((i: string) => i !== item) : [...p[field], item],
        }));
    };

    const startEdit = () => {
        setForm({
            name: user?.name || '', bio: user?.bio || '',
            department: user?.department || '', year: user?.year || 1,
            interests: user?.interests || [], clubs: user?.clubs || [],
        });
        setEditing(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
        setSaving(true);
        try {
            await updateProfile(form);
            setEditing(false);
        } catch (e: any) {
            Alert.alert('Error', 'Failed to save profile');
        }
        setSaving(false);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    if (editing) {
        return (
            <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Header */}
                <View style={s.editHeader}>
                    <Text style={s.editTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={() => setEditing(false)}>
                        <Text style={s.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Name */}
                <Text style={s.label}>Name</Text>
                <TextInput style={s.input} value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })} placeholder="Full Name" placeholderTextColor={theme.colors.textMuted + '60'} />

                {/* Bio */}
                <Text style={s.label}>Bio</Text>
                <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={form.bio}
                    onChangeText={(t) => setForm({ ...form, bio: t.slice(0, 300) })} placeholder="Write about yourself..."
                    placeholderTextColor={theme.colors.textMuted + '60'} multiline maxLength={300} />
                <Text style={s.charCount}>{form.bio.length}/300</Text>

                {/* Department */}
                <Text style={s.label}>Department</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    {DEPARTMENTS.map((d) => (
                        <TouchableOpacity key={d} onPress={() => setForm({ ...form, department: d })}
                            style={[s.selectChip, form.department === d && s.selectChipActive]}>
                            <Text style={[s.selectChipText, form.department === d && s.selectChipTextActive]}>{d}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Year */}
                <Text style={s.label}>Year</Text>
                <View style={s.yearRow}>
                    {[1, 2, 3, 4, 5].map((y) => (
                        <TouchableOpacity key={y} onPress={() => setForm({ ...form, year: y })}
                            style={[s.yearBtn, form.year === y && s.yearBtnActive]}>
                            <Text style={[s.yearBtnText, form.year === y && s.yearBtnTextActive]}>{y}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Interests */}
                <Text style={s.label}>Interests</Text>
                <View style={s.chipGrid}>
                    {INTERESTS.map((i) => (
                        <TouchableOpacity key={i} onPress={() => toggleItem('interests', i)}
                            style={[s.chip, form.interests.includes(i) && s.chipActiveP]}>
                            <Text style={[s.chipText, form.interests.includes(i) && s.chipTextActiveP]}>{i}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Clubs */}
                <Text style={s.label}>Clubs</Text>
                <View style={s.chipGrid}>
                    {CLUBS.map((c) => (
                        <TouchableOpacity key={c} onPress={() => toggleItem('clubs', c)}
                            style={[s.chip, form.clubs.includes(c) && s.chipActiveA]}>
                            <Text style={[s.chipText, form.clubs.includes(c) && s.chipTextActiveA]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Save */}
                <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                    <Text style={s.saveBtnText}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {/* Profile header card */}
            <View style={s.headerCard}>
                <View style={s.headerGlow} />
                <View style={s.avatar}>
                    <Text style={s.initials}>{initials}</Text>
                </View>
                <Text style={s.name}>{user?.name || 'Your Name'}</Text>
                <Text style={s.dept}>{user?.department}{user?.year ? ` • Year ${user.year}` : ''}</Text>
                <Text style={s.email}>{user?.email}</Text>
            </View>

            {/* Edit button */}
            <TouchableOpacity style={s.editBtn} onPress={startEdit}>
                <Text style={s.editBtnText}>✏️ Edit Profile</Text>
            </TouchableOpacity>

            {/* Bio */}
            {user?.bio ? (
                <View style={s.section}>
                    <Text style={s.sectionTitle}>ABOUT</Text>
                    <Text style={s.sectionBody}>{user.bio}</Text>
                </View>
            ) : null}

            {/* Interests */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>INTERESTS</Text>
                <View style={s.chipGrid}>
                    {user?.interests?.length ? user.interests.map((i: string) => (
                        <View key={i} style={s.viewChipP}><Text style={s.viewChipTextP}>{i}</Text></View>
                    )) : <Text style={s.emptyText}>No interests added</Text>}
                </View>
            </View>

            {/* Clubs */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>CLUBS</Text>
                <View style={s.chipGrid}>
                    {user?.clubs?.length ? user.clubs.map((c: string) => (
                        <View key={c} style={s.viewChipA}><Text style={s.viewChipTextA}>{c}</Text></View>
                    )) : <Text style={s.emptyText}>No clubs added</Text>}
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                <Text style={s.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },

    // Header card
    headerCard: { alignItems: 'center', borderRadius: 24, padding: 32, marginBottom: 16, overflow: 'hidden', backgroundColor: theme.colors.surface2, borderWidth: 1, borderColor: theme.colors.border },
    headerGlow: { position: 'absolute', top: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(139,92,246,0.08)' },
    avatar: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16, backgroundColor: 'rgba(139,92,246,0.2)', borderWidth: 2, borderColor: 'rgba(139,92,246,0.15)' },
    initials: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primaryLight },
    name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    dept: { fontSize: 14, color: theme.colors.textMuted },
    email: { fontSize: 12, color: theme.colors.textMuted + '80', marginTop: 4 },

    // Edit button
    editBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20, backgroundColor: theme.colors.primary },
    editBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

    // Sections
    section: { backgroundColor: theme.colors.surface2, borderRadius: 18, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: theme.colors.border },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
    sectionBody: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 21 },
    emptyText: { fontSize: 13, color: theme.colors.textMuted + '50' },

    // View chips
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    viewChipP: { backgroundColor: 'rgba(139,92,246,0.12)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(139,92,246,0.15)' },
    viewChipTextP: { fontSize: 12, color: theme.colors.primaryLight },
    viewChipA: { backgroundColor: 'rgba(236,72,153,0.12)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(236,72,153,0.15)' },
    viewChipTextA: { fontSize: 12, color: theme.colors.accent },

    // Edit mode
    editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    editTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
    cancelText: { fontSize: 14, color: theme.colors.textMuted },

    label: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.2, marginBottom: 8, marginTop: 4 },
    input: { backgroundColor: theme.colors.surface2, borderRadius: 14, padding: 16, color: theme.colors.text, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border },
    charCount: { fontSize: 11, color: theme.colors.textMuted + '50', textAlign: 'right', marginTop: -12, marginBottom: 16 },

    // Select chips (department)
    selectChip: { backgroundColor: theme.colors.surface3, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
    selectChipActive: { backgroundColor: 'rgba(139,92,246,0.2)', borderColor: theme.colors.primary },
    selectChipText: { color: theme.colors.textMuted, fontSize: 13 },
    selectChipTextActive: { color: theme.colors.primaryLight },

    // Year
    yearRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    yearBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface2, borderWidth: 1, borderColor: theme.colors.border },
    yearBtnActive: { backgroundColor: 'rgba(139,92,246,0.2)', borderColor: theme.colors.primary },
    yearBtnText: { color: theme.colors.textMuted, fontWeight: '600', fontSize: 15 },
    yearBtnTextActive: { color: theme.colors.primaryLight },

    // Edit chips
    chip: { backgroundColor: theme.colors.surface2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border },
    chipText: { fontSize: 12, color: theme.colors.textMuted },
    chipActiveP: { backgroundColor: 'rgba(139,92,246,0.2)', borderColor: 'rgba(139,92,246,0.4)' },
    chipTextActiveP: { color: theme.colors.primaryLight },
    chipActiveA: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.4)' },
    chipTextActiveA: { color: theme.colors.accent },

    // Save
    saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, backgroundColor: theme.colors.primary },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

    // Logout
    logoutBtn: { borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
    logoutText: { color: theme.colors.danger, fontWeight: '600', fontSize: 15 },
});
