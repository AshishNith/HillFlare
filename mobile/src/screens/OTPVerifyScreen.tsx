import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

export default function OTPVerifyScreen({ route, navigation }: any) {
    const email = route.params?.email || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputs = useRef<(TextInput | null)[]>([]);
    const { verifyOTP } = useAuthStore();

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) return;
        setError('');
        setLoading(true);
        try {
            const isProfileComplete = await verifyOTP(email, code);
            // Navigation handled by App.tsx auth state change
        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.card}>
                <Text style={styles.emoji}>🔐</Text>
                <Text style={styles.title}>Enter Code</Text>
                <Text style={styles.subtitle}>We sent a 6-digit code to{'\n'}{email}</Text>

                <View style={styles.otpRow}>
                    {otp.map((digit, i) => (
                        <TextInput
                            key={i}
                            ref={(ref) => { inputs.current[i] = ref; }}
                            style={[styles.otpInput, digit ? styles.otpFilled : null]}
                            value={digit}
                            onChangeText={(t) => handleChange(t, i)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading || otp.join('').length !== 6}>
                    <Text style={styles.buttonText}>{loading ? 'Verifying...' : '✓ Verify'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface, justifyContent: 'center', paddingHorizontal: 24 },
    card: { backgroundColor: theme.colors.surface2, borderRadius: 24, padding: 32, borderWidth: 1, borderColor: theme.colors.border },
    emoji: { fontSize: 40, textAlign: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
    otpInput: { width: 44, height: 52, borderRadius: 12, backgroundColor: theme.colors.surface3, color: theme.colors.text, fontSize: 22, fontWeight: 'bold', textAlign: 'center', borderWidth: 1, borderColor: theme.colors.border },
    otpFilled: { borderColor: theme.colors.primary },
    error: { color: theme.colors.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
    button: { backgroundColor: theme.colors.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
