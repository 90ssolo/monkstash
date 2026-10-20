import { describe, expect, it } from "vitest";
import {
  checkAddressFormat, createTotpSecret, currentTotp, decryptJson, encryptJson,
  formatXmr, parseXmr, verifyTotp, VaultError,
} from "../src";

// Public donation address of the Monero General Fund (from getmonero.org); safe to use in tests.
const MAINNET_PRIMARY = "888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H";

describe("vault", () => {
  it("round-trips secrets with the right password", async () => {
    const v = await encryptJson({ seed: "abc", n: 1 }, "correct horse", 1000);
    expect(await decryptJson(v, "correct horse")).toEqual({ seed: "abc", n: 1 });
  });
  it("rejects a wrong password", async () => {
    const v = await encryptJson({ a: 1 }, "pw1", 1000);
    await expect(decryptJson(v, "pw2")).rejects.toMatchObject({ code: "WRONG_PASSWORD" });
  });
  it("detects tampering", async () => {
    const v = await encryptJson({ a: 1 }, "pw", 1000);
    const bytes = atob(v.data).split("");
    bytes[0] = String.fromCharCode(bytes[0]!.charCodeAt(0) ^ 1);
    await expect(decryptJson({ ...v, data: btoa(bytes.join("")) }, "pw")).rejects.toBeInstanceOf(VaultError);
  });
  it("uses a fresh salt and IV each time", async () => {
    const a = await encryptJson({ a: 1 }, "pw", 1000);
    const b = await encryptJson({ a: 1 }, "pw", 1000);
    expect(a.salt).not.toBe(b.salt);
    expect(a.iv).not.toBe(b.iv);
  });
});

describe("totp", () => {
  it("accepts the current code and rejects others", () => {
    const cfg = createTotpSecret();
    const now = Date.now();
    expect(verifyTotp(cfg, currentTotp(cfg, now), now)).toBe(true);
    expect(verifyTotp(cfg, "000000", now) && verifyTotp(cfg, "111111", now)).toBe(false);
    expect(verifyTotp(cfg, "12ab56", now)).toBe(false);
  });
  it("tolerates one step of clock drift but not more", () => {
    const cfg = createTotpSecret();
    const now = Date.now();
    expect(verifyTotp(cfg, currentTotp(cfg, now - 30_000), now)).toBe(true);
    expect(verifyTotp(cfg, currentTotp(cfg, now - 120_000), now)).toBe(false);
  });
});

describe("address format", () => {
  it("recognises a mainnet subaddress", () => {
    expect(checkAddressFormat(MAINNET_PRIMARY, "mainnet")).toEqual({ ok: true, kind: "subaddress" });
  });
  it("flags wrong network, length and characters", () => {
    expect(checkAddressFormat(MAINNET_PRIMARY, "stagenet").reason).toMatch(/mainnet/);
    expect(checkAddressFormat(MAINNET_PRIMARY.slice(1), "mainnet").ok).toBe(false);
    expect(checkAddressFormat(MAINNET_PRIMARY.replace("8", "0"), "mainnet").ok).toBe(false);
  });
});

describe("amounts", () => {
  it("formats and parses atomic units", () => {
    expect(formatXmr(1_500_000_000_000n)).toBe("1.5");
    expect(formatXmr(1n)).toBe("0.000000000001");
    expect(formatXmr(0n)).toBe("0");
    expect(parseXmr("1.5")).toBe(1_500_000_000_000n);
    expect(parseXmr("0,25")).toBe(250_000_000_000n);
    expect(parseXmr("1.0000000000001")).toBeNull();
    expect(parseXmr("-1")).toBeNull();
  });
});

import { estimateDateOfHeight, estimateHeightAt } from "../src";
describe("height estimate", () => {
  // Real block headers (mainnet), not used as anchors: each estimate must land at or before them.
  const REAL: [number, number][] = [
    [350000, 1418722232], // 2014-12, 60-second era
    [1004000, 1458388132], // days before the March 2016 block time change
    [1015000, 1459361996], // days after it
    [1550000, 1523589333],
    [2650000, 1655747917],
    [3750000, 1787914561],
  ];
  it("never starts after a real block from that date (with the default margin)", () => {
    for (const [height, ts] of REAL) expect(estimateHeightAt(new Date(ts * 1000))).toBeLessThanOrEqual(height);
  });
  it("is close to the real height with no margin", () => {
    for (const [height, ts] of REAL) expect(Math.abs(estimateHeightAt(new Date(ts * 1000), "mainnet", 0) - height)).toBeLessThan(2000);
  });
  it("handles the 60-second era correctly (2015 wallets)", () => {
    // 1 January 2015 lies between the anchors at 300,001 and 400,001. A fixed 120 s rule gave about 682,000.
    const h = estimateHeightAt(new Date(Date.UTC(2015, 0, 1)), "mainnet", 0);
    expect(h).toBeGreaterThan(300_001);
    expect(h).toBeLessThan(400_001);
  });
  it("moves about 720 blocks per day in the 120-second era, about 1440 before 2016", () => {
    const d = (y: number, m: number, day: number) => estimateHeightAt(new Date(Date.UTC(y, m, day)), "mainnet", 0);
    expect(Math.abs(d(2025, 0, 2) - d(2025, 0, 1) - 720)).toBeLessThan(15);
    expect(Math.abs(d(2015, 0, 2) - d(2015, 0, 1) - 1440)).toBeLessThan(40);
  });
  it("clamps to genesis and handles other networks", () => {
    expect(estimateHeightAt(new Date("2010-01-01"))).toBe(0);
    expect(estimateHeightAt(new Date(), "testnet")).toBe(0);
    expect(estimateHeightAt(new Date(Date.UTC(2026, 9, 10, 16, 30)), "stagenet", 0)).toBe(2_226_373);
  });
  it("converts a height back to roughly its date", () => {
    for (const [height, ts] of REAL) expect(Math.abs(estimateDateOfHeight(height).getTime() / 1000 - ts)).toBeLessThan(86_400);
  });
});

describe("sealed blobs (saved sync state)", () => {
  const SEED = "test seed words that are not a real wallet";
  const CTX = "wallet-id-1|addr-1";

  it("round-trips bytes with the right secret and context", async () => {
    const { sealBytes, openBytes } = await import("../src");
    const plain = new Uint8Array([1, 2, 3, 250, 0, 9]);
    const blob = await sealBytes(plain, SEED, CTX);
    expect(Array.from(await openBytes(blob, SEED, CTX))).toEqual(Array.from(plain));
  });
  it("rejects a different secret", async () => {
    const { sealBytes, openBytes } = await import("../src");
    const blob = await sealBytes(new Uint8Array([7]), SEED, CTX);
    await expect(openBytes(blob, SEED + " x", CTX)).rejects.toMatchObject({ code: "CORRUPT" });
  });
  it("rejects a blob sealed for another wallet (context binding)", async () => {
    const { sealBytes, openBytes } = await import("../src");
    const blob = await sealBytes(new Uint8Array([7]), SEED, CTX);
    await expect(openBytes(blob, SEED, "wallet-id-2|addr-2")).rejects.toMatchObject({ code: "CORRUPT" });
  });
  it("detects tampering", async () => {
    const { sealBytes, openBytes } = await import("../src");
    const blob = await sealBytes(new Uint8Array([1, 2, 3, 4]), SEED, CTX);
    const data = new Uint8Array(blob.data); data[0] = data[0]! ^ 1;
    await expect(openBytes({ ...blob, data }, SEED, CTX)).rejects.toMatchObject({ code: "CORRUPT" });
  });
  it("uses a fresh salt and IV each time", async () => {
    const { sealBytes } = await import("../src");
    const a = await sealBytes(new Uint8Array([1]), SEED, CTX);
    const b = await sealBytes(new Uint8Array([1]), SEED, CTX);
    expect(Array.from(a.salt)).not.toEqual(Array.from(b.salt));
    expect(Array.from(a.iv)).not.toEqual(Array.from(b.iv));
  });
  it("packs and unpacks parts, and rejects truncated data", async () => {
    const { packParts, unpackParts } = await import("../src");
    const parts = [new Uint8Array([1, 2]), new Uint8Array([]), new Uint8Array([3, 4, 5])];
    expect(unpackParts(packParts(parts)).map((p) => Array.from(p))).toEqual([[1, 2], [], [3, 4, 5]]);
    expect(() => unpackParts(packParts(parts).slice(0, 5))).toThrow();
  });
});
