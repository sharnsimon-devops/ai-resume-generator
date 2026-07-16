import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as templateController from '../controllers/template.controller.js';

export const templateRouter = Router();

templateRouter.use(requireAuth);

templateRouter.get('/', asyncHandler(templateController.listTemplates));
templateRouter.get('/:id', asyncHandler(templateController.getTemplate));
templateRouter.post('/upload', asyncHandler(templateController.uploadTemplate));
