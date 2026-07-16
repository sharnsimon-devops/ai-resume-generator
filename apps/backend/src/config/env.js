export const env = {
  PORT: Number(process.env.PORT || 4001),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  MASTER_KEY: process.env.MASTER_KEY || '',

  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
  ANTHROPIC_MOCK_MODE: (process.env.ANTHROPIC_MOCK_MODE ?? 'true') === 'true',

  RATE_LIMIT_GENERATIONS_PER_HOUR: Number(process.env.RATE_LIMIT_GENERATIONS_PER_HOUR || 10),
};

export function requireEnv(keys) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}
