import { startSse } from '../lib/sse.js';
import { logger } from '../lib/logger.js';
import * as analyzeService from '../services/analyzeService.js';
import * as generationService from '../services/generationService.js';
import * as scoreService from '../services/scoreService.js';
import { SteeringSchema } from '../utils/validation.js';

/**
 * Step 1 — Analyze JD against the user's profile.
 * Returns matched requirements, flagged gaps, and keyword list.
 */
export async function analyze(req, res) {
  const { jdText } = req.body;
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
    return res.status(400).json({ error: 'jdText_required' });
  }

  try {
    const result = await analyzeService.analyzeJd({
      userId: req.user.id,
      accessToken: req.accessToken,
      jdText,
    });
    res.json(result);
  } catch (err) {
    logger.error({ err }, 'JD analysis failed');
    res.status(err.status || 500).json({ error: err.publicMessage || 'analyze_failed' });
  }
}

/**
 * Step 2 — Generate a tailored resume with gap answers merged in.
 * Uses the same SSE streaming as the existing generation endpoint.
 */
export async function generate(req, res) {
  const { jdText, steering, gapAnswers, keywordList, renderEngine = 'html', templateId } = req.body;
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
    return res.status(400).json({ error: 'jdText_required' });
  }

  const steeringResult = SteeringSchema.safeParse(steering ?? {});
  if (!steeringResult.success) {
    return res.status(400).json({ error: 'invalid_steering', details: steeringResult.error.flatten() });
  }

  const stream = startSse(res);

  try {
    const result = await generationService.runGeneration({
      userId: req.user.id,
      accessToken: req.accessToken,
      jdText,
      steering: steeringResult.data,
      renderEngine,
      templateId,
      gapAnswers: gapAnswers || [],
      keywordList: keywordList || [],
      onProgress: (stage) => stream.send('progress', { stage }),
    });
    stream.send('done', result);
  } catch (err) {
    logger.error({ err }, 'resume generation failed');
    stream.send('error', { error: err.publicMessage || 'generation_failed' });
  } finally {
    stream.end();
  }
}

/**
 * Step 3 — Score the generated resume using hybrid (deterministic + qualitative) analysis.
 */
export async function score(req, res) {
  const { resumeJson, jdText, keywordList } = req.body;
  if (!resumeJson || !jdText) {
    return res.status(400).json({ error: 'resumeJson_and_jdText_required' });
  }

  try {
    const result = await scoreService.scoreResume({
      resumeJson,
      jdText,
      keywordList: keywordList || [],
      userId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    logger.error({ err }, 'resume scoring failed');
    res.status(err.status || 500).json({ error: err.publicMessage || 'score_failed' });
  }
}
