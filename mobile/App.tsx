import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import LoginScreen from './src/screens/LoginScreen';
import OTPVerifyScreen from './src/screens/OTPVerifyScreen';
import MainTabs from './src/navigation/MainTabs';
import { theme } from './src/utils/theme';

const Stack = createNativeStackNavigator();

const navTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
        ...DefaultTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.surface,
        card: theme.colors.surface2,
        text: theme.colors.text,
        border: theme.colors.border,
    },
};

export default function App() {
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

    useEffect(() => { checkAuth(); }, []);

    if (isLoading) return null;

    return (
        <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
