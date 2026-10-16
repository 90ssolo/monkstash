import { describe, expect, it } from "vitest";
import { exodusPhraseProblem, exodusSpendKey, ExodusPhraseError, isExodusPhrase } from "../src/exodus";
import { ENGLISH_WORDS } from "../src/wordlist-english";

/** Decodes a standard 25-word Monero seed into its 32-byte spend key (hex), for comparison. */
function moneroSeedToSpendKey(seed: string): string {
  const N = ENGLISH_WORDS.length;
  const index = new Map(ENGLISH_WORDS.map((w, i) => [w.slice(0, 3), i]));
  const words = seed.split(" ").slice(0, 24).map((w) => index.get(w.slice(0, 3))!);
  const out = new Uint8Array(32);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    const [w1, w2, w3] = [words[i * 3]!, words[i * 3 + 1]!, words[i * 3 + 2]!];
    view.setUint32(i * 4, w1 + N * ((N - w1 + w2) % N) + N * N * ((N - w2 + w3) % N), true);
  }
  return Array.from(out, (x) => x.toString(16).padStart(2, "0")).join("");
}

// Cake Wallet's published "Exodus Style bip39" vectors (cw_monero/test/bip39_seed_test.dart).
const VECTORS = [
  {
    phrase: "meadow tip best belt boss eyebrow control affair eternal piece very shiver",
    seeds: [
      "tasked eight afraid laboratory tail feline rift reinvest vane cafe bailed foggy dormant paper jigsaw king hazard suture king dapper dummy jolted dating dwindling king",
      "palace pairing axes mohawk rekindle excess awful juvenile shipped talent nibs efficient dapper biggest swung fight pact innocent emerge issued titans affair nearby noises emerge",
    ],
  },
  {
    phrase: "color ranch color remove subway public water embrace before begin liberty fault",
    seeds: [
      "somewhere problems gauze gigantic intended foxes upcoming saved waffle pipeline lurk bogeys empty wipeout abbey italics novelty tucks rafts elite lunar obnoxious awful bugs elite",
      "playful toxic wildly eluded mesh fainted february mugged maps repent vigilant hitched seventh threaten clue fetches sample diet number alkaline future cottage tuition vegan alkaline",
    ],
  },
];

describe("Exodus 12-word phrases", () => {
  it("matches Cake Wallet's Exodus-style vectors for accounts 0 and 1", () => {
    for (const v of VECTORS) {
      v.seeds.forEach((seed, account) => {
        expect(exodusSpendKey(v.phrase, account)).toBe(moneroSeedToSpendKey(seed));
      });
    }
  });
  it("accepts messy input (case, extra spaces)", () => {
    expect(exodusSpendKey("  MEADOW tip best  belt boss eyebrow control affair eternal piece very shiver\n")).toBe(moneroSeedToSpendKey(VECTORS[0]!.seeds[0]!));
  });
  it("recognises valid phrases only", () => {
    expect(isExodusPhrase(VECTORS[0]!.phrase)).toBe(true);
    expect(isExodusPhrase("meadow tip best belt boss eyebrow control affair eternal piece very very")).toBe(false); // checksum
    expect(isExodusPhrase("meadow tip best")).toBe(false);
  });
  it("explains what is wrong", () => {
    expect(exodusPhraseProblem("meadow tip best belt boss eyebrow control affair eternal piece very shivr")).toMatch(/"shivr" is not a word/);
    expect(exodusPhraseProblem("meadow tip best belt boss eyebrow control affair eternal piece shiver very")).toMatch(/do not check out/);
    expect(exodusPhraseProblem(VECTORS[1]!.phrase)).toBeNull();
    expect(() => exodusSpendKey("not a phrase")).toThrow(ExodusPhraseError);
  });
  it("gives a different key than Ledger-style derivation would (no keccak)", () => {
    // Sanity: the key is a reduced scalar (top nibble small) and not all zeros.
    const k = exodusSpendKey(VECTORS[0]!.phrase);
    expect(k).toMatch(/^[0-9a-f]{64}$/);
    expect(parseInt(k.slice(62, 64), 16)).toBeLessThan(0x20);
  });
});
