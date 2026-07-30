import { env } from '../config/env.js';
import { createAnthropicClient } from '../lib/anthropicClient.js';
import { buildScorePrompt, ATS_QUALITATIVE_TOOL, ATS_QUALITATIVE_TOOL_CHOICE } from '../prompts/score.prompt.js';
import { scoreMock } from '../prompts/mocks/score.mock.js';
import * as keyService from './keyService.js';
import {
  calculateKeywordCoverage,
  calculateContactCompleteness,
  calculateSectionPresence,
  resumeJsonToText,
} from '../utils/keywordScorer.js';

/**
 * Hybrid ATS scorer: deterministic keyword/structure scores computed in code,
 * blended with qualitative LLM-evaluated scores.
 *
 * Formula:
 *   overall = 0.40 * keyword_coverage
 *           + 0.20 * contact_completeness * 100
 *           + 0.15 * section_presence * 100
 *           + 0.15 * quantification_score
 *           + 0.10 * relevance_score
 */
export async function scoreResume({ resumeJson, jdText, keywordList, userId }) {
  // --- Deterministic component (computed in code) ---
  const resumeText = resumeJsonToText(resumeJson);
  const keywordResult = calculateKeywordCoverage(resumeText, keywordList);
  const contactResult = calculateContactCompleteness(resumeJson);
  const sectionResult = calculateSectionPresence(resumeJson);

  // --- Qualitative component (LLM via forced tool call) ---
  let apiKey = null;
  if (!env.ANTHROPIC_MOCK_MODE) {
    apiKey = await keyService.getDecryptedApiKey(userId);
  }

  const client = createAnthropicClient({ apiKey, mock: env.ANTHROPIC_MOCK_MODE });
  const { system, messages } = buildScorePrompt({ resumeText, jdText });

  const { toolInput, content } = await client.complete({
    system,
    messages,
    tools: [ATS_QUALITATIVE_TOOL],
    toolChoice: ATS_QUALITATIVE_TOOL_CHOICE,
    mockFixture: scoreMock,
  });

  const qualitative = toolInput || parseJsonFallback(content);

  // --- Blend scores ---
  const keywordCoverage = keywordResult.score;
  const contactCompleteness = Math.round(contactResult.score * 100);
  const sectionPresence = Math.round(sectionResult.score * 100);
  const quantificationScore = clamp(qualitative.quantification_score, 0, 100);
  const relevanceScore = clamp(qualitative.relevance_score, 0, 100);

  const overall = Math.round(
    0.40 * keywordCoverage +
    0.20 * contactCompleteness +
    0.15 * sectionPresence +
    0.15 * quantificationScore +
    0.10 * relevanceScore
  );

  return {
    overall_score: clamp(overall, 0, 100),
    breakdown: {
      keyword_coverage: keywordCoverage,
      contact_completeness: contactCompleteness,
      section_presence: sectionPresence,
      quantification_score: quantificationScore,
      relevance_score: relevanceScore,
    },
    missing_keywords: keywordResult.missing,
    matched_keywords: keywordResult.matched,
    suggestions: qualitative.notes || [],
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function parseJsonFallback(content) {
  try {
    let clean = content.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return JSON.parse(clean.trim());
  } catch {
    const err = new Error('score_returned_invalid_json');
    err.status = 502;
    err.publicMessage = 'score_failed';
    throw err;
  }
}
