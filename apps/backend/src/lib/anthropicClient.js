import Anthropic from '@anthropic-ai/sdk';

import { ANTHROPIC_MODEL, MAX_TOKENS } from '../config/anthropicConfig.js';

export function createAnthropicClient({ apiKey, mock }) {
  if (mock) {
    return {
      mock: true,
      async complete({ mockFixture, tools }) {
        const fixture = mockFixture ?? {};
        // When tools are requested, wrap the mock fixture as if it were a tool_use result
        if (tools) {
          return { content: JSON.stringify(fixture), toolInput: fixture, usage: { input_tokens: 0, output_tokens: 0 } };
        }
        return { content: JSON.stringify(fixture), usage: { input_tokens: 0, output_tokens: 0 } };
      },
      async validateApiKey() {
        return { valid: true };
      },
    };
  }

  const sdk = new Anthropic({ apiKey });

  return {
    mock: false,
    async complete({ system, messages, maxTokens = MAX_TOKENS, tools, toolChoice }) {
      const params = {
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      };
      if (tools) params.tools = tools;
      if (toolChoice) params.tool_choice = toolChoice;

      const response = await sdk.messages.create(params);

      // If a tool_use block exists (from a forced tool call), return its structured input
      const toolBlock = response.content.find((block) => block.type === 'tool_use');
      if (toolBlock) {
        return { content: JSON.stringify(toolBlock.input), toolInput: toolBlock.input, usage: response.usage };
      }

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
