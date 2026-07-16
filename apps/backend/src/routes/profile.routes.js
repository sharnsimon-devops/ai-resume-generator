import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as profileController from '../controllers/profile.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', asyncHandler(profileController.getProfile));
profileRouter.post('/extract', asyncHandler(profileController.extractFromText));
profileRouter.post('/upload', upload.single('file'), asyncHandler(profileController.extractFromUpload));
profileRouter.put('/', asyncHandler(profileController.saveProfile));
