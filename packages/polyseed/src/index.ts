/**
 * Reading 16-word Polyseed phrases (Cake Wallet's default, Feather since 2.0) with tevador's
 * reference library, compiled to WebAssembly (wasm/polyseed.mjs, see build.sh and glue.c).
 *
 * decodePolyseed returns the 32-byte key the library derives, the wallet's birthday, and whether
 * the phrase was encrypted. The wallet then works like a 25-word seed of that key, with any
 * passphrase on an unencrypted phrase applied as a seed offset, exactly as Monero's own wallet
 * code does (monero-project/monero src/mnemonics/polyseed/polyseed.cpp).
 */
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";

interface PolyseedModule {
  HEAPU8: Uint8Array;
  _malloc(n: number): number;
  _free(p: number): void;
  _ps_decode(phrase: number, passphrase: number, key: number, birthday: number, encrypted: number): number;
  stringToUTF8(s: string, p: number, max: number): void;
  lengthBytesUTF8(s: string): number;
}

export class PolyseedError extends Error {
  constructor(message: string, readonly code: number) {
    super(message);
    this.name = "PolyseedError";
  }
}

/** Code 100: an encrypted Polyseed was given without its passphrase. */
export const NEEDS_PASSPHRASE = 100;

const MESSAGES: Record<number, string> = {
  1: "A Polyseed has exactly 16 words.",
  2: "Some words are not Polyseed words. Check the spelling against your backup.",
  3: "The 16 words do not check out: one is probably wrong or in the wrong place.",
  4: "This Polyseed uses options MonkStash cannot read.",
  5: "This is not a valid Polyseed.",
  7: "These words match more than one language. Check the spelling.",
  [NEEDS_PASSPHRASE]: "This Polyseed is protected with a passphrase. Enter it to continue.",
  101: "The phrase or passphrase is too long.",
};

let loading: Promise<PolyseedModule> | null = null;

function load(): Promise<PolyseedModule> {
  loading ??= import("../wasm/polyseed.mjs").then(({ default: create }) =>
    (create as (o: object) => Promise<PolyseedModule>)({
      pbkdf2: (pw: Uint8Array, salt: Uint8Array, c: number, dkLen: number) => pbkdf2(sha256, pw, salt, { c, dkLen }),
    }),
  );
  return loading;
}

export interface DecodedPolyseed {
  /** The key the library derives (not yet reduced as a Monero scalar: see spendKeyHex). */
  key: Uint8Array;
  /** About when the wallet was made, in unix seconds (1/12 of a year precision). */
  birthday: number;
  /** The phrase was encrypted with the passphrase (which has now been used to decrypt it). */
  encrypted: boolean;
}

/** True when the text has 16 words, the length of a Polyseed. */
export const isPolyseedLength = (phrase: string): boolean => phrase.trim().split(/\s+/).filter(Boolean).length === 16;

export async function decodePolyseed(phrase: string, passphrase = ""): Promise<DecodedPolyseed> {
  const m = await load();
  const text = phrase.trim().split(/\s+/).join(" ").toLowerCase();
  const alloc = (s: string) => {
    const n = m.lengthBytesUTF8(s) + 1;
    const p = m._malloc(n);
    m.stringToUTF8(s, p, n);
    return { p, n };
  };
  const ph = alloc(text);
  const pw = alloc(passphrase);
  const out = m._malloc(48); // key (32), birthday (8, aligned), encrypted flag (4)
  try {
    const status = m._ps_decode(ph.p, pw.p, out, out + 32, out + 40);
    if (status !== 0) throw new PolyseedError(MESSAGES[status] ?? "This Polyseed could not be read.", status);
    const heap = m.HEAPU8;
    const view = new DataView(heap.buffer, out, 48);
    return {
      key: heap.slice(out, out + 32),
      birthday: Number(view.getBigUint64(32, true)),
      encrypted: view.getInt32(40, true) !== 0,
    };
  } finally {
    m.HEAPU8.fill(0, ph.p, ph.p + ph.n);
    m.HEAPU8.fill(0, pw.p, pw.p + pw.n);
    m.HEAPU8.fill(0, out, out + 48);
    m._free(ph.p);
    m._free(pw.p);
    m._free(out);
  }
}

/** The order of the ed25519 group, l = 2^252 + 27742317777372353535851937790883648493. */
const L = (1n << 252n) + 27742317777372353535851937790883648493n;

/**
 * The key as a Monero private spend key: the 32 little-endian bytes reduced mod l (Monero's
 * sc_reduce32, which its wallet applies when it makes a wallet from this key), as hex.
 */
export function spendKeyHex(key: Uint8Array): string {
  if (key.length !== 32) throw new Error("A Polyseed key has 32 bytes.");
  let n = 0n;
  for (let i = 31; i >= 0; i--) n = (n << 8n) | BigInt(key[i]!);
  n %= L;
  let hex = "";
  for (let i = 0; i < 32; i++) {
    hex += Number(n & 0xffn).toString(16).padStart(2, "0");
    n >>= 8n;
  }
  return hex;
}
