import { describe, expect, it } from "vitest";
import { mergeHandedOut, MoveFileError, openMoveFile, readMoveHeader, sealMoveFile, type MovePayload } from "../src/move";

const SEED = "abbey abducts ability ablaze abnormal abort abrasive absorb abyss academy aces aching acidic acoustic acquire across actress acumen adapt addicted adept adhesive adjust adopt";
const ADDRESS = "4" + "A".repeat(94);

const payload = (over: Partial<MovePayload> = {}): MovePayload => ({
  primaryAddress: ADDRESS,
  network: "mainnet",
  kind: "full",
  restoreHeight: 3_700_000,
  height: 3_787_000,
  engine: { password: "engine-pw", keysData: Uint8Array.from([1, 2, 3]), cacheData: new Uint8Array(70_000).fill(9) },
  records: { addresses: { "0": 12, restored: 1 }, contacts: [{ name: "Shop", address: ADDRESS }] },
  ...over,
});
const expectFull = { primaryAddress: ADDRESS, network: "mainnet" as const, kind: "full" as const };

describe("move files", () => {
  it("round-trips the engine state and records", async () => {
    const file = await sealMoveFile(payload(), SEED, new Date("2026-10-19T12:00:00Z"));
    expect(readMoveHeader(file)).toEqual({ network: "mainnet", kind: "full", height: 3_787_000, savedAt: "2026-10-19T12:00:00.000Z" });
    const back = await openMoveFile(file, SEED, expectFull);
    expect(back.height).toBe(3_787_000);
    expect(back.restoreHeight).toBe(3_700_000);
    expect(back.engine.password).toBe("engine-pw");
    expect(Array.from(back.engine.keysData)).toEqual([1, 2, 3]);
    expect(back.engine.cacheData.length).toBe(70_000);
    expect(back.records).toEqual(payload().records);
  });

  it("does not open with another secret, address, network or wallet type", async () => {
    const file = await sealMoveFile(payload(), SEED);
    await expect(openMoveFile(file, SEED + " x", expectFull)).rejects.toThrow(MoveFileError);
    await expect(openMoveFile(file, SEED, { ...expectFull, primaryAddress: "4" + "B".repeat(94) })).rejects.toThrow(MoveFileError);
    await expect(openMoveFile(file, SEED, { ...expectFull, network: "stagenet" })).rejects.toThrow(/for mainnet/);
    await expect(openMoveFile(file, SEED, { ...expectFull, kind: "view-only" })).rejects.toThrow(/full wallet/);
  });

  it("rejects a changed file", async () => {
    const file = await sealMoveFile(payload(), SEED);
    const tampered = new Uint8Array(file);
    tampered[tampered.length - 5]! ^= 1;
    await expect(openMoveFile(tampered, SEED, expectFull)).rejects.toThrow(MoveFileError);
    // A header edited to claim another network (same length, so the layout still parses) is
    // caught by the sealed contents, which are bound to the real network.
    const raw = new TextDecoder("latin1").decode(file);
    const at = raw.indexOf('"network":"mainnet"') + '"network":"'.length;
    expect(at).toBeGreaterThan(10);
    const edited = new Uint8Array(file);
    edited.set(new TextEncoder().encode("testnet"), at);
    expect(readMoveHeader(edited).network).toBe("testnet");
    await expect(openMoveFile(edited, SEED, { ...expectFull, network: "testnet" })).rejects.toThrow(MoveFileError);
  });

  it("rejects files that are not move files", async () => {
    await expect(openMoveFile(new TextEncoder().encode("hello"), SEED, expectFull)).rejects.toThrow(/not a MonkStash move file/);
    expect(() => readMoveHeader(new Uint8Array())).toThrow(MoveFileError);
  });

  it("merges handed-out counters so no address is reused", () => {
    expect(mergeHandedOut({ "0": 5, "1": 9 }, { "0": 12, "2": 3, restored: 1 })).toEqual({ "0": 12, "1": 9, "2": 3, restored: 1 });
    expect(mergeHandedOut(null, { "0": 4 })).toEqual({ "0": 4 });
    expect(mergeHandedOut(null, undefined)).toBeNull();
  });
});
