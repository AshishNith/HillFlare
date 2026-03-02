import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  setAuth: (token: string, userId: string) => void;
  setNeedsOnboarding: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  needsOnboarding: false,
  setAuth: (token, userId) =>
    set({ token, userId, isAuthenticated: true }),
  setNeedsOnboarding: (value) =>
    set({ needsOnboarding: value }),
  logout: () =>
    set({ token: null, userId: null, isAuthenticated: false, needsOnboarding: false }),
}));
