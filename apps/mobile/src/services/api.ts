import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
// export const API_URL = extra?.apiUrl || 'https://hillflare-1.onrender.com';
export const API_URL = extra?.apiUrl || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — auto-logout on expired/invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // Auth
  requestOtp: async (email: string) => {
    const { data } = await api.post('/auth/otp/request', { email });
    return data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const { data } = await api.post('/auth/otp/verify', { email, otp });
    return data;
  },

  // Users
  getMe: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },

  updateProfile: async (profile: any) => {
    const { data } = await api.put('/users/me', profile);
    return data;
  },

  getUserById: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  // Colleges
  getColleges: async () => {
    const { data } = await api.get('/colleges');
    return data;
  },

  // Swipes
  swipe: async (targetUserId: string, direction: 'left' | 'right') => {
    const { data } = await api.post('/swipes', { targetUserId, direction });
    return data;
  },

  getDiscoveryProfiles: async () => {
    const { data } = await api.get('/swipes/discovery');
    return data;
  },

  getExploreProfiles: async () => {
    const { data } = await api.get('/users/discovery');
    return data;
  },

  // Matches
  getMatches: async () => {
    const { data } = await api.get('/matches');
    return data;
  },

  // Crushes
  getCrushes: async () => {
    const { data } = await api.get('/crushes');
    return data;
  },

  selectCrush: async (targetUserId: string) => {
    const { data } = await api.post('/crushes', { targetUserId });
    return data;
  },

  updateCrush: async (crushId: string, newTargetUserId: string) => {
    const { data } = await api.put(`/crushes/${crushId}`, { targetUserId: newTargetUserId });
    return data;
  },

  deleteCrush: async (crushId: string) => {
    const { data } = await api.delete(`/crushes/${crushId}`);
    return data;
  },

  // Chats
  getChats: async () => {
    const { data } = await api.get('/chats');
    return data;
  },

  getMessages: async (chatId: string, params?: { cursor?: string; limit?: number }) => {
    const { data } = await api.get(`/chats/${chatId}/messages`, { params });
    return data;
  },

  sendMessage: async (chatId: string, body: string, type: 'text' | 'image' = 'text', mediaUrl?: string) => {
    const { data } = await api.post(`/chats/${chatId}/messages`, { body, type, mediaUrl });
    return data;
  },

  markChatRead: async (chatId: string) => {
    const { data } = await api.post(`/chats/${chatId}/read`);
    return data;
  },

  findOrCreateChat: async (targetUserId: string) => {
    const { data } = await api.post('/chats/find-or-create', { targetUserId });
    return data;
  },

  // Notifications
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },

  markNotificationRead: async (notificationId: string) => {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    return data;
  },

  registerPushToken: async (token: string) => {
    const { data } = await api.post('/notifications/push-token', { token });
    return data;
  },

  // Blocks
  getBlocks: async () => {
    const { data } = await api.get('/blocks');
    return data;
  },

  blockUser: async (targetUserId: string, reason?: string) => {
    const { data } = await api.post('/blocks', { targetUserId, reason });
    return data;
  },

  unblockUser: async (targetUserId: string) => {
    const { data } = await api.delete(`/blocks/${targetUserId}`);
    return data;
  },

  // Reports
  reportUser: async (targetUserId: string, reason: string, details?: string) => {
    const { data } = await api.post('/reports', { targetUserId, reason, details });
    return data;
  },

  unmatchUser: async (targetUserId: string) => {
    const { data } = await api.delete(`/matches/${targetUserId}`);
    return data;
  },
};

export default api;
