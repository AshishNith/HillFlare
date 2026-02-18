import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { User } from '../models/User';

const router = Router();

const updateProfileSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    department: z.string().optional(),
    year: z.number().min(1).max(6).optional(),
    interests: z.array(z.string()).max(10).optional(),
    clubs: z.array(z.string()).max(10).optional(),
    bio: z.string().max(500).optional(),
    collegeId: z.string().optional(),
});

// Get own profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: req.user });
});

// Update profile
router.put('/profile', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const allowedFields = ['name', 'department', 'year', 'interests', 'clubs', 'bio', 'collegeId'];
        const updates: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Check if profile is now complete
        const user = req.user!;
        const merged = { ...user.toObject(), ...updates };
        if (merged.name && merged.department && merged.year && merged.interests?.length > 0) {
            updates.isProfileComplete = true;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user!._id,
            { $set: updates },
            { new: true }
        );

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: 'Profile update failed' });
    }
});

// Get user by ID (public profile)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('name department year interests clubs photos bio avatar');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

// Update photos
router.put('/photos', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { photos } = req.body;
        if (!Array.isArray(photos) || photos.length > 6) {
            res.status(400).json({ success: false, error: 'Max 6 photos allowed' });
            return;
        }

        const user = await User.findByIdAndUpdate(
            req.user!._id,
            { $set: { photos } },
            { new: true }
        );

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Photo update failed' });
    }
});

// Block user
router.post('/block/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        await User.findByIdAndUpdate(req.user!._id, {
            $addToSet: { blockedUsers: userId },
        });
        res.json({ success: true, message: 'User blocked' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Block failed' });
    }
});

// Unblock user
router.delete('/block/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        await User.findByIdAndUpdate(req.user!._id, {
            $pull: { blockedUsers: userId },
        });
        res.json({ success: true, message: 'User unblocked' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Unblock failed' });
    }
});

export default router;
