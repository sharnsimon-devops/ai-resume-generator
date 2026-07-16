import { env } from '../config/env.js';
import * as profileService from '../services/profileService.js';
import * as extractionService from '../services/extractionService.js';
import * as keyService from '../services/keyService.js';
import { extractTextFromUpload } from '../utils/fileParsers.js';
import { ProfileSchema } from '../utils/validation.js';

async function resolveApiKey(userId) {
  if (env.ANTHROPIC_MOCK_MODE) return null;
  return keyService.getDecryptedApiKey(userId);
}

export async function getProfile(req, res) {
  const profile = await profileService.getProfile(req.user.id, req.accessToken);
  res.json({ profile });
}

export async function extractFromText(req, res) {
  const { rawText } = req.body;
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return res.status(400).json({ error: 'rawText_required' });
  }

  const apiKey = await resolveApiKey(req.user.id);
  const profile = await extractionService.extractProfile({ rawText, apiKey });
  res.json({ profile });
}

export async function extractFromUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'file_required' });
  }

  const rawText = await extractTextFromUpload(req.file.buffer, req.file.mimetype);
  const apiKey = await resolveApiKey(req.user.id);
  const profile = await extractionService.extractProfile({ rawText, apiKey });
  res.json({ profile });
}

export async function saveProfile(req, res) {
  const parsed = ProfileSchema.safeParse(req.body.profile);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_profile', details: parsed.error.flatten() });
  }

  const profile = await profileService.saveProfile(req.user.id, req.accessToken, parsed.data);
  res.json({ profile });
}
