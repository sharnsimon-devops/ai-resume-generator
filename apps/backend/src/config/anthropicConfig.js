import { env } from './env.js';

export const ANTHROPIC_MODEL = env.ANTHROPIC_MODEL;
export const MAX_TOKENS = 4096;
export const PROMPT_CACHE_CONTROL = { type: 'ephemeral' };
