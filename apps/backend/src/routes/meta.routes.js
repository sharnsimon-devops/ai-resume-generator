import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

export const metaRouter = Router();

metaRouter.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

metaRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
