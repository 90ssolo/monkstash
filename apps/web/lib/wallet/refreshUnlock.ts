"use client";
/**
 * Stay unlocked across a reload of the same tab (web wallet only; the extension keeps its session
 * in its own background page).
 *
 * While the wallet is unlocked, the password is sealed with AES-GCM under a fresh key that the
 * browser generates as non-extractable: page code can use it but can never read it out. The key is
 * kept in IndexedDB, the sealed password in this tab's sessionStorage, so both are needed and a new
 * tab or a closed browser has no sealed password. Locking (button, idle, leaving the tab) deletes
 * both. A reload resumes only within the same auto-lock limits, measured from the last activity
 * written here, and only for a reload or a normal navigation (never a restored or duplicated tab,
 * which copy sessionStorage).
 */
import { AUTO_LOCK_HIDDEN_MS, AUTO_LOCK_IDLE_MS } from "./autolock";

const SEALED_KEY = "monkstash.refresh.v1";
const PREF_KEY = "monkstash.refreshUnlock.v1";
const DB = "monkstash-refresh";
const STORE = "keys";

interface Sealed { kid: string; iv: string; ct: string; active: number; hidden: number | null }

/** Per-device choice, on unless turned off in Settings. Not a secret. */
export function readRefreshUnlock(): boolean {
  try { return localStorage.getItem(PREF_KEY) !== "off"; } catch { return true; }
}

export function writeRefreshUnlock(on: boolean): void {
  try {
    if (on) localStorage.removeItem(PREF_KEY);
    else localStorage.setItem(PREF_KEY, "off");
  } catch { /* storage blocked: the choice lasts for this visit only */ }
}

function idb<T>(run: (s: IDBObjectStore) => IDBRequest<T>, mode: IDBTransactionMode): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => { db.close(); resolve(req.result); };
      tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
    };
  });
}

const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

function readSealed(): Sealed | null {
  try {
    const raw = sessionStorage.getItem(SEALED_KEY);
    return raw ? (JSON.parse(raw) as Sealed) : null;
  } catch { return null; }
}

function writeSealed(s: Sealed) {
  try { sessionStorage.setItem(SEALED_KEY, JSON.stringify(s)); } catch { /* blocked: reloads ask for the password */ }
}

/** Seals the password for a reload of this tab. Best effort: failures just mean a password prompt. */
export async function remember(password: string): Promise<void> {
  try {
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    const kid = b64(crypto.getRandomValues(new Uint8Array(16)));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(password));
    // One key at a time: older ones (an earlier unlock, another tab) are dropped.
    await idb((s) => s.clear(), "readwrite");
    await idb((s) => s.put(key, kid), "readwrite");
    writeSealed({ kid, iv: b64(iv), ct: b64(ct), active: Date.now(), hidden: null });
  } catch {
    await forget();
  }
}

/** Deletes the sealed password and its key. */
export async function forget(): Promise<void> {
  try { sessionStorage.removeItem(SEALED_KEY); } catch { /* blocked */ }
  try { await idb((s) => s.clear(), "readwrite"); } catch { /* no database */ }
}

/** Records activity and whether the tab is hidden, so a reload applies the same auto-lock limits. */
export function touch(hidden: boolean): void {
  const s = readSealed();
  if (!s) return;
  const now = Date.now();
  writeSealed({ ...s, active: hidden ? s.active : now, hidden: hidden ? (s.hidden ?? now) : null });
}

function cameByReloadOrLink(): boolean {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return !nav || nav.type === "reload" || nav.type === "navigate";
  } catch { return true; }
}

/** True when this tab has a sealed password worth trying (checked before showing the unlock screen). */
export function mayResume(): boolean {
  return readRefreshUnlock() && readSealed() !== null && cameByReloadOrLink();
}

/**
 * The sealed password, if this tab may still use it: within the idle limit since the last activity,
 * and (with lock on leave) not hidden for longer than that limit. Anything else deletes it.
 */
export async function recall(lockOnLeave: boolean): Promise<string | null> {
  const s = readSealed();
  if (!s || !mayResume()) { await forget(); return null; }
  const now = Date.now();
  const expired = now - s.active >= AUTO_LOCK_IDLE_MS || now < s.active
    || (lockOnLeave && s.hidden !== null && now - s.hidden >= AUTO_LOCK_HIDDEN_MS);
  if (expired) { await forget(); return null; }
  try {
    const key = await idb<CryptoKey | undefined>((st) => st.get(s.kid), "readonly");
    if (!key) throw new Error("no key");
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(s.iv) }, key, unb64(s.ct));
    return new TextDecoder().decode(pt);
  } catch {
    await forget();
    return null;
  }
}
