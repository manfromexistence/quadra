const LOCAL_APP_URL = "http://localhost:3001";
const PRODUCTION_APP_URL = "https://app-quadra.vercel.app";

function normalizeUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/$/, "");
}

function getRailwayUrl() {
  if (!process.env.RAILWAY_PUBLIC_DOMAIN) {
    return null;
  }

  return normalizeUrl(process.env.RAILWAY_PUBLIC_DOMAIN);
}

export function getServerAppUrl() {
  if (process.env.VERCEL_ENV === "production") {
    return normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ?? PRODUCTION_APP_URL;
  }

  return (
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeUrl(process.env.BETTER_AUTH_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_URL) ??
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeUrl(process.env.VERCEL_BRANCH_URL) ??
    normalizeUrl(process.env.VERCEL_URL) ??
    getRailwayUrl() ??
    LOCAL_APP_URL
  );
}

export function getAppUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getServerAppUrl();
}

export function getTrustedOrigins() {
  return Array.from(
    new Set(
      [
        LOCAL_APP_URL,
        "http://10.2.0.2:3001",
        PRODUCTION_APP_URL,
        normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
        normalizeUrl(process.env.NEXT_PUBLIC_APP_URL),
        normalizeUrl(process.env.BETTER_AUTH_URL),
        normalizeUrl(process.env.NEXT_PUBLIC_URL),
        normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
        normalizeUrl(process.env.VERCEL_BRANCH_URL),
        normalizeUrl(process.env.VERCEL_URL),
        getRailwayUrl(),
      ].filter((value): value is string => Boolean(value)),
    ),
  );
}
