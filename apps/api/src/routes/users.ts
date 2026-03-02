import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { User } from '../models/User';

export const userRouter = Router();

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
    // Whitelist allowed fields to prevent setting verified, pushToken, etc.
    const allowedFields = ['name', 'department', 'year', 'bio', 'interests', 'clubs', 'lookingFor', 'avatarUrl', 'galleryUrls', 'collegeId', 'gender', 'interestedIn'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findOneAndUpdate(
      { email: req.user?.sub },
      { ...updates, email: req.user?.sub },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

userRouter.get('/discovery', requireAuth, async (req, res) => {
  try {
    const users = await User.find({
      email: { $ne: req.user?.sub },
    }).limit(500);
    res.json({ items: users });
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
