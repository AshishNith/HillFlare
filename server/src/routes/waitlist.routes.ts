import { Router, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { Waitlist } from '../models/Waitlist';

const router = Router();

const waitlistSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
});

router.post('/', validate(waitlistSchema), async (req, res: Response): Promise<void> => {
    try {
        const { name, email } = req.body;

        const existing = await Waitlist.findOne({ email });
        if (existing) {
            res.status(400).json({ success: false, error: 'Already on the waitlist' });
            return;
        }

        await Waitlist.create({ name, email });
        res.json({ success: true, message: 'Added to waitlist!' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to join waitlist' });
    }
});

export default router;
