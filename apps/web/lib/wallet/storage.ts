"use client";
/**
 * Local persistence of the encrypted wallet records. Nothing here is ever sent to a server.
 * Browser storage can be unavailable (private mode, blocked site data), so every access
 * is guarded and callers get a clear error instead of a crash.
 */
import {
  decryptJson, encryptJson, type StoredWallet, type WalletPublic, type WalletSecrets,
} from "@quietmint/wallet-core";

// Legacy identifier from the pre-rebrand name. Do NOT rename: existing wallets and saved
// state are stored under it, and changing it would make them unreadable.
const KEY = "quietmint.wallet.v1";
/** The storage key of the encrypted wallet record (the extension keeps a copy of it, see below). */
export const VAULT_KEY = KEY;

/**
 * Called after every change to the stored record, with the new JSON (null when removed). The
 * browser extension uses it to keep a copy in its own storage: Firefox clears an extension's
 * localStorage when someone clears their browsing history, but not its extension storage.
 */
type Mirror = (value: string | null) => void;
let mirror: Mirror | null = null;
export function setVaultMirror(m: Mirror | null): void {
  mirror = m;
}

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

/**
 * The wallets in this browser. Stored under the same key as the single wallet of earlier versions:
 * a record of that older shape is read as a list of one, and the first save writes the list.
 * Every wallet's vault is encrypted with the same password (one password unlocks them all).
 */
export interface WalletList {
  /** The wallet that opens on unlock (the one last used). */
  active: string;
  wallets: StoredWallet[];
}

const LIST_FORMAT = "monkstash-wallets";

function isRecord(v: unknown): v is StoredWallet {
  const r = v as StoredWallet | null;
  return !!r && typeof r === "object" && !!r.pub && typeof r.pub.id === "string" && !!r.vault;
}

/** Reads the wallet list (null when there is none, or it cannot be read). */
export function loadWallets(): WalletList | null {
  try {
    const raw = store().getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (isRecord(parsed)) return { active: parsed.pub.id, wallets: [parsed] };
    const list = parsed as { format?: string; active?: unknown; wallets?: unknown };
    if (list?.format !== LIST_FORMAT || !Array.isArray(list.wallets)) return null;
    const wallets = list.wallets.filter(isRecord);
    if (!wallets.length) return null;
    const active = typeof list.active === "string" && wallets.some((w) => w.pub.id === list.active) ? list.active : wallets[0]!.pub.id;
    return { active, wallets };
  } catch {
    return null;
  }
}

/** Writes the list (or removes the key when it is empty). */
export function saveWallets(list: WalletList): void {
  const s = store();
  if (!list.wallets.length) {
    s.removeItem(KEY);
    mirror?.(null);
    return;
  }
  const json = JSON.stringify({ format: LIST_FORMAT, v: 1, active: list.active, wallets: list.wallets });
  s.setItem(KEY, json);
  mirror?.(json);
}

/** The wallet that opens on unlock. */
export function loadStoredWallet(): StoredWallet | null {
  const list = loadWallets();
  return list?.wallets.find((w) => w.pub.id === list.active) ?? null;
}

/** Encrypts a wallet with the password, without saving it. */
export async function sealWallet(pub: WalletPublic, secrets: WalletSecrets, password: string): Promise<StoredWallet> {
  return { pub, vault: await encryptJson(secrets, password) };
}

/** Adds or replaces records (matched by id) and saves the list. `active` makes one the wallet that opens. */
export function putWallets(records: StoredWallet[], active?: string): WalletList {
  const list = loadWallets() ?? { active: records[0]?.pub.id ?? "", wallets: [] };
  const wallets = [...list.wallets];
  for (const r of records) {
    const i = wallets.findIndex((w) => w.pub.id === r.pub.id);
    if (i >= 0) wallets[i] = r; else wallets.push(r);
  }
  const next = { active: active ?? list.active, wallets };
  saveWallets(next);
  return next;
}

/** Encrypts and saves one wallet (added, or replacing the one with the same id). */
export async function saveWallet(pub: WalletPublic, secrets: WalletSecrets, password: string, makeActive = false): Promise<StoredWallet> {
  const record = await sealWallet(pub, secrets, password);
  putWallets([record], makeActive ? pub.id : undefined);
  return record;
}

export async function unlockWallet(record: StoredWallet, password: string): Promise<WalletSecrets> {
  return decryptJson<WalletSecrets>(record.vault, password);
}

export function updatePublic(record: StoredWallet, patch: Partial<WalletPublic>): StoredWallet {
  const next = { ...record, pub: { ...record.pub, ...patch } };
  putWallets([next]);
  return next;
}

/** Makes this wallet the one that opens on unlock. */
export function setActiveWallet(id: string): void {
  const list = loadWallets();
  if (!list || !list.wallets.some((w) => w.pub.id === id) || list.active === id) return;
  saveWallets({ ...list, active: id });
}

/** Per-wallet marks in localStorage (the backup check, components/wallet/Checkup.tsx). */
function clearMarks(s: Storage, id?: string): void {
  for (let i = s.length - 1; i >= 0; i--) {
    const k = s.key(i);
    if (k?.startsWith("monkstash.backupTested.") && (id === undefined || k === `monkstash.backupTested.${id}`)) s.removeItem(k);
  }
}

/** Removes one wallet from the list; the next one (if any) becomes the one that opens. */
export function removeWalletRecord(id: string): WalletList | null {
  try {
    const s = store();
    const list = loadWallets();
    clearMarks(s, id);
    if (!list) return null;
    const wallets = list.wallets.filter((w) => w.pub.id !== id);
    const next = { active: list.active === id ? (wallets[0]?.pub.id ?? "") : list.active, wallets };
    saveWallets(next);
    return wallets.length ? next : null;
  } catch {
    return null;
  }
}

/** Removes every wallet from this browser. */
export function removeWallet(): void {
  try {
    const s = store();
    s.removeItem(KEY);
    mirror?.(null);
    clearMarks(s);
  } catch {
    /* nothing stored */
  }
}
