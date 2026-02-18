import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Swipe } from '../models/Swipe';
import { calculateCompatibility } from '../services/compatibility';

const router = Router();

// Explore profiles with compatibility scoring
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const currentUser = req.user!;

        const {
            department,
            year,
            interests,
            clubs,
        } = req.query;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        // Build filter
        const filter: Record<string, unknown> = {
            _id: { $ne: userId },
            isVerified: true,
            isProfileComplete: true,
            isSuspended: false,
        };

        if (department) filter.department = department;
        if (year) filter.year = parseInt(year as string);
        if (interests) {
            const interestList = (interests as string).split(',');
            filter.interests = { $in: interestList };
        }
        if (clubs) {
            const clubList = (clubs as string).split(',');
            filter.clubs = { $in: clubList };
        }

        // Exclude blocked users
        if (currentUser.blockedUsers?.length > 0) {
            filter._id = { $nin: [...currentUser.blockedUsers, userId] };
        }

        const profiles = await User.find(filter)
            .select('name department year interests clubs photos bio avatar')
            .lean();

        // Calculate compatibility scores
        const scored = profiles.map((profile) => ({
            ...profile,
            compatibilityScore: calculateCompatibility(currentUser, profile as any),
        }));

        // Sort by compatibility score (highest first)
        scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        // Paginate
        const start = (page - 1) * limit;
        const paginated = scored.slice(start, start + limit);

        res.json({
            success: true,
            data: paginated,
            page,
            limit,
            total: scored.length,
            totalPages: Math.ceil(scored.length / limit),
        });
    } catch (error) {
        console.error('Explore error:', error);
        res.status(500).json({ success: false, error: 'Failed to explore' });
    }
});

export default router;
