/**
 * For cached (ISR) API routes: when a refresh fails at runtime, throw instead of returning the
 * failure. Next.js then keeps serving the last good response instead of caching the failure
 * for the whole revalidate window. During the build (no previous response exists) and in dev,
 * the failure body is returned as usual, so the build never breaks on a node outage.
 */
export function keepLastGood<T>(failure: T, what: string): T {
  const runtime = process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";
  if (runtime) throw new Error(`${what}: refresh failed, keeping the last good response`);
  return failure;
}
