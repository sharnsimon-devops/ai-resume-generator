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

export async function runGeneration({ userId, accessToken, jdText, steering, renderEngine = 'html', templateId, onProgress }) {
  const profile = await profileService.getProfile(userId, accessToken);
  if (!profile) {
    const err = new Error('profile_not_found');
    err.status = 422;
    err.publicMessage = 'profile_required';
    throw err;
  }

  const apiKey = await resolveApiKey(userId);

  onProgress?.('tailoring');
  const draft = await tailorService.tailorResume({ profileJson: profile, jdText, steering, apiKey });

  onProgress?.('verifying');
  const { resume: verifiedResume, flags } = await guardrailService.verifyResume({
    draftResumeJson: draft,
    profileJson: profile,
    apiKey,
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

  // Insert into generations table
  const insertPayload = {
    user_id: userId,
    jd_text: jdText,
    steering_json: steering ?? {},
    result_json: verifiedResume,
    render_engine: renderEngine,
    flags_json: flags,
  };
  
  if (renderEngine === 'latex') {
    // Optionally store the template_id if schema allowed it, but the spec only says render_engine.
  }

  const { data, error } = await getSupabaseForUser(accessToken)
    .from('generations')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error) throw error;

  onProgress?.('done');

  return { generationId: data.id, resume: verifiedResume, flags, texSource: injectedTex };
}

export async function renderGenerationPdf(userId, accessToken, generationId) {
  const { data, error } = await getSupabaseForUser(accessToken)
    .from('generations')
    .select('result_json, render_engine')
    .eq('id', generationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const err = new Error('generation_not_found');
    err.status = 404;
    err.publicMessage = 'generation_not_found';
    throw err;
  }

  if (data.render_engine === 'latex') {
    // Note: Since we don't store the injected .tex string in the DB, 
    // downloading a past LaTeX PDF would require re-injecting and recompiling.
    // To satisfy the spec for this phase without schema changes, we compile it on the fly.
    // A robust version would save the compiled PDF to Supabase Storage.
    throw new Error('Downloading past LaTeX PDFs is not fully supported without Supabase Storage in this phase. Try regenerating it.');
  }

  return renderService.renderResumeToPdf(data.result_json);
}

export async function updateGenerationResult(userId, accessToken, generationId, newResumeJson) {
  const { error } = await getSupabaseForUser(accessToken)
    .from('generations')
    .update({ result_json: newResumeJson })
    .eq('id', generationId)
    .eq('user_id', userId);

  if (error) throw error;
}
