/**
 * Payment requests as standard `monero:` URIs (the format Monero's own wallet2 reads and
 * writes: tx_amount, tx_description, recipient_name). A MonkStash payment link puts the URI
 * after the `#` of /pay, which browsers never send to a server, so the request stays between
 * the requester and the payer.
 */
import { addressInfo } from "./address";
import { fiatToAtomic } from "./invoice";
import { formatXmr, MAX_ATOMIC, parseXmr } from "./network";
import type { NetworkType } from "./network";

export interface PaymentRequestData {
  address: string;
  /** Atomic units; absent means "any amount". */
  amount?: bigint;
  /** What the payment is for. */
  note?: string;
  /** Who is asking (optional, shown to the payer). */
  name?: string;
}

/**
 * MonkStash-only extras, carried in the /pay link's #fragment as `ms_` parameters. Other wallets
 * ignore unknown parameters, and the QR code and "open in wallet" link leave them out entirely.
 */
export interface PaymentLinkExtras {
  /** After this (ms since epoch) the payer is told the request expired. */
  expiresAt?: number;
  /** The price the requester set in their currency, and the rate used to turn it into tx_amount. */
  fiat?: { currency: string; amount: string; rate: string };
  /** Where the payer can go back to after paying, e.g. the shop's order page. https only. */
  returnUrl?: string;
}

export const RETURN_URL_MAX = 300;

/** A safe return address: https (or http on localhost for development), no credentials. */
export function checkReturnUrl(input: string, allowLocalHttp = false): string | null {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }
  // Plain http only for a developer's own machine, and only when the caller asks (never in production).
  const local = allowLocalHttp && (u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]");
  if (!(u.protocol === "https:" || (u.protocol === "http:" && local))) return null;
  if (u.username || u.password) return null;
  const out = u.toString();
  return out.length <= RETURN_URL_MAX ? out : null;
}

export const NOTE_MAX = 120;
export const NAME_MAX = 60;

export class PaymentRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentRequestError";
  }
}

/** The network an address belongs to (read from its decoded prefix, checksum verified), or null if it is not a valid Monero address. */
export function addressNetwork(address: string): NetworkType | null {
  return addressInfo(address)?.network ?? null;
}

/** The ms_fiat value: CURRENCY:price:rate. Builder and parser share it so a link always reads back. */
const FIAT = /^([A-Z]{3}):(\d{1,12}(?:\.\d{1,2})?):(\d{1,15}(?:\.\d{1,12})?)$/;
/** Standard parameters that may appear once; a second copy makes the link ambiguous. */
const SINGLE_KEYS = new Set(["tx_amount", "tx_description", "recipient_name"]);

/** Cuts text to at most `max` code points, so an emoji is never split in half. */
function truncate(text: string, max: number): string {
  const points = Array.from(text);
  return points.length <= max ? text : points.slice(0, max).join("");
}

/** Builds a standard monero: URI. */
export function buildPaymentUri(r: PaymentRequestData): string {
  const address = r.address.trim();
  if (!addressNetwork(address)) throw new PaymentRequestError("That is not a valid Monero address.");
  const params: string[] = [];
  if (r.amount !== undefined) {
    if (r.amount <= 0n) throw new PaymentRequestError("The amount must be more than 0.");
    if (r.amount > MAX_ATOMIC) throw new PaymentRequestError("That amount is more than Monero can represent (18446744.073709551615 XMR).");
    params.push(`tx_amount=${formatXmr(r.amount)}`);
  }
  const note = r.note?.trim();
  if (note) {
    if (note.length > NOTE_MAX) throw new PaymentRequestError(`Keep the note under ${NOTE_MAX} characters.`);
    params.push(`tx_description=${encodeURIComponent(note)}`);
  }
  const name = r.name?.trim();
  if (name) {
    if (name.length > NAME_MAX) throw new PaymentRequestError(`Keep the name under ${NAME_MAX} characters.`);
    params.push(`recipient_name=${encodeURIComponent(name)}`);
  }
  return `monero:${address}${params.length ? `?${params.join("&")}` : ""}`;
}

/** The /pay link fragment: the standard URI plus MonkStash extras. */
export function buildPaymentFragment(r: PaymentRequestData & PaymentLinkExtras): string {
  const uri = buildPaymentUri(r);
  const extra: string[] = [];
  if (r.expiresAt !== undefined) extra.push(`ms_exp=${Math.floor(r.expiresAt / 1000)}`);
  if (r.fiat) {
    const value = `${r.fiat.currency}:${r.fiat.amount}:${r.fiat.rate}`;
    if (!FIAT.test(value)) throw new PaymentRequestError("The price must be a currency code and an amount like 12.50.");
    extra.push(`ms_fiat=${encodeURIComponent(value)}`);
  }
  if (r.returnUrl) {
    const ret = checkReturnUrl(r.returnUrl);
    if (!ret) throw new PaymentRequestError("The return address must be a full https:// link.");
    extra.push(`ms_ret=${encodeURIComponent(ret)}`);
  }
  if (!extra.length) return uri;
  return `${uri}${uri.includes("?") ? "&" : "?"}${extra.join("&")}`;
}

/** Parses a monero: URI (or the fragment of a /pay link). Unknown parameters are ignored. */
export function parsePaymentUri(input: string): PaymentRequestData & PaymentLinkExtras & { network: NetworkType } {
  let s = input.trim();
  if (s.startsWith("#")) s = s.slice(1);
  if (s.startsWith("pay=")) {
    try { s = decodeURIComponent(s.slice(4)); } catch { throw new PaymentRequestError("This payment link is damaged."); }
  }
  if (!/^monero:/i.test(s)) throw new PaymentRequestError("This is not a Monero payment link.");
  s = s.replace(/^monero:/i, "");
  const q = s.indexOf("?");
  const address = (q === -1 ? s : s.slice(0, q)).trim();
  const network = addressNetwork(address);
  if (!network) throw new PaymentRequestError("This payment link does not contain a valid Monero address.");

  const out: PaymentRequestData & PaymentLinkExtras & { network: NetworkType } = { address, network };
  if (q !== -1) {
    const seen = new Set<string>();
    for (const part of s.slice(q + 1).split("&")) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const key = part.slice(0, eq).toLowerCase();
      if (SINGLE_KEYS.has(key)) {
        // Two amounts (or notes, or names) in one link: refuse rather than guess which one counts.
        if (seen.has(key)) throw new PaymentRequestError("This payment link is damaged: it lists the same detail twice.");
        seen.add(key);
      }
      let value: string;
      try { value = decodeURIComponent(part.slice(eq + 1).replace(/\+/g, " ")); } catch { throw new PaymentRequestError("This payment link is damaged."); }
      if (key === "tx_amount") {
        const amount = parseXmr(value);
        if (amount === null || amount <= 0n) throw new PaymentRequestError("This payment link has an invalid amount.");
        out.amount = amount;
      } else if (key === "tx_description") {
        out.note = truncate(value, NOTE_MAX);
      } else if (key === "recipient_name") {
        out.name = truncate(value, NAME_MAX);
      } else if (key === "ms_exp") {
        // Extras are informational: a damaged one is dropped, never fatal.
        const sec = /^\d{9,11}$/.test(value) ? Number(value) : NaN;
        if (Number.isFinite(sec)) out.expiresAt = sec * 1000;
      } else if (key === "ms_fiat") {
        const m = FIAT.exec(value);
        if (m) out.fiat = { currency: m[1]!, amount: m[2]!, rate: m[3]! };
      } else if (key === "ms_ret") {
        const ret = checkReturnUrl(value);
        if (ret) out.returnUrl = ret;
      }
    }
  }
  // The fiat price is shown as the headline, but the wallet pays tx_amount. Keep it only when
  // the two agree, so a doctored link cannot show "10 EUR" while asking for far more XMR.
  if (out.fiat && (out.amount === undefined || !fiatAgrees(out.fiat, out.amount))) delete out.fiat;
  return out;
}

/** True when `amount` is the fiat price at the stated rate (within 0.5%, for rounding). */
function fiatAgrees(fiat: { amount: string; rate: string }, amount: bigint): boolean {
  try {
    const expected = fiatToAtomic(fiat.amount, fiat.rate);
    const diff = expected > amount ? expected - amount : amount - expected;
    return diff * 200n <= amount;
  } catch {
    return false;
  }
}

/** The shareable /pay link for a request. */
export function paymentLink(origin: string, uri: string): string {
  return `${origin.replace(/\/+$/, "")}/pay#${uri}`;
}
