import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { sendOTP } = useAuthStore();

    const handleSend = async () => {
        if (!email.includes('@')) { setError('Please enter a valid college email'); return; }
        setError('');
        setLoading(true);
        try {
            await sendOTP(email);
            navigation.navigate('OTPVerify', { email });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send verification code');
        }
        setLoading(false);
    };

    return (
        <View style={s.container}>
            {/* Background gradient elements */}
            <View style={s.bgCircle1} />
            <View style={s.bgCircle2} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.content}>
                {/* Logo area */}
                <View style={s.logoArea}>
                    <View style={s.logoIcon}>
                        <Text style={{ fontSize: 32 }}>💜</Text>
                    </View>
                    <Text style={s.appName}>CampusConnect</Text>
                    <Text style={s.tagline}>Find your match on campus</Text>
                </View>

                {/* Login card */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Welcome back</Text>
                    <Text style={s.cardSubtitle}>Enter your college email to continue</Text>

                    <TextInput
                        style={[s.input, error ? s.inputError : null]}
                        placeholder="yourname@college.edu"
                        placeholderTextColor={theme.colors.textMuted + '50'}
                        value={email}
                        onChangeText={(t) => { setEmail(t); setError(''); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {error ? <Text style={s.error}>{error}</Text> : null}

                    <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleSend} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={s.buttonText}>Send Verification Code →</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={s.footerText}>
                        Only verified college emails are accepted
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

    // Background decoration
    bgCircle1: { position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(139,92,246,0.06)' },
    bgCircle2: { position: 'absolute', bottom: -100, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(236,72,153,0.04)' },

    // Logo
    logoArea: { alignItems: 'center', marginBottom: 40 },
    logoIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
    appName: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, marginBottom: 6 },
    tagline: { fontSize: 14, color: theme.colors.textMuted },

    // Card
    card: { backgroundColor: theme.colors.surface2, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: theme.colors.border },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    cardSubtitle: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 24 },

    // Input
    input: { backgroundColor: theme.colors.surface3, borderRadius: 14, padding: 16, color: theme.colors.text, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
    inputError: { borderColor: theme.colors.danger + '60' },

    // Error
    error: { color: theme.colors.danger, fontSize: 12, marginBottom: 12 },

    // Button
    button: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },

    // Footer
    footerText: { textAlign: 'center', color: theme.colors.textMuted + '60', fontSize: 11, marginTop: 20 },
});
