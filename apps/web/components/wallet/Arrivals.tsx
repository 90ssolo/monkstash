"use client";
/**
 * "Hear it land": a short chime, a message on screen and, if allowed, a notification when Monero
 * arrives. Worked out on this device from the wallet's own incoming payments: no server watches
 * the wallet and nothing is pushed from outside. The system notification never shows the amount,
 * because it can appear on a lock screen.
 *
 * A new payment counts only one check later, once it is clear it is not the change of a payment
 * this wallet sent itself.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { formatXmr } from "@quietmint/wallet-core";
import type { IncomingEntry, TxSummary } from "@/lib/wallet/engine";
import styles from "./wallet.module.css";

// ---------------------------------------------------------------- preferences (this browser only)

export interface ArrivalPrefs { sound: boolean; notify: boolean }
const KEY = "monkstash.arrivals.v1";
const DEFAULTS: ArrivalPrefs = { sound: true, notify: false };
const listeners = new Set<() => void>();
let current: ArrivalPrefs | null = null;

function read(): ArrivalPrefs {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<ArrivalPrefs> | null;
    if (v) return { sound: v.sound !== false, notify: v.notify === true };
  } catch { /* storage blocked */ }
  return DEFAULTS;
}
function get(): ArrivalPrefs {
  if (current === null) current = typeof window === "undefined" ? DEFAULTS : read();
  return current;
}
function set(p: ArrivalPrefs) {
  current = p;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage blocked */ }
  listeners.forEach((l) => l());
}
export function useArrivalPrefs(): [ArrivalPrefs, (p: ArrivalPrefs) => void] {
  const prefs = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, get, () => DEFAULTS);
  return [prefs, set];
}

/** The web wallet can notify; the extension's pages cannot without an extra permission. */
const canNotify = () => typeof Notification !== "undefined" && (location.protocol === "https:" || location.protocol === "http:");

// ---------------------------------------------------------------- the chime

let audio: AudioContext | null = null;
/** Two soft notes, made on the fly (no sound file to download). */
export function playChime() {
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const t = audio.currentTime;
    [[784, 0], [1175, 0.12]].forEach(([freq, at]) => {
      const osc = audio!.createOscillator();
      const gain = audio!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq!;
      gain.gain.setValueAtTime(0.0001, t + at!);
      gain.gain.exponentialRampToValueAtTime(0.18, t + at! + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + at! + 0.45);
      osc.connect(gain).connect(audio!.destination);
      osc.start(t + at!);
      osc.stop(t + at! + 0.5);
    });
  } catch { /* no audio here */ }
}

// ---------------------------------------------------------------- detection

export interface Arrival { hash: string; amount: bigint; at: number }

/**
 * Watches the incoming payments and returns the latest arrival to show. `ready` is false until the
 * first sync is done, so a wallet's existing history never chimes.
 */
export function useArrivals(incoming: IncomingEntry[], txs: TxSummary[], ready: boolean): [Arrival | null, () => void] {
  const [prefs] = useArrivalPrefs();
  const seen = useRef<Set<string> | null>(null);
  const waiting = useRef<Map<string, bigint>>(new Map());
  const [shown, setShown] = useState<Arrival | null>(null);
  const outgoing = useRef<Set<string>>(new Set());
  outgoing.current = new Set(txs.filter((t) => t.direction !== "in").map((t) => t.hash));

  useEffect(() => {
    if (!ready) return;
    const byHash = new Map<string, bigint>();
    for (const e of incoming) byHash.set(e.hash, (byHash.get(e.hash) ?? 0n) + e.amount);
    if (seen.current === null) { seen.current = new Set(byHash.keys()); return; }
    // Payments held back last time: now we know whether they were our own change.
    for (const [hash, amount] of waiting.current) {
      waiting.current.delete(hash);
      seen.current.add(hash);
      if (outgoing.current.has(hash)) continue;
      const a = { hash, amount, at: Date.now() };
      setShown(a);
      if (prefs.sound) playChime();
      if (prefs.notify && canNotify() && Notification.permission === "granted" && document.visibilityState === "hidden") {
        try { new Notification("MonkStash", { body: "Monero received. Open MonkStash to see it.", icon: "/app-icon-192.png", tag: hash }); } catch { /* blocked */ }
      }
    }
    for (const [hash, amount] of byHash) {
      if (!seen.current.has(hash) && !waiting.current.has(hash)) waiting.current.set(hash, amount);
    }
  }, [incoming, ready, prefs]);

  // The message on screen fades after a while.
  useEffect(() => {
    if (!shown) return;
    const t = window.setTimeout(() => setShown(null), 12_000);
    return () => window.clearTimeout(t);
  }, [shown]);

  return [shown, () => setShown(null)];
}

/** The on-screen message for an arrival. */
export function ArrivalToast({ arrival, hidden, onOpen, onClose }: { arrival: Arrival; hidden: boolean; onOpen: () => void; onClose: () => void }) {
  return (
    <div className={styles.arrival} role="status" aria-live="polite">
      <span className={styles.arrivalIcon} aria-hidden="true">↓</span>
      <span className={styles.arrivalText}>
        <strong>{hidden ? "Monero received" : `Received ${formatXmr(arrival.amount, 6)} XMR`}</strong>
        <span className="small muted">Spendable in about 20 minutes.</span>
      </span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onOpen}>See activity</button>
      <button type="button" className={styles.arrivalClose} aria-label="Close" onClick={onClose}>×</button>
    </div>
  );
}

/** Settings: sound on or off, and the optional notification (asks the browser for permission). */
export function ArrivalSettings() {
  const [prefs, setPrefs] = useArrivalPrefs();
  const [msg, setMsg] = useState<string | null>(null);
  const notifyAvailable = typeof window !== "undefined" && canNotify();

  async function toggleNotify(on: boolean) {
    setMsg(null);
    if (!on) return setPrefs({ ...prefs, notify: false });
    const result = Notification.permission === "granted" ? "granted" : await Notification.requestPermission().catch(() => "denied" as const);
    if (result === "granted") setPrefs({ ...prefs, notify: true });
    else setMsg("Notifications are blocked for this site. Allow them in your browser's site settings, then try again.");
  }

  return (
    <div style={{ display: "grid", gap: "var(--s-2)" }}>
      <label className={styles.trust}>
        <input type="checkbox" checked={prefs.sound} onChange={(e) => { setPrefs({ ...prefs, sound: e.target.checked }); if (e.target.checked) playChime(); }} />
        <span>Play a short sound when Monero arrives</span>
      </label>
      {notifyAvailable ? (
        <label className={styles.trust}>
          <input type="checkbox" checked={prefs.notify} onChange={(e) => void toggleNotify(e.target.checked)} />
          <span>Show a notification when this tab is in the background <span className="muted">(it never shows the amount)</span></span>
        </label>
      ) : null}
      {msg ? <p className="small error" role="alert" style={{ margin: 0 }}>{msg}</p> : null}
      <p className="small muted" style={{ margin: 0 }}>Worked out on this device while the wallet is open. Nothing watches your wallet from outside. Saved in this browser only.</p>
    </div>
  );
}
