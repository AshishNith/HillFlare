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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { colors, spacing } from '../theme';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface OtpScreenProps {
  email: string;
  onVerifySuccess: () => void;
  onBack: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  email,
  onVerifySuccess,
  onBack,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.verifyOtp(email, otp);
      setAuth(data.token, email);
      await registerPushToken();
      onVerifySuccess();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const registerPushToken = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (status !== 'granted') {
        const request = await Notifications.requestPermissionsAsync();
        finalStatus = request.status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await apiService.registerPushToken(token);
    } catch (error) {
      // Ignore push registration errors to avoid blocking login
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await apiService.requestOtp(email);
      Alert.alert('Success', 'OTP resent to your email!');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: spacing.xl }}>
          <TouchableOpacity onPress={onBack} style={{ marginBottom: spacing.xl }}>
            <Text style={{ fontSize: 24, color: colors.charcoal }}>←</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: colors.charcoal,
                marginBottom: spacing.sm,
              }}
            >
              Verify OTP
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                marginBottom: spacing.xl * 2,
              }}
            >
              We sent a code to {email}
            </Text>

            <View style={{ marginBottom: spacing.xl }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.charcoal,
                  marginBottom: spacing.sm,
                }}
              >
                Enter 6-digit code
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  padding: spacing.md,
                  fontSize: 24,
                  letterSpacing: 8,
                  textAlign: 'center',
                  color: colors.textPrimary,
                  fontWeight: '600',
                }}
                placeholder="000000"
                placeholderTextColor={colors.textSecondary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={loading}
              style={{
                backgroundColor: colors.accent,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                marginBottom: spacing.md,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                  Verify & Continue
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={loading}
              style={{ alignItems: 'center', padding: spacing.md }}
            >
              <Text style={{ fontSize: 14, color: colors.accent, fontWeight: '600' }}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
