import { describe, expect, it } from "vitest";
import {
  atomicToFiat,
  CONFIRMATION_PRESETS,
  confirmationsFor,
  createInvoice,
  EXPIRY_GRACE_MS,
  expiryIsFinal,
  fiatToAtomic,
  invoiceFromJson,
  invoiceStatus,
  invoiceToJson,
  InvoiceError,
  quoteAgeIsFresh,
  quoteIsFresh,
  type Invoice,
  type InvoicePayment,
} from "../src/invoice";

const XMR = 1_000_000_000_000n;
const T0 = Date.UTC(2026, 9, 15, 12, 0, 0);
const MIN = 60_000;
const ADDR = "8Bexample";

const base = { id: "inv1", subaddressIndex: 3, address: ADDR, now: T0 };
const pay = (amount: bigint, extra: Partial<InvoicePayment> = {}): InvoicePayment => ({
  subaddressIndex: 3, amount, confirmations: 0, pending: true, hash: "h" + amount, seenAt: T0 + MIN, ...extra,
});

describe("fiat conversion", () => {
  it("converts exactly and rounds up, never down", () => {
    // 10 EUR at 250 EUR/XMR = 0.04 XMR exactly.
    expect(fiatToAtomic("10", "250")).toBe(40_000_000_000n);
    // 10 at 300 = 0.0333... rounds UP to the next 0.000001 XMR.
    expect(fiatToAtomic("10", "300")).toBe(33_334_000_000n);
    expect(fiatToAtomic("10", "300", 1n)).toBe(33_333_333_334n);
    expect(fiatToAtomic("12,50", "312.45")).toBe(40_007_000_000n);
  });
  it("converts back for display, rounding half up to cents", () => {
    expect(atomicToFiat(40_000_000_000n, "250")).toBe("10.00");
    expect(atomicToFiat(33_334_000_000n, "300")).toBe("10.00");
    expect(atomicToFiat(XMR, "312.456")).toBe("312.46");
    expect(atomicToFiat(1n, "300")).toBe("0.00");
  });
  it("rejects junk and zero rates", () => {
    expect(() => fiatToAtomic("abc", "300")).toThrow(InvoiceError);
    expect(() => fiatToAtomic("1e3", "300")).toThrow(InvoiceError);
    expect(() => fiatToAtomic("-5", "300")).toThrow(InvoiceError);
    expect(() => fiatToAtomic("5", "0")).toThrow(InvoiceError);
  });
  it("checks quote freshness", () => {
    const q = { currency: "EUR", rate: "300", quotedAt: T0 };
    expect(quoteIsFresh(q, T0 + 4 * MIN)).toBe(true);
    expect(quoteIsFresh(q, T0 + 6 * MIN)).toBe(false);
    expect(quoteIsFresh(q, T0 - 5 * MIN)).toBe(false); // from the future: clock problem
  });
  it("judges a quote by its age on its own clock", () => {
    expect(quoteAgeIsFresh(0)).toBe(true);
    expect(quoteAgeIsFresh(5 * MIN)).toBe(true);
    expect(quoteAgeIsFresh(5 * MIN + 1)).toBe(false);
    expect(quoteAgeIsFresh(-MIN)).toBe(true);
    expect(quoteAgeIsFresh(-MIN - 1)).toBe(false);
    expect(quoteAgeIsFresh(Number.NaN)).toBe(false);
    expect(quoteAgeIsFresh(9 * MIN, 10 * MIN)).toBe(true);
  });
});

describe("device clock skew", () => {
  const quote = { currency: "EUR", rate: "250", quotedAt: T0 };
  it("a fresh quote works on a device whose clock runs 8 minutes fast, given its age on the server clock", () => {
    const deviceNow = T0 + 8 * MIN + 10_000;
    expect(() => createInvoice({ ...base, now: deviceNow, price: { fiat: "10", quote } })).toThrow(/out of date/);
    const inv = createInvoice({ ...base, now: deviceNow, quoteAgeMs: 10_000, price: { fiat: "10", quote } });
    expect(inv.amount).toBe(40_000_000_000n);
    expect(inv.createdAt).toBe(deviceNow);
  });
  it("a fresh quote works on a device whose clock runs 8 minutes slow", () => {
    const deviceNow = T0 - 8 * MIN;
    expect(() => createInvoice({ ...base, now: deviceNow, price: { fiat: "10", quote } })).toThrow(/out of date/);
    expect(createInvoice({ ...base, now: deviceNow, quoteAgeMs: 2_000, price: { fiat: "10", quote } }).fiat?.quotedAt).toBe(T0);
  });
  it("a stale quote is refused even when the device clock makes it look fresh", () => {
    const old = { ...quote, quotedAt: T0 - 20 * MIN };
    expect(() => createInvoice({ ...base, now: T0 - 18 * MIN, quoteAgeMs: 20 * MIN, price: { fiat: "10", quote: old } })).toThrow(/out of date/);
  });
  it("a request stamped by a fast device clock ignores a real payment; the corrected time counts it", () => {
    // The payment was mined 10 minutes after the request was really made.
    const blockTime = T0 + 10 * MIN;
    const payment = pay(XMR, { pending: false, confirmations: 12, seenAt: blockTime });
    const fast = createInvoice({ ...base, now: T0 + 3 * 60 * MIN, price: { xmr: XMR } });
    expect(invoiceStatus(fast, [payment], T0 + 3 * 60 * MIN + 20 * MIN).kind).toBe("waiting");
    const corrected = createInvoice({ ...base, now: T0, price: { xmr: XMR } });
    expect(invoiceStatus(corrected, [payment], T0 + 20 * MIN).kind).toBe("paid");
  });
});

describe("confirmation policy", () => {
  it("picks the rule for the amount", () => {
    const q = CONFIRMATION_PRESETS.quick;
    expect(confirmationsFor(q, XMR / 20n)).toBe(0);
    expect(confirmationsFor(q, XMR / 10n)).toBe(0); // upTo is inclusive
    expect(confirmationsFor(q, XMR / 2n)).toBe(1);
    expect(confirmationsFor(q, 3n * XMR)).toBe(10);
    expect(confirmationsFor(q, undefined)).toBe(10);
  });
  it("sorts rules and rejects bad values", () => {
    const p = { rules: [{ upTo: XMR, confirmations: 2 }, { upTo: XMR / 10n, confirmations: 0 }], otherwise: 10 };
    expect(confirmationsFor(p, XMR / 20n)).toBe(0);
    expect(() => confirmationsFor({ rules: [], otherwise: 61 }, XMR)).toThrow(InvoiceError);
    expect(() => confirmationsFor({ rules: [], otherwise: 1.5 }, XMR)).toThrow(InvoiceError);
  });
});

describe("creating invoices", () => {
  it("locks a fiat price at the quoted rate for 15 minutes by default", () => {
    const inv = createInvoice({ ...base, price: { fiat: "10", quote: { currency: "EUR", rate: "250", source: "Test", quotedAt: T0 - MIN } } });
    expect(inv.amount).toBe(40_000_000_000n);
    expect(inv.fiat).toMatchObject({ currency: "EUR", amount: "10", rate: "250", source: "Test" });
    expect(inv.expiresAt).toBe(T0 + 15 * MIN);
    expect(inv.confirmations).toBe(10);
  });
  it("XMR prices do not expire unless asked", () => {
    expect(createInvoice({ ...base, price: { xmr: XMR } }).expiresAt).toBeUndefined();
    expect(createInvoice({ ...base, price: { xmr: XMR }, expiresInMinutes: 60 }).expiresAt).toBe(T0 + 60 * MIN);
  });
  it("refuses stale quotes, the primary address, and bad input", () => {
    const stale = { currency: "EUR", rate: "250", quotedAt: T0 - 10 * MIN };
    expect(() => createInvoice({ ...base, price: { fiat: "10", quote: stale } })).toThrow(/out of date/);
    expect(() => createInvoice({ ...base, subaddressIndex: 0 })).toThrow(InvoiceError);
    expect(() => createInvoice({ ...base, price: { xmr: 0n } })).toThrow(InvoiceError);
    expect(() => createInvoice({ ...base, price: { fiat: "10.555", quote: { ...stale, quotedAt: T0 } } })).toThrow(InvoiceError);
    expect(() => createInvoice({ ...base, price: { fiat: "10", quote: { currency: "eur", rate: "1", quotedAt: T0 } } })).toThrow(InvoiceError);
    expect(() => createInvoice({ ...base, price: { xmr: XMR }, tolerance: XMR })).toThrow(InvoiceError);
    expect(() => createInvoice({ ...base, expiresInMinutes: 0 })).toThrow(InvoiceError);
  });
  it("uses the policy for the amount", () => {
    const inv = createInvoice({ ...base, price: { xmr: XMR / 20n }, policy: CONFIRMATION_PRESETS.quick });
    expect(inv.confirmations).toBe(0);
  });
});

describe("invoice status", () => {
  const inv: Invoice = createInvoice({ ...base, price: { xmr: XMR }, expiresInMinutes: 15, policy: CONFIRMATION_PRESETS.standard });

  it("waits, then expires", () => {
    expect(invoiceStatus(inv, [], T0)).toEqual({ kind: "waiting" });
    expect(invoiceStatus(inv, [], T0 + 15 * MIN)).toEqual({ kind: "expired" });
  });
  it("ignores other subaddresses (matched by subaddress, never by amount)", () => {
    expect(invoiceStatus(inv, [pay(XMR, { subaddressIndex: 4 })], T0)).toEqual({ kind: "waiting" });
  });
  it("ignores payments from long before the invoice existed (a reused address)", () => {
    const old = pay(XMR, { pending: false, confirmations: 50, seenAt: T0 - 3 * 60 * MIN });
    expect(invoiceStatus(inv, [old], T0 + MIN)).toEqual({ kind: "waiting" });
    // Block times can run a little behind: a payment stamped shortly before creation still counts.
    const close = pay(XMR, { pending: false, confirmations: 50, seenAt: T0 - 10 * MIN });
    expect(invoiceStatus(inv, [close], T0 + MIN)).toMatchObject({ kind: "paid" });
  });
  it("tracks partial payments and what is left", () => {
    expect(invoiceStatus(inv, [pay(XMR / 4n)], T0 + 2 * MIN)).toMatchObject({ kind: "partial", remaining: (XMR * 3n) / 4n, pending: true, expired: false });
  });
  it("confirms, then pays, adding up split payments", () => {
    const ps = [pay(XMR / 2n, { pending: false, confirmations: 3 }), pay(XMR / 2n)];
    expect(invoiceStatus(inv, ps, T0 + 2 * MIN)).toMatchObject({ kind: "confirming", confirmations: 0, required: 1, pending: true });
    ps[1] = pay(XMR / 2n, { pending: false, confirmations: 1 });
    expect(invoiceStatus(inv, ps, T0 + 4 * MIN)).toMatchObject({ kind: "paid", received: XMR, overpaid: 0n, confirmations: 1 });
  });
  it("accepts at 0 confirmations when the policy says so", () => {
    const small = createInvoice({ ...base, price: { xmr: XMR / 20n }, policy: CONFIRMATION_PRESETS.quick });
    expect(invoiceStatus(small, [pay(XMR / 20n)], T0 + MIN)).toMatchObject({ kind: "paid", confirmations: 0 });
  });
  it("reports overpayment", () => {
    expect(invoiceStatus(inv, [pay(XMR + XMR / 10n, { pending: false, confirmations: 2 })], T0 + 2 * MIN)).toMatchObject({ kind: "paid", overpaid: XMR / 10n });
  });
  it("forgives the tolerance", () => {
    const tol = createInvoice({ ...base, price: { xmr: XMR }, tolerance: 1_000_000n, policy: CONFIRMATION_PRESETS.standard });
    expect(invoiceStatus(tol, [pay(XMR - 1_000_000n, { pending: false, confirmations: 1 })], T0)).toMatchObject({ kind: "paid", overpaid: 0n });
  });
  it("flags payments after expiry for review instead of marking them paid", () => {
    const late = pay(XMR, { seenAt: T0 + 20 * MIN, pending: false, confirmations: 5 });
    expect(invoiceStatus(inv, [late], T0 + 30 * MIN)).toMatchObject({ kind: "late", lateAmount: XMR });
    // Partly on time, topped up late: still needs review.
    expect(invoiceStatus(inv, [pay(XMR / 2n, { pending: false, confirmations: 5 }), late], T0 + 30 * MIN).kind).toBe("late");
  });
  it("treats an unknown arrival time after expiry and grace as late, to be safe", () => {
    expect(invoiceStatus(inv, [pay(XMR, { seenAt: undefined, pending: false, confirmations: 3 })], T0 + 19 * MIN).kind).toBe("late");
    expect(invoiceStatus(inv, [pay(XMR, { seenAt: undefined, pending: false, confirmations: 3 })], T0 + 16 * MIN).kind).toBe("paid");
    expect(invoiceStatus(inv, [pay(XMR, { seenAt: undefined, pending: false, confirmations: 3 })], T0 + 5 * MIN).kind).toBe("paid");
  });
  it("counts a payment seen within the grace period after expiry as on time", () => {
    expect(EXPIRY_GRACE_MS).toBe(3 * MIN);
    const expiresAt = inv.expiresAt!;
    const justAfter = pay(XMR, { seenAt: expiresAt + EXPIRY_GRACE_MS - 1, pending: false, confirmations: 1 });
    expect(invoiceStatus(inv, [justAfter], expiresAt + 10 * MIN)).toMatchObject({ kind: "paid" });
    const tooLate = pay(XMR, { seenAt: expiresAt + EXPIRY_GRACE_MS, pending: false, confirmations: 1 });
    expect(invoiceStatus(inv, [tooLate], expiresAt + 10 * MIN)).toMatchObject({ kind: "late" });
    // The page still says expired the moment the hold ends; the grace only decides lateness.
    expect(invoiceStatus(inv, [], expiresAt + MIN)).toEqual({ kind: "expired" });
    expect(expiryIsFinal(inv, expiresAt + MIN)).toBe(false);
    expect(expiryIsFinal(inv, expiresAt + EXPIRY_GRACE_MS)).toBe(true);
    expect(expiryIsFinal(createInvoice({ ...base, price: { xmr: XMR } }), T0 + 1000 * MIN)).toBe(false);
  });
  it("reports confirmations and pending for late payments", () => {
    const late = pay(XMR, { seenAt: T0 + 20 * MIN, pending: false, confirmations: 4 });
    expect(invoiceStatus(inv, [late], T0 + 30 * MIN)).toMatchObject({ kind: "late", confirmations: 4, pending: false });
    const latePending = pay(XMR, { seenAt: T0 + 20 * MIN, hash: "lp" });
    expect(invoiceStatus(inv, [latePending], T0 + 30 * MIN)).toMatchObject({ kind: "late", confirmations: 0, pending: true });
  });
  it("on-time payment stays paid even if more arrives late", () => {
    const ps = [pay(XMR, { pending: false, confirmations: 2 }), pay(XMR / 10n, { seenAt: T0 + 20 * MIN })];
    expect(invoiceStatus(inv, ps, T0 + 30 * MIN)).toMatchObject({ kind: "paid", overpaid: XMR / 10n });
  });
  it("paid is final: a tiny extra payment does not send it back to confirming", () => {
    const first = pay(XMR, { pending: false, confirmations: 3, seenAt: T0 + MIN, hash: "a" });
    const extra = pay(1000n, { pending: true, confirmations: 0, seenAt: T0 + 5 * MIN, hash: "b" });
    expect(invoiceStatus(inv, [first], T0 + 6 * MIN)).toMatchObject({ kind: "paid", confirmations: 3 });
    expect(invoiceStatus(inv, [first, extra], T0 + 6 * MIN)).toMatchObject({ kind: "paid", overpaid: 1000n, confirmations: 3 });
    // Order in the list does not matter; the order they were seen in does.
    expect(invoiceStatus(inv, [extra, first], T0 + 6 * MIN)).toMatchObject({ kind: "paid", overpaid: 1000n });
  });
  it("split payments: only the ones needed to reach the amount must confirm", () => {
    const a = pay(XMR / 2n, { pending: false, confirmations: 2, seenAt: T0 + MIN, hash: "a" });
    const b = pay(XMR / 2n, { pending: true, seenAt: T0 + 2 * MIN, hash: "b" });
    const c = pay(XMR / 10n, { pending: true, seenAt: T0 + 3 * MIN, hash: "c" });
    expect(invoiceStatus(inv, [a, b, c], T0 + 4 * MIN)).toMatchObject({ kind: "confirming", confirmations: 0, pending: true });
    const b2 = { ...b, pending: false, confirmations: 1 };
    expect(invoiceStatus(inv, [a, b2, c], T0 + 4 * MIN)).toMatchObject({ kind: "paid", overpaid: XMR / 10n, confirmations: 1 });
  });
  it("drops back to waiting when an unconfirmed payment disappears", () => {
    const small = createInvoice({ ...base, price: { xmr: XMR / 20n }, policy: CONFIRMATION_PRESETS.quick });
    expect(invoiceStatus(small, [pay(XMR / 20n)], T0 + MIN)).toMatchObject({ kind: "paid" });
    expect(invoiceStatus(small, [], T0 + 2 * MIN)).toEqual({ kind: "waiting" });
  });
  it("any-amount invoices are paid by any payment, with the strictest confirmation rule", () => {
    const any = createInvoice({ ...base, policy: CONFIRMATION_PRESETS.standard });
    expect(any.confirmations).toBe(10);
    expect(invoiceStatus(any, [pay(5n, { pending: false, confirmations: 1 })], T0)).toMatchObject({ kind: "confirming", required: 10 });
    expect(invoiceStatus(any, [pay(5n, { pending: false, confirmations: 10 })], T0)).toMatchObject({ kind: "paid", overpaid: 0n });
  });
  it("partial after expiry says expired", () => {
    expect(invoiceStatus(inv, [pay(XMR / 4n, { pending: false, confirmations: 2 })], T0 + 20 * MIN)).toMatchObject({ kind: "partial", expired: true });
  });
});

describe("json form", () => {
  it("round-trips and rejects tampered numbers", () => {
    const inv = createInvoice({ ...base, price: { fiat: "9.99", quote: { currency: "USD", rate: "301.2", quotedAt: T0 } }, reference: "Order 42" });
    const j = invoiceToJson(inv);
    expect(typeof j.amount).toBe("string");
    expect(JSON.parse(JSON.stringify(j))).toEqual(j);
    expect(invoiceFromJson(JSON.parse(JSON.stringify(j)))).toEqual(inv);
    expect(() => invoiceFromJson({ ...j, amount: "-1" })).toThrow(InvoiceError);
  });
});
