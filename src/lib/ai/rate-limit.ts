const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkAiRateLimit(key: string): { ok: boolean; retryAfterSec?: number } {
  const limit = Number(process.env.AI_RATE_LIMIT_PER_MIN) || 20;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return { ok: true };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}
