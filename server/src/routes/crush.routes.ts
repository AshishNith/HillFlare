import { Router, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { crushLimiter } from '../middleware/rateLimiter';
import { CrushSelection } from '../models/CrushSelection';
import { Notification } from '../models/Notification';

const router = Router();
const MAX_CRUSHES = 3;

const isValidId = (id: string) => mongoose.isValidObjectId(id);

const crushSchema = z.object({
    crushUserId: z.string(),
});

const getCurrentCycleMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get current crushes
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cycleMonth = getCurrentCycleMonth();
        const crushes = await CrushSelection.find({
            userId: req.user!._id,
            cycleMonth,
        }).populate('crushUserId', 'name avatar photos department');

        res.json({ success: true, data: crushes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch crushes' });
    }
});

// Add crush
router.post('/', authenticate, crushLimiter, validate(crushSchema), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const { crushUserId } = req.body;
        const cycleMonth = getCurrentCycleMonth();

        if (!isValidId(crushUserId)) {
            res.status(400).json({ success: false, error: 'Invalid user ID' });
            return;
        }

        if (userId.toString() === crushUserId) {
            res.status(400).json({ success: false, error: 'Cannot crush on yourself' });
            return;
        }

        // Check max
        const count = await CrushSelection.countDocuments({ userId, cycleMonth });
        if (count >= MAX_CRUSHES) {
            res.status(400).json({ success: false, error: `Max ${MAX_CRUSHES} crushes per month` });
            return;
        }

        // Check duplicate
        const existing = await CrushSelection.findOne({ userId, crushUserId, cycleMonth });
        if (existing) {
            res.status(400).json({ success: false, error: 'Already selected this crush' });
            return;
        }

        await CrushSelection.create({ userId, crushUserId, cycleMonth });

        // Check mutual crush
        const mutual = await CrushSelection.findOne({
            userId: crushUserId,
            crushUserId: userId,
            cycleMonth,
        });

        let isMutual = false;

        if (mutual) {
            isMutual = true;
            // Notify both users
            await Notification.insertMany([
                {
                    userId,
                    type: 'crush_reveal',
                    title: 'Crush Revealed! 💘',
                    body: 'Someone you picked as a crush also picked you!',
                    referenceId: crushUserId,
                },
                {
                    userId: crushUserId,
                    type: 'crush_reveal',
                    title: 'Crush Revealed! 💘',
                    body: 'Someone you picked as a crush also picked you!',
                    referenceId: userId,
                },
            ]);

            // Real-time socket notification
            try {
                const { getIO } = await import('../socket');
                const io = getIO();
                io.to(userId.toString()).emit('crush_reveal', { otherUserId: crushUserId });
                io.to(crushUserId).emit('crush_reveal', { otherUserId: userId.toString() });
            } catch { /* socket may not be ready */ }
        }

        res.json({ success: true, data: { isMutual }, message: 'Crush added' });
    } catch (error) {
        console.error('Add crush error:', error);
        res.status(500).json({ success: false, error: 'Failed to add crush' });
    }
});

// Remove crush
router.delete('/:crushUserId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cycleMonth = getCurrentCycleMonth();
        await CrushSelection.findOneAndDelete({
            userId: req.user!._id,
            crushUserId: req.params.crushUserId,
            cycleMonth,
        });
        res.json({ success: true, message: 'Crush removed' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to remove crush' });
    }
});

// Check if user is a mutual crush (revealed)
router.get('/revealed', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const cycleMonth = getCurrentCycleMonth();

        // Find my crushes
        const myCrushes = await CrushSelection.find({ userId, cycleMonth });
        const myCrushIds = myCrushes.map((c) => c.crushUserId.toString());

        // Find who crushed on me
        const crushesOnMe = await CrushSelection.find({
            crushUserId: userId,
            cycleMonth,
        });

        // Find mutual
        const mutualIds = crushesOnMe
            .filter((c) => myCrushIds.includes(c.userId.toString()))
            .map((c) => c.userId);

        const revealedUsers = await (await import('../models/User')).User.find({
            _id: { $in: mutualIds },
        }).select('name avatar photos department year');

        res.json({ success: true, data: revealedUsers });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch reveals' });
    }
});

export default router;
