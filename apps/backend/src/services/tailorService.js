import { env } from '../config/env.js';
import { createAnthropicClient } from '../lib/anthropicClient.js';
import { buildTailorPrompt } from '../prompts/tailor.prompt.js';
import { tailorMock } from '../prompts/mocks/tailor.mock.js';
import { DraftResumeSchema } from '../utils/validation.js';

export async function tailorResume({ profileJson, jdText, steering, apiKey }) {
  const client = createAnthropicClient({ apiKey, mock: env.ANTHROPIC_MOCK_MODE });
  const { system, messages } = buildTailorPrompt({ profileJson, jdText, steering });

  const { content } = await client.complete({ system, messages, mockFixture: tailorMock });

  let parsedJson;
  try {
    // Strip markdown formatting if Claude returned the JSON inside a code block
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    parsedJson = JSON.parse(cleanContent.trim());
  } catch {
    const err = new Error('tailor_returned_invalid_json');
    err.status = 502;
    err.publicMessage = 'tailor_failed';
    throw err;
  }

  const result = DraftResumeSchema.safeParse(parsedJson);
  if (!result.success) {
    const err = new Error('tailor_failed_schema_validation');
    err.status = 502;
    err.publicMessage = 'tailor_failed';
    throw err;
  }

  return result.data;
}
