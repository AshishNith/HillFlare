import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Match } from '../models/Match';
import { User } from '../models/User';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';

export const matchRouter = Router();

matchRouter.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    
    const matches = await Match.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    }).lean();

    const matchedUserIds = matches.map((m) =>
      m.user1Id === userId ? m.user2Id : m.user1Id
    );

    const users = await User.find({ email: { $in: matchedUserIds } });

    res.json({ items: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches', items: [] });
  }
});

matchRouter.delete('/:targetUserId', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { targetUserId } = req.params;

    await Match.deleteOne({
      $or: [
        { user1Id: userId, user2Id: targetUserId },
        { user1Id: targetUserId, user2Id: userId },
      ],
    });

    const chat = await Chat.findOne({
      memberIds: { $all: [userId, targetUserId] },
    });

    if (chat) {
      await Message.deleteMany({ chatId: chat._id.toString() });
      await Chat.findByIdAndDelete(chat._id);
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unmatch' });
  }
});
