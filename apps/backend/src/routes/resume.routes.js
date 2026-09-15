import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generationRateLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as resumeController from '../controllers/resume.controller.js';

export const resumeRouter = Router();

resumeRouter.use(requireAuth);

// Step 1: Analyze JD against user's profile (returns structured gaps + keywords)
resumeRouter.post('/analyze', asyncHandler(resumeController.analyze));

// Step 2: Generate tailored resume with gap answers merged in (SSE stream)
resumeRouter.post('/generate', generationRateLimiter, resumeController.generate);

// Step 3: Score the generated resume (hybrid deterministic + qualitative)
resumeRouter.post('/score', asyncHandler(resumeController.score));

// Render resume to PDF
resumeRouter.post('/render', asyncHandler(resumeController.renderPdf));
