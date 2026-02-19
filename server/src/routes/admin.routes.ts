import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { User } from '../models/User';
import { Report } from '../models/Report';

const router = Router();

// Get all users (admin)
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;

        const filter: Record<string, unknown> = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(filter)
            .select('-otp -otpExpiresAt -refreshToken')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            data: users,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

// Get all reports (admin)
router.get('/reports', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const status = req.query.status as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const filter: Record<string, unknown> = {};
        if (status) filter.status = status;

        const reports = await Report.find(filter)
            .populate('reporter', 'name email')
            .populate('reportedUser', 'name email isSuspended')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Report.countDocuments(filter);

        res.json({
            success: true,
            data: reports,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
});

// Update report status (admin)
router.put('/reports/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update report' });
    }
});

// Ban user (admin)
router.post('/users/:id/ban', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isSuspended: true },
            { new: true }
        );
        res.json({ success: true, data: user, message: 'User banned' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to ban user' });
    }
});

// Unban user (admin)
router.post('/users/:id/unban', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isSuspended: false, reportCount: 0 },
            { new: true }
        );
        res.json({ success: true, data: user, message: 'User unbanned' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to unban user' });
    }
});

// Delete user (admin)
router.delete('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
        if (user.role === 'admin') { res.status(403).json({ success: false, error: 'Cannot delete admin user' }); return; }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
});

// Dashboard stats (admin)
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [totalUsers, verifiedUsers, suspendedUsers, pendingReports] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isVerified: true }),
            User.countDocuments({ isSuspended: true }),
            Report.countDocuments({ status: 'pending' }),
        ]);

        res.json({
            success: true,
            data: { totalUsers, verifiedUsers, suspendedUsers, pendingReports },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

export default router;
