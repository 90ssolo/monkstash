import type { Metadata } from "next";
import { headers } from "next/headers";
import { WalletApp } from "@/components/wallet/WalletApp";
import { walletAbsoluteUrl } from "@/lib/site";

// Rendered per request so each load gets its own CSP nonce (proxy.ts).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Your MonkStash Monero wallet.",
  robots: { index: false, follow: false },
  alternates: { canonical: walletAbsoluteUrl },
};

// Puts a chosen light or dark theme on the page before it is drawn (lib/wallet/theme.ts keeps the same key).
const THEME_EARLY = `try{var t=localStorage.getItem("monkstash.theme.v1");if(t==="light"||t==="dark")document.documentElement.dataset.walletTheme=t}catch(e){}`;

export default async function WalletPage() {
  const csp = (await headers()).get("content-security-policy") ?? "";
  const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
  return (
    <>
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_EARLY }} />
      <WalletApp />
    </>
  );
}
