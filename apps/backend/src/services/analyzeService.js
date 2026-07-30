import { env } from '../config/env.js';
import { createAnthropicClient } from '../lib/anthropicClient.js';
import { buildAnalyzePrompt, JD_ANALYSIS_TOOL, JD_ANALYSIS_TOOL_CHOICE } from '../prompts/analyze.prompt.js';
import { analyzeMock } from '../prompts/mocks/analyze.mock.js';
import * as profileService from './profileService.js';
import * as keyService from './keyService.js';

export async function analyzeJd({ userId, accessToken, jdText }) {
  const profile = await profileService.getProfile(userId, accessToken);
  if (!profile) {
    const err = new Error('profile_not_found');
    err.status = 422;
    err.publicMessage = 'profile_required';
    throw err;
  }

  let apiKey = null;
  if (!env.ANTHROPIC_MOCK_MODE) {
    apiKey = await keyService.getDecryptedApiKey(userId);
  }

  const client = createAnthropicClient({ apiKey, mock: env.ANTHROPIC_MOCK_MODE });
  const { system, messages } = buildAnalyzePrompt({ profileJson: profile, jdText });

  const { toolInput, content } = await client.complete({
    system,
    messages,
    tools: [JD_ANALYSIS_TOOL],
    toolChoice: JD_ANALYSIS_TOOL_CHOICE,
    mockFixture: analyzeMock,
  });

  // toolInput is already parsed when available (from tool_use block or mock)
  const result = toolInput || parseJsonFallback(content);

  // Validate the structure minimally
  if (!result || !Array.isArray(result.matched_requirements) || !Array.isArray(result.flagged_gaps) || !Array.isArray(result.keyword_list)) {
    const err = new Error('analyze_returned_invalid_structure');
    err.status = 502;
    err.publicMessage = 'analyze_failed';
    throw err;
  }

  return {
    matched_requirements: result.matched_requirements,
    flagged_gaps: result.flagged_gaps,
    keyword_list: result.keyword_list,
  };
}

function parseJsonFallback(content) {
  try {
    let clean = content.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return JSON.parse(clean.trim());
  } catch {
    const err = new Error('analyze_returned_invalid_json');
    err.status = 502;
    err.publicMessage = 'analyze_failed';
    throw err;
  }
}
