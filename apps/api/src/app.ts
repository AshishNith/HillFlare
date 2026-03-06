import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { swipeRouter } from './routes/swipes';
import { matchRouter } from './routes/matches';
import { crushRouter } from './routes/crushes';
import { chatRouter } from './routes/chats';
import { reportRouter } from './routes/reports';
import { notificationRouter } from './routes/notifications';
import { blockRouter } from './routes/blocks';
import { collegeRouter } from './routes/colleges';

export const createApp = (): express.Express => {
  const app = express();

  // Trust proxy (Render / reverse proxy) - must be before rate limiter
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );
  // Reduced from 50mb to 5mb — 50mb is excessive and a DoS vector
  app.use(express.json({ limit: '5mb' }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Global rate limiter: 100 requests per minute per IP
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use(globalLimiter);

  // Stricter rate limit for auth routes: 10 requests per minute
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts, please try again later.' },
  });

  app.get('/', (_req: Request, res: Response) => res.json({ message: 'Welcome to the Hillflare API!' }));
  app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

  app.use('/auth', authLimiter, authRouter);
  app.use('/users', userRouter);
  app.use('/swipes', swipeRouter);
  app.use('/matches', matchRouter);
  app.use('/crushes', crushRouter);
  app.use('/chats', chatRouter);
  app.use('/reports', reportRouter);
  app.use('/notifications', notificationRouter);
  app.use('/blocks', blockRouter);
  app.use('/colleges', collegeRouter);

  // Global error handler - prevents stack traces leaking to client
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[api] Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};
