/**
 * Wallet controller: decides which screen the wallet is on and owns the decrypted secrets while
 * the wallet is unlocked. Locking closes the engine and drops secrets from memory.
 *
 * It has no UI. The web wallet (components/wallet/WalletApp.tsx) runs it in the page; the browser
 * extension runs it in its long-lived host page, where the views reach it through messaging. The
 * secrets never leave whichever page runs it.
 *
 * Demo mode (local dev + stagenet only, via DEV_TOOLS_ENABLED): onboarding shows sample words that
 * are clearly disclosed as NOT a recovery seed, then assigns a configured stagenet test wallet
 * (opened from its own real seed). Simulation mode replaces the node with canned data, and is also
 * the automatic fallback when the node is unreachable.
 */
import { createTotpSecret, mergeHandedOut, openBytes, openMoveFile, packParts, sealBytes, sealMoveFile, totpUri, unpackParts, verifyTotp, VaultError, type Contact, type NodeConfig, type StoredWallet, type WalletKind, type WalletPublic, type WalletSecrets } from "@quietmint/wallet-core";
import type { OnboardingResult } from "@/components/wallet/Onboarding";
import type { SettingsActions } from "@/components/wallet/WalletSettings";
import { normalizeSeed, NodeTestError, openWallet, testNode, type EngineState, type LiveWallet } from "./engine";
import { recordHandedOut, type HandedOut, type HandedOutStore } from "./addresses";
import { clearSyncStates, deleteSyncState, deleteWalletData, loadSealedBlob, loadSyncState, saveSealedBlob, saveSyncState, StorageError } from "./stateStore";
import type { PaymentRequest, RequestStore } from "./requests";
import { EMPTY_CASHIER, type CashierData, type CashierStore } from "./cashier";
import type { ContactStore } from "./contacts";
import { createSimWallet } from "./sim";
import { loadWallets, putWallets, removeWallet, removeWalletRecord, saveWallet, sealWallet, setActiveWallet, StorageUnavailableError, unlockWallet, updatePublic, type WalletList } from "./storage";
import { NETWORK } from "./config";
import type { TestWallet } from "./testWallets";
import { clearDemoSession, isDemo, pickRandom, preferredMode, setDemoSession, type TestMode } from "./demo";

type Secrets = WalletSecrets;

/** The setup paths on the welcome screen. "move" restores with words or keys plus a move file. */
export type SetupMode = "create" | "restore" | "view-only" | "move";

/** Saving over a list that could not be read would erase it: refuse, and say what to do. */
const UNREADABLE = (what: string) => new StorageError(`Your saved ${what} could not be read in this browser, so nothing was saved (to avoid overwriting them). Reload the page and try again.`);

/** Codes depend on the time: a phone or computer clock that is off makes good codes fail. */
export const WRONG_CODE = "Wrong code. Try the newest one from your authenticator app, and check that the clock on this device and your phone is set to automatic time.";

// Saved sync state (sealed with wallet-core sealBytes): lets an unlock resume from the last
// synced block instead of rescanning everything since the restore height.
export const STATE_SAVE_EVERY_MS = 2 * 60 * 1000;
const STATE_SAVE_ON_LOCK_TIMEOUT_MS = 5_000;
/** How long a lock waits for a save that is already under way (a large cache takes seconds). */
const SAVE_IN_FLIGHT_TIMEOUT_MS = 20_000;
/** The decrypted keys wait for the authenticator code this long at most. */
export const CODE_WAIT_MS = 2 * 60 * 1000;
/** submitCode() after the keys stopped waiting: the password is needed again. */
export const CODE_EXPIRED = "That took too long, so the wallet locked again. Enter your password once more.";
/** Wrong codes allowed per password entry. Then the keys are dropped and the password is needed again. */
const CODE_TRIES = 5;
/** submitCode() after too many wrong codes. */
export const CODE_TOO_MANY = "Too many wrong codes, so the wallet locked again. Enter your password once more.";
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

/** A per-wallet list sealed with the wallet's secret (readable only while unlocked). */
function sealedList<T>(pub: WalletPublic, secrets: Secrets, name: string, what: string, empty: T): { load(): Promise<T>; save(v: T): Promise<void> } {
  const key = `${name}|${pub.id}`;
  const context = `${name}|${pub.id}|${pub.primaryAddress}`;
  let unreadable = false;
  return {
    async load() {
      try {
        const blob = await loadSealedBlob(key);
        unreadable = false;
        if (!blob) return empty;
        return JSON.parse(new TextDecoder().decode(await openBytes(blob, sealSecretOf(secrets), context))) as T;
      } catch {
        unreadable = true;
        return empty;
      }
    },
    async save(v) {
      if (unreadable) throw UNREADABLE(what);
      await saveSealedBlob(key, await sealBytes(utf8.encode(JSON.stringify(v)), sealSecretOf(secrets), context));
    },
  };
}

/**
 * The secret a move file is sealed with. It carries the engine's keys file, which can spend for a
 * full wallet, so a full wallet's file needs the recovery phrase; a watch-only file the view key.
 */
function moveSecretOf(kind: WalletPublic["kind"], s: Secrets): string {
  if (kind === "full") {
    if (!s.seed) throw new Error("This wallet has no recovery words stored, so it cannot make a move file.");
    return normalizeSeed(s.seed);
  }
  return s.privateViewKey.trim().toLowerCase();
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

/** A wallet in the switcher (public data only). */
export interface WalletSummary { id: string; name: string; kind: WalletKind; active: boolean }

export type View =
  | { name: "boot" }
  /** `adding`: another wallet is being added while one is unlocked (no new password). */
  | { name: "welcome"; adding?: boolean }
  | { name: "onboard"; mode: SetupMode; adding?: boolean }
  /** `count`: wallets on this network that the password unlocks. */
  | { name: "locked"; record: StoredWallet; count: number }
  | { name: "otherNetwork"; record: StoredWallet }
  | { name: "opening"; pub: WalletPublic }
  | { name: "open"; pub: WalletPublic; wallet: LiveWallet; mode: TestMode; fellBack: boolean; wallets: WalletSummary[] }
  | { name: "fatal"; message: string };

/** Wallets for this network (a stagenet test wallet cannot sync on the mainnet site, and the other way round). */
const onThisNetwork = (list: WalletList | null) => (list?.wallets ?? []).filter((w) => w.pub.network === NETWORK);

/** The first screen for what is stored: unlock the last used wallet, or explain one for another network. */
function viewFor(list: WalletList | null): View {
  const here = onThisNetwork(list);
  if (list && !here.length) return { name: "otherNetwork", record: list.wallets[0]! };
  if (!here.length) return { name: "welcome" };
  return { name: "locked", record: here.find((w) => w.pub.id === list!.active) ?? here[0]!, count: here.length };
}

/** The wallet that opens on unlock (on this network). */
function activeRecord(): StoredWallet | null {
  const list = loadWallets();
  const here = onThisNetwork(list);
  return here.find((w) => w.pub.id === list!.active) ?? here[0] ?? null;
}

/** Default name for a new wallet: "Wallet", then "Wallet 2", "Wallet 3"... */
function nextWalletName(list: WalletList | null): string {
  const names = new Set((list?.wallets ?? []).map((w) => w.pub.name));
  if (!names.has("Wallet")) return "Wallet";
  for (let n = 2; ; n++) if (!names.has(`Wallet ${n}`)) return `Wallet ${n}`;
}

export type SaveProblem = "full" | "unavailable" | null;

/** Longest wait for an engine to close when switching or adding wallets. */
const ENGINE_CLOSE_TIMEOUT_MS = 10_000;
/** How long a password approval for a send stays valid. */
const SEND_APPROVAL_MS = 2 * 60 * 1000;
export const SEND_NEEDS_APPROVAL = "Confirm this payment with your wallet password first.";

export class WalletController {
  view: View = { name: "boot" };
  /** Set when the browser refused to keep the scan progress (shown once as a notice). */
  saveProblem: SaveProblem = null;
  /** Stagenet test wallets for demo mode (local dev only). */
  testWallets: TestWallet[] = [];
  /** True while the session's first (catch-up) sync runs: idle auto-lock waits for it. */
  syncBusy = false;
  /** A watch-only wallet in cashier mode stays open all shift (no idle auto-lock). */
  cashierOn = false;

  private live: LiveWallet | null = null;
  private session: { pub: WalletPublic; secrets: Secrets } | null = null;
  /** True once the first sync of this session finished (saving earlier would block on it). */
  private synced = false;
  private savedHeight = 0;
  /** True when this session started from a saved scan (so some progress is safe already). */
  private resumed = false;
  /** Bumped by every open, lock and remove: an open() that was overtaken stops and closes its engine. */
  private openGen = 0;
  /** Decrypted keys waiting for the authenticator code. */
  private pending: { secrets: Secrets; password: string; timer: ReturnType<typeof setTimeout>; tries: number } | null = null;
  /**
   * The wallet password, held in memory only while unlocked (like the decrypted keys), so switching
   * to another wallet in this browser needs no new password. Dropped on lock and removal.
   */
  private password: string | null = null;
  private listeners = new Set<() => void>();
  private stores: { pub: WalletPublic; requests?: RequestStore; contacts?: ContactStore; cashier?: CashierStore } | null = null;
  /**
   * Signed transactions the owner approved with the password (and code) in the last two minutes.
   * The wallet handed to screens only broadcasts one of these, once: an unlocked wallet left on a
   * screen, or a view that was tampered with, cannot send without the password.
   */
  private sendApprovals = new Map<string, number>();

  /** Calls `fn` after every change of view or notice. Returns the unsubscribe function. */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private set(view: View) {
    this.view = view;
    this.emit();
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }

  private setSaveProblem(p: SaveProblem) {
    if (this.saveProblem === p) return;
    this.saveProblem = p;
    this.emit();
  }

  /** Reads the stored wallet and shows the matching first screen. */
  start() {
    this.set(viewFor(loadWallets()));
  }

  /** Shows onboarding (or goes back to the welcome screen). */
  pick(mode: SetupMode | null) {
    // Only from the welcome and setup screens: a stray call must never hide a stored wallet.
    if (this.view.name !== "welcome" && this.view.name !== "onboard") return;
    const adding = !!this.view.adding;
    this.set(mode ? { name: "onboard", mode, adding } : { name: "welcome", adding });
  }

  /** True while a wallet is unlocked: open, or while another wallet is being added. */
  get unlocked(): boolean {
    return this.view.name === "open" || (!!this.session && (this.view.name === "welcome" || this.view.name === "onboard") && !!this.view.adding);
  }

  /** The wallets of this network for the switcher. */
  private summaries(activeId: string): WalletSummary[] {
    return onThisNetwork(loadWallets()).map((w) => ({ id: w.pub.id, name: w.pub.name, kind: w.pub.kind, active: w.pub.id === activeId }));
  }

  /** Seals and saves the engine state if new blocks were synced since the last save. Best effort. */
  // `force` saves even without new blocks: used right after a new subaddress is created, so a
  // restart can never hand the same address to a second request or sale.
  persistState = (force = false): Promise<void> => {
    const run = this.persistOnce(force);
    const tracked = run.finally(() => { if (this.saving === tracked) this.saving = null; });
    this.saving = tracked;
    return tracked;
  };

  /** The save in progress, if any: a lock waits for it, or closing the engine would discard it. */
  private saving: Promise<void> | null = null;
  /**
   * Bumped whenever the saved state is deliberately replaced or deleted (rescan, loaded move file,
   * removal): a save that started before must not write the old engine's state back afterwards.
   */
  private stateGen = 0;

  /** Waits (bounded) for a save under way to finish. */
  private async settleSave() {
    if (this.saving) await withTimeout(this.saving, SAVE_IN_FLIGHT_TIMEOUT_MS);
  }

  private async persistOnce(force: boolean) {
    const w = this.live;
    const s = this.session;
    const gen = this.stateGen;
    if (!w?.exportState || !s || (!this.synced && !force)) return;
    try {
      const { state, height } = await w.exportState();
      if (this.live !== w || height < this.savedHeight || (!force && height === this.savedHeight)) return;
      const blob = await sealBytes(packParts([utf8.encode(state.password), state.keysData, state.cacheData]), sealSecretOf(s.secrets), sealContextOf(s.pub));
      // Sealing a large cache takes seconds: check again that this state still belongs.
      if (this.stateGen !== gen) return;
      const result = await saveSyncState(s.pub.id, blob);
      if (result !== "saved") {
        // Not marked as saved: the next save tries again even without new blocks.
        this.setSaveProblem(result);
        return;
      }
      this.savedHeight = height;
      this.setSaveProblem(null);
    } catch {
      /* best effort: the next save or a normal sync covers it */
    }
  }

  /** Wraps the wallet so every new subaddress is recorded and saved before it is used. */
  private saveAfterNewAddress(w: LiveWallet) {
    const s = this.session;
    if (s) recordHandedOut(w, handedOutStore(s.pub, s.secrets));
    const create = w.newRequestAddress.bind(w);
    w.newRequestAddress = async (label, expected, account) => {
      const sub = await create(label, expected, account);
      await withTimeout(this.persistState(true), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      return sub;
    };
    const plain = w.newSubaddress.bind(w);
    w.newSubaddress = async (label) => {
      const address = await plain(label);
      await withTimeout(this.persistState(true), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      return address;
    };
    // A long first sync saves its progress as it goes (every few thousand blocks or a minute),
    // so a lock, a crash or a closed tab never throws hours of scanning away.
    const sync = w.sync.bind(w);
    w.sync = async (onProgress, onCheckpoint) => {
      this.syncBusy = true;
      try {
        await sync(onProgress, onCheckpoint ?? (() => this.persistState(true)));
      } finally {
        this.syncBusy = false;
      }
    };
  }

  /** The first sync of this session finished: saving is now worth it. */
  onSynced = () => {
    this.synced = true;
    void this.persistState();
  };

  /** Opens a wallet in the chosen mode. In demo, a node failure falls back to simulation. */
  open = async (pub: WalletPublic, secrets: Secrets, mode?: TestMode) => {
    // A lock, a removal, a tab takeover or a newer open() during the awaits below wins: this one
    // then closes whatever engine it started and leaves the screen alone.
    const gen = ++this.openGen;
    const stale = () => this.openGen !== gen;
    this.session = { pub, secrets };
    this.synced = false;
    this.savedHeight = 0;
    this.resumed = false;
    this.setSaveProblem(null);
    const want: TestMode = mode ?? (isDemo ? preferredMode() : "stagenet");
    this.set({ name: "opening", pub });
    await this.live?.close().catch(() => {});
    this.live = null;
    if (stale()) return;

    try {
      if (isDemo && want === "simulation") {
        const wallet = createSimWallet(pub.primaryAddress);
        this.saveAfterNewAddress(wallet);
        this.live = wallet;
        if (isDemo) setDemoSession({ assignedLabel: pub.name, mode: "simulation" });
        this.set({ name: "open", pub, wallet: this.guarded(wallet), mode: "simulation", fellBack: false, wallets: this.summaries(pub.id) });
        return;
      }
      try {
        const params = {
          kind: pub.kind, network: pub.network, restoreHeight: pub.restoreHeight,
          seed: secrets.seed, primaryAddress: pub.primaryAddress, privateViewKey: secrets.privateViewKey, node: secrets.node,
        };
        const saved = await loadSavedState(pub, secrets);
        if (stale()) return;
        this.resumed = !!saved;
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
        this.saveAfterNewAddress(wallet);
        this.live = wallet;
        if (isDemo) setDemoSession({ assignedLabel: pub.name, mode: "stagenet" });
        this.set({ name: "open", pub, wallet: this.guarded(wallet), mode: "stagenet", fellBack: false, wallets: this.summaries(pub.id) });
      } catch (e) {
        if (!isDemo || stale()) throw e;
        // Node unreachable: fall back to simulation so the demo keeps working.
        const wallet = createSimWallet(pub.primaryAddress);
        this.saveAfterNewAddress(wallet);
        this.live = wallet;
        setDemoSession({ assignedLabel: pub.name, mode: "stagenet", fellBackToSim: true });
        this.set({ name: "open", pub, wallet: this.guarded(wallet), mode: "simulation", fellBack: true, wallets: this.summaries(pub.id) });
      }
    } catch (e) {
      if (stale()) return;
      this.set({ name: "fatal", message: `The wallet engine could not start: ${(e as Error).message}` });
    }
  };

  switchMode = (mode: TestMode) => {
    if (this.session) void this.open(this.session.pub, this.session.secrets, mode);
  };

  /**
   * First unlock step: decrypts the vault with the password. Returns "code" when the vault holds an
   * authenticator secret; the keys then wait (two minutes at most) for submitCode().
   */
  unlock = async (password: string): Promise<"open" | "code"> => {
    const record = activeRecord();
    if (!record) throw new Error("This wallet is no longer stored in this browser.");
    this.dropPending();
    let s: Secrets;
    try {
      s = await unlockWallet(record, password);
    } catch (err) {
      throw new Error(err instanceof VaultError && err.code === "WRONG_PASSWORD" ? "Wrong password." : "This wallet could not be opened.");
    }
    // Ask for the code whenever the encrypted vault holds an authenticator secret.
    if (s.totp) {
      this.pending = { secrets: s, password, timer: setTimeout(() => this.dropPending(), CODE_WAIT_MS), tries: 0 };
      return "code";
    }
    this.password = password;
    void this.open({ ...record.pub, totpEnabled: false }, s);
    return "open";
  };

  /** Second unlock step. Throws when the code is wrong, or when the keys stopped waiting. */
  submitCode = async (code: string): Promise<void> => {
    const record = activeRecord();
    const p = this.pending;
    if (!record || !p) throw new Error(CODE_EXPIRED);
    if (!p.secrets.totp || !verifyTotp(p.secrets.totp, code)) {
      // A few tries per password entry: guessing codes must not be cheap.
      if (++p.tries >= CODE_TRIES) {
        this.dropPending();
        throw new Error(CODE_TOO_MANY);
      }
      throw new Error(WRONG_CODE);
    }
    this.dropPending();
    this.password = p.password;
    void this.open({ ...record.pub, totpEnabled: true }, p.secrets);
  };

  private dropPending() {
    if (!this.pending) return;
    clearTimeout(this.pending.timer);
    this.pending = null;
  }

  /**
   * Merges the records of a move file into this device's: address counters take the higher index,
   * so no address handed out on either device is reused; lists fill in only where this device has
   * none, so nothing here is overwritten. Returns what was added, for the message.
   */
  private async mergeMovedRecords(pub: WalletPublic, s: Secrets, moved: Awaited<ReturnType<typeof openMoveFile>>): Promise<string[]> {
    const added: string[] = [];
    const addressStore = handedOutStore(pub, s);
    const merged = mergeHandedOut(await addressStore.load(), moved.records.addresses as HandedOut | undefined);
    if (merged) await addressStore.save(merged);
    // From the given secrets, not the open session: during setup no wallet is open yet.
    const reqs = sealedList<PaymentRequest[]>(pub, s, "requests", "payment requests", []);
    if (Array.isArray(moved.records.requests) && moved.records.requests.length && !(await reqs.load()).length) {
      await reqs.save(moved.records.requests as PaymentRequest[]);
      added.push("payment requests");
    }
    const cons = sealedList<Contact[]>(pub, s, "contacts", "contacts", []);
    if (Array.isArray(moved.records.contacts) && moved.records.contacts.length && !(await cons.load()).length) {
      await cons.save(moved.records.contacts as Contact[]);
      added.push("contacts");
    }
    const till = sealedList<CashierData>(pub, s, "cashier", "sales", EMPTY_CASHIER);
    const tillHere = await till.load();
    if (moved.records.cashier && !tillHere.config && !tillHere.sales.length) {
      await till.save(moved.records.cashier as CashierData);
      added.push("till settings and sales");
    }
    return added;
  }

  onboarded = async (r: OnboardingResult) => {
    // Only from setup: saving a new vault over a stored wallet would lose it.
    if (this.view.name !== "onboard") throw new Error("Wallet setup is not open. Start again from the welcome screen.");
    const list = loadWallets();
    // An added wallet uses the password (and authenticator) of the wallets already here.
    const adding = !!this.view.adding;
    if (adding && (!this.password || !this.session)) throw new Error("The wallet locked while you were adding one. Unlock it and try again.");
    const password = adding ? this.password! : r.password;
    // The previous wallet finishes saving and closing first (started by startAdd).
    if (adding && this.closing) await this.closing;
    const totp = adding ? this.session!.secrets.totp : r.totp;
    if (onThisNetwork(list).some((w) => w.pub.primaryAddress === r.primaryAddress && w.pub.kind === r.kind)) {
      throw new Error("This wallet is already in MonkStash in this browser. Choose it from the wallet menu.");
    }
    if (isDemo && r.origin === "create") {
      // Demo create flow: the sample words are discarded (disclosed as non-recovery).
      // Restores and watch-only imports are real, so they open exactly what the user entered.
      // Assign one configured stagenet test wallet and open it from its own real seed.
      const w = pickRandom(this.testWallets);
      if (!w) {
        this.set({ name: "fatal", message: "No stagenet test wallets are configured. Run scripts/gen-test-wallets.mjs." });
        return;
      }
      const pub: WalletPublic = {
        id: crypto.randomUUID(), name: `Demo ${w.label}`, kind: "full", network: "stagenet",
        primaryAddress: w.primaryAddress, restoreHeight: w.restoreHeight, createdAt: new Date().toISOString(), totpEnabled: !!totp,
      };
      try {
        await saveWallet(pub, { seed: w.seed, privateViewKey: w.privateViewKey, totp }, password, true);
      } catch (e) {
        if (e instanceof StorageUnavailableError) throw e;
        throw new Error("Could not save the wallet on this device.");
      }
      this.password = password;
      await this.open(pub, { seed: w.seed, privateViewKey: w.privateViewKey, totp });
      return;
    }

    const secrets: Secrets = { seed: r.seed, privateViewKey: r.privateViewKey };
    // A move file is opened before anything is saved: one for another wallet stops setup here.
    const moved = r.moveFile
      ? await openMoveFile(r.moveFile, moveSecretOf(r.kind, secrets), { primaryAddress: r.primaryAddress, network: r.network, kind: r.kind })
      : null;
    const pub: WalletPublic = {
      id: crypto.randomUUID(), name: nextWalletName(list), kind: r.kind, network: r.network, primaryAddress: r.primaryAddress,
      restoreHeight: moved ? moved.restoreHeight : r.restoreHeight, createdAt: new Date().toISOString(), totpEnabled: !!totp,
    };
    try {
      await saveWallet(pub, { seed: r.seed, privateViewKey: r.privateViewKey, totp }, password, true);
    } catch (e) {
      if (e instanceof StorageUnavailableError) throw e;
      throw new Error("Could not save the wallet on this device.");
    }
    // A brand new wallet has handed out no addresses anywhere: an empty record says so. Restored
    // wallets get none, so their first new address starts above a safety margin (addresses.ts).
    if (r.origin === "create") {
      await handedOutStore(pub, { seed: r.seed, privateViewKey: r.privateViewKey }).save({}).catch(() => {});
    }
    if (moved) {
      // Records and scan progress from the other device. If this browser refuses to keep the scan
      // progress, the wallet still opens and scans on its own.
      await this.mergeMovedRecords(pub, secrets, moved).catch(() => {});
      const blob = await sealBytes(packParts([utf8.encode(moved.engine.password), moved.engine.keysData, moved.engine.cacheData]), sealSecretOf(secrets), sealContextOf(pub));
      await saveSyncState(pub.id, blob).catch(() => {});
    }
    this.password = password;
    await this.open(pub, { ...secrets, totp });
  };

  /** The open wallet being saved and closed in the background (while "add a wallet" shows). */
  private closing: Promise<void> | null = null;

  /**
   * Starts adding another wallet. Setup shows at once, without a password step; meanwhile the open
   * wallet saves its scan progress and closes (that can take a few seconds during a first scan).
   */
  startAdd = async () => {
    if (this.view.name !== "open" || !this.password) return;
    this.set({ name: "welcome", adding: true });
    const closing = this.closeEngine().catch(() => {});
    this.closing = closing;
    void closing.finally(() => { if (this.closing === closing) this.closing = null; });
  };

  /** Leaves "add a wallet" and opens the wallet that was open before. */
  cancelAdd = async () => {
    if ((this.view.name !== "welcome" && this.view.name !== "onboard") || !this.view.adding) return;
    if (this.closing) await this.closing;
    if (this.session) await this.open(this.session.pub, this.session.secrets);
    else this.set(viewFor(loadWallets()));
  };

  /** Opens another wallet of this browser with the password already given. */
  switchTo = async (id: string) => {
    if (this.view.name !== "open" || this.view.pub.id === id || !this.password) return;
    const rec = onThisNetwork(loadWallets()).find((w) => w.pub.id === id);
    if (!rec) throw new Error("That wallet is no longer in this browser.");
    let s: Secrets;
    try {
      s = await unlockWallet(rec, this.password);
    } catch {
      throw new Error("That wallet could not be opened with the current password.");
    }
    // The other wallet's opening screen shows at once, while this one saves and closes.
    this.set({ name: "opening", pub: rec.pub });
    await this.closeEngine();
    setActiveWallet(id);
    await this.open({ ...rec.pub, totpEnabled: !!s.totp }, s);
  };

  /** Renames the open wallet (shown in the wallet menu). */
  rename = async (name: string) => {
    const clean = name.replace(/\s+/g, " ").trim().slice(0, 40);
    if (!clean) throw new Error("Give the wallet a name.");
    if (this.view.name !== "open") return;
    const openId = this.view.pub.id;
    const rec = loadWallets()?.wallets.find((w) => w.pub.id === openId);
    if (!rec) throw new Error("This wallet is no longer stored in this browser.");
    const next = updatePublic(rec, { name: clean }).pub;
    if (this.session) this.session = { ...this.session, pub: next };
    if (this.view.name === "open") this.set({ ...this.view, pub: next, wallets: this.summaries(next.id) });
  };

  /**
   * Saves the open engine's progress (bounded) and closes it, keeping the unlocked session. Used
   * before switching wallets or adding one.
   */
  private async closeEngine() {
    this.openGen++;
    this.dropPending();
    await this.settleSave();
    const running = this.live;
    if (running?.syncing?.()) {
      await withTimeout(running.haltSync?.() ?? Promise.resolve(), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      // An engine still inside a large batch would only answer the save after it: skip it then. A
      // first scan saves itself about once a minute, so little is lost, and the switch stays quick.
      if (!running.syncing?.()) await withTimeout(this.persistState(true), SAVE_IN_FLIGHT_TIMEOUT_MS);
    } else {
      await withTimeout(this.persistState(!this.synced), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
    }
    const w = this.live;
    this.live = null;
    this.stores = null;
    this.sendApprovals.clear();
    this.synced = false;
    this.cashierOn = false;
    // Bounded: an engine busy with a large answer must not hold the next wallet back.
    await withTimeout(w?.close().catch(() => {}) ?? Promise.resolve(), ENGINE_CLOSE_TIMEOUT_MS);
  }

  /** The engine as screens see it: identical, except that relay() needs an approval (see sendApprovals). */
  private guarded(w: LiveWallet): LiveWallet {
    const relay = async (metadata: string) => {
      const until = this.sendApprovals.get(metadata);
      this.sendApprovals.delete(metadata);
      if (until === undefined || Date.now() > until) throw new Error(SEND_NEEDS_APPROVAL);
      return w.relay(metadata);
    };
    return new Proxy(w, {
      get(target, key, receiver) {
        if (key === "relay") return relay;
        const v = Reflect.get(target, key, receiver) as unknown;
        return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(target) : v;
      },
    });
  }

  /**
   * Re-checks the wallet password (and authenticator code when 2FA is on) against the stored
   * vault, even though the wallet is unlocked, before any settings action that touches secrets.
   */
  private async verifyAccess(password: string, code: string) {
    const openId = this.session?.pub.id;
    const rec = (openId ? loadWallets()?.wallets.find((w) => w.pub.id === openId) : null) ?? activeRecord();
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
  private async rewriteVault(pub: WalletPublic, secrets: WalletSecrets, password: string) {
    await saveWallet(pub, secrets, password);
    if (this.session) this.session = { pub, secrets };
    if (this.view.name === "open") this.set({ ...this.view, pub, wallets: this.summaries(pub.id) });
  }

  /**
   * Re-encrypts every wallet in this browser: the password and the authenticator are shared by all
   * of them. All vaults are decrypted and re-sealed first, then saved in one write, so a failure
   * leaves every wallet as it was.
   */
  private async rewriteAll(password: string, newPassword: string, change: (pub: WalletPublic, s: WalletSecrets) => [WalletPublic, WalletSecrets]) {
    const list = loadWallets();
    if (!list) throw new Error("This wallet is no longer stored in this browser.");
    const resealed: StoredWallet[] = [];
    for (const rec of list.wallets) {
      let s: WalletSecrets;
      try {
        s = await unlockWallet(rec, password);
      } catch {
        throw new Error(`"${rec.pub.name}" in this browser uses a different password, so nothing was changed.`);
      }
      const [pub, next] = change(rec.pub, s);
      resealed.push(await sealWallet(pub, next, newPassword));
    }
    putWallets(resealed);
    this.password = newPassword;
    const openId = this.session?.pub.id;
    const mine = resealed.find((r) => r.pub.id === openId);
    if (mine && this.session) {
      const s = await unlockWallet(mine, newPassword);
      this.session = { pub: mine.pub, secrets: s };
      if (this.view.name === "open") this.set({ ...this.view, pub: mine.pub, wallets: this.summaries(mine.pub.id) });
    }
  }

  /** Payment requests, sealed with this wallet's secret (readable only while unlocked). */
  requestStore(pub: WalletPublic): RequestStore | undefined {
    const secrets = this.session?.secrets;
    return secrets ? sealedList<PaymentRequest[]>(pub, secrets, "requests", "payment requests", []) : undefined;
  }

  /** Contacts (who you pay), sealed like payment requests. */
  contactStore(pub: WalletPublic): ContactStore | undefined {
    const secrets = this.session?.secrets;
    return secrets ? sealedList<Contact[]>(pub, secrets, "contacts", "contacts", []) : undefined;
  }

  /** Cashier mode settings and sales, sealed like payment requests. */
  cashierStore(pub: WalletPublic): CashierStore | undefined {
    const secrets = this.session?.secrets;
    return secrets ? sealedList<CashierData>(pub, secrets, "cashier", "sales", EMPTY_CASHIER) : undefined;
  }

  /** One set of stores per opened wallet, so lists are not reloaded on every render. */
  openStores(): { requests?: RequestStore; contacts?: ContactStore; cashier?: CashierStore } {
    const pub = this.view.name === "open" ? this.view.pub : null;
    if (!pub) return {};
    if (this.stores?.pub !== pub) {
      this.stores = { pub, requests: this.requestStore(pub), contacts: this.contactStore(pub), cashier: this.cashierStore(pub) };
    }
    return this.stores;
  }

  settings(pub: WalletPublic): SettingsActions {
    return {
      kind: pub.kind,
      network: pub.network,
      totpEnabled: pub.totpEnabled,
      node: this.session?.secrets.node?.uri ?? null,
      revealSeed: async (password, code) => {
        const { s } = await this.verifyAccess(password, code);
        if (!s.seed) throw new Error("This wallet has no recovery words.");
        return s.seed;
      },
      approveSend: async (password, code, metadata) => {
        await this.verifyAccess(password, code);
        const until = Date.now() + SEND_APPROVAL_MS;
        for (const m of metadata) this.sendApprovals.set(m, until);
      },
      checkAccess: async (password, code) => {
        await this.verifyAccess(password, code);
      },
      changePassword: async (password, code, newPassword) => {
        await this.verifyAccess(password, code);
        await this.rewriteAll(password, newPassword, (p, s) => [p, s]);
      },
      newTotp() {
        const config = createTotpSecret();
        return { config, uri: totpUri(config, `MonkStash ${pub.primaryAddress.slice(0, 6)}`) };
      },
      enableTotp: async (config, newCode, password) => {
        if (!verifyTotp(config, newCode)) throw new Error("That code does not match. Check the time on your phone and try the newest code.");
        await this.verifyAccess(password, "");
        await this.rewriteAll(password, password, (p, s) => [{ ...p, totpEnabled: true }, { ...s, totp: config }]);
      },
      disableTotp: async (password, code) => {
        await this.verifyAccess(password, code);
        await this.rewriteAll(password, password, (p, s) => {
          const next: WalletSecrets = { ...s };
          delete next.totp;
          return [{ ...p, totpEnabled: false }, next];
        });
      },
      watchOnlyKeys: async (password, code) => {
        const { rec, s } = await this.verifyAccess(password, code);
        return { address: rec.pub.primaryAddress, viewKey: s.privateViewKey, restoreHeight: rec.pub.restoreHeight };
      },
      restoreHeight: pub.restoreHeight,
      rescanFrom: async (height, password, code) => {
        const { rec, s } = await this.verifyAccess(password, code);
        if (!Number.isInteger(height) || height < 0) throw new Error("Choose a valid date or block height.");
        if (height >= rec.pub.restoreHeight) {
          throw new Error(`Choose a date or height earlier than where the wallet starts now (block ${rec.pub.restoreHeight.toLocaleString()}).`);
        }
        const next = updatePublic(rec, { restoreHeight: height }).pub;
        // Stop this engine first, so it cannot save its state again, then drop only this wallet's
        // sync progress. Contacts, requests, sales and the address record are kept.
        this.openGen++;
        await this.settleSave();
        this.stateGen++;
        const w = this.live;
        this.live = null;
        await w?.close().catch(() => {});
        await deleteSyncState(next.id);
        await this.open(next, s);
      },
      exportMove: async (password, code) => {
        const { rec, s } = await this.verifyAccess(password, code);
        const w = this.live;
        if (!w?.exportState) throw new Error("Open the wallet first.");
        if (w.syncing?.()) throw new Error("The wallet is still scanning. Try again when it says Up to date.");
        const { state, height } = await w.exportState();
        const [addresses, requests, contacts, cashier] = await Promise.all([
          handedOutStore(rec.pub, s).load(),
          this.requestStore(rec.pub)?.load(),
          this.contactStore(rec.pub)?.load(),
          this.cashierStore(rec.pub)?.load(),
        ]);
        const bytes = await sealMoveFile({
          primaryAddress: rec.pub.primaryAddress, network: rec.pub.network, kind: rec.pub.kind,
          restoreHeight: rec.pub.restoreHeight, height, engine: state,
          records: { ...(addresses ? { addresses } : {}), ...(requests?.length ? { requests } : {}), ...(contacts?.length ? { contacts } : {}), ...(cashier && (cashier.config || cashier.sales.length) ? { cashier } : {}) },
        }, moveSecretOf(rec.pub.kind, s));
        const day = new Date().toISOString().slice(0, 10);
        return { bytes, filename: `monkstash-move-${rec.pub.network}-${day}.monkstash`, height };
      },
      importMove: async (file, password, code) => {
        const { rec, s } = await this.verifyAccess(password, code);
        const pub = rec.pub;
        const moved = await openMoveFile(file, moveSecretOf(pub.kind, s), { primaryAddress: pub.primaryAddress, network: pub.network, kind: pub.kind });
        const added = await this.mergeMovedRecords(pub, s, moved);

        // Scan progress: only when the file is further along than this device. A running scan is
        // paused first (it stops between answers, a few seconds): the engine answers nothing else
        // while it scans.
        const current = this.live;
        const paused = !!current?.syncing?.();
        if (paused) await withTimeout(current!.haltSync?.() ?? Promise.resolve(), 30_000);
        const here = Math.max(this.savedHeight, current && !current.syncing?.() ? ((await current.height?.().catch(() => 0)) ?? 0) : 0);
        if (moved.height <= here) {
          if (paused) {
            // Keep what this device scanned, then carry on scanning.
            await withTimeout(this.persistState(true), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
            await this.open(pub, s);
          }
          return { height: moved.height, scanReplaced: false, added };
        }
        this.openGen++;
        await this.settleSave();
        this.stateGen++;
        const w = this.live;
        this.live = null;
        await w?.close().catch(() => {});
        const blob = await sealBytes(packParts([utf8.encode(moved.engine.password), moved.engine.keysData, moved.engine.cacheData]), sealSecretOf(s), sealContextOf(pub));
        const saved = await saveSyncState(pub.id, blob);
        const next = moved.restoreHeight < pub.restoreHeight ? updatePublic(rec, { restoreHeight: moved.restoreHeight }).pub : pub;
        await this.open(next, s);
        if (saved !== "saved") throw new Error("This browser did not let the wallet save the moved scan progress, so it scans on its own instead.");
        return { height: moved.height, scanReplaced: true, added };
      },
      saveNode: async (node: NodeConfig | null, password, code) => {
        const { rec, s } = await this.verifyAccess(password, code);
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
        await this.settleSave();
        await withTimeout(this.persistState(), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
        await this.open(rec.pub, next);
      },
    };
  }

  /** The lock in progress: auto-lock, the computer lock and the Lock button can all fire at once. */
  private locking: Promise<void> | null = null;

  lock = (): Promise<void> => {
    this.locking ??= this.lockOnce().finally(() => { this.locking = null; });
    return this.locking;
  };

  private async lockOnce() {
    // Any open() still in progress must not reopen the wallet after this.
    const gen = ++this.openGen;
    this.dropPending();
    // Save progress first (bounded, so locking never hangs), then drop secrets and close. A first
    // sync in progress is stopped so its state can be exported: the scan resumes from there.
    // Locking should be quick. It waits longer only when nothing of this scan is saved anywhere yet
    // (a new or restored wallet's first scan), since giving up then throws all of it away.
    const patience = this.resumed || this.savedHeight > 0 ? STATE_SAVE_ON_LOCK_TIMEOUT_MS : SAVE_IN_FLIGHT_TIMEOUT_MS;
    // A save already under way (often the one right after the first scan) finishes first.
    if (this.saving) await withTimeout(this.saving, patience);
    const running = this.live;
    if (running?.syncing?.()) {
      await withTimeout(running.haltSync?.() ?? Promise.resolve(), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
      // Still inside a large batch: the save would wait for it, so lock now (the scan saved itself
      // within the last minute or so, see the checkpoints in engine.ts).
      if (!running.syncing?.()) await withTimeout(this.persistState(true), patience);
    } else if (this.syncBusy || !this.synced) {
      // The first scan is finishing (the engine has stopped but its sync call has not returned yet)
      // or never finished: save what it got, which a normal save would skip until it is confirmed.
      await withTimeout(this.persistState(true), patience);
    } else {
      await withTimeout(this.persistState(), STATE_SAVE_ON_LOCK_TIMEOUT_MS);
    }
    // Unlocked again while this lock was saving: that newer session stays.
    if (this.openGen !== gen) return;
    const w = this.live;
    this.live = null;
    this.session = null;
    // The stores' closures hold the decrypted secrets: drop them with the session.
    this.stores = null;
    this.sendApprovals.clear();
    this.synced = false;
    this.cashierOn = false;
    this.password = null;
    await withTimeout(w?.close().catch(() => {}) ?? Promise.resolve(), ENGINE_CLOSE_TIMEOUT_MS);
    this.set(viewFor(loadWallets()));
  }

  /**
   * Removes one wallet from this browser: the open one, or the one shown for another network. The
   * other wallets stay; the next one opens if the wallet was unlocked.
   */
  remove = async () => {
    const id = this.session?.pub.id ?? (this.view.name === "otherNetwork" || this.view.name === "locked" ? this.view.record.pub.id : null);
    if (!id) return;
    this.openGen++;
    this.dropPending();
    await this.settleSave();
    this.stateGen++;
    const w = this.live;
    this.live = null;
    this.session = null;
    this.stores = null;
    this.sendApprovals.clear();
    this.synced = false;
    this.cashierOn = false;
    await w?.close().catch(() => {});
    const left = removeWalletRecord(id);
    await deleteWalletData(id);
    if (isDemo && !left) clearDemoSession();
    const next = onThisNetwork(left).find((r) => r.pub.id === left!.active) ?? onThisNetwork(left)[0];
    if (next && this.password) {
      try {
        const s = await unlockWallet(next, this.password);
        await this.open({ ...next.pub, totpEnabled: !!s.totp }, s);
        return;
      } catch {
        /* falls through to the unlock screen */
      }
    }
    this.password = null;
    this.set(viewFor(left));
  };

  /** Removes every wallet from this browser (a forgotten password: they all share it). */
  forgetAll = async () => {
    this.openGen++;
    this.dropPending();
    await this.settleSave();
    this.stateGen++;
    const w = this.live;
    this.live = null;
    this.session = null;
    this.stores = null;
    this.sendApprovals.clear();
    this.password = null;
    await w?.close().catch(() => {});
    removeWallet();
    await clearSyncStates();
    if (isDemo) clearDemoSession();
    this.set({ name: "welcome" });
  };

  /** Closes the engine (page going away). */
  dispose() {
    void this.live?.close();
  }
}
