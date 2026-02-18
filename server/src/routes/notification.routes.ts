import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

const router = Router();

// Get notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const notifications = await Notification.find({ userId: req.user!._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            userId: req.user!._id,
            read: false,
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

// Mark as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!._id },
            { read: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to mark read' });
    }
});

// Mark all as read
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Notification.updateMany(
            { userId: req.user!._id, read: false },
            { $set: { read: true } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to mark all read' });
    }
});

export default router;
