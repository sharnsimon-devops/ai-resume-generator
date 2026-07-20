import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { generationRateLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as generationController from '../controllers/generation.controller.js';

export const generationRouter = Router();

generationRouter.use(requireAuth);

generationRouter.post('/', generationRateLimiter, generationController.createGeneration);
generationRouter.get('/:id/pdf', asyncHandler(generationController.downloadGenerationPdf));
generationRouter.put('/:id', asyncHandler(generationController.updateGeneration));
