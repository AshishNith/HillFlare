import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '50mb' }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Trust proxy (Render / reverse proxy)
  app.set('trust proxy', 1);
  app.get('/', (_req: Request, res: Response) => res.json({ message: 'Welcome to the Hillflare API!' }));

  app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  app.use('/swipes', swipeRouter);
  app.use('/matches', matchRouter);
  app.use('/crushes', crushRouter);
  app.use('/chats', chatRouter);
  app.use('/reports', reportRouter);
  app.use('/notifications', notificationRouter);
  app.use('/blocks', blockRouter);

  return app;
};
