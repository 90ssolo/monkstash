/**
 * The invoice engine shared by payment links, cashier mode and MonkStash Pay. It is pure:
 * no network, no storage, no clock (callers pass `now`), so the same rules run in the
 * browser and on a merchant's own server, and every edge case can be tested.
 *
 * An invoice is a fresh subaddress plus an amount due. Prices can be set in XMR, or in a
 * fiat currency converted at a quoted rate that stays locked until the invoice expires.
 * Payments are matched by subaddress, never by amount, so two orders for the same price
 * can never be confused.
 */
import { ATOMIC_UNITS } from "./network";

export class InvoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceError";
  }
}

// ---------------------------------------------------------------------------------------
// Decimal helpers. Money never touches floating point.

/** A non-negative decimal string as an integer scaled by 10^decimals. */
function scaled(value: string, maxDecimals: number, what: string): { n: bigint; d: number } {
  const s = value.trim().replace(",", ".");
  const m = /^(\d{1,15})(?:\.(\d+))?$/.exec(s);
  if (!m) throw new InvoiceError(`${what} must be a number, like 12.50.`);
  const frac = m[2] ?? "";
  if (frac.length > maxDecimals) throw new InvoiceError(`${what} can have at most ${maxDecimals} decimal places.`);
  return { n: BigInt(m[1]! + frac), d: frac.length };
}

const pow10 = (n: number) => 10n ** BigInt(n);

/** ISO 4217-style currency code, like USD or EUR. */
export function isCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

/** A rate: how much of `currency` one XMR buys, as a decimal string (e.g. "312.45"). */
export interface Quote {
  currency: string;
  rate: string;
  /** Where the rate came from, shown to the merchant (e.g. "Kraken"). */
  source?: string;
  /** When the rate was fetched (ms since epoch). */
  quotedAt: number;
}

export const FIAT_DECIMALS = 2;
const RATE_DECIMALS = 12;

/** Validates a quote and returns it normalized. Throws InvoiceError if unusable. */
export function checkQuote(q: Quote): Quote {
  if (!isCurrencyCode(q.currency)) throw new InvoiceError("Unknown currency.");
  const r = scaled(q.rate, RATE_DECIMALS, "The exchange rate");
  if (r.n === 0n) throw new InvoiceError("The exchange rate must be more than 0.");
  if (!Number.isFinite(q.quotedAt)) throw new InvoiceError("The exchange rate has no time.");
  return { ...q, rate: q.rate.trim().replace(",", ".") };
}

export const MAX_QUOTE_AGE_MS = 5 * 60_000;
/** A quote may look up to this much "from the future" (small clock differences). */
const QUOTE_FUTURE_SLACK_MS = 60_000;

/**
 * True if a quote of this age is fresh. Measure the age on the quote’s own clock (the price
 * server’s), for example server time minus quotedAt, so a device clock that is off by a few
 * minutes cannot make a fresh rate look stale (or a stale one look fresh).
 */
export function quoteAgeIsFresh(ageMs: number, maxAgeMs = MAX_QUOTE_AGE_MS): boolean {
  return Number.isFinite(ageMs) && ageMs >= -QUOTE_FUTURE_SLACK_MS && ageMs <= maxAgeMs;
}

/** True if the quote is younger than maxAgeMs at `now` (on the same clock as quotedAt). */
export function quoteIsFresh(q: Quote, now: number, maxAgeMs = MAX_QUOTE_AGE_MS): boolean {
  return quoteAgeIsFresh(now - q.quotedAt, maxAgeMs);
}

/**
 * Converts a fiat price to atomic XMR at the quoted rate, rounding UP to `roundTo` atomic
 * units (default 0.000001 XMR) so the merchant is never short-changed by rounding.
 */
export function fiatToAtomic(fiatAmount: string, rate: string, roundTo = 1_000_000n): bigint {
  const f = scaled(fiatAmount, 8, "The price");
  const r = scaled(rate, RATE_DECIMALS, "The exchange rate");
  if (r.n === 0n) throw new InvoiceError("The exchange rate must be more than 0.");
  if (roundTo < 1n) throw new InvoiceError("Rounding step must be at least 1.");
  // atomic = fiat / rate * 10^12, with both decimals scaled to integers.
  const num = f.n * pow10(r.d) * ATOMIC_UNITS;
  const den = r.n * pow10(f.d);
  const exact = (num + den - 1n) / den;
  return ((exact + roundTo - 1n) / roundTo) * roundTo;
}

/** Atomic XMR to fiat at the quoted rate, as a decimal string with 2 places (rounded half up). */
export function atomicToFiat(atomic: bigint, rate: string): string {
  const r = scaled(rate, RATE_DECIMALS, "The exchange rate");
  const cents = (atomic * r.n * pow10(FIAT_DECIMALS) * 2n + ATOMIC_UNITS * pow10(r.d)) / (ATOMIC_UNITS * pow10(r.d) * 2n);
  const s = cents.toString().padStart(FIAT_DECIMALS + 1, "0");
  return `${s.slice(0, -FIAT_DECIMALS)}.${s.slice(-FIAT_DECIMALS)}`;
}

// ---------------------------------------------------------------------------------------
// Confirmation policy.

/**
 * How many confirmations a payment needs before it counts as paid, by amount. Rules are
 * checked from the smallest `upTo` (inclusive, atomic units); anything above every rule
 * uses `otherwise`. 0 means "accept as soon as it is seen", which suits small in-person
 * sales; 10 matches when the coins become spendable.
 */
export interface ConfirmationPolicy {
  rules: { upTo: bigint; confirmations: number }[];
  otherwise: number;
}

export const MAX_CONFIRMATIONS = 60;

export const CONFIRMATION_PRESETS = {
  /** Coffee-shop speed: small sums accepted when seen, larger ones wait. */
  quick: { rules: [{ upTo: 100_000_000_000n, confirmations: 0 }, { upTo: 1_000_000_000_000n, confirmations: 1 }], otherwise: 10 },
  /** One block for everything, ten for large sums. */
  standard: { rules: [{ upTo: 5_000_000_000_000n, confirmations: 1 }], otherwise: 10 },
  /** Wait until the coins are spendable. */
  safe: { rules: [], otherwise: 10 },
} satisfies Record<string, ConfirmationPolicy>;

export function checkPolicy(p: ConfirmationPolicy): ConfirmationPolicy {
  const ok = (c: number) => Number.isInteger(c) && c >= 0 && c <= MAX_CONFIRMATIONS;
  if (!ok(p.otherwise) || p.rules.some((r) => !ok(r.confirmations) || r.upTo <= 0n)) {
    throw new InvoiceError(`Confirmations must be whole numbers from 0 to ${MAX_CONFIRMATIONS}.`);
  }
  return { rules: [...p.rules].sort((a, b) => (a.upTo < b.upTo ? -1 : a.upTo > b.upTo ? 1 : 0)), otherwise: p.otherwise };
}

/** Confirmations required for an amount (atomic). An "any amount" invoice uses `otherwise`. */
export function confirmationsFor(policy: ConfirmationPolicy, amount: bigint | undefined): number {
  if (amount === undefined) return policy.otherwise;
  for (const r of checkPolicy(policy).rules) if (amount <= r.upTo) return r.confirmations;
  return policy.otherwise;
}

// ---------------------------------------------------------------------------------------
// Invoices.

export interface Invoice {
  id: string;
  /** The subaddress this invoice owns; every payment to it belongs to this invoice. */
  subaddressIndex: number;
  address: string;
  /** Amount due in atomic units. Absent means "any amount". */
  amount?: bigint;
  /** Set when the price was in fiat: the original price and the locked rate. */
  fiat?: { currency: string; amount: string; rate: string; source?: string; quotedAt: number };
  /** Confirmations needed, fixed when the invoice is created. */
  confirmations: number;
  /** Underpayment the merchant forgives (atomic), e.g. for wallet rounding. */
  tolerance: bigint;
  createdAt: number;
  /** After this, the rate lock ends and new payments need review. Absent: never expires. */
  expiresAt?: number;
  note?: string;
  /** The merchant's own reference, e.g. an order number. */
  reference?: string;
}

export interface NewInvoice {
  id: string;
  subaddressIndex: number;
  address: string;
  now: number;
  price?: { xmr: bigint } | { fiat: string; quote: Quote };
  policy?: ConfirmationPolicy;
  /** Minutes until the invoice expires. Defaults to 15 for fiat prices; XMR prices never expire unless set. */
  expiresInMinutes?: number;
  tolerance?: bigint;
  note?: string;
  reference?: string;
  /** Max age of the quote when creating a fiat invoice. */
  maxQuoteAgeMs?: number;
  /**
   * The quote’s age measured on its own clock (e.g. server time minus quotedAt). When given,
   * freshness uses it instead of comparing quotedAt with `now`, which may come from a device
   * clock that is off.
   */
  quoteAgeMs?: number;
}

export const DEFAULT_FIAT_LOCK_MINUTES = 15;
export const MAX_INVOICE_MINUTES = 60 * 24 * 30;

/** Creates an invoice, validating everything. Throws InvoiceError with a user-facing message. */
export function createInvoice(n: NewInvoice): Invoice {
  if (!n.id) throw new InvoiceError("The invoice needs an id.");
  if (!Number.isInteger(n.subaddressIndex) || n.subaddressIndex < 1) {
    throw new InvoiceError("Each invoice needs its own subaddress (index 1 or higher).");
  }
  let amount: bigint | undefined;
  let fiat: Invoice["fiat"];
  if (n.price && "xmr" in n.price) {
    if (n.price.xmr <= 0n) throw new InvoiceError("The amount must be more than 0.");
    amount = n.price.xmr;
  } else if (n.price && "fiat" in n.price) {
    const q = checkQuote(n.price.quote);
    const fresh = n.quoteAgeMs !== undefined ? quoteAgeIsFresh(n.quoteAgeMs, n.maxQuoteAgeMs) : quoteIsFresh(q, n.now, n.maxQuoteAgeMs);
    if (!fresh) throw new InvoiceError("The exchange rate is out of date. Refresh it and try again.");
    const f = scaled(n.price.fiat, FIAT_DECIMALS, "The price");
    if (f.n === 0n) throw new InvoiceError("The price must be more than 0.");
    amount = fiatToAtomic(n.price.fiat, q.rate);
    fiat = { currency: q.currency, amount: n.price.fiat.trim().replace(",", "."), rate: q.rate, quotedAt: q.quotedAt, ...(q.source ? { source: q.source } : {}) };
  }
  const minutes = n.expiresInMinutes ?? (fiat ? DEFAULT_FIAT_LOCK_MINUTES : undefined);
  if (minutes !== undefined && (!Number.isFinite(minutes) || minutes <= 0 || minutes > MAX_INVOICE_MINUTES)) {
    throw new InvoiceError("Choose an expiry between 1 minute and 30 days.");
  }
  const tolerance = n.tolerance ?? 0n;
  if (tolerance < 0n || (amount !== undefined && tolerance >= amount)) throw new InvoiceError("The tolerance must be smaller than the amount.");
  const note = n.note?.trim();
  const reference = n.reference?.trim();
  if (note && note.length > 120) throw new InvoiceError("Keep the note under 120 characters.");
  if (reference && reference.length > 64) throw new InvoiceError("Keep the reference under 64 characters.");
  return {
    id: n.id,
    subaddressIndex: n.subaddressIndex,
    address: n.address,
    ...(amount !== undefined ? { amount } : {}),
    ...(fiat ? { fiat } : {}),
    confirmations: confirmationsFor(n.policy ?? CONFIRMATION_PRESETS.safe, amount),
    tolerance,
    createdAt: n.now,
    ...(minutes !== undefined ? { expiresAt: n.now + Math.round(minutes * 60_000) } : {}),
    ...(note ? { note } : {}),
    ...(reference ? { reference } : {}),
  };
}

/** One incoming payment to an invoice's subaddress, as the wallet reports it. */
export interface InvoicePayment {
  subaddressIndex: number;
  amount: bigint;
  confirmations: number;
  /** Still in the mempool (not in a block yet). */
  pending: boolean;
  hash: string;
  /**
   * When the payment was first seen (ms): the time the watcher first saw it, or its block's
   * time. If unknown after the invoice expired, it is treated as late, to be safe.
   */
  seenAt?: number;
  /** Sent with a custom unlock time, so it cannot be spent for a long time: never counts as paid. */
  locked?: boolean;
}

export type InvoiceStatus =
  /** Nothing received yet. */
  | { kind: "waiting" }
  /** Nothing received and the invoice expired. */
  | { kind: "expired" }
  /** Some arrived but not enough. `pending` means part is still unconfirmed. */
  | { kind: "partial"; received: bigint; remaining: bigint; pending: boolean; expired: boolean }
  /** Enough arrived; waiting for confirmations. */
  | { kind: "confirming"; received: bigint; confirmations: number; required: number; pending: boolean }
  /**
   * Done. `overpaid` > 0 when the customer sent more than due. Final: extra payments that arrive
   * afterwards are overpayment and never send it back to confirming.
   */
  | { kind: "paid"; received: bigint; overpaid: bigint; confirmations: number }
  /**
   * Payment arrived after expiry and the on-time payments were not enough. The rate lock has
   * ended, so the merchant decides whether to accept it.
   */
  | { kind: "late"; received: bigint; lateAmount: bigint; pending: boolean; confirmations: number };

/**
 * Payments seen this long before the invoice was created belong to something else (a reused
 * address) and never count towards it. The margin covers block timestamps, which can run
 * behind the clock.
 */
export const EARLY_PAYMENT_GRACE_MS = 60 * 60 * 1000;

/**
 * A payment first seen up to this long after `expiresAt` still counts as on time. It covers a
 * customer who pressed send in the last seconds, network propagation, and the watcher's sync
 * interval. The status turns `expired` at `expiresAt` all the same (so nobody is asked to pay
 * after it); callers that act on expiry, like cancelling an order, should wait for the grace
 * period to end first.
 */
export const EXPIRY_GRACE_MS = 3 * 60 * 1000;

/** True when an invoice with this status can no longer become paid on time at `now`. */
export function expiryIsFinal(inv: Invoice, now: number): boolean {
  return inv.expiresAt !== undefined && now >= inv.expiresAt + EXPIRY_GRACE_MS;
}

/** Works out an invoice's status from the incoming payments at time `now`. */
export function invoiceStatus(inv: Invoice, payments: InvoicePayment[], now: number): InvoiceStatus {
  const mine = payments.filter(
    (p) => p.subaddressIndex === inv.subaddressIndex && p.amount > 0n && !p.locked && !(p.seenAt !== undefined && p.seenAt < inv.createdAt - EARLY_PAYMENT_GRACE_MS),
  );
  const expired = inv.expiresAt !== undefined && now >= inv.expiresAt;
  const isLate = (p: InvoicePayment) =>
    inv.expiresAt !== undefined && (p.seenAt === undefined ? expiryIsFinal(inv, now) : p.seenAt >= inv.expiresAt + EXPIRY_GRACE_MS);
  const onTime = mine.filter((p) => !isLate(p));
  const late = mine.filter(isLate);
  const sum = (ps: InvoicePayment[]) => ps.reduce((s, p) => s + p.amount, 0n);
  const confs = (ps: InvoicePayment[]) => (ps.length ? Math.min(...ps.map((p) => (p.pending ? 0 : p.confirmations))) : 0);
  const received = sum(mine);

  if (!mine.length) return expired ? { kind: "expired" } : { kind: "waiting" };

  const target = inv.amount === undefined ? 1n : inv.amount - inv.tolerance;
  const onTimeSum = sum(onTime);

  if (onTimeSum < target) {
    if (late.length) return { kind: "late", received, lateAmount: sum(late), pending: late.some((p) => p.pending), confirmations: confs(late) };
    const remaining = (inv.amount ?? 0n) - onTimeSum;
    return { kind: "partial", received, remaining: remaining > 0n ? remaining : 0n, pending: onTime.some((p) => p.pending), expired };
  }

  // Enough arrived in time. Only the payments that brought the total up to the amount due must
  // meet the confirmation rule, taken in the order they were seen. Anything after that is extra
  // money: it is overpayment and never holds the order up or sends a paid invoice back to
  // confirming. Late payments never count here either.
  const ordered = onTime
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (a.p.seenAt ?? Infinity) - (b.p.seenAt ?? Infinity) || a.i - b.i)
    .map((x) => x.p);
  const counted: InvoicePayment[] = [];
  let running = 0n;
  for (const p of ordered) {
    counted.push(p);
    running += p.amount;
    if (running >= target) break;
  }
  const confirmations = confs(counted);
  const pending = counted.some((p) => p.pending);
  if (confirmations < inv.confirmations) {
    return { kind: "confirming", received, confirmations, required: inv.confirmations, pending };
  }
  const overpaid = inv.amount === undefined ? 0n : received - inv.amount;
  return { kind: "paid", received, overpaid: overpaid > 0n ? overpaid : 0n, confirmations };
}

// ---------------------------------------------------------------------------------------
// Storage and API form: bigints become decimal strings.

export interface InvoiceJson extends Omit<Invoice, "amount" | "tolerance"> {
  amount?: string;
  tolerance: string;
}

export function invoiceToJson(inv: Invoice): InvoiceJson {
  const { amount, tolerance, ...rest } = inv;
  return { ...rest, ...(amount !== undefined ? { amount: amount.toString() } : {}), tolerance: tolerance.toString() };
}

export function invoiceFromJson(j: InvoiceJson): Invoice {
  const int = (s: string, what: string) => {
    if (!/^\d{1,30}$/.test(s)) throw new InvoiceError(`Invalid ${what}.`);
    return BigInt(s);
  };
  const { amount, tolerance, ...rest } = j;
  return { ...rest, ...(amount !== undefined ? { amount: int(amount, "amount") } : {}), tolerance: int(tolerance ?? "0", "tolerance") };
}
