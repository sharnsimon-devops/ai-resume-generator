import { env } from '../config/env.js';

const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map();

function pruneOld(timestamps, now) {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function generationRateLimiter(req, res, next) {
  const userId = req.user.id;
  const now = Date.now();

  const recent = pruneOld(hits.get(userId) || [], now);

  if (recent.length >= env.RATE_LIMIT_GENERATIONS_PER_HOUR) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return res.status(429).json({ error: 'rate_limited', retryAfterSeconds });
  }

  recent.push(now);
  hits.set(userId, recent);
  next();
}
