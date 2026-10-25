"use client";
/**
 * Thin, typed wrapper around monero-ts (WebAssembly). This is the only file that talks
 * to the wallet engine, so UI code never handles monero-ts objects directly.
 *
 * The engine runs inside a Web Worker (proxyToWorker) and reaches the node through our
 * same-origin proxy at /api/node.
 */
import type { NetworkType, NodeConfig, WalletKind } from "@quietmint/wallet-core";
import { encodePrimaryAddress, exodusSpendKey, isMyMoneroPhrase, myMoneroKeys, type PaymentProof } from "@quietmint/wallet-core";
import { API_ORIGIN } from "./config";

type MoneroTs = typeof import("monero-ts").default;
type MoneroWalletFull = import("monero-ts").MoneroWalletFull;

let libPromise: Promise<MoneroTs> | null = null;

/** Lazily loads the engine; never imported on content pages. */
export function loadEngine(): Promise<MoneroTs> {
  libPromise ??= import("monero-ts").then((m) => {
    const lib = m.default;
    lib.LibraryUtils.setWorkerDistPath("/monero/monero.worker.js");
    return lib;
  });
  return libPromise;
}

/**
 * Starts the engine (its Web Worker and WebAssembly) ahead of time, for example while the user
 * types the unlock password, so opening the wallet does not wait for it. Errors are ignored:
 * the real open reports them.
 */
export async function warmEngine(): Promise<void> {
  try {
    const lib = await loadEngine();
    // The first message to the worker loads the WebAssembly engine inside it.
    await lib.LibraryUtils.getWasmMemoryUsed().catch(() => {});
  } catch {
    /* the open that follows will show any problem */
  }
}

/**
 * Whether anyone can see the wallet. Background checks pause while nobody can (saves the node and
 * the battery) and run at once when someone looks again. A web page asks the tab; the browser
 * extension's host page has no screen of its own, so it reports whether any of its views is open.
 */
export interface Visibility {
  hidden(): boolean;
  /** Calls `cb` whenever `hidden()` may have changed. Returns the unsubscribe function. */
  watch(cb: () => void): () => void;
}

const pageVisibility: Visibility = {
  hidden: () => document.hidden,
  watch(cb) {
    document.addEventListener("visibilitychange", cb);
    return () => document.removeEventListener("visibilitychange", cb);
  },
};
let visibility: Visibility = pageVisibility;

/** Replaces the tab-visibility check (the extension host calls this once, before opening a wallet). */
export function setVisibility(v: Visibility): void {
  visibility = v;
}

/** Node endpoints are served at our origin root (see rewrites in next.config.ts). */
function serverUri(): string {
  return API_ORIGIN || window.location.origin;
}

/**
 * Where the engine connects: the user's own node if set (directly from this browser, so our
 * relay sees nothing), otherwise our same-origin relay.
 */
function serverFor(node?: NodeConfig): { uri: string; username?: string; password?: string } {
  return node ? { uri: node.uri, username: node.username || undefined, password: node.password || undefined } : { uri: serverUri() };
}

export type NodeTestFailure = "unreachable" | "wrong-network" | "timeout";
export class NodeTestError extends Error {
  constructor(public readonly reason: NodeTestFailure, message: string) { super(message); }
}

/**
 * Connects to a node from inside the engine's worker and reads its status. Fails if it cannot
 * be reached (address, HTTPS certificate, CORS or login), or runs a different network.
 */
export async function testNode(node: NodeConfig, network: NetworkType): Promise<{ height: number; synced: boolean }> {
  const lib = await loadEngine();
  const attempt = (async () => {
    let info;
    try {
      const daemon = await lib.connectToDaemonRpc({ ...serverFor(node), proxyToWorker: true } as never);
      info = await daemon.getInfo();
    } catch {
      throw new NodeTestError("unreachable", "unreachable");
    }
    const nettype = String(lib.MoneroNetworkType.toString(info.getNetworkType())).toLowerCase();
    if (nettype !== network) throw new NodeTestError("wrong-network", nettype);
    return { height: info.getHeight() ?? 0, synced: !!info.getIsSynchronized() };
  })();
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new NodeTestError("timeout", "timeout")), 20_000));
  return Promise.race([attempt, timeout]);
}

export interface NewWalletKeys {
  seed: string;
  primaryAddress: string;
  privateViewKey: string;
  restoreHeight: number;
}

/** Generates a brand new wallet. Uses the node only to learn the current height. */
export async function generateWallet(network: NetworkType, fallbackHeight: number): Promise<NewWalletKeys> {
  const lib = await loadEngine();
  let restoreHeight = fallbackHeight;
  try {
    const daemon = await lib.connectToDaemonRpc({ uri: serverUri(), proxyToWorker: true } as never);
    restoreHeight = await daemon.getHeight();
  } catch {
    // Node unreachable: use the caller's offline estimate. It is only safe if it errs early, so callers
    // pass one with the default safety margin (estimateHeightAt without a marginDays of 0).
  }
  const keys = await lib.createWalletKeys({ networkType: network, language: "English" });
  return {
    seed: await keys.getSeed(),
    primaryAddress: await keys.getPrimaryAddress(),
    privateViewKey: await keys.getPrivateViewKey(),
    restoreHeight,
  };
}

/**
 * Keys and address for a MyMonero 13-word phrase. The private keys come from wallet-core
 * (MyMonero's own derivation); the engine computes the matching public keys, and the address
 * is encoded from them. When the wallet is opened, the engine re-checks that this address
 * belongs to these keys and refuses otherwise.
 */
async function myMoneroWallet(phrase: string, network: NetworkType) {
  const lib = await loadEngine();
  const { privateSpendKey, privateViewKey } = myMoneroKeys(phrase);
  // A keys-only wallet built from a private scalar reports scalar * G as its public spend key.
  const spend = await lib.createWalletKeys({ networkType: network, privateSpendKey } as never);
  const view = await lib.createWalletKeys({ networkType: network, privateSpendKey: privateViewKey } as never);
  const primaryAddress = encodePrimaryAddress(network, await spend.getPublicSpendKey(), await view.getPublicSpendKey());
  return { primaryAddress, privateSpendKey, privateViewKey };
}

/**
 * Turns an Exodus 12-word phrase into the standard 25-word Monero seed of the same wallet
 * (wallet-core derives the spend key; the engine encodes it as a seed). From then on it is an
 * ordinary Monero seed that restores in any wallet. Verified against Cake Wallet's vectors.
 */
export async function exodusToMoneroSeed(phrase: string, network: NetworkType): Promise<string> {
  const lib = await loadEngine();
  const keys = await lib.createWalletKeys({ networkType: network, privateSpendKey: exodusSpendKey(phrase) } as never);
  return keys.getSeed();
}

/** The secret a full wallet's move file is sealed with: its words, and its passphrase when it has one. */
export function fullMoveSecret(seed: string, seedOffset?: string): string {
  return normalizeSeed(seed) + (seedOffset ? `\u0000${seedOffset}` : "");
}

/**
 * Reads a 16-word Polyseed (Cake Wallet, Feather) with the reference library and returns the same
 * wallet as a 25-word seed, as Monero's own wallet code does: the library's key is the spend key,
 * and a passphrase on a phrase that is not encrypted is the seed offset. An encrypted phrase is
 * decrypted with the passphrase instead. `birthday` is when the wallet was made (unix seconds).
 */
export async function polyseedWallet(phrase: string, passphrase: string, network: NetworkType): Promise<{ seed: string; seedOffset?: string; polyseed: string; encrypted: boolean; birthday: number }> {
  const { decodePolyseed, spendKeyHex } = await import("@quietmint/polyseed");
  const d = await decodePolyseed(phrase, passphrase);
  const lib = await loadEngine();
  const keys = await lib.createWalletKeys({ networkType: network, privateSpendKey: spendKeyHex(d.key) } as never);
  d.key.fill(0);
  const seed = await keys.getSeed();
  return {
    seed,
    ...(!d.encrypted && passphrase ? { seedOffset: passphrase } : {}),
    polyseed: phrase.trim().split(/\s+/).join(" ").toLowerCase(),
    encrypted: d.encrypted,
    birthday: d.birthday,
  };
}

/** A fresh one-off wallet for a gift link: the spend key goes in the link, the gift is paid to the address. */
export async function newGiftKeys(network: NetworkType): Promise<{ spendKey: string; address: string }> {
  const lib = await loadEngine();
  const keys = await lib.createWalletKeys({ networkType: network, language: "English" });
  return { spendKey: await keys.getPrivateSpendKey(), address: await keys.getPrimaryAddress() };
}

/** The gift wallet behind a link's spend key, as recovery words (what a sweep opens) and its address. */
export async function giftWallet(spendKey: string, network: NetworkType): Promise<{ seed: string; address: string }> {
  const lib = await loadEngine();
  try {
    const keys = await lib.createWalletKeys({ networkType: network, privateSpendKey: spendKey } as never);
    return { seed: await keys.getSeed(), address: await keys.getPrimaryAddress() };
  } catch {
    throw new Error("This gift link does not hold a valid key. Ask the sender to copy it again.");
  }
}

/** Derives address and view key from recovery words without touching the network. */
export async function inspectSeed(seed: string, network: NetworkType, seedOffset?: string): Promise<{ primaryAddress: string; privateViewKey: string }> {
  if (isMyMoneroPhrase(seed)) {
    const { primaryAddress, privateViewKey } = await myMoneroWallet(seed, network);
    return { primaryAddress, privateViewKey };
  }
  const lib = await loadEngine();
  const keys = await lib.createWalletKeys({ networkType: network, seed: normalizeSeed(seed), ...(seedOffset ? { seedOffset } : {}) });
  return { primaryAddress: await keys.getPrimaryAddress(), privateViewKey: await keys.getPrivateViewKey() };
}

export function normalizeSeed(seed: string): string {
  return seed.trim().toLowerCase().split(/\s+/).join(" ");
}

export async function validateAddress(address: string, network: NetworkType): Promise<boolean> {
  const lib = await loadEngine();
  try {
    await lib.MoneroUtils.validateAddress(address.trim(), network);
    return true;
  } catch {
    return false;
  }
}

export interface OpenParams {
  kind: WalletKind;
  network: NetworkType;
  restoreHeight: number;
  seed?: string;
  /** Seed passphrase for a 25-word seed (see WalletSecrets.seedOffset). */
  seedOffset?: string;
  primaryAddress?: string;
  privateViewKey?: string;
  /** Previously exported engine state (decrypted by the caller). Resumes sync where it stopped. */
  saved?: EngineState;
  /** The user's own node; absent means our relay. */
  node?: NodeConfig;
}

/**
 * The engine's own wallet files, as exported by monero-ts getData(): a keys file encrypted
 * with `password` (a random per-wallet engine password, not the user's) and a cache file
 * holding sync progress and history. The cache is bound to that exact keys file, so both are
 * kept together. Callers must store this only inside a sealed blob (wallet-core sealed.ts).
 */
export interface EngineState {
  password: string;
  keysData: Uint8Array;
  cacheData: Uint8Array;
}

/** monero-ts types getData() as DataView, but returns Uint8Array at runtime; accept either. */
/**
 * True when the private view key belongs to this address. The official wallet code (wallet2,
 * via monero-ts) refuses a mismatched pair, so a typo cannot silently give a wallet that shows
 * 0 XMR forever.
 */
export async function viewKeyMatches(address: string, privateViewKey: string, network: NetworkType): Promise<boolean> {
  const lib = await loadEngine();
  try {
    const w = await lib.createWalletKeys({ networkType: network, primaryAddress: address.trim(), privateViewKey: privateViewKey.trim().toLowerCase() } as never);
    const ok = (await w.getPrimaryAddress()) === address.trim();
    await w.close().catch(() => {});
    return ok;
  } catch {
    return false;
  }
}

/** Turns the engine's technical send errors into plain words; anything unknown passes through. */
export function friendlySendError(err: unknown): Error {
  const raw = (err as Error)?.message ?? String(err);
  const m = raw.toLowerCase();
  // Dev builds keep the engine's own words in the console; they hold no keys, only the failure.
  if (process.env.NODE_ENV !== "production") console.warn("[send] engine error:", raw);
  if (m.includes("not enough unlocked")) return new Error("Part of your balance is still locked: new payments become spendable after 10 confirmations (about 20 minutes). Try a smaller amount or wait.");
  if (m.includes("not enough money") || m.includes("insufficient")) return new Error("Not enough spendable balance for this amount plus the network fee. Lower the amount, or use Send all.");
  if (m.includes("too large") || m.includes("tx_too_big")) return new Error("This payment needs too many small inputs for one transaction. Send part of it first, then the rest.");
  if (m.includes("invalid") && m.includes("address")) return new Error("That address is not valid for this network. Copy it again.");
  if (m.includes("daemon") || m.includes("network") || m.includes("fetch") || m.includes("timeout")) return new Error("The Monero node did not answer. Check your connection, or choose another node in Settings, then try again.");
  return new Error(raw);
}

function toBytes(d: unknown): Uint8Array {
  if (d instanceof Uint8Array) return d;
  if (ArrayBuffer.isView(d)) return new Uint8Array(d.buffer, d.byteOffset, d.byteLength);
  throw new Error("The wallet engine returned no wallet data");
}

/** Thrown when saved state does not belong to the expected wallet; callers discard it. */
export class SavedStateMismatch extends Error {
  constructor() { super("Saved wallet state does not match this wallet"); }
}

export interface SyncState {
  height: number;
  startHeight: number;
  endHeight: number;
  percent: number; // 0..1
  done: boolean;
}

export interface Balances {
  /** Everything the wallet holds, in every account. */
  total: bigint;
  /** Spendable now from the main account (account 0), which is where Send spends from. */
  unlocked: bigint;
  /** Money in other accounts (MonkStash Pay, tills), to move into the main account. */
  other?: { account: number; balance: bigint; unlocked: bigint }[];
  /** Frozen coins in the main account. The engine leaves them out of `total` and `unlocked`. */
  frozen?: bigint;
}

/**
 * One coin: a payment received and not yet spent (an output, in Monero terms). Frozen coins stay
 * out of every payment until they are unfrozen. Only full wallets know a coin's key image, so only
 * they can freeze.
 */
export interface Coin {
  keyImage: string;
  amount: bigint;
  subaddressIndex: number;
  /** The transaction it arrived in. */
  hash: string;
  height?: number;
  /** Block time in seconds, once confirmed. */
  timestamp?: number;
  frozen: boolean;
  /** Not spendable yet: fewer than 10 confirmations. */
  locked: boolean;
}

/**
 * Accounts inside one wallet keep different address counters, so tools on different devices
 * never hand out the same address: 0 is the wallet itself (Receive, payment links), 1 is
 * MonkStash Pay (its PAY_ACCOUNT default), and till number N (1 to 8) uses account N + 1.
 */
export const MAIN_ACCOUNT = 0;
export const tillAccount = (tillNumber: number) => tillNumber + 1;
export const ACCOUNT_NAME = (account: number) => account === 0 ? "Main" : account === 1 ? "Shop checkout (MonkStash Pay)" : `Till ${account - 1}`;

export interface TxSummary {
  hash: string;
  direction: "in" | "out" | "self";
  amount: bigint;
  fee?: bigint;
  height?: number;
  confirmations: number;
  timestamp?: number; // seconds
  pending: boolean;
  /** Recipients of an outgoing payment, when this wallet created it (needed for proofs). */
  destinations?: { address: string; amount: bigint }[];
}

/** Result of checking someone's payment proof against the blockchain. */
export interface ProofCheck {
  good: boolean;
  received: bigint;
  confirmations: number;
  inPool: boolean;
}

/** One incoming payment, attributed to the subaddress it arrived at (for payment requests). */
export interface IncomingEntry {
  /** Wallet account the payment arrived in (see MAIN_ACCOUNT). */
  accountIndex: number;
  subaddressIndex: number;
  amount: bigint;
  confirmations: number;
  pending: boolean;
  hash: string;
  /** Block time in seconds, once confirmed. */
  timestamp?: number;
}

/** Where a transaction is, as the node sees it. */
export type TxWhere = "pool" | "chain" | "none";

/** The last time a sync with the node worked, and the last error since then (local ms). */
export interface SyncHealth {
  lastOk: number | null;
  lastError: string | null;
}

/**
 * During a long first sync, progress is saved this often (whichever comes first): about once a
 * minute in a browser. Each save pauses the scan for 2 to 4 s (measured 2026-10-19 on mainnet).
 */
export const CHECKPOINT_BLOCKS = 3_000;
export const CHECKPOINT_MS = 60_000;
/**
 * Mid-sync checkpoints. They were off after a restarted sync hung in the browser (2026-10-17):
 * a stop only takes effect after the node's current answer is processed, and answers of ~450
 * blocks took longer than the stop budget. With the relay asking for 100 blocks per answer, a
 * stop takes about 2 s; 8 checkpoints and a closed tab in one mainnet scan all resumed cleanly.
 * A wallet on the user's own node still gets large answers, so its pauses can take longer.
 */
const CHECKPOINTS_ENABLED = true;

/** One recipient of a payment. */
export interface Destination { address: string; amount: bigint }

/**
 * How fast the payment should confirm. "standard" lets the wallet pick (the cheapest fee that gets
 * into the next blocks while they are not full); the others pay more to get ahead when blocks fill.
 */
export type SendSpeed = "standard" | "faster" | "fastest";
export const SEND_SPEEDS: readonly SendSpeed[] = ["standard", "faster", "fastest"];
/** monero-ts MoneroTxPriority: DEFAULT 0, NORMAL 2, ELEVATED 3. */
export const SPEED_PRIORITY: Record<SendSpeed, number> = { standard: 0, faster: 2, fastest: 3 };

export interface SendOptions {
  speed?: SendSpeed;
  /** The fee comes out of the (single) recipient's amount, so the total you pay is the amount typed. */
  subtractFee?: boolean;
}

/** Most recipients one Monero transaction can pay (16 outputs, one of them change). */
export const MAX_DESTINATIONS = 15;

/**
 * A built payment. `destinations` are read back from the built transaction; `address` and `amount`
 * are the first recipient and the total they all receive (most payments have one recipient).
 */
export interface PreparedTx {
  fee: bigint; amount: bigint; metadata: string; address: string; destinations: Destination[]; hash?: string;
  /** The addresses (subaddress indices, main account) whose coins this payment spends, when known. */
  fromAddresses?: number[];
}

/**
 * Checks what the engine built against what was asked for. When the engine reports destinations,
 * they must match exactly, in order; with the fee subtracted, the one recipient gets amount minus fee.
 */
export function checkBuilt(wanted: Destination[], built: Destination[], fee: bigint, subtractFee: boolean): Destination[] {
  const expect = (w: Destination) => (subtractFee && wanted.length === 1 ? w.amount - fee : w.amount);
  if (!built.length) return wanted.map((w) => ({ address: w.address, amount: expect(w) }));
  const ok = built.length === wanted.length && built.every((d, i) => d.address === wanted[i]!.address && d.amount === expect(wanted[i]!));
  if (!ok) throw new Error("The payment could not be prepared safely. Please try again.");
  return built;
}

export interface LiveWallet {
  primaryAddress: string;
  /**
   * Syncs to the chain tip. With `onCheckpoint`, a long sync pauses every CHECKPOINT_BLOCKS
   * blocks or CHECKPOINT_MS so the caller can save progress (the engine cannot export its state
   * while it scans), then carries on.
   */
  sync(onProgress: (s: SyncState) => void, onCheckpoint?: () => Promise<void>): Promise<void>;
  /** Stops a running sync() as soon as possible (it then throws), so the state can be saved. */
  haltSync?(): Promise<void>;
  /** True while sync() is running. */
  syncing?(): boolean;
  startBackgroundSync(periodMs?: number): Promise<void>;
  /** When the node last answered a sync (background or manual). */
  health?(): SyncHealth;
  /** Asks the node whether it has this transaction (in its pool or in a block). */
  findTx?(hash: string): Promise<TxWhere>;
  /** Highest subaddress index the engine knows in an account (0 when only the main one). */
  highestSubaddress?(account: number): Promise<number>;
  onBalances(cb: (b: Balances) => void): void;
  balances(): Promise<Balances>;
  txs(): Promise<TxSummary[]>;
  newSubaddress(label?: string): Promise<string>;
  /** A fresh subaddress for a request or sale. `expected` is only used by the simulation, to pay the right amount. */
  newRequestAddress(label: string, expected?: bigint, account?: number): Promise<{ address: string; index: number }>;
  /** Makes sure subaddresses up to `index` exist in `account` (after saved state was lost), so none is handed out twice. */
  ensureSubaddresses(account: number, index: number): Promise<void>;
  /** Builds (does not send) the moves of an account's spendable money into the main address. */
  prepareMove(account: number): Promise<{ fee: bigint; amount: bigint; metadata: string[] }>;
  /** Incoming payments with the subaddress each one arrived at. */
  incoming(): Promise<IncomingEntry[]>;
  /** Unspent coins in the main account, frozen ones included. */
  coins?(): Promise<Coin[]>;
  /** Keeps a coin out of payments (frozen) or lets it be spent again. Full wallets only. */
  freezeCoin?(keyImage: string, frozen: boolean): Promise<void>;
  /** Proof that this wallet paid `address` in transaction `hash`: the tx key (when stored) and a signed proof. */
  proveSent(hash: string, address: string, message?: string): Promise<{ txKey: string | null; signature: string }>;
  /** Checks a payment proof (tx key or signed proof) against the blockchain. */
  checkProof(p: PaymentProof): Promise<ProofCheck>;
  /** One extra sync now (cashier mode checks for new payments more often than the background sync). */
  syncNow?(): Promise<void>;
  /**
   * Builds (does not send) a payment. `address` is the destination read back from the built
   * transaction; `hash` is its transaction ID, known before it is sent.
   */
  prepareSend(destinations: Destination[], options?: SendOptions): Promise<PreparedTx>;
  /** Builds (does not send) one payment of everything spendable; the fee comes out of the amount. */
  prepareSweep(address: string, options?: SendOptions): Promise<PreparedTx>;
  /**
   * Builds (does not send) the transactions moving everything spendable to `address`; a wallet with
   * many small payments needs several. Used to empty another wallet into this one (sweep.ts).
   */
  prepareSweepAll?(address: string, options?: SendOptions): Promise<{ fee: bigint; amount: bigint; metadata: string[] }>;
  relay(metadata: string): Promise<string>;
  /** Exports the engine state plus the height it is synced to, for sealed local saving. */
  exportState?(): Promise<{ state: EngineState; height: number }>;
  /** Block height the engine is synced to. */
  height?(): Promise<number>;
  close(): Promise<void>;
}

/** Opens an in-memory wallet. Secrets come from the decrypted vault and are not persisted by monero-ts. */
export async function openWallet(p: OpenParams): Promise<LiveWallet> {
  const lib = await loadEngine();
  // Engine-level password for monero-ts's own keys file. It never protects anything on its
  // own: the exported files are only ever stored inside a sealed blob (see EngineState).
  const enginePassword = p.saved?.password ?? crypto.randomUUID();
  const base = {
    networkType: p.network,
    password: enginePassword,
    server: serverFor(p.node),
    restoreHeight: p.restoreHeight,
    proxyToWorker: true,
  };
  let w: MoneroWalletFull;
  if (p.saved) {
    // Resume from saved state: only blocks after the last synced height get scanned.
    w = await lib.openWalletFull({
      networkType: p.network, password: enginePassword, server: serverFor(p.node), proxyToWorker: true,
      keysData: p.saved.keysData, cacheData: p.saved.cacheData,
    } as never);
    if (p.primaryAddress && (await w.getPrimaryAddress()) !== p.primaryAddress) {
      await w.close(false).catch(() => {});
      throw new SavedStateMismatch();
    }
  } else {
    if (p.kind === "full" && isMyMoneroPhrase(p.seed ?? "")) {
      // MyMonero 13-word phrase: open from its keys. The engine rejects an address that does not match them.
      const k = await myMoneroWallet(p.seed!, p.network);
      w = await lib.createWalletFull({ ...base, primaryAddress: k.primaryAddress, privateSpendKey: k.privateSpendKey, privateViewKey: k.privateViewKey });
    } else {
      w = p.kind === "full"
        ? await lib.createWalletFull({ ...base, seed: normalizeSeed(p.seed ?? ""), ...(p.seedOffset ? { seedOffset: p.seedOffset } : {}) })
        : await lib.createWalletFull({ ...base, primaryAddress: p.primaryAddress, privateViewKey: p.privateViewKey });
    }
  }

  const primaryAddress = await w.getPrimaryAddress();
  const balanceListeners: ((b: Balances) => void)[] = [];

  /** Creates accounts up to `account` (accounts are numbered in order). */
  async function ensureAccount(account: number) {
    let count = (await w.getAccounts()).length;
    while (count <= account) { await w.createAccount(); count++; }
  }

  async function readBalances(): Promise<Balances> {
    const accounts = await w.getAccounts();
    const other = accounts
      .filter((a) => a.getIndex() > MAIN_ACCOUNT && BigInt(a.getBalance()) > 0n)
      .map((a) => ({ account: a.getIndex(), balance: BigInt(a.getBalance()), unlocked: BigInt(a.getUnlockedBalance()) }));
    const frozen = (await w.getOutputs({ accountIndex: MAIN_ACCOUNT, isSpent: false, isFrozen: true } as never)).reduce((s, o) => s + BigInt(o.getAmount()), 0n);
    return {
      total: BigInt(await w.getBalance()),
      unlocked: BigInt(await w.getUnlockedBalance(MAIN_ACCOUNT)),
      ...(other.length ? { other } : {}),
      ...(frozen > 0n ? { frozen } : {}),
    };
  }

  /** The main-account addresses whose coins a built transaction spends (by key image). */
  async function spentFrom(txs: { getInputs(): { getKeyImage(): { getHex(): string } | undefined }[] | undefined }[]): Promise<number[] | undefined> {
    const images = new Set(txs.flatMap((tx) => (tx.getInputs() ?? []).map((i) => i.getKeyImage()?.getHex()).filter((k): k is string => !!k)));
    if (!images.size) return undefined;
    const outs = await w.getOutputs({ accountIndex: MAIN_ACCOUNT, isSpent: false } as never);
    const subs = new Set(outs.filter((o) => images.has(o.getKeyImage()?.getHex() ?? "")).map((o) => o.getSubaddressIndex()));
    return [...subs].sort((a, b) => a - b);
  }

  await w.addListener(
    new (class extends lib.MoneroWalletListener {
      async onBalancesChanged() {
        const b = await readBalances().catch(() => null);
        if (b) balanceListeners.forEach((cb) => cb(b));
      }
    })(),
  );

  // Sync bookkeeping: the state of a running sync(), the background loop, and node health.
  let running = false;
  let halted = false;
  let pausing = false;
  let closed = false;
  let bgTimer: ReturnType<typeof setTimeout> | null = null;
  let bgStarted = false;
  let bgTicking = false;
  let unwatch: (() => void) | null = null;
  const health: SyncHealth = { lastOk: null, lastError: null };
  const ok = () => { health.lastOk = Date.now(); health.lastError = null; };
  const failed = (e: unknown) => { health.lastError = (e as Error)?.message || "The node did not answer."; };
  let daemon: Awaited<ReturnType<typeof lib.connectToDaemonRpc>> | null = null;

  return {
    primaryAddress,
    async sync(onProgress, onCheckpoint) {
      let last = { height: await w.getHeight(), at: performance.now() };
      let checkpoint = CHECKPOINTS_ENABLED ? onCheckpoint : undefined;
      const listener = new (class extends lib.MoneroWalletListener {
        async onSyncProgress(height: number, startHeight: number, endHeight: number, percentDone: number) {
          // Progress is measured from the restore height, not from where this session resumed, so a
          // scan that continues after a lock shows its real position instead of starting at 0%.
          const span = endHeight - p.restoreHeight;
          // Below the restore height the engine is only fetching block hashes (repeated each unlock):
          // that phase reports its own progress, and the screen labels it as preparing, not scanning.
          const overall = percentDone >= 1 ? 1 : span > 0 && height >= p.restoreHeight ? Math.min(1, (height - p.restoreHeight) / span) : percentDone;
          onProgress({ height, startHeight, endHeight, percent: overall, done: percentDone >= 1 });
          // Pause for a save only while scanning the wallet's own blocks (not the hash catch-up below
          // the restore height). stop_syncing is not queued, so the engine stops between batches.
          if (!checkpoint || pausing || halted || percentDone >= 1 || height < p.restoreHeight) return;
          if (height - last.height >= CHECKPOINT_BLOCKS || performance.now() - last.at >= CHECKPOINT_MS) {
            pausing = true;
            void w.stopSyncing().catch(() => {});
          }
        }
      })();
      running = true;
      halted = false;
      try {
        for (;;) {
          pausing = false;
          const before = await w.getHeight();
          try {
            await w.sync(listener);
          } catch (e) {
            if (!pausing || halted) throw e;
          }
          if (halted) throw new Error("Sync stopped.");
          if (!pausing) break;
          // Paused for a checkpoint: save, then carry on from where it stopped. If a pause made no
          // progress, stop checkpointing so a stubborn engine can never loop here.
          const after = await w.getHeight();
          if (after <= before) checkpoint = undefined;
          else await checkpoint?.().catch(() => {});
          last = { height: after, at: performance.now() };
        }
      } catch (e) {
        if (!halted) failed(e);
        throw e;
      } finally {
        running = false;
        pausing = false;
      }
      ok();
      // How the first sync works (measured 2026-10-14): createWalletFull honours restoreHeight
      // for the actual scan. Before scanning, wallet2's fast_refresh() downloads block HASHES
      // from its last built-in checkpoint (about block 550,000 on stagenet) up to the restore
      // height, roughly 10,000 per get_hashes.bin request, to build the chain index it uses
      // for reorg detection. Progress callbacks fire during that phase too, so heights far
      // below the restore height are expected and are not a rescan of the user's history.
      // A fresh stagenet wallet syncs in about 55s in the browser, the same as native Node.
      // The index is not persisted (in-memory wallet), so each unlock repeats it.
      const h = await w.getHeight();
      onProgress({ height: h, startHeight: p.restoreHeight, endHeight: h, percent: 1, done: true });
    },
    async haltSync() {
      if (!running) return;
      halted = true;
      await w.stopSyncing().catch(() => {});
      // Wait (briefly) until the engine has let go of the sync, so its state can be exported.
      for (let i = 0; i < 50 && running; i++) await new Promise((r) => setTimeout(r, 100));
    },
    syncing() {
      return running;
    },
    // Our own loop instead of the engine's startSyncing(): that one swallows errors, so a node
    // outage after the first sync would still look "Up to date". This one records every result.
    // It pauses while the tab is hidden (nobody is looking, and the tab auto-locks soon) and
    // checks at once when the tab is shown again.
    async startBackgroundSync(periodMs = 20_000) {
      if (bgStarted || closed) return;
      bgStarted = true;
      const schedule = (ms: number) => {
        if (bgTimer) clearTimeout(bgTimer);
        bgTimer = closed || visibility.hidden() ? null : setTimeout(() => void tick(), ms);
      };
      const tick = async () => {
        bgTimer = null;
        if (closed || visibility.hidden() || bgTicking) return;
        bgTicking = true;
        try {
          if (!running) { await w.sync(); ok(); }
        } catch (e) {
          failed(e);
        } finally {
          bgTicking = false;
        }
        schedule(periodMs);
      };
      unwatch = visibility.watch(() => { if (!visibility.hidden()) schedule(0); });
      schedule(periodMs);
    },
    health() {
      return { ...health };
    },
    async findTx(hash) {
      daemon ??= await lib.connectToDaemonRpc({ ...serverFor(p.node), proxyToWorker: true } as never);
      const [tx] = await daemon.getTxs([hash], true);
      if (!tx) return "none";
      return tx.getInTxPool() ? "pool" : "chain";
    },
    async highestSubaddress(account) {
      const accounts = await w.getAccounts();
      if (account >= accounts.length) return 0;
      const subs = await w.getSubaddresses(account);
      return Math.max(0, ...subs.map((s) => s.getIndex()));
    },
    onBalances(cb) {
      balanceListeners.push(cb);
    },
    async balances() {
      return readBalances();
    },
    async txs() {
      const list = await w.getTxs();
      return list
        .map((tx): TxSummary => {
          const inAmt = tx.getIncomingAmount() ?? 0n;
          const outAmt = tx.getOutgoingAmount() ?? 0n;
          const direction = tx.getIsIncoming() && tx.getIsOutgoing() ? "self" : tx.getIsIncoming() ? "in" : "out";
          return {
            hash: tx.getHash(),
            direction,
            amount: direction === "out" ? outAmt : inAmt,
            fee: tx.getFee(),
            height: tx.getHeight(),
            confirmations: tx.getNumConfirmations() ?? 0,
            timestamp: tx.getBlock()?.getTimestamp(),
            pending: !tx.getIsConfirmed(),
            ...(direction !== "in" && tx.getOutgoingTransfer()?.getDestinations()?.length
              ? { destinations: tx.getOutgoingTransfer()!.getDestinations().map((d) => ({ address: d.getAddress(), amount: d.getAmount() })) }
              : {}),
          };
        })
        .sort((a, b) => (b.height ?? Number.MAX_SAFE_INTEGER) - (a.height ?? Number.MAX_SAFE_INTEGER));
    },
    async newRequestAddress(label, _expected, account = MAIN_ACCOUNT) {
      await ensureAccount(account);
      const sub = await w.createSubaddress(account, label);
      return { address: sub.getAddress(), index: sub.getIndex() };
    },
    async ensureSubaddresses(account, index) {
      await ensureAccount(account);
      let count = (await w.getSubaddresses(account)).length;
      while (count <= index) { await w.createSubaddress(account, ""); count++; }
    },
    async prepareMove(account) {
      if (p.kind !== "full") throw new Error("A watch-only wallet cannot move money. Use the full wallet.");
      if (account === MAIN_ACCOUNT) throw new Error("That is already the main account.");
      const txs = await w.sweepUnlocked({ accountIndex: account, address: primaryAddress, relay: false }).catch((e: unknown) => { throw friendlySendError(e); });
      if (!txs.length) throw new Error("Nothing in that account is spendable yet. New payments unlock after 10 confirmations (about 20 minutes).");
      let fee = 0n;
      let amount = 0n;
      for (const tx of txs) {
        const dests = tx.getOutgoingTransfer()?.getDestinations() ?? [];
        if (dests.length !== 1 || dests[0]!.getAddress() !== primaryAddress) throw new Error("The move could not be prepared safely. Please try again.");
        fee += BigInt(tx.getFee());
        amount += BigInt(dests[0]!.getAmount());
      }
      return { fee, amount, metadata: txs.map((tx) => tx.getMetadata()) };
    },
    async incoming() {
      const transfers = await w.getIncomingTransfers({} as never);
      return transfers.map((t): IncomingEntry => {
        const tx = t.getTx();
        return {
          accountIndex: t.getAccountIndex(),
          subaddressIndex: t.getSubaddressIndex(),
          amount: t.getAmount(),
          confirmations: tx.getNumConfirmations() ?? 0,
          pending: !tx.getIsConfirmed(),
          hash: tx.getHash(),
          ...(tx.getBlock()?.getTimestamp() ? { timestamp: tx.getBlock()!.getTimestamp() } : {}),
        };
      });
    },
    async coins() {
      const outs = await w.getOutputs({ accountIndex: MAIN_ACCOUNT, isSpent: false } as never);
      return outs.map((o): Coin => {
        const tx = o.getTx();
        return {
          keyImage: o.getKeyImage()?.getHex() ?? "",
          amount: BigInt(o.getAmount()),
          subaddressIndex: o.getSubaddressIndex(),
          hash: tx.getHash(),
          ...(tx.getHeight() ? { height: tx.getHeight() } : {}),
          ...(tx.getBlock()?.getTimestamp() ? { timestamp: tx.getBlock()!.getTimestamp() } : {}),
          frozen: !!o.getIsFrozen(),
          locked: !!o.getIsLocked(),
        };
      });
    },
    async freezeCoin(keyImage, frozen) {
      if (p.kind !== "full") throw new Error("A watch-only wallet cannot freeze coins.");
      if (!/^[0-9a-f]{64}$/.test(keyImage)) throw new Error("That coin is not known to this wallet.");
      if (frozen) await w.freezeOutput(keyImage);
      else await w.thawOutput(keyImage);
      const b = await readBalances().catch(() => null);
      if (b) balanceListeners.forEach((cb) => cb(b));
    },
    async syncNow() {
      try {
        await w.sync();
        ok();
      } catch (e) {
        failed(e);
        throw e;
      }
    },
    async proveSent(hash, address, message) {
      // The tx key exists only for payments this wallet made and still remembers.
      const txKey = await w.getTxKey(hash).catch(() => null);
      const signature = await w.getTxProof(hash, address.trim(), message || undefined);
      return { txKey, signature };
    },
    async checkProof(p) {
      const r = p.signature
        ? await w.checkTxProof(p.txHash, p.address, p.message || undefined, p.signature)
        : await w.checkTxKey(p.txHash, p.txKey ?? "", p.address);
      const good = !!r.getIsGood();
      return {
        good,
        received: good ? BigInt(r.getReceivedAmount() ?? 0n) : 0n,
        confirmations: good ? Number(r.getNumConfirmations() ?? 0) : 0,
        inPool: good ? !!r.getInTxPool() : false,
      };
    },
    async newSubaddress(label) {
      return (await w.createSubaddress(0, label ?? "")).getAddress();
    },
    async prepareSend(destinations, options = {}) {
      if (p.kind !== "full") throw new Error("This is a view-only wallet. It can watch funds but cannot send.");
      const wanted = destinations.map((d) => ({ address: d.address.trim(), amount: d.amount }));
      if (!wanted.length || wanted.length > MAX_DESTINATIONS) throw new Error(`A payment can have 1 to ${MAX_DESTINATIONS} recipients.`);
      const subtractFee = !!options.subtractFee && wanted.length === 1;
      const tx = await w.createTx({
        accountIndex: 0,
        destinations: wanted,
        priority: SPEED_PRIORITY[options.speed ?? "standard"],
        ...(subtractFee ? { subtractFeeFrom: [0] } : {}),
        relay: false,
      } as never).catch((e: unknown) => { throw friendlySendError(e); });
      const fee = BigInt(tx.getFee());
      // Read the destinations back from the built transaction: the review must show what will be paid.
      const built = checkBuilt(wanted, (tx.getOutgoingTransfer()?.getDestinations() ?? []).map((d) => ({ address: d.getAddress(), amount: BigInt(d.getAmount()) })), fee, subtractFee);
      const final = built;
      const amount = final.reduce((s, d) => s + d.amount, 0n);
      const fromAddresses = await spentFrom([tx]).catch(() => undefined);
      return { fee, amount, metadata: tx.getMetadata(), address: final[0]!.address, destinations: final, ...(tx.getHash() ? { hash: tx.getHash() } : {}), ...(fromAddresses ? { fromAddresses } : {}) };
    },
    async prepareSweep(address, options = {}) {
      if (p.kind !== "full") throw new Error("This is a view-only wallet. It can watch funds but cannot send.");
      const target = address.trim();
      const txs = await w.sweepUnlocked({ accountIndex: 0, address: target, priority: SPEED_PRIORITY[options.speed ?? "standard"], relay: false } as never).catch((e: unknown) => { throw friendlySendError(e); });
      if (!txs.length) throw new Error("Nothing is spendable yet. New payments unlock after 10 confirmations (about 20 minutes).");
      if (txs.length > 1) throw new Error("Your balance is spread over many small payments and needs more than one transaction. Send most of it first, then use Send all for the rest.");
      const tx = txs[0]!;
      const dests = tx.getOutgoingTransfer()?.getDestinations() ?? [];
      if (dests.length !== 1 || dests[0]!.getAddress() !== target) {
        throw new Error("The payment could not be prepared safely. Please try again.");
      }
      const amount = BigInt(dests[0]!.getAmount());
      const fromAddresses = await spentFrom([tx]).catch(() => undefined);
      return { fee: tx.getFee(), amount, metadata: tx.getMetadata(), address: target, destinations: [{ address: target, amount }], ...(tx.getHash() ? { hash: tx.getHash() } : {}), ...(fromAddresses ? { fromAddresses } : {}) };
    },
    async prepareSweepAll(address, options = {}) {
      if (p.kind !== "full") throw new Error("This is a view-only wallet. It can watch funds but cannot send.");
      const target = address.trim();
      const txs = await w.sweepUnlocked({ accountIndex: 0, address: target, priority: SPEED_PRIORITY[options.speed ?? "standard"], relay: false } as never).catch((e: unknown) => { throw friendlySendError(e); });
      if (!txs.length) throw new Error("Nothing is spendable yet. New payments unlock after 10 confirmations (about 20 minutes).");
      let fee = 0n;
      let amount = 0n;
      for (const tx of txs) {
        const dests = tx.getOutgoingTransfer()?.getDestinations() ?? [];
        // Every transaction must pay only the target address.
        if (dests.length !== 1 || dests[0]!.getAddress() !== target) throw new Error("The sweep could not be prepared safely. Please try again.");
        fee += BigInt(tx.getFee());
        amount += BigInt(dests[0]!.getAmount());
      }
      return { fee, amount, metadata: txs.map((t) => t.getMetadata()) };
    },
    async relay(metadata) {
      return w.relayTx(metadata);
    },
    async height() {
      return w.getHeight();
    },
    async exportState() {
      const [keysData, cacheData] = await w.getData();
      return { state: { password: enginePassword, keysData: toBytes(keysData), cacheData: toBytes(cacheData) }, height: await w.getHeight() };
    },
    async close() {
      closed = true;
      if (bgTimer) clearTimeout(bgTimer);
      unwatch?.();
      await w.close(false);
    },
  };
}
