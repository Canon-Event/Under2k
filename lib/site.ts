export function getSiteUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!configured) return undefined;
  const normalized = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
  try { return new URL(normalized).origin; } catch { return undefined; }
}
