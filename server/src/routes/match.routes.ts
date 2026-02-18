import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Match } from '../models/Match';

const router = Router();

// Get all matches for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;

        const matches = await Match.find({
            $or: [{ user1: userId }, { user2: userId }],
        })
            .populate('user1', 'name avatar photos department year')
            .populate('user2', 'name avatar photos department year')
            .sort({ createdAt: -1 });

        // Map to show the "other" user
        const formatted = matches.map((match) => {
            const otherUser = match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
            return {
                _id: match._id,
                matchedUser: otherUser,
                createdAt: match.createdAt,
            };
        });

        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch matches' });
    }
});

export default router;
