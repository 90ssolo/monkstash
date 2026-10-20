/**
 * Caps how many blocks one getblocks.bin answer may hold.
 *
 * Why: wallet2 never sets the daemon's optional max_block_count field, so a node answers with as
 * many blocks as fit its size limit (about 450 recent mainnet blocks, 10 MB). The wallet can only
 * stop or save between batches, so a big batch means a Lock that waits many seconds for the scan
 * to let go, and a save that misses its time budget. Asking for fewer blocks per answer keeps
 * every stop and save point a few seconds apart. monerod 0.18 honours the field
 * (core_rpc_server.cpp, max_block_count).
 *
 * The request body is epee "portable storage": a 9-byte header, then the root section as a
 * varint entry count followed by entries (key length, key, type byte, value). The cap is added
 * as one more root entry. Anything unexpected returns the body unchanged, so the relay never
 * forwards a request it may have broken.
 */

/** Blocks per answer: a browser processes 100 recent mainnet blocks in about 2 s (measured 2026-10-19). */
export const BLOCKS_PER_ANSWER = 100;
/** The node endpoints that return block batches (both spellings monerod accepts). */
export const BLOCK_ENDPOINTS: ReadonlySet<string> = new Set(["get_blocks.bin", "getblocks.bin"]);

const SIGNATURE = [0x01, 0x11, 0x01, 0x01, 0x01, 0x01, 0x02, 0x01, 0x01] as const; // signature A, B, version 1
const HEADER_SIZE = SIGNATURE.length;
const TYPE_UINT64 = 5;
const KEY = new TextEncoder().encode("max_block_count");

/** Reads an epee varint (the low 2 bits give its width: 1, 2, 4 or 8 bytes). */
function readVarint(b: Uint8Array, at: number): { value: number; size: number } | null {
  const size = 1 << (b[at]! & 3);
  if (at + size > b.length) return null;
  let raw = 0;
  for (let i = size - 1; i >= 0; i--) raw = raw * 256 + b[at + i]!;
  return { value: Math.floor(raw / 4), size };
}

function writeVarint(value: number): Uint8Array {
  const size = value < 1 << 6 ? 1 : value < 1 << 14 ? 2 : value < 1 << 30 ? 4 : 0;
  if (!size) throw new RangeError("entry count too large");
  const raw = value * 4 + (size === 1 ? 0 : size === 2 ? 1 : 2);
  const out = new Uint8Array(size);
  for (let i = 0, v = raw; i < size; i++, v = Math.floor(v / 256)) out[i] = v % 256;
  return out;
}

/** True when the key (preceded by its length byte, as epee writes keys) occurs in `b`. */
function hasKey(b: Uint8Array, from: number): boolean {
  outer: for (let i = from; i + KEY.length < b.length; i++) {
    if (b[i] !== KEY.length) continue;
    for (let j = 0; j < KEY.length; j++) if (b[i + 1 + j] !== KEY[j]) continue outer;
    return true;
  }
  return false;
}

/** Returns a getblocks.bin request body that asks for at most `maxBlocks` blocks. */
export function capBlockBatch(body: Uint8Array<ArrayBuffer>, maxBlocks: number): Uint8Array<ArrayBuffer> {
  if (!Number.isInteger(maxBlocks) || maxBlocks < 1) return body;
  if (body.length <= HEADER_SIZE) return body;
  for (let i = 0; i < HEADER_SIZE; i++) if (body[i] !== SIGNATURE[i]) return body;
  // The wallet (or a newer wallet) already chose a batch size: keep its choice.
  if (hasKey(body, HEADER_SIZE)) return body;
  const count = readVarint(body, HEADER_SIZE);
  if (!count) return body;
  let newCount: Uint8Array;
  try {
    newCount = writeVarint(count.value + 1);
  } catch {
    return body;
  }
  const value = new Uint8Array(8);
  new DataView(value.buffer).setBigUint64(0, BigInt(maxBlocks), true);
  const rest = body.subarray(HEADER_SIZE + count.size);
  const out = new Uint8Array(HEADER_SIZE + newCount.length + rest.length + 1 + KEY.length + 1 + value.length);
  let at = 0;
  for (const part of [body.subarray(0, HEADER_SIZE), newCount, rest, Uint8Array.of(KEY.length), KEY, Uint8Array.of(TYPE_UINT64), value]) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
