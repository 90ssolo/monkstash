/**
 * Move files: a wallet's scan progress and records, carried to another device so it does not
 * scan the chain again.
 *
 * A move file holds the wallet engine's saved state (its keys file, the password that protects
 * it, and its cache with the scan progress and history) plus the wallet's records (handed-out
 * address counters, payment requests, contacts, till sales). The engine's keys file can spend,
 * so the file is sealed with the strongest secret the wallet has: the recovery phrase for a full
 * wallet, the private view key for a watch-only wallet (whose keys file cannot spend). It opens
 * only for the same address, network and wallet type.
 *
 * Layout: MAGIC, then packParts([header JSON, salt, iv, sealed data]). The header is readable
 * without the secret (network, wallet type, scanned height, date) so the screen can describe a
 * file before it is opened; everything in it is checked again against the sealed contents.
 */
import type { NetworkType } from "./network";
import type { WalletKind } from "./record";
import { openBytes, packParts, sealBytes, SEALED_VERSION, unpackParts } from "./sealed";
import { VaultError } from "./vault";

const MAGIC = new TextEncoder().encode("MONKSTASH-MOVE\n");
const FORMAT = "monkstash-move";
const VERSION = 1;
const enc = new TextEncoder();
const dec = new TextDecoder();

export class MoveFileError extends Error {}

/** Records carried in a move file, as the stores load them. Absent means none on the old device. */
export interface MoveRecords {
  addresses?: unknown;
  requests?: unknown;
  contacts?: unknown;
  cashier?: unknown;
}

export interface MovePayload {
  primaryAddress: string;
  network: NetworkType;
  kind: WalletKind;
  restoreHeight: number;
  /** Block height the engine state is synced to. */
  height: number;
  engine: { password: string; keysData: Uint8Array; cacheData: Uint8Array };
  records: MoveRecords;
}

export interface MoveHeader {
  network: NetworkType;
  kind: WalletKind;
  height: number;
  savedAt: string;
}

const contextOf = (network: NetworkType, kind: WalletKind, primaryAddress: string) => `wallet-move|${VERSION}|${network}|${kind}|${primaryAddress}`;

/** Builds a move file. `secret` is the recovery phrase (full wallet) or private view key (watch-only). */
export async function sealMoveFile(p: MovePayload, secret: string, savedAt = new Date()): Promise<Uint8Array<ArrayBuffer>> {
  const meta = { primaryAddress: p.primaryAddress, restoreHeight: p.restoreHeight, height: p.height, records: p.records };
  const inner = packParts([enc.encode(JSON.stringify(meta)), enc.encode(p.engine.password), p.engine.keysData, p.engine.cacheData]);
  const blob = await sealBytes(inner, secret, contextOf(p.network, p.kind, p.primaryAddress));
  const header: MoveHeader & { format: string; v: number } = { format: FORMAT, v: VERSION, network: p.network, kind: p.kind, height: p.height, savedAt: savedAt.toISOString() };
  const body = packParts([enc.encode(JSON.stringify(header)), blob.salt, blob.iv, blob.data]);
  const out = new Uint8Array(MAGIC.length + body.length);
  out.set(MAGIC, 0);
  out.set(body, MAGIC.length);
  return out;
}

function split(file: Uint8Array): { header: MoveHeader; salt: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer>; data: Uint8Array<ArrayBuffer> } {
  if (file.length <= MAGIC.length || MAGIC.some((b, i) => file[i] !== b)) {
    throw new MoveFileError("This is not a MonkStash move file.");
  }
  let parts: Uint8Array[];
  let header: MoveHeader & { format?: string; v?: number };
  try {
    parts = unpackParts(file.subarray(MAGIC.length));
    header = JSON.parse(dec.decode(parts[0]));
  } catch {
    throw new MoveFileError("This move file is damaged.");
  }
  if (parts.length !== 4 || header.format !== FORMAT) throw new MoveFileError("This move file is damaged.");
  if (header.v !== VERSION) throw new MoveFileError("This move file was made by a newer version of MonkStash. Update this page and try again.");
  const copy = (b: Uint8Array) => new Uint8Array(b);
  return { header: { network: header.network, kind: header.kind, height: header.height, savedAt: header.savedAt }, salt: copy(parts[1]!), iv: copy(parts[2]!), data: copy(parts[3]!) };
}

/** What a move file says about itself, without opening it. */
export function readMoveHeader(file: Uint8Array): MoveHeader {
  return split(file).header;
}

/**
 * Opens a move file for the wallet described by `expect`. Throws MoveFileError with a message
 * for the user when the file belongs to another wallet, network or wallet type, or is damaged.
 */
export async function openMoveFile(file: Uint8Array, secret: string, expect: { primaryAddress: string; network: NetworkType; kind: WalletKind }): Promise<MovePayload> {
  const { header, salt, iv, data } = split(file);
  if (header.network !== expect.network) throw new MoveFileError(`This move file is for ${header.network}, but this wallet is on ${expect.network}.`);
  if (header.kind !== expect.kind) {
    throw new MoveFileError(header.kind === "full"
      ? "This move file is from a full wallet. Load it into a wallet restored from the same recovery words."
      : "This move file is from a watch-only wallet. Load it into a watch-only wallet with the same address.");
  }
  let inner: Uint8Array;
  try {
    inner = await openBytes({ v: SEALED_VERSION, alg: "HKDF-SHA256/AES-256-GCM", salt, iv, data }, secret, contextOf(expect.network, expect.kind, expect.primaryAddress));
  } catch (err) {
    if (err instanceof VaultError) throw new MoveFileError("This move file belongs to a different wallet, or it was changed after it was saved.");
    throw err;
  }
  const parts = unpackParts(inner);
  if (parts.length !== 4) throw new MoveFileError("This move file is damaged.");
  const meta = JSON.parse(dec.decode(parts[0])) as { primaryAddress: string; restoreHeight: number; height: number; records: MoveRecords };
  if (meta.primaryAddress !== expect.primaryAddress) throw new MoveFileError("This move file belongs to a different wallet.");
  return {
    primaryAddress: meta.primaryAddress,
    network: expect.network,
    kind: expect.kind,
    restoreHeight: meta.restoreHeight,
    height: meta.height,
    engine: { password: dec.decode(parts[1]), keysData: parts[2]!, cacheData: parts[3]! },
    records: meta.records ?? {},
  };
}

/**
 * Merges handed-out address counters (account -> highest index): the higher index wins in every
 * account, so no address handed out on either device is ever handed out again. Flags such as
 * "restored" are kept if either record has them.
 */
export function mergeHandedOut(a: Record<string, number> | null | undefined, b: Record<string, number> | null | undefined): Record<string, number> | null {
  if (!a && !b) return null;
  const out: Record<string, number> = { ...(a ?? {}) };
  for (const [k, v] of Object.entries(b ?? {})) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.max(out[k] ?? 0, v);
  }
  return out;
}
