import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGODB_URI: z.string().default('mongodb://localhost:27017/campusconnect'),
    JWT_SECRET: z.string().default('dev-jwt-secret'),
    JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret'),
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.string().default('587'),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    CLOUDINARY_CLOUD_NAME: z.string().default(''),
    CLOUDINARY_API_KEY: z.string().default(''),
    CLOUDINARY_API_SECRET: z.string().default(''),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
