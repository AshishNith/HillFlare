import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { Swipe } from '../models/Swipe';
import { Match } from '../models/Match';
import { Chat } from '../models/Chat';
import { Notification } from '../models/Notification';
import { User } from '../models/User';

const router = Router();

const swipeSchema = z.object({
    toUser: z.string(),
    type: z.enum(['like', 'pass']),
});

// Get profiles to swipe (excludes already-swiped)
router.get('/feed', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Get IDs of users already swiped on
        const swipedIds = await Swipe.find({ fromUser: userId }).distinct('toUser');
        const blockedIds = req.user!.blockedUsers || [];

        const excludeIds = [...swipedIds, ...blockedIds, userId];

        const profiles = await User.find({
            _id: { $nin: excludeIds },
            isVerified: true,
            isProfileComplete: true,
            isSuspended: false,
        })
            .select('name department year interests clubs photos bio avatar')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments({
            _id: { $nin: excludeIds },
            isVerified: true,
            isProfileComplete: true,
            isSuspended: false,
        });

        res.json({
            success: true,
            data: profiles,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ success: false, error: 'Failed to load feed' });
    }
});

// Create swipe
router.post('/', authenticate, validate(swipeSchema), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const { toUser, type } = req.body;

        if (userId.toString() === toUser) {
            res.status(400).json({ success: false, error: 'Cannot swipe on yourself' });
            return;
        }

        // Check if already swiped
        const existing = await Swipe.findOne({ fromUser: userId, toUser });
        if (existing) {
            res.status(400).json({ success: false, error: 'Already swiped on this user' });
            return;
        }

        await Swipe.create({ fromUser: userId, toUser, type });

        let isMatch = false;

        // Check for mutual like
        if (type === 'like') {
            const mutualLike = await Swipe.findOne({
                fromUser: toUser,
                toUser: userId,
                type: 'like',
            });

            if (mutualLike) {
                isMatch = true;

                // Create match
                const match = await Match.create({ user1: userId, user2: toUser });

                // Create chat for the match
                await Chat.create({
                    matchId: match._id,
                    participants: [userId, toUser],
                });

                // Notify both users
                await Notification.insertMany([
                    {
                        userId: userId,
                        type: 'match',
                        title: 'New Match! 🎉',
                        body: 'You have a new match! Say hello.',
                        referenceId: match._id,
                    },
                    {
                        userId: toUser,
                        type: 'match',
                        title: 'New Match! 🎉',
                        body: 'You have a new match! Say hello.',
                        referenceId: match._id,
                    },
                ]);
            }
        }

        res.json({ success: true, data: { isMatch } });
    } catch (error) {
        console.error('Swipe error:', error);
        res.status(500).json({ success: false, error: 'Swipe failed' });
    }
});

export default router;
