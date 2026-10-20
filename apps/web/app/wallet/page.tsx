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
};

export default function WalletPage() {
  return <WalletApp />;
}
