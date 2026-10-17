"use client";
/**
 * Wallet controller: decides which screen to show and owns the decrypted secrets while
 * the wallet is unlocked. Locking closes the engine and drops secrets from memory.
 *
 * Demo mode (local dev + stagenet only, via DEV_TOOLS_ENABLED): onboarding shows sample
 * words that are clearly disclosed as NOT a recovery seed, then assigns a configured
 * stagenet test wallet (opened from its own real seed). Simulation mode replaces the node
 * with canned data, and is also the automatic fallback when the node is unreachable.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createTotpSecret, openBytes, packParts, sealBytes, totpUri, unpackParts, verifyTotp, VaultError, type NodeConfig, type StoredWallet, type WalletPublic, type WalletSecrets } from "@quietmint/wallet-core";
import { NodeTestError, openWallet, testNode, type EngineState, type LiveWallet } from "@/lib/wallet/engine";
import { recordHandedOut, type HandedOut, type HandedOutStore } from "@/lib/wallet/addresses";
import { clearSyncStates, deleteSyncState, loadSealedBlob, loadSyncState, saveSealedBlob, saveSyncState, StorageError } from "@/lib/wallet/stateStore";
import type { PaymentRequest, RequestStore } from "@/lib/wallet/requests";
import { EMPTY_CASHIER, type CashierData, type CashierStore } from "@/lib/wallet/cashier";
import type { ContactStore } from "@/lib/wallet/contacts";
import type { Contact } from "@quietmint/wallet-core";
import { createSimWallet } from "@/lib/wallet/sim";
import { loadStoredWallet, removeWallet, saveWallet, StorageUnavailableError, unlockWallet, updatePublic } from "@/lib/wallet/storage";
import { DEV_TOOLS_ENABLED, NETWORK } from "@/lib/wallet/config";
import { AUTO_LOCK_HIDDEN_MS, AUTO_LOCK_IDLE_MS } from "@/lib/wallet/autolock";
import { fetchTestWallets, type TestWallet } from "@/lib/wallet/testWallets";
import { clearDemoSession, isDemo, pickRandom, preferredMode, setDemoSession, type TestMode } from "@/lib/wallet/demo";
import { BrandMark } from "@/components/BrandMark";
import { Dashboard } from "./Dashboard";
import type { SettingsActions } from "./WalletSettings";
import { Loading, Onboarding, Welcome, type OnboardingResult } from "./Onboarding";
import { Stage } from "./Stage";
import { ArtEngine, ArtLock } from "./WalletArt";
import styles from "./wallet.module.css";
import { siteHref } from "@/lib/site";
import { useSingleTab } from "@/lib/wallet/tabLock";

type Secrets = WalletSecrets;

/** Saving over a list that could not be read would erase it: refuse, and say what to do. */
const UNREADABLE = (what: string) => new StorageError(`Your saved ${what} could not be read in this browser, so nothing was saved (to avoid overwriting them). Reload the page and try again.`);

/** Codes depend on the time: a phone or computer clock that is off makes good codes fail. */
const WRONG_CODE = "Wrong code. Try the newest one from your authenticator app, and check that the clock on this device and your phone is set to automatic time.";

const ACTIVITY_EVENTS =["pointerdown", "keydown", "wheel", "touchstart"] as const;

// Saved sync state (sealed with wallet-core sealBytes): lets an unlock resume from the last
// synced block instead of rescanning everything since the restore height.
const STATE_SAVE_EVERY_MS = 2 * 60 * 1000;
const STATE_SAVE_ON_LOCK_TIMEOUT_MS = 5_000;
const utf8 = new TextEncoder();
/** The secret the saved state is sealed with: the seed, or the view key for watch-only wallets. */
const sealSecretOf = (s: Secrets) => s.seed ?? s.privateViewKey;

/**
 * Highest subaddress index handed out per account (Receive, requests, till sales), sealed like the
 * other per-wallet lists. Read and write failures throw, so an unrecorded address is never shown.
 */
function handedOutStore(pub: WalletPublic, secrets: Secrets): HandedOutStore {
  const key = `addresses|${pub.id}`;
  const context = `addresses|${pub.id}|${pub.primaryAddress}`;
  return {
    async load() {
      const blob = await loadSealedBlob(key);
      // No record: the wallet was restored (or made before records existed), so its earlier
      // addresses are unknown. recordHandedOut then starts above a safety margin.
      if (!blob) return null;
      try {
        return JSON.parse(new TextDecoder().decode(await openBytes(blob, sealSecretOf(secrets), context))) as HandedOut;
      } catch {
        throw UNREADABLE("address list");
      }
    },
    async save(record) {
      await saveSealedBlob(key, await sealBytes(utf8.encode(JSON.stringify(record)), sealSecretOf(secrets), context));
    },
  };
}
/** Binds a saved state to one wallet, so it can never be opened as another wallet's. */
const sealContextOf = (pub: WalletPublic) => `wallet-state|${pub.id}|${pub.primaryAddress}`;

/** Loads and opens the saved state. Unreadable state is discarded (the wallet then syncs normally). */
async function loadSavedState(pub: WalletPublic, secrets: Secrets): Promise<EngineState | null> {
  try {
    const blob = await loadSyncState(pub.id);
    if (!blob) return null;
    const [password, keysData, cacheData] = unpackParts(await openBytes(blob, sealSecretOf(secrets), sealContextOf(pub)));
    if (!password || !keysData || !cacheData) throw new Error("incomplete");
    return { password: new TextDecoder().decode(password), keysData, cacheData };
  } catch {
    await deleteSyncState(pub.id);
    return null;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([p, new Promise<undefined>((r) => setTimeout(() => r(undefined), ms))]);
}

type View =
  | { name: "boot" }
  | { name: "welcome" }
  | { name: "onboard"; mode: "create" | "restore" | "view-only" }
  | { name: "locked"; record: StoredWallet }
  | { name: "otherNetwork"; record: StoredWallet }
  | { name: "opening"; pub: WalletPublic }
  | { name: "open"; pub: WalletPublic; wallet: LiveWallet; mode: TestMode; fellBack: boolean }
  | { name: "fatal"; message: string };

/** A wallet saved for another network (for example a stagenet test wallet on the mainnet site) cannot sync here. */
function viewFor(rec: StoredWallet | null): View {
  if (!rec) return { name: "welcome" };
  return rec.pub.network !== NETWORK ? { name: "otherNetwork", record: rec } : { name: "locked", record: rec };
}

export function WalletApp() {
  const [view, setView] = useState<View>({ name: "boot" });
  const tab = useSingleTab();
  const [testWallets, setTestWallets] = useState<TestWallet[]>([]);
  const live = useRef<LiveWallet | null>(null);
  const session = useRef<{ pub: WalletPublic; secrets: Secrets } | null>(null);
  /** True once the first sync of this session finished (saving earlier would block on it). */
  const synced = useRef(false);
  const savedHeight = useRef(0);
  /** True while the session's first (catch-up) sync runs: idle auto-lock waits for it. */
  const syncBusy = useRef(false);
  /** Bumped by every open, lock and remove: an open() that was overtaken stops and closes its engine. */
  const openGen = useRef(0);

  /** Seals and saves the engine state if new blocks were synced since the last save. Best effort. */
  // `force` saves even without new blocks: used right after a new subaddress is created, so a
  // restart can never hand the same address to a second request or sale.
  const persistState = useCallback(async (force = false) => {
    const w = live.current;
    const s = session.current;
    if (!w?.exportState || !s || (!synced.current && !force)) return;
    try {
      const { state, height } = await w.exportState();
      if (live.current !== w || height < savedHeight.current || (!force && height === savedHeight.current)) return;
      const blob = await sealBytes(packParts([utf8.encode(state.password), state.keysData, state.cacheData]), sealSecretOf(s.secrets), sealContextOf(s.pub));
      await saveSyncState(s.pub.id, blob);
      savedHeight.current = height;
    } catch {
      /* best effort: the next save or a normal sync covers it */
    }
  }, []);

  /** Wraps the wallet so every new subaddress is recorded and saved before it is used. */
  const saveAfterNewAddress = useCallback((w: LiveWallet) => {
    const s = session.current;
    if (s) recordHandedOut(w, handedOutStore(s.pub, s.secrets));
    const create = w.newRequestAddress.bind(w);
    w.newRequestAddress = async (label, expected, account) => {
      const sub = await create(label, expected, account);
      await withTimeout(persistState(true), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      return sub;
    };
    const plain = w.newSubaddress.bind(w);
    w.newSubaddress = async (label) => {
      const address = await plain(label);
      await withTimeout(persistState(true), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      return address;
    };
    // A long first sync saves its progress as it goes (every few thousand blocks or a minute),
    // so a lock, a crash or a closed tab never throws hours of scanning away.
    const sync = w.sync.bind(w);
    w.sync = async (onProgress, onCheckpoint) => {
      syncBusy.current = true;
      try {
        await sync(onProgress, onCheckpoint ?? (() => persistState(true)));
      } finally {
        syncBusy.current = false;
      }
    };
  }, [persistState]);

  const onSynced = useCallback(() => {
    synced.current = true;
    void persistState();
  }, [persistState]);

  useEffect(() => {
    const rec = loadStoredWallet();
    setView(viewFor(rec));
    if (DEV_TOOLS_ENABLED) void fetchTestWallets().then((f) => f && setTestWallets(f.wallets));
    return () => { void live.current?.close(); };
  }, []);

  /** Opens a wallet in the chosen mode. In demo, a node failure falls back to simulation. */
  const open = useCallback(async (pub: WalletPublic, secrets: Secrets, mode?: TestMode) => {
    // A lock, a removal, a tab takeover or a newer open() during the awaits below wins: this one
    // then closes whatever engine it started and leaves the screen alone.
    const gen = ++openGen.current;
    const stale = () => openGen.current !== gen;
    session.current = { pub, secrets };
    synced.current = false;
    savedHeight.current = 0;
    const want: TestMode = mode ?? (isDemo ? preferredMode() : "stagenet");
    setView({ name: "opening", pub });
    await live.current?.close().catch(() => {});
    live.current = null;
    if (stale()) return;

    try {
      if (isDemo && want === "simulation") {
        const wallet = createSimWallet(pub.primaryAddress);
        saveAfterNewAddress(wallet);
        live.current = wallet;
        if (isDemo) setDemoSession({ assignedLabel: pub.name, mode: "simulation" });
        setView({ name: "open", pub, wallet, mode: "simulation", fellBack: false });
        return;
      }
      try {
        const params = {
          kind: pub.kind, network: pub.network, restoreHeight: pub.restoreHeight,
          seed: secrets.seed, primaryAddress: pub.primaryAddress, privateViewKey: secrets.privateViewKey, node: secrets.node,
        };
        const saved = await loadSavedState(pub, secrets);
        if (stale()) return;
        let wallet: LiveWallet;
        try {
          wallet = await openWallet({ ...params, saved: saved ?? undefined });
        } catch (e) {
          if (!saved || stale()) throw e;
          // Saved state could not be used: open fresh. Only discard the save once that worked,
          // so a passing network error never throws away a good save.
          wallet = await openWallet(params);
          if (!stale()) await deleteSyncState(pub.id);
        }
        if (stale()) {
          await wallet.close().catch(() => {});
          return;
        }
        saveAfterNewAddress(wallet);
        live.current = wallet;
        if (isDemo) setDemoSession({ assignedLabel: pub.name, mode: "stagenet" });
        setView({ name: "open", pub, wallet, mode: "stagenet", fellBack: false });
      } catch (e) {
        if (!isDemo || stale()) throw e;
        // Node unreachable: fall back to simulation so the demo keeps working.
        const wallet = createSimWallet(pub.primaryAddress);
        saveAfterNewAddress(wallet);
        live.current = wallet;
        setDemoSession({ assignedLabel: pub.name, mode: "stagenet", fellBackToSim: true });
        setView({ name: "open", pub, wallet, mode: "simulation", fellBack: true });
      }
    } catch (e) {
      if (stale()) return;
      setView({ name: "fatal", message: `The wallet engine could not start: ${(e as Error).message}` });
    }
  }, []);

  // Auto-lock: while the wallet is open, lock it (close the engine, drop secrets from memory)
  // after AUTO_LOCK_IDLE_MS without interaction, or once the tab has been hidden for
  // AUTO_LOCK_HIDDEN_MS. Uses timestamps, not a single long timer, because browsers throttle
  // timers in background tabs; the check also runs the moment the tab becomes visible again.
  const lockRef = useRef<() => Promise<void>>(async () => {});
  // A watch-only wallet in cashier mode stays open all shift: it cannot spend, and a till that
  // locks between customers is unusable. Full wallets keep the normal auto-lock.
  const cashierOn = useRef(false);
  const [tillShown, setTillShown] = useState(false);
  const setCashierOn = useCallback((on: boolean) => { cashierOn.current = on; setTillShown(on); }, []);
  const isOpen = view.name === "open";
  useEffect(() => {
    if (!isOpen) return;
    // Elapsed time comes from performance.now(), which a clock change cannot move.
    const clock = () => performance.now();
    let lastActive = clock();
    let hiddenSince: number | null = document.hidden ? clock() : null;
    let locking = false;
    const lockNow = () => {
      if (locking) return;
      locking = true;
      void lockRef.current();
    };
    const check = () => {
      if (cashierOn.current && session.current?.pub.kind === "view-only") return;
      const now = clock();
      // While the first scan runs in a visible tab, waiting is not idleness: locking would stop
      // the scan. Leaving the tab still locks (progress is saved on the way out).
      if (syncBusy.current && !document.hidden) lastActive = now;
      if (now - lastActive >= AUTO_LOCK_IDLE_MS) lockNow();
      else if (hiddenSince !== null && now - hiddenSince >= AUTO_LOCK_HIDDEN_MS) lockNow();
    };
    const onActivity = () => { lastActive = clock(); };
    const onVisibility = () => {
      if (document.hidden) {
        hiddenSince = clock();
      } else {
        check();
        hiddenSince = null;
        lastActive = clock();
      }
    };
    for (const ev of ACTIVITY_EVENTS) window.addEventListener(ev, onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(check, 15_000);
    return () => {
      for (const ev of ACTIVITY_EVENTS) window.removeEventListener(ev, onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, [isOpen]);

  const switchMode = useCallback((mode: TestMode) => {
    if (session.current) void open(session.current.pub, session.current.secrets, mode);
  }, [open]);

  async function onboarded(r: OnboardingResult) {
    if (isDemo && r.origin === "create") {
      // Demo create flow: the sample words are discarded (disclosed as non-recovery).
      // Restores and watch-only imports are real, so they open exactly what the user entered.
      // Assign one configured stagenet test wallet and open it from its own real seed.
      const w = pickRandom(testWallets);
      if (!w) {
        setView({ name: "fatal", message: "No stagenet test wallets are configured. Run scripts/gen-test-wallets.mjs." });
        return;
      }
      const pub: WalletPublic = {
        id: crypto.randomUUID(), name: `Demo ${w.label}`, kind: "full", network: "stagenet",
        primaryAddress: w.primaryAddress, restoreHeight: w.restoreHeight, createdAt: new Date().toISOString(), totpEnabled: !!r.totp,
      };
      try {
        await saveWallet(pub, { seed: w.seed, privateViewKey: w.privateViewKey, totp: r.totp }, r.password);
      } catch (e) {
        if (e instanceof StorageUnavailableError) throw e;
        throw new Error("Could not save the wallet on this device.");
      }
      await open(pub, { seed: w.seed, privateViewKey: w.privateViewKey });
      return;
    }

    const pub: WalletPublic = {
      id: crypto.randomUUID(), name: "Wallet", kind: r.kind, network: r.network, primaryAddress: r.primaryAddress,
      restoreHeight: r.restoreHeight, createdAt: new Date().toISOString(), totpEnabled: !!r.totp,
    };
    try {
      await saveWallet(pub, { seed: r.seed, privateViewKey: r.privateViewKey, totp: r.totp }, r.password);
    } catch (e) {
      if (e instanceof StorageUnavailableError) throw e;
      throw new Error("Could not save the wallet on this device.");
    }
    // A brand new wallet has handed out no addresses anywhere: an empty record says so. Restored
    // wallets get none, so their first new address starts above a safety margin (addresses.ts).
    if (r.origin === "create") {
      await handedOutStore(pub, { seed: r.seed, privateViewKey: r.privateViewKey }).save({}).catch(() => {});
    }
    await open(pub, { seed: r.seed, privateViewKey: r.privateViewKey });
  }

  /**
   * Re-checks the wallet password (and authenticator code when 2FA is on) against the stored
   * vault, even though the wallet is unlocked, before any settings action that touches secrets.
   */
  async function verifyAccess(password: string, code: string) {
    const rec = loadStoredWallet();
    if (!rec) throw new Error("This wallet is no longer stored in this browser.");
    let s: WalletSecrets;
    try {
      s = await unlockWallet(rec, password);
    } catch (err) {
      throw new Error(err instanceof VaultError && err.code === "WRONG_PASSWORD" ? "Wrong password." : "The password could not be checked.");
    }
    // The encrypted vault decides whether a code is needed, not the readable flag next to it:
    // editing browser storage must never switch the second lock off.
    if (s.totp ? !verifyTotp(s.totp, code) : rec.pub.totpEnabled) {
      throw new Error(WRONG_CODE);
    }
    return { rec, s };
  }

  /** Saves a changed vault and keeps the open session and screens in step with it. */
  async function rewriteVault(pub: WalletPublic, secrets: WalletSecrets, password: string) {
    await saveWallet(pub, secrets, password);
    if (session.current) session.current = { pub, secrets };
    setView((v) => (v.name === "open" ? { ...v, pub } : v));
  }

  /** Payment requests, sealed with this wallet's secret (readable only while unlocked). */
  const requestStore = (pub: WalletPublic): RequestStore | undefined => {
    const secrets = session.current?.secrets;
    if (!secrets) return undefined;
    const key = `requests|${pub.id}`;
    const context = `requests|${pub.id}|${pub.primaryAddress}`;
    let unreadable = false;
    return {
      async load() {
        try {
          const blob = await loadSealedBlob(key);
          unreadable = false;
          if (!blob) return [];
          return JSON.parse(new TextDecoder().decode(await openBytes(blob, sealSecretOf(secrets), context))) as PaymentRequest[];
        } catch {
          unreadable = true;
          return [];
        }
      },
      async save(list) {
        if (unreadable) throw UNREADABLE("payment requests");
        await saveSealedBlob(key, await sealBytes(utf8.encode(JSON.stringify(list)), sealSecretOf(secrets), context));
      },
    };
  };

  /** Contacts (who you pay), sealed like payment requests. */
  const contactStore = (pub: WalletPublic): ContactStore | undefined => {
    const secrets = session.current?.secrets;
    if (!secrets) return undefined;
    const key = `contacts|${pub.id}`;
    const context = `contacts|${pub.id}|${pub.primaryAddress}`;
    let unreadable = false;
    return {
      async load() {
        try {
          const blob = await loadSealedBlob(key);
          unreadable = false;
          if (!blob) return [];
          return JSON.parse(new TextDecoder().decode(await openBytes(blob, sealSecretOf(secrets), context))) as Contact[];
        } catch {
          unreadable = true;
          return [];
        }
      },
      async save(list) {
        if (unreadable) throw UNREADABLE("contacts");
        await saveSealedBlob(key, await sealBytes(utf8.encode(JSON.stringify(list)), sealSecretOf(secrets), context));
      },
    };
  };

  /** Cashier mode settings and sales, sealed like payment requests. */
  const cashierStore = (pub: WalletPublic): CashierStore | undefined => {
    const secrets = session.current?.secrets;
    if (!secrets) return undefined;
    const key = `cashier|${pub.id}`;
    const context = `cashier|${pub.id}|${pub.primaryAddress}`;
    let unreadable = false;
    return {
      async load() {
        try {
          const blob = await loadSealedBlob(key);
          unreadable = false;
          if (!blob) return EMPTY_CASHIER;
          return JSON.parse(new TextDecoder().decode(await openBytes(blob, sealSecretOf(secrets), context))) as CashierData;
        } catch {
          unreadable = true;
          return EMPTY_CASHIER;
        }
      },
      async save(data) {
        if (unreadable) throw UNREADABLE("sales");
        await saveSealedBlob(key, await sealBytes(utf8.encode(JSON.stringify(data)), sealSecretOf(secrets), context));
      },
    };
  };

  const settings = (pub: WalletPublic): SettingsActions => ({
    kind: pub.kind,
    network: pub.network,
    totpEnabled: pub.totpEnabled,
    node: session.current?.secrets.node?.uri ?? null,
    async revealSeed(password, code) {
      const { s } = await verifyAccess(password, code);
      if (!s.seed) throw new Error("This wallet has no recovery words.");
      return s.seed;
    },
    async checkAccess(password, code) {
      await verifyAccess(password, code);
    },
    async changePassword(password, code, newPassword) {
      const { rec, s } = await verifyAccess(password, code);
      await rewriteVault(rec.pub, s, newPassword);
    },
    newTotp() {
      const config = createTotpSecret();
      return { config, uri: totpUri(config, `MonkStash ${pub.primaryAddress.slice(0, 6)}`) };
    },
    async enableTotp(config, newCode, password) {
      if (!verifyTotp(config, newCode)) throw new Error("That code does not match. Check the time on your phone and try the newest code.");
      const { rec, s } = await verifyAccess(password, "");
      await rewriteVault({ ...rec.pub, totpEnabled: true }, { ...s, totp: config }, password);
    },
    async disableTotp(password, code) {
      const { rec, s } = await verifyAccess(password, code);
      const next: WalletSecrets = { ...s };
      delete next.totp;
      await rewriteVault({ ...rec.pub, totpEnabled: false }, next, password);
    },
    async watchOnlyKeys(password, code) {
      const { rec, s } = await verifyAccess(password, code);
      return { address: rec.pub.primaryAddress, viewKey: s.privateViewKey, restoreHeight: rec.pub.restoreHeight };
    },
    restoreHeight: pub.restoreHeight,
    async rescanFrom(height, password, code) {
      const { rec, s } = await verifyAccess(password, code);
      if (!Number.isInteger(height) || height < 0) throw new Error("Choose a valid date or block height.");
      if (height >= rec.pub.restoreHeight) {
        throw new Error(`Choose a date or height earlier than where the wallet starts now (block ${rec.pub.restoreHeight.toLocaleString()}).`);
      }
      const next = updatePublic(rec, { restoreHeight: height }).pub;
      // Stop this engine first, so it cannot save its state again, then drop only this wallet's
      // sync progress. Contacts, requests, sales and the address record are kept.
      openGen.current++;
      const w = live.current;
      live.current = null;
      await w?.close().catch(() => {});
      await deleteSyncState(next.id);
      await open(next, s);
    },
    async saveNode(node: NodeConfig | null, password, code) {
      const { rec, s } = await verifyAccess(password, code);
      if (node) {
        try {
          await testNode(node, rec.pub.network);
        } catch (err) {
          const reason = err instanceof NodeTestError ? err.reason : "unreachable";
          throw new Error(
            reason === "wrong-network" ? `That node runs ${(err as Error).message}, but this wallet is on ${rec.pub.network}.`
            : reason === "timeout" ? "The node did not answer within 20 seconds. Check that it is online and try again."
            : "This browser could not reach that node. Check the address and port, that it uses HTTPS with a trusted certificate, and that it allows this site (see the setup steps below).",
          );
        }
      }
      const next: WalletSecrets = { ...s };
      if (node) next.node = node; else delete next.node;
      await saveWallet(rec.pub, next, password);
      await withTimeout(persistState(), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      await open(rec.pub, next);
    },
  });

  // One store per opened wallet, so the requests list is not reloaded on every render.
  const openPub = view.name === "open" ? view.pub : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openRequests = useMemo(() => (openPub ? requestStore(openPub) : undefined), [openPub]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openCashier = useMemo(() => (openPub ? cashierStore(openPub) : undefined), [openPub]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openContacts = useMemo(() => (openPub ? contactStore(openPub) : undefined), [openPub]);

  async function lock() {
    // Any open() still in progress must not reopen the wallet after this.
    openGen.current++;
    // Save progress first (bounded, so locking never hangs), then drop secrets and close. A first
    // sync in progress is stopped so its state can be exported: the scan resumes from there.
    const running = live.current;
    if (running?.syncing?.()) {
      await withTimeout(running.haltSync?.() ?? Promise.resolve(), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      await withTimeout(persistState(true), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
    } else {
      await withTimeout(persistState(), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
    }
    const w = live.current;
    live.current = null;
    session.current = null;
    synced.current = false;
    await w?.close().catch(() => {});
    const rec = loadStoredWallet();
    setView(viewFor(rec));
  }

  async function remove() {
    openGen.current++;
    const w = live.current;
    live.current = null;
    session.current = null;
    await w?.close().catch(() => {});
    removeWallet();
    await clearSyncStates();
    if (isDemo) clearDemoSession();
    setView({ name: "welcome" });
  }

  // Keep the auto-lock pointing at the current lock() without re-subscribing listeners.
  useEffect(() => { lockRef.current = lock; });

  // Another tab took over the wallet: close it here at once (its keys leave this tab's memory).
  useEffect(() => {
    if (tab.state === "moved") void lockRef.current?.();
  }, [tab.state]);

  // While open, save sync progress periodically (persistState skips if nothing new was synced).
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setInterval(() => void persistState(), STATE_SAVE_EVERY_MS);
    return () => window.clearInterval(t);
  }, [isOpen, persistState]);

  return (
    <div className={styles.shell}>
      <header className={styles.appBar} inert={tillShown || undefined}>
        <Link href={siteHref("/")} className="brand"><BrandMark /><span>MonkStash</span></Link>
        {isDemo ? (
          <span className={styles.demoBadge} title="Local demo on Monero stagenet">DEMO STAGENET</span>
        ) : (
          <span className={styles.appStatus}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            Keys stay on this device
          </span>
        )}
      </header>
      <main id="main" className={view.name === "open" && tab.state === "owner" ? styles.mainWide : styles.main}>
        {tab.state !== "owner" ? (
          tab.state === "checking" ? <Loading text="Loading…" /> : (
            <Stage tone="ink" kicker={tab.state === "moved" ? "Moved" : "Already open"} sizzle={<>One wallet, <mark>one tab</mark>.</>} art={<ArtLock />}>
              <h1 className="visually-hidden">MonkStash wallet</h1>
              <h2>{tab.state === "moved" ? "MonkStash moved to another tab" : "MonkStash is open in another tab"}</h2>
              <p className="muted">
                {tab.state === "moved"
                  ? "The wallet was opened in another tab, so it was locked here. Keeping it in one place stops two tabs from handing out the same address."
                  : "To keep your addresses and records consistent, the wallet runs in one tab at a time. Switch to that tab, or use it here instead (the other tab will lock)."}
              </p>
              <button type="button" className="btn btn-primary" onClick={tab.takeOver}>Use MonkStash here instead</button>
            </Stage>
          )
        ) : null}
        {tab.state !== "owner" ? null : <>
        {view.name === "boot" ? <Loading text="Loading…" /> : null}
        {view.name === "welcome" ? (
          <>
            {isDemo ? <DemoIntro walletCount={testWallets.length} /> : null}
            <Welcome onPick={(mode) => setView({ name: "onboard", mode })} />
          </>
        ) : null}
        {view.name === "onboard" ? (
          <Onboarding mode={view.mode} testWallets={testWallets} onCancel={() => setView({ name: "welcome" })} onDone={onboarded} />
        ) : null}
        {view.name === "locked" ? <Unlock record={view.record} onUnlocked={(pub, s) => open(pub, s)} onForget={remove} /> : null}
        {view.name === "otherNetwork" ? <OtherNetwork record={view.record} onRemove={remove} /> : null}
        {view.name === "opening" ? (
          <Stage tone="ink" kicker="Opening" sizzle={<>Waking the wallet <mark>on your device</mark>.</>} art={<ArtEngine />}>
            <Loading text="Starting the wallet engine. The first start downloads about 4 MB." />
          </Stage>
        ) : null}
        {view.name === "open" ? (
          <Dashboard
            pub={view.pub}
            wallet={view.wallet}
            onLock={lock}
            onRemove={remove}
            onSynced={onSynced}
            settings={settings(view.pub)}
            requests={openRequests}
            cashier={openCashier}
            contacts={openContacts}
            onCashierChange={setCashierOn}
            demo={isDemo ? { mode: view.mode, fellBack: view.fellBack, assignedLabel: view.pub.name, onSwitchMode: switchMode } : undefined}
          />
        ) : null}
        {view.name === "fatal" ? (
          <div className={`card ${styles.narrow}`} role="alert">
            <h1 className="visually-hidden">MonkStash wallet</h1>
            <h2>Something went wrong</h2>
            <p className="muted">{view.message}</p>
            <button className="btn btn-secondary" onClick={() => location.reload()}>Reload</button>
          </div>
        ) : null}
        </>}
      </main>
    </div>
  );
}

function DemoIntro({ walletCount }: { walletCount: number }) {
  return (
    <div className={`notice notice-warn ${styles.demoIntro}`}>
      <span>
        <strong>Demo mode.</strong> This is a local interface demo on Monero stagenet (free test coins).
        Creating a wallet shows <strong>sample words for testing the screens only</strong>, then assigns one of{" "}
        {walletCount || "your"} configured stagenet test wallets. <Link href="/dev/wallets">Open the admin dashboard</Link> to
        see all test wallets and switch modes.
      </span>
    </div>
  );
}

function Unlock({ record, onUnlocked, onForget }: { record: StoredWallet; onUnlocked: (pub: WalletPublic, s: Secrets) => void; onForget: () => void }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsCode, setNeedsCode] = useState(false);
  const [secrets, setSecrets] = useState<Awaited<ReturnType<typeof unlockWallet>> | null>(null);

  // The decrypted keys wait here only while the code is asked for: two minutes at most, then the
  // password is needed again.
  useEffect(() => {
    if (!secrets) return;
    const t = setTimeout(() => {
      setSecrets(null);
      setNeedsCode(false);
      setCode("");
      setError("That took too long, so the wallet locked again. Enter your password once more.");
    }, 2 * 60 * 1000);
    return () => clearTimeout(t);
  }, [secrets]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (needsCode && secrets) {
      if (secrets.totp && verifyTotp(secrets.totp, code)) {
        const s = secrets;
        setSecrets(null);
        setCode("");
        return onUnlocked({ ...record.pub, totpEnabled: true }, s);
      }
      return setError(WRONG_CODE);
    }
    setBusy(true);
    try {
      const s = await unlockWallet(record, pw);
      setPw("");
      // Ask for the code whenever the encrypted vault holds an authenticator secret.
      if (s.totp) {
        setSecrets(s);
        setNeedsCode(true);
        setBusy(false);
        return;
      }
      onUnlocked({ ...record.pub, totpEnabled: false }, s);
    } catch (err) {
      setBusy(false);
      setError(err instanceof VaultError && err.code === "WRONG_PASSWORD" ? "Wrong password." : "This wallet could not be opened.");
    }
  }

  return (
    <Stage
      tone="ink"
      kicker="Welcome back"
      sizzle={needsCode ? <>One more lock: the <mark>code from your phone</mark>.</> : <>Your wallet is <mark>locked</mark> on this device.</>}
      art={<ArtLock />}
      steps={record.pub.totpEnabled ? ["Password", "Authenticator code"] : undefined}
      current={needsCode ? 1 : 0}
    >
      <form onSubmit={submit}>
        <h1 className={styles.title}>{needsCode ? "Enter your code" : "Unlock wallet"}</h1>
        <p className="mono small muted" style={{ wordBreak: "break-all" }}>{record.pub.primaryAddress}</p>
        {!needsCode ? (
          <div className="field">
            <label htmlFor="upw">Password</label>
            <input id="upw" className="input" type="password" autoComplete="current-password" autoFocus value={pw}
              onChange={(e) => { setPw(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby={error ? "unlock-err" : undefined} />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="ucode">6-digit authenticator code</label>
            <input id="ucode" className="input mono" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={7} value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby={error ? "unlock-err" : undefined} />
          </div>
        )}
        {error ? <p id="unlock-err" className="error small" role="alert">{error}</p> : null}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Decrypting…" : "Unlock"}</button>
      </form>
      {needsCode ? (
        <details className={styles.danger} style={{ marginTop: "var(--s-5)" }}>
          <summary>Lost your authenticator?</summary>
          <p className="small muted">
            The code cannot be skipped or reset. Bring the wallet back from{" "}
            {record.pub.kind === "view-only" ? "its address and private view key" : "your 25 recovery words"} instead: remove it from
            this browser (under <em>Forgot password?</em> below), restore it, and set up a new code if you want one. Your money stays safe on
            the Monero network.
          </p>
        </details>
      ) : null}
      <details className={styles.danger} style={{ marginTop: "var(--s-5)" }}>
        <summary>Forgot password?</summary>
        <ForgotPassword kind={record.pub.kind} onForget={onForget} />
      </details>
    </Stage>
  );
}

/**
 * Removal from the unlock screen, for a forgotten password. No password check is possible here, so
 * the guard is an explicit typed confirmation that spells out what is lost. The encrypted copy is
 * kept unless the person asks: if the password comes back to them, it is their only way in.
 */
function OtherNetwork({ record, onRemove }: { record: StoredWallet; onRemove: () => void }) {
  const [text, setText] = useState("");
  const was = record.pub.network;
  const testWallet = was !== "mainnet";
  return (
    <div className={`card ${styles.narrow}`}>
      <h1 className="visually-hidden">MonkStash wallet</h1>
      <h2>{testWallet ? "This is a test wallet" : "This wallet is for the real Monero network"}</h2>
      {testWallet ? (
        <>
          <p className="muted">
            It was made on {was}, Monero&apos;s test network, while MonkStash was being tested. Test wallets only ever hold free
            practice coins, so there is nothing of value in it.
          </p>
          <p className="muted">
            MonkStash now runs on the real Monero network, where a test wallet cannot sync. Remove it from this browser, then create
            a new wallet or restore your real one.
          </p>
        </>
      ) : (
        <p className="muted">
          This copy of MonkStash runs on {NETWORK} for testing, so it cannot open a real wallet. Open your wallet at
          wallet.monkstash.com instead. If you remove it here, you need its recovery words to bring it back.
        </p>
      )}
      <form onSubmit={(e) => { e.preventDefault(); if (text === "REMOVE") onRemove(); }}>
        <div className="field">
          <label htmlFor="othernet-confirm">Type REMOVE to remove this {testWallet ? "test " : ""}wallet from this browser</label>
          <input id="othernet-confirm" className="input" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
        </div>
        <button type="submit" className="btn btn-danger btn-sm" disabled={text !== "REMOVE"}>Remove {testWallet ? "test " : ""}wallet</button>
      </form>
    </div>
  );
}

function ForgotPassword({ kind, onForget }: { kind: WalletPublic["kind"]; onForget: () => void }) {
  const [text, setText] = useState("");
  return (
    <form style={{ paddingBottom: "var(--s-4)" }} onSubmit={(e) => { e.preventDefault(); if (text === "REMOVE") onForget(); }}>
      <p className="small muted">
        Your password cannot be reset. You can remove this wallet from the browser and bring it back with{" "}
        {kind === "view-only" ? "its address and private view key" : "your 25 recovery words"}.
      </p>
      <p className="small muted">
        <strong>Without {kind === "view-only" ? "the address and view key" : "your recovery words"}, removing it loses this wallet for good.</strong>{" "}
        If you might still remember the password, keep the wallet: this encrypted copy is the only way to open it with that password later.
      </p>
      <p className="small muted" id="forget-list" style={{ marginBottom: "var(--s-2)" }}>Removing deletes everything this wallet stored in this browser:</p>
      <ul className="small muted" aria-labelledby="forget-list" style={{ marginTop: 0 }}>
        <li>the encrypted wallet copy</li>
        <li>its contacts</li>
        <li>its payment requests</li>
        <li>its till sales</li>
        <li>its sync progress</li>
      </ul>
      <p className="small muted">
        Payment requests and till sales cannot be exported while the wallet is locked. If you need those records, keep the wallet
        until you find the password, then use <em>Export CSV</em> in Activity and Get paid.
      </p>
      <div className="field">
        <label htmlFor="forget-confirm">Type REMOVE to confirm</label>
        <input id="forget-confirm" className="input" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
      </div>
      <button type="submit" className="btn btn-danger btn-sm" disabled={text !== "REMOVE"}>Remove wallet from this browser</button>
    </form>
  );
}
