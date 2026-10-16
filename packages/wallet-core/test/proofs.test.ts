import { describe, expect, it } from "vitest";
import { checkPaymentProof, formatPaymentProof, parsePaymentProof, ProofError } from "../src/proofs";

const HASH = "a".repeat(64);
const KEY = "0b".repeat(32);
const ADDR = "48VWHdLTEpE5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx2vsrG7c";
const SIG = "OutProofV2Lcym7sjHGT1C5pT4VGoxgXrsqqvqYfjW3sVKxJ2T9Yx";

describe("payment proofs", () => {
  it("round-trips through the shareable text", () => {
    const text = formatPaymentProof({ txHash: HASH, address: ADDR, txKey: KEY, signature: SIG, message: "Order #42: logo" });
    expect(text.split("\n")[0]).toBe("Monero payment proof");
    expect(parsePaymentProof(text)).toEqual({ txHash: HASH, address: ADDR, txKey: KEY, signature: SIG, message: "Order #42: logo" });
  });
  it("reads loose pastes from other wallets", () => {
    const p = parsePaymentProof(`  TXID:  ${HASH.toUpperCase()}\nRecipient: ${ADDR}\nTx key: ${KEY.toUpperCase()}\nthanks!`);
    expect(p).toEqual({ txHash: HASH, address: ADDR, txKey: KEY });
  });
  it("accepts transaction keys with extra subaddress keys", () => {
    expect(checkPaymentProof({ txHash: HASH, address: ADDR, txKey: KEY + "cd".repeat(32) }).txKey).toHaveLength(128);
  });
  it("explains what is wrong", () => {
    expect(() => checkPaymentProof({ txHash: "abc", address: ADDR, txKey: KEY })).toThrow(/64 letters/);
    expect(() => checkPaymentProof({ txHash: HASH, address: "nope", txKey: KEY })).toThrow(/not a valid Monero address/);
    expect(() => checkPaymentProof({ txHash: HASH, address: ADDR })).toThrow(/transaction key or the signed proof/);
    expect(() => checkPaymentProof({ txHash: HASH, address: ADDR, txKey: "xyz" })).toThrow(ProofError);
    expect(() => checkPaymentProof({ txHash: HASH, address: ADDR, signature: "hello" })).toThrow(/OutProofV2/);
    expect(() => parsePaymentProof("just some text")).toThrow(/does not look like a payment proof/);
  });
});
