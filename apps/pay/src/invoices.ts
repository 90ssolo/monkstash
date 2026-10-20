/**
 * Invoices for MonkStash Pay, built on the shared invoice engine (the same rules as the web
 * wallet's cashier mode). Each invoice gets a fresh subaddress from the view-only wallet, so
 * payments are matched by address, never by amount.
 */
import { randomBytes } from "node:crypto";
import {
  buildPaymentUri, checkReturnUrl, createInvoice, expiryIsFinal, formatXmr, invoiceFromJson, invoiceStatus, invoiceToJson, InvoiceError, isCurrencyCode,
  type Invoice, type InvoiceStatus,
} from "@quietmint/wallet-core";
import type { PayConfig } from "./config";
import type { PriceService } from "./prices";
import type { InvoiceEvent, Store, StoredInvoice } from "./store";
import type { IncomingPayment, Watcher } from "./wallet";
import { queueEvent } from "./webhooks";

export class BadRequest extends Error {}

/** The server is at its limit of open invoices; the shop should try again later (HTTP 503). */
export class TooManyOpen extends Error {}

export interface CreateInvoiceInput {
  amount?: unknown;
  currency?: unknown;
  reference?: unknown;
  note?: unknown;
  returnUrl?: unknown;
  metadata?: unknown;
  expiresInMinutes?: unknown;
}

/** 24 random bytes, URL-safe: checkout links cannot be guessed or enumerated. */
export const newInvoiceId = () => randomBytes(24).toString("base64url");

/** Account an invoice's subaddress lives in. Invoices from before PAY_ACCOUNT existed used 0. */
export const accountOf = (rec: StoredInvoice): number => rec.account ?? 0;

/** Invoices that have received nothing and have not expired yet. */
export function openInvoiceCount(store: Store, now = Date.now()): number {
  let n = 0;
  for (const rec of store.all()) {
    if (Object.keys(rec.seen).length) continue;
    const exp = rec.invoice.expiresAt;
    if (exp === undefined || now < exp) n++;
  }
  return n;
}

/** Every account the watcher must read: the configured one, plus any that older invoices use. */
export function accountsInUse(store: Store, cfg: PayConfig): number[] {
  return [...new Set([cfg.account, ...store.all().map(accountOf)])].sort((a, b) => a - b);
}

/** Highest subaddress index stored invoices use, per account. */
export function highestIndexes(store: Store): Record<number, number> {
  const out: Record<number, number> = {};
  for (const rec of store.all()) {
    const a = accountOf(rec);
    out[a] = Math.max(out[a] ?? 0, rec.invoice.subaddressIndex);
  }
  return out;
}

/**
 * Wallets only scan a limited number of unused subaddresses past the last one they know about
 * (200 by default in Monero's own wallet software). A copy of the shop wallet restored elsewhere
 * finds payments only within that window past the last subaddress that received money, so warn
 * well before the gap reaches it.
 */
export const LOOKAHEAD_WARN_GAP = 150;

export interface SubaddressUsage {
  account: number;
  /** Highest subaddress index handed to an invoice (0 if none yet). */
  highestIndex: number;
  /** Highest index whose invoice has received a payment (0 if none yet). */
  lastPaidIndex: number;
  /** Subaddresses handed out since the last one that received a payment. */
  gap: number;
}

export function subaddressUsage(store: Store, account: number): SubaddressUsage {
  let highestIndex = 0;
  let lastPaidIndex = 0;
  for (const rec of store.all()) {
    if (accountOf(rec) !== account) continue;
    const i = rec.invoice.subaddressIndex;
    highestIndex = Math.max(highestIndex, i);
    if (Object.keys(rec.seen).length) lastPaidIndex = Math.max(lastPaidIndex, i);
  }
  return { account, highestIndex, lastPaidIndex, gap: highestIndex - lastPaidIndex };
}

const str = (v: unknown, name: string, max: number): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v !== "string") throw new BadRequest(`${name} must be a string.`);
  const s = v.trim();
  if (s.length > max) throw new BadRequest(`${name} must be at most ${max} characters.`);
  return s || undefined;
};

export async function createShopInvoice(input: CreateInvoiceInput, deps: { cfg: PayConfig; store: Store; watcher: Watcher; prices: PriceService; now?: number }): Promise<StoredInvoice> {
  const { cfg, store, watcher, prices } = deps;
  // Every open invoice holds a fresh subaddress. Cap them, so a flood of fake checkouts cannot
  // fill the disk or push new subaddresses far past the wallet's lookahead.
  if (openInvoiceCount(store, deps.now ?? Date.now()) >= cfg.maxOpenInvoices) {
    throw new TooManyOpen(`This payment server already has ${cfg.maxOpenInvoices} unpaid payment requests open. Try again once some have been paid or have expired.`);
  }
  const currency = (str(input.currency, "currency", 16) ?? cfg.defaultCurrency).toUpperCase();
  if (!isCurrencyCode(currency)) throw new BadRequest("currency must be a 3-letter code like EUR or XMR.");
  const amount = typeof input.amount === "number" ? String(input.amount) : str(input.amount, "amount", 24);
  if (!amount) throw new BadRequest("amount is required, as a string like \"12.50\".");
  const reference = str(input.reference, "reference", 64);
  const note = str(input.note, "note", 120);
  const metadata = str(input.metadata, "metadata", 1000);
  const ret = str(input.returnUrl, "returnUrl", 300);
  const returnUrl = ret ? checkReturnUrl(ret) ?? undefined : undefined;
  if (ret && !returnUrl) throw new BadRequest("returnUrl must be a full https:// URL.");
  let expiresInMinutes = cfg.expiryMinutes;
  if (input.expiresInMinutes !== undefined) {
    const m = Number(input.expiresInMinutes);
    if (!Number.isFinite(m) || m < 5 || m > 60 * 24 * 7) throw new BadRequest("expiresInMinutes must be between 5 and 10080.");
    expiresInMinutes = m;
  }

  let price: { xmr: bigint } | { fiat: string; quote: Awaited<ReturnType<PriceService["quote"]>> };
  if (currency === "XMR") {
    if (/^\d{10,}(\.\d*)?$/.test(amount)) throw new BadRequest("amount is too large.");
    if (!/^\d{1,9}(\.\d{1,12})?$/.test(amount)) throw new BadRequest("amount must be a number of XMR like \"0.25\", with at most 12 decimals.");
    const [w, f = ""] = amount.split(".");
    const atomic = BigInt(w!) * 1_000_000_000_000n + BigInt(f.padEnd(12, "0"));
    if (atomic <= 0n) throw new BadRequest("amount must be more than 0.");
    price = { xmr: atomic };
  } else {
    if (!/^\d{1,9}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) throw new BadRequest("amount must be a price like \"12.50\".");
    price = { fiat: amount, quote: await prices.quote(currency) };
  }

  const id = newInvoiceId();
  const now = deps.now ?? Date.now();
  // Never reuse a subaddress: a second order on it would see the first order's payment.
  const used = new Set(store.all().filter((r) => accountOf(r) === cfg.account).map((r) => r.invoice.subaddressIndex));
  const sub = await watcher.newSubaddress(`MonkStash Pay ${reference ?? id.slice(0, 8)}`, Math.max(0, ...used));
  if (used.has(sub.index)) throw new Error("The wallet returned a subaddress that is already in use.");
  let invoice: Invoice;
  try {
    invoice = createInvoice({ id, subaddressIndex: sub.index, address: sub.address, now, price, policy: cfg.policy, expiresInMinutes, ...(reference ? { reference } : {}), ...(note ? { note } : {}) });
  } catch (err) {
    if (err instanceof InvoiceError) throw new BadRequest(err.message);
    throw err;
  }
  const rec: StoredInvoice = { invoice: invoiceToJson(invoice), account: cfg.account, seen: {}, ...(returnUrl ? { returnUrl } : {}), ...(metadata ? { metadata } : {}) };
  await store.put(rec);
  return rec;
}

const belongsTo = (rec: StoredInvoice, e: IncomingPayment) =>
  e.subaddressIndex === rec.invoice.subaddressIndex && e.accountIndex === accountOf(rec);

function paymentsFor(rec: StoredInvoice, incoming: IncomingPayment[]) {
  return incoming
    .filter((e) => belongsTo(rec, e))
    .map((e) => ({ ...e, seenAt: rec.seen[e.hash] ?? (e.timestamp ? e.timestamp * 1000 : undefined) }));
}

export function statusOf(rec: StoredInvoice, incoming: IncomingPayment[], now = Date.now()): InvoiceStatus {
  return invoiceStatus(invoiceFromJson(rec.invoice), paymentsFor(rec, incoming), now);
}

export type PublicStatus = InvoiceStatus["kind"];

/**
 * The status as the API, webhooks and checkout page report it. An unpaid invoice is reported
 * `expired` only once the grace period after expiresAt has passed, because a payment first seen
 * in that window still counts as on time; until then it stays `waiting`, with `expired: true`.
 * Callers pass the time the status is decided at: never later than the last successful sync.
 */
export function publicStatus(rec: StoredInvoice, st: InvoiceStatus, now: number): PublicStatus {
  if (st.kind === "expired" && !expiryIsFinal(invoiceFromJson(rec.invoice), now)) return "waiting";
  return st.kind;
}

/**
 * The time an invoice's status is decided at: now, but never later than the last successful
 * sync. While the node is unreachable the server cannot see payments, so an invoice must not
 * turn `expired` (or a payment `late`) past what was actually observed on chain.
 */
export const statusTime = (now: number, syncedAt?: number | null): number =>
  syncedAt === undefined || syncedAt === null ? now : Math.min(now, syncedAt);

/**
 * The invoice as the API and checkout page show it. Metadata only with `withMetadata`.
 * `syncedAt` is the time of the last successful sync (see statusTime); `expired` (the price
 * hold has ended) still follows the real clock.
 */
export function presentInvoice(rec: StoredInvoice, incoming: IncomingPayment[], cfg: PayConfig, opts: { withMetadata?: boolean; now?: number; syncedAt?: number | null } = {}) {
  const inv = invoiceFromJson(rec.invoice);
  const now = opts.now ?? Date.now();
  const at = statusTime(now, opts.syncedAt);
  const st = statusOf(rec, incoming, at);
  const received = st.kind === "waiting" || st.kind === "expired" ? 0n : st.received;
  const due = inv.amount ?? 0n;
  const remaining = due > received ? due - received : 0n;
  // Never let one damaged record break the API or the checkout page.
  let paymentUri: string;
  try {
    paymentUri = buildPaymentUri({ address: inv.address, amount: (st.kind === "partial" ? remaining : due) || undefined, note: inv.reference, name: cfg.shopName });
  } catch {
    paymentUri = `monero:${inv.address}`;
  }
  return {
    id: inv.id,
    status: publicStatus(rec, st, at),
    /** The price hold has ended: the customer should not send (more) money now. */
    expired: inv.expiresAt !== undefined && now >= inv.expiresAt,
    reference: inv.reference ?? null,
    note: inv.note ?? null,
    amount: { xmr: formatXmr(due), ...(inv.fiat ? { fiat: { currency: inv.fiat.currency, amount: inv.fiat.amount, rate: inv.fiat.rate, source: inv.fiat.source ?? null } } : {}) },
    received: formatXmr(received),
    remaining: formatXmr(remaining),
    overpaid: st.kind === "paid" ? formatXmr(st.overpaid) : "0",
    confirmations: st.kind === "confirming" || st.kind === "paid" || st.kind === "late" ? st.confirmations : 0,
    requiredConfirmations: inv.confirmations,
    /** Part of the money counted here is still unconfirmed (in the mempool). */
    // A sale accepted at 0 confirmations (the quick preset) is paid but still unconfirmed: say so.
    pending: st.kind === "partial" || st.kind === "confirming" || st.kind === "late" ? st.pending : st.kind === "paid" ? st.confirmations === 0 : false,
    address: inv.address,
    paymentUri,
    createdAt: new Date(inv.createdAt).toISOString(),
    expiresAt: inv.expiresAt ? new Date(inv.expiresAt).toISOString() : null,
    checkoutUrl: `${cfg.publicUrl}/pay/${encodeURIComponent(inv.id)}`,
    returnUrl: rec.returnUrl ?? null,
    ...(opts.withMetadata ? { metadata: rec.metadata ?? null, txHashes: paymentsFor(rec, incoming).map((p) => p.hash) } : {}),
  };
}

const EVENT_FOR: Partial<Record<InvoiceStatus["kind"], InvoiceEvent>> = {
  paid: "invoice.paid", partial: "invoice.partial", late: "invoice.late", expired: "invoice.expired", confirming: "invoice.confirming",
};

/** Settled invoices are no longer re-checked after this long. */
const ACTIVE_FOR_MS = 7 * 24 * 3600_000;

/** Syncs further apart than this mean the server was down or the node unreachable in between. */
export const SYNC_GAP_MS = 60_000;

export interface ReconcileOptions {
  /** Time of the sync whose payments these are (default: now). Status is decided as of it. */
  syncedAt?: number;
  /** First sync since the server started: the previous sync may be long ago. */
  resumed?: boolean;
}

/**
 * One pass over open invoices: records first-seen times and queues a webhook for every status
 * change. Returns the number of events queued.
 *
 * Besides the plain status events:
 *  - a partial invoice whose price hold (plus grace period) has ended queues `invoice.expired`,
 *    with the partial amount in the data, so the shop can refund or follow up;
 *  - an invoice the shop was told is paid, confirming or late that drops back (an unconfirmed
 *    payment disappeared from the mempool) queues `invoice.reverted`.
 *
 * A mempool payment's first-seen time is normally now. After a gap in syncing (a restart or a
 * node outage) it could have arrived any time since the previous successful sync, so it gets
 * the earliest time it could have been sent: the previous sync, or the invoice's creation if
 * later. An on-time payment is never classed late because the server could not see it.
 * Confirmed payments always use their block's timestamp.
 */
export async function reconcile(store: Store, incoming: IncomingPayment[], cfg: PayConfig, now = Date.now(), opts: ReconcileOptions = {}): Promise<number> {
  let queued = 0;
  const syncedAt = opts.syncedAt ?? now;
  const at = statusTime(now, syncedAt);
  const prevSync = store.lastSyncAt;
  const afterGap = prevSync !== undefined && prevSync < syncedAt && (opts.resumed === true || syncedAt - prevSync > SYNC_GAP_MS);
  let changed = store.markSynced(Math.max(syncedAt, prevSync ?? 0));
  for (const rec of store.all()) {
    const inv = rec.invoice;
    const settled = rec.notified === "paid" || rec.notified === "late";
    if (settled && now - inv.createdAt > ACTIVE_FOR_MS) continue;
    for (const e of incoming) {
      if (!belongsTo(rec, e) || rec.seen[e.hash] !== undefined) continue;
      if (!e.pending && e.timestamp) rec.seen[e.hash] = e.timestamp * 1000;
      else rec.seen[e.hash] = afterGap ? Math.min(at, Math.max(prevSync!, inv.createdAt)) : at;
      changed = true;
    }
    const st = statusOf(rec, incoming, at);
    const kind = publicStatus(rec, st, at);
    let key: string = kind;
    let event = EVENT_FOR[kind];
    if (st.kind === "partial") {
      // Partial payments notify again when more arrives, and once more when the hold has ended.
      const over = st.expired && expiryIsFinal(invoiceFromJson(inv), at);
      key = `${over ? "partial-expired" : "partial"}:${st.received}`;
      event = over ? "invoice.expired" : "invoice.partial";
    }
    const prev = rec.notified ?? "";
    const reverted = (prev === "paid" || prev === "confirming" || prev === "late") && (kind === "waiting" || kind === "partial" || kind === "expired");
    if (reverted) {
      event = "invoice.reverted";
    } else {
      if (kind === "waiting" || key === prev) continue;
      // An invoice that expired long ago does not need an event any more.
      if ((kind === "expired" || key.startsWith("partial-expired:")) && inv.expiresAt && now - inv.expiresAt > ACTIVE_FOR_MS) continue;
    }
    if (cfg.webhookUrl && event) {
      queueEvent(store, inv.id, event, presentInvoice(rec, incoming, cfg, { withMetadata: true, now, syncedAt }), now);
      queued++;
    }
    rec.notified = key;
    changed = true;
  }
  if (changed) await store.save();
  return queued;
}
