import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEV_TOOLS_ENABLED } from "@/lib/wallet/config";
import { DevDashboard } from "@/components/dev/DevDashboard";

export const metadata: Metadata = { title: "Test wallets", robots: { index: false, follow: false } };

export default function DevWalletsPage() {
  if (!DEV_TOOLS_ENABLED) notFound();
  return <DevDashboard />;
}
