/**
 * Sign-in for the shop's dashboard. The shop signs in with its existing API key; the server then
 * sets a short-lived session cookie signed with a key derived from the API key, so changing the
 * API key signs every session out. Nothing is stored server-side. Forms carry a token derived
 * from the session, and posts from other sites are refused.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

export const SESSION_COOKIE = "monkstash_admin";
export const SESSION_HOURS = 12;

const b64 = (b: Buffer) => b.toString("base64url");

export interface AdminAuth {
  /** True when the typed key is the API key (constant time). */
  checkKey(typed: string): boolean;
  /** A new session cookie value and its expiry. */
  newSession(now?: number): { value: string; expires: number };
  /** The session's expiry when the cookie is valid, else null. */
  session(req: IncomingMessage, now?: number): string | null;
  /** The form token for a session. */
  formToken(session: string): string;
  checkFormToken(session: string, token: string | null | undefined): boolean;
}

export function adminAuth(apiKey: string): AdminAuth {
  const keyHash = createHash("sha256").update(apiKey).digest();
  // Separate keys for sessions and form tokens, both tied to the API key.
  const sessionKey = createHmac("sha256", apiKey).update("monkstash-pay admin session v1").digest();
  const formKey = createHmac("sha256", apiKey).update("monkstash-pay admin form v1").digest();
  const sign = (key: Buffer, s: string) => b64(createHmac("sha256", key).update(s).digest());
  const same = (a: string, b: string) => {
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  };
  return {
    checkKey(typed) {
      return timingSafeEqual(createHash("sha256").update(typed.trim()).digest(), keyHash);
    },
    newSession(now = Date.now()) {
      const expires = now + SESSION_HOURS * 60 * 60 * 1000;
      const nonce = b64(randomBytes(12));
      const body = `${expires}.${nonce}`;
      return { value: `${body}.${sign(sessionKey, body)}`, expires };
    },
    session(req, now = Date.now()) {
      const raw = parseCookies(req.headers.cookie)[SESSION_COOKIE];
      if (!raw) return null;
      const m = /^(\d{13})\.([A-Za-z0-9_-]{16})\.([A-Za-z0-9_-]{43})$/.exec(raw);
      if (!m) return null;
      if (!same(sign(sessionKey, `${m[1]}.${m[2]}`), m[3]!)) return null;
      if (Number(m[1]) <= now) return null;
      return raw;
    },
    formToken(session) {
      return sign(formKey, session);
    },
    checkFormToken(session, token) {
      return typeof token === "string" && same(sign(formKey, session), token);
    },
  };
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const k = part.slice(0, i).trim();
    if (k && !(k in out)) out[k] = part.slice(i + 1).trim();
  }
  return out;
}

/**
 * A browser post must come from this server's own pages. Browsers send Origin on posts; when it
 * is there it must match. (The SameSite=Strict cookie and the form token are the other two locks.)
 */
export function sameOrigin(req: IncomingMessage, publicUrl: string): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(publicUrl).origin || new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export function sessionCookie(value: string, expires: number, secure: boolean): string {
  return `${SESSION_COOKIE}=${value}; Path=/admin; HttpOnly; SameSite=Strict; Expires=${new Date(expires).toUTCString()}${secure ? "; Secure" : ""}`;
}

export function clearedCookie(secure: boolean): string {
  return `${SESSION_COOKIE}=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}
