import mongoose from 'mongoose';
import { env } from './env';

export const connectDb = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri, {
    // Connection pool settings for production readiness
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected. Attempting to reconnect...');
  });
};
