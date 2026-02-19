import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Match } from '../models/Match';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { Notification } from '../models/Notification';

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

// Unmatch
router.delete('/:matchId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const { matchId } = req.params;

        const match = await Match.findById(matchId);
        if (!match) {
            res.status(404).json({ success: false, error: 'Match not found' });
            return;
        }

        // Verify requester is a participant
        if (match.user1.toString() !== userId.toString() && match.user2.toString() !== userId.toString()) {
            res.status(403).json({ success: false, error: 'Not your match' });
            return;
        }

        const chat = await Chat.findOne({ matchId });
        if (chat) {
            await Message.deleteMany({ chatId: chat._id });
            await Chat.findByIdAndDelete(chat._id);
        }

        await Notification.deleteMany({ referenceId: matchId });
        await Match.findByIdAndDelete(matchId);

        res.json({ success: true, message: 'Unmatched successfully' });
    } catch (error) {
        console.error('Unmatch error:', error);
        res.status(500).json({ success: false, error: 'Failed to unmatch' });
    }
});

export default router;
