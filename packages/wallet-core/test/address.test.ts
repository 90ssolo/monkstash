import { describe, expect, it } from "vitest";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { addressInfo, checkAddressFormat, cnBase58Decode, cnBase58Encode } from "../src";
import { addressNetwork } from "../src/request";

// Published addresses only (no seeds): the Monero General Fund donation addresses from getmonero.org,
// the MyMonero test vector, and the stagenet address used across these tests.
const GENERAL_FUND = "44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A";
const GENERAL_FUND_SUB = "888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H";
const MAIN = "48VWHdLTEpE5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx2vsrG7c";
const STAGE = "58hYNUFQtRL5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx32FhSVJ";

/** Re-encodes the keys of a real address under another network byte (and optional payment id). */
function reencode(address: string, prefix: number, paymentId?: Uint8Array): string {
  const keys = cnBase58Decode(address)!.subarray(1, 65);
  const body = new Uint8Array([prefix, ...keys, ...(paymentId ?? [])]);
  return cnBase58Encode(new Uint8Array([...body, ...keccak_256(body).subarray(0, 4)]));
}
const PID = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);

const swapChar = (s: string, i: number) => {
  const c = s[i]!;
  const r = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
  return s.slice(0, i) + r + s.slice(i + 1);
};

describe("cnBase58", () => {
  it("decodes what it encodes, including partial blocks", () => {
    for (const len of [0, 1, 5, 8, 9, 69, 77]) {
      const data = Uint8Array.from({ length: len }, (_, i) => (i * 37 + 11) & 0xff);
      expect(cnBase58Decode(cnBase58Encode(data))).toEqual(data);
    }
  });
  it("decodes a real address to 69 bytes with the mainnet prefix and rejects bad blocks", () => {
    const b = cnBase58Decode(GENERAL_FUND)!;
    expect(b.length).toBe(69);
    expect(b[0]).toBe(18);
    expect(cnBase58Decode("zzzzzzzzzzz")).toBeNull(); // overflows 8 bytes
    expect(cnBase58Decode("1111")).toBeNull(); // 4 is not a valid partial block length
    expect(cnBase58Decode("0OIl")).toBeNull();
  });
});

describe("address validation", () => {
  it("accepts real published addresses with the right kind and network", () => {
    expect(checkAddressFormat(GENERAL_FUND, "mainnet")).toEqual({ ok: true, kind: "primary" });
    expect(checkAddressFormat(GENERAL_FUND_SUB, "mainnet")).toEqual({ ok: true, kind: "subaddress" });
    expect(checkAddressFormat(MAIN, "mainnet")).toEqual({ ok: true, kind: "primary" });
    expect(checkAddressFormat(STAGE, "stagenet")).toEqual({ ok: true, kind: "primary" });
    expect(checkAddressFormat(`  ${GENERAL_FUND}\n`, "mainnet").ok).toBe(true);
  });

  it("reads network and kind from the decoded prefix for every address type", () => {
    const table: [number, string, string, boolean][] = [
      [18, "mainnet", "primary", false], [42, "mainnet", "subaddress", false], [19, "mainnet", "integrated", true],
      [53, "testnet", "primary", false], [63, "testnet", "subaddress", false], [54, "testnet", "integrated", true],
      [24, "stagenet", "primary", false], [36, "stagenet", "subaddress", false], [25, "stagenet", "integrated", true],
    ];
    for (const [prefix, network, kind, integrated] of table) {
      const a = reencode(GENERAL_FUND, prefix, integrated ? PID : undefined);
      expect(a.length).toBe(integrated ? 106 : 95);
      expect(addressInfo(a)).toEqual({ network, kind });
      expect(addressNetwork(a)).toBe(network);
      expect(checkAddressFormat(a, network as "mainnet")).toEqual({ ok: true, kind });
      const other = network === "mainnet" ? "stagenet" : "mainnet";
      expect(checkAddressFormat(a, other).reason).toBe(`This looks like a ${network} address`);
    }
  });

  it("does not treat a stagenet or testnet integrated address as mainnet", () => {
    expect(addressNetwork(reencode(STAGE, 25, PID))).toBe("stagenet");
    expect(addressNetwork(reencode(STAGE, 54, PID))).toBe("testnet");
    expect(checkAddressFormat(reencode(STAGE, 25, PID), "mainnet").ok).toBe(false);
  });

  it("rejects one-character typos through the checksum", () => {
    const last = GENERAL_FUND.slice(0, -1) + (GENERAL_FUND.endsWith("A") ? "B" : "A");
    expect(checkAddressFormat(last, "mainnet").ok).toBe(false);
    expect(checkAddressFormat(swapChar(GENERAL_FUND, 40), "mainnet").ok).toBe(false);
    expect(checkAddressFormat(swapChar(MAIN, 10), "mainnet").ok).toBe(false);
    expect(checkAddressFormat(swapChar(STAGE, 60), "stagenet").ok).toBe(false);
    expect(addressNetwork(last)).toBeNull();
    const integrated = reencode(GENERAL_FUND, 19, PID);
    expect(checkAddressFormat(swapChar(integrated, 100), "mainnet").ok).toBe(false);
  });

  it("rejects strings that only look like addresses", () => {
    expect(checkAddressFormat("4" + "1".repeat(94), "mainnet").ok).toBe(false);
    expect(checkAddressFormat("1".repeat(106), "mainnet").ok).toBe(false);
    expect(checkAddressFormat("z".repeat(106), "mainnet").ok).toBe(false);
    for (const n of ["mainnet", "stagenet", "testnet"] as const) expect(checkAddressFormat("1".repeat(106), n).ok).toBe(false);
    expect(addressNetwork("1".repeat(106))).toBeNull();
    // A 95-character body with an integrated prefix (or the reverse) has the wrong length.
    expect(checkAddressFormat(reencode(GENERAL_FUND, 19), "mainnet").ok).toBe(false);
    expect(checkAddressFormat(reencode(GENERAL_FUND, 18, PID), "mainnet").ok).toBe(false);
    // An unknown network byte with a valid checksum.
    expect(checkAddressFormat(reencode(GENERAL_FUND, 17), "mainnet").reason).toBe("Unknown address prefix");
  });

  it("rejects wrong lengths, bad characters and empty input", () => {
    expect(checkAddressFormat(GENERAL_FUND.slice(0, 94), "mainnet").reason).toMatch(/95 characters/);
    expect(checkAddressFormat(GENERAL_FUND + "a", "mainnet").ok).toBe(false);
    expect(checkAddressFormat(GENERAL_FUND.slice(0, 40) + " " + GENERAL_FUND.slice(40), "mainnet").ok).toBe(false);
    expect(checkAddressFormat(GENERAL_FUND.replace("4", "0"), "mainnet").ok).toBe(false);
    expect(checkAddressFormat("", "mainnet").reason).toBe("Enter an address");
    expect(checkAddressFormat("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", "mainnet").ok).toBe(false);
  });
});
