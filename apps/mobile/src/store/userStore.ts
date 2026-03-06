import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  department: string;
  year: number;
  bio?: string;
  interests: string[];
  clubs: string[];
  lookingFor?: string;
  gender?: string;
  interestedIn?: string[];
  avatarUrl?: string;
  galleryUrls: string[];
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'hillflare-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
