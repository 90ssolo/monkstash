/**
 * Exodus 12-word phrases (Exodus ended Monero support in August 2025).
 *
 * Exodus used one BIP39 phrase for every coin. Its Monero wallet is derived the way Cake Wallet
 * implements "Exodus style BIP39" (cw_monero/lib/bip39_seed.dart):
 *   1. BIP39 mnemonic -> 64-byte seed (PBKDF2-HMAC-SHA512, empty passphrase)
 *   2. BIP32 on secp256k1, path m/44'/128'/0'/0/0
 *   3. private spend key = sc_reduce32(node private key)   (no hash first)
 * The view key and address then follow the standard Monero rules from the spend key.
 * Ledger and Coinomi hash the node key with Keccak before reducing, which gives a different
 * wallet from the same words; that is deliberately not what this does.
 *
 * Primitives: @scure/bip39 and @scure/bip32 (audited, same author as @noble/hashes).
 * Verified against Cake Wallet's published "Exodus Style bip39" vectors in test/exodus.test.ts.
 * Runs once per restore on secrets in memory; nothing is stored or sent anywhere.
 */
import { mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import { phraseWords, scReduce32 } from "./mymonero";

export class ExodusPhraseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExodusPhraseError";
  }
}

const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

/** True for a 12-word phrase whose words and checksum are valid BIP39 English. */
export function isExodusPhrase(phrase: string): boolean {
  const words = phraseWords(phrase);
  return words.length === 12 && validateMnemonic(words.join(" "), wordlist);
}

/** Explains what is wrong with a 12-word phrase, or returns null when it is valid. */
export function exodusPhraseProblem(phrase: string): string | null {
  const words = phraseWords(phrase);
  if (words.length !== 12) return "An Exodus phrase has 12 words.";
  const unknown = words.find((w) => !wordlist.includes(w));
  if (unknown) return `"${unknown}" is not a word Exodus uses. Check the spelling.`;
  if (!validateMnemonic(words.join(" "), wordlist)) return "These 12 words do not check out. Check each word and the order.";
  return null;
}

/** The Monero private spend key (hex) for an Exodus 12-word phrase. */
export function exodusSpendKey(phrase: string, account = 0): string {
  const problem = exodusPhraseProblem(phrase);
  if (problem) throw new ExodusPhraseError(problem);
  if (!Number.isInteger(account) || account < 0 || account >= 0x80000000) throw new ExodusPhraseError("Invalid account number.");
  const seed = mnemonicToSeedSync(phraseWords(phrase).join(" "), "");
  const node = HDKey.fromMasterSeed(seed).derive(`m/44'/128'/${account}'/0/0`);
  if (!node.privateKey) throw new ExodusPhraseError("Could not derive the key.");
  const key = scReduce32(node.privateKey);
  seed.fill(0);
  return toHex(key);
}
