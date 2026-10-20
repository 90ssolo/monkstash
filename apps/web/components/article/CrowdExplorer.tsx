"use client";
/**
 * "Who could have sent this coin?": today's ring of 16 against the FCMP++ crowd, with the odds of
 * guessing the real spend. The output count is read live from a Monero node through the cached
 * /api/network-stats (RingCT outputs only, a conservative count); the page renders with a dated
 * fallback first, so it works without JavaScript and for search engines.
 */
import { useEffect, useState } from "react";
import styles from "./crowd.module.css";

/** RingCT outputs read from a mainnet node on FALLBACK_DATE (get_output_distribution). */
const FALLBACK_OUTPUTS = 165_950_012;
const FALLBACK_DATE = "20 October 2026";
/** OSPEAD (Monero Research Lab, April 2025): a well-built guessing attack picks the real ring member about 1 time in 4.2. */
const OSPEAD_ODDS = 4.2;
const RING = 16;

type Mode = "ring" | "fcmp";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
/** A percentage written out in plain decimals (no scientific notation), two significant digits. */
function pct(p: number): string {
  const v = p * 100;
  if (v >= 1) return `${v.toFixed(1)}%`;
  const digits = Math.min(12, Math.max(2, 1 - Math.floor(Math.log10(v))));
  return `${v.toFixed(digits).replace(/0+$/, "")}%`;
}

/** Position on a log scale from 1 to `max`, as a fraction of the track. */
const logPos = (n: number, max: number) => Math.log10(Math.max(1, n)) / Math.log10(max);

export function CrowdExplorer() {
  const [mode, setMode] = useState<Mode>("ring");
  const [outputs, setOutputs] = useState(FALLBACK_OUTPUTS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch("/api/network-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { ok?: boolean; rctOutputs?: number } | null) => {
        if (s?.ok && typeof s.rctOutputs === "number" && s.rctOutputs > FALLBACK_OUTPUTS / 2) {
          setOutputs(s.rctOutputs);
          setLive(true);
        }
      })
      .catch(() => {});
  }, []);

  const crowd = mode === "ring" ? RING : outputs;
  const scaleMax = 1e9;
  const ticks = [
    { n: 16, label: "16" },
    { n: 1_000, label: "1 thousand" },
    { n: 1_000_000, label: "1 million" },
    { n: 100_000_000, label: "100 million" },
  ];

  return (
    <section className={styles.box} aria-labelledby="crowd-h">
      <div className={styles.head}>
        <h3 id="crowd-h" className={styles.title}>Who could have sent this coin?</h3>
        <div className={styles.switch} role="group" aria-label="Compare">
          <button type="button" aria-pressed={mode === "ring"} onClick={() => setMode("ring")}>Today: ring of 16</button>
          <button type="button" aria-pressed={mode === "fcmp"} onClick={() => setMode("fcmp")}>With FCMP++</button>
        </div>
      </div>

      <div className={styles.meter} aria-hidden="true">
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${Math.max(2, logPos(crowd, scaleMax) * 100)}%` }} data-mode={mode} />
        </div>
        <div className={styles.ticks}>
          {ticks.map((t) => (
            <span key={t.n} style={{ left: `${logPos(t.n, scaleMax) * 100}%` }}>{t.label}</span>
          ))}
        </div>
      </div>
      <p className={styles.scaleNote}>Each step on the bar is ten times the one before.</p>

      <dl className={styles.stats} aria-live="polite">
        <div>
          <dt>Possible senders</dt>
          <dd className={styles.big}>{mode === "ring" ? "16" : `about ${fmt(crowd)}`}</dd>
        </div>
        <div>
          <dt>A blind guess is right</dt>
          <dd>{mode === "ring" ? `1 in 16 (${pct(1 / 16)})` : `1 in ${fmt(crowd)} (${pct(1 / crowd)})`}</dd>
        </div>
        <div>
          <dt>Best published guessing attack</dt>
          <dd>{mode === "ring" ? `about 1 in ${OSPEAD_ODDS} (${pct(1 / OSPEAD_ODDS)})` : "No decoys to analyse, so this attack no longer applies"}</dd>
        </div>
      </dl>

      <p className={styles.note}>
        {mode === "ring"
          ? <>Your wallet picks 15 decoys from older outputs. An analyst who studies how old each one is can guess the real one far more often than 1 in 16.</>
          : <>Your transaction proves the coin is one of the outputs on the chain without naming any candidates, so there is no decoy pattern to study.</>}
      </p>
      <p className={styles.source}>
        {live ? "RingCT outputs on the chain right now" : `RingCT outputs on the chain on ${FALLBACK_DATE}`}, read from a Monero node.
        A conservative count: the exact set of outputs that count under FCMP++ is set by its rules. Attack odds from the{" "}
        <a href="https://www.getmonero.org/2025/04/05/ospead-optimal-ring-signature-research.html" rel="noopener">OSPEAD research (Monero Research Lab, 2025)</a>.
      </p>
    </section>
  );
}
