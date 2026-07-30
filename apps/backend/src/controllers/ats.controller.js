import { logger } from '../lib/logger.js';
import * as atsService from '../services/atsService.js';
import * as profileService from '../services/profileService.js';

export async function scoreAts(req, res) {
  const { jdText } = req.body;
  if (typeof jdText !== 'string') {
    return res.status(400).json({ error: 'jdText_required' });
  }

  try {
    const profileJson = req.body.resume || await profileService.getProfile(req.user.id, req.accessToken);
    if (!profileJson) {
      return res.status(422).json({ error: 'profile_required' });
    }

    logger.info({ isTailored: !!req.body.resume, profileKeys: Object.keys(profileJson) }, 'Calculating ATS score for profile/resume');

    const atsResult = await atsService.calculateAtsScore({ 
      profileJson, 
      jdText, 
      userId: req.user.id 
    });

    // Also return whether it scored the tailored resume or the base profile
    res.json({ ...atsResult, _meta: { isTailored: !!req.body.resume } });
  } catch (err) {
    logger.error({ err }, 'ATS scoring failed');
    res.status(err.status || 500).json({ error: err.publicMessage || 'ats_failed' });
  }
}
