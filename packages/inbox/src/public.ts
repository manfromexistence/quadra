/**
 * Browser-safe public helpers for inbox-related UI and shared non-server code.
 *
 * This module must remain free of Node-only imports (for example `node:crypto`)
 * so that client components can import from `@midday/inbox/public` safely.
 */

export function getInboxIdFromEmail(email: string) {
  return email.split("@").at(0);
}

export function getInboxEmail(inboxId: string) {
  if (process.env.NODE_ENV !== "production") {
    return `${inboxId}@inbox.staging.midday.ai`;
  }

  return `${inboxId}@inbox.midday.ai`;
}

/**
 * Determines if an error message indicates an authentication/authorization issue
 * that requires user intervention (like reconnecting their account) vs temporary
 * issues that might resolve on retry.
 *
 * Based on Google OAuth2 RFC 6749, Gmail API, and Microsoft Graph patterns.
 */
export function isAuthenticationError(errorMessage: string): boolean {
  if (!errorMessage) return false;

  const message = errorMessage.toLowerCase();

  const oauthErrors = [
    "invalid_request",
    "invalid_client",
    "invalid_grant",
    "unauthorized_client",
    "unsupported_grant_type",
    "invalid_scope",
    "access_denied",
    "invalid_token",
    "token_expired",
  ];

  const httpAuthErrors = [
    "401",
    "403",
    "unauthorized",
    "forbidden",
    "unauthenticated",
  ];

  const googleSpecificErrors = [
    "authentication required",
    "re-authentication required",
    "reauthentication required",
    "authentication failed",
    "refresh token is invalid",
    "access token is invalid",
    "credentials have been revoked",
    "token has been expired or revoked",
    "invalid credentials",
    "permission denied",
    "insufficient permissions",
    "api key not valid",
    "api key expired",
  ];

  const microsoftSpecificErrors = [
    "invalidauthenticationtoken",
    "lifetime validation failed",
    "token is expired",
    "aadsts700082",
    "aadsts50076",
    "aadsts700084",
    "aadsts65001",
  ];

  const allAuthPatterns = [
    ...oauthErrors,
    ...httpAuthErrors,
    ...googleSpecificErrors,
    ...microsoftSpecificErrors,
  ];

  return allAuthPatterns.some((pattern) => message.includes(pattern));
}
