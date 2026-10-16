/**
 * Full Monero address check for form feedback, without the wallet engine: cnBase58 decode,
 * keccak-256 checksum, network prefix and length. It reads the address only; the wallet
 * engine (monero-ts) still validates any address before it is used.
 */
import { keccak_256 } from "@noble/hashes/sha3.js";
import { cnBase58Decode } from "./base58";
import type { NetworkType } from "./network";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

export type AddressKind = "primary" | "subaddress" | "integrated";

/** Network byte (varint) to network and kind, from Monero's cryptonote_config.h. */
const PREFIXES = new Map<number, { network: NetworkType; kind: AddressKind }>([
  [18, { network: "mainnet", kind: "primary" }],
  [42, { network: "mainnet", kind: "subaddress" }],
  [19, { network: "mainnet", kind: "integrated" }],
  [53, { network: "testnet", kind: "primary" }],
  [63, { network: "testnet", kind: "subaddress" }],
  [54, { network: "testnet", kind: "integrated" }],
  [24, { network: "stagenet", kind: "primary" }],
  [36, { network: "stagenet", kind: "subaddress" }],
  [25, { network: "stagenet", kind: "integrated" }],
]);

/** Decoded byte lengths: prefix + spend key + view key (+ payment id) + checksum. */
const KEYS_AND_CHECKSUM = 32 + 32 + 4;
const PAYMENT_ID = 8;

export interface AddressFormat {
  ok: boolean;
  kind?: AddressKind;
  reason?: string;
}

export interface AddressInfo {
  network: NetworkType;
  kind: AddressKind;
}

type Decoded = { ok: true; info: AddressInfo } | { ok: false; reason: string };

function readVarint(bytes: Uint8Array): { value: number; length: number } | null {
  let value = 0;
  for (let i = 0; i < bytes.length && i < 4; i++) {
    value |= (bytes[i]! & 0x7f) << (7 * i);
    if (!(bytes[i]! & 0x80)) return { value, length: i + 1 };
  }
  return null;
}

const TYPO = "This address has a typo: a character is wrong or missing. Copy it again from the source.";

function decodeAddress(address: string): Decoded {
  const a = address.trim();
  if (!a) return { ok: false, reason: "Enter an address" };
  if (!BASE58.test(a)) return { ok: false, reason: "Contains characters that never appear in Monero addresses" };
  if (a.length !== 95 && a.length !== 106) {
    return { ok: false, reason: `Monero addresses are 95 characters, or 106 for an integrated address (this one has ${a.length})` };
  }
  const bytes = cnBase58Decode(a);
  if (!bytes || bytes.length < 5) return { ok: false, reason: TYPO };
  const body = bytes.subarray(0, bytes.length - 4);
  const sum = keccak_256(body);
  for (let i = 0; i < 4; i++) if (sum[i] !== bytes[body.length + i]) return { ok: false, reason: TYPO };
  const tag = readVarint(body);
  const info = tag ? PREFIXES.get(tag.value) : undefined;
  if (!tag || !info) return { ok: false, reason: "Unknown address prefix" };
  const expected = tag.length + KEYS_AND_CHECKSUM + (info.kind === "integrated" ? PAYMENT_ID : 0);
  if (bytes.length !== expected) return { ok: false, reason: TYPO };
  return { ok: true, info };
}

/** The network and kind of a valid Monero address (checksum verified), or null. */
export function addressInfo(address: string): AddressInfo | null {
  const d = decodeAddress(address);
  return d.ok ? d.info : null;
}

export function checkAddressFormat(address: string, network: NetworkType): AddressFormat {
  const d = decodeAddress(address);
  if (!d.ok) return { ok: false, reason: d.reason };
  if (d.info.network !== network) return { ok: false, reason: `This looks like a ${d.info.network} address` };
  return { ok: true, kind: d.info.kind };
}

export function isHexKey(value: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(value.trim());
}

export function shortAddress(address: string, chars = 6): string {
  return address.length <= chars * 2 + 1 ? address : `${address.slice(0, chars)}…${address.slice(-chars)}`;
}
