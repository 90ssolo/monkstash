import { describe, expect, it } from "vitest";
import moneroTs from "monero-ts";
import { decodePolyseed, isPolyseedLength, NEEDS_PASSPHRASE, PolyseedError, spendKeyHex } from "../src/index";

// Vectors from Monero's own functional tests (monero-project/monero tests/functional_tests:
// wallet.py create() and generate_from_json(), functional_tests_rpc.py polyseed.json).
const PHRASE = "pulse tone truth head invite orphan sock wet crumble oven price corn pilot antenna luxury strategy";
const ADDRESS = "455jFA8HBVzH6nMt2AnNXGR77VR3BypYJXYiYCRkHmTY6XtqebWpu9RhA8gv6q68fC9cuSg2NUX49Wtgtr9Az5ynGgogCzt";
const ADDRESS_ABC = "49PemLZHxP1hCUsbcRZVrAJWBjn7dYi9UQGEqTVAo3hWY1a8PD14Mdcf2fNC5QN3iM6XahTc9qdMi2W3i75C2KU5B7ZDiqn";
const BIRTHDAY = 1783033776;

/** What a wallet does with a decoded Polyseed: a 25-word seed of the reduced key, plus the passphrase as seed offset. */
async function addressOf(phrase: string, passphrase = ""): Promise<string> {
  const d = await decodePolyseed(phrase, passphrase);
  const keys = await moneroTs.createWalletKeys({ networkType: "mainnet", privateSpendKey: spendKeyHex(d.key) } as never);
  const seed = await keys.getSeed();
  const offset = d.encrypted ? undefined : passphrase || undefined;
  const w = await moneroTs.createWalletKeys({ networkType: "mainnet", seed, ...(offset ? { seedOffset: offset } : {}) });
  return w.getPrimaryAddress();
}

describe("polyseed", () => {
  it("restores Monero's test Polyseed to the same address", async () => {
    const d = await decodePolyseed(PHRASE);
    expect(d.birthday).toBe(BIRTHDAY);
    expect(d.encrypted).toBe(false);
    expect(await addressOf(PHRASE)).toBe(ADDRESS);
  }, 60_000);

  it("applies a passphrase on an unencrypted Polyseed as a seed offset, like Monero", async () => {
    expect(await addressOf(PHRASE, "abc")).toBe(ADDRESS_ABC);
  }, 60_000);

  // PHRASE encrypted with the password below by the reference library itself (polyseed_crypt,
  // then polyseed_encode), built with Node's own PBKDF2: see packages/polyseed/README.md.
  const ENCRYPTED = "knee vapor day minimum more aim battle object blanket medal scatter sibling actor unlock inform final";
  it("decrypts an encrypted Polyseed with its passphrase, back to the same wallet", async () => {
    await expect(decodePolyseed(ENCRYPTED)).rejects.toMatchObject({ code: NEEDS_PASSPHRASE });
    const d = await decodePolyseed(ENCRYPTED, "MonkStash test 1");
    expect(d.encrypted).toBe(true);
    expect(d.birthday).toBe(BIRTHDAY);
    expect(await addressOf(ENCRYPTED, "MonkStash test 1")).toBe(ADDRESS);
    // A wrong passphrase gives a valid but different wallet, as the format intends.
    expect(await addressOf(ENCRYPTED, "monkstash test 1")).not.toBe(ADDRESS);
  }, 60_000);

  it("accepts capitals and extra spaces", async () => {
    expect(await addressOf(`  ${PHRASE.toUpperCase().replace(/ /g, "   ")} `)).toBe(ADDRESS);
  }, 60_000);

  it("explains bad phrases", async () => {
    const words = PHRASE.split(" ");
    await expect(decodePolyseed(words.slice(0, 15).join(" "))).rejects.toMatchObject({ code: 1 });
    await expect(decodePolyseed([...words.slice(0, 15), "zzzz"].join(" "))).rejects.toMatchObject({ code: 2 });
    // Two words swapped: the checksum catches it.
    await expect(decodePolyseed([words[1], words[0], ...words.slice(2)].join(" "))).rejects.toBeInstanceOf(PolyseedError);
    await expect(decodePolyseed("x".repeat(500))).rejects.toMatchObject({ code: 101 });
    expect(isPolyseedLength(PHRASE)).toBe(true);
    expect(isPolyseedLength(`${PHRASE} extra`)).toBe(false);
    expect(NEEDS_PASSPHRASE).toBe(100);
  });

  it("reduces keys mod l", () => {
    const max = new Uint8Array(32).fill(0xff);
    // 2^256 - 1 mod l
    expect(spendKeyHex(max)).toBe("1c95988d7431ecd670cf7d73f45befc6feffffffffffffffffffffffffffff0f");
    expect(spendKeyHex(new Uint8Array(32))).toBe("0".repeat(64));
  });
});
