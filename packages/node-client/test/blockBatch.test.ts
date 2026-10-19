import { describe, expect, it } from "vitest";
import { capBlockBatch } from "../src/blockBatch";

// A real getblocks.bin request from monero-ts 0.11.20 (throwaway stagenet wallet): block_ids,
// client, prune, requested_info, start_height.
const REAL = Uint8Array.from(Buffer.from("AREBAQEBAgEBFAlibG9ja19pZHMKAQFAn2jN3Y50s3RptBweYSUNgcV3a0ImT0FtXSfEYmOD7XbuPMmGRikiBs0+hvdNiLTcwdk3CIZF6bDLyoS3znTrBmNsaWVudApBAzM4OGY5YzE2ZmJhZGM0YmQxNzllYTgzNTZmN2NmZjBiZjY1MTdlZTViNzM3YWExZTk3ZTZlNzlhMjEwNjIzMjgwMDA2NWUzNTI3ZTQ2MGUwOGI5YWU0YTMzZTkwOWRiM2ViYjBmZmRlZDIyZGM5OWNhNmExNmZhNzE3YTlhMWMwYmVjMGZlMTMxNGZkZTgwZDc1OWU4ZWUzMGE3M2YwMDQyOTEwMmRlNGQzYWNiMjZmMDQxMTA5ODIzMTg1NTg1NDZkYzhmOWRiZDhmMDk0MDUFcHJ1bmULAQ5yZXF1ZXN0ZWRfaW5mbwgBDHN0YXJ0X2hlaWdodAUAAAAAAAAAAA==", "base64"));

type Field = string | number | bigint | boolean | Uint8Array;

/** Minimal reader for the root section of an epee request (only the scalar and blob types wallets send). */
function readRoot(b: Uint8Array): Map<string, Field> {
  const varint = (at: number) => {
    const size = 1 << (b[at]! & 3);
    let raw = 0;
    for (let i = size - 1; i >= 0; i--) raw = raw * 256 + b[at + i]!;
    return { value: Math.floor(raw / 4), size };
  };
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let at = 9;
  const count = varint(at);
  at += count.size;
  const out = new Map<string, Field>();
  for (let n = 0; n < count.value; n++) {
    const keyLen = b[at++]!;
    const key = new TextDecoder().decode(b.subarray(at, at + keyLen));
    at += keyLen;
    const type = b[at++]!;
    if (type === 5) { out.set(key, view.getBigUint64(at, true)); at += 8; }
    else if (type === 6) { out.set(key, view.getUint32(at, true)); at += 4; }
    else if (type === 8) { out.set(key, b[at]!); at += 1; }
    else if (type === 11) { out.set(key, b[at] !== 0); at += 1; }
    else if (type === 10) { const len = varint(at); at += len.size; out.set(key, b.subarray(at, at + len.value)); at += len.value; }
    else throw new Error(`unexpected type ${type} for ${key}`);
  }
  if (at !== b.length) throw new Error("trailing bytes");
  return out;
}

describe("capBlockBatch", () => {
  it("adds max_block_count and keeps every original field", () => {
    const before = readRoot(REAL);
    const after = readRoot(capBlockBatch(REAL, 100));
    expect(after.get("max_block_count")).toBe(100n);
    expect(after.size).toBe(before.size + 1);
    for (const [k, v] of before) expect(after.get(k)).toEqual(v);
  });

  it("keeps a batch size the wallet already chose", () => {
    const once = capBlockBatch(REAL, 50);
    expect(capBlockBatch(once, 100)).toBe(once);
    expect(readRoot(once).get("max_block_count")).toBe(50n);
  });

  it("re-encodes the entry count when it needs a wider varint", () => {
    // 63 entries fit a 1-byte varint; the 64th needs 2 bytes.
    const header = REAL.subarray(0, 9);
    const entries: number[] = [];
    for (let i = 0; i < 63; i++) entries.push(2, 0x61 + Math.floor(i / 10), 0x30 + (i % 10), 8, i);
    const body = Uint8Array.from([...header, 63 << 2, ...entries]);
    const after = readRoot(capBlockBatch(body, 100));
    expect(after.size).toBe(64);
    expect(after.get("max_block_count")).toBe(100n);
  });

  it("returns anything that is not an epee request unchanged", () => {
    const json = new TextEncoder().encode('{"jsonrpc":"2.0","method":"get_info"}');
    expect(capBlockBatch(json, 100)).toBe(json);
    expect(capBlockBatch(new Uint8Array(), 100)).toEqual(new Uint8Array());
    expect(capBlockBatch(REAL.subarray(0, 9), 100)).toEqual(REAL.subarray(0, 9));
  });

  it("ignores a nonsensical cap", () => {
    expect(capBlockBatch(REAL, 0)).toBe(REAL);
    expect(capBlockBatch(REAL, 1.5)).toBe(REAL);
  });
});
