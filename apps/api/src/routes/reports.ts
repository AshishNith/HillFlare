import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Report } from '../models/Report';
import { User } from '../models/User';

export const reportRouter = Router();

reportRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { targetUserId, reason, details } = req.body as { targetUserId?: string; reason?: string; details?: string };
    const reporterId = req.user?.sub;

    if (!targetUserId || !reason) {
      res.status(400).json({ error: 'Target user and reason are required' });
      return;
    }

    if (reporterId === targetUserId) {
      res.status(400).json({ error: 'Cannot report yourself' });
      return;
    }

    const reporter = await User.findOne({ email: reporterId });

    await Report.create({
      reporterId,
      reportedUserId: targetUserId,
      reason,
      ...(details && { details }),
      ...(reporter?.collegeId && { collegeId: reporter.collegeId }),
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
});
