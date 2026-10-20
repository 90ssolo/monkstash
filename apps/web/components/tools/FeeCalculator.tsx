"use client";

import { useEffect, useMemo, useState } from "react";
import { formatXmr } from "@quietmint/wallet-core";
import { feeFor, PICONERO, PRIORITY_NAMES, type FeeStats, type FeeStatsUnavailable } from "@/lib/feeStats";
import styles from "./fee.module.css";

const INPUT_LABEL: Record<1 | 2 | 3 | 4, string> = { 1: "1 (most payments)", 2: "2", 3: "3", 4: "4" };

/** Formats a fee from whole piconero, rounding UP to the shown precision so it is never understated. */
function xmr(piconero: number): string {
  const p = BigInt(Math.ceil(Math.max(0, piconero)));
  if (p === 0n) return "0";
  const decimals = p < 1_000_000_000n ? 7 : 6; // below 0.001 XMR, show one more place
  const step = 10n ** BigInt(12 - decimals);
  return formatXmr(((p + step - 1n) / step) * step, decimals);
}

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 1 ? "just now" : mins === 1 ? "1 minute ago" : `${mins} minutes ago`;
}

/** Live Monero fee estimate from real recent transactions (see /api/fee-stats). */
export function FeeCalculator() {
  const [stats, setStats] = useState<FeeStats | FeeStatsUnavailable | null>(null);
  const [priority, setPriority] = useState(0);
  const [inputs, setInputs] = useState<1 | 2 | 3 | 4>(1);
  const [price, setPrice] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/fee-stats")
      .then((r) => r.json() as Promise<FeeStats | FeeStatsUnavailable>)
      .then((s) => { if (alive) setStats(s); })
      .catch(() => { if (alive) setStats({ ok: false, fetchedAt: new Date().toISOString() }); });
    return () => { alive = false; };
  }, []);

  const result = useMemo(() => {
    if (!stats?.ok) return null;
    // Size for this many inputs: the measured median, or extend the measured per-input step.
    const s = stats.sizeByInputs;
    const step = s[1] && s[2] ? s[2] - s[1] : 690;
    const bytes = s[inputs] ?? (s[1] ? s[1] + (inputs - 1) * step : null);
    if (!bytes) return null;
    const fee = feeFor(bytes, stats.perByte[priority]!, stats.quantizationMask);
    const usd = Number(price) > 0 ? (fee / PICONERO) * Number(price) : null;
    return { bytes, fee, usd };
  }, [stats, priority, inputs, price]);

  const lowestShare = stats?.ok ? Math.round((stats.tierCounts[0] / Math.max(1, stats.txsSampled)) * 100) : null;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.badge}>Live from the network</span>
        <h2 className={styles.title}>What will my payment cost?</h2>
      </div>

      <fieldset className={styles.group}>
        <legend>Priority</legend>
        <div className={styles.seg}>
          {PRIORITY_NAMES.map((name, i) => (
            <button key={name} type="button" aria-pressed={priority === i} className={priority === i ? styles.on : ""} onClick={() => setPriority(i)}>
              {name}
            </button>
          ))}
        </div>
        <p className={styles.help}>Higher priority pays more per byte to get into a block sooner when the network is busy. Most wallets use the lowest by default.</p>
      </fieldset>

      <div className={styles.group}>
        <label htmlFor="fee-inputs">How many earlier payments does it combine?</label>
        <select id="fee-inputs" className="input" value={inputs} onChange={(e) => setInputs(Number(e.target.value) as 1 | 2 | 3 | 4)}>
          {([1, 2, 3, 4] as const).map((n) => <option key={n} value={n}>{INPUT_LABEL[n]}</option>)}
        </select>
        <p className={styles.help}>Your wallet pays from money you received earlier. If one earlier payment covers the amount, that is 1. Each extra one makes the payment bigger.</p>
      </div>

      <div className={styles.group}>
        <label htmlFor="fee-price">XMR price in your currency (optional)</label>
        <input id="fee-price" className="input" inputMode="decimal" placeholder="For example 300" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} />
        <p className={styles.help}>We do not fetch prices. Type one in to see the fee in your money.</p>
      </div>

      <div className={styles.result} aria-live="polite">
        {stats === null ? (
          <p className={styles.muted}>Reading the latest blocks…</p>
        ) : !stats.ok || !result ? (
          <p className={styles.muted}>Live fee data is not available right now. A typical payment usually costs a few hundred-thousandths of an XMR at the lowest priority. Try again in a few minutes.</p>
        ) : (
          <>
            <span className={styles.label}>Estimated network fee</span>
            <span className={styles.big}>{xmr(result.fee)} <small>XMR</small></span>
            {result.usd !== null ? <span className={styles.fiat}>about {result.usd < 0.01 ? result.usd.toFixed(4) : result.usd.toFixed(2)} in your currency</span> : null}
            <span className={styles.detail}>A payment like this is about {result.bytes.toLocaleString("en-US")} bytes. Fee = bytes × {stats.perByte[priority]!.toLocaleString("en-US")} piconero per byte, rounded up.</span>
          </>
        )}
      </div>

      {stats?.ok ? (
        <p className={styles.source}>
          Measured from {stats.txsSampled.toLocaleString("en-US")} real transactions in the last {stats.blocksSampled} blocks (up to block{" "}
          {stats.height.toLocaleString("en-US")}), updated {ago(stats.fetchedAt)}. {lowestShare !== null ? `${lowestShare}% of them paid the lowest priority.` : null}
        </p>
      ) : null}
    </div>
  );
}
