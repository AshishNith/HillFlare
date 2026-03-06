import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  _hasHydrated: boolean;
  setAuth: (token: string, userId: string) => void;
  setNeedsOnboarding: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      isAuthenticated: false,
      needsOnboarding: false,
      _hasHydrated: false,
      setAuth: (token, userId) =>
        set({ token, userId, isAuthenticated: true }),
      setNeedsOnboarding: (value) =>
        set({ needsOnboarding: value }),
      logout: () =>
        set({ token: null, userId: null, isAuthenticated: false, needsOnboarding: false }),
    }),
    {
      name: 'hillflare-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[auth] Hydration failed:', error);
        }
        // Always mark as hydrated, even on error
        useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);
