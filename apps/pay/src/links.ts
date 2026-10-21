/**
 * Payment links: one shareable address (for a chat, an email, a social profile or a donate
 * button) that gives every visitor their own fresh invoice. A link has either a fixed price or
 * lets the payer choose the amount (donations, tips). Nothing about a link reaches the payer's
 * wallet beyond the title, and the money goes straight to the shop's wallet as with any invoice.
 */
import { randomBytes } from "node:crypto";
import { checkReturnUrl, formatXmr, isCurrencyCode } from "@quietmint/wallet-core";
import type { PayConfig } from "./config";
import { BadRequest, checkAmount, statusOf } from "./invoices";
import type { Store, StoredInvoice, StoredLink } from "./store";
import type { IncomingPayment } from "./wallet";

/** 16 random bytes, URL-safe: links cannot be guessed or listed by strangers. */
export const newLinkId = () => randomBytes(16).toString("base64url");

const MAX_SUGGESTED = 4;
const MAX_PAYMENTS_LIMIT = 100_000;

const str = (v: unknown, name: string, max: number): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v !== "string") throw new BadRequest(`${name} must be a string.`);
  const s = v.trim();
  if (s.length > max) throw new BadRequest(`${name} must be at most ${max} characters.`);
  return s || undefined;
};

/** Compares two valid amounts exactly (no floating point): -1, 0 or 1. */
export function compareAmounts(a: string, b: string): number {
  const [ai, af = ""] = a.split(".");
  const [bi, bf = ""] = b.split(".");
  const len = Math.max(af.length, bf.length);
  const x = BigInt(ai! + af.padEnd(len, "0"));
  const y = BigInt(bi! + bf.padEnd(len, "0"));
  return x === y ? 0 : x < y ? -1 : 1;
}

/** Accepts "12,50" as well as "12.50" from a payer typing an amount. */
export const normalizeTyped = (s: string): string => s.trim().replace(",", ".");

export function createLink(input: Record<string, unknown>, cfg: PayConfig, now = Date.now()): StoredLink {
  const title = str(input.title, "title", 80);
  if (!title) throw new BadRequest("title is required, for example \"Logo design\" or \"Support my work\".");
  const description = str(input.description, "description", 500);
  const currency = (str(input.currency, "currency", 16) ?? cfg.defaultCurrency).toUpperCase();
  if (!isCurrencyCode(currency)) throw new BadRequest("currency must be a 3-letter code like EUR or XMR.");

  const rawAmount = typeof input.amount === "number" ? String(input.amount) : str(input.amount, "amount", 24);
  const amount = rawAmount ? checkAmount(rawAmount, currency) : undefined;

  let minAmount: string | undefined;
  let suggested: string[] | undefined;
  if (amount) {
    if (input.minAmount !== undefined || input.suggested !== undefined) throw new BadRequest("minAmount and suggested are only for links where the payer chooses the amount (no amount).");
  } else {
    const rawMin = typeof input.minAmount === "number" ? String(input.minAmount) : str(input.minAmount, "minAmount", 24);
    minAmount = rawMin ? checkAmount(rawMin, currency, "minAmount") : undefined;
    if (input.suggested !== undefined) {
      if (!Array.isArray(input.suggested) || input.suggested.length > MAX_SUGGESTED) throw new BadRequest(`suggested must be a list of up to ${MAX_SUGGESTED} amounts.`);
      suggested = input.suggested.map((v, i) => checkAmount(typeof v === "number" ? String(v) : String(v ?? ""), currency, `suggested[${i}]`));
      if (minAmount && suggested.some((s) => compareAmounts(s, minAmount!) < 0)) throw new BadRequest("Every suggested amount must be at least minAmount.");
      if (!suggested.length) suggested = undefined;
    }
  }

  let maxPayments: number | undefined;
  if (input.maxPayments !== undefined && input.maxPayments !== null) {
    const n = Number(input.maxPayments);
    if (!Number.isInteger(n) || n < 1 || n > MAX_PAYMENTS_LIMIT) throw new BadRequest(`maxPayments must be a whole number from 1 to ${MAX_PAYMENTS_LIMIT}.`);
    maxPayments = n;
  }

  let expiresAt: number | undefined;
  const rawExp = str(input.expiresAt, "expiresAt", 40);
  if (rawExp) {
    const t = Date.parse(rawExp);
    if (!Number.isFinite(t)) throw new BadRequest("expiresAt must be a date like 2026-12-31T23:59:00Z.");
    if (t <= now) throw new BadRequest("expiresAt must be in the future.");
    expiresAt = t;
  }

  const ret = str(input.returnUrl, "returnUrl", 300);
  const returnUrl = ret ? checkReturnUrl(ret) ?? undefined : undefined;
  if (ret && !returnUrl) throw new BadRequest("returnUrl must be a full https:// URL.");
  const metadata = str(input.metadata, "metadata", 1000);

  return {
    id: newLinkId(), title, currency, active: true, createdAt: now,
    ...(description ? { description } : {}), ...(amount ? { amount } : {}), ...(minAmount ? { minAmount } : {}),
    ...(suggested ? { suggested } : {}), ...(maxPayments ? { maxPayments } : {}), ...(expiresAt ? { expiresAt } : {}),
    ...(returnUrl ? { returnUrl } : {}), ...(metadata ? { metadata } : {}),
  };
}

/** Applies a change from PATCH /api/links/:id. Only switching a link on or off is supported. */
export function updateLink(link: StoredLink, input: Record<string, unknown>): StoredLink {
  const keys = Object.keys(input);
  if (keys.length !== 1 || typeof input.active !== "boolean") throw new BadRequest("Send {\"active\": false} to switch a link off, or {\"active\": true} to switch it back on.");
  return { ...link, active: input.active };
}

const linkInvoices = (store: Store, linkId: string): StoredInvoice[] => store.all().filter((r) => r.linkId === linkId);

/** True once any money arrived for the invoice (paid, part paid, late or still confirming). */
const hasPayment = (rec: StoredInvoice): boolean => Object.keys(rec.seen).length > 0;

/** An invoice nobody has paid into yet, whose price hold has not ended. */
const isOpen = (rec: StoredInvoice, now: number): boolean =>
  !hasPayment(rec) && (rec.invoice.expiresAt === undefined || now < rec.invoice.expiresAt);

export interface LinkStats {
  /** Invoices from this link that received money. */
  payments: number;
  /** Invoices from this link that are fully paid. */
  paid: number;
  /** Unpaid invoices whose price hold is still running. */
  open: number;
  /** XMR counted toward fully paid invoices. */
  receivedXmr: string;
}

export function linkStats(store: Store, link: StoredLink, incoming: IncomingPayment[], now = Date.now()): LinkStats {
  let payments = 0, paid = 0, open = 0;
  let received = 0n;
  for (const rec of linkInvoices(store, link.id)) {
    if (isOpen(rec, now)) { open++; continue; }
    if (!hasPayment(rec)) continue;
    payments++;
    const st = statusOf(rec, incoming, now);
    if (st.kind === "paid") { paid++; received += st.received; }
  }
  return { payments, paid, open, receivedXmr: formatXmr(received) };
}

export type Availability =
  | { ok: true }
  /** The link takes a limited number of payments and the last places are held by open invoices: send this visitor to one. */
  | { ok: false; reason: "held"; invoiceId: string }
  | { ok: false; reason: "inactive" | "expired" | "used" };

export function linkAvailability(store: Store, link: StoredLink, now = Date.now()): Availability {
  if (!link.active) return { ok: false, reason: "inactive" };
  if (link.expiresAt !== undefined && now >= link.expiresAt) return { ok: false, reason: "expired" };
  if (link.maxPayments !== undefined) {
    const invoices = linkInvoices(store, link.id);
    const used = invoices.filter(hasPayment).length;
    if (used >= link.maxPayments) return { ok: false, reason: "used" };
    const open = invoices.filter((r) => isOpen(r, now)).sort((a, b) => b.invoice.createdAt - a.invoice.createdAt);
    // A one-off invoice link opened twice must not let the customer pay twice: reuse the open one.
    if (used + open.length >= link.maxPayments && open[0]) return { ok: false, reason: "held", invoiceId: open[0].invoice.id };
  }
  return { ok: true };
}

/** The amount for a new invoice from this link: the fixed price, or the one the payer chose. */
export function chosenAmount(link: StoredLink, typed: string | undefined): string {
  if (link.amount) return link.amount;
  if (!typed) throw new BadRequest("Enter an amount.");
  const amount = checkAmount(normalizeTyped(typed), link.currency);
  if (link.minAmount && compareAmounts(amount, link.minAmount) < 0) throw new BadRequest(`The smallest amount is ${link.minAmount} ${link.currency}.`);
  return amount;
}

export const linkUrl = (cfg: PayConfig, link: StoredLink) => `${cfg.publicUrl}/l/${encodeURIComponent(link.id)}`;

/** A plain link styled as a button, safe to paste into any website: no script, no tracking. */
export function buttonHtml(cfg: PayConfig, link: StoredLink): string {
  const label = link.amount ? "Pay with Monero" : "Donate with Monero";
  return `<a href="${linkUrl(cfg, link)}" target="_blank" rel="noopener" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#1f4733;color:#ffffff;font:600 15px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;text-decoration:none">${label}</a>`;
}

/** The link as the API returns it. */
export function presentLink(cfg: PayConfig, store: Store, link: StoredLink, incoming: IncomingPayment[], now = Date.now()) {
  const avail = linkAvailability(store, link, now);
  return {
    id: link.id,
    url: linkUrl(cfg, link),
    qrUrl: `${linkUrl(cfg, link)}/qr.svg`,
    title: link.title,
    description: link.description ?? null,
    currency: link.currency,
    amount: link.amount ?? null,
    minAmount: link.minAmount ?? null,
    suggested: link.suggested ?? [],
    maxPayments: link.maxPayments ?? null,
    expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString() : null,
    active: link.active,
    available: avail.ok || avail.reason === "held",
    createdAt: new Date(link.createdAt).toISOString(),
    returnUrl: link.returnUrl ?? null,
    metadata: link.metadata ?? null,
    stats: linkStats(store, link, incoming, now),
    buttonHtml: buttonHtml(cfg, link),
  };
}
