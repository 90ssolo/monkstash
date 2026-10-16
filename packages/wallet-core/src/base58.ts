/**
 * Monero's Base58 address encoding (the cnBase58 block format): data is split into 8-byte
 * blocks, each written as 11 characters; a final partial block uses the length table below.
 * This is a text encoding, not cryptography. The engine re-validates any address it is given
 * against the wallet's keys, and test/mymonero.test.ts checks published addresses.
 */
import { keccak_256 } from "@noble/hashes/sha3.js";
import type { NetworkType } from "./network";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const FULL_BLOCK = 8;
/** Encoded length for a block of 0..8 bytes. */
const ENCODED_SIZES = [0, 2, 3, 5, 6, 7, 9, 10, 11];

function encodeBlock(block: Uint8Array): string {
  let n = 0n;
  for (const b of block) n = (n << 8n) | BigInt(b);
  const size = ENCODED_SIZES[block.length]!;
  const chars = new Array<string>(size).fill(ALPHABET[0]!);
  for (let i = size - 1; i >= 0 && n > 0n; i--) {
    chars[i] = ALPHABET[Number(n % 58n)]!;
    n /= 58n;
  }
  return chars.join("");
}

export function cnBase58Encode(data: Uint8Array): string {
  let out = "";
  for (let i = 0; i < data.length; i += FULL_BLOCK) out += encodeBlock(data.subarray(i, i + FULL_BLOCK));
  return out;
}

const DECODED_SIZE = new Map(ENCODED_SIZES.map((enc, bytes) => [enc, bytes] as const));

function decodeBlock(chunk: string): Uint8Array | null {
  const size = DECODED_SIZE.get(chunk.length);
  if (size === undefined || size === 0) return null;
  let n = 0n;
  for (const c of chunk) {
    const d = ALPHABET.indexOf(c);
    if (d < 0) return null;
    n = n * 58n + BigInt(d);
  }
  // The value must fit in the block's byte count (the reference decoder rejects overflow).
  if (n >> BigInt(size * 8) !== 0n) return null;
  const out = new Uint8Array(size);
  for (let i = size - 1; i >= 0; i--) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

/** Decodes cnBase58 text. Returns null if the text is not valid cnBase58 (bad character, length or block overflow). */
export function cnBase58Decode(text: string): Uint8Array | null {
  const ENC_FULL = ENCODED_SIZES[FULL_BLOCK]!;
  const parts: Uint8Array[] = [];
  for (let i = 0; i < text.length; i += ENC_FULL) {
    const block = decodeBlock(text.slice(i, i + ENC_FULL));
    if (!block) return null;
    parts.push(block);
  }
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

/** Standard (primary) address network prefixes. */
const PRIMARY_PREFIX: Record<NetworkType, number> = { mainnet: 18, testnet: 53, stagenet: 24 };

const fromHex = (h: string) => Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));

/** Builds a primary address from the public spend and view keys (hex). */
export function encodePrimaryAddress(network: NetworkType, publicSpendKey: string, publicViewKey: string): string {
  const body = new Uint8Array([PRIMARY_PREFIX[network], ...fromHex(publicSpendKey), ...fromHex(publicViewKey)]);
  if (body.length !== 65) throw new Error("Public keys must be 32 bytes each");
  const checksum = keccak_256(body).subarray(0, 4);
  return cnBase58Encode(new Uint8Array([...body, ...checksum]));
}
