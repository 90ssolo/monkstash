/**
 * The web app manifest that lets people install the wallet like an app (home-screen icon, its
 * own window, Send/Receive/Activity shortcuts). Served only for the wallet: on the wallet's own
 * origin it starts at "/", on the onion mirror and in development at "/wallet".
 *
 * There is deliberately no service worker: one that caches files could keep serving old code,
 * and every script the wallet runs must stay checkable against the public build (/verify).
 */
import { walletHost } from "@/lib/site";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const start = walletHost && host === walletHost ? "/" : "/wallet";
  const at = (section: string) => `${start}#section=${section}`;
  const manifest = {
    id: start,
    name: "MonkStash Monero Wallet",
    short_name: "MonkStash",
    description: "A private Monero wallet. Your keys stay on this device.",
    start_url: start,
    scope: start,
    display: "standalone",
    background_color: "#edeee6",
    theme_color: "#1f4733",
    icons: [
      { src: "/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Send", url: at("send"), icons: [{ src: "/app-icon-192.png", sizes: "192x192" }] },
      { name: "Receive", url: at("receive"), icons: [{ src: "/app-icon-192.png", sizes: "192x192" }] },
      { name: "Activity", url: at("activity"), icons: [{ src: "/app-icon-192.png", sizes: "192x192" }] },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600", "X-Robots-Tag": "noindex" },
  });
}
