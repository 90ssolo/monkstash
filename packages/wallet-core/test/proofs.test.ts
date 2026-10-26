import { describe, expect, it } from "vitest";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { assertSafeProofAddress, checkPaymentProof, formatFundsProof, formatPaymentProof, parseFundsProof, parsePaymentProof, ProofError } from "../src/proofs";
import { cnBase58Decode, cnBase58Encode } from "../src/base58";

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

describe("assertSafeProofAddress", () => {
  const OTHER = "44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A";
  /** The same view key as `of`, with a made-up spend key, as a subaddress. */
  function crafted(of: string): string {
    const keys = cnBase58Decode(of)!.subarray(1, 65);
    const body = new Uint8Array([42, ...new Uint8Array(32).fill(9), ...keys.subarray(32)]);
    return cnBase58Encode(new Uint8Array([...body, ...keccak_256(body).subarray(0, 4)]));
  }
  it("allows a normal recipient", () => {
    expect(() => assertSafeProofAddress(OTHER, ADDR)).not.toThrow();
  });
  it("refuses an address that carries our own view key", () => {
    expect(() => assertSafeProofAddress(crafted(ADDR), ADDR)).toThrow(/reuses your own wallet's view key/);
    expect(() => assertSafeProofAddress(` ${crafted(ADDR)} `, ADDR)).toThrow(ProofError);
  });
});

describe("proof of funds", () => {
  const RES = "ReserveProofV2Abc123xyz";
  it("round-trips through the shareable text", () => {
    const text = formatFundsProof({ address: ADDR, amount: 2_500_000_000_000n, signature: RES, message: "Trade 7" }, (a) => (Number(a) / 1e12).toString());
    expect(text).toContain("At least: 2.5 XMR");
    expect(parseFundsProof(text)).toEqual({ address: ADDR, signature: RES, message: "Trade 7" });
    expect(formatFundsProof({ address: ADDR, signature: RES }, String)).toContain("Covers: the whole wallet");
  });
  it("explains what is wrong", () => {
    expect(() => parseFundsProof(`Address: nope\nSigned proof: ${RES}`)).toThrow(/address/);
    expect(() => parseFundsProof(`Address: ${ADDR}\nSigned proof: OutProofV2abc`)).toThrow(/ReserveProofV2/);
  });
});
