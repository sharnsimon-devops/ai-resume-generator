import { startSse } from '../lib/sse.js';
import { logger } from '../lib/logger.js';
import * as generationService from '../services/generationService.js';
import { SteeringSchema } from '../utils/validation.js';

export async function createGeneration(req, res) {
  const { jdText, steering, renderEngine = 'html', templateId } = req.body;
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
      onProgress: (stage) => stream.send('progress', { stage }),
    });
    stream.send('done', result);
  } catch (err) {
    logger.error({ err }, 'generation failed');
    stream.send('error', { error: err.publicMessage || 'generation_failed' });
  } finally {
    stream.end();
  }
}

export async function downloadGenerationPdf(req, res) {
  const pdfBuffer = await generationService.renderGenerationPdf(req.user.id, req.accessToken, req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume-${req.params.id}.pdf"`);
  res.send(pdfBuffer);
}

export async function updateGeneration(req, res) {
  const { resume } = req.body;
  if (!resume) return res.status(400).json({ error: 'resume_required' });
  await generationService.updateGenerationResult(req.user.id, req.accessToken, req.params.id, resume);
  res.json({ success: true });
}
