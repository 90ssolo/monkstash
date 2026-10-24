"use client";
/**
 * Searching the wallet history and what each payment is known as: its note, and the labels of
 * the receive addresses (or payment requests) it arrived at. Everything is matched locally.
 */
import { addressKey, formatXmr, type WalletLabels } from "@quietmint/wallet-core";
import { MAIN_ACCOUNT, type IncomingEntry, type TxSummary } from "./engine";
import type { PaymentRequest } from "./requests";
import { apiUrl } from "./config";

export type HistoryKind = "all" | "in" | "out";
export interface HistoryFilter { text: string; kind: HistoryKind; year: number | null }
export const NO_FILTER: HistoryFilter = { text: "", kind: "all", year: null };

/** What a payment is called: its note, and where an incoming one arrived. */
export interface TxTags { note?: string; at: string[] }

/** Names for the receive addresses each incoming transaction arrived at, by hash. */
export function arrivedAt(incoming: IncomingEntry[], labels: WalletLabels, requests: PaymentRequest[]): Map<string, string[]> {
  const reqNote = new Map(requests.filter((r) => r.note).map((r) => [r.index, `Request: ${r.note}`]));
  const out = new Map<string, string[]>();
  for (const e of incoming) {
    const account = e.accountIndex ?? MAIN_ACCOUNT;
    const name = labels.addr[addressKey(account, e.subaddressIndex)]?.label
      ?? (account === MAIN_ACCOUNT ? reqNote.get(e.subaddressIndex) : undefined);
    if (!name) continue;
    const list = out.get(e.hash) ?? [];
    if (!list.includes(name)) list.push(name);
    out.set(e.hash, list);
  }
  return out;
}

export function tagsOf(t: TxSummary, labels: WalletLabels, at: Map<string, string[]>): TxTags {
  const note = labels.tx[t.hash];
  return { ...(note ? { note } : {}), at: at.get(t.hash) ?? [] };
}

export const yearOf = (t: TxSummary): number | null => (t.timestamp ? new Date(t.timestamp * 1000).getFullYear() : null);

/** Years that have payments, newest first. */
export function historyYears(txs: TxSummary[]): number[] {
  return [...new Set(txs.map(yearOf).filter((y): y is number => y !== null))].sort((a, b) => b - a);
}

/**
 * True when a payment matches: direction ("Sent" includes sent to yourself), year, and every word
 * of the search text in its note, labels, amount, transaction ID or recipient addresses.
 */
export function matchesFilter(t: TxSummary, tags: TxTags, f: HistoryFilter): boolean {
  if (f.kind === "in" && t.direction !== "in") return false;
  if (f.kind === "out" && t.direction === "in") return false;
  if (f.year !== null && yearOf(t) !== f.year) return false;
  const words = f.text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = [tags.note ?? "", ...tags.at, formatXmr(t.amount), t.hash, ...(t.destinations ?? []).map((d) => d.address)].join("\n").toLowerCase();
  return words.every((w) => hay.includes(w));
}

export const isFiltered = (f: HistoryFilter): boolean => f.kind !== "all" || f.year !== null || f.text.trim() !== "";

export class PriceHistoryError extends Error {
  constructor() {
    super("The daily prices could not be loaded. Try again in a minute, or export without a currency.");
    this.name = "PriceHistoryError";
  }
}

/** The daily XMR prices for one currency. The request names only the currency, never any dates. */
export async function fetchPriceHistory(currency: string): Promise<{ days: Record<string, string>; source: string }> {
  try {
    const res = await fetch(apiUrl(`/api/price/history?currency=${encodeURIComponent(currency)}`));
    const body = (await res.json()) as { ok: boolean; days?: Record<string, string>; source?: string };
    if (body.ok && body.days) return { days: body.days, source: body.source ?? "" };
  } catch { /* below */ }
  throw new PriceHistoryError();
}
