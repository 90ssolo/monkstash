import type { Metadata } from "next";
import { WalletApp } from "@/components/wallet/WalletApp";
import { walletAbsoluteUrl } from "@/lib/site";

// Rendered per request so each load gets its own CSP nonce (proxy.ts).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Your MonkStash Monero wallet.",
  robots: { index: false, follow: false },
  alternates: { canonical: walletAbsoluteUrl },
  // Install as an app: home-screen icon and its own window (see app/app.webmanifest).
  manifest: "/app.webmanifest",
  appleWebApp: { capable: true, title: "MonkStash", statusBarStyle: "default" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
};

// No inline script here: every script the wallet page runs comes from the build, so anyone can
// check it against the public source (scripts/verify-build.mjs). A dark theme chosen by hand is
// therefore applied when the wallet loads; following the system needs no script (globals.css).
export default function WalletPage() {
  return <WalletApp />;
}
