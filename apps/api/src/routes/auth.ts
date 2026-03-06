import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { generateOtp } from '../utils/otp';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 5;

const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Clean up expired OTPs periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 10 * 60 * 1000);

const emailSchema = z.string().email().max(254).trim().toLowerCase();

export const authRouter = Router();

authRouter.post('/otp/request', (req, res) => {
  const parsed = emailSchema.safeParse(req.body?.email);
  if (!parsed.success) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }

  const email = parsed.data;
  const otp = generateOtp();
  otpStore.set(email, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });

  // Only log OTP in development — never in production
  if (!env.isProd) {
    console.log(`[auth] OTP for ${email}: ${otp}`);
  }

  // TODO: Send OTP via email service (SendGrid, SES, etc.)

  res.json({ ok: true });
});

authRouter.post('/otp/verify', (req, res) => {
  const emailParsed = emailSchema.safeParse(req.body?.email);
  const otpParsed = z.string().length(6).regex(/^\d+$/).safeParse(req.body?.otp);

  if (!emailParsed.success || !otpParsed.success) {
    res.status(400).json({ error: 'Valid email and 6-digit OTP are required' });
    return;
  }

  const email = emailParsed.data;
  const otp = otpParsed.data;

  const stored = otpStore.get(email);
  if (!stored) {
    res.status(401).json({ error: 'No OTP found. Please request a new one.' });
    return;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
    return;
  }

  // Brute-force protection: max 5 attempts per OTP
  stored.attempts += 1;
  if (stored.attempts > MAX_OTP_ATTEMPTS) {
    otpStore.delete(email);
    res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
    return;
  }

  if (stored.otp !== otp) {
    res.status(401).json({ error: 'Invalid OTP' });
    return;
  }

  otpStore.delete(email); // Clean up used OTP

  const token = jwt.sign({ sub: email }, env.jwtSecret, { expiresIn: '7d' });
  res.json({ token });
});
