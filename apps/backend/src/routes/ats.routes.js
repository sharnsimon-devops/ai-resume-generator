import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as atsController from '../controllers/ats.controller.js';

export const atsRouter = Router();

atsRouter.use(requireAuth);
atsRouter.post('/score', asyncHandler(atsController.scoreAts));
