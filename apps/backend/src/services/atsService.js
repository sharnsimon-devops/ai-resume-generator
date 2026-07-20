import { env } from '../config/env.js';
import { createAnthropicClient } from '../lib/anthropicClient.js';
import { buildAtsPrompt } from '../prompts/ats.prompt.js';
import * as keyService from './keyService.js';

export async function calculateAtsScore({ profileJson, jdText, userId }) {
  let apiKey = null;
  if (!env.ANTHROPIC_MOCK_MODE) {
    apiKey = await keyService.getDecryptedApiKey(userId);
  }

  const client = createAnthropicClient({ apiKey, mock: env.ANTHROPIC_MOCK_MODE });
  const { system, messages } = buildAtsPrompt({ profileJson, jdText });

  const { content } = await client.complete({ system, messages });

  let parsedJson;
  try {
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
  } catch (err) {
    const error = new Error('ats_returned_invalid_json');
    error.status = 502;
    error.publicMessage = 'ats_failed';
    throw error;
  }

  return parsedJson;
}
