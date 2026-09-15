import { env } from '../config/env.js';
import { createAnthropicClient } from '../lib/anthropicClient.js';
import { buildGuardrailPrompt } from '../prompts/guardrail.prompt.js';
import { guardrailMock } from '../prompts/mocks/guardrail.mock.js';
import { VerifiedResumeSchema, FlagsSchema } from '../utils/validation.js';

// Deliberately no `steering` parameter — the guardrail must never see steering hints,
// only the draft it produced and the original profile it must be grounded in.
// `gapAnswers` are included because they represent confirmed facts outside the original profile.
export async function verifyResume({ draftResumeJson, profileJson, apiKey, gapAnswers }) {
  const client = createAnthropicClient({ apiKey, mock: env.ANTHROPIC_MOCK_MODE });
  const { system, messages } = buildGuardrailPrompt({ draftResumeJson, profileJson, gapAnswers });

  const { content } = await client.complete({ system, messages, mockFixture: guardrailMock });

  let parsedJson;
  try {
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) throw new Error('No JSON object found');
    const cleanContent = content.substring(startIndex, endIndex + 1);
    parsedJson = JSON.parse(cleanContent);
  } catch {
    const err = new Error('guardrail_returned_invalid_json');
    err.status = 502;
    err.publicMessage = 'guardrail_failed';
    throw err;
  }

  const resumeResult = VerifiedResumeSchema.safeParse(parsedJson.resume);
  const flagsResult = FlagsSchema.safeParse(parsedJson.flags ?? []);

  if (!resumeResult.success || !flagsResult.success) {
    const err = new Error('guardrail_failed_schema_validation');
    err.status = 502;
    err.publicMessage = 'guardrail_failed';
    throw err;
  }

  return { resume: resumeResult.data, flags: flagsResult.data };
}
