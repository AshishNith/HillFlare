import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { User } from '../models/User';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const items = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications', items: [] });
  }
});

notificationRouter.put('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.sub;
    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true }
    );
    if (!result) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification read' });
  }
});

notificationRouter.post('/push-token', requireAuth, async (req, res) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      res.status(400).json({ error: 'Push token is required' });
      return;
    }

    await User.findOneAndUpdate(
      { email: req.user?.sub },
      { pushToken: token },
      { new: true }
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save push token' });
  }
});
