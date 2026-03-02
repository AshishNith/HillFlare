import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';
import { CrushSelection } from '../models/CrushSelection';
import { User } from '../models/User';
import { Match } from '../models/Match';
import { Notification } from '../models/Notification';

export const crushRouter = Router();

crushRouter.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const crushes = await CrushSelection.find({ userId });

    // Fetch user details for each crush
    const crushesWithUsers = await Promise.all(
      crushes.map(async (crush) => {
        const targetUser = mongoose.Types.ObjectId.isValid(crush.targetUserId)
          ? await User.findById(crush.targetUserId)
          : await User.findOne({ email: crush.targetUserId });
        return {
          ...crush.toObject(),
          targetUserId: targetUser || { email: crush.targetUserId },
        };
      })
    );

    res.json({ items: crushesWithUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crushes', items: [] });
  }
});

crushRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user?.sub;

    console.log('[crushes] POST /', { userId, targetUserId });

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user is required' });
      return;
    }

    // Fetch user to get collegeId
    const user = await User.findOne({ email: userId });
    if (!user) {
      res.status(404).json({ error: 'Please complete your profile first' });
      return;
    }

    // Prevent self-crush
    if (targetUserId === userId || targetUserId === user._id.toString()) {
      res.status(400).json({ error: 'Cannot crush on yourself' });
      return;
    }

    // Check if user already has 3 crushes
    const existingCount = await CrushSelection.countDocuments({ userId });
    if (existingCount >= 3) {
      res.status(400).json({ error: 'Maximum 3 crushes allowed' });
      return;
    }

    // Resolve target user
    const targetUser = mongoose.Types.ObjectId.isValid(targetUserId)
      ? await User.findById(targetUserId)
      : await User.findOne({ email: targetUserId });

    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    const targetUserIdValue = targetUser._id.toString();

    // Check if already crushing on same person
    const alreadyCrushing = await CrushSelection.findOne({
      userId,
      targetUserId: targetUserIdValue,
    });
    if (alreadyCrushing) {
      res.status(400).json({ error: 'You already have a crush on this person' });
      return;
    }

    await CrushSelection.create({
      userId,
      targetUserId: targetUserIdValue,
      ...(user.collegeId && { collegeId: user.collegeId }),
    });

    console.log('[crushes] Crush created, checking mutual...');

    // Check for mutual crush — target user's crush on current user
    // Target may have stored our _id OR email as targetUserId
    const mutualCrush = await CrushSelection.findOne({
      userId: targetUser.email,
      $or: [
        { targetUserId: user._id.toString() },
        { targetUserId: userId },
      ],
    });

    console.log('[crushes] Mutual crush:', mutualCrush ? 'YES' : 'no');

    if (mutualCrush) {
      // Mark both crush selections as revealed
      await CrushSelection.updateMany(
        {
          $or: [
            { userId, targetUserId: targetUserIdValue },
            { userId: targetUser.email, targetUserId: { $in: [user._id.toString(), userId] } },
          ],
        },
        { revealed: true }
      );

      // Create match
      await Match.create({
        user1Id: userId,
        user2Id: targetUser.email,
        ...(user.collegeId && { collegeId: user.collegeId }),
      });

      // Create notifications for both users
      await Notification.create({
        userId: userId,
        type: 'crush_match',
        payload: { message: `Your crush on ${targetUser.name} is mutual! 💕`, targetUserId: targetUser.email },
        ...(user.collegeId && { collegeId: user.collegeId }),
      });

      await Notification.create({
        userId: targetUser.email,
        type: 'crush_match',
        payload: { message: `Your crush on ${user.name} is mutual! 💕`, targetUserId: userId },
        ...(user.collegeId && { collegeId: user.collegeId }),
      });

      console.log('[crushes] Mutual crush match created!');
      res.json({ ok: true, matched: true, matchedUser: targetUser });
      return;
    }

    res.json({ ok: true, matched: false });
  } catch (error) {
    console.error('[crushes] Error:', error);
    res.status(500).json({ error: 'Failed to create crush' });
  }
});

crushRouter.put('/:crushId', requireAuth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const { crushId } = req.params;
    const userId = req.user?.sub;

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user is required' });
      return;
    }

    // Ensure the crush belongs to the current user
    const existingCrush = await CrushSelection.findOne({
      _id: crushId,
      userId
    });

    if (!existingCrush) {
      res.status(404).json({ error: 'Crush not found' });
      return;
    }

    // Resolve target user
    const targetUser = mongoose.Types.ObjectId.isValid(targetUserId)
      ? await User.findById(targetUserId)
      : await User.findOne({ email: targetUserId });

    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    const targetUserIdValue = targetUser._id.toString();

    // Don't allow changing to someone you already have a crush on
    const duplicateCrush = await CrushSelection.findOne({
      userId,
      targetUserId: targetUserIdValue,
      _id: { $ne: crushId },
    });
    if (duplicateCrush) {
      res.status(400).json({ error: 'You already have a crush on this person' });
      return;
    }

    const updatedCrush = await CrushSelection.findByIdAndUpdate(
      crushId,
      { targetUserId: targetUserIdValue, revealed: false },
      { new: true }
    );

    // Fetch user to check mutual crush
    const user = await User.findOne({ email: userId });

    if (user) {
      const mutualCrush = await CrushSelection.findOne({
        userId: targetUser.email,
        $or: [
          { targetUserId: user._id.toString() },
          { targetUserId: userId },
        ],
      });

      if (mutualCrush) {
        await CrushSelection.updateMany(
          {
            $or: [
              { _id: crushId },
              { _id: mutualCrush._id },
            ],
          },
          { revealed: true }
        );

        await Match.create({
          user1Id: userId,
          user2Id: targetUser.email,
          ...(user.collegeId && { collegeId: user.collegeId }),
        });

        await Notification.create({
          userId,
          type: 'crush_match',
          payload: { message: `Your crush on ${targetUser.name} is mutual! 💕`, targetUserId: targetUser.email },
          ...(user.collegeId && { collegeId: user.collegeId }),
        });
        await Notification.create({
          userId: targetUser.email,
          type: 'crush_match',
          payload: { message: `Your crush on ${user.name} is mutual! 💕`, targetUserId: userId },
          ...(user.collegeId && { collegeId: user.collegeId }),
        });

        res.json({ data: updatedCrush, matched: true, matchedUser: targetUser });
        return;
      }
    }

    res.json({ data: updatedCrush, matched: false });
  } catch (error) {
    console.error('[crushes] Update error:', error);
    res.status(500).json({ error: 'Failed to update crush' });
  }
});

crushRouter.delete('/:crushId', requireAuth, async (req, res) => {
  try {
    const { crushId } = req.params;
    const userId = req.user?.sub;

    // Ensure the crush belongs to the current user
    const existingCrush = await CrushSelection.findOne({
      _id: crushId,
      userId
    });

    if (!existingCrush) {
      res.status(404).json({ error: 'Crush not found' });
      return;
    }

    await CrushSelection.findByIdAndDelete(crushId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete crush' });
  }
});
