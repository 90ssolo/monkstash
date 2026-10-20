"use client";
/**
 * Local persistence of the encrypted wallet record. Nothing here is ever sent to a server.
 * Browser storage can be unavailable (private mode, blocked site data), so every access
 * is guarded and callers get a clear error instead of a crash.
 */
import {
  decryptJson, encryptJson, type StoredWallet, type WalletPublic, type WalletSecrets,
} from "@quietmint/wallet-core";

// Legacy identifier from the pre-rebrand name. Do NOT rename: existing wallets and saved
// state are stored under it, and changing it would make them unreadable.
const KEY = "quietmint.wallet.v1";

export class StorageUnavailableError extends Error {
  constructor() {
    super("This browser is blocking local storage, so the wallet cannot be saved on this device.");
  }
}

function store(): Storage {
  try {
    const s = window.localStorage;
    const probe = "__qm_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    throw new StorageUnavailableError();
  }
}

export function loadStoredWallet(): StoredWallet | null {
  try {
    const raw = store().getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredWallet) : null;
  } catch {
    return null;
  }
}

export async function saveWallet(pub: WalletPublic, secrets: WalletSecrets, password: string): Promise<StoredWallet> {
  const record: StoredWallet = { pub, vault: await encryptJson(secrets, password) };
  store().setItem(KEY, JSON.stringify(record));
  return record;
}

export async function unlockWallet(record: StoredWallet, password: string): Promise<WalletSecrets> {
  return decryptJson<WalletSecrets>(record.vault, password);
}

export function updatePublic(record: StoredWallet, patch: Partial<WalletPublic>): StoredWallet {
  const next = { ...record, pub: { ...record.pub, ...patch } };
  store().setItem(KEY, JSON.stringify(next));
  return next;
}

export function removeWallet(): void {
  try {
    const s = store();
    s.removeItem(KEY);
    // Per-wallet checkup marks (components/wallet/Checkup.tsx) would otherwise show a wallet was here.
    for (let i = s.length - 1; i >= 0; i--) {
      const k = s.key(i);
      if (k?.startsWith("monkstash.backupTested.")) s.removeItem(k);
    }
  } catch {
    /* nothing stored */
  }
}
