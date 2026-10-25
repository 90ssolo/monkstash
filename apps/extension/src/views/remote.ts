/**
 * A view's connection to the host page, and stand-ins for the objects the web wallet's screens
 * expect (LiveWallet, SettingsActions, the sealed lists). Every method is a call to the host, where
 * the real wallet runs: the screens are shared with the website unchanged.
 */
import { createTotpSecret, totpUri, type WalletPublic } from "@quietmint/wallet-core";
import type { Balances, LiveWallet, SyncHealth, SyncState } from "@/lib/wallet/engine";
import type { SettingsActions } from "@/components/wallet/WalletSettings";
import type { RequestStore } from "@/lib/wallet/requests";
import type { LabelStore } from "@/lib/wallet/session";
import type { ContactStore } from "@/lib/wallet/contacts";
import type { CashierStore } from "@/lib/wallet/cashier";
import { StorageError } from "@/lib/wallet/stateStore";
import { post, PORT_NAME, receiver, type Control, type HostState, type ToHost, type ToView } from "../shared/rpc";

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void };

/** Firefox heartbeat period: well inside its 30 s idle limit for background pages. */
const HEARTBEAT_MS = 10_000;

export class HostConnection {
  state: HostState | null = null;
  /** Set when the wallet page cannot be reached at all (shown instead of a stale screen). */
  error: string | null = null;
  private port: chrome.runtime.Port | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private stateListeners = new Set<() => void>();
  private eventListeners = new Map<string, Set<(data: unknown) => void>>();
  private connecting: Promise<void> | null = null;

  private heartbeat: ReturnType<typeof setInterval> | null = null;

  /** Starts the host if needed and connects. Resolves once the first state arrived. */
  connect(): Promise<void> {
    // Firefox suspends an idle background page even while ports are open; messages keep it loaded.
    if (__FIREFOX__ && !this.heartbeat) {
      this.heartbeat = setInterval(() => void chrome.runtime.sendMessage({ t: "heartbeat" } satisfies Control).catch(() => {}), HEARTBEAT_MS);
    }
    this.connecting ??= this.open().finally(() => { this.connecting = null; });
    return this.connecting;
  }

  private async open(): Promise<void> {
    for (let attempt = 0; ; attempt++) {
      const res = await chrome.runtime.sendMessage<{ ok: boolean; error?: string }>({ t: "ensure-host" } satisfies Control);
      if (!res?.ok) throw new Error(res?.error ?? "The wallet could not start.");
      const port = chrome.runtime.connect({ name: PORT_NAME });
      const first = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 3000);
        const { listen } = receiver((msg) => this.onMessage(msg as ToView, () => {
          // Ready before anyone hears about the first state: screens call the host straight away.
          this.port = port;
          clearTimeout(timer);
          resolve(true);
        }));
        port.onMessage.addListener(listen);
        port.onDisconnect.addListener(() => { clearTimeout(timer); resolve(false); this.onDisconnect(port); });
      });
      if (first) return;
      port.disconnect();
      // The host page may still be starting: try again, a little later each time.
      if (attempt >= 5) throw new Error("The wallet did not answer. Close this window and open it again.");
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }

  private onMessage(msg: ToView, onFirstState: () => void) {
    if (msg.t === "state") {
      this.state = msg.state;
      if (!this.port) onFirstState();
      for (const fn of this.stateListeners) fn();
    } else if (msg.t === "result") {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.value);
      else p.reject(rebuildError(msg.error, msg.name));
    } else if (msg.t === "event") {
      for (const fn of this.eventListeners.get(msg.name) ?? []) fn(msg.data);
    }
  }

  private onDisconnect(port: chrome.runtime.Port) {
    if (this.port !== port) return;
    this.port = null;
    for (const p of this.pending.values()) p.reject(new Error("The wallet closed. Open MonkStash again."));
    this.pending.clear();
    // Nothing on screen may pretend to be live: show loading until the host answers again.
    this.state = null;
    this.notify();
    // The host went away (browser update, crash): reconnect, which starts a fresh, locked host.
    void this.connect().catch((e: unknown) => {
      this.error = (e as Error).message;
      this.notify();
    });
  }

  private notify() {
    for (const fn of this.stateListeners) fn();
  }

  call<T = unknown>(target: string, method: string, ...args: unknown[]): Promise<T> {
    return this.callAt<T>(undefined, target, method, ...args);
  }

  /** A call tied to one opened wallet engine (`seq`): the host refuses it once that engine was replaced. */
  callAt<T = unknown>(seq: number | undefined, target: string, method: string, ...args: unknown[]): Promise<T> {
    const port = this.port;
    if (!port) return Promise.reject(new Error("The wallet is not connected yet."));
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      try {
        post(port, { t: "call", id, target, method, args, ...(seq !== undefined ? { seq } : {}) } satisfies ToHost);
      } catch (e) {
        this.pending.delete(id);
        reject(new Error(`The wallet could not be reached: ${(e as Error).message}`));
      }
    });
  }

  activity() {
    try {
      this.port?.postMessage({ t: "activity" } satisfies ToHost);
    } catch {
      /* reconnecting */
    }
  }

  onState(fn: () => void): () => void {
    this.stateListeners.add(fn);
    return () => this.stateListeners.delete(fn);
  }

  on(name: string, fn: (data: unknown) => void): () => void {
    let set = this.eventListeners.get(name);
    if (!set) this.eventListeners.set(name, (set = new Set()));
    set.add(fn);
    return () => set.delete(fn);
  }
}

/** Errors keep their kind across messaging where a screen checks it (for example StorageError). */
function rebuildError(message: string, name?: string): Error {
  if (name === "StorageError") return new StorageError(message);
  const e = new Error(message);
  if (name) e.name = name;
  return e;
}

/** The open wallet as the screens see it, plus `dispose()` for when its screens go away. */
export type RemoteWallet = LiveWallet & { dispose(): void };

/** The open wallet, as the screens see it. Calls run in the host's engine opened as `seq`. */
export function remoteWallet(host: HostConnection, pub: WalletPublic, seq: number): RemoteWallet {
  const call = <T>(method: string, ...args: unknown[]) => host.callAt<T>(seq, "wallet", method, ...args);
  let health: SyncHealth | null = null;
  const readHealth = () => void call<SyncHealth | null>("health").then((h) => { health = h; }).catch(() => {});
  readHealth();
  const timer = setInterval(readHealth, 5000);
  const offs: (() => void)[] = [];
  return {
    dispose() {
      clearInterval(timer);
      for (const off of offs.splice(0)) off();
    },
    primaryAddress: pub.primaryAddress,
    async sync(onProgress: (s: SyncState) => void) {
      const off = host.on("sync", (s) => onProgress(s as SyncState));
      try {
        await call("sync");
      } finally {
        off();
      }
    },
    syncing: () => !!host.state?.syncBusy,
    haltSync: () => call("haltSync"),
    startBackgroundSync: (periodMs?: number) => call("startBackgroundSync", periodMs),
    health: () => health ?? { lastOk: null, lastError: null },
    findTx: (hash) => call("findTx", hash),
    highestSubaddress: (account) => call("highestSubaddress", account),
    onBalances(cb: (b: Balances) => void) {
      offs.push(host.on("balances", (b) => cb(b as Balances)));
    },
    balances: () => call("balances"),
    txs: () => call("txs"),
    newSubaddress: (label) => call("newSubaddress", label),
    newRequestAddress: (label, expected, account) => call("newRequestAddress", label, expected, account),
    ensureSubaddresses: (account, index) => call("ensureSubaddresses", account, index),
    prepareMove: (account) => call("prepareMove", account),
    incoming: () => call("incoming"),
    coins: () => call("coins"),
    freezeCoin: (keyImage, frozen) => call("freezeCoin", keyImage, frozen),
    proveSent: (hash, address, message) => call("proveSent", hash, address, message),
    checkProof: (p) => call("checkProof", p),
    syncNow: () => call("syncNow"),
    prepareSend: (destinations, options) => call("prepareSend", destinations, options),
    prepareSweep: (address, options) => call("prepareSweep", address, options),
    relay: (metadata) => call("relay", metadata),
    height: () => call("height"),
    // Views never close the engine; locking does (in the host).
    close: async () => {},
  };
}

/** Settings actions: each one checks the password in the host, against the stored vault. */
/** The host permission pattern for a node address (match patterns carry no port). */
function nodePattern(uri: string): string {
  const u = new URL(uri);
  return `${u.protocol}//${u.hostname}/*`;
}

/**
 * Asks for access to the user's own node. Must run inside the click that saved it: Chrome only
 * shows the prompt during a user gesture, so this is the first thing saveNode does.
 */
async function allowNode(uri: string): Promise<void> {
  let granted: boolean;
  try {
    granted = await chrome.permissions.request({ origins: [nodePattern(uri)] });
  } catch {
    throw new Error(new URL(uri).hostname.endsWith(".onion")
      ? "This browser cannot reach .onion addresses. Use your node's https:// address instead."
      : "This browser did not let MonkStash ask for access to that node. Try again.");
  }
  if (!granted) throw new Error("MonkStash needs your permission to connect to that node. Nothing was changed.");
}

/** Drops access to a node that is no longer used (best effort). */
export function forgetNode(uri: string | null) {
  if (!uri) return;
  try {
    void chrome.permissions.remove({ origins: [nodePattern(uri)] }).catch(() => {});
  } catch {
    /* not a valid address: nothing was granted */
  }
}

export function remoteSettings(host: HostConnection, pub: WalletPublic, openFullView?: () => void): SettingsActions | undefined {
  const s = host.state?.settings;
  if (!s) return undefined;
  const call = <T>(method: string, ...args: unknown[]) => host.call<T>("settings", method, ...args);
  return {
    kind: s.kind as SettingsActions["kind"],
    network: s.network as SettingsActions["network"],
    totpEnabled: s.totpEnabled,
    node: s.node,
    restoreHeight: s.restoreHeight,
    seedPassphrase: !!s.seedPassphrase,
    ...(s.seedWords ? { seedWords: s.seedWords } : {}),
    revealSeed: (password, code) => call("revealSeed", password, code),
    sweepStart: (input) => call("sweepStart", input),
    sweepStatus: () => call("sweepStatus"),
    sweepPrepare: (speed) => call("sweepPrepare", speed),
    sweepSend: (password, code) => call("sweepSend", password, code),
    sweepCancel: () => call("sweepCancel"),
    gifts: () => call("gifts"),
    giftPrepare: (amount, message, speed) => call("giftPrepare", amount, message, speed),
    giftSend: (password, code) => call("giftSend", password, code),
    giftCancel: () => call("giftCancel"),
    giftForget: (id) => call("giftForget", id),
    giftOpen: (linkOrId) => call("giftOpen", linkOrId),
    checkAccess: (password, code) => call("checkAccess", password, code),
    approveSend: (password, code, metadata) => call("approveSend", password, code, metadata),
    changePassword: (password, code, next) => call("changePassword", password, code, next),
    // A new authenticator secret is made here, shown as a QR, and saved by enableTotp in the host.
    newTotp() {
      const config = createTotpSecret();
      return { config, uri: totpUri(config, `MonkStash ${pub.primaryAddress.slice(0, 6)}`) };
    },
    enableTotp: (config, code, password) => call("enableTotp", config, code, password),
    disableTotp: (password, code) => call("disableTotp", password, code),
    watchOnlyKeys: (password, code) => call("watchOnlyKeys", password, code),
    rescanFrom: (height, password, code) => call("rescanFrom", height, password, code),
    exportMove: (password, code) => call("exportMove", password, code),
    importMove: (file, password, code) => call("importMove", file, password, code),
    async saveNode(node, password, code) {
      const before = s.node;
      if (node) await allowNode(node.uri);
      try {
        await call("saveNode", node, password, code);
      } catch (e) {
        // The node was not saved: give back the access asked for just now.
        if (node && nodePattern(node.uri) !== (before ? nodePattern(before) : null)) forgetNode(node.uri);
        throw e;
      }
      if (before && (!node || nodePattern(node.uri) !== nodePattern(before))) forgetNode(before);
    },
    ...(openFullView ? { openFullView } : {}),
  };
}

function remoteList<T>(host: HostConnection, target: string): { load(): Promise<T>; save(v: T): Promise<void> } {
  return {
    load: () => host.call<T>(target, "load"),
    save: (v) => host.call<void>(target, "save", v),
  };
}

export const remoteRequests = (host: HostConnection) => remoteList(host, "requests") as RequestStore;
export const remoteContacts = (host: HostConnection) => remoteList(host, "contacts") as ContactStore;
export const remoteCashier = (host: HostConnection) => remoteList(host, "cashier") as CashierStore;
export const remoteLabels = (host: HostConnection) => remoteList(host, "labels") as LabelStore;
