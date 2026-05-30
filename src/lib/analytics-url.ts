/** Resolve Python analytics sidecar URL (local, Vercel services, or explicit env). */
export function getAnalyticsApiUrl(): string {
  if (process.env.ANALYTICS_API_URL) {
    return process.env.ANALYTICS_API_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
    return `https://${host}/_/analytics-api`;
  }

  return 'http://localhost:8001';
}
