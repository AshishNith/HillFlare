import { create } from 'zustand';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

interface User {
    _id: string;
    name: string;
    email: string;
    department: string;
    year: number;
    interests: string[];
    clubs: string[];
    photos: string[];
    bio: string;
    isProfileComplete: boolean;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    sendOTP: (email: string) => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<boolean>;
    fetchUser: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    checkAuth: async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            try {
                const { data } = await api.get('/auth/me');
                set({ user: data.data, isAuthenticated: true, isLoading: false });
            } catch {
                set({ isAuthenticated: false, isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
    },

    sendOTP: async (email) => {
        await api.post('/auth/send-otp', { email });
    },

    verifyOTP: async (email, otp) => {
        const { data } = await api.post('/auth/verify-otp', { email, otp });
        await SecureStore.setItemAsync('accessToken', data.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
        set({ user: data.data.user, isAuthenticated: true });
        return data.data.user.isProfileComplete;
    },

    fetchUser: async () => {
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data.data, isAuthenticated: true });
        } catch {
            set({ isAuthenticated: false });
        }
    },

    updateProfile: async (profileData) => {
        const { data } = await api.put('/users/profile', profileData);
        set({ user: data.data });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        set({ user: null, isAuthenticated: false });
    },
}));
