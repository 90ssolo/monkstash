/**
 * The extension's host page (a Chrome offscreen document): the one place the wallet runs. It holds
 * the wallet controller, the engine and, while unlocked, the decrypted secrets, in memory only.
 * The popup, side panel and tab are views: they draw what the host says and send it calls.
 *
 * Closing a view never stops the wallet. It locks after the idle time (no use in any view), a while
 * after the last view closed, when the computer locks, and when the browser closes (this page and
 * its memory go away).
 */
import { setVisibility, warmEngine, type LiveWallet, type SyncState } from "@/lib/wallet/engine";
import { STATE_SAVE_EVERY_MS, WalletController, type View } from "@/lib/wallet/session";
import { AUTO_LOCK_IDLE_MS, AUTO_LOCK_NO_VIEWS_MS } from "@/lib/wallet/autolock";
import { setVaultMirror, VAULT_KEY } from "@/lib/wallet/storage";
import { post, PORT_NAME, receiver, type Control, type HostState, type ToHost, type ToView } from "../shared/rpc";

const controller = new WalletController();
// Stagenet test builds only: lets automated tests inspect the controller from DevTools.
/** Auto-lock times (the web wallet's defaults; stagenet test builds can shorten them). */
let idleMs = AUTO_LOCK_IDLE_MS;
let noViewsMs = AUTO_LOCK_NO_VIEWS_MS;
if (__TEST_BUILD__) {
  (globalThis as { __monkstash?: unknown }).__monkstash = {
    controller,
    setAutoLock(idle: number, noViews: number) { idleMs = idle; noViewsMs = noViews; },
  };
}
const ports = new Set<chrome.runtime.Port>();
const watchers = new Set<() => void>();

// Background checks run while at least one view is open (see engine.ts Visibility).
setVisibility({
  hidden: () => ports.size === 0,
  watch(cb) {
    watchers.add(cb);
    return () => watchers.delete(cb);
  },
});

function send(port: chrome.runtime.Port, msg: ToView) {
  try {
    post(port, msg);
  } catch (e) {
    // The view just closed, or the answer could not be sent: never leave a call waiting forever.
    if (msg.t === "result" && msg.ok) {
      try { post(port, { t: "result", id: msg.id, ok: false, error: `The answer could not be sent: ${(e as Error).message}` }); } catch { /* closed */ }
    }
  }
}

function broadcast(msg: ToView) {
  for (const p of ports) send(p, msg);
}

/** The controller's view without the live wallet object or the encrypted vault. */
function publicView(v: View): HostState["view"] {
  if (v.name === "open") return { name: "open", pub: v.pub, mode: v.mode, fellBack: v.fellBack, wallets: v.wallets };
  if (v.name === "locked") return { name: v.name, record: { pub: v.record.pub }, count: v.count };
  if (v.name === "otherNetwork") return { name: v.name, record: { pub: v.record.pub } };
  return { ...v };
}

function state(): HostState {
  const v = controller.view;
  const s = v.name === "open" ? controller.settings(v.pub) : null;
  return {
    view: publicView(v),
    saveProblem: controller.saveProblem,
    settings: s ? { kind: s.kind, network: s.network, totpEnabled: s.totpEnabled, node: s.node, restoreHeight: s.restoreHeight } : null,
    syncing: v.name === "open" ? !!v.wallet.syncing?.() : false,
    syncBusy: controller.syncBusy,
    cashierOn: controller.cashierOn,
    walletSeq,
  };
}

let lastView: View | null = null;
controller.subscribe(() => {
  if (controller.view !== lastView) onViewChange(controller.view);
  lastView = controller.view;
  broadcast({ t: "state", state: state() });
});

// ---- One sync per wallet, shared by every view -------------------------------------------------

/** The running (or finished) first sync of the open wallet, so a reopened popup joins it. */
/** Counts opened wallets, so views know when the wallet behind the screens changed. */
let walletSeq = 0;
let lastWallet: LiveWallet | null = null;
let shared: { wallet: LiveWallet; run: Promise<void> | null; done: boolean; last: SyncState | null } | null = null;
let balancesHooked: LiveWallet | null = null;

function onViewChange(v: View) {
  // Start the engine while the password is typed, so the wallet opens sooner after Unlock.
  if (v.name === "locked") void warmEngine();
  if (v.name === "open" && v.wallet !== lastWallet) { lastWallet = v.wallet; walletSeq++; }
  if (v.name !== "open") {
    shared = null;
    balancesHooked = null;
    return;
  }
  if (shared?.wallet !== v.wallet) shared = { wallet: v.wallet, run: null, done: false, last: null };
  if (balancesHooked !== v.wallet) {
    balancesHooked = v.wallet;
    v.wallet.onBalances((b) => broadcast({ t: "event", name: "balances", data: b }));
  }
}

function sharedSync(w: LiveWallet): Promise<void> {
  if (!shared || shared.wallet !== w) shared = { wallet: w, run: null, done: false, last: null };
  const s = shared;
  // A view that opens later (a new popup) joins: it gets the latest progress first.
  if (s.last) broadcast({ t: "event", name: "sync", data: s.last });
  if (s.done) return Promise.resolve();
  s.run ??= w.sync((p) => {
    s.last = p;
    broadcast({ t: "event", name: "sync", data: p });
  }).then(
    // Saving starts here, not when a view says so: the view that ran the scan may be gone.
    () => {
      s.done = true;
      const v = controller.view;
      if (shared === s && v.name === "open" && v.wallet === w) controller.onSynced();
    },
    (e: unknown) => { s.run = null; throw e; },
  ).finally(() => broadcast({ t: "state", state: state() }));
  broadcast({ t: "state", state: state() });
  return s.run;
}

// ---- Calls from views ---------------------------------------------------------------------------

/**
 * What a view may ask of the open wallet: exactly what the screens use. Anything else (notably
 * exportState, which returns the engine's keys file and its password) stays inside this page; the
 * move file, which carries the same data, needs the password and code through Settings.
 */
const WALLET_CALLS = new Set([
  "haltSync", "findTx", "highestSubaddress", "balances", "txs", "newSubaddress", "newRequestAddress",
  "ensureSubaddresses", "prepareMove", "incoming", "proveSent", "checkProof", "syncNow",
  "prepareSend", "prepareSweep", "relay", "height",
]);
/** Settings actions a view may call. Each one checks the password (and code) against the vault. */
const SETTINGS_CALLS = new Set([
  "revealSeed", "checkAccess", "approveSend", "changePassword", "enableTotp", "disableTotp", "watchOnlyKeys",
  "rescanFrom", "exportMove", "importMove", "saveNode",
]);

function openWallet(): LiveWallet {
  const v = controller.view;
  if (v.name !== "open") throw new Error("The wallet is locked.");
  return v.wallet;
}

/** Calls made by a screen that still shows a wallet engine which has since been replaced. */
const STALE = "The wallet was reopened. Try again.";

/** Who made a call: the person (counts as use for the idle lock) or a screen polling on its own. */
const PERSON_CALLS = new Set(["unlock", "submitCode", "onboarded", "pick"]);

async function handle(target: string, method: string, args: unknown[], seq?: number): Promise<unknown> {
  if (target === "controller") {
    switch (method) {
      case "unlock": return controller.unlock(args[0] as string);
      case "submitCode": return controller.submitCode(args[0] as string);
      case "lock": return controller.lock();
      case "remove": return controller.remove();
      case "forgetAll": return controller.forgetAll();
      case "startAdd": return controller.startAdd();
      case "cancelAdd": return controller.cancelAdd();
      case "switchTo": return controller.switchTo(String(args[0]));
      case "rename": return controller.rename(String(args[0]));
      case "pick": return controller.pick(args[0] as Parameters<WalletController["pick"]>[0]);
      case "onboarded": return controller.onboarded(args[0] as Parameters<WalletController["onboarded"]>[0]);
      case "onSynced": return controller.onSynced();
      case "setCashierOn": {
        // Only a change is news: every view reports its till state on each of its renders.
        const on = !!args[0];
        if (controller.cashierOn === on) return;
        controller.cashierOn = on;
        broadcast({ t: "state", state: state() });
        return;
      }
    }
  }
  if (target === "wallet") {
    const w = openWallet();
    if (seq !== undefined && seq !== walletSeq) throw new Error(STALE);
    switch (method) {
      case "sync": return sharedSync(w);
      case "health": return w.health?.() ?? null;
      // The period is the engine's own (20 s): a view cannot make it poll the node faster.
      case "startBackgroundSync": return w.startBackgroundSync();
    }
    if (!WALLET_CALLS.has(method)) throw new Error(`Unknown wallet call: ${method}`);
    const fn = (w as unknown as Record<string, unknown>)[method];
    if (typeof fn !== "function") throw new Error(`Unknown wallet call: ${method}`);
    return (fn as (...a: unknown[]) => unknown).apply(w, args);
  }
  if (target === "settings") {
    const v = controller.view;
    if (v.name !== "open") throw new Error("The wallet is locked.");
    if (!SETTINGS_CALLS.has(method)) throw new Error(`Unknown settings call: ${method}`);
    const fn = (controller.settings(v.pub) as unknown as Record<string, unknown>)[method];
    if (typeof fn !== "function") throw new Error(`Unknown settings call: ${method}`);
    return (fn as (...a: unknown[]) => unknown)(...args);
  }
  if (target === "requests" || target === "contacts" || target === "cashier") {
    const store = controller.openStores()[target];
    if (!store) throw new Error("The wallet is locked.");
    if (method === "load") return store.load();
    if (method === "save") return (store.save as (v: unknown) => Promise<void>)(args[0]);
  }
  throw new Error(`Unknown call: ${target}.${method}`);
}

// ---- Views connecting and leaving ----------------------------------------------------------------

let lastActive = performance.now();
let noViewsSince: number | null = performance.now();

/** Only this extension's own pages talk to the host (there are no content scripts or external pages). */
const fromThisExtension = (sender?: chrome.runtime.MessageSender) =>
  sender?.id === chrome.runtime.id && (!sender.url || sender.url.startsWith(chrome.runtime.getURL("")));

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== PORT_NAME || !fromThisExtension(port.sender)) return;
  ports.add(port);
  noViewsSince = null;
  lastActive = performance.now();
  for (const cb of watchers) cb();
  send(port, { t: "state", state: state() });
  if (shared?.last && !shared.done) send(port, { t: "event", name: "sync", data: shared.last });
  const { listen, drop } = receiver((m) => {
    const msg = m as ToHost;
    if (msg.t === "activity") { lastActive = performance.now(); return; }
    if (msg.t !== "call") return;
    // Screens poll the host on their own (payments, node health): only real use resets the idle lock.
    if (msg.target === "controller" && PERSON_CALLS.has(msg.method)) lastActive = performance.now();
    handle(msg.target, msg.method, Array.isArray(msg.args) ? msg.args : [], msg.seq).then(
      (value) => send(port, { t: "result", id: msg.id, ok: true, value }),
      (e: unknown) => send(port, { t: "result", id: msg.id, ok: false, error: (e as Error)?.message || String(e), name: (e as Error)?.name }),
    );
  }, (error) => send(port, { t: "result", id: -1, ok: false, error }));
  port.onMessage.addListener(listen);
  port.onDisconnect.addListener(() => {
    ports.delete(port);
    drop();
    if (ports.size === 0) {
      noViewsSince = performance.now();
      // Firefox suspends this page about 30 s after the last view's heartbeat, which would drop the
      // wallet without saving. Lock first (it saves), unless a view comes back within a few seconds.
      if (__FIREFOX__) setTimeout(() => { if (ports.size === 0 && controller.unlocked) void controller.lock(); }, FIREFOX_LAST_VIEW_MS);
    }
    for (const cb of watchers) cb();
  });
});

/** Firefox: how long after the last view closed the host locks itself (a reopened popup cancels it). */
const FIREFOX_LAST_VIEW_MS = 5_000;

// Chrome: the service worker forwards the computer's lock state (chrome.idle is not available in an
// offscreen document). Firefox: this page is the background page, so it starts itself, answers the
// views' "ensure-host" and heartbeats, and watches the computer's lock state directly.
chrome.runtime.onMessage.addListener((raw, sender, reply) => {
  if (!fromThisExtension(sender)) return false;
  const msg = raw as Control;
  if (msg?.t === "idle-state" && msg.state === "locked" && controller.unlocked) void controller.lock();
  if (__FIREFOX__ && (msg?.t === "ensure-host" || msg?.t === "heartbeat")) reply({ ok: true });
  return false;
});
if (__FIREFOX__) {
  chrome.idle.setDetectionInterval(60);
  chrome.idle.onStateChanged.addListener((state) => {
    if (state === "locked" && controller.unlocked) void controller.lock();
  });
  chrome.runtime.onInstalled.addListener((details) => {
    // First install: onboarding happens in a full tab, never in the small popup.
    if (details.reason === "install") void chrome.tabs.create({ url: chrome.runtime.getURL("tab.html") });
  });
}

// ---- Auto-lock and periodic saves ------------------------------------------------------------------

setInterval(() => {
  const v = controller.view;
  if (v.name !== "open") return;
  // A watch-only till stays open all shift (as on the web).
  if (controller.cashierOn && v.pub.kind === "view-only") return;
  const now = performance.now();
  // While the first scan runs with a view open, waiting is not idleness (as on the web).
  if (controller.syncBusy && ports.size > 0) lastActive = now;
  if (now - lastActive >= idleMs) void controller.lock();
  else if (noViewsSince !== null && now - noViewsSince >= noViewsMs) void controller.lock();
}, __TEST_BUILD__ ? 2_000 : 15_000);

setInterval(() => {
  if (controller.unlocked) void controller.persistState();
}, STATE_SAVE_EVERY_MS);

/**
 * The encrypted wallet record lives in this page's localStorage (shared code with the web wallet),
 * with a copy in the extension's own storage. Firefox clears an extension's localStorage when
 * someone clears their browsing history and site data; extension storage survives that. On start,
 * a missing record is restored from the copy, and a record without a copy (an older version) gets
 * one. Only the encrypted record is copied: it is useless without the wallet password.
 */
// Firefox: this page (the background page) uses extension storage itself. Chrome: an offscreen
// document cannot, so the service worker does it (sw.ts).
async function readVaultCopy(): Promise<unknown> {
  if (chrome.storage?.local) return (await chrome.storage.local.get(VAULT_KEY))[VAULT_KEY];
  const r = (await chrome.runtime.sendMessage({ t: "vault-copy-get" } satisfies Control)) as { ok: boolean; value?: unknown; error?: string };
  if (!r?.ok) throw new Error(r?.error ?? "no answer");
  return r.value;
}
async function writeVaultCopy(value: string | null): Promise<void> {
  if (chrome.storage?.local) return value === null ? chrome.storage.local.remove(VAULT_KEY) : chrome.storage.local.set({ [VAULT_KEY]: value });
  const r = (await chrome.runtime.sendMessage({ t: "vault-copy-set", value } satisfies Control)) as { ok: boolean; error?: string };
  if (!r?.ok) throw new Error(r?.error ?? "no answer");
}

async function keepVaultCopy(): Promise<void> {
  let local: string | null = null;
  try { local = window.localStorage.getItem(VAULT_KEY); } catch { /* storage blocked */ }
  try {
    const copy = await readVaultCopy();
    if (!local && typeof copy === "string") window.localStorage.setItem(VAULT_KEY, copy);
    else if (local && copy !== local) await writeVaultCopy(local);
  } catch (e) {
    console.warn("[host] could not reach extension storage:", (e as Error).message);
  }
  setVaultMirror((value) => { void writeVaultCopy(value).catch(() => {}); });
  // Ask the browser to keep this extension's data (scan progress, records) under storage pressure.
  void navigator.storage?.persist?.().catch(() => false);
}

void keepVaultCopy().finally(() => {
  controller.start();
  void chrome.runtime.sendMessage({ t: "host-ready" } satisfies Control).catch(() => {});
});
