import { env } from '../config/env.js';
import { createAnthropicClient } from '../lib/anthropicClient.js';
import { buildExtractionPrompt } from '../prompts/extraction.prompt.js';
import { extractionMock } from '../prompts/mocks/extraction.mock.js';
import { ProfileSchema } from '../utils/validation.js';

export async function extractProfile({ rawText, apiKey }) {
  const client = createAnthropicClient({ apiKey, mock: env.ANTHROPIC_MOCK_MODE });
  const { system, messages } = buildExtractionPrompt({ rawText });

  const { content } = await client.complete({ system, messages, mockFixture: extractionMock });

  let parsedJson;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    const err = new Error('extraction_returned_invalid_json');
    err.status = 502;
    err.publicMessage = 'extraction_failed';
    throw err;
  }

  const result = ProfileSchema.safeParse(parsedJson);
  if (!result.success) {
    const err = new Error('extraction_failed_schema_validation');
    err.status = 502;
    err.publicMessage = 'extraction_failed';
    throw err;
  }

  return result.data;
}
