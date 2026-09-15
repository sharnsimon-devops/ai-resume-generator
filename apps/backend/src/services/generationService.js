import { env } from '../config/env.js';
import { getSupabaseForUser } from '../lib/supabaseForRequest.js';
import * as profileService from './profileService.js';
import * as keyService from './keyService.js';
import * as tailorService from './tailorService.js';
import * as guardrailService from './guardrailService.js';
import * as renderService from './renderService.js';
import * as latexService from './latexService.js';
import * as templateService from './templateService.js';

async function resolveApiKey(userId) {
  if (env.ANTHROPIC_MOCK_MODE) return null;
  return keyService.getDecryptedApiKey(userId);
}

export async function runGeneration({ userId, accessToken, jdText, steering, renderEngine = 'html', templateId, onProgress, gapAnswers, keywordList }) {
  const profile = await profileService.getProfile(userId, accessToken);
  if (!profile) {
    const err = new Error('profile_not_found');
    err.status = 422;
    err.publicMessage = 'profile_required';
    throw err;
  }

  const apiKey = await resolveApiKey(userId);

  onProgress?.('tailoring');
  const draft = await tailorService.tailorResume({ profileJson: profile, jdText, steering, apiKey, gapAnswers, keywordList });

  onProgress?.('verifying');
  const { resume: verifiedResume, flags } = await guardrailService.verifyResume({
    draftResumeJson: draft,
    profileJson: profile,
    apiKey,
    gapAnswers,
  });

  onProgress?.('rendering');
  
  let injectedTex = null;
  if (renderEngine === 'latex') {
    if (!templateId) {
      const err = new Error('template_id_required');
      err.status = 400;
      err.publicMessage = 'A template ID is required for LaTeX rendering.';
      throw err;
    }
    
    // Fetch template from supabase
    const { data: templateData, error: templateError } = await getSupabaseForUser(accessToken)
      .from('templates')
      .select('content')
      .eq('id', templateId)
      .single();
      
    if (templateError || !templateData) {
      const err = new Error('template_not_found');
      err.status = 404;
      err.publicMessage = 'LaTeX template not found.';
      throw err;
    }

    onProgress?.('injecting_template');
    injectedTex = templateService.injectDataIntoLatex(templateData.content, verifiedResume);
    
    onProgress?.('compiling_latex');
    // Try to compile, will throw if docker fails (e.g. docker desktop not running locally)
    await latexService.compileLatexToPdf(injectedTex);
  } else {
    // Render HTML PDF to catch any render-time errors
    await renderService.renderResumeToPdf(verifiedResume);
  }

  onProgress?.('done');

  return { generationId: null, resume: verifiedResume, flags, texSource: injectedTex };
}
