/**
 * Two jobs, before any page renders:
 *
 * 1. Host routing. When NEXT_PUBLIC_WALLET_URL is set, the wallet lives on its own origin
 *    (e.g. wallet.monkstash.com): its storage then cannot be read by content pages, which must
 *    allow inline scripts. That host serves only the wallet and what it needs; the main site's
 *    /wallet redirects there (browsers keep the #fragment, so #pay= links still work). The onion
 *    mirror has a single address, so there the wallet stays at /wallet.
 *
 * 2. A strict Content Security Policy for the pages that handle money or untrusted links: the
 *    wallet and /pay. Each request gets a fresh random nonce; only scripts carrying it may run,
 *    so an injected <script> or inline handler is refused even if one ever slipped in. Next.js
 *    reads the nonce from the request's CSP header and adds it to its own scripts. Content
 *    pages are static (prerendered once), so they get a fixed policy in next.config.ts.
 */
import { NextResponse, type NextRequest } from "next/server";
import { NODE_ENDPOINTS } from "@/lib/nodeEndpoints";
import { site, walletHost, walletUrl } from "@/lib/site";

const isDev = process.env.NODE_ENV !== "production";
const NODE_PATHS = new Set<string>(NODE_ENDPOINTS.map((e) => `/${e}`));
/** Paths the wallet origin serves besides the wallet page itself. */
const walletAsset = (p: string) =>
  p.startsWith("/_next/") || p.startsWith("/monero/") || p.startsWith("/api/") || p.startsWith("/brand/") ||
  NODE_PATHS.has(p) || p === "/favicon.svg" || p === "/icon.svg" || p === "/robots.txt" || p === "/build.json" ||
  // Installing the wallet as an app (app/app.webmanifest).
  p === "/app.webmanifest" || p === "/app-icon-192.png" || p === "/app-icon-512.png" || p === "/app-icon-maskable-512.png" || p === "/apple-touch-icon.png";
const isWalletPath = (p: string) => p === "/wallet" || p.startsWith("/wallet/");
const isPayPath = (p: string) => p === "/pay" || p.startsWith("/pay/");

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const onion = host.split(":")[0]!.endsWith(".onion");
  const path = request.nextUrl.pathname;

  if (walletHost && host === walletHost) {
    if (path === "/") return strict(request, onion, new URL("/wallet", request.url));
    // The page a gift link opens.
    if (path === "/gift") return strict(request, onion, new URL("/wallet/gift", request.url));
    if (path === "/wallet/gift") return NextResponse.redirect(new URL(`/gift${request.nextUrl.search}`, request.url), 308);
    if (isWalletPath(path)) return NextResponse.redirect(new URL(`/${request.nextUrl.search}`, request.url), 308);
    if (walletAsset(path)) {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
    // Anything else belongs to the main site.
    return NextResponse.redirect(`${site.url}${path}${request.nextUrl.search}`, 308);
  }

  if (isWalletPath(path)) {
    if (walletHost && !onion) return NextResponse.redirect(`${walletUrl.replace(/\/$/, "")}${path.slice("/wallet".length) || "/"}${request.nextUrl.search}`, 308);
    return strict(request, onion);
  }
  if (isPayPath(path)) return strict(request, onion);
  return NextResponse.next();
}

/** Renders the page under the strict nonce policy (at `rewriteTo` when given). */
function strict(request: NextRequest, onion: boolean, rewriteTo?: URL): NextResponse {
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(18))).toString("base64");
  const csp = [
    "default-src 'self'",
    // 'strict-dynamic' lets nonce-carrying scripts load the app's chunks; 'wasm-unsafe-eval'
    // is required to start the WebAssembly wallet engine. Nothing inline runs without the nonce.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
    // React sets style attributes at runtime; styles cannot run code.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
    // The onion mirror is plain http inside Tor (already end-to-end encrypted): upgrading its
    // requests to https would break every script and API call there.
    ...(isDev || onion ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const headers = new Headers(request.headers);
  headers.set("Content-Security-Policy", csp);
  const res = rewriteTo ? NextResponse.rewrite(rewriteTo, { request: { headers } }) : NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  // Opened from any other page (even one on this site), the wallet gets its own browsing
  // context group: the opener cannot reach into it through window references.
  res.headers.set("Cross-Origin-Opener-Policy", "noopener-allow-popups");
  // Pages rendered per request: never cache them in shared caches.
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  // Everything except build assets, which never need routing or a per-request policy.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
