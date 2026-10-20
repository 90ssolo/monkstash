"use client";
/**
 * Live funding for /donate: one shared fetch of /api/donations (cached server-side, refreshed
 * every minute here) feeding the jar counter and the recent donations feed. The roadmap has
 * no funding goals: donations go to the feature at the front of the line.
 *
 * Development only: add ?preview=donations to the URL to see the layout with sample data.
 */
import { useEffect, useRef, useState } from "react";
import type { Milestone, MilestoneStatus } from "@/lib/donate";
import styles from "./page.module.css";

interface Entry { amount: string; timestamp: number | null; confirmations: number; pending: boolean }
type Stats =
  | { ok: true; confirmed: string; pending: string; count: number; recent: Entry[]; height: number; checkedAt: string }
  | { ok: false; checkedAt: string };

const PICO = 1e12;
const xmr = (pico: string | number) => Number(pico) / PICO;
const fmt = (n: number, max = 4) => n.toLocaleString("en-US", { maximumFractionDigits: max });

const PREVIEW: Stats = {
  ok: true, confirmed: "18450000000000", pending: "500000000000", count: 7, height: 3790000, checkedAt: new Date().toISOString(),
  recent: [
    { amount: "500000000000", timestamp: null, confirmations: 0, pending: true },
    { amount: "2000000000000", timestamp: Date.now() / 1000 - 3600, confirmations: 30, pending: false },
    { amount: "250000000000", timestamp: Date.now() / 1000 - 86400, confirmations: 720, pending: false },
    { amount: "10000000000000", timestamp: Date.now() / 1000 - 3 * 86400, confirmations: 2160, pending: false },
  ],
};

// One fetch shared by every live component on the page.
let shared: Promise<Stats> | null = null;
let sharedAt = 0;
function loadStats(): Promise<Stats> {
  if (process.env.NODE_ENV !== "production" && typeof location !== "undefined" && location.search.includes("preview=donations")) {
    return Promise.resolve(PREVIEW);
  }
  if (!shared || Date.now() - sharedAt > 55_000) {
    sharedAt = Date.now();
    shared = fetch("/api/donations").then((r) => r.json() as Promise<Stats>).catch(() => ({ ok: false, checkedAt: new Date().toISOString() }) as Stats);
  }
  return shared;
}

function useStats(): Stats | null {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    let alive = true;
    const tick = () => loadStats().then((s) => { if (alive) setStats(s); });
    tick();
    const t = setInterval(tick, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return stats;
}

/** Counts up smoothly to the target value (instantly with reduced motion). */
function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setValue(target); from.current = target; return; }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(a + (target - a) * eased);
      if (p < 1) raf = requestAnimationFrame(step); else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function ago(ts: number): string {
  const s = Math.max(0, Date.now() / 1000 - ts);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ts * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** The glass jar right now: total received, pending, count, recent donations. */
export function LiveJar() {
  const stats = useStats();
  const total = stats?.ok ? xmr(stats.confirmed) : 0;
  const shown = useCountUp(total);
  return (
    <div className={styles.jar}>
      <div className={styles.jarHead}>
        <span className={`${styles.liveDot} ${stats?.ok ? styles.liveOn : ""}`} aria-hidden="true" />
        <span className={styles.jarLabel}>{stats === null ? "Checking the donation wallet…" : stats.ok ? "Live from the Monero network" : "Live totals are unavailable right now"}</span>
      </div>
      {/* Screen readers hear the final total once, not every step of the count-up. */}
      <p className="visually-hidden" aria-live="polite">{stats?.ok ? `${fmt(total, 4)} XMR raised` : ""}</p>
      <p className={styles.jarTotal} aria-hidden="true">
        <span className={styles.jarNum}>{fmt(shown, 4)}</span> <span className={styles.jarUnit}>XMR raised</span>
      </p>
      {stats?.ok && stats.count > 0 ? (
        <p className={styles.jarMeta}>
          From {stats.count} {stats.count === 1 ? "donation" : "donations"}
          {xmr(stats.pending) > 0 ? <>, plus <b>{fmt(xmr(stats.pending))} XMR</b> arriving now</> : null}. Checked at block{" "}
          {stats.height.toLocaleString("en-US")}.
        </p>
      ) : null}
      {stats?.ok && stats.recent.length ? (
        <ul className={styles.feed} aria-label="Recent donations">
          {stats.recent.slice(0, 6).map((e, i) => (
            <li key={i}>
              <span className={styles.feedAmt}>+{fmt(xmr(e.amount))} XMR</span>
              <span className={styles.feedWhen}>{e.pending ? "arriving now" : e.timestamp ? ago(e.timestamp) : "confirmed"}</span>
              <span className={`${styles.feedState} ${e.pending || e.confirmations < 10 ? styles.feedWait : ""}`}>
                {e.pending ? "In the pool" : e.confirmations < 10 ? `${e.confirmations} of 10` : "Confirmed"}
              </span>
            </li>
          ))}
        </ul>
      ) : stats?.ok ? (
        <p className={styles.jarEmpty}>No donations yet. The jar just opened. The first one shows up here within minutes.</p>
      ) : null}
    </div>
  );
}

const STATUS: Record<MilestoneStatus, string> = { live: "Live", building: "Building now", next: "Up next", later: "Later" };
const NUMERALS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** The public roadmap: features in the order we build them. No goals or targets. */
export function RoadmapLadder({ milestones }: { milestones: Milestone[] }) {
  return (
    <ol className={styles.ladder}>
      {milestones.map((m, i) => (
        <li key={m.id} className={`${styles.rung} ${styles[`st_${m.status}`] ?? ""}`}>
          <span className={styles.rungNum} aria-hidden="true">{NUMERALS[i] ?? String(i)}</span>
          <div className={styles.rungBody}>
            <div className={styles.rungTop}>
              <h3>{m.title}</h3>
              <span className={`${styles.badge} ${styles[`b_${m.status}`] ?? ""}`}>{STATUS[m.status]}</span>
            </div>
            <p className={styles.outcome}>{m.outcome}</p>
            <p className={styles.why}>{m.why}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
