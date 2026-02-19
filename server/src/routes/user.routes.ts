import { Router, Response } from 'express';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { User } from '../models/User';
import { Swipe } from '../models/Swipe';
import { env } from '../config/env';

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

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

        // Check if current user has already swiped on this profile
        const existingSwipe = await Swipe.findOne({
            fromUser: req.user!._id,
            toUser: user._id
        });

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                hasSwiped: !!existingSwipe,
                swipeType: existingSwipe?.type
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

// Update photos (reorder / set array)
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

// Upload a single photo (base64) to Cloudinary
router.post('/photos/upload', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { image } = req.body; // base64 data URI
        if (!image) {
            res.status(400).json({ success: false, error: 'No image provided' });
            return;
        }

        const user = await User.findById(req.user!._id);
        if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }

        if ((user.photos || []).length >= 6) {
            res.status(400).json({ success: false, error: 'Max 6 photos allowed. Please delete one first.' });
            return;
        }

        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: `campusconnect/profiles/${user._id}`,
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto', width: 800, height: 800, crop: 'limit' }],
        });

        user.photos = [...(user.photos || []), uploadResult.secure_url];
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ success: false, error: 'Photo upload failed' });
    }
});

// Delete a photo by index
router.delete('/photos/:index', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const index = parseInt(req.params.index);
        const user = await User.findById(req.user!._id);
        if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }

        if (isNaN(index) || index < 0 || index >= (user.photos || []).length) {
            res.status(400).json({ success: false, error: 'Invalid photo index' });
            return;
        }

        // Try to delete from Cloudinary (extract public_id from URL)
        const photoUrl = user.photos[index];
        try {
            const parts = photoUrl.split('/upload/');
            if (parts[1]) {
                // Strip optional version prefix (v1234567890/)
                const withoutExt = parts[1].replace(/\.[^.]+$/, '');
                const publicId = withoutExt.replace(/^v\d+\//, '');
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (e) { /* ignore Cloudinary deletion errors */ }

        user.photos.splice(index, 1);
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Photo delete error:', error);
        res.status(500).json({ success: false, error: 'Photo delete failed' });
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

// Delete own account (cascade all user data)
router.delete('/account', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;

        const [{ Match }, { Chat }, { Message }, { CrushSelection }, { Notification }, { Report }] = await Promise.all([
            import('../models/Match'),
            import('../models/Chat'),
            import('../models/Message'),
            import('../models/CrushSelection'),
            import('../models/Notification'),
            import('../models/Report'),
        ]);

        const userChats = await Chat.find({ participants: userId }).select('_id');
        const chatIds = userChats.map((c) => c._id);

        await Promise.all([
            User.findByIdAndDelete(userId),
            Swipe.deleteMany({ $or: [{ fromUser: userId }, { toUser: userId }] }),
            Match.deleteMany({ $or: [{ user1: userId }, { user2: userId }] }),
            Chat.deleteMany({ participants: userId }),
            Message.deleteMany({ chatId: { $in: chatIds } }),
            CrushSelection.deleteMany({ $or: [{ userId }, { crushUserId: userId }] }),
            Notification.deleteMany({ userId }),
            Report.deleteMany({ $or: [{ reporter: userId }, { reportedUser: userId }] }),
        ]);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ success: false, error: 'Account deletion failed' });
    }
});

// Update user preferences (notifications, profileVisible)
router.put('/preferences', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const allowed = ['notifications', 'profileVisible'] as const;
        const updates: Record<string, boolean> = {};
        for (const key of allowed) {
            if (key in req.body && typeof req.body[key] === 'boolean') {
                updates[key] = req.body[key];
            }
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ success: false, error: 'No valid preference fields provided' });
            return;
        }
        await User.findByIdAndUpdate(userId, { $set: updates });
        res.json({ success: true, message: 'Preferences updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update preferences' });
    }
});

export default router;
