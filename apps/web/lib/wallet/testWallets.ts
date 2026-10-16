"use client";
import type { NetworkType } from "@quietmint/wallet-core";
import { DEV_TOOLS_ENABLED } from "./config";

export interface TestWallet {
  label: string;
  seed: string;
  primaryAddress: string;
  privateViewKey: string;
  restoreHeight: number;
}
export interface TestWalletFile { network: NetworkType; wallets: TestWallet[] }

export async function fetchTestWallets(): Promise<TestWalletFile | null> {
  if (!DEV_TOOLS_ENABLED) return null;
  try {
    const res = await fetch("/api/dev/test-wallets", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TestWalletFile;
  } catch {
    return null;
  }
}
