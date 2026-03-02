import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { generateOtp } from '../utils/otp';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const authRouter = Router();

authRouter.post('/otp/request', (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const otp = generateOtp();
  otpStore.set(email, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
  console.log(`[auth] OTP for ${email}: ${otp}`);

  res.json({ ok: true });
});

authRouter.post('/otp/verify', (req, res) => {
  const { email, otp } = req.body as {
    email?: string;
    otp?: string;
  };

  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' });
    return;
  }

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

  if (stored.otp !== otp) {
    res.status(401).json({ error: 'Invalid OTP' });
    return;
  }

  otpStore.delete(email); // Clean up used OTP

  const token = jwt.sign({ sub: email }, env.jwtSecret, { expiresIn: '7d' });
  res.json({ token });
});
