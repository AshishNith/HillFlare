import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { Report } from '../models/Report';
import { User } from '../models/User';

const router = Router();
const AUTO_SUSPEND_THRESHOLD = 5;

const reportSchema = z.object({
    reportedUser: z.string(),
    reason: z.string().min(5).max(500),
    description: z.string().max(1000).optional(),
});

// Submit report
router.post('/', authenticate, validate(reportSchema), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { reportedUser, reason, description } = req.body;

        if (req.user!._id.toString() === reportedUser) {
            res.status(400).json({ success: false, error: 'Cannot report yourself' });
            return;
        }

        // Check duplicate
        const existing = await Report.findOne({
            reporter: req.user!._id,
            reportedUser,
            status: 'pending',
        });
        if (existing) {
            res.status(400).json({ success: false, error: 'Already reported this user' });
            return;
        }

        await Report.create({
            reporter: req.user!._id,
            reportedUser,
            reason,
            description: description || '',
        });

        // Increment report count and auto-suspend if threshold reached
        const user = await User.findByIdAndUpdate(
            reportedUser,
            { $inc: { reportCount: 1 } },
            { new: true }
        );

        if (user && user.reportCount >= AUTO_SUSPEND_THRESHOLD) {
            user.isSuspended = true;
            await user.save();
        }

        res.json({ success: true, message: 'Report submitted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to submit report' });
    }
});

export default router;
