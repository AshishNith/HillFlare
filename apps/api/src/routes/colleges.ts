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
    const { name, domain } = req.body as { name?: string; domain?: string };

    if (!name || !domain) {
      res.status(400).json({ error: 'Name and domain are required' });
      return;
    }

    if (name.length > 200 || domain.length > 100) {
      res.status(400).json({ error: 'Invalid field length' });
      return;
    }

    const college = await College.create({ name: name.trim(), domain: domain.trim().toLowerCase() });
    res.json(college);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'College with this domain already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create college' });
  }
});
