import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';
import { generalLimiter } from './middleware/rateLimiter';
import { initializeSocket } from './socket';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import swipeRoutes from './routes/swipe.routes';
import matchRoutes from './routes/match.routes';
import crushRoutes from './routes/crush.routes';
import exploreRoutes from './routes/explore.routes';
import chatRoutes from './routes/chat.routes';
import reportRoutes from './routes/report.routes';
import adminRoutes from './routes/admin.routes';
import waitlistRoutes from './routes/waitlist.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
    origin: env.NODE_ENV === 'development' ? true : env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/crushes', crushRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const start = async () => {
    await connectDB();

    server.listen(parseInt(env.PORT), '0.0.0.0', () => {
        console.log(`
🚀 CampusConnect Server running!
   Port: ${env.PORT}
   Environment: ${env.NODE_ENV}
   MongoDB: Connected
   Socket.io: Ready
    `);
    });
};

start().catch(console.error);

export { app, server, io };
