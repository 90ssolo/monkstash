"use client";
/**
 * Payment requests kept by the wallet. The list (amounts, notes, which subaddress each
 * request uses) is private, so it is stored sealed with the wallet's own secret in
 * IndexedDB, readable only while the wallet is unlocked. Removing the wallet clears it.
 */
import { invoiceStatus, type Invoice } from "@quietmint/wallet-core";
import { MAIN_ACCOUNT, type IncomingEntry } from "./engine";
import { serverNow } from "./clock";

export interface PaymentRequest {
  id: string;
  /** Subaddress index the request was given; payments to it belong to this request. */
  index: number;
  address: string;
  /** Atomic units as a string; absent means any amount. */
  amount?: string;
  note?: string;
  createdAt: string;
  /** Optional extras (payment links v2). */
  name?: string;
  expiresAt?: number;
  fiat?: { currency: string; amount: string; rate: string };
  returnUrl?: string;
  /** When each payment (by tx hash) was first seen while the wallet was open, so a payment sent
   *  before the deadline but confirmed after it is not called late. */
  seen?: Record<string, number>;
}

export interface RequestStore {
  load(): Promise<PaymentRequest[]>;
  save(list: PaymentRequest[]): Promise<void>;
}

export type RequestStatus =
  | { kind: "unpaid" }
  | { kind: "expired" }
  | { kind: "late"; received: bigint }
  | { kind: "arriving"; received: bigint }
  | { kind: "partial"; received: bigint }
  | { kind: "confirming"; received: bigint; confirmations: number }
  | { kind: "paid"; received: bigint };

/** Status of a request from the incoming payments to its subaddress, via the shared invoice engine. */
export function statusOf(req: PaymentRequest, entries: IncomingEntry[]): RequestStatus {
  const invoice: Invoice = {
    id: req.id,
    subaddressIndex: req.index,
    address: req.address,
    ...(req.amount ? { amount: BigInt(req.amount) } : {}),
    confirmations: 10,
    tolerance: 0n,
    createdAt: Date.parse(req.createdAt),
    ...(req.expiresAt ? { expiresAt: req.expiresAt } : {}),
  };
  // Payment requests live in the main account. First-seen time wins (the payment was already on
  // its way); otherwise a confirmed payment's block time; unknown counts as late only after expiry.
  const payments = entries
    // A payment with a custom unlock time cannot be spent for a long time: never counted as paid.
    .filter((e) => (e.accountIndex ?? MAIN_ACCOUNT) === MAIN_ACCOUNT && !e.locked)
    .map((e) => {
      const seenAt = req.seen?.[e.hash] ?? (e.timestamp ? e.timestamp * 1000 : undefined);
      return { ...e, ...(seenAt !== undefined ? { seenAt } : {}) };
    });
  // Corrected time: requests are stamped with it too (see clock.ts).
  const s = invoiceStatus(invoice, payments, serverNow());
  switch (s.kind) {
    case "waiting":
      return { kind: "unpaid" };
    case "expired":
      return { kind: "expired" };
    case "late":
      return { kind: "late", received: s.received };
    case "partial":
      return s.pending ? { kind: "arriving", received: s.received } : { kind: "partial", received: s.received };
    case "confirming":
      return s.pending ? { kind: "arriving", received: s.received } : { kind: "confirming", received: s.received, confirmations: s.confirmations };
    case "paid":
      return { kind: "paid", received: s.received };
  }
}

/** Records when each payment to a request was first seen. Returns null when nothing changed. */
export function recordRequestSeen(list: PaymentRequest[], entries: IncomingEntry[], now: number): PaymentRequest[] | null {
  let changed = false;
  const next = list.map((r) => {
    let seen = r.seen ?? {};
    for (const e of entries) {
      if ((e.accountIndex ?? MAIN_ACCOUNT) !== MAIN_ACCOUNT || e.subaddressIndex !== r.index || seen[e.hash] !== undefined) continue;
      seen = { ...seen, [e.hash]: !e.pending && e.timestamp ? e.timestamp * 1000 : now };
      changed = true;
    }
    return seen === (r.seen ?? {}) ? r : { ...r, seen };
  });
  return changed ? next : null;
}
