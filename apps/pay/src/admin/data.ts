/**
 * What the shop's dashboard shows: every invoice with its problems, sales totals, and the
 * sales export for bookkeeping. Everything is computed from the invoices file and the payments
 * the wallet last saw; nothing here changes an invoice except marking a problem as dealt with.
 */
import { atomicToFiat, formatXmr, invoiceFromJson } from "@quietmint/wallet-core";
import type { PayConfig } from "../config";
import { lockedPaymentsFor, paymentsFor, presentInvoice } from "../invoices";
import type { Store, StoredInvoice } from "../store";
import type { IncomingPayment } from "../wallet";

export type Issue = "partial" | "late" | "locked" | "reverted" | "overpaid";

export const ISSUE_TEXT: Record<Issue, string> = {
  partial: "Part paid: the price hold ended before the rest arrived. Refund the part paid, or agree the rest with the customer.",
  late: "Paid after the price hold ended. Accept the order, or refund the customer.",
  locked: "A payment arrived with coins the sender locked for later. It does not count. Contact the customer.",
  reverted: "Reported paid, then the payment disappeared or lost its confirmations. Hold the order until it is paid again.",
  overpaid: "The customer sent more than the price. Refund the extra if they ask for it.",
};

export interface Row {
  rec: StoredInvoice;
  view: ReturnType<typeof presentInvoice> & { linkId: string | null; txHashes: string[]; lockedPayments: { txHash: string; amount: string }[] };
  /** When the money that completed (or last added to) the invoice was first seen, in ms. */
  paidAt?: number;
  issues: Issue[];
  linkTitle?: string;
}

export interface Ctx {
  cfg: PayConfig;
  store: Store;
  incoming: IncomingPayment[];
  syncedAt: number | null;
  now?: number;
}

export function rowFor(ctx: Ctx, rec: StoredInvoice): Row {
  const now = ctx.now ?? Date.now();
  const view = presentInvoice(rec, ctx.incoming, ctx.cfg, { withMetadata: true, now, syncedAt: ctx.syncedAt }) as Row["view"];
  const seen = paymentsFor(rec, ctx.incoming).map((p) => p.seenAt).filter((t): t is number => typeof t === "number");
  const issues: Issue[] = [];
  if (view.status === "partial" && view.expired) issues.push("partial");
  if (view.status === "late") issues.push("late");
  if (lockedPaymentsFor(rec, ctx.incoming).length) issues.push("locked");
  const told = rec.notified ?? "";
  if (((told === "paid" || told === "confirming" || told === "late") && (view.status === "waiting" || view.status === "partial" || view.status === "expired")) || (told === "paid" && view.status === "confirming")) issues.push("reverted");
  if (view.overpaid !== "0") issues.push("overpaid");
  const linkTitle = rec.linkId ? ctx.store.getLink(rec.linkId)?.title : undefined;
  return { rec, view, issues, ...(seen.length ? { paidAt: Math.max(...seen) } : {}), ...(linkTitle ? { linkTitle } : {}) };
}

/** Every invoice, newest first. */
export const allRows = (ctx: Ctx): Row[] =>
  ctx.store.all().sort((a, b) => b.invoice.createdAt - a.invoice.createdAt).map((r) => rowFor(ctx, r));

export const needsReview = (row: Row): boolean => row.issues.length > 0 && !row.rec.review;

/** Money arrived for it (paid, part paid, late, or still confirming). */
export const hasMoney = (row: Row): boolean => row.view.received !== "0";

export interface Totals {
  label: string;
  paid: number;
  xmr: string;
  /** Sum of the shop's own prices for fully paid invoices priced in a currency, per currency. */
  fiat: { currency: string; amount: string }[];
}

const DAY = 24 * 60 * 60 * 1000;

/** Sales totals for today (UTC), the last 7 days and the last 30 days. */
export function totals(rows: Row[], now = Date.now()): Totals[] {
  const midnight = Math.floor(now / DAY) * DAY;
  const windows: [string, number][] = [["Today (UTC)", midnight], ["Last 7 days", now - 7 * DAY], ["Last 30 days", now - 30 * DAY]];
  return windows.map(([label, since]) => {
    let paid = 0;
    let atomic = 0n;
    const cents = new Map<string, bigint>();
    for (const row of rows) {
      if (row.view.status !== "paid" || !row.paidAt || row.paidAt < since) continue;
      paid++;
      atomic += statusAtomic(row);
      const f = row.view.amount.fiat;
      if (f) cents.set(f.currency, (cents.get(f.currency) ?? 0n) + toCents(f.amount));
    }
    const fiat = [...cents.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([currency, c]) => ({ currency, amount: fromCents(c) }));
    return { label, paid, xmr: formatXmr(atomic), fiat };
  });
}

/** Atomic units received, from the "1.234" string the API shows. */
function statusAtomic(row: Row): bigint {
  const [w, f = ""] = row.view.received.split(".");
  return BigInt(w!) * 1_000_000_000_000n + BigInt(f.padEnd(12, "0").slice(0, 12));
}

function toCents(amount: string): bigint {
  const [w, f = ""] = amount.split(".");
  return BigInt(w!) * 100n + BigInt(f.padEnd(2, "0").slice(0, 2));
}

function fromCents(c: bigint): string {
  const s = c.toString().padStart(3, "0");
  return `${s.slice(0, -2)}.${s.slice(-2)}`;
}

export interface InvoiceFilter {
  status?: string;
  q?: string;
  review?: boolean;
}

export function filterRows(rows: Row[], f: InvoiceFilter): Row[] {
  const q = f.q?.trim().toLowerCase();
  return rows.filter((row) => {
    if (f.review && !needsReview(row)) return false;
    if (f.status && row.view.status !== f.status) return false;
    if (q) {
      const hay = [row.view.id, row.view.reference ?? "", row.linkTitle ?? "", row.view.metadata ?? "", ...row.view.txHashes].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** A cell that a spreadsheet would read as a formula gets a leading quote. */
function cell(v: string): string {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export const CSV_COLUMNS = [
  "invoice_id", "created_utc", "received_utc", "status", "reference", "payment_link",
  "price", "price_currency", "rate_per_xmr", "rate_source", "xmr_due", "xmr_received", "xmr_overpaid",
  "value_received_at_invoice_rate", "tx_hashes", "review_note",
] as const;

/**
 * Sales export for bookkeeping: one line per invoice that received money, in the period by the
 * time the money was first seen (UTC). `value_received_at_invoice_rate` is what arrived, valued
 * at the rate locked when the invoice was made (empty for invoices priced in XMR).
 */
export function salesCsv(rows: Row[], from?: number, to?: number): string {
  const lines = [CSV_COLUMNS.join(",")];
  const sorted = rows.filter(hasMoney).sort((a, b) => (a.paidAt ?? a.rec.invoice.createdAt) - (b.paidAt ?? b.rec.invoice.createdAt));
  for (const row of sorted) {
    const at = row.paidAt ?? row.rec.invoice.createdAt;
    if (from !== undefined && at < from) continue;
    if (to !== undefined && at >= to) continue;
    const v = row.view;
    const f = v.amount.fiat;
    const inv = invoiceFromJson(row.rec.invoice);
    lines.push([
      v.id, v.createdAt, new Date(at).toISOString(), v.status, v.reference ?? "", row.linkTitle ?? "",
      f?.amount ?? "", f?.currency ?? "XMR", f?.rate ?? "", f?.source ?? "", v.amount.xmr, v.received, v.overpaid,
      f && inv.fiat ? atomicToFiat(statusAtomic(row), inv.fiat.rate) : "", v.txHashes.join(" "), row.rec.review?.note ?? "",
    ].map((x) => cell(String(x))).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

