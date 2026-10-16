/**
 * MyMonero 13-word recovery phrases.
 *
 * MyMonero (shut down January 2026) used a shorter, older seed format that standard Monero
 * wallets cannot read:
 *   - 12 data words plus 1 checksum word from Monero's English list encode a 16-byte seed
 *     (the same 3-words-per-4-bytes scheme as the 25-word format, just shorter).
 *   - private spend key = sc_reduce32(keccak256(seed16))
 *   - private view key  = sc_reduce32(keccak256(keccak256(seed16)))
 *     Note the view key hashes the *unreduced* first hash. Standard wallets hash the reduced
 *     spend key instead, which is why they derive a different (wrong) view key and address.
 *
 * Primitives: Keccak-256 from @noble/hashes (audited); sc_reduce32 is the standard reduction
 * of a 32-byte little-endian integer modulo the ed25519 group order. Verified against three
 * published MyMonero vectors in test/mymonero.test.ts.
 *
 * Runs once per restore on secrets in memory; nothing here is stored or sent anywhere.
 */
import { keccak_256 } from "@noble/hashes/sha3.js";
import { ENGLISH_WORDS } from "./wordlist-english";

const PREFIX = 3;
const N = ENGLISH_WORDS.length; // 1626
/** ed25519 group order l = 2^252 + 27742317777372353535851937790883648493 */
const L = (1n << 252n) + 27742317777372353535851937790883648493n;

let prefixIndex: Map<string, number> | null = null;
function indexOfWord(word: string): number {
  if (!prefixIndex) {
    prefixIndex = new Map(ENGLISH_WORDS.map((w, i) => [w.slice(0, PREFIX), i]));
  }
  // Monero matches words by their unique prefix, so "abbe" and "abbey" both resolve.
  return prefixIndex.get(word.slice(0, PREFIX)) ?? -1;
}

export class MyMoneroPhraseError extends Error {
  constructor(message: string, public readonly code: "LENGTH" | "UNKNOWN_WORD" | "CHECKSUM" | "INVALID") {
    super(message);
    this.name = "MyMoneroPhraseError";
  }
}

/** Splits user input into lowercase words. */
export function phraseWords(phrase: string): string[] {
  return phrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function isMyMoneroPhrase(phrase: string): boolean {
  return phraseWords(phrase).length === 13;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

/** Standard CRC-32 (as used by Monero's mnemonic checksum word). */
function crc32(text: string): number {
  let c = 0xffffffff;
  for (const byte of new TextEncoder().encode(text)) c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Decodes a 13-word MyMonero phrase into its 16-byte seed, verifying the checksum word. */
export function myMoneroPhraseToSeed(phrase: string): Uint8Array {
  const words = phraseWords(phrase);
  if (words.length !== 13) throw new MyMoneroPhraseError("A MyMonero phrase has 13 words.", "LENGTH");
  const data = words.slice(0, 12);
  const unknown = words.find((w) => indexOfWord(w) < 0);
  if (unknown) throw new MyMoneroPhraseError(`"${unknown}" is not in the Monero word list.`, "UNKNOWN_WORD");

  const prefixes = data.map((w) => w.slice(0, PREFIX)).join("");
  const expected = data[crc32(prefixes) % data.length]!;
  if (expected.slice(0, PREFIX) !== words[12]!.slice(0, PREFIX)) {
    throw new MyMoneroPhraseError("The last word does not match. Check each word for typos.", "CHECKSUM");
  }

  const out = new Uint8Array(16);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 4; i++) {
    const w1 = indexOfWord(data[i * 3]!);
    const w2 = indexOfWord(data[i * 3 + 1]!);
    const w3 = indexOfWord(data[i * 3 + 2]!);
    const x = w1 + N * ((N - w1 + w2) % N) + N * N * ((N - w2 + w3) % N);
    if (x % N !== w1) throw new MyMoneroPhraseError("These words do not form a valid phrase.", "INVALID");
    view.setUint32(i * 4, x, true);
  }
  return out;
}

/** Reduces a 32-byte little-endian integer modulo the ed25519 group order (Monero's sc_reduce32). */
export function scReduce32(bytes: Uint8Array): Uint8Array {
  let n = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) n = (n << 8n) | BigInt(bytes[i]!);
  n %= L;
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

/** Private spend and view keys (hex) for a MyMonero 13-word phrase. */
export function myMoneroKeys(phrase: string): { privateSpendKey: string; privateViewKey: string } {
  const seed = myMoneroPhraseToSeed(phrase);
  const first = keccak_256(seed);
  const second = keccak_256(first);
  return { privateSpendKey: toHex(scReduce32(first)), privateViewKey: toHex(scReduce32(second)) };
}
