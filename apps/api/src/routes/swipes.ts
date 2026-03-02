import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';
import { Swipe } from '../models/Swipe';
import { User } from '../models/User';
import { Match } from '../models/Match';
import { Notification } from '../models/Notification';

import { Block } from '../models/Block';

export const swipeRouter = Router();

swipeRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const userId = req.user?.sub;

    console.log('[swipes] Request:', { userId, targetUserId, direction });

    if (!targetUserId || !direction) {
      res.status(400).json({ error: 'Target user and direction are required' });
      return;
    }

    if (targetUserId === userId) {
      res.status(400).json({ error: 'Cannot swipe on yourself' });
      return;
    }

    // Safely look up target user — findById throws on invalid ObjectIds
    let targetUser = null;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      targetUser = await User.findById(targetUserId);
    }
    if (!targetUser) {
      targetUser = await User.findOne({ email: targetUserId });
    }
    if (!targetUser) {
      console.log('[swipes] Target user not found:', targetUserId);
      res.status(404).json({ error: 'Target user not found' });
      return;
    }
    const resolvedTargetId = targetUser._id.toString();

    console.log('[swipes] Resolved target:', { targetUser: targetUser.email, resolvedTargetId });

    const existing = await Swipe.findOne({ userId, targetUserId: resolvedTargetId });
    if (existing) {
      console.log('[swipes] Already swiped, returning early');
      res.json({ ok: true, matched: false }); // Silently return, already swiped
      return;
    }

    const swipe = await Swipe.create({
      userId,
      targetUserId: resolvedTargetId,
      direction,
    });

    console.log('[swipes] Swipe created:', swipe._id);

    const user = await User.findOne({ email: userId });
    
    if (!user) {
      console.log('[swipes] Current user not found by email:', userId);
      res.json({ ok: true, matched: false });
      return;
    }
    
    console.log('[swipes] Current user found:', { email: user.email, id: user._id.toString() });

    // Check for mutual like
    if (direction === 'right' && user) {
      console.log('[swipes] Checking for mutual like...', {
        lookingFor: {
          userId: targetUser.email,
          targetUserId: user._id.toString(),
          direction: 'right'
        }
      });
      
      const mutualSwipe = await Swipe.findOne({
        userId: targetUser.email, // they swiped using their email
        targetUserId: user._id.toString(), // they swiped on current user's ID
        direction: 'right',
      });

      console.log('[swipes] Mutual swipe result:', mutualSwipe ? 'MATCH!' : 'no match');

      if (mutualSwipe) {
        // Create a match
        console.log('[swipes] Creating match...');
        await Match.create({
          user1Id: userId,
          user2Id: targetUser.email,
          ...(user.collegeId && { collegeId: user.collegeId }),
        });

        console.log('[swipes] Match created, creating notifications...');
        
        // Create notifications for both users
        await Notification.create({
          userId: userId,
          type: 'match',
          payload: { message: `You matched with ${targetUser.name || 'someone'}!`, targetUserId: targetUser.email },
          ...(user.collegeId && { collegeId: user.collegeId }),
        });

        await Notification.create({
          userId: targetUser.email,
          type: 'match',
          payload: { message: `You matched with ${user.name || 'someone'}!`, targetUserId: userId },
          ...(user.collegeId && { collegeId: user.collegeId }),
        });

        console.log('[swipes] Match complete!');
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

    // Build query with mutual interest filtering:
    // A) candidate.gender is in currentUser.interestedIn
    // B) currentUser.gender is in candidate.interestedIn
    // C) Same college (optional — skip if no collegeId)
    // D) Not already swiped
    // E) Not blocked
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

    const users = await User.find(query).limit(20);

    res.json({ items: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discovery profiles', items: [] });
  }
});
