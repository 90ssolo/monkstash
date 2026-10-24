"use client";
/**
 * IndexedDB store for the wallet engine's sealed sync state (see wallet-core sealed.ts).
 * It lets an unlock resume from the last synced block instead of rescanning from the
 * restore height. The blob is already encrypted before it reaches this module.
 *
 * Everything here is best effort: if IndexedDB is unavailable (private mode, blocked site
 * data, quota), reads return null and writes are skipped. The wallet still works; it just
 * syncs from the restore height as it did before. saveSyncState reports the outcome so the
 * wallet can say when progress is not being kept.
 */
import type { SealedBlob } from "@quietmint/wallet-core";

// Legacy identifier from the pre-rebrand name. Do NOT rename: existing wallets and saved
// state are stored under it, and changing it would make them unreadable.
const DB_NAME = "quietmint";
const STORE = "walletState";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      let result: T | null = null;
      req.onsuccess = () => { result = req.result ?? null; };
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onerror = tx.onabort = () => { db.close(); resolve(null); };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

export async function loadSyncState(walletId: string): Promise<SealedBlob | null> {
  return (await run<SealedBlob>("readonly", (s) => s.get(walletId))) ?? null;
}

/** How a sync-state save ended: stored, refused because storage is full, or storage unavailable. */
export type SyncSaveResult = "saved" | "full" | "unavailable";

/**
 * Saves the sealed sync state. Still best effort (the wallet works without it), but the caller
 * learns whether the write was committed, so it never treats a lost write as saved.
 */
export async function saveSyncState(walletId: string, blob: SealedBlob): Promise<SyncSaveResult> {
  const db = await openDb();
  if (!db) return "unavailable";
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, walletId);
      tx.oncomplete = () => { db.close(); resolve("saved"); };
      tx.onerror = tx.onabort = () => {
        db.close();
        resolve(tx.error?.name === "QuotaExceededError" ? "full" : "unavailable");
      };
    } catch {
      db.close();
      resolve("unavailable");
    }
  });
}

export async function deleteSyncState(walletId: string): Promise<void> {
  await run("readwrite", (s) => s.delete(walletId));
}

/** Removes every saved state (used when every wallet is removed from this browser). */
export async function clearSyncStates(): Promise<void> {
  await run("readwrite", (s) => s.clear());
}

/** The sealed lists kept per wallet (keys are `${name}|${walletId}`, see lib/wallet/session.ts). */
const WALLET_LISTS = ["addresses", "requests", "contacts", "cashier", "labels"] as const;

/** Removes one wallet's scan progress and sealed lists; other wallets' data stays. */
export async function deleteWalletData(walletId: string): Promise<void> {
  await run("readwrite", (s) => s.delete(walletId));
  for (const name of WALLET_LISTS) await run("readwrite", (s) => s.delete(`${name}|${walletId}`));
}

/** Any other sealed per-wallet blob (for example the payment requests list), by key. */
/** Saved lists (requests, contacts, sales) must never fail silently: a lost write looks saved. */
export class StorageError extends Error {}

async function runStrict<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>, what: string): Promise<T | null> {
  const db = await openDb();
  if (!db) throw new StorageError(`This browser is not letting MonkStash ${what} (storage may be blocked or full).`);
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      let result: T | null = null;
      req.onsuccess = () => { result = req.result ?? null; };
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onerror = tx.onabort = () => {
        db.close();
        const full = tx.error?.name === "QuotaExceededError";
        reject(new StorageError(full ? "This browser's storage is full, so this could not be saved. Free some space (or export a CSV) and try again." : `MonkStash could not ${what} in this browser.`));
      };
    } catch {
      db.close();
      reject(new StorageError(`MonkStash could not ${what} in this browser.`));
    }
  });
}

export async function loadSealedBlob(key: string): Promise<SealedBlob | null> {
  return (await runStrict<SealedBlob>("readonly", (s) => s.get(key), "read your saved data")) ?? null;
}

export async function saveSealedBlob(key: string, blob: SealedBlob): Promise<void> {
  await runStrict("readwrite", (s) => s.put(blob, key), "save this");
}
