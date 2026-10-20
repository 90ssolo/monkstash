/**
 * Friendly checks on Monero's 25-word (English) recovery words, before the wallet engine sees them:
 * which words are not Monero words (with likely corrections), whether the 25th word matches the
 * other 24 (the checksum), and the missing 25th word when only 24 were written down.
 *
 * Monero reads each word by its first 3 letters (the English list's unique prefix length), so a
 * typo after the third letter is harmless and only the first 3 letters are checked here. The
 * checksum is Monero's own rule (src/mnemonics/electrum-words.cpp): CRC-32 of the 24 prefixes
 * joined together, modulo 24, picks which of the 24 words is repeated as word 25.
 *
 * This only helps people type their words; the engine still validates the seed and derives the
 * keys. Nothing here leaves the device.
 */
import { phraseWords } from "./mymonero";
import { ENGLISH_WORDS } from "./wordlist-english";

const PREFIX = 3;
const BY_PREFIX = new Map(ENGLISH_WORDS.map((w) => [w.slice(0, PREFIX), w]));

let crcTable: Uint32Array | null = null;
/** Standard CRC-32 (IEEE 802.3, as boost::crc_32_type), over UTF-8 bytes. */
function crc32(text: string): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const b of new TextEncoder().encode(text)) crc = crcTable[(crc ^ b) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** The Monero word a typed word stands for (by its first 3 letters), or null. */
export function moneroWordFor(typed: string): string | null {
  return BY_PREFIX.get(typed.toLowerCase().slice(0, PREFIX)) ?? null;
}

function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length]![b.length]!;
}

/** Up to three Monero words close to a word that is not one. */
export function suggestWords(typed: string): string[] {
  const t = typed.toLowerCase();
  return ENGLISH_WORDS
    .map((w) => ({ w, d: editDistance(t, w) - (w.slice(0, 2) === t.slice(0, 2) ? 0.5 : 0) }))
    .filter((x) => x.d <= 2)
    .sort((a, b) => a.d - b.d || a.w.localeCompare(b.w))
    .slice(0, 3)
    .map((x) => x.w);
}

/** Index (0 to 23) of the word that word 25 must repeat. */
function checksumIndex(words: string[]): number {
  return crc32(words.slice(0, 24).map((w) => w.slice(0, PREFIX)).join("")) % 24;
}

export interface UnknownWord {
  /** Position in the phrase, from 1. */
  position: number;
  word: string;
  suggestions: string[];
}

export type SeedCheck =
  /** Not 24 or 25 words, or mostly not English Monero words (another language): nothing to say. */
  | { kind: "skip" }
  | { kind: "unknown-words"; unknown: UnknownWord[] }
  /** 25 words, all Monero words, but word 25 does not match the other 24. */
  | { kind: "bad-checksum" }
  /** 24 valid words: the 25th (check) word is missing; this is it. */
  | { kind: "missing-checksum"; word: string }
  | { kind: "ok" };

/** Checks typed 24 or 25-word English Monero recovery words. */
export function checkMoneroWords(phrase: string): SeedCheck {
  const words = phraseWords(phrase);
  if (words.length !== 24 && words.length !== 25) return { kind: "skip" };
  const known = words.map(moneroWordFor);
  // Mostly unknown: probably another of Monero's languages, which the engine checks itself.
  if (known.filter(Boolean).length < words.length * 0.75) return { kind: "skip" };
  const unknown = words
    .map((w, i) => ({ position: i + 1, word: w, suggestions: known[i] ? [] : suggestWords(w) }))
    .filter((_, i) => !known[i]);
  if (unknown.length) return { kind: "unknown-words", unknown };
  const full = known as string[];
  const expected = full[checksumIndex(full)]!;
  if (words.length === 24) return { kind: "missing-checksum", word: expected };
  return full[24]!.slice(0, PREFIX) === expected.slice(0, PREFIX) ? { kind: "ok" } : { kind: "bad-checksum" };
}
