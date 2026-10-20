import { describe, expect, it } from "vitest";
import { AMBIGUOUS_COMMA, MAX_ATOMIC, parseXmr, xmrAmountProblem } from "../src/network";
import { buildPaymentFragment, buildPaymentUri, parsePaymentUri, PaymentRequestError } from "../src/request";

const MAIN = "48VWHdLTEpE5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx2vsrG7c";

describe("parseXmr", () => {
  it("never reads a thousands separator as a decimal point", () => {
    expect(parseXmr("1,000")).toBeNull();
    expect(xmrAmountProblem("1,000")).toBe(AMBIGUOUS_COMMA);
    expect(parseXmr("1,000.50")).toBeNull();
    expect(parseXmr("1,000,000")).toBeNull();
    expect(parseXmr("12,345")).toBeNull();
  });
  it("still accepts a decimal comma that cannot be a thousands separator", () => {
    expect(parseXmr("1,5")).toBe(1_500_000_000_000n);
    expect(parseXmr("0,25")).toBe(250_000_000_000n);
    expect(xmrAmountProblem("0,25")).toBeNull();
  });
  it("caps amounts at 2^64 - 1 atomic units", () => {
    expect(parseXmr("18446744.073709551615")).toBe(MAX_ATOMIC);
    expect(parseXmr("18446744.073709551616")).toBeNull();
    expect(parseXmr("99999999999999999")).toBeNull();
    expect(xmrAmountProblem("99999999")).toMatch(/more than Monero/);
  });
  it("rejects other malformed input", () => {
    for (const s of ["", "-1", "+1", "1e-12", "0x10", "1 000", ".5", "1.0000000000001"]) expect(parseXmr(s)).toBeNull();
    expect(parseXmr(" 2 ")).toBe(2_000_000_000_000n);
  });
});

describe("payment request hardening", () => {
  it("refuses amounts Monero cannot represent", () => {
    expect(buildPaymentUri({ address: MAIN, amount: MAX_ATOMIC })).toContain("tx_amount=18446744.073709551615");
    expect(() => buildPaymentUri({ address: MAIN, amount: MAX_ATOMIC + 1n })).toThrowError(PaymentRequestError);
  });
  it("turns a damaged pay= prefill into a PaymentRequestError", () => {
    expect(() => parsePaymentUri("pay=%E0%A4%A")).toThrowError(PaymentRequestError);
  });
  it("validates the fiat price when building, with the parser's rules", () => {
    expect(() => buildPaymentFragment({ address: MAIN, amount: 1n, fiat: { currency: "usd", amount: "10", rate: "551.55" } })).toThrowError(PaymentRequestError);
    expect(() => buildPaymentFragment({ address: MAIN, amount: 1n, fiat: { currency: "USD", amount: "10.123", rate: "551.55" } })).toThrowError(PaymentRequestError);
    expect(() => buildPaymentFragment({ address: MAIN, amount: 1n, fiat: { currency: "USD", amount: "10", rate: "551.5512345678901" } })).toThrowError(PaymentRequestError);
  });
  it("refuses duplicate standard parameters", () => {
    expect(() => parsePaymentUri(`monero:${MAIN}?tx_amount=1&tx_amount=1000`)).toThrowError(PaymentRequestError);
    expect(() => parsePaymentUri(`monero:${MAIN}?tx_amount=1&TX_AMOUNT=1000`)).toThrowError(PaymentRequestError);
    expect(() => parsePaymentUri(`monero:${MAIN}?tx_description=a&tx_description=b`)).toThrowError(PaymentRequestError);
    expect(() => parsePaymentUri(`monero:${MAIN}?recipient_name=a&recipient_name=b`)).toThrowError(PaymentRequestError);
  });
  it("reads keys case-insensitively", () => {
    const p = parsePaymentUri(`MONERO:${MAIN}?TX_AMOUNT=5&Tx_Description=hi&RECIPIENT_NAME=Ana`);
    expect(p).toMatchObject({ amount: 5_000_000_000_000n, note: "hi", name: "Ana" });
  });
  it("rejects a thousands separator in tx_amount", () => {
    expect(() => parsePaymentUri(`monero:${MAIN}?tx_amount=1,000`)).toThrowError(PaymentRequestError);
  });
  it("truncates long notes without splitting an emoji", () => {
    const note = parsePaymentUri(`monero:${MAIN}?tx_description=${encodeURIComponent("a" + "\u{1F369}".repeat(200))}`).note!;
    expect(/[\uD800-\uDBFF]$/.test(note)).toBe(false);
    expect(Array.from(note).length).toBe(120);
  });
});
