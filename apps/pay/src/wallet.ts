/**
 * The shop's VIEW-ONLY wallet. It can create fresh subaddresses and see incoming payments, but
 * it has no spend key, so a hacked server can never move the merchant's money. Sync progress is
 * saved in the data directory, so restarts only scan new blocks.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { startCappedNode, type CappedNode } from "@quietmint/node-client";
import type { PayConfig } from "./config";

export interface IncomingPayment {
  /** Wallet account (major index). */
  accountIndex: number;
  subaddressIndex: number;
  amount: bigint;
  confirmations: number;
  pending: boolean;
  hash: string;
  /** Block time (seconds) once confirmed. */
  timestamp?: number;
  /**
   * The merchant cannot spend this money yet beyond the normal 10-block lock: the sender set an
   * unlock time, which can hold the coins for days or years. Never counted toward an invoice.
   */
  locked?: boolean;
  /** The unlock time the sender set (a block height, or a Unix time from 500000000 up), when not 0. */
  unlockTime?: string;
}

/** Every Monero output is locked for 10 blocks after the block it is in. */
export const NORMAL_LOCK_BLOCKS = 10;

/**
 * True when a payment must not count: the sender set any unlock time other than the default 0
 * (BTCPay Server was tricked this way until v1.7.0), or the wallet still reports the coins
 * locked after more than the normal 10 blocks.
 */
export function isLockedPayment(unlockTime: bigint, walletSaysLocked: boolean, confirmations: number): boolean {
  return unlockTime !== 0n || (walletSaysLocked && confirmations > NORMAL_LOCK_BLOCKS);
}

/** What the rest of the server needs from a wallet (a fake one is used in tests). */
export interface Watcher {
  /**
   * A new subaddress in the configured account (PAY_ACCOUNT) whose index is above `after`
   * (indexes already used by stored invoices in that account).
   */
  newSubaddress(label: string, after?: number): Promise<{ index: number; address: string }>;
  /** Incoming transfers in these accounts only (the configured one, plus any older invoices still use). */
  incoming(accounts: number[]): Promise<IncomingPayment[]>;
  /** One sync pass. */
  sync(): Promise<void>;
  height(): Promise<number>;
  save(): Promise<void>;
  close(): Promise<void>;
}

const toBytes = (d: unknown): Uint8Array =>
  d instanceof Uint8Array ? d : ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : new Uint8Array();

/**
 * Opens (or rebuilds) the view-only wallet. `highestIndexes` maps each account to the highest
 * subaddress index a stored invoice uses: a wallet rebuilt from scratch only looks a limited
 * number of subaddresses ahead, so those are created again before the first scan, or payments
 * to them would be missed.
 */
export async function openWatcher(cfg: PayConfig, highestIndexes: Record<number, number> = {}): Promise<Watcher> {
  // The engine reaches the node through a local forwarder that asks for small block batches: in
  // Node.js the engine cannot process the node's largest answers (see packages/node-client).
  const forwarder = await startCappedNode(cfg.nodeUrl);
  try {
    return await openVia(cfg, highestIndexes, forwarder);
  } catch (err) {
    await forwarder.close();
    throw err;
  }
}

async function openVia(cfg: PayConfig, highestIndexes: Record<number, number>, forwarder: CappedNode): Promise<Watcher> {
  const lib = (await import("monero-ts")).default;
  const networkType = lib.MoneroNetworkType[cfg.network.toUpperCase() as "MAINNET" | "STAGENET" | "TESTNET"];
  const dir = path.join(cfg.dataDir, "wallet");
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const server = { uri: forwarder.uri, ...(cfg.nodeUsername ? { username: cfg.nodeUsername, password: cfg.nodePassword ?? "" } : {}) };

  // The engine's file password only protects files in our own data directory; the view key in
  // them is already in this server's environment, so it adds little, but it costs nothing.
  const pwFile = path.join(dir, "password");
  let password: string;
  try {
    password = (await fs.readFile(pwFile, "utf8")).trim();
  } catch {
    password = randomBytes(24).toString("hex");
    await fs.writeFile(pwFile, password, { mode: 0o600 });
  }

  let wallet = null as Awaited<ReturnType<typeof lib.createWalletFull>> | null;
  try {
    const [keys, cache] = await Promise.all([fs.readFile(path.join(dir, "wallet.keys")), fs.readFile(path.join(dir, "wallet.cache"))]);
    wallet = await lib.openWalletFull({ networkType, password, keysData: new Uint8Array(keys), cacheData: new Uint8Array(cache), server } as never);
    // Saved state must belong to the configured wallet; otherwise start fresh.
    if ((await wallet.getPrimaryAddress()) !== cfg.address) {
      await wallet.close().catch(() => {});
      wallet = null;
    }
  } catch {
    wallet = null;
  }
  wallet ??= await lib.createWalletFull({
    networkType, password, primaryAddress: cfg.address, privateViewKey: cfg.viewKey, restoreHeight: cfg.restoreHeight, server,
  } as never);
  const w = wallet;

  // The invoice account must exist (a wallet restored from keys only has account 0).
  const accountsNeeded = Math.max(cfg.account, ...Object.keys(highestIndexes).map(Number));
  let accountCount = (await w.getAccounts()).length;
  while (accountCount <= accountsNeeded) {
    await w.createAccount(accountCount === cfg.account ? "MonkStash Pay" : "");
    accountCount++;
  }
  for (const [acct, highest] of Object.entries(highestIndexes)) {
    let count = (await w.getSubaddresses(Number(acct))).length;
    while (count <= highest) {
      await w.createSubaddress(Number(acct), "MonkStash Pay");
      count++;
    }
  }

  let saving: Promise<void> = Promise.resolve();
  const save = (): Promise<void> => {
    saving = saving.catch(() => {}).then(async () => {
      const [keys, cache] = await w.getData();
      const files: [string, Uint8Array][] = [["wallet.keys", toBytes(keys)], ["wallet.cache", toBytes(cache)]];
      await Promise.all(files.map(([n, d]) => fs.writeFile(path.join(dir, `${n}.tmp`), d, { mode: 0o600 })));
      await Promise.all(files.map(([n]) => fs.rename(path.join(dir, `${n}.tmp`), path.join(dir, n))));
    });
    return saving;
  };
  return {
    async newSubaddress(label, after = 0) {
      // A wallet rebuilt from scratch (lost or mismatched files) starts counting at 1 again:
      // skip past every index an existing invoice already uses.
      let sub = await w.createSubaddress(cfg.account, label);
      while (sub.getIndex() <= after) sub = await w.createSubaddress(cfg.account, label);
      const out = { index: sub.getIndex(), address: sub.getAddress() };
      // Save at once, so a restart never hands the same subaddress to a second order.
      await save();
      return out;
    },
    async incoming(accounts) {
      const out: IncomingPayment[] = [];
      for (const accountIndex of new Set(accounts)) {
        const transfers = await w.getIncomingTransfers({ accountIndex } as never);
        for (const t of transfers) {
          const tx = t.getTx();
          const ts = tx.getBlock()?.getTimestamp();
          const confirmations = Number(tx.getNumConfirmations() ?? 0);
          const unlockTime = BigInt(tx.getUnlockTime() ?? 0);
          const locked = isLockedPayment(unlockTime, tx.getIsLocked() === true, confirmations);
          out.push({
            accountIndex,
            subaddressIndex: t.getSubaddressIndex(),
            amount: BigInt(t.getAmount()),
            confirmations,
            pending: !tx.getIsConfirmed(),
            hash: tx.getHash(),
            ...(ts ? { timestamp: ts } : {}),
            ...(locked ? { locked: true } : {}),
            ...(unlockTime !== 0n ? { unlockTime: unlockTime.toString() } : {}),
          });
        }
      }
      return out;
    },
    async sync() {
      await w.sync();
    },
    async height() {
      return w.getHeight();
    },
    save,
    async close() {
      await save().catch(() => {});
      await w.close(false).catch(() => {});
      await forwarder.close();
    },
  };
}
