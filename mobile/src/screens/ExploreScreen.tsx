import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';
import { theme } from '../utils/theme';

export default function ExploreScreen() {
    const [profiles, setProfiles] = useState<any[]>([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/explore');
                setProfiles(data.data || []);
            } catch { }
        };
        fetch();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Explore</Text>
            <FlatList
                data={profiles}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={{ gap: 12 }}
                contentContainerStyle={{ gap: 12, padding: 16 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.avatar}><Text style={styles.initials}>{item.name?.[0]}</Text></View>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.dept} numberOfLines={1}>{item.department}</Text>
                        <Text style={styles.score}>{item.compatibilityScore} pts</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, padding: 24, paddingBottom: 8 },
    card: { flex: 1, backgroundColor: theme.colors.surface2, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(139,92,246,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    initials: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primaryLight },
    name: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 2 },
    dept: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 6 },
    score: { fontSize: 12, fontWeight: '600', color: theme.colors.success },
});
