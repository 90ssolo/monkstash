"use client";
/**
 * Demo-mode state. ONLY active in local dev on a test network (DEV_TOOLS_ENABLED).
 * In production / mainnet this is inert and the wallet behaves normally and honestly.
 *
 * Demo onboarding exercises the real create UI with SAMPLE words that are clearly
 * disclosed as NOT the recovery seed, then assigns one of the configured stagenet test
 * wallets. The assigned wallet is opened from its own real seed.
 */
import { DEV_TOOLS_ENABLED } from "./config";
import type { TestWallet } from "./testWallets";

export type TestMode = "stagenet" | "simulation";

export interface DemoSession {
  assignedLabel: string;
  mode: TestMode;
  fellBackToSim?: boolean;
}

// Legacy identifier from the pre-rebrand name. Do NOT rename: existing wallets and saved
// state are stored under it, and changing it would make them unreadable.
const KEY = "quietmint.demo.session.v1";

export const isDemo = DEV_TOOLS_ENABLED;

export function getDemoSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function setDemoSession(s: DemoSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearDemoSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function pickRandom(wallets: TestWallet[]): TestWallet | null {
  if (!wallets.length) return null;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return wallets[buf[0]! % wallets.length]!;
}

export function preferredMode(): TestMode {
  return getDemoSession()?.mode ?? "stagenet";
}
