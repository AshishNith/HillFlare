import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { theme } from '../utils/theme';

export default function OTPVerifyScreen({ navigation, route }: any) {
    const { email } = route.params || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const refs = useRef<(TextInput | null)[]>([]);
    const { verifyOTP } = useAuthStore();

    const handleChange = (val: string, idx: number) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[idx] = val.slice(-1);
        setOtp(next);
        if (val && idx < 5) refs.current[idx + 1]?.focus();
    };

    const handleKeyPress = (e: any, idx: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) { setError('Enter all 6 digits'); return; }
        setLoading(true);
        try {
            await verifyOTP(email, code);
        } catch (e: any) {
            setError(e.message || 'Invalid OTP');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />

            {/* Back button — flat */}
            <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Top */}
            <View style={s.top}>
                <Text style={s.title}>Check your email</Text>
                <Text style={s.sub}>We sent a 6-digit code to</Text>
                <Text style={s.email}>{email}</Text>
            </View>

            {/* OTP inputs — flat, no card */}
            <View style={s.form}>
                <View style={s.otpRow}>
                    {otp.map((digit, i) => (
                        <TextInput
                            key={i}
                            ref={r => refs.current[i] = r}
                            style={[s.otpBox, digit ? s.otpBoxFilled : null]}
                            value={digit}
                            onChangeText={v => handleChange(v, i)}
                            onKeyPress={e => handleKeyPress(e, i)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {error ? <Text style={s.error}>{error}</Text> : null}

                <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleVerify} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.buttonText}>Verify</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={s.resend}>
                    <Text style={s.resendText}>Didn't receive it? <Text style={{ color: theme.colors.primary }}>Resend</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    back: { position: 'absolute', top: 52, left: 20, zIndex: 10, padding: 8 },

    top: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingTop: 80,
    },
    title: { fontSize: 26, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5, marginBottom: 10 },
    sub: { fontSize: 15, color: theme.colors.textMuted, marginBottom: 4 },
    email: { fontSize: 15, color: theme.colors.text, fontWeight: '600' },

    // Flat form section
    form: {
        backgroundColor: theme.colors.surface2,
        padding: 28,
        paddingBottom: 48,
    },
    otpRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    otpBox: {
        flex: 1,
        height: 52,
        backgroundColor: theme.colors.surface3,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text,
    },
    otpBoxFilled: {
        backgroundColor: 'rgba(139,92,246,0.12)',
        color: theme.colors.primaryLight,
    },
    error: { color: theme.colors.danger, fontSize: 13, marginBottom: 14, textAlign: 'center' },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    resend: { alignItems: 'center' },
    resendText: { color: theme.colors.textMuted, fontSize: 13 },
});
