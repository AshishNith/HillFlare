import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { apiService } from '../services/api';

interface LoginScreenProps {
    onLoginSuccess: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await apiService.requestOtp(email);
            Alert.alert('Success', 'OTP sent to your email!');
            onLoginSuccess(email);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'center' }}>
                        <Text
                            style={{
                                fontSize: 36,
                                fontWeight: '700',
                                color: colors.charcoal,
                                marginBottom: spacing.sm,
                            }}
                        >
                            Welcome to
                        </Text>
                        <Text
                            style={{
                                fontSize: 42,
                                fontWeight: '700',
                                color: colors.accent,
                                marginBottom: spacing.xl,
                            }}
                        >
                            HillFlare
                        </Text>
                        <Text
                            style={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                marginBottom: spacing.xl * 2,
                            }}
                        >
                            Social discovery platform
                        </Text>

                        <View style={{ marginBottom: spacing.lg }}>
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: colors.charcoal,
                                    marginBottom: spacing.sm,
                                }}
                            >
                                Email
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: colors.card,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 16,
                                    padding: spacing.md,
                                    fontSize: 16,
                                    color: colors.textPrimary,
                                }}
                                placeholder="your.email@example.com"
                                placeholderTextColor={colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleRequestOtp}
                            disabled={loading}
                            style={{
                                backgroundColor: colors.accent,
                                borderRadius: 16,
                                padding: spacing.lg,
                                alignItems: 'center',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                                    Continue with Email
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
