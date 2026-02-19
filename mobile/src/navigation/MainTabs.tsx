import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SwipeScreen from '../screens/SwipeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CrushScreen from '../screens/CrushScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme } from '../utils/theme';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: theme.colors.background.secondary,
                    borderTopColor: theme.colors.glass.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 80 : 62,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.muted,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;
                    switch (route.name) {
                        case 'Swipe': iconName = focused ? 'flame' : 'flame-outline'; break;
                        case 'Explore': iconName = focused ? 'search' : 'search-outline'; break;
                        case 'Crush': iconName = focused ? 'heart' : 'heart-outline'; break;
                        case 'Chat': iconName = focused ? 'chatbubble' : 'chatbubble-outline'; break;
                        case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
                        default: iconName = 'ellipse-outline';
                    }
                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {focused && (
                                <View style={{
                                    position: 'absolute', top: -10,
                                    width: 4, height: 4, borderRadius: 2,
                                    backgroundColor: theme.colors.primary,
                                }} />
                            )}
                            <Ionicons name={iconName} size={24} color={color} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Swipe" component={SwipeScreen} />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Crush" component={CrushScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
