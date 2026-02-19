import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { sendOTP } = useAuthStore();

    const handleSend = async () => {
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.(edu|ac\.in|edu\.in)$/;
        if (!emailRegex.test(email.trim())) { setError('Please enter a valid college email'); return; }
        setError('');
        setLoading(true);
        try {
            await sendOTP(email);
            navigation.navigate('OTPVerify', { email });
        } catch (e: any) {
            setError(e.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />

            {/* Top section — flat, no card */}
            <View style={s.top}>
                <View style={s.logoIcon}>
                    <Ionicons name="flame" size={28} color={theme.colors.primary} />
                </View>
                <Text style={s.appName}>CampusConnect</Text>
                <Text style={s.tagline}>Find your campus match</Text>
            </View>

            {/* Form section — flat, no card, just background color change */}
            <View style={s.form}>
                <Text style={s.label}>College Email</Text>
                <TextInput
                    style={s.input}
                    value={email}
                    onChangeText={t => { setEmail(t); setError(''); }}
                    placeholder="you@college.edu"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {error ? <Text style={s.error}>{error}</Text> : null}

                <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleSend} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={s.buttonText}>Continue</Text>
                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={s.footerText}>Only verified college emails accepted</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },

    top: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    logoIcon: {
        width: 56, height: 56,
        backgroundColor: 'rgba(139,92,246,0.12)',
        borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    appName: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5, marginBottom: 8 },
    tagline: { fontSize: 15, color: theme.colors.textMuted, textAlign: 'center' },

    // Flat form section — just a slightly different background, no card border/shadow
    form: {
        backgroundColor: theme.colors.surface2,
        padding: 28,
        paddingBottom: 48,
    },
    label: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
    input: {
        backgroundColor: theme.colors.surface3,
        color: theme.colors.text,
        fontSize: 15,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 16,
    },
    error: { color: theme.colors.danger, fontSize: 13, marginBottom: 12 },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    footerText: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' },
});
