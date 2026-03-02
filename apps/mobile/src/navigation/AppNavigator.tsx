import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SwipeScreen } from '../screens/SwipeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { CrushScreen } from '../screens/CrushScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { colors } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';

const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

const ChatStackScreen = () => (
  <ChatStack.Navigator>
    <ChatStack.Screen
      name="Chats"
      component={ChatListScreen}
      options={{ headerShown: false }}
    />
    <ChatStack.Screen
      name="Chat"
      component={ChatScreen}
      options={{ headerShown: false }}
    />
  </ChatStack.Navigator>
);

const MainTabs: React.FC<{ route: any }> = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let shouldHide = false;
        if (route.name === 'Chat') {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Chats';
          if (routeName === 'Chat') {
            shouldHide = true;
          }
        }

        return {
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Swipe') {
              iconName = focused ? 'flame' : 'flame-outline';
            } else if (route.name === 'Explore') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Crush') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'ellipse-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: shouldHide ? { display: 'none' } : {
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 20,
            borderRadius: 24,
            height: 64,
            backgroundColor: colors.card,
            borderTopWidth: 0,
            shadowColor: '#111111',
            shadowOpacity: 0.08,
            shadowRadius: 24,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        };
      }}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Crush" component={CrushScreen} />
      <Tab.Screen name="Chat" component={ChatStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainStackScreen = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="MainTabs" component={MainTabs} />
    <MainStack.Screen name="UserProfile" component={UserProfileScreen} />
    <MainStack.Screen name="Notifications" component={NotificationScreen} />
  </MainStack.Navigator>
);

const AuthFlow = () => {
  const [authStep, setAuthStep] = useState<'login' | 'otp'>('login');
  const [loginEmail, setLoginEmail] = useState('');

  if (authStep === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={(email) => {
          setLoginEmail(email);
          setAuthStep('otp');
        }}
      />
    );
  }

  return (
    <OtpScreen
      email={loginEmail}
      onVerifySuccess={() => {
        // OTP verified — auth store is now set to authenticated.
        // AppNavigator will re-render and check profile completeness.
      }}
      onBack={() => setAuthStep('login')}
    />
  );
};

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const needsOnboarding = useAuthStore((state) => state.needsOnboarding);
  const setNeedsOnboarding = useAuthStore((state) => state.setNeedsOnboarding);
  const setUser = useUserStore((state) => state.setUser);
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkProfileCompleteness();
    }
  }, [isAuthenticated]);

  const checkProfileCompleteness = async () => {
    setCheckingProfile(true);
    try {
      const user = await apiService.getMe();
      // Profile exists — check if it has required fields
      if (user && user.name && user.department && user.year && user.avatarUrl) {
        setUser(user);
        setNeedsOnboarding(false);
      } else {
        // Profile exists but is incomplete
        setNeedsOnboarding(true);
      }
    } catch (error: any) {
      // 404 means no profile yet — needs onboarding
      if (error.response?.status === 404) {
        setNeedsOnboarding(true);
      } else {
        // Other error (network etc) — assume needs onboarding to be safe
        setNeedsOnboarding(true);
      }
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    // Reload the profile after onboarding
    checkProfileCompleteness();
  };

  if (checkingProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthFlow />
      ) : needsOnboarding ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      ) : (
        <MainStackScreen />
      )}
    </NavigationContainer>
  );
};
