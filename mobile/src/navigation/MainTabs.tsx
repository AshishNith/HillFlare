import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SwipeScreen from '../screens/SwipeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CrushScreen from '../screens/CrushScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface2,
                    borderTopColor: theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: theme.colors.primaryLight,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: { fontSize: 10 },
            }}
        >
            <Tab.Screen name="Swipe" component={SwipeScreen} options={{ tabBarLabel: '💘 Swipe' }} />
            <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: '🔍 Explore' }} />
            <Tab.Screen name="Crush" component={CrushScreen} options={{ tabBarLabel: '🤫 Crush' }} />
            <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: '💬 Chat' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '👤 Profile' }} />
        </Tab.Navigator>
    );
}
