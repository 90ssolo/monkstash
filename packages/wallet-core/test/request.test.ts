import { describe, expect, it } from "vitest";
import { addressNetwork, buildPaymentFragment, buildPaymentUri, checkReturnUrl, parsePaymentUri, paymentLink, PaymentRequestError } from "../src/request";

// A published mainnet address (from the MyMonero test vectors) and a stagenet one.
const MAIN = "48VWHdLTEpE5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx2vsrG7c";
const STAGE = "58hYNUFQtRL5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx32FhSVJ";

describe("payment requests", () => {
  it("builds a standard monero: URI with amount, note and name", () => {
    const uri = buildPaymentUri({ address: MAIN, amount: 250_000_000_000n, note: "Logo design & fonts", name: "Ana" });
    expect(uri).toBe(`monero:${MAIN}?tx_amount=0.25&tx_description=Logo%20design%20%26%20fonts&recipient_name=Ana`);
  });
  it("round-trips through parse", () => {
    const uri = buildPaymentUri({ address: MAIN, amount: 1_234_567_890_123n, note: "Rent: March #3?" });
    const p = parsePaymentUri(uri);
    expect(p).toMatchObject({ address: MAIN, amount: 1_234_567_890_123n, note: "Rent: March #3?", network: "mainnet" });
  });
  it("allows any amount", () => {
    expect(buildPaymentUri({ address: STAGE })).toBe(`monero:${STAGE}`);
    expect(parsePaymentUri(`monero:${STAGE}`)).toMatchObject({ address: STAGE, network: "stagenet" });
  });
  it("reads a /pay link fragment and the wallet's #pay= prefill", () => {
    const uri = buildPaymentUri({ address: MAIN, amount: 1_000_000_000_000n });
    const link = paymentLink("https://monkstash.com/", uri);
    expect(link).toBe(`https://monkstash.com/pay#${uri}`);
    expect(parsePaymentUri(new URL(link).hash).amount).toBe(1_000_000_000_000n);
    expect(parsePaymentUri(`#pay=${encodeURIComponent(uri)}`).address).toBe(MAIN);
  });
  it("detects the network from the address", () => {
    expect(addressNetwork(MAIN)).toBe("mainnet");
    expect(addressNetwork(STAGE)).toBe("stagenet");
    expect(addressNetwork("not-an-address")).toBeNull();
  });
  it("rejects bad input", () => {
    expect(() => buildPaymentUri({ address: "abc" })).toThrowError(PaymentRequestError);
    expect(() => buildPaymentUri({ address: MAIN, amount: 0n })).toThrowError(PaymentRequestError);
    expect(() => buildPaymentUri({ address: MAIN, note: "x".repeat(121) })).toThrowError(PaymentRequestError);
    expect(() => parsePaymentUri("bitcoin:abc")).toThrowError(PaymentRequestError);
    expect(() => parsePaymentUri(`monero:${MAIN}?tx_amount=-1`)).toThrowError(PaymentRequestError);
    expect(() => parsePaymentUri(`monero:${MAIN}?tx_amount=abc`)).toThrowError(PaymentRequestError);
    expect(() => parsePaymentUri("monero:4notanaddress")).toThrowError(PaymentRequestError);
  });
  it("caps long fields from untrusted links instead of trusting them", () => {
    const p = parsePaymentUri(`monero:${MAIN}?tx_description=${"a".repeat(500)}`);
    expect(p.note!.length).toBe(120);
  });
});

describe("payment request regressions", () => {
  it("keeps & and = inside a note when parsing a raw fragment", () => {
    const uri = buildPaymentUri({ address: MAIN, amount: 100_000_000_000n, note: "Logo design & fonts = done" });
    expect(parsePaymentUri(`#${uri}`).note).toBe("Logo design & fonts = done");
  });
});

describe("payment link extras", () => {
  const exp = Date.UTC(2026, 9, 16, 12, 0, 0);
  it("round-trips expiry, fiat price and return address", () => {
    const frag = buildPaymentFragment({
      address: MAIN, amount: 26_879_000_000n, note: "Order #42", name: "Corner Coffee",
      expiresAt: exp, fiat: { currency: "EUR", amount: "12.80", rate: "476.22" }, returnUrl: "https://shop.example/orders/42?paid=1",
    });
    expect(frag.startsWith(`monero:${MAIN}?tx_amount=0.026879&`)).toBe(true);
    const p = parsePaymentUri(`#${frag}`);
    expect(p).toMatchObject({
      amount: 26_879_000_000n, note: "Order #42", name: "Corner Coffee", expiresAt: exp,
      fiat: { currency: "EUR", amount: "12.80", rate: "476.22" }, returnUrl: "https://shop.example/orders/42?paid=1",
    });
  });
  it("carries a shop's invoice id, and drops a damaged one", () => {
    const frag = buildPaymentFragment({ address: MAIN, amount: 1_000_000_000_000n, invoiceId: "inv_Ab-12" });
    expect(frag).toBe(`monero:${MAIN}?tx_amount=1&ms_inv=inv_Ab-12`);
    expect(parsePaymentUri(frag).invoiceId).toBe("inv_Ab-12");
    expect(parsePaymentUri(`monero:${MAIN}?ms_inv=${encodeURIComponent("<b>x</b>")}`).invoiceId).toBeUndefined();
    expect(() => buildPaymentFragment({ address: MAIN, invoiceId: "a b" })).toThrow(PaymentRequestError);
  });
  it("leaves the standard URI untouched when there are no extras", () => {
    expect(buildPaymentFragment({ address: MAIN })).toBe(`monero:${MAIN}`);
    expect(buildPaymentFragment({ address: MAIN, expiresAt: exp })).toBe(`monero:${MAIN}?ms_exp=${exp / 1000}`);
  });
  it("only accepts safe return addresses", () => {
    expect(checkReturnUrl("https://shop.example/x")).toBe("https://shop.example/x");
    expect(checkReturnUrl("http://localhost:3000/x")).toBeNull();
    expect(checkReturnUrl("http://localhost:3000/x", true)).toBe("http://localhost:3000/x");
    expect(checkReturnUrl("http://example.com/x", true)).toBeNull();
    expect(checkReturnUrl("http://shop.example/x")).toBeNull();
    expect(checkReturnUrl("javascript:alert(1)")).toBeNull();
    expect(checkReturnUrl("https://user:pw@shop.example/")).toBeNull();
    expect(checkReturnUrl("https://shop.example/" + "a".repeat(400))).toBeNull();
    expect(() => buildPaymentFragment({ address: MAIN, returnUrl: "javascript:alert(1)" })).toThrow(PaymentRequestError);
  });
  it("drops a fiat headline that does not match the XMR amount", () => {
    // 12.80 EUR at 476.22 is 0.026879 XMR; a link asking for 1 XMR must not show "12.80 EUR".
    expect(parsePaymentUri(`monero:${MAIN}?tx_amount=1&ms_fiat=EUR%3A12.80%3A476.22`).fiat).toBeUndefined();
    expect(parsePaymentUri(`monero:${MAIN}?ms_fiat=EUR%3A12.80%3A476.22`).fiat).toBeUndefined();
    expect(parsePaymentUri(`monero:${MAIN}?tx_amount=0.026879&ms_fiat=EUR%3A12.80%3A476.22`).fiat).toMatchObject({ amount: "12.80" });
  });
  it("drops damaged extras instead of failing", () => {
    const p = parsePaymentUri(`monero:${MAIN}?tx_amount=1&ms_exp=soon&ms_fiat=EUR%3Aabc&ms_ret=${encodeURIComponent("javascript:alert(1)")}`);
    expect(p.amount).toBe(1_000_000_000_000n);
    expect(p.expiresAt).toBeUndefined();
    expect(p.fiat).toBeUndefined();
    expect(p.returnUrl).toBeUndefined();
  });
});
