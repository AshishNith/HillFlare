import { Router, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { generateOTP, getOTPExpiryDate, isOTPExpired } from '../services/otp';
import { sendOTPEmail } from '../services/email';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const sendOTPSchema = z.object({
    email: z.string().email('Invalid email'),
});

const verifyOTPSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Send OTP
router.post('/send-otp', authLimiter, validate(sendOTPSchema), async (req, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiresAt = getOTPExpiryDate();
        await user.save();

        await sendOTPEmail(email, otp);

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), async (req, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        if (!user.otp || !user.otpExpiresAt) {
            res.status(400).json({ success: false, error: 'No OTP requested' });
            return;
        }

        if (isOTPExpired(user.otpExpiresAt)) {
            res.status(400).json({ success: false, error: 'OTP expired' });
            return;
        }

        if (user.otp !== otp) {
            res.status(400).json({ success: false, error: 'Invalid OTP' });
            return;
        }

        // Mark verified, clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;

        // Generate tokens
        const accessToken = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isProfileComplete: user.isProfileComplete,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

// Refresh token
router.post('/refresh', async (req, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ success: false, error: 'Refresh token required' });
            return;
        }

        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({ success: false, error: 'Invalid refresh token' });
            return;
        }

        const newAccessToken = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ userId: user._id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Token refresh failed' });
    }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: req.user });
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user) {
            req.user.refreshToken = undefined;
            await req.user.save();
        }
        res.json({ success: true, message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
});

export default router;
