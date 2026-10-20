"use client";
/**
 * Server clock offset. A device clock that is off by minutes breaks time-based checks: payment
 * requests could ignore real payments or look expired at once, and a till could call a fresh
 * exchange rate out of date. So the wallet asks our server for its time (no wallet data is sent,
 * the request has no body) and uses the corrected time for those checks.
 *
 * If the server cannot be reached, the offset stays unknown and the device clock is used.
 */
import { useEffect, useState } from "react";

const TIME_URL = "/api/node/time";
/** Measurements slower than this are too imprecise to trust. */
const MAX_RTT_MS = 10_000;
const RECHECK_MS = 10 * 60 * 1000;
/** Show a warning when the device clock is off by more than this. */
export const CLOCK_WARN_MS = 2 * 60 * 1000;

let offsetMs: number | null = null;
let checkedAt = -Infinity;
let inflight: Promise<number | null> | null = null;
const listeners = new Set<(offset: number | null) => void>();

/** Server time minus device time, in ms; null until measured. */
export function clockOffset(): number | null {
  return offsetMs;
}

/** The current time, corrected by the server offset when it is known (ms since epoch). */
export function serverNow(): number {
  return Date.now() + (offsetMs ?? 0);
}

/** Measures the offset (at most every 10 minutes unless forced). Never throws. */
export function checkClock(force = false): Promise<number | null> {
  if (inflight) return inflight;
  if (!force && performance.now() - checkedAt < RECHECK_MS) return Promise.resolve(offsetMs);
  inflight = (async () => {
    try {
      const t0 = Date.now();
      const p0 = performance.now();
      const res = await fetch(TIME_URL, { cache: "no-store", signal: AbortSignal.timeout(MAX_RTT_MS) });
      const rtt = performance.now() - p0;
      const exact = Number(res.headers.get("x-monkstash-time"));
      const header = Date.parse(res.headers.get("date") ?? "");
      // The Date header only has whole seconds: take the middle of that second.
      const server = Number.isFinite(exact) && exact > 0 ? exact : Number.isFinite(header) ? header + 500 : NaN;
      if (!Number.isFinite(server) || rtt > MAX_RTT_MS) return offsetMs;
      offsetMs = Math.round(server - (t0 + rtt / 2));
      checkedAt = performance.now();
      listeners.forEach((cb) => cb(offsetMs));
      return offsetMs;
    } catch {
      return offsetMs;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** The offset for React components; measures on mount and every 10 minutes. */
export function useClockOffset(): number | null {
  const [offset, setOffset] = useState<number | null>(offsetMs);
  useEffect(() => {
    listeners.add(setOffset);
    void checkClock();
    const t = setInterval(() => void checkClock(), RECHECK_MS);
    return () => { listeners.delete(setOffset); clearInterval(t); };
  }, []);
  return offset;
}

/** "Your device clock is off by about N minutes" text, or null when it is close enough. */
export function clockWarning(offset: number | null): string | null {
  if (offset === null || Math.abs(offset) <= CLOCK_WARN_MS) return null;
  const minutes = Math.round(Math.abs(offset) / 60_000);
  const size = minutes >= 120 ? `${Math.round(minutes / 60)} hours` : `${minutes} minutes`;
  return `Your device clock is off by about ${size}. Set it to automatic time.`;
}
