import dotenv from 'dotenv';

dotenv.config();

const isProd = (process.env.NODE_ENV ?? 'development') === 'production';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_me')) {
  throw new Error('JWT_SECRET must be set in production');
}
if (isProd && !process.env.MONGO_URI) {
  throw new Error('MONGO_URI must be set in production');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd,
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/hillflare',
  jwtSecret: process.env.JWT_SECRET ?? 'change_me',
  otpSecret: process.env.OTP_SECRET ?? 'dev_otp_secret',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  // SMTP settings for OTP emails
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'HillFlare <noreply@hillflare.com>',
};
