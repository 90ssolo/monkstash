/**
 * Messages between the views (popup, side panel, tab) and the host page that runs the wallet.
 *
 * Extension messaging only carries JSON, so amounts (bigint), files (Uint8Array) and `undefined`
 * are tagged on the way out and restored on the way in. `undefined` matters: JSON would turn a
 * skipped argument into null, and a default parameter (such as account = 0) only applies to
 * undefined, so the host would get null where the screens meant "the default". Everything travels inside this extension only: no web
 * page can connect, since the manifest has no externally_connectable entry and no content scripts.
 */

export const PORT_NAME = "monkstash-view";

/** A view asks the host to run something. `target` is "controller", "wallet", "settings" or a store. */
export interface CallMsg { t: "call"; id: number; target: string; method: string; args: unknown[]; seq?: number }
/** The host's answer to one call. */
export type ResultMsg = { t: "result"; id: number; ok: true; value: unknown } | { t: "result"; id: number; ok: false; error: string; name?: string };
/** The host's current screen, sent on connect and after every change. */
export interface StateMsg { t: "state"; state: HostState }
/** Something happened in the wallet (sync progress, new balances). */
export interface EventMsg { t: "event"; name: string; data: unknown }
/** A view saw the person use it (resets the idle lock). */
export interface ActivityMsg { t: "activity" }

export type ToHost = CallMsg | ActivityMsg;
export type ToView = ResultMsg | StateMsg | EventMsg;

/** What every view needs to draw the current screen. Never contains secrets. */
export interface HostState {
  /** The controller's view, with the live wallet object left out. */
  view: Record<string, unknown> & { name: string };
  saveProblem: "full" | "unavailable" | null;
  /** Public settings for the open wallet (the methods go through calls). */
  settings: { kind: string; network: string; totpEnabled: boolean; node: string | null; restoreHeight: number; seedPassphrase?: boolean; seedWords?: number } | null;
  syncing: boolean;
  syncBusy: boolean;
  cashierOn: boolean;
  /** Changes whenever a different wallet engine is open (reopened after a node change, a rescan). */
  walletSeq: number;
}

/** Messages that are not view traffic: service worker and host bookkeeping. */
export type Control =
  | { t: "ensure-host" }
  | { t: "host-ready" }
  | { t: "idle-state"; state: "active" | "idle" | "locked" }
  /** Firefox: an open view says so every few seconds, which keeps the background page loaded. */
  | { t: "heartbeat" }
  /**
   * Chrome: the host (an offscreen document) cannot use extension storage, so the service worker
   * reads and writes the copy of the encrypted wallet record for it.
   */
  | { t: "vault-copy-get" }
  | { t: "vault-copy-set"; value: string | null };

/** The extension-storage key of the copy of the encrypted wallet record. */
export const VAULT_COPY_KEY = "quietmint.wallet.v1";

/**
 * Chrome refuses a single extension message over 64 MiB, and a move file of a long-lived wallet
 * (tens of MB, a third more as base64) can pass that. Large messages go in pieces instead.
 */
const PIECE_CHARS = 16 * 1024 * 1024;
/** Largest message accepted in pieces (a move file of a very long-lived wallet, with room to spare). */
const MAX_PIECES = 16;
/** Pieces of one message that stop arriving are dropped after this long. */
const PIECE_TTL_MS = 60_000;
interface Piece { t: "piece"; key: string; i: number; n: number; s: string }

/** Sends a message (encoded), in pieces when it is large. Throws if the port is closed. */
export function post(port: chrome.runtime.Port, msg: unknown): void {
  const encoded = encode(msg);
  const json = JSON.stringify(encoded);
  if (json.length <= PIECE_CHARS) {
    port.postMessage(encoded);
    return;
  }
  const key = crypto.randomUUID();
  const n = Math.ceil(json.length / PIECE_CHARS);
  for (let i = 0; i < n; i++) port.postMessage({ t: "piece", key, i, n, s: json.slice(i * PIECE_CHARS, (i + 1) * PIECE_CHARS) } satisfies Piece);
}

/**
 * A port listener that puts pieces back together and hands every whole message on, decoded.
 * Malformed input (only possible from this extension's own pages) is reported through `onBad`
 * instead of throwing inside the listener. `drop` forgets unfinished messages (port closed).
 */
export function receiver(handle: (msg: unknown) => void, onBad: (error: string) => void = () => {}): { listen: (raw: unknown) => void; drop: () => void } {
  const partial = new Map<string, { parts: string[]; got: number; at: number }>();
  const listen = (raw: unknown) => {
    try {
      const p = raw as Piece;
      if (p?.t !== "piece") return handle(decode(raw));
      if (typeof p.key !== "string" || !Number.isInteger(p.n) || !Number.isInteger(p.i) || p.n < 1 || p.n > MAX_PIECES || p.i < 0 || p.i >= p.n || typeof p.s !== "string") {
        throw new Error("A message arrived damaged.");
      }
      const now = Date.now();
      for (const [k, v] of partial) if (now - v.at > PIECE_TTL_MS) partial.delete(k);
      const entry = partial.get(p.key) ?? { parts: new Array<string>(p.n), got: 0, at: now };
      if (entry.parts.length !== p.n) throw new Error("A message arrived damaged.");
      if (entry.parts[p.i] === undefined) entry.got++;
      entry.parts[p.i] = p.s;
      partial.set(p.key, entry);
      if (entry.got < p.n) return;
      partial.delete(p.key);
      handle(decode(JSON.parse(entry.parts.join(""))));
    } catch (e) {
      onBad((e as Error)?.message || "A message could not be read.");
    }
  };
  return { listen, drop: () => partial.clear() };
}

export function encode(v: unknown): unknown {
  if (v === undefined) return { $undef: 1 };
  if (typeof v === "bigint") return { $b: v.toString() };
  if (v instanceof Uint8Array) return { $u8: toBase64(v) };
  if (v instanceof ArrayBuffer) return { $u8: toBase64(new Uint8Array(v)) };
  if (Array.isArray(v)) return v.map(encode);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) if (typeof x !== "function" && x !== undefined) out[k] = encode(x);
    return out;
  }
  return v;
}

export function decode(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.$undef === 1 && Object.keys(o).length === 1) return undefined;
    if (typeof o.$b === "string" && Object.keys(o).length === 1) return BigInt(o.$b);
    if (typeof o.$u8 === "string" && Object.keys(o).length === 1) return fromBase64(o.$u8);
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(o)) if (k !== "__proto__") out[k] = decode(x);
    return out;
  }
  return v;
}

function toBase64(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromBase64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
