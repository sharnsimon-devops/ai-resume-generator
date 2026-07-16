import Anthropic from '@anthropic-ai/sdk';

import { ANTHROPIC_MODEL, MAX_TOKENS } from '../config/anthropicConfig.js';

export function createAnthropicClient({ apiKey, mock }) {
  if (mock) {
    return {
      mock: true,
      async complete({ mockFixture }) {
        return { content: JSON.stringify(mockFixture ?? {}), usage: { input_tokens: 0, output_tokens: 0 } };
      },
      async validateApiKey() {
        return { valid: true };
      },
    };
  }

  const sdk = new Anthropic({ apiKey });

  return {
    mock: false,
    async complete({ system, messages, maxTokens = MAX_TOKENS }) {
      const response = await sdk.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      });
      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');
      return { content: text, usage: response.usage };
    },
    async validateApiKey(plaintextKey) {
      try {
        const probe = new Anthropic({ apiKey: plaintextKey });
        await probe.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        });
        return { valid: true };
      } catch (err) {
        return { valid: false, error: err.message };
      }
    },
  };
}
