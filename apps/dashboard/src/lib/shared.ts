export function logError(error: Error, metadata?: Record<string, unknown>) {
  console.error("[EDMS]", error, metadata);
}
