import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as keysController from '../controllers/keys.controller.js';

export const keysRouter = Router();

keysRouter.use(requireAuth);

keysRouter.get('/status', asyncHandler(keysController.getStatus));
keysRouter.post('/', asyncHandler(keysController.saveKey));
keysRouter.post('/rotate', asyncHandler(keysController.rotateKey));
keysRouter.delete('/', asyncHandler(keysController.deleteKey));
