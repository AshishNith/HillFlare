import { create } from 'zustand';
import api from '../services/api';

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
    avatar: string;
    isProfileComplete: boolean;
    role: string;
    isVerified: boolean;
    isSuspended: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string) => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<boolean>;
    fetchUser: () => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,

    login: async (email: string) => {
        await api.post('/auth/send-otp', { email });
    },

    verifyOTP: async (email: string, otp: string) => {
        const { data } = await api.post('/auth/verify-otp', { email, otp });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        set({ user: data.data.user, isAuthenticated: true });
        return data.data.user.isProfileComplete;
    },

    fetchUser: async () => {
        try {
            set({ isLoading: true });
            const { data } = await api.get('/auth/me');
            set({ user: data.data, isAuthenticated: true, isLoading: false });
        } catch {
            set({ isAuthenticated: false, isLoading: false });
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
    },

    updateProfile: async (profileData: Partial<User>) => {
        const { data } = await api.put('/users/profile', profileData);
        set({ user: data.data });
    },
}));
