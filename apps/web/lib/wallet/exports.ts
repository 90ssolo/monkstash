"use client";
/**
 * CSV exports for bookkeeping: cashier sales, payment requests and wallet history. Built in the
 * browser from data already on this device and saved straight to the user's downloads; nothing
 * is uploaded. Amounts are plain decimal XMR (not atomic units) so spreadsheets can sum them.
 */
import { atomicToFiat, formatXmr, invoiceFromJson, toCsv, utcDay, type CsvCell, type InvoiceStatus } from "@quietmint/wallet-core";
import { MAIN_ACCOUNT, type IncomingEntry, type TxSummary } from "./engine";
import { saleStatus, type Sale } from "./cashier";
import { statusOf, type PaymentRequest } from "./requests";
import type { TxTags } from "./history";

const xmr = (a: bigint | undefined) => (a === undefined ? "" : formatXmr(a));
const iso = (ms: number | undefined) => (ms === undefined || !Number.isFinite(ms) ? "" : new Date(ms).toISOString());

/** Local date for file names, like 2026-10-15. */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function received(s: InvoiceStatus): bigint {
  return s.kind === "waiting" || s.kind === "expired" ? 0n : s.received;
}

/** Payments to one subaddress of one account (tills use their own accounts, so the index alone is ambiguous). */
function hashesFor(account: number, index: number, incoming: IncomingEntry[]): string {
  return incoming
    .filter((e) => (e.accountIndex ?? MAIN_ACCOUNT) === account && e.subaddressIndex === index)
    .map((e) => e.hash).join(" ");
}

export function salesCsv(sales: Sale[], incoming: IncomingEntry[], now: number): string {
  const header = ["created_at", "reference", "price", "currency", "xmr_due", "rate", "rate_source", "status", "decision", "xmr_received", "xmr_overpaid", "expires_at", "subaddress_index", "address", "tx_hashes"];
  const rows: CsvCell[][] = sales.map((s) => {
    const inv = invoiceFromJson(s.invoice);
    const st = saleStatus(s, incoming, now);
    return [
      iso(inv.createdAt), inv.reference, inv.fiat?.amount ?? xmr(inv.amount), inv.fiat?.currency ?? "XMR", xmr(inv.amount),
      inv.fiat?.rate, inv.fiat?.source, st.kind, s.resolution, xmr(received(st)), st.kind === "paid" ? xmr(st.overpaid) : "",
      iso(inv.expiresAt), inv.subaddressIndex, inv.address, hashesFor(s.account ?? MAIN_ACCOUNT, inv.subaddressIndex, incoming),
    ];
  });
  return toCsv(header, rows);
}

export function requestsCsv(list: PaymentRequest[], incoming: IncomingEntry[]): string {
  const header = ["created_at", "note", "name", "price", "currency", "xmr_amount", "rate", "expires_at", "status", "xmr_received", "subaddress_index", "address", "tx_hashes"];
  const rows: CsvCell[][] = list.map((r) => {
    const st = statusOf(r, incoming);
    const amount = r.amount ? BigInt(r.amount) : undefined;
    return [
      r.createdAt, r.note, r.name, r.fiat?.amount ?? xmr(amount), r.fiat?.currency ?? (amount ? "XMR" : ""), xmr(amount), r.fiat?.rate,
      iso(r.expiresAt), st.kind, "received" in st ? xmr(st.received) : "0", r.index, r.address, hashesFor(MAIN_ACCOUNT, r.index, incoming),
    ];
  });
  return toCsv(header, rows);
}

export interface HistoryExtras {
  /** Note and address labels of each payment. */
  tags?: (t: TxSummary) => TxTags;
  /** Daily XMR prices in one currency: adds the value of each payment on its day. */
  prices?: { currency: string; days: Record<string, string> };
}

export function historyCsv(txs: TxSummary[], extras: HistoryExtras = {}): string {
  const p = extras.prices;
  const cur = p?.currency.toLowerCase();
  const header = ["date", "direction", "xmr_amount", "xmr_fee", "confirmations", "status", "block_height", "tx_hash", "note", "received_at",
    ...(p ? [`xmr_price_${cur}`, `value_${cur}`, `fee_value_${cur}`, "price_date"] : [])];
  const latest = p ? Object.keys(p.days).sort().pop() : undefined;
  const rows: CsvCell[][] = txs.map((t) => {
    const tags = extras.tags?.(t) ?? { at: [] };
    // Outgoing amounts are negative so a column sum gives the net change.
    const sign = t.direction === "out" ? "-" : "";
    const row: CsvCell[] = [
      t.timestamp ? new Date(t.timestamp * 1000).toISOString() : "", t.direction,
      `${sign}${formatXmr(t.amount)}`, xmr(t.fee), t.confirmations,
      t.pending ? "pending" : t.confirmations >= 10 ? "confirmed" : "confirming", t.height, t.hash,
      tags.note, tags.at.join("; "),
    ];
    if (p) {
      // A payment still waiting for a block has no date yet: it uses the latest price.
      const day = t.timestamp ? utcDay(t.timestamp * 1000) : latest;
      const rate = day ? p.days[day] : undefined;
      if (rate) {
        const fee = t.fee !== undefined && t.direction !== "in" ? `-${atomicToFiat(t.fee, rate)}` : "";
        row.push(rate, `${sign}${atomicToFiat(t.amount, rate)}`, fee, day);
      } else row.push("", "", "", "");
    }
    return row;
  });
  return toCsv(header, rows);
}

/** Saves a CSV to the user's downloads. A byte-order mark makes Excel read it as UTF-8. */
export function downloadCsv(kind: "sales" | "payment-requests" | "history", csv: string): void {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monkstash-${kind}-${today()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
