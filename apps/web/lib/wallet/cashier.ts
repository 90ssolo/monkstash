"use client";
/**
 * Cashier mode data: the till's settings and its sales. Sales say what was sold for how much,
 * so they are private and stored sealed with the wallet's own secret, like payment requests.
 */
import { CONFIRMATION_PRESETS, invoiceFromJson, invoiceStatus, type InvoiceJson, type InvoicePayment, type InvoiceStatus } from "@quietmint/wallet-core";
import { MAIN_ACCOUNT, type IncomingEntry } from "./engine";

export type Speed = keyof typeof CONFIRMATION_PRESETS;

export interface CashierConfig {
  /** "XMR" or a fiat code like EUR. */
  currency: string;
  speed: Speed;
  /** Shown to the customer's wallet as the recipient (optional). */
  shopName?: string;
  /** Which till this device is (1 to 8). Each till uses its own wallet account, so two tills
   *  running the same wallet never hand out the same address. Missing means till 1. */
  tillNumber?: number;
}

export interface Sale {
  invoice: InvoiceJson;
  /** When each payment (by tx hash) was first seen, so late payments can be told apart. */
  seen: Record<string, number>;
  /** The merchant's decision on a late, cancelled or refunded sale. */
  resolution?: "accepted" | "refund" | "cancelled";
  /** Wallet account the sale's address belongs to (older sales: the main account). */
  account?: number;
}

export interface CashierData {
  config: CashierConfig | null;
  sales: Sale[];
}

export interface CashierStore {
  load(): Promise<CashierData>;
  save(data: CashierData): Promise<void>;
}

/** Above this many sales the till suggests exporting (nothing is ever dropped: a dropped sale
 *  would also free its address for reuse). */
export const SALES_EXPORT_HINT = 2000;

export const EMPTY_CASHIER: CashierData = { config: null, sales: [] };

/** Payments for a sale, with first-seen times attached. */
export function salePayments(sale: Sale, incoming: IncomingEntry[]): InvoicePayment[] {
  return incoming
    .filter((e) => (e.accountIndex ?? MAIN_ACCOUNT) === (sale.account ?? MAIN_ACCOUNT) && e.subaddressIndex === sale.invoice.subaddressIndex)
    .map((e) => ({ ...e, seenAt: sale.seen[e.hash] ?? (e.timestamp ? e.timestamp * 1000 : undefined) }));
}

export function saleStatus(sale: Sale, incoming: IncomingEntry[], now: number): InvoiceStatus {
  return invoiceStatus(invoiceFromJson(sale.invoice), salePayments(sale, incoming), now);
}

/**
 * Records the first time each payment was seen. A confirmed payment seen for the first time
 * (for example after the till restarted) takes its block time instead of now.
 * Returns null when nothing changed.
 */
export function recordSeen(sales: Sale[], incoming: IncomingEntry[], now: number): Sale[] | null {
  let changed = false;
  const next = sales.map((s) => {
    let seen = s.seen;
    for (const e of incoming) {
      if ((e.accountIndex ?? MAIN_ACCOUNT) !== (s.account ?? MAIN_ACCOUNT) || e.subaddressIndex !== s.invoice.subaddressIndex || seen[e.hash] !== undefined) continue;
      seen = { ...seen, [e.hash]: !e.pending && e.timestamp ? e.timestamp * 1000 : now };
      changed = true;
    }
    return seen === s.seen ? s : { ...s, seen };
  });
  return changed ? next : null;
}
