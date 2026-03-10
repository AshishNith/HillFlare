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
  // Brevo transactional email API
  brevoApiKey: process.env.BREVO_API_KEY ?? '',
  emailFromName: process.env.EMAIL_FROM_NAME ?? 'HillFlare',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@hillflare.com',
};
