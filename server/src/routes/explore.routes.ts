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
            search,
        } = req.query;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        // Build filter
        const query: any = {
            _id: { $ne: userId }, // Default: exclude self
            isVerified: true,
            isProfileComplete: true,
            isSuspended: false,
        };

        if (department) query.department = department;
        if (year) query.year = parseInt(year as string);
        if (interests) {
            const interestList = (interests as string).split(',');
            query.interests = { $in: interestList };
        }
        if (clubs) {
            const clubList = (clubs as string).split(',');
            query.clubs = { $in: clubList };
        }

        // Search logic
        if (search) {
            const searchRegex = { $regex: search as string, $options: 'i' };
            query.$or = [
                { name: searchRegex },
                { department: searchRegex },
                { interests: searchRegex },
                { clubs: searchRegex },
            ];
        }

        // Exclude blocked users (override _id if needed to include blocked list)
        if (currentUser.blockedUsers?.length > 0) {
            query._id = { $nin: [...currentUser.blockedUsers, userId] };
        }

        const profiles = await User.find(query)
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
