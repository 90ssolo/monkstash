import type { Metadata } from "next";
import { GiftLanding } from "@/components/wallet/GiftLanding";
import { absoluteUrl, giftPageUrl, site, xHandle } from "@/lib/site";

// Rendered per request so each load gets its own CSP nonce (proxy.ts), like the wallet itself.
export const dynamic = "force-dynamic";

const title = "A Monero gift for you";
const description = "Someone sent you Monero with MonkStash. Open the link to see your gift and claim it into a private wallet that only you control. No account needed.";
// The gift itself is after the # in the link, which never reaches a server (or a link preview):
// every gift shares this one card, and it shows no amount.
const image = { url: absoluteUrl("/og/gift"), width: 1200, height: 630, alt: "A sealed MonkStash envelope: someone sent you Monero" };

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  alternates: { canonical: giftPageUrl },
  openGraph: { type: "website", title, description, url: giftPageUrl, siteName: site.name, locale: "en_US", images: [image] },
  twitter: { card: "summary_large_image", site: `@${xHandle}`, title, description, images: [image.url] },
};

export default function GiftPage() {
  return <GiftLanding />;
}
