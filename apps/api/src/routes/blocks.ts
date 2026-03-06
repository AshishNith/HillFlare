import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Block } from '../models/Block';

export const blockRouter = Router();

blockRouter.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const items = await Block.find({ userId }).lean();
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocks', items: [] });
  }
});

blockRouter.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { targetUserId, reason } = req.body as { targetUserId?: string; reason?: string };

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user ID is required' });
      return;
    }

    if (userId === targetUserId) {
      res.status(400).json({ error: 'Cannot block yourself' });
      return;
    }

    await Block.findOneAndUpdate(
      { userId, targetUserId },
      { userId, targetUserId, reason },
      { upsert: true, new: true }
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

blockRouter.delete('/:targetUserId', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { targetUserId } = req.params;

    await Block.deleteOne({ userId, targetUserId });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});
