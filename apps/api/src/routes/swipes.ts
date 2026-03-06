import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';
import { Swipe } from '../models/Swipe';
import { User } from '../models/User';
import { Match } from '../models/Match';
import { Notification } from '../models/Notification';
import { Block } from '../models/Block';
import { getIo } from '../sockets';

export const swipeRouter = Router();

swipeRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const userId = req.user?.sub;

    if (!targetUserId || !direction || !['left', 'right'].includes(direction)) {
      res.status(400).json({ error: 'Target user and valid direction (left/right) are required' });
      return;
    }

    if (targetUserId === userId) {
      res.status(400).json({ error: 'Cannot swipe on yourself' });
      return;
    }

    // Safely look up target user
    let targetUser = null;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      targetUser = await User.findById(targetUserId);
    }
    if (!targetUser) {
      targetUser = await User.findOne({ email: targetUserId });
    }
    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }
    const resolvedTargetId = targetUser._id.toString();

    const existing = await Swipe.findOne({ userId, targetUserId: resolvedTargetId });
    if (existing) {
      res.json({ ok: true, matched: false }); // Already swiped
      return;
    }

    await Swipe.create({
      userId,
      targetUserId: resolvedTargetId,
      direction,
    });

    const user = await User.findOne({ email: userId });
    if (!user) {
      res.json({ ok: true, matched: false });
      return;
    }

    // Check for mutual like
    if (direction === 'right') {
      const mutualSwipe = await Swipe.findOne({
        userId: targetUser.email,
        targetUserId: user._id.toString(),
        direction: 'right',
      });

      if (mutualSwipe) {
        // Create a match
        await Match.create({
          user1Id: userId,
          user2Id: targetUser.email,
          ...(user.collegeId && { collegeId: user.collegeId }),
        });

        // Create notifications for both users
        await Promise.all([
          Notification.create({
            userId: userId,
            type: 'match',
            payload: { message: `You matched with ${targetUser.name || 'someone'}!`, targetUserId: targetUser.email },
            ...(user.collegeId && { collegeId: user.collegeId }),
          }),
          Notification.create({
            userId: targetUser.email,
            type: 'match',
            payload: { message: `You matched with ${user.name || 'someone'}!`, targetUserId: userId },
            ...(user.collegeId && { collegeId: user.collegeId }),
          }),
        ]);

        // Push real-time notification via Socket.io
        const io = getIo();
        if (io) {
          io.to(`user:${userId}`).emit('notification', {
            type: 'match',
            message: `You matched with ${targetUser.name || 'someone'}!`,
            targetUserId: targetUser.email,
          });
          io.to(`user:${targetUser.email}`).emit('notification', {
            type: 'match',
            message: `You matched with ${user.name || 'someone'}!`,
            targetUserId: userId,
          });
        }

        res.json({ ok: true, matched: true });
        return;
      }
    }

    res.json({ ok: true, matched: false });
  } catch (error) {
    console.error('[swipes] Error creating swipe:', error);
    res.status(500).json({ error: 'Failed to create swipe' });
  }
});

swipeRouter.get('/discovery', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;

    // Get current user for preference data
    const currentUser = await User.findOne({ email: userId });
    if (!currentUser) {
      res.status(404).json({ error: 'User not found', items: [] });
      return;
    }

    // If user hasn't set gender/preferences, return empty with a flag
    if (!currentUser.gender || !currentUser.interestedIn || currentUser.interestedIn.length === 0) {
      res.json({ items: [], profileIncomplete: true });
      return;
    }

    // Get users already swiped on
    const swipedIds = await Swipe.find({ userId }).distinct('targetUserId');

    // Get blocked users (both directions)
    const blockedByMe = await Block.find({ userId }).distinct('targetUserId');
    const blockedMe = await Block.find({ targetUserId: userId }).distinct('userId');
    const blockedIds = [...blockedByMe, ...blockedMe];

    // Build query with mutual interest filtering
    const query: Record<string, unknown> = {
      email: { $ne: userId },
      _id: { $nin: swipedIds },
      gender: { $in: currentUser.interestedIn },
      interestedIn: currentUser.gender,
    };

    // Exclude blocked users
    if (blockedIds.length > 0) {
      query.email = { $ne: userId, $nin: blockedIds };
    }

    // Same college filter (if set)
    if (currentUser.collegeId) {
      query.collegeId = currentUser.collegeId;
    }

    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const users = await User.find(query).limit(limit).lean();

    res.json({ items: users, hasMore: users.length === limit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discovery profiles', items: [] });
  }
});
