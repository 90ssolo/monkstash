/**
 * A small in-memory rate limiter for the server's public endpoints (one server, one process).
 * Counts are kept per client IP in fixed one-minute windows and forgotten afterwards; nothing
 * is written to disk or logged.
 *
 * The client IP comes from X-Forwarded-For, which Caddy (deploy/Caddyfile) sets to the real
 * client address (it ignores any value the client sends). Onion visitors arrive through
 * Caddy's internal listener, marked "tor", and share one larger bucket: Tor hides their
 * addresses, and its proof-of-work defence handles floods. Without a proxy in front, all
 * requests share one bucket, which fails safe.
 */
import type { NextRequest } from "next/server";

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Map<string, Bucket>>();
const MAX_KEYS = 50_000;
const TOR_MULTIPLIER = 20;

/** The client's rate-limit key: its IPv4 address, or the /64 network of an IPv6 address. */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0]! : req.headers.get("x-real-ip") ?? "local").trim().slice(0, 64).toLowerCase();
  return ip.includes(":") ? ipv6Prefix(ip) : ip;
}

/** One home or server usually gets a whole /64, so limit per /64, not per address. */
export function ipv6Prefix(ip: string): string {
  const [head = "", tail = ""] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = ip.includes("::") ? [...left, ...Array<string>(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right] : left;
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

/** True when the request is within `perMinute` for this name and client. */
export function allow(name: string, req: NextRequest, perMinute: number, now = Date.now()): boolean {
  let table = buckets.get(name);
  if (!table) buckets.set(name, (table = new Map()));
  if (table.size > MAX_KEYS) {
    for (const [k, b] of table) if (b.reset <= now) table.delete(k);
    // Still full (a flood from many addresses): forget the oldest entries.
    for (const k of table.keys()) {
      if (table.size <= MAX_KEYS * 0.9) break;
      table.delete(k);
    }
  }
  const key = clientIp(req);
  if (key === "tor") perMinute *= TOR_MULTIPLIER;
  const b = table.get(key);
  if (!b || b.reset <= now) {
    table.set(key, { count: 1, reset: now + 60_000 });
    return true;
  }
  b.count += 1;
  return b.count <= perMinute;
}

export function tooMany(retryAfterSec = 60): Response {
  return new Response("Too many requests. Please slow down.", { status: 429, headers: { "Retry-After": String(retryAfterSec), "Cache-Control": "no-store" } });
}
