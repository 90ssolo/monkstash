/**
 * Gift links: Monero in a link. The sender makes a fresh one-off wallet, pays the gift into it and
 * shares a link that carries that wallet's private spend key. Whoever opens the link moves the
 * money into their own wallet; until then the sender can take it back with the same key.
 *
 * The key travels in the URL fragment (after "#"), which browsers never send to a server. The
 * link is a bearer key: anyone who sees it can claim the gift, so it is shared like cash.
 *
 * Payload (then cnBase58): version | network | spend key (32) | restore height (u32 LE) |
 * [version 2: amount in atomic units (u64 LE)] | message length | message (UTF-8) |
 * checksum (first 4 bytes of keccak-256 of everything before).
 *
 * Version 2 adds the amount, so the gift page can show it before anything is scanned. It is what
 * the sender paid in; the claim checks the real balance. Version 1 links (no amount) stay valid.
 */
import { keccak_256 } from "@noble/hashes/sha3.js";
import { cnBase58Decode, cnBase58Encode } from "./base58";
import type { NetworkType } from "./network";

export interface GiftPayload {
  network: NetworkType;
  /** The gift wallet's private spend key, 64 hex characters. */
  spendKey: string;
  /** Block height to scan the gift wallet from (just before the gift was paid). */
  height: number;
  /** An optional line from the sender ("Happy birthday"). */
  message: string;
  /** What the sender paid in, atomic units as a decimal string (version 2 links only). */
  amount?: string;
}

/** A gift this wallet made, kept sealed on this device (and in move files) so it can be taken back. */
export interface GiftRecord extends GiftPayload {
  id: string;
  amount: string;
  createdAt: number;
  /** The payment that funded it, once sent. */
  hash?: string;
  /** Set when it was found claimed, or taken back. */
  claimedAt?: number;
  reclaimed?: boolean;
}

export const GIFT_MESSAGE_MAX = 140;
/** The fragment parameter: https://wallet.example/#gift=... */
export const GIFT_PARAM = "gift";

const VERSION_PLAIN = 1;
const VERSION_AMOUNT = 2;
const MAX_U64 = (1n << 64n) - 1n;
const NETWORKS: NetworkType[] = ["mainnet", "testnet", "stagenet"];
const MAX_MESSAGE_BYTES = 255;

export class GiftLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GiftLinkError";
  }
}

const hexToBytes = (h: string) => Uint8Array.from(h.match(/../g)!.map((b) => parseInt(b, 16)));
const bytesToHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

/** One line, no control or direction characters, at most GIFT_MESSAGE_MAX characters. */
export function cleanGiftMessage(s: string): string {
  // eslint-disable-next-line no-control-regex
  const flat = s.replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, " ").replace(/\s+/g, " ").trim();
  let out = [...flat].slice(0, GIFT_MESSAGE_MAX).join("");
  // Multi-byte characters: keep the UTF-8 form within one length byte.
  while (new TextEncoder().encode(out).length > MAX_MESSAGE_BYTES) out = [...out].slice(0, -1).join("");
  return out;
}

export function encodeGift(p: GiftPayload): string {
  if (!/^[0-9a-f]{64}$/.test(p.spendKey)) throw new GiftLinkError("The gift key is not valid.");
  const net = NETWORKS.indexOf(p.network);
  if (net < 0) throw new GiftLinkError("Unknown network.");
  if (!Number.isInteger(p.height) || p.height < 0 || p.height > 0xffffffff) throw new GiftLinkError("The gift height is not valid.");
  const amount = p.amount === undefined ? null : BigInt(p.amount);
  if (amount !== null && (amount <= 0n || amount > MAX_U64)) throw new GiftLinkError("The gift amount is not valid.");
  const msg = new TextEncoder().encode(cleanGiftMessage(p.message));
  const at = amount === null ? 38 : 46;
  const body = new Uint8Array(at + 1 + msg.length);
  body[0] = amount === null ? VERSION_PLAIN : VERSION_AMOUNT;
  body[1] = net;
  body.set(hexToBytes(p.spendKey), 2);
  const view = new DataView(body.buffer);
  view.setUint32(34, p.height, true);
  if (amount !== null) view.setBigUint64(38, amount, true);
  body[at] = msg.length;
  body.set(msg, at + 1);
  const out = new Uint8Array(body.length + 4);
  out.set(body);
  out.set(keccak_256(body).subarray(0, 4), body.length);
  return cnBase58Encode(out);
}

export function decodeGift(text: string): GiftPayload {
  const bytes = cnBase58Decode(text.trim());
  if (!bytes || bytes.length < 43) throw new GiftLinkError("This gift link is incomplete. Ask the sender to copy it again, in full.");
  const body = bytes.subarray(0, bytes.length - 4);
  const sum = keccak_256(body).subarray(0, 4);
  if (!sum.every((b, i) => b === bytes[body.length + i])) throw new GiftLinkError("This gift link is damaged or incomplete. Ask the sender to copy it again, in full.");
  if (body[0] !== VERSION_PLAIN && body[0] !== VERSION_AMOUNT) throw new GiftLinkError("This gift link was made by a newer version of MonkStash. Reload the page and try again.");
  const network = NETWORKS[body[1]!];
  if (!network) throw new GiftLinkError("This gift link is for an unknown network.");
  const at = body[0] === VERSION_AMOUNT ? 46 : 38;
  if (body.length < at + 1) throw new GiftLinkError("This gift link is damaged or incomplete. Ask the sender to copy it again, in full.");
  const len = body[at]!;
  if (body.length !== at + 1 + len) throw new GiftLinkError("This gift link is damaged or incomplete. Ask the sender to copy it again, in full.");
  let message = "";
  try {
    message = cleanGiftMessage(new TextDecoder("utf-8", { fatal: true }).decode(body.subarray(at + 1)));
  } catch {
    throw new GiftLinkError("This gift link is damaged.");
  }
  const view = new DataView(body.buffer, body.byteOffset);
  const out: GiftPayload = { network, spendKey: bytesToHex(body.subarray(2, 34)), height: view.getUint32(34, true), message };
  if (at === 46) {
    const amount = view.getBigUint64(38, true);
    if (amount === 0n) throw new GiftLinkError("This gift link is damaged.");
    out.amount = amount.toString();
  }
  return out;
}

/** The gift code in a pasted link (or a bare code), or null when the text holds none. */
export function giftCodeIn(text: string): string | null {
  const t = text.trim();
  const m = new RegExp(`[#&]${GIFT_PARAM}=([1-9A-HJ-NP-Za-km-z]+)`).exec(t);
  if (m) return m[1]!;
  return /^[1-9A-HJ-NP-Za-km-z]{50,}$/.test(t) ? t : null;
}

/** The full link: the wallet's address with the gift in the fragment. */
export function giftLink(walletUrl: string, code: string): string {
  return `${walletUrl.replace(/#.*$/, "")}#${GIFT_PARAM}=${code}`;
}

/** Gifts merged from a move file: gifts from the file are added, and what either device learned
 *  about a gift (its payment, that it was claimed or taken back) is kept. */
export function mergeGifts(mine: GiftRecord[], theirs: GiftRecord[]): GiftRecord[] {
  const byId = new Map(theirs.map((g) => [g.id, g]));
  const merged = mine.map((g) => {
    const t = byId.get(g.id);
    if (!t) return g;
    byId.delete(g.id);
    const out: GiftRecord = { ...g };
    const hash = g.hash ?? t.hash;
    const claimedAt = g.claimedAt ?? t.claimedAt;
    if (hash) out.hash = hash;
    if (claimedAt) out.claimedAt = claimedAt;
    if (g.reclaimed || t.reclaimed) out.reclaimed = true;
    return out;
  });
  return [...merged, ...byId.values()].sort((a, b) => b.createdAt - a.createdAt);
}

/** Reads a stored gift list, dropping anything malformed. */
export function readGifts(raw: unknown): GiftRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((g): g is GiftRecord =>
    !!g && typeof g === "object" && typeof g.id === "string" && typeof g.spendKey === "string" && /^[0-9a-f]{64}$/.test(g.spendKey)
    && NETWORKS.includes(g.network) && Number.isInteger(g.height) && typeof g.amount === "string" && /^\d+$/.test(g.amount)
    && typeof g.createdAt === "number" && typeof g.message === "string");
}
