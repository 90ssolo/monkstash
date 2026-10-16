const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3210").replace(/\/+$/, "");

/**
 * The wallet's own origin (e.g. https://wallet.monkstash.com). A separate origin keeps the
 * wallet's encrypted storage away from content pages, which allow inline scripts. Unset (local
 * development), the wallet stays at /wallet on the main site.
 */
const walletOrigin = (process.env.NEXT_PUBLIC_WALLET_URL ?? "").replace(/\/+$/, "") || null;

export const site = {
  name: "MonkStash",
  tagline: "A private Monero wallet that runs in your browser",
  description:
    "MonkStash is a free, non-custodial Monero (XMR) web wallet. Your keys are created and encrypted on your device and never reach our servers.",
  url: siteUrl,
  locale: "en",
} as const;

/** The public source code repository (BSD-3-Clause). The one place this URL is written. */
export const repoUrl = "https://github.com/90ssolo/monkstash";

/** Where "Open wallet" links go: the wallet origin's root, or /wallet when it has none. */
export const walletUrl = walletOrigin ? `${walletOrigin}/` : "/wallet";

/** The wallet's address as people should see it in their address bar (no scheme). */
export const walletAddressText = walletOrigin ? new URL(walletOrigin).host : `${new URL(siteUrl).host}/wallet`;

/** Host of the separate wallet origin, or null when the wallet lives at /wallet. */
export const walletHost = walletOrigin ? new URL(walletOrigin).host : null;

/** The same without any port, as Next.js host conditions expect. */
export const walletHostname = walletOrigin ? new URL(walletOrigin).hostname : null;

export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** A main-site link for use inside the wallet: absolute when the wallet has its own origin. */
export function siteHref(path: string): string {
  return walletOrigin ? absoluteUrl(path) : path;
}

/** The wallet's full URL, for places that need one (metadata, llms.txt). */
export const walletAbsoluteUrl = walletOrigin ? `${walletOrigin}/` : absoluteUrl("/wallet");

/**
 * Where /pay links point. Payment pages live on the main site, not on the wallet's origin:
 * customers never need to visit the wallet's address.
 */
export function payLinkOrigin(): string {
  if (typeof window === "undefined") return site.url;
  return walletHost && window.location.host === walletHost ? site.url : window.location.origin;
}
