import crypto from 'crypto';

export const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

export const isOTPExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
};

export const getOTPExpiryDate = (minutes: number = 10): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
};
