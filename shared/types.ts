// Shared TypeScript types for the College Social Platform

export interface IUser {
  _id: string;
  name: string;
  email: string;
  collegeId: string;
  department: string;
  year: number;
  interests: string[];
  clubs: string[];
  photos: string[];
  bio: string;
  avatar?: string;
  isSuspended: boolean;
  role: 'user' | 'admin';
  isVerified: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISwipe {
  _id: string;
  fromUser: string;
  toUser: string;
  type: 'like' | 'pass';
  createdAt: string;
}

export interface IMatch {
  _id: string;
  user1: string;
  user2: string;
  createdAt: string;
}

export interface ICrushSelection {
  _id: string;
  userId: string;
  crushUserId: string;
  cycleMonth: string; // YYYY-MM format
  createdAt: string;
}

export interface IChat {
  _id: string;
  matchId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  chatId: string;
  sender: string;
  content: string;
  seen: boolean;
  timestamp: string;
}

export interface IReport {
  _id: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: 'match' | 'crush_reveal' | 'message' | 'report_update' | 'system';
  title: string;
  body: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface IWaitlist {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth types
export interface LoginPayload {
  email: string;
}

export interface OTPVerifyPayload {
  email: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Compatibility
export interface CompatibilityProfile extends IUser {
  compatibilityScore: number;
}
