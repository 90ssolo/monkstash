"use client";
/**
 * A gift link opened in this tab (https://wallet.../#gift=...). The code is taken out of the address
 * bar at once, so it does not stay in the history or show in a screenshot, and kept for this tab
 * only (sessionStorage) until it is claimed or dismissed: creating or unlocking a wallet first
 * must not lose it.
 */
import { giftCodeIn } from "@quietmint/wallet-core";

const KEY = "monkstash.gift.inbox.v1";

/** Moves a gift code from the address bar into this tab's storage. Call once on load, after hydration. */
export function takeGiftFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const code = giftCodeIn(window.location.hash);
  if (!code) return false;
  try { sessionStorage.setItem(KEY, code); } catch { /* storage blocked: kept in memory below */ }
  memory = code;
  // After the router has written its own first history entry, or it would put the old address back.
  setTimeout(() => history.replaceState(history.state, "", window.location.pathname + window.location.search), 0);
  return true;
}

let memory: string | null = null;

export function giftInInbox(): string | null {
  try { return sessionStorage.getItem(KEY) ?? memory; } catch { return memory; }
}

export function clearGiftInbox(): void {
  memory = null;
  try { sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
}
