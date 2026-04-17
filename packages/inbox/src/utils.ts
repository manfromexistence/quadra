import { decrypt, encrypt } from "@midday/encryption";
import {
  getInboxEmail,
  getInboxIdFromEmail,
  isAuthenticationError,
} from "./public";

// OAuth state types
export interface OAuthStatePayload {
  teamId: string;
  provider: "gmail" | "outlook";
  source: "inbox" | "apps";
  redirectPath?: string;
}

/**
 * Encrypts OAuth state to prevent tampering.
 * The state contains sensitive info like teamId that must be protected.
 */
export function encryptOAuthState(payload: OAuthStatePayload): string {
  return encrypt(JSON.stringify(payload));
}

/**
 * Decrypts and validates OAuth state from callback.
 * Returns null if state is invalid or tampered with.
 */
export function decryptOAuthState(
  encryptedState: string,
): OAuthStatePayload | null {
  try {
    const decrypted = decrypt(encryptedState);
    const parsed = JSON.parse(decrypted);

    // Validate required fields
    if (
      typeof parsed.teamId !== "string" ||
      !["gmail", "outlook"].includes(parsed.provider) ||
      !["inbox", "apps"].includes(parsed.source)
    ) {
      return null;
    }

    return parsed as OAuthStatePayload;
  } catch {
    return null;
  }
}

export { getInboxEmail, getInboxIdFromEmail, isAuthenticationError } from "./public";
