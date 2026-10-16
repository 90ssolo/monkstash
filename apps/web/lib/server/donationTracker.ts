/**
 * Server-side donation tracker. Keeps a VIEW-ONLY copy of the donation wallet in sync
 * against a mainnet node and reports what has come in. It holds only the public address and
 * the published view key, so it can see incoming donations but can never spend.
 *
 * Sync progress is saved to DONATIONS_STATE_DIR between runs, so each refresh only scans the
 * new blocks. Without a writable directory (some serverless hosts) it still works, it just
 * rescans from the wallet's restore height each time.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { donate } from "@/lib/donate";

export interface DonationEntry {
  /** Piconero, as a string (JSON has no bigint). */
  amount: string;
  /** Unix seconds of the block, or null while waiting in the pool. */
  timestamp: number | null;
  confirmations: number;
  pending: boolean;
}

export interface DonationStats {
  ok: true;
  /** Total received, confirmed only (piconero string). */
  confirmed: string;
  /** Seen but not yet in a block (piconero string). */
  pending: string;
  count: number;
  recent: DonationEntry[];
  height: number;
  checkedAt: string;
}

const STATE_DIR = process.env.DONATIONS_STATE_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "donations");
const SYNC_TIMEOUT_MS = 240_000;

let running: Promise<DonationStats> | null = null;

/** One sync at a time per process; concurrent callers share the result. */
export function getDonationStats(): Promise<DonationStats> {
  running ??= measure().finally(() => { running = null; });
  return running;
}

async function readState(): Promise<{ password: string; keys: Uint8Array; cache: Uint8Array } | null> {
  try {
    const [password, keys, cache] = await Promise.all([
      fs.readFile(path.join(/*turbopackIgnore: true*/ STATE_DIR, "password"), "utf8"),
      fs.readFile(path.join(/*turbopackIgnore: true*/ STATE_DIR, "wallet.keys")),
      fs.readFile(path.join(/*turbopackIgnore: true*/ STATE_DIR, "wallet.cache")),
    ]);
    return { password: password.trim(), keys: new Uint8Array(keys), cache: new Uint8Array(cache) };
  } catch {
    return null;
  }
}

async function writeState(password: string, keys: Uint8Array, cache: Uint8Array): Promise<void> {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    // Write to temp files, then rename, so a crash never leaves a half-written wallet.
    const files: [string, string | Uint8Array][] = [["password", password], ["wallet.keys", keys], ["wallet.cache", cache]];
    await Promise.all(files.map(([n, d]) => fs.writeFile(path.join(/*turbopackIgnore: true*/ STATE_DIR, `${n}.tmp`), d)));
    await Promise.all(files.map(([n]) => fs.rename(path.join(/*turbopackIgnore: true*/ STATE_DIR, `${n}.tmp`), path.join(/*turbopackIgnore: true*/ STATE_DIR, n))));
  } catch {
    /* read-only filesystem: the next run rescans from the restore height */
  }
}

const toBytes = (d: unknown): Uint8Array =>
  d instanceof Uint8Array ? d : ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : new Uint8Array();

async function measure(): Promise<DonationStats> {
  const node = (process.env.MONERO_STATS_NODE_URL ?? "").trim().replace(/\/+$/, "");
  if (!node) throw new Error("MONERO_STATS_NODE_URL is not set");
  if (!donate.address || !donate.viewKey || donate.restoreHeight == null) throw new Error("Donation wallet is not configured");

  const lib = (await import("monero-ts")).default;
  const networkType = lib.MoneroNetworkType.MAINNET;
  const saved = await readState();
  const password = saved?.password ?? randomBytes(24).toString("hex");

  let wallet = saved
    ? await lib.openWalletFull({ networkType, password, keysData: saved.keys, cacheData: saved.cache, server: { uri: node } } as never).catch(() => null)
    : null;
  // Saved state must belong to the configured wallet; otherwise start fresh.
  if (wallet && (await wallet.getPrimaryAddress()) !== donate.address) {
    await wallet.close().catch(() => {});
    wallet = null;
  }
  wallet ??= await lib.createWalletFull({
    networkType, password, primaryAddress: donate.address, privateViewKey: donate.viewKey,
    restoreHeight: donate.restoreHeight, server: { uri: node },
  });

  try {
    await Promise.race([
      wallet.sync(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("sync timeout")), SYNC_TIMEOUT_MS)),
    ]);
    const height = await wallet.getHeight();
    const txs = await wallet.getTxs({ isIncoming: true } as never);

    let confirmed = 0n;
    let pending = 0n;
    const entries: DonationEntry[] = [];
    for (const tx of txs) {
      const amount = BigInt(tx.getIncomingAmount() ?? 0n);
      if (amount <= 0n) continue;
      const inPool = !!tx.getInTxPool() || !tx.getIsConfirmed();
      if (inPool) pending += amount; else confirmed += amount;
      entries.push({
        amount: amount.toString(),
        timestamp: inPool ? null : tx.getBlock()?.getTimestamp() ?? null,
        confirmations: inPool ? 0 : Number(tx.getNumConfirmations() ?? 0),
        pending: inPool,
      });
    }
    entries.sort((a, b) => (b.timestamp ?? Number.MAX_SAFE_INTEGER) - (a.timestamp ?? Number.MAX_SAFE_INTEGER));

    const data = await wallet.getData();
    await writeState(password, toBytes(data[0]), toBytes(data[1]));

    return {
      ok: true,
      confirmed: confirmed.toString(),
      pending: pending.toString(),
      count: entries.length,
      recent: entries.slice(0, 12),
      height,
      checkedAt: new Date().toISOString(),
    };
  } finally {
    await wallet.close().catch(() => {});
  }
}
