import { Router } from 'express';
import { College } from '../models/College';
import { requireAuth } from '../middleware/auth';

export const collegeRouter = Router();

collegeRouter.get('/', async (_req, res) => {
  try {
    const colleges = await College.find();
    res.json({ items: colleges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch colleges', items: [] });
  }
});

collegeRouter.post('/', requireAuth, async (req, res) => {
  try {
    const college = await College.create(req.body);
    res.json(college);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create college' });
  }
});
