import { Router, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { swipeLimiter } from '../middleware/rateLimiter';
import { Swipe } from '../models/Swipe';
import { Match } from '../models/Match';
import { Chat } from '../models/Chat';
import { Notification } from '../models/Notification';
import { User } from '../models/User';

const router = Router();

const isValidId = (id: string) => mongoose.isValidObjectId(id);

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
router.post('/', authenticate, swipeLimiter, validate(swipeSchema), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const { toUser, type } = req.body;

        if (!isValidId(toUser)) {
            res.status(400).json({ success: false, error: 'Invalid user ID' });
            return;
        }

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
                // Race condition guard — only create if match doesn't already exist
                const existingMatch = await Match.findOne({
                    $or: [{ user1: userId, user2: toUser }, { user1: toUser, user2: userId }],
                });

                if (!existingMatch) {
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

                    // Real-time socket notification
                    try {
                        const { getIO } = await import('../socket');
                        const io = getIO();
                        io.to(userId.toString()).emit('new_match', { matchId: match._id, otherUserId: toUser });
                        io.to(toUser).emit('new_match', { matchId: match._id, otherUserId: userId.toString() });
                    } catch { /* socket may not be ready */ }
                }
            }
        }

        res.json({ success: true, data: { isMatch } });
    } catch (error) {
        console.error('Swipe error:', error);
        res.status(500).json({ success: false, error: 'Swipe failed' });
    }
});

// Undo swipe
router.delete('/undo/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const targetUserId = req.params.userId;

        // Find the swipe
        const swipe = await Swipe.findOne({ fromUser: userId, toUser: targetUserId });
        if (!swipe) {
            res.status(404).json({ success: false, error: 'Swipe not found' });
            return;
        }

        // If it was a match, clean up
        const match = await Match.findOne({
            $or: [
                { user1: userId, user2: targetUserId },
                { user1: targetUserId, user2: userId }
            ]
        });

        if (match) {
            // Delete chat
            await Chat.findOneAndDelete({ matchId: match._id });
            // Delete match
            await Match.findByIdAndDelete(match._id);
            // Delete notifications (optional, but cleaner)
            await Notification.deleteMany({ referenceId: match._id });
        }

        // Delete the swipe
        await Swipe.findByIdAndDelete(swipe._id);

        res.json({ success: true, message: 'Swipe undone' });
    } catch (error) {
        console.error('Undo swipe error:', error);
        res.status(500).json({ success: false, error: 'Failed to undo action' });
    }
});

export default router;
