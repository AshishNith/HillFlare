// Shared constants for the College Social Platform

export const APP_NAME = 'CampusConnect';
export const APP_TAGLINE = 'Your Campus. Your Connections.';
export const APP_SUBTITLE = 'Verified. Private. Real.';

// Crush system
export const MAX_CRUSHES = 3;
export const CRUSH_CYCLE_DAYS = 30;

// Compatibility scoring weights
export const COMPATIBILITY_WEIGHTS = {
    SHARED_INTERESTS: 5,
    SHARED_CLUBS: 8,
    SAME_DEPARTMENT: 3,
    SAME_YEAR: 2,
} as const;

// Auth
export const COLLEGE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in|edu\.in|college\.[a-z]+)$/;
export const OTP_EXPIRY_MINUTES = 10;
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

// Moderation
export const AUTO_SUSPEND_REPORT_THRESHOLD = 5;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// Predefined lists
export const INTERESTS = [
    'Music', 'Movies', 'Gaming', 'Reading', 'Travel',
    'Photography', 'Cooking', 'Fitness', 'Art', 'Dance',
    'Technology', 'Sports', 'Writing', 'Fashion', 'Anime',
    'Podcasts', 'Volunteering', 'Nature', 'Astronomy', 'Comedy',
] as const;

export const CLUBS = [
    'Coding Club', 'Drama Society', 'Music Club', 'Dance Club',
    'Debate Society', 'Photography Club', 'Sports Club', 'Literary Club',
    'Entrepreneurship Cell', 'Robotics Club', 'Film Club', 'Art Society',
    'Quiz Club', 'Cultural Committee', 'NSS', 'NCC',
    'IEEE', 'ACM', 'Google DSC', 'Microsoft Club',
] as const;

export const DEPARTMENTS = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil',
    'Electrical', 'Chemical', 'Biotechnology', 'Information Technology',
    'Mathematics', 'Physics', 'Chemistry', 'Economics',
    'Business Administration', 'Psychology', 'English', 'History',
    'Design', 'Architecture', 'Medicine', 'Law',
] as const;
