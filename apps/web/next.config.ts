import path from "node:path";
import type { NextConfig } from "next";
import { NODE_ENDPOINTS } from "./lib/nodeEndpoints";
import { walletHostname } from "./lib/site";

const isDev = process.env.NODE_ENV !== "production";

// Wallet and /pay get a strict per-request nonce policy in proxy.ts (also on the wallet's own
// host, when it has one: two policies would combine and block the wallet engine).
const notWalletHost = walletHostname ? { missing: [{ type: "host" as const, value: walletHostname.replace(/[.]/g, "[.]") }] } : {};

// Content pages are prerendered once, so they cannot carry a per-request nonce, and Next.js
// streams page data in small inline scripts. So 'unsafe-inline' stays for scripts here, but
// everything else is locked down: no third-party scripts, no plugins, no framing, no
// connections except our own origin, and no base or form hijacking. These pages hold no keys.
const contentCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// The wallet engine's worker script runs the WebAssembly engine and talks to nodes: our relay,
// or the user's own node (https anywhere, or http on this computer). Nothing else.
const workerCsp = [
  "default-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "connect-src 'self' https: http://localhost:* http://127.0.0.1:*",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "DENY" },
  // The camera only for our own pages (the send screen's QR scanner); never for embedded content.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nodeStub = { browser: "./lib/empty-module.ts" };
// The node endpoints served at the root (rewritten to the relay), as a regex alternation.
const relayPaths = NODE_ENDPOINTS.map((e) => e.replace(/\./g, "\\.")).join("|");


const config: NextConfig = {
  // Dev only: lets the wallet be tested at 127.0.0.1 too, with its own separate browser storage.
  allowedDevOrigins: ["127.0.0.1"],
  reactStrictMode: true,
  poweredByHeader: false,
  // Dev only: a second dev server (another port) needs its own build folder. Builds use ".next".
  ...(isDev && process.env.NEXT_DEV_DIST_DIR ? { distDir: process.env.NEXT_DEV_DIST_DIR } : {}),
  // Self-contained server bundle for the VPS (deploy/): only the files the server needs.
  output: "standalone",
  // A fixed build ID (the public source commit) instead of a random one, so two builds of the
  // same commit produce identical files and anyone can check the live site (see /verify).
  generateBuildId: async () => process.env.BUILD_ID || null,
  // The monorepo root, so workspace packages are traced into the bundle.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // monero-ts loads its WebAssembly from disk at runtime, which tracing cannot see.
  outputFileTracingIncludes: { "/api/donations": ["../../node_modules/.pnpm/monero-ts@*/node_modules/monero-ts/dist/**/*"] },
  // Never ship local secrets or state: test wallet seeds, env files, tracker data.
  outputFileTracingExcludes: { "*": ["./test-wallets.local.json", "./.env*", "./.data/**", "../../private/**"] },
  transpilePackages: ["@quietmint/wallet-core", "@quietmint/node-client"],
  // The donation tracker runs monero-ts on the server; load it as a normal Node package.
  serverExternalPackages: ["monero-ts"],
  turbopack: {
    resolveAlias: { fs: nodeStub, child_process: nodeStub },
  },
  // The wallet engine's C++ HTTP client ignores any path in the node URL and calls
  // e.g. "/json_rpc" at the origin root, so node endpoints are exposed at the root and
  // rewritten to the proxy (which still enforces its own allowlist).
  async rewrites() {
    return [{ source: `/:endpoint(${NODE_ENDPOINTS.map((e) => e.replace(/\./g, "\\.")).join("|")})`, destination: "/api/node/:endpoint" }];
  },
  // Renamed routes keep working: permanent (308) redirects pass ranking signals to the new URL.
  async redirects() {
    return [
      { source: "/wallets", destination: "/monero-wallets", permanent: true },
      // 2026-10-15: Guides and Learn merged into one library.
      { source: "/guides", destination: "/learn", permanent: true },
      { source: "/chrome-extension", destination: "/monero-chrome-extension", permanent: true },
      { source: "/tools/address-validator", destination: "/tools/monero-address-validator", permanent: true },
      // 2026-10-15: articles moved to flat root URLs, and "how to" dropped from slugs.
      // Specific renames come first, then the generic folder rules.
      ...Object.entries({
        "guides/how-to-send-monero": "send-monero",
        "guides/how-to-receive-monero": "receive-monero",
        "guides/how-to-use-monero": "use-monero",
        "guides/how-to-buy-monero": "buy-monero",
        "guides/how-to-mine-monero": "mine-monero",
        "guides/fix-monero-wallet-not-syncing": "monero-wallet-not-syncing",
        "learn/what-is-a-monero-node": "monero-node",
      }).map(([from, to]) => ({ source: `/${from}`, destination: `/${to}`, permanent: true })),
      { source: "/learn/:slug", destination: "/:slug", permanent: true },
      { source: "/guides/:slug", destination: "/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Everything except the wallet, /pay (strict policy in proxy.ts), the engine files and the
      // node relay (its answers carry their own sandbox policy, see app/api/node).
      { source: `/:path((?!wallet(?:/|$)|pay(?:/|$)|monero/|api/node/|(?:${relayPaths})$).*)`, ...notWalletHost, headers: [{ key: "Content-Security-Policy", value: contentCsp }] },
      { source: "/monero/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }, { key: "Content-Security-Policy", value: workerCsp }] },
    ];
  },
};

export default config;
