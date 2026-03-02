import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  profileComplete: boolean;
  setAuth: (token: string, userId: string) => void;
  setProfileComplete: (complete: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      isAuthenticated: false,
      profileComplete: false,
      setAuth: (token, userId) => {
        localStorage.setItem('auth_token', token);
        set({ token, userId, isAuthenticated: true });
      },
      setProfileComplete: (complete) => {
        set({ profileComplete: complete });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, userId: null, isAuthenticated: false, profileComplete: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
