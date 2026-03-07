import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { User } from '../models/User';

export const userRouter = Router();

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  department: z.string().max(100).trim().optional(),
  year: z.number().int().min(1).max(6).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
  clubs: z.array(z.string().max(50)).max(10).optional(),
  lookingFor: z.string().max(100).optional(),
  avatarUrl: z.string().max(5_000_000).optional().or(z.literal('')),
  galleryUrls: z.array(z.string().max(5_000_000)).max(6).optional(),
  collegeId: z.string().max(100).optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer_not_to_say']).optional(),
  interestedIn: z.array(z.enum(['male', 'female', 'non-binary'])).optional(),
}).strict();

userRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user?.sub });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

userRouter.put('/me', requireAuth, async (req, res) => {
  try {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid profile data',
        details: parsed.error.issues.map(i => i.message),
      });
      return;
    }

    const updates = parsed.data;

    const user = await User.findOneAndUpdate(
      { email: req.user?.sub },
      { ...updates, email: req.user?.sub },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

userRouter.get('/discovery', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(Number(req.query.limit ?? 50), 50);
    const skip = (page - 1) * limit;

    const users = await User.find({
      email: { $ne: req.user?.sub },
    })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ items: users, page, hasMore: users.length === limit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', items: [] });
  }
});

userRouter.get('/:userId', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});
